#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prepara la carpeta de fuentes que lee el motor Rehavid V5 para ASEAR.

Los originales no se modifican. Se copian tal cual los libros que el motor lee
directamente y se generan CSV derivados mediante reglas documentadas en
``decisiones_mapeo_asear.json``: filtros de filas, exclusión de filas que el
contrato de datos del motor rechazaría, eliminación de duplicados exactos y
semánticos, resolución de duplicados de clave, consolidación de contratos
consecutivos en vínculos y versionado del desenlace (apertura → calificación).
Cada derivado conserva todas las columnas del original y añade
``ID_EVENTO_DERIVADO`` (archivo:fila_original). ``manifest_derivacion.json``
registra SHA-256 del original y del derivado, la regla aplicada y los conteos.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import shutil

import pandas as pd

from utilidades import sha256_archivo


def leer_hoja(path: Path, hoja: str) -> pd.DataFrame:
    return pd.read_excel(path, sheet_name=hoja, dtype=str, engine="openpyxl")


def _fecha(serie: pd.Series) -> pd.Series:
    return pd.to_datetime(serie.replace(r"^\s*$", pd.NA, regex=True), errors="coerce", format="ISO8601")


def _vacio(serie: pd.Series) -> pd.Series:
    return serie.isna() | serie.astype(str).str.fullmatch(r"\s*")


def aplicar_validez(frame: pd.DataFrame, mascara: pd.Series, validez: dict) -> tuple[pd.Series, dict]:
    excluidas = {}
    for columna in validez.get("no_vacios", []):
        vacia = _vacio(frame[columna])
        excluidas[f"{columna} vacía"] = int((mascara & vacia).sum())
        mascara &= ~vacia
    for columna in validez.get("fechas_obligatorias", []):
        ilegible = _fecha(frame[columna]).isna()
        excluidas[f"{columna} vacía o ilegible"] = int((mascara & ilegible).sum())
        mascara &= ~ilegible
    for columna in validez.get("fechas_opcionales_legibles", []):
        ilegible = ~_vacio(frame[columna]) & _fecha(frame[columna]).isna()
        excluidas[f"{columna} no vacía pero ilegible"] = int((mascara & ilegible).sum())
        mascara &= ~ilegible
    if validez.get("fecha_fin_no_anterior_a"):
        fin_col, ini_col = validez["fecha_fin_no_anterior_a"]
        invertida = _fecha(frame[fin_col]) < _fecha(frame[ini_col])
        excluidas[f"{fin_col} anterior a {ini_col}"] = int((mascara & invertida).sum())
        mascara &= ~invertida
    for columna in validez.get("numerico_no_negativo", []):
        numero = pd.to_numeric(frame[columna].replace(r"^\s*$", pd.NA, regex=True), errors="coerce")
        invalido = ~_vacio(frame[columna]) & (numero.isna() | (numero < 0))
        excluidas[f"{columna} no numérico o negativo"] = int((mascara & invalido).sum())
        mascara &= ~invalido
    return mascara, excluidas


def consolidar_vinculos(frame: pd.DataFrame, regla: dict) -> tuple[pd.DataFrame, dict]:
    """Une contratos consecutivos (o solapados) de la misma persona en un vínculo continuo.

    Un contrato sin fecha de fin seguido por otro contrato de la misma persona se
    cierra el día anterior al siguiente inicio (imputación documentada y contada):
    sólo el último contrato de una persona puede quedar abierto.
    """
    persona, inicio_col, fin_col = regla["persona"], regla["inicio"], regla["fin"]
    tolerancia = pd.Timedelta(days=int(regla.get("tolerancia_dias", 0)))
    orden = frame.assign(_persona=frame[persona].astype(str).str.strip(), _ini=_fecha(frame[inicio_col]), _fin=_fecha(frame[fin_col]))
    if orden["_ini"].isna().any():
        raise ValueError(f"consolidar_vinculos: {int(orden['_ini'].isna().sum())} filas con {inicio_col} vacío o ilegible; exclúyalas con reglas_validez.")
    fin_ilegible = int((~_vacio(frame[fin_col]) & orden["_fin"].isna()).sum())
    if fin_ilegible:
        raise ValueError(f"consolidar_vinculos: {fin_ilegible} filas con {fin_col} no vacío pero ilegible.")
    orden = orden.sort_values(["_persona", "_ini", "_fin"], kind="stable")
    siguiente_inicio = orden.groupby("_persona")["_ini"].shift(-1)
    abiertos_intermedios = orden["_fin"].isna() & siguiente_inicio.notna()
    orden.loc[abiertos_intermedios, "_fin"] = siguiente_inicio[abiertos_intermedios] - pd.Timedelta(days=1)
    filas, tramo = [], None
    for idx, fila in orden.iterrows():
        nuevo = tramo is None or fila["_persona"] != tramo["persona"] or fila["_ini"] > tramo["fin"] + tolerancia
        if nuevo:
            if tramo is not None:
                filas.append(tramo)
            tramo = {"persona": fila["_persona"], "inicio": fila["_ini"], "fin": fila["_fin"], "primera": idx, "n": 1}
        else:
            tramo["n"] += 1
            tramo["fin"] = pd.NaT if pd.isna(fila["_fin"]) else max(tramo["fin"], fila["_fin"])
        if pd.isna(tramo["fin"]):
            # Sólo el último contrato puede estar abierto: cualquier contrato posterior
            # habría cerrado este tramo en la imputación anterior.
            pass
    if tramo is not None:
        filas.append(tramo)
    salida = frame.loc[[t["primera"] for t in filas]].copy()
    salida[inicio_col] = [t["inicio"].strftime("%Y-%m-%d") for t in filas]
    salida[fin_col] = ["" if pd.isna(t["fin"]) else t["fin"].strftime("%Y-%m-%d") for t in filas]
    salida["N_CONTRATOS_TRAMO"] = [t["n"] for t in filas]
    resumen = {"contratos_entrada": int(len(frame)), "vinculos_salida": int(len(salida)),
               "vinculos_abiertos": int(sum(pd.isna(t["fin"]) for t in filas)),
               "contratos_abiertos_seguidos_de_otro_cerrados_por_imputacion": int(abiertos_intermedios.sum()),
               "tolerancia_dias": int(regla.get("tolerancia_dias", 0)),
               "distribucion_contratos_por_vinculo": {str(k): int(v) for k, v in pd.Series([t["n"] for t in filas]).value_counts().sort_index().items()}}
    return salida.sort_index(), resumen


def versionar_desenlaces(frame: pd.DataFrame, regla: dict) -> tuple[pd.DataFrame, dict]:
    """Dos versiones por expediente: apertura (estado pendiente) y calificación (estado final).

    La versión pendiente se omite cuando la apertura no es anterior a la calificación,
    para que la última versión disponible en cada cierre sea siempre la calificación.
    """
    pendiente, final = regla["version_pendiente"], regla["version_final"]
    apertura, calificacion = _fecha(frame[pendiente["fecha"]]), _fecha(frame[final["fecha"]])
    if calificacion.isna().any():
        raise ValueError("versionar_desenlaces: fecha de calificación vacía o ilegible.")
    con_pendiente = apertura.notna() & (apertura < calificacion)
    v_pend = frame.loc[con_pendiente].copy()
    v_pend[regla["columna_estado_salida"]] = pendiente["estado"]
    v_pend[regla["columna_fecha_salida"]] = apertura[con_pendiente].dt.strftime("%Y-%m-%d")
    v_pend["VERSION_DESENLACE"] = "apertura"
    v_fin = frame.copy()
    v_fin[regla["columna_estado_salida"]] = frame[final["estado_col"]]
    v_fin[regla["columna_fecha_salida"]] = calificacion.dt.strftime("%Y-%m-%d")
    v_fin["VERSION_DESENLACE"] = "calificacion"
    salida = pd.concat([v_pend, v_fin]).sort_index(kind="stable")
    grupo = regla.get("grupo")
    if grupo:
        codigo = salida[grupo["columna"]].fillna("").str.strip()
        valores = pd.Series(grupo["por_defecto"], index=salida.index)
        for patron, etiqueta in grupo["reglas"].items():
            valores[codigo.str.match(patron)] = etiqueta
        salida[grupo["salida"]] = valores
    resumen = {"expedientes": int(len(frame)), "versiones_pendientes": int(con_pendiente.sum()),
               "expedientes_sin_version_pendiente_apertura_no_anterior": int((~con_pendiente).sum()),
               "versiones_salida": int(len(salida)),
               "distribucion_grupo": ({str(k): int(v) for k, v in salida[grupo["salida"]].value_counts().items()} if grupo else None)}
    return salida, resumen


def derivar(originales: Path, decisiones: dict, destino: Path, opcion_vinculos: str | None = None) -> dict:
    originales = Path(originales).resolve()
    destino = Path(destino).resolve()
    if destino.exists() and any(destino.iterdir()):
        raise FileExistsError(f"Use una carpeta de fuentes nueva o vacía: {destino}")
    destino.mkdir(parents=True, exist_ok=True)
    (destino / "derivados").mkdir()
    esperados = decisiones["archivos_esperados"]
    manifest = {"originales_directory": str(originales), "opcion_vinculos": opcion_vinculos, "copias": [], "derivados": [], "avisos": []}

    directos = sorted({f["archivo"] for f in decisiones["fuentes_motor"] if not f["archivo"].startswith("derivados/")})
    for nombre in directos:
        origen = originales / nombre
        if not origen.is_file():
            raise FileNotFoundError(f"Falta el original {origen}")
        shutil.copy2(origen, destino / nombre)
        manifest["copias"].append({"archivo": nombre, "sha256": sha256_archivo(origen), "bytes": origen.stat().st_size})

    for clave, regla in decisiones["derivaciones"].items():
        if clave.startswith("_"):
            continue
        if regla.get("activa_con_opcion") and regla["activa_con_opcion"] != opcion_vinculos:
            continue
        fuente = esperados[regla["origen"]]
        origen = originales / fuente["archivo"]
        if not origen.is_file():
            raise FileNotFoundError(f"Falta el original {origen}")
        frame = leer_hoja(origen, fuente["hoja_datos"])
        registro = {"clave": clave, "origen": fuente["archivo"], "hoja": fuente["hoja_datos"], "sha256_origen": sha256_archivo(origen),
                    "salida": regla["salida"], "filas_origen": int(len(frame)), "reglas": []}
        columna = regla.get("columna_filtro")
        if columna is not None:
            if columna not in frame.columns:
                raise ValueError(f"{fuente['archivo']}: no existe la columna de filtro {columna!r}")
            valores = frame[columna].fillna("").str.strip()
            incluidos = [v.strip() for v in regla["valores_incluidos"]]
            mascara = valores.isin(set(incluidos))
            distribucion = valores.value_counts(dropna=False)
            registro["reglas"].append(f"{columna} in {incluidos}")
            registro["distribucion_columna_filtro"] = {(str(k) or "(vacío)"): int(v) for k, v in distribucion.items()}
            for valor in incluidos:
                if int(distribucion.get(valor, 0)) == 0:
                    manifest["avisos"].append(f"{clave}: el valor incluido {valor!r} no aparece en {columna}.")
        else:
            mascara = pd.Series(True, index=frame.index)
        mascara, excluidas = aplicar_validez(frame, mascara, regla.get("reglas_validez", {}))
        registro["excluidas_por_validez"] = excluidas
        seleccion = frame.loc[mascara].copy()
        registro["filas_seleccionadas"] = int(len(seleccion))
        if regla.get("eliminar_duplicados_exactos"):
            repetidas = seleccion.duplicated(keep="first")
            registro["duplicados_exactos_retirados"] = int(repetidas.sum())
            seleccion = seleccion.loc[~repetidas]
        if regla.get("clave_semantica_duplicados"):
            llaves = regla["clave_semantica_duplicados"]
            normalizado = seleccion[llaves].apply(lambda s: s.fillna("").astype(str).str.strip())
            repetidas = normalizado.duplicated(keep="first")
            registro["duplicados_semanticos_retirados"] = int(repetidas.sum())
            registro["reglas"].append(f"duplicados semánticos por {llaves} (se conserva la primera fila)")
            seleccion = seleccion.loc[~repetidas]
        if regla.get("clave_unica"):
            orden = _fecha(seleccion[regla["conservar_por"]]).fillna(pd.Timestamp.max)
            seleccion = seleccion.assign(_orden=orden).sort_values("_orden", kind="stable")
            repetidas = seleccion.duplicated(subset=regla["clave_unica"], keep="last")
            registro["duplicados_de_clave_resueltos"] = int(repetidas.sum())
            registro["reglas"].append(f"clave única {regla['clave_unica']} conservando {regla['conservar_por']} más tardía (vacío = abierto)")
            seleccion = seleccion.loc[~repetidas].drop(columns="_orden").sort_index()
        if regla.get("consolidar_vinculos"):
            seleccion, registro["consolidacion_vinculos"] = consolidar_vinculos(seleccion, regla["consolidar_vinculos"])
            registro["reglas"].append(f"consolidación de contratos consecutivos con tolerancia {regla['consolidar_vinculos'].get('tolerancia_dias', 0)} días")
        if regla.get("versionar_desenlaces"):
            seleccion, registro["versionado_desenlaces"] = versionar_desenlaces(seleccion, regla["versionar_desenlaces"])
            registro["reglas"].append("versionado apertura (pendiente) → calificación (final)")
        seleccion.insert(0, "ID_EVENTO_DERIVADO", [f"{fuente['archivo']}:{i + 2}" for i in seleccion.index])
        if seleccion.empty:
            raise ValueError(f"{clave}: el derivado quedó sin filas; revise valores_incluidos y reglas_validez.")
        salida = destino / regla["salida"]
        salida.parent.mkdir(parents=True, exist_ok=True)
        seleccion.to_csv(salida, index=False, encoding="utf-8-sig")
        registro.update(filas_salida=int(len(seleccion)), sha256_salida=sha256_archivo(salida),
                        columna_id_agregada="ID_EVENTO_DERIVADO = archivo:fila_original")
        manifest["derivados"].append(registro)
    (destino / "manifest_derivacion.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--originales", required=True)
    parser.add_argument("--decisiones", default=str(Path(__file__).with_name("decisiones_mapeo_asear.json")))
    parser.add_argument("--destino", required=True)
    parser.add_argument("--vinculos", default="consolidados")
    args = parser.parse_args(argv)
    decisiones = json.loads(Path(args.decisiones).read_text(encoding="utf-8"))
    manifest = derivar(Path(args.originales), decisiones, Path(args.destino), args.vinculos)
    print(json.dumps({k: v for k, v in manifest.items() if k != "originales_directory"}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
