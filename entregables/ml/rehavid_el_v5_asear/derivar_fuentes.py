#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prepara la carpeta de fuentes que lee el motor Rehavid V5 para ASEAR.

Los originales no se modifican. Se copian tal cual los libros que el motor lee
directamente y se generan CSV derivados por filtros de filas documentados
(por ejemplo, separar el ausentismo por tipo de evento para poder declarar la
constante ``source_kind`` exigida por el contrato de datos). Cada derivado
conserva todas las columnas del original y añade ``ID_EVENTO_DERIVADO``
(archivo:fila_original) como identificador de evento. ``manifest_derivacion.json``
registra SHA-256 del original, regla aplicada y conteos para que la operación
sea reversible y auditable.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import shutil

import pandas as pd


def sha256(path: Path) -> str:
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def leer_hoja(path: Path, hoja: str) -> pd.DataFrame:
    return pd.read_excel(path, sheet_name=hoja, dtype=str, engine="openpyxl")


def consolidar_vinculos(frame: pd.DataFrame, regla: dict) -> tuple[pd.DataFrame, dict]:
    """Une contratos consecutivos (o solapados) de la misma persona en un vínculo continuo."""
    persona, inicio_col, fin_col = regla["persona"], regla["inicio"], regla["fin"]
    tolerancia = pd.Timedelta(days=int(regla.get("tolerancia_dias", 0)))
    ini = pd.to_datetime(frame[inicio_col], errors="coerce", format="ISO8601")
    fin = pd.to_datetime(frame[fin_col], errors="coerce", format="ISO8601")
    orden = frame.assign(_ini=ini, _fin=fin).sort_values([persona, "_ini", "_fin"], kind="stable")
    filas, tramo = [], None
    for idx, fila in orden.iterrows():
        nuevo = tramo is None or fila[persona] != tramo["persona"] or (
            pd.notna(tramo["fin"]) and fila["_ini"] > tramo["fin"] + tolerancia)
        if nuevo:
            if tramo is not None:
                filas.append(tramo)
            tramo = {"persona": fila[persona], "inicio": fila["_ini"], "fin": fila["_fin"], "primera": idx, "n": 1,
                     "fin_ultimo": fila["_fin"]}
        else:
            tramo["n"] += 1
            tramo["fin_ultimo"] = fila["_fin"]
            if pd.isna(fila["_fin"]) or pd.isna(tramo["fin"]):
                tramo["fin"] = pd.NaT
            else:
                tramo["fin"] = max(tramo["fin"], fila["_fin"])
    if tramo is not None:
        filas.append(tramo)
    salida = frame.loc[[t["primera"] for t in filas]].copy()
    salida[inicio_col] = [t["inicio"].strftime("%Y-%m-%d") for t in filas]
    salida[fin_col] = ["" if pd.isna(t["fin"]) else t["fin"].strftime("%Y-%m-%d") for t in filas]
    salida["N_CONTRATOS_TRAMO"] = [t["n"] for t in filas]
    salida["FECHA_FIN_ULTIMO_CONTRATO"] = ["" if pd.isna(t["fin_ultimo"]) else t["fin_ultimo"].strftime("%Y-%m-%d") for t in filas]
    resumen = {"contratos_entrada": int(len(frame)), "vinculos_salida": int(len(salida)),
               "vinculos_abiertos": int(sum(pd.isna(t["fin"]) for t in filas)),
               "tolerancia_dias": int(regla.get("tolerancia_dias", 0)),
               "distribucion_contratos_por_vinculo": {str(k): int(v) for k, v in pd.Series([t["n"] for t in filas]).value_counts().sort_index().items()}}
    return salida.sort_index(), resumen


def derivar(originales: Path, decisiones: dict, destino: Path, opcion_vinculos: str | None = None) -> dict:
    originales = Path(originales).resolve()
    destino = Path(destino).resolve()
    if destino.exists() and any(destino.iterdir()):
        raise FileExistsError(f"Use una carpeta de fuentes nueva o vacía: {destino}")
    destino.mkdir(parents=True, exist_ok=True)
    (destino / "derivados").mkdir()
    esperados = decisiones["archivos_esperados"]
    manifest = {"originales_directory": str(originales), "copias": [], "derivados": []}

    # 1. Copias sin cambios de los libros que el motor lee directamente.
    directos = sorted({f["archivo"] for f in decisiones["fuentes_motor"] if not f["archivo"].startswith("derivados/")})
    for nombre in directos:
        origen = originales / nombre
        if not origen.is_file():
            raise FileNotFoundError(f"Falta el original {origen}")
        shutil.copy2(origen, destino / nombre)
        manifest["copias"].append({"archivo": nombre, "sha256": sha256(origen), "bytes": origen.stat().st_size})

    # 2. Derivados por filtro de filas.
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
        columna = regla.get("columna_filtro")
        if columna is not None and columna not in frame.columns:
            raise ValueError(f"{fuente['archivo']}: no existe la columna de filtro {columna!r}")
        if columna is not None:
            valores = frame[columna].fillna("").str.strip()
            incluidos = {v.strip() for v in regla["valores_incluidos"]}
            mascara = valores.isin(incluidos)
        else:
            valores, incluidos = pd.Series("", index=frame.index), set()
            mascara = pd.Series(True, index=frame.index)
        excluidas_validez = {}
        validez = regla.get("reglas_validez", {})
        for columna_fecha in validez.get("fechas_obligatorias", []):
            vacia = pd.to_datetime(frame[columna_fecha].replace(r"^\s*$", pd.NA, regex=True), errors="coerce", format="ISO8601").isna()
            excluidas_validez[f"{columna_fecha} vacía o ilegible"] = int((mascara & vacia).sum())
            mascara &= ~vacia
        if validez.get("fecha_fin_no_anterior_a"):
            fin_col, ini_col = validez["fecha_fin_no_anterior_a"]
            fin = pd.to_datetime(frame[fin_col], errors="coerce", format="ISO8601")
            ini = pd.to_datetime(frame[ini_col], errors="coerce", format="ISO8601")
            invertida = fin < ini
            excluidas_validez[f"{fin_col} anterior a {ini_col}"] = int((mascara & invertida).sum())
            mascara &= ~invertida
        for columna_num in validez.get("numerico_no_negativo", []):
            numero = pd.to_numeric(frame[columna_num], errors="coerce")
            invalido = frame[columna_num].notna() & (numero.isna() | (numero < 0))
            excluidas_validez[f"{columna_num} no numérico o negativo"] = int((mascara & invalido).sum())
            mascara &= ~invalido
        seleccion = frame.loc[mascara].copy()
        consolidacion = None
        if regla.get("consolidar_vinculos"):
            seleccion, consolidacion = consolidar_vinculos(seleccion, regla["consolidar_vinculos"])
        # Fila original en la hoja (1 = encabezado): índice de pandas + 2.
        seleccion.insert(0, "ID_EVENTO_DERIVADO", [f"{fuente['archivo']}:{i + 2}" for i in seleccion.index])
        duplicados, duplicados_clave = 0, 0
        if regla.get("eliminar_duplicados_exactos"):
            sin_id = seleccion.drop(columns=["ID_EVENTO_DERIVADO"])
            repetidas = sin_id.duplicated(keep="first")
            duplicados = int(repetidas.sum())
            seleccion = seleccion.loc[~repetidas]
        if regla.get("clave_unica"):
            orden = pd.to_datetime(seleccion[regla["conservar_por"]], errors="coerce", format="ISO8601")
            orden = orden.fillna(pd.Timestamp.max)  # vacío = vínculo abierto = el más tardío
            seleccion = seleccion.assign(_orden=orden).sort_values("_orden", kind="stable")
            repetidas = seleccion.duplicated(subset=regla["clave_unica"], keep="last")
            duplicados_clave = int(repetidas.sum())
            seleccion = seleccion.loc[~repetidas].drop(columns="_orden").sort_index()
        salida = destino / regla["salida"]
        salida.parent.mkdir(parents=True, exist_ok=True)
        seleccion.to_csv(salida, index=False, encoding="utf-8-sig")
        distribucion = valores.value_counts(dropna=False).to_dict() if columna else {}
        manifest["derivados"].append({
            "clave": clave, "origen": fuente["archivo"], "hoja": fuente["hoja_datos"],
            "sha256_origen": sha256(origen), "salida": regla["salida"], "sha256_salida": sha256(salida),
            "regla": (f"{columna} in {sorted(incluidos)}" if columna else "sin filtro de filas")
                     + (f"; clave única {regla['clave_unica']} conservando {regla['conservar_por']} más tardía" if regla.get("clave_unica") else ""),
            "filas_origen": int(len(frame)),
            "filas_seleccionadas": int(mascara.sum()), "excluidas_por_validez": excluidas_validez,
            "duplicados_exactos_retirados": duplicados, "duplicados_de_clave_resueltos": duplicados_clave,
            "consolidacion_vinculos": consolidacion,
            "filas_salida": int(len(seleccion)),
            "distribucion_columna_filtro": {str(k): int(v) for k, v in distribucion.items()},
            "columna_id_agregada": "ID_EVENTO_DERIVADO = archivo:fila_original",
        })
    (destino / "manifest_derivacion.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--originales", required=True)
    parser.add_argument("--decisiones", default=str(Path(__file__).with_name("decisiones_mapeo_asear.json")))
    parser.add_argument("--destino", required=True)
    parser.add_argument("--vinculos", default="contratos")
    args = parser.parse_args(argv)
    decisiones = json.loads(Path(args.decisiones).read_text(encoding="utf-8"))
    manifest = derivar(Path(args.originales), decisiones, Path(args.destino), args.vinculos)
    print(json.dumps({k: v for k, v in manifest.items() if k != "originales_directory"}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
