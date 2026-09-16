#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verificaciones previas sobre las bases ajustadas de ASEAR (sólo agregados).

Comprueba encabezados y hojas esperadas, coherencia de estados y fechas,
formato de identificadores, cruces entre bases y soporte por fecha índice.
No escribe registros individuales: la salida son conteos y rangos por mes.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

COLUMNAS_MAPEADAS = {
    "caracterizacion": ["Nombre Empresa Nombre Comercial", "Empleado DNI", "Expediente ID", "Calificación DESC",
                        "Fecha Calificacion Siniestro Fecha", "Fecha Siniestro Fecha", "Causa Siniestro DESC", "Origen Siniestro DESC"],
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
    return {"min": None if fechas.min() is pd.NaT else str(fechas.min().date()),
            "max": None if fechas.max() is pd.NaT else str(fechas.max().date()),
            "vacios": int(fechas.isna().sum()), "por_anio": {str(k): int(v) for k, v in fechas.dt.year.value_counts().sort_index().items()}}


def _conteo(serie, limite=40):
    valores = serie.fillna("").str.strip().value_counts(dropna=False)
    return {str(k) if k else "(vacío)": int(v) for k, v in valores.head(limite).items()}


def _es_digitos(serie):
    return serie.fillna("").str.strip().str.fullmatch(r"\d+")


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
        hallazgos.append({"nivel": nivel, "base": clave, "mensaje": "Encabezados distintos de los inventariados",
                          "faltan": faltan, "sobran": sobran})
    if meta.get("filas_esperadas") and len(frame) != meta["filas_esperadas"]:
        hallazgos.append({"nivel": "aviso", "base": clave,
                          "mensaje": f"Filas leídas {len(frame)} ≠ filas inventariadas {meta['filas_esperadas']}"})
    return frame, hojas


def verificar(originales: Path, decisiones: dict, salida: Path) -> dict:
    originales = Path(originales).resolve()
    salida = Path(salida).resolve()
    salida.mkdir(parents=True, exist_ok=True)
    esperados = decisiones["archivos_esperados"]
    protocolo = decisiones["protocolo"]
    as_of = pd.Timestamp(protocolo["as_of"])
    hallazgos, informe = [], {"as_of": protocolo["as_of"], "bases": {}}
    marcos = {}
    for clave in esperados:
        cargado = cargar(originales, esperados, clave, COLUMNAS_MAPEADAS.get(clave, []), hallazgos)
        if cargado is None:
            continue
        frame, hojas = cargado
        marcos[clave] = frame
        informe["bases"][clave] = {"archivo": esperados[clave]["archivo"], "hojas": hojas, "filas": int(len(frame)),
                                   "columnas": int(len(frame.columns))}

    # --- Caracterización (outcomes) ---
    ids_outcomes = set()
    if "caracterizacion" in marcos:
        c = marcos["caracterizacion"]
        b = informe["bases"]["caracterizacion"]
        b["causa_siniestro"] = _conteo(c["Causa Siniestro DESC"])
        b["origen_siniestro"] = _conteo(c["Origen Siniestro DESC"])
        b["calificacion"] = _conteo(c["Calificación DESC"])
        b["situacion"] = _conteo(c["Situacion Siniestro DESC"])
        b["tipo_riesgo"] = _conteo(c["Tipo Riesgo Siniestro DESC"])
        b["diagnostico_codigo"] = _conteo(c["Diagnostico Principal Codigo Diagnosito Codigo_Op"])
        b["empresa"] = _conteo(c["Nombre Empresa Nombre Comercial"])
        dni = c["Empleado DNI"].fillna("").str.strip()
        b["dni_prefijo_letra"] = {str(k): int(v) for k, v in dni.str.extract(r"^([A-Za-z]*)")[0].value_counts().items()}
        b["dni_patron_letra_digitos"] = int(dni.str.fullmatch(r"[A-Za-z]\d{5,12}").sum())
        stripped = dni.str.replace(r"^C", "", regex=True)
        ids_outcomes = set(stripped[stripped.str.fullmatch(r"\d+")])
        b["personas_distintas"] = int(stripped.nunique())
        b["expedientes_distintos"] = int(c["Expediente ID"].nunique())
        for col in ["Fecha Siniestro Fecha", "Fecha Apertura Siniestro Fecha", "Fecha Calificacion Siniestro Fecha", "Fecha Notificacion Siniestro ID"]:
            b[f"rango::{col}"] = _rango(c[col])
        dias = pd.to_numeric(c["Días IT"], errors="coerce")
        b["suma_dias_it"] = float(dias.sum())
        control = esperados["caracterizacion"].get("control_bitacora", {})
        if control.get("suma_dias_it") is not None and abs(dias.sum() - control["suma_dias_it"]) > 1e-9:
            hallazgos.append({"nivel": "aviso", "base": "caracterizacion",
                              "mensaje": f"Suma Días IT {dias.sum()} ≠ control de bitácora {control['suma_dias_it']}"})
        causas = set(c["Causa Siniestro DESC"].fillna("").str.strip().unique())
        if causas != {"ENFERMEDAD LABORAL"}:
            hallazgos.append({"nivel": "error", "base": "caracterizacion",
                              "mensaje": f"La fuente de desenlaces contiene causas distintas de ENFERMEDAD LABORAL: {sorted(causas)}. Revise el mapeo de estados antes de continuar."})
        origenes = set(c["Origen Siniestro DESC"].fillna("").str.strip().unique())
        if origenes != {"PROPIO DEL TRABAJO"}:
            hallazgos.append({"nivel": "aviso", "base": "caracterizacion",
                              "mensaje": f"Origen Siniestro DESC con valores distintos de PROPIO DEL TRABAJO: {sorted(origenes)}"})
        calif = _fecha(c["Fecha Calificacion Siniestro Fecha"])
        sini = _fecha(c["Fecha Siniestro Fecha"])
        b["calificacion_posterior_al_siniestro"] = int((calif >= sini).sum())
        b["dias_siniestro_a_calificacion_mediana"] = float((calif - sini).dt.days.median())

    # --- Rotación (employment) ---
    ids_rotacion, spells_rotacion = set(), set()
    if "rotacion" in marcos:
        r = marcos["rotacion"]
        b = informe["bases"]["rotacion"]
        ident = r["Identificacion"].fillna("").str.strip()
        b["tipo_identificacion"] = _conteo(r["Tipo identificacion"])
        b["identificacion_no_numerica"] = int((~_es_digitos(ident)).sum())
        b["personas_distintas"] = int(ident.nunique())
        b["identificaciones_con_varios_tipos"] = int(r.groupby(ident)["Tipo identificacion"].nunique().gt(1).sum())
        ini, fin = _fecha(r["Fecha Inicio Contrato"]), _fecha(r["Fecha Fin Contrato"])
        b["rango::Fecha Inicio Contrato"] = _rango(r["Fecha Inicio Contrato"])
        b["rango::Fecha Fin Contrato"] = _rango(r["Fecha Fin Contrato"])
        b["fin_posterior_a_as_of"] = int((fin > as_of).sum())
        b["fin_anterior_a_inicio"] = int((fin < ini).sum())
        b["inicio_vacio"] = int(ini.isna().sum())
        clave = pd.DataFrame({"id": ident, "ini": ini})
        b["vinculos_duplicados_persona_inicio"] = int(clave.duplicated().sum())
        b["vinculos_por_persona"] = {str(k): int(v) for k, v in ident.value_counts().value_counts().sort_index().items()}
        orden = pd.DataFrame({"id": ident, "ini": ini, "fin": fin}).sort_values(["id", "ini"])
        fin_prev = orden.groupby("id")["fin"].shift()
        b["vinculos_solapados_con_el_anterior"] = int((orden["ini"] <= fin_prev).sum())
        b["tipo_contrato"] = _conteo(r["Tipo de Contrato"], 10)
        b["empresa_cliente_top"] = _conteo(r["Empresa"], 15)
        ids_rotacion = set(ident[_es_digitos(ident)])
        spells_rotacion = set(zip(ident, ini.dt.strftime("%Y-%m-%d")))

    # --- Personal (cruce) ---
    if "personal" in marcos and "rotacion" in marcos:
        p = marcos["personal"]
        b = informe["bases"]["personal"]
        ident = p["Identificacion"].fillna("").str.strip()
        ini = _fecha(p["Fecha Inicio Contrato"])
        b["personas_distintas"] = int(ident.nunique())
        b["rango::Fecha Inicio Contrato"] = _rango(p["Fecha Inicio Contrato"])
        b["rango::Fecha Fin Contrato"] = _rango(p["Fecha Fin Contrato"])
        b["personas_ausentes_en_rotacion"] = int(len(set(ident) - ids_rotacion))
        pares = set(zip(ident, ini.dt.strftime("%Y-%m-%d")))
        b["vinculos_persona_inicio_ausentes_en_rotacion"] = int(len(pares - spells_rotacion))
        b["empresa_cliente_top"] = _conteo(p["Empresa"], 10)

    # --- Ausentismo (health_events) ---
    if "ausentismo" in marcos:
        a = marcos["ausentismo"]
        b = informe["bases"]["ausentismo"]
        ced = a["CEDULA TRABAJADOR"].fillna("").str.strip()
        b["tipo_evento"] = _conteo(a["TIPO DE EVENTO"])
        b["tipo_incapacidad"] = _conteo(a["TIPO INCAPACIDAD"])
        b["cedula_no_numerica"] = int((~_es_digitos(ced)).sum())
        b["personas_distintas"] = int(ced.nunique())
        b["rango::FECHA INICIAL"] = _rango(a["FECHA INICIAL"])
        b["rango::FECHA FINAL"] = _rango(a["FECHA FINAL"])
        dias = pd.to_numeric(a["DIAS DE INCAPACIDAD"], errors="coerce")
        b["dias_no_numericos"] = int((a["DIAS DE INCAPACIDAD"].notna() & dias.isna()).sum())
        b["dias_negativos"] = int((dias < 0).sum())
        ini, fin = _fecha(a["FECHA INICIAL"]), _fecha(a["FECHA FINAL"])
        b["fin_anterior_a_inicio"] = int((fin < ini).sum())
        b["duplicados_exactos"] = int(a.duplicated().sum())
        b["personas_ausentes_en_rotacion"] = int(len(set(ced[_es_digitos(ced)]) - ids_rotacion)) if ids_rotacion else None
        b["archivo_origen"] = _conteo(a["ARCHIVO ORIGEN"], 15)

    # --- Accidentalidad (no usada por el motor; diagnóstico) ---
    if "accidentalidad" in marcos:
        x = marcos["accidentalidad"]
        b = informe["bases"]["accidentalidad"]
        doc = x["N DOCUMENTO"].fillna("").str.strip()
        anio = _fecha(x["FECHA DEL ACCIDENTE"]).dt.year
        b["tipo_evento"] = _conteo(x["TIPO DE EVENTO"])
        b["documento_vacio_por_anio"] = {str(k): int(v) for k, v in doc.eq("").groupby(anio).sum().items()}
        b["rango::FECHA DEL ACCIDENTE"] = _rango(x["FECHA DEL ACCIDENTE"])

    # --- Cruce desenlaces ↔ nómina ---
    if ids_outcomes and ids_rotacion:
        informe["cruces"] = {"personas_con_el": len(ids_outcomes),
                             "personas_con_el_en_rotacion": len(ids_outcomes & ids_rotacion),
                             "personas_con_el_sin_vinculo_en_rotacion": len(ids_outcomes - ids_rotacion)}

    # --- Soporte por fecha índice candidata (person_holdout) ---
    if "rotacion" in marcos and "caracterizacion" in marcos:
        r, c = marcos["rotacion"], marcos["caracterizacion"]
        ident = r["Identificacion"].fillna("").str.strip()
        ini, fin = _fecha(r["Fecha Inicio Contrato"]), _fecha(r["Fecha Fin Contrato"])
        dni = c["Empleado DNI"].fillna("").str.strip().str.replace(r"^C", "", regex=True)
        calif = _fecha(c["Fecha Calificacion Siniestro Fecha"])
        eventos = pd.DataFrame({"id": dni, "fecha": calif}).dropna()
        cierre = pd.Timestamp(protocolo["followup_derivation"]["coverage"][0]["end"])
        filas = []
        for t0 in pd.date_range("2020-12-31", "2023-12-31", freq="QE"):
            activos = (ini <= t0) & (fin.isna() | (fin > t0))
            personas = set(ident[activos])
            prevalentes = set(eventos.loc[eventos.fecha <= t0, "id"])
            elegibles = personas - prevalentes
            posteriores = eventos.loc[eventos.fecha > t0]
            posteriores = posteriores.loc[posteriores.id.isin(elegibles)]
            fila = {"t0": str(t0.date()), "activos": len(personas), "prevalentes_excluidos": len(personas & prevalentes),
                    "elegibles": len(elegibles), "meses_seguimiento_hasta_cierre": round((cierre - t0).days / 30.44, 1)}
            for m in [3, 6, 12]:
                fila[f"activos_con_vinculo_desde_{m}m_antes"] = int(len(set(ident[activos & (ini <= t0 - pd.DateOffset(months=m))])))
            for h in [12, 36, 60]:
                limite = t0 + pd.DateOffset(months=h)
                fila[f"eventos_a_{h}m"] = int(posteriores.loc[posteriores.fecha <= limite, "id"].nunique())
                fila[f"horizonte_{h}m_dentro_de_cobertura"] = bool(limite < cierre)
            fila["eventos_totales_posteriores"] = int(posteriores.id.nunique())
            filas.append(fila)
        informe["soporte_por_fecha_indice"] = filas

    informe["hallazgos"] = hallazgos
    informe["bloqueante"] = any(h["nivel"] == "error" for h in hallazgos)
    (salida / "verificaciones_previas.json").write_text(json.dumps(informe, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")
    if informe.get("soporte_por_fecha_indice"):
        pd.DataFrame(informe["soporte_por_fecha_indice"]).to_csv(salida / "soporte_por_fecha_indice.csv", index=False)
    return informe


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--originales", required=True)
    parser.add_argument("--decisiones", default=str(Path(__file__).with_name("decisiones_mapeo_asear.json")))
    parser.add_argument("--salida", required=True)
    args = parser.parse_args(argv)
    decisiones = json.loads(Path(args.decisiones).read_text(encoding="utf-8"))
    informe = verificar(Path(args.originales), decisiones, Path(args.salida))
    print(json.dumps({"bloqueante": informe["bloqueante"], "hallazgos": informe["hallazgos"],
                      "cruces": informe.get("cruces")}, ensure_ascii=False, indent=2))
    return 3 if informe["bloqueante"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
