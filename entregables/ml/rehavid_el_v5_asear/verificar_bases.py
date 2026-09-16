#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verificaciones previas sobre las bases ajustadas de ASEAR (sólo agregados).

Comprueba encabezados y hojas esperadas, coherencia de estados y fechas, formato de
identificadores, cruces entre bases y un cribado de soporte por fecha índice que
reproduce la regla de seguimiento del motor para el diseño de vínculos elegido
(fin del vínculo vigente en la fecha índice, acotado por la cobertura del registro).
No escribe registros individuales: la salida son conteos y rangos por mes/año.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

COLUMNAS_MAPEADAS = {
    "caracterizacion": ["Nombre Empresa Nombre Comercial", "Empleado DNI", "Expediente ID", "Calificación DESC",
                        "Fecha Calificacion Siniestro Fecha", "Fecha Siniestro Fecha", "Fecha Apertura Siniestro Fecha",
                        "Causa Siniestro DESC", "Origen Siniestro DESC", "Diagnostico Principal Codigo Diagnosito Codigo_Op"],
    "rotacion": ["Identificacion", "Tipo identificacion", "Fecha Inicio Contrato", "Fecha Fin Contrato"],
    "personal": ["Identificacion", "Fecha Inicio Contrato", "Fecha Fin Contrato"],
    "ausentismo": ["CEDULA TRABAJADOR", "TIPO DE EVENTO", "TIPO INCAPACIDAD", "FECHA INICIAL", "FECHA FINAL", "DIAS DE INCAPACIDAD"],
    "accidentalidad": ["N DOCUMENTO", "FECHA DEL ACCIDENTE", "TIPO DE EVENTO"],
    "recomendaciones": ["N° DE DOCUMENTO", "FECHA DE REINCORPORACION"],
}


def _fecha(serie):
    return pd.to_datetime(serie.replace(r"^\s*$", pd.NA, regex=True), errors="coerce", format="ISO8601")


def _rango(serie):
    fechas = _fecha(serie)
    anios = fechas.dt.year.dropna().astype(int).value_counts().sort_index()
    return {"min": None if pd.isna(fechas.min()) else str(fechas.min().date()),
            "max": None if pd.isna(fechas.max()) else str(fechas.max().date()),
            "vacios": int(fechas.isna().sum()), "por_anio": {str(k): int(v) for k, v in anios.items()}}


def _conteo(serie, limite=40):
    valores = serie.fillna("").str.strip().value_counts(dropna=False)
    return {str(k) if k else "(vacío)": int(v) for k, v in valores.head(limite).items()}


def _es_digitos(serie):
    return serie.fillna("").str.strip().str.fullmatch(r"\d+")


def _col(frame, nombre, hallazgos, base):
    """Columna como serie de texto; si falta, registra un aviso y devuelve una serie vacía."""
    if nombre in frame.columns:
        return frame[nombre]
    hallazgos.append({"nivel": "aviso", "base": base, "mensaje": f"Columna ausente para el diagnóstico: {nombre}"})
    return pd.Series([pd.NA] * len(frame), index=frame.index, dtype="object")


def cargar(originales: Path, esperados: dict, clave: str, criticos: list[str], hallazgos: list):
    meta = esperados[clave]
    path = originales / meta["archivo"]
    if not path.is_file():
        hallazgos.append({"nivel": "error", "base": clave, "mensaje": f"Falta {meta['archivo']}"})
        return None
    hojas = pd.ExcelFile(path, engine="openpyxl").sheet_names
    if meta["hoja_datos"] not in hojas:
        hallazgos.append({"nivel": "error", "base": clave, "mensaje": f"No existe la hoja {meta['hoja_datos']!r}; hojas: {hojas}"})
        return None
    frame = pd.read_excel(path, sheet_name=meta["hoja_datos"], dtype=str, engine="openpyxl")
    faltan = [c for c in meta["encabezados"] if c not in frame.columns]
    sobran = [c for c in frame.columns if c not in meta["encabezados"]]
    if faltan or sobran:
        nivel = "error" if any(c in criticos for c in faltan) else "aviso"
        hallazgos.append({"nivel": nivel, "base": clave, "mensaje": "Encabezados distintos de los inventariados", "faltan": faltan, "sobran": sobran})
    if meta.get("filas_esperadas") and len(frame) != meta["filas_esperadas"]:
        hallazgos.append({"nivel": "aviso", "base": clave, "mensaje": f"Filas leídas {len(frame)} ≠ filas inventariadas {meta['filas_esperadas']}"})
    return frame, hojas


def _vinculos_para_cribado(rotacion: pd.DataFrame, decisiones: dict, opcion_vinculos: str) -> pd.DataFrame:
    """Vínculos (persona, inicio, fin) según el diseño: contratos tal cual o consolidados."""
    base = rotacion[["Identificacion", "Fecha Inicio Contrato", "Fecha Fin Contrato"]].copy()
    regla = decisiones.get("derivaciones", {}).get("rotacion_vinculos_consolidados", {}).get("consolidar_vinculos")
    if opcion_vinculos == "consolidados" and regla:
        from derivar_fuentes import consolidar_vinculos
        base = base.loc[_fecha(base["Fecha Inicio Contrato"]).notna()]
        base, _ = consolidar_vinculos(base, regla)
    return pd.DataFrame({"id": base["Identificacion"].astype(str).str.strip(), "ini": _fecha(base["Fecha Inicio Contrato"]),
                         "fin": _fecha(base["Fecha Fin Contrato"])})


def verificar(originales: Path, decisiones: dict, salida: Path, opcion_vinculos: str = "consolidados") -> dict:
    originales = Path(originales).resolve()
    salida = Path(salida).resolve()
    salida.mkdir(parents=True, exist_ok=True)
    esperados = decisiones["archivos_esperados"]
    protocolo = decisiones["protocolo"]
    as_of = pd.Timestamp(protocolo["as_of"])
    prefijo = next((f.get("prefijo_id_a_retirar", "") for f in decisiones["fuentes_motor"] if f["fuente"] == "outcomes"), "")
    hallazgos, informe = [], {"as_of": protocolo["as_of"], "opcion_vinculos": opcion_vinculos, "bases": {}}
    marcos = {}
    try:
        for clave in esperados:
            cargado = cargar(originales, esperados, clave, COLUMNAS_MAPEADAS.get(clave, []), hallazgos)
            if cargado is None:
                continue
            frame, hojas = cargado
            marcos[clave] = frame
            informe["bases"][clave] = {"archivo": esperados[clave]["archivo"], "hojas": hojas, "filas": int(len(frame)), "columnas": int(len(frame.columns))}

        ids_outcomes, calif_por_id = set(), pd.DataFrame(columns=["id", "fecha"])
        if "caracterizacion" in marcos:
            c = marcos["caracterizacion"]
            b = informe["bases"]["caracterizacion"]
            g = lambda n: _col(c, n, hallazgos, "caracterizacion")
            b["causa_siniestro"] = _conteo(g("Causa Siniestro DESC"))
            b["origen_siniestro"] = _conteo(g("Origen Siniestro DESC"))
            b["calificacion"] = _conteo(g("Calificación DESC"))
            b["situacion"] = _conteo(g("Situacion Siniestro DESC"))
            b["tipo_riesgo"] = _conteo(g("Tipo Riesgo Siniestro DESC"))
            b["diagnostico_codigo"] = _conteo(g("Diagnostico Principal Codigo Diagnosito Codigo_Op"))
            b["empresa"] = _conteo(g("Nombre Empresa Nombre Comercial"))
            dni = g("Empleado DNI").fillna("").str.strip()
            b["dni_prefijo_letra"] = {str(k): int(v) for k, v in dni.str.extract(r"^([A-Za-z]*)")[0].value_counts().items()}
            b["dni_patron_letra_digitos"] = int(dni.str.fullmatch(r"[A-Za-z]\d{5,12}").sum())
            stripped = dni.map(lambda v: v[len(prefijo):] if prefijo and v.startswith(prefijo) else v)
            ids_outcomes = set(stripped[stripped.str.fullmatch(r"\d+")])
            b["personas_distintas"] = int(stripped.nunique())
            b["expedientes_distintos"] = int(g("Expediente ID").nunique())
            for col in ["Fecha Siniestro Fecha", "Fecha Apertura Siniestro Fecha", "Fecha Calificacion Siniestro Fecha", "Fecha Notificacion Siniestro ID"]:
                b[f"rango::{col}"] = _rango(g(col))
            dias = pd.to_numeric(g("Días IT"), errors="coerce")
            b["suma_dias_it"] = float(dias.sum())
            control = esperados["caracterizacion"].get("control_bitacora", {})
            if control.get("suma_dias_it") is not None and abs(dias.sum() - control["suma_dias_it"]) > 1e-9:
                hallazgos.append({"nivel": "aviso", "base": "caracterizacion", "mensaje": f"Suma Días IT {dias.sum()} ≠ control de bitácora {control['suma_dias_it']}"})
            causas = set(g("Causa Siniestro DESC").fillna("").str.strip().unique())
            if causas != {"ENFERMEDAD LABORAL"}:
                hallazgos.append({"nivel": "error", "base": "caracterizacion", "mensaje": f"La fuente de desenlaces contiene causas distintas de ENFERMEDAD LABORAL: {sorted(causas)}. Revise el mapeo de estados antes de continuar."})
            origenes = set(g("Origen Siniestro DESC").fillna("").str.strip().unique())
            if origenes != {"PROPIO DEL TRABAJO"}:
                hallazgos.append({"nivel": "aviso", "base": "caracterizacion", "mensaje": f"Origen Siniestro DESC con valores distintos de PROPIO DEL TRABAJO: {sorted(origenes)}"})
            calif, sini, aper = _fecha(g("Fecha Calificacion Siniestro Fecha")), _fecha(g("Fecha Siniestro Fecha")), _fecha(g("Fecha Apertura Siniestro Fecha"))
            rezago = (calif - sini).dt.days
            b["rezago_siniestro_a_calificacion_dias"] = {"mediana": float(rezago.median()), "p75": float(rezago.quantile(0.75)), "p90": float(rezago.quantile(0.9)), "max": float(rezago.max())}
            b["rezago_apertura_a_calificacion_dias"] = {"mediana": float((calif - aper).dt.days.median()), "p90": float((calif - aper).dt.days.quantile(0.9)),
                                                        "apertura_igual_o_posterior_a_calificacion": int((aper >= calif).sum())}
            calif_por_id = pd.DataFrame({"id": stripped, "fecha": calif}).dropna()

        ids_rotacion, spells_rotacion = set(), set()
        if "rotacion" in marcos:
            r = marcos["rotacion"]
            b = informe["bases"]["rotacion"]
            g = lambda n: _col(r, n, hallazgos, "rotacion")
            ident = g("Identificacion").fillna("").str.strip()
            b["tipo_identificacion"] = _conteo(g("Tipo identificacion"))
            b["identificacion_no_numerica"] = int((~_es_digitos(ident)).sum())
            b["personas_distintas"] = int(ident.nunique())
            b["identificaciones_con_varios_tipos"] = int(r.groupby(ident)[["Tipo identificacion"]].nunique().gt(1).sum().sum()) if "Tipo identificacion" in r else None
            ini, fin = _fecha(g("Fecha Inicio Contrato")), _fecha(g("Fecha Fin Contrato"))
            b["rango::Fecha Inicio Contrato"] = _rango(g("Fecha Inicio Contrato"))
            b["rango::Fecha Fin Contrato"] = _rango(g("Fecha Fin Contrato"))
            b["fin_posterior_a_as_of"] = int((fin > as_of).sum())
            b["fin_anterior_a_inicio"] = int((fin < ini).sum())
            b["inicio_vacio"] = int(ini.isna().sum())
            b["vinculos_duplicados_persona_inicio"] = int(pd.DataFrame({"id": ident, "ini": ini}).duplicated().sum())
            b["vinculos_por_persona"] = {str(k): int(v) for k, v in ident.value_counts().value_counts().sort_index().items()}
            orden = pd.DataFrame({"id": ident, "ini": ini, "fin": fin}).sort_values(["id", "ini"], kind="stable")
            fin_prev = orden.groupby("id")["fin"].shift()
            sig_ini = orden.groupby("id")["ini"].shift(-1)
            b["vinculos_solapados_con_el_anterior"] = int((orden["ini"] <= fin_prev).sum())
            b["contratos_sin_fin_seguidos_de_otro"] = int((orden["fin"].isna() & sig_ini.notna()).sum())
            brecha = (orden["ini"] - fin_prev).dt.days.dropna()
            b["brecha_dias_entre_contratos_consecutivos"] = {str(k): int(v) for k, v in pd.cut(brecha, [-10000, 0, 1, 7, 15, 30, 90, 365, 100000]).value_counts().sort_index().items()}
            b["tipo_contrato"] = _conteo(g("Tipo de Contrato"), 10)
            b["empresa_cliente_top"] = _conteo(g("Empresa"), 15)
            ids_rotacion = set(ident[_es_digitos(ident)])
            spells_rotacion = set(zip(ident, ini.dt.strftime("%Y-%m-%d")))

        ids_personal = set()
        if "personal" in marcos:
            p = marcos["personal"]
            b = informe["bases"]["personal"]
            g = lambda n: _col(p, n, hallazgos, "personal")
            ident = g("Identificacion").fillna("").str.strip()
            ini = _fecha(g("Fecha Inicio Contrato"))
            ids_personal = set(ident)
            b["personas_distintas"] = int(ident.nunique())
            b["rango::Fecha Inicio Contrato"] = _rango(g("Fecha Inicio Contrato"))
            b["rango::Fecha Fin Contrato"] = _rango(g("Fecha Fin Contrato"))
            if ids_rotacion:
                b["personas_ausentes_en_rotacion"] = int(len(ids_personal - ids_rotacion))
                b["vinculos_persona_inicio_ausentes_en_rotacion"] = int(len(set(zip(ident, ini.dt.strftime("%Y-%m-%d"))) - spells_rotacion))
                b["personas_de_rotacion_ausentes_en_personal"] = int(len(ids_rotacion - ids_personal))
            b["empresa_cliente_top"] = _conteo(g("Empresa"), 10)

        ids_ausentismo = set()
        if "ausentismo" in marcos:
            a = marcos["ausentismo"]
            b = informe["bases"]["ausentismo"]
            g = lambda n: _col(a, n, hallazgos, "ausentismo")
            ced = g("CEDULA TRABAJADOR").fillna("").str.strip()
            b["tipo_evento"] = _conteo(g("TIPO DE EVENTO"))
            b["tipo_incapacidad"] = _conteo(g("TIPO INCAPACIDAD"))
            b["cedula_no_numerica"] = int((~_es_digitos(ced)).sum())
            b["cedula_longitud"] = {str(k): int(v) for k, v in ced.str.len().value_counts().sort_index().items()}
            b["personas_distintas"] = int(ced.nunique())
            b["rango::FECHA INICIAL"] = _rango(g("FECHA INICIAL"))
            b["rango::FECHA FINAL"] = _rango(g("FECHA FINAL"))
            dias = pd.to_numeric(g("DIAS DE INCAPACIDAD"), errors="coerce")
            b["dias_no_numericos"] = int((g("DIAS DE INCAPACIDAD").notna() & dias.isna()).sum())
            b["dias_negativos"] = int((dias < 0).sum())
            ini, fin = _fecha(g("FECHA INICIAL")), _fecha(g("FECHA FINAL"))
            b["fin_anterior_a_inicio"] = int((fin < ini).sum())
            b["duplicados_exactos"] = int(a.duplicated().sum())
            ids_ausentismo = set(ced[_es_digitos(ced)])
            if ids_rotacion:
                b["personas_ausentes_en_rotacion"] = int(len(ids_ausentismo - ids_rotacion))
                anio = ini.dt.year
                en_rot = ced.isin(ids_rotacion)
                b["cruce_con_rotacion_por_anio"] = {str(int(k)): {"filas": int(v), "filas_con_vinculo": int(en_rot[anio == k].sum())}
                                                    for k, v in anio.dropna().astype(int).value_counts().sort_index().items()}
            b["archivo_origen"] = _conteo(g("ARCHIVO ORIGEN"), 15)

        if "accidentalidad" in marcos:
            x = marcos["accidentalidad"]
            b = informe["bases"]["accidentalidad"]
            g = lambda n: _col(x, n, hallazgos, "accidentalidad")
            doc = g("N DOCUMENTO").fillna("").str.strip()
            anio = _fecha(g("FECHA DEL ACCIDENTE")).dt.year
            b["tipo_evento"] = _conteo(g("TIPO DE EVENTO"))
            b["documento_vacio_por_anio"] = {str(int(k)): int(v) for k, v in doc.eq("").groupby(anio).sum().items() if not pd.isna(k)}
            b["rango::FECHA DEL ACCIDENTE"] = _rango(g("FECHA DEL ACCIDENTE"))

        if ids_outcomes:
            sin_vinculo = ids_outcomes - ids_rotacion
            informe["cruces"] = {"personas_con_el": len(ids_outcomes), "personas_con_el_en_rotacion": len(ids_outcomes & ids_rotacion),
                                 "personas_con_el_sin_vinculo_en_rotacion": len(sin_vinculo),
                                 "de_las_sin_vinculo_en_personal": len(sin_vinculo & ids_personal),
                                 "de_las_sin_vinculo_en_ausentismo": len(sin_vinculo & ids_ausentismo)}
            if len(calif_por_id):
                por_anio = calif_por_id.assign(en_rot=calif_por_id.id.isin(ids_rotacion), anio=calif_por_id.fecha.dt.year)
                informe["cruces"]["personas_con_el_en_rotacion_por_anio_de_calificacion"] = {
                    str(int(k)): {"con_vinculo": int(v.en_rot.sum()), "sin_vinculo": int((~v.en_rot).sum())} for k, v in por_anio.groupby("anio")}

        if "rotacion" in marcos and len(calif_por_id):
            vinculos = _vinculos_para_cribado(marcos["rotacion"], decisiones, opcion_vinculos)
            cierre = pd.Timestamp(protocolo["followup_derivation"]["coverage"][0]["end"])
            t0_protocolo = pd.Timestamp(protocolo["landmarks"]["train"])
            rejilla = sorted(set(pd.date_range("2020-12-31", "2023-12-31", freq="QE")) | {t0_protocolo})
            filas = []
            for t0 in rejilla:
                activos = vinculos.loc[(vinculos.ini <= t0) & (vinculos.fin.isna() | (vinculos.fin > t0))].copy()
                activos["fin_seguimiento"] = activos.fin.fillna(cierre).clip(upper=cierre)
                activos = activos.drop_duplicates("id", keep="first")
                personas = set(activos.id)
                prevalentes = set(calif_por_id.loc[calif_por_id.fecha <= t0, "id"])
                elegibles = activos.loc[~activos.id.isin(prevalentes)]
                eventos = calif_por_id.merge(elegibles[["id", "fin_seguimiento"]], on="id")
                eventos = eventos.loc[(eventos.fecha > t0) & (eventos.fecha <= eventos.fin_seguimiento)]
                fila = {"t0": str(t0.date()), "activos": len(personas), "prevalentes_excluidos": len(personas & prevalentes), "elegibles": int(len(elegibles)),
                        "meses_seguimiento_hasta_cierre": round((cierre - t0).days / 30.44, 1),
                        "mediana_dias_seguimiento_elegibles": float((elegibles.fin_seguimiento - t0).dt.days.median()) if len(elegibles) else None}
                for m in [3, 6, 12]:
                    fila[f"elegibles_con_vinculo_desde_{m}m_antes"] = int((elegibles.ini <= t0 - pd.DateOffset(months=m)).sum())
                for h in [12, 36, 60]:
                    limite = t0 + pd.DateOffset(months=h)
                    fila[f"eventos_a_{h}m"] = int(eventos.loc[eventos.fecha <= limite, "id"].nunique())
                    fila[f"horizonte_{h}m_dentro_de_cobertura"] = bool(limite < cierre)
                fila["eventos_totales_observables"] = int(eventos.id.nunique())
                filas.append(fila)
            informe["soporte_por_fecha_indice"] = filas
            informe["soporte_por_fecha_indice_definicion"] = (
                f"Cribado con vínculos '{opcion_vinculos}': personas con vínculo vigente en t0, no prevalentes; eventos = calificaciones "
                "posteriores a t0 y anteriores al fin del vínculo vigente (o al fin de cobertura). No aplica la partición 60/20/20 ni las "
                "exclusiones por estado pendiente del motor; es una cota superior aproximada del soporte que el motor encontrará.")
        informe["hallazgos"] = hallazgos
        informe["bloqueante"] = any(h["nivel"] == "error" for h in hallazgos)
    finally:
        informe.setdefault("hallazgos", hallazgos)
        informe.setdefault("bloqueante", any(h["nivel"] == "error" for h in hallazgos))
        (salida / "verificaciones_previas.json").write_text(json.dumps(informe, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")
        if informe.get("soporte_por_fecha_indice"):
            pd.DataFrame(informe["soporte_por_fecha_indice"]).to_csv(salida / "soporte_por_fecha_indice.csv", index=False)
    return informe


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--originales", required=True)
    parser.add_argument("--decisiones", default=str(Path(__file__).with_name("decisiones_mapeo_asear.json")))
    parser.add_argument("--salida", required=True)
    parser.add_argument("--vinculos", default="consolidados")
    args = parser.parse_args(argv)
    decisiones = json.loads(Path(args.decisiones).read_text(encoding="utf-8"))
    informe = verificar(Path(args.originales), decisiones, Path(args.salida), args.vinculos)
    print(json.dumps({"bloqueante": informe["bloqueante"], "hallazgos": informe["hallazgos"], "cruces": informe.get("cruces")}, ensure_ascii=False, indent=2))
    return 3 if informe["bloqueante"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
