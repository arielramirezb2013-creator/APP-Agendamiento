#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ejecuta el motor Rehavid V5 sobre las bases reales de ASEAR, de principio a fin.

Pasos (``--hasta`` permite detenerse antes):
  verificar   → verificaciones previas sobre los seis libros originales (agregados).
  derivar     → carpeta de fuentes para el motor: copias intactas + CSV derivados documentados.
  formularios → ``forms`` del motor y diligenciamiento desde decisiones_mapeo_asear.json.
  configurar  → ``configure`` (config_asear.json). ``configured`` no significa entrenado.
  preparar    → ``prepare`` (cohortes y soporte por horizonte, sin entrenar).
  ejecutar    → ``run`` (entrenamiento, selección, evaluación y predicción a 12/36/60 meses).
  informe     → INFORME_RESUMEN.md con agregados y supresión de celdas pequeñas (sin registros).

Las reglas de derivación de disponibilidad contractual y de seguimiento (D1, D2) y la
definición del desenlace (D3) son declaraciones humanas. Sin ratificación el pipeline se
detiene tras los formularios (reviewed=false). Ratificar exige ``--ratificado-por`` con el
nombre y rol de una persona, ``--fecha-ratificacion`` y ``--declaraciones-aceptadas D1,D2,D3``.
Con ``--exploratorio`` se puede ejecutar sin ratificación: la configuración lleva
reviewed=true sólo para que el motor evalúe la factibilidad y todas las salidas quedan
rotuladas «NO RATIFICADA · exploratoria»; sus resultados no son publicables.

Códigos de salida del pipeline: 0 correcto; 10 argumentos o fechas incoherentes; 11 motor no
verificado; 12 verificaciones previas bloqueantes; 13 fallo en forms/derivación; 14 sin
ratificación; 15 configuración bloqueada. Los códigos 2, 3 y 4 son los del motor (prepare/run).

Ejemplo:
  python ejecutar_asear.py --originales trabajo/originales --ratificado-por "Nombre Apellido, medicina laboral" \\
      --fecha-ratificacion 2026-09-20 --declaraciones-aceptadas D1,D2,D3
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import subprocess
import sys
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path

AQUI = Path(__file__).resolve().parent
MOTOR = AQUI / "Rehavid_EL_V5_Codigo_Legible.py"
PASOS = ["verificar", "derivar", "formularios", "configurar", "preparar", "ejecutar", "informe"]
ARCHIVOS_VERSIONADOS = ["ejecutar_asear.py", "derivar_fuentes.py", "verificar_bases.py", "utilidades.py",
                        "decisiones_mapeo_asear.json", "Rehavid_EL_V5_Codigo_Legible.py"]
PALABRAS_NO_HUMANAS = ("solicitad", "pendiente", "autonom", "claude", "por confirmar", "modelo", " ia ", "asistente", "automatic")
sys.path.insert(0, str(AQUI))
import derivar_fuentes  # noqa: E402
import verificar_bases  # noqa: E402
from utilidades import sha256_archivo, suprimir_celdas, suprimir_dict, tabla_md  # noqa: E402


def _log(run_dir: Path, nombre: str, texto: str):
    (run_dir / "logs").mkdir(exist_ok=True)
    (run_dir / "logs" / nombre).write_text(texto, encoding="utf-8")


def motor(run_dir: Path, etiqueta: str, argumentos: list[str]) -> tuple[int, str, str]:
    """Llama al archivo autónomo del motor con el mismo intérprete y conserva el comando."""
    comando = [sys.executable, str(MOTOR), *argumentos]
    proceso = subprocess.run(comando, capture_output=True, text=True, cwd=str(AQUI))
    _log(run_dir, f"{etiqueta}.log", "COMANDO: " + " ".join(comando) + f"\nCODIGO: {proceso.returncode}\n\n--- STDOUT ---\n"
         + proceso.stdout + "\n--- STDERR ---\n" + proceso.stderr)
    print(f"[{etiqueta}] código de salida {proceso.returncode}")
    return proceso.returncode, proceso.stdout, proceso.stderr


def _estado(run_dir: Path, carpeta: str, codigo: int, stderr: str) -> dict | None:
    ruta = run_dir / carpeta / "estado_ejecucion.json"
    if not ruta.exists():
        print(f"El motor terminó con código {codigo} sin escribir {ruta.name}. STDERR:\n{stderr.strip()[-2000:]}", file=sys.stderr)
        return None
    try:
        return json.loads(ruta.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        print(f"No se pudo leer {ruta}: {exc}", file=sys.stderr)
        return None


def _leer_csv(path: Path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        lector = csv.DictReader(handle)
        return lector.fieldnames, list(lector)


def _escribir_csv(path: Path, campos, filas):
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        escritor = csv.DictWriter(handle, fieldnames=campos)
        escritor.writeheader()
        escritor.writerows(filas)


def _coincide(fila_archivo: str, fila_hoja: str, decision: dict) -> bool:
    archivo = Path(fila_archivo).as_posix()
    objetivo = decision["archivo"]
    return (archivo == objetivo or archivo.endswith("/" + objetivo)) and (fila_hoja or "") == (decision.get("hoja") or "")


CAMPOS_PERMITIDOS = {
    "employment": {"company", "person_id", "spell_id", "start_date", "end_date", "recorded_at", "job", "area", "site", "effective_from"},
    "outcomes": {"company", "person_id", "event_id", "status", "event_date", "available_at", "outcome_group"},
    "followup": {"company", "person_id", "obs_start", "obs_end", "verified_at"},
    "health_events": {"company", "person_id", "event_id", "event_date", "available_at", "source_kind", "days", "severity"},
    "exposures": {"company", "person_id", "start_date", "end_date", "available_at", "exposure_name", "exposure_value"},
}
CLAVES_PROTOCOLO = {"company", "outcome_name", "outcome_date_basis", "outcome_group", "as_of", "landmarks", "validation_design",
                    "employment_features", "exposure_features", "contract_availability", "followup_derivation",
                    "label_maturation_days", "source_metadata"}


def diligenciar_formularios(formularios: Path, decisiones: dict) -> dict:
    """Escribe las decisiones revisadas en los cuatro formularios generados por el motor."""
    for decision in decisiones["fuentes_motor"]:
        permitidos = CAMPOS_PERMITIDOS[decision["fuente"]]
        claves = set(decision["columnas"]) | set(decision.get("constantes", {})) | set(decision.get("formatos_fecha", {}))
        if claves - permitidos:
            raise ValueError(f"{decision['archivo']}: campos no canónicos para {decision['fuente']}: {sorted(claves - permitidos)}")
        if set(decision["columnas"]) & set(decision.get("constantes", {})):
            raise ValueError(f"{decision['archivo']}: un campo no puede ser columna y constante a la vez.")
    campos_f, fuentes = _leer_csv(formularios / "plan_fuentes.csv")
    campos_c, columnas = _leer_csv(formularios / "plan_columnas.csv")
    asignadas, usadas = {}, {id(d): 0 for d in decisiones["fuentes_motor"]}
    for fila in fuentes:
        coincidencias = [d for d in decisiones["fuentes_motor"] if _coincide(fila["archivo"], fila["hoja"], d)]
        if len(coincidencias) > 1:
            raise ValueError(f"Más de una decisión para la entrada {fila['entrada_id']} ({fila['archivo']} / {fila['hoja']}).")
        if not coincidencias:
            fila["usar"], fila["revisado"] = "NO", "NO"
            continue
        decision = coincidencias[0]
        usadas[id(decision)] += 1
        prefijo = decision.get("prefijo_id_a_retirar", "")
        fila.update(usar="SI", revisado="SI", fuente=decision["fuente"],
                    campos_clave_contrato=decision.get("campos_clave_contrato", ""),
                    prefijo_id_a_retirar=prefijo,
                    normalizacion_id_revisada="SI" if prefijo else "NO",
                    evidencia_normalizacion_id=decision.get("evidencia_normalizacion_id", "") if prefijo else "")
        asignadas[(fila["entrada_id"], decision["fuente"])] = decision
    faltantes = [d["archivo"] for d in decisiones["fuentes_motor"] if usadas[id(d)] != 1]
    if faltantes:
        raise ValueError("Entradas del inventario sin correspondencia exacta con las decisiones: " + ", ".join(faltantes))
    escritos = {clave: set() for clave in asignadas}
    for fila in columnas:
        clave = (fila["entrada_id"], fila["fuente"])
        decision = asignadas.get(clave)
        if decision is None:
            continue
        campo = fila["campo_destino"]
        if campo in decision["columnas"]:
            fila["columna_original"] = decision["columnas"][campo]
            fila["formato_fecha"] = decision.get("formatos_fecha", {}).get(campo, "")
            escritos[clave].add(campo)
        elif campo in decision.get("constantes", {}):
            fila["valor_constante"] = decision["constantes"][campo]
            escritos[clave].add(campo)
    for clave, decision in asignadas.items():
        esperados = set(decision["columnas"]) | set(decision.get("constantes", {}))
        if esperados - escritos[clave]:
            raise ValueError(f"{decision['archivo']}: campos de la decisión sin fila en plan_columnas: {sorted(esperados - escritos[clave])}")
    _escribir_csv(formularios / "plan_fuentes.csv", campos_f, fuentes)
    _escribir_csv(formularios / "plan_columnas.csv", campos_c, columnas)
    _escribir_csv(formularios / "plan_estados.csv", ["estado_original", "estado_destino", "revisado"],
                  [{"estado_original": e["estado_original"], "estado_destino": e["estado_destino"], "revisado": "SI"}
                   for e in decisiones["estados"]])
    protocolo = json.loads((formularios / "protocolo.json").read_text(encoding="utf-8"))
    extra = set(decisiones["protocolo"]) - CLAVES_PROTOCOLO
    if extra:
        raise ValueError(f"Claves del protocolo que el configurador del motor no materializa: {sorted(extra)}")
    for clave, valor in decisiones["protocolo"].items():
        protocolo[clave] = deepcopy(valor)
    protocolo["mapping_reviewed"] = True
    (formularios / "protocolo.json").write_text(json.dumps(protocolo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return protocolo


def _iso(valor: str, nombre: str) -> str:
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", valor or ""):
        raise ValueError(f"{nombre} debe ser una fecha ISO AAAA-MM-DD.")
    datetime.strptime(valor, "%Y-%m-%d")
    return valor


def aplicar_parametros(decisiones: dict, args) -> dict:
    """Devuelve una copia de las decisiones con variantes, sensibilidad, fechas y ratificación aplicadas."""
    d = deepcopy(decisiones)
    p = d["protocolo"]
    variantes = d.get("variantes_vinculos", {})
    for fuente in d["fuentes_motor"]:
        if fuente["fuente"] == "employment" and args.vinculos in variantes:
            fuente["archivo"] = variantes[args.vinculos]
            fuente["evidencia_mapeo"] = fuente.get("evidencia_mapeo", "") + variantes.get("anexo_evidencia", {}).get(args.vinculos, "")
        if fuente["fuente"] == "health_events" and "available_at" in fuente["columnas"]:
            fuente["columnas"]["available_at"] = d["variantes_disponibilidad_antecedentes"][args.disponibilidad_antecedentes]
    anexo = variantes.get("anexo_evidencia", {}).get(args.vinculos, "")
    p["contract_availability"]["evidence_ref"] += anexo
    if args.sensibilidad:
        sens = d["sensibilidades_opcionales"][args.sensibilidad]
        if "outcome_date_basis" in sens:
            p["outcome_date_basis"] = sens["outcome_date_basis"]
        if "label_maturation_days" in sens:
            p["label_maturation_days"] = sens["label_maturation_days"]
        if "outcome_group" in sens:
            p["outcome_group"] = sens["outcome_group"]
        p["outcome_name"] += f" [Sensibilidad {args.sensibilidad}: {sens.get('_nota', '')}]"
        for fuente in d["fuentes_motor"]:
            if fuente["fuente"] == "outcomes" and "columnas_outcomes" in sens:
                fuente["columnas"].update(sens["columnas_outcomes"])
    sobrescrituras = {k: getattr(args, k) for k in ["as_of", "fecha_indice", "cobertura_fin", "verificado_en"] if getattr(args, k)}
    if sobrescrituras and not args.enmienda:
        raise ValueError("Sobrescribir fechas del protocolo predeclarado exige --enmienda \"motivo\" (queda registrado como desviación).")
    if args.as_of and not (args.cobertura_fin and args.verificado_en):
        raise ValueError("--as-of exige declarar también --cobertura-fin y --verificado-en (cobertura del registro ARL).")
    cobertura = p["followup_derivation"]["coverage"][0]
    if args.as_of:
        p["as_of"] = _iso(args.as_of, "--as-of")
        p["landmarks"]["score"] = p["as_of"]
    if args.fecha_indice:
        for etapa in ["train", "validation", "test"]:
            p["landmarks"][etapa] = _iso(args.fecha_indice, "--fecha-indice")
    if args.cobertura_fin:
        cobertura["end"] = _iso(args.cobertura_fin, "--cobertura-fin")
        for nombre in ["health_events"]:
            meta = p["source_metadata"].get(nombre, {})
            for clave in ["coverage_end", "available_through"]:
                if meta.get(clave) and meta[clave] > cobertura["end"]:
                    meta[clave] = cobertura["end"]
    if args.verificado_en:
        cobertura["verified_at"] = _iso(args.verificado_en, "--verificado-en")
    # Coherencia interna antes de gastar tiempo en el motor.
    t0, cierre = p["landmarks"]["train"], p["as_of"]
    if not (t0 < cierre):
        raise ValueError(f"La fecha índice {t0} debe ser anterior a as_of {cierre}.")
    if not (cobertura["start"] <= cobertura["end"] <= cobertura["verified_at"] <= cierre):
        raise ValueError("Cobertura del registro incoherente: se requiere start <= end <= verified_at <= as_of.")
    inicio_salud = p["source_metadata"]["health_events"].get("coverage_start")
    if inicio_salud:
        margen = datetime.strptime(t0, "%Y-%m-%d").replace(year=datetime.strptime(t0, "%Y-%m-%d").year - 1).strftime("%Y-%m-%d")
        if inicio_salud > margen:
            print(f"AVISO: la cobertura de antecedentes ({inicio_salud}) no alcanza 12 meses antes de la fecha índice {t0}; la ventana de 12 meses no estará cubierta.")
    d["_sobrescrituras"] = {"valores": sobrescrituras, "enmienda": args.enmienda}
    ratificacion = None
    if args.ratificado_por:
        texto = " " + args.ratificado_por.casefold() + " "
        if any(palabra in texto for palabra in PALABRAS_NO_HUMANAS) or len(args.ratificado_por.split()) < 2:
            raise ValueError("--ratificado-por debe ser el nombre y rol de una persona que ratifica; no admite textos de ejecución automática ni de ratificación pendiente.")
        aceptadas = {x.strip().upper() for x in (args.declaraciones_aceptadas or "").split(",") if x.strip()}
        if aceptadas != {"D1", "D2", "D3"}:
            raise ValueError("Ratificar exige --declaraciones-aceptadas D1,D2,D3 (las tres declaraciones).")
        fecha = _iso(args.fecha_ratificacion, "--fecha-ratificacion")
        ratificacion = {"tipo": "humana", "por": args.ratificado_por, "fecha": fecha, "declaraciones": sorted(aceptadas)}
        sello = f" Ratificado por {args.ratificado_por} el {fecha} (declaraciones D1, D2 y D3)."
    elif args.exploratorio:
        ratificacion = {"tipo": "exploratoria_no_ratificada", "por": None, "fecha": None, "declaraciones": []}
        sello = (" Ejecucion exploratoria de factibilidad: las declaraciones D1 y D2 se asumen provisionalmente para que el motor evalue soporte;"
                 " la revision humana de esta regla queda registrada como no realizada en parametros_ejecucion.json y en el informe.")
    if ratificacion:
        p["contract_availability"].update(reviewed=True, rationale=p["contract_availability"]["rationale"] + sello)
        p["followup_derivation"].update(reviewed=True, employment_implies_registry_observation=True,
                                        rationale=p["followup_derivation"]["rationale"] + sello)
    d["_ratificacion"] = ratificacion
    return d


def _leer_tabla(ruta: Path):
    import pandas as pd
    try:
        return pd.read_csv(ruta, keep_default_na=False)
    except (OSError, ValueError, pd.errors.EmptyDataError):
        return None


def informe(run_dir: Path, decisiones: dict, args, hashes: dict) -> Path:
    import pandas as pd
    resultado = run_dir / "resultado"
    estado = {}
    if (resultado / "estado_ejecucion.json").exists():
        estado = json.loads((resultado / "estado_ejecucion.json").read_text(encoding="utf-8"))
    minimo = 5
    config = run_dir / "config_asear.json"
    if config.exists():
        minimo = int(json.loads(config.read_text(encoding="utf-8")).get("evaluation", {}).get("min_cell_count", 5))
    rat = decisiones.get("_ratificacion") or {}
    rotulo = (f"ratificada por {rat['por']} el {rat['fecha']}" if rat.get("tipo") == "humana" else
              "NO RATIFICADA · ejecución exploratoria de factibilidad; resultados no publicables")
    partes = ["# Rehavid V5 · ASEAR S.A.S. E.S.P. · resumen de la ejecución", "",
              f"Carpeta de ejecución: `{run_dir}`  ", f"Fecha (UTC): {datetime.now(timezone.utc).isoformat(timespec='seconds')}  ",
              f"Diseño de vínculos: {args.vinculos} (consolidados = B principal; contratos = A sensibilidad)  ",
              f"Disponibilidad de antecedentes: {args.disponibilidad_antecedentes}  ",
              f"Sensibilidad: {args.sensibilidad or 'ninguna (análisis principal)'}  ",
              f"Declaraciones D1–D3: **{rotulo}**  ",
              f"Desviaciones del protocolo predeclarado: {json.dumps(decisiones.get('_sobrescrituras'), ensure_ascii=False)}  ",
              f"Huellas SHA-256 de los archivos versionados: `{json.dumps(hashes)}`", "",
              f"Los conteos menores que {minimo} se publican como `<{minimo}` (regla min_cell_count del motor).", "",
              "## Estado del motor", "", "```json", json.dumps({k: estado.get(k) for k in
              ["software", "status", "phase", "exit_code", "training_completed", "selection_completed", "selected_model",
               "predicted_horizons_months", "clinical_validation", "report_failure"]}, ensure_ascii=False, indent=2), "```", ""]
    cohortes = [{"etapa": k, "people": v.get("people"), "events": v.get("events")} for k, v in (estado.get("cohorts") or {}).items()]
    if cohortes:
        partes += ["Cohortes:", "", tabla_md(suprimir_celdas(pd.DataFrame(cohortes), minimo).to_dict("records"))]
    hallazgos = estado.get("findings", [])
    if hallazgos:
        partes += ["### Hallazgos reportados por el motor", ""] + [f"- {h if isinstance(h, str) else json.dumps(h, ensure_ascii=False)}" for h in hallazgos] + [""]
    verif = run_dir / "verificaciones" / "verificaciones_previas.json"
    if verif.exists():
        v = json.loads(verif.read_text(encoding="utf-8"))
        partes += ["## Verificaciones previas (agregados)", "", "Cruces: `" + json.dumps(suprimir_dict(v.get("cruces"), minimo), ensure_ascii=False) + "`", ""]
        if v.get("hallazgos"):
            partes += ["Hallazgos:", ""] + [f"- [{h['nivel']}] {h['base']}: {h['mensaje']}" for h in v["hallazgos"]] + [""]
        if v.get("soporte_por_fecha_indice"):
            partes += ["### Soporte por fecha índice candidata (cribado previo)", "",
                       v.get("soporte_por_fecha_indice_definicion", ""), "",
                       tabla_md(suprimir_celdas(pd.DataFrame(v["soporte_por_fecha_indice"]), minimo).to_dict("records"))]
    tablas = resultado / "analisis" / "tables"
    for nombre, titulo in [("cohort_flow.csv", "Flujo de cohortes"), ("feasibility_by_horizon.csv", "Factibilidad por horizonte"),
                           ("horizon_status.csv", "Estado por horizonte (validación)"), ("followup.csv", "Seguimiento observado"),
                           ("event_status.csv", "Estados de desenlace al cierre"), ("feature_missingness.csv", "Faltantes por predictor")]:
        frame = _leer_tabla(tablas / nombre)
        if frame is None:
            continue
        if nombre == "cohort_flow.csv" and {"stage", "step", "count"}.issubset(frame.columns):
            frame = frame.pivot_table(index="step", columns="stage", values="count", aggfunc="first", sort=False).reset_index()
            for columna in [c for c in frame.columns if c != "step"]:
                numero = pd.to_numeric(frame[columna], errors="coerce")
                frame[columna] = numero.where(~(numero.gt(0) & numero.lt(minimo)), f"<{minimo}").astype(object)
        else:
            frame = suprimir_celdas(frame, minimo)
        partes += [f"## {titulo}", "", tabla_md(frame.to_dict("records"))]
    modelo = resultado / "analisis" / "model_result.json"
    if modelo.exists():
        texto = modelo.read_text(encoding="utf-8")
        partes += ["## Resultado de modelos (`analisis/model_result.json`)", "", "```json", texto if len(texto) < 60000 else texto[:60000] + "\n... (truncado; ver archivo)", "```", ""]
    predicciones = _leer_tabla(tablas / "predicciones_por_persona_y_horizonte.csv")
    if predicciones is not None and len(predicciones):
        columnas_estado = [c for c in predicciones.columns if any(t in c.lower() for t in ("estado", "status", "motivo", "reason", "validation_scope"))]
        partes += ["## Predicciones (agregado; el archivo individual queda en la carpeta de resultados)", "", f"Filas: {len(predicciones)}.", ""]
        for columna in columnas_estado:
            distribucion = predicciones[columna].value_counts(dropna=False).rename_axis(columna).reset_index(name="n")
            partes += [f"Distribución de `{columna}`:", "", tabla_md(suprimir_celdas(distribucion, minimo).to_dict("records"))]
        for columna in [c for c in predicciones.columns if c.startswith(("prob", "risk", "probabil"))]:
            serie = pd.to_numeric(predicciones[columna], errors="coerce")
            if serie.notna().sum() >= minimo:
                partes += [f"`{columna}`: n={int(serie.notna().sum())}, media={serie.mean():.4f}, mediana={serie.median():.4f}, p90={serie.quantile(0.9):.4f}", ""]
    informe_motor = resultado / "analisis" / "informe.md"
    if informe_motor.exists():
        partes += ["## Informe generado por el motor (`analisis/informe.md`)", "", informe_motor.read_text(encoding="utf-8")]
    partes += ["", "## Declaraciones del operador (D1–D3)", ""] + [f"- {d}" for d in decisiones["declaraciones_que_ratifica_el_operador"]] + [
        "", "Estas salidas describen software y datos; no certifican validez clínica, utilidad ni revisión profesional independiente (ver docs/RESPONSABILIDADES.md del motor)."]
    destino = run_dir / "INFORME_RESUMEN.md"
    destino.write_text("\n".join(partes) + "\n", encoding="utf-8")
    return destino


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--originales", default=str(AQUI / "trabajo" / "originales"), help="Carpeta con los seis libros originales de ASEAR.")
    parser.add_argument("--trabajo", default=str(AQUI / "trabajo"), help="Carpeta de trabajo (no se versiona).")
    parser.add_argument("--decisiones", default=str(AQUI / "decisiones_mapeo_asear.json"))
    parser.add_argument("--hasta", choices=PASOS, default="informe")
    parser.add_argument("--ratificado-por", default="", help="Nombre y rol de la persona que ratifica D1–D3.")
    parser.add_argument("--fecha-ratificacion", default="", help="AAAA-MM-DD de la ratificación (obligatoria con --ratificado-por).")
    parser.add_argument("--declaraciones-aceptadas", default="", help="Lista D1,D2,D3 (obligatoria con --ratificado-por).")
    parser.add_argument("--exploratorio", action="store_true", help="Ejecutar sin ratificación; salidas rotuladas como no ratificadas.")
    parser.add_argument("--vinculos", choices=["consolidados", "contratos"], default="consolidados",
                        help="B consolidados (principal) o A contratos (sensibilidad).")
    parser.add_argument("--disponibilidad-antecedentes", choices=["inicial", "final"], default="inicial")
    parser.add_argument("--sensibilidad", choices=["verified_diagnosis", "no_covid"], default="")
    parser.add_argument("--as-of", default="", help="Sobrescribe as_of y score (AAAA-MM-DD); exige --cobertura-fin y --verificado-en.")
    parser.add_argument("--fecha-indice", default="", help="Sobrescribe la fecha índice común (AAAA-MM-DD).")
    parser.add_argument("--cobertura-fin", default="", help="Sobrescribe followup_derivation.coverage[0].end.")
    parser.add_argument("--verificado-en", default="", help="Sobrescribe followup_derivation.coverage[0].verified_at.")
    parser.add_argument("--enmienda", default="", help="Motivo documentado de cualquier sobrescritura de fechas.")
    parser.add_argument("--solo-informe", default="", help="Regenera INFORME_RESUMEN.md de una carpeta de ejecución existente y termina.")
    args = parser.parse_args(argv)

    if args.solo_informe:
        run_dir = Path(args.solo_informe).resolve()
        parametros = json.loads((run_dir / "parametros_ejecucion.json").read_text(encoding="utf-8"))
        decisiones = json.loads((run_dir / "decisiones_aplicadas.json").read_text(encoding="utf-8"))
        for clave in ["vinculos", "disponibilidad_antecedentes", "sensibilidad"]:
            setattr(args, clave, parametros.get(clave, getattr(args, clave)))
        print(f"[informe] {informe(run_dir, decisiones, args, parametros.get('sha256_archivos_versionados', {}))}")
        return 0

    try:
        decisiones = aplicar_parametros(json.loads(Path(args.decisiones).read_text(encoding="utf-8")), args)
    except ValueError as exc:
        print(f"Argumentos incoherentes: {exc}", file=sys.stderr)
        return 10
    originales = Path(args.originales).resolve()
    if not originales.is_dir():
        print(f"No existe la carpeta de originales: {originales}", file=sys.stderr)
        return 10
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    sufijo = f"_{args.vinculos}" + (f"_{args.disponibilidad_antecedentes}" if args.disponibilidad_antecedentes != "inicial" else "") \
        + (f"_{args.sensibilidad}" if args.sensibilidad else "")
    run_dir = Path(args.trabajo).resolve() / f"ejecucion_{stamp}{sufijo}"
    run_dir.mkdir(parents=True)
    hashes = {nombre: sha256_archivo(AQUI / nombre)[:16] for nombre in ARCHIVOS_VERSIONADOS if (AQUI / nombre).exists()}
    (run_dir / "decisiones_aplicadas.json").write_text(json.dumps(decisiones, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (run_dir / "parametros_ejecucion.json").write_text(json.dumps({**vars(args), "originales": str(originales), "run_dir": str(run_dir),
        "sha256_archivos_versionados": hashes, "ratificacion": decisiones.get("_ratificacion"),
        "sobrescrituras": decisiones.get("_sobrescrituras"), "protocolo_aplicado": decisiones["protocolo"]},
        ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Carpeta de ejecución: {run_dir}")
    limite = PASOS.index(args.hasta)

    codigo, _, _ = motor(run_dir, "00_verify_code", ["--verify-code"])
    if codigo != 0:
        print("El archivo autónomo del motor no supera --verify-code.", file=sys.stderr)
        return 11
    codigo, salida, _ = motor(run_dir, "00_check_env", ["check-env"])
    if codigo != 0 or '"software": "5.0.0"' not in salida:
        print("check-env no informa software 5.0.0; ejecute `Rehavid_EL_V5_Codigo_Legible.py install` en este intérprete.", file=sys.stderr)
        return 11

    verificacion = verificar_bases.verificar(originales, decisiones, run_dir / "verificaciones", args.vinculos)
    for h in verificacion["hallazgos"]:
        print(f"[verificar] {h['nivel']}: {h['base']}: {h['mensaje']}")
    if verificacion["bloqueante"]:
        print("Verificaciones previas bloqueantes; revise verificaciones/verificaciones_previas.json.", file=sys.stderr)
        return 12
    if limite < PASOS.index("derivar"):
        return 0

    try:
        manifest = derivar_fuentes.derivar(originales, decisiones, run_dir / "fuentes_motor", args.vinculos)
    except (ValueError, FileNotFoundError, FileExistsError) as exc:
        print(f"Derivación detenida: {exc}", file=sys.stderr)
        return 13
    for d in manifest["derivados"]:
        print(f"[derivar] {d['salida']}: {d['filas_salida']} filas de {d['filas_origen']}")
    for aviso in manifest.get("avisos", []):
        print(f"[derivar] AVISO: {aviso}")
    if limite < PASOS.index("formularios"):
        return 0

    codigo, _, _ = motor(run_dir, "03_forms", ["forms", "--dir", str(run_dir / "fuentes_motor"), "--out", str(run_dir / "formularios"),
                                               "--company", decisiones["empresa"]])
    if codigo != 0:
        print("forms falló; vea logs/03_forms.log.", file=sys.stderr)
        return 13
    try:
        diligenciar_formularios(run_dir / "formularios", decisiones)
    except ValueError as exc:
        print(f"Formularios no diligenciados: {exc}", file=sys.stderr)
        return 13
    print("[formularios] diligenciados desde decisiones_mapeo_asear.json")
    if limite < PASOS.index("configurar"):
        return 0
    if not decisiones.get("_ratificacion"):
        print("\nLas reglas de derivación quedan con reviewed=false. Para configurar y ejecutar, una persona debe ratificar:")
        for d in decisiones["declaraciones_que_ratifica_el_operador"]:
            print("  - " + d)
        print("Ejecute con --ratificado-por \"Nombre Apellido, rol\" --fecha-ratificacion AAAA-MM-DD --declaraciones-aceptadas D1,D2,D3,"
              " o con --exploratorio para una evaluación de factibilidad no publicable.")
        return 14

    config = run_dir / "config_asear.json"
    codigo, _, _ = motor(run_dir, "04_configure", ["configure", "--forms", str(run_dir / "formularios"), "--out", str(config)])
    if codigo != 0 or not config.exists():
        resultado = run_dir / "formularios" / "resultado_configuracion.json"
        if resultado.exists():
            for f in json.loads(resultado.read_text(encoding="utf-8")).get("findings", []):
                print(f"[configure] {f.get('code')} ({f.get('entry')}): {f.get('message')} → {f.get('resolution')}")
        print("Configuración bloqueada; corrija los formularios o las decisiones.", file=sys.stderr)
        return 15
    print(f"[configurar] {config}")
    if limite < PASOS.index("preparar"):
        return 0

    codigo, _, stderr = motor(run_dir, "05_prepare", ["prepare", "--config", str(config), "--out", str(run_dir / "preparacion")])
    estado = _estado(run_dir, "preparacion", codigo, stderr)
    if estado is None:
        return codigo or 2
    print(f"[preparar] estado {estado.get('status')} (código {codigo})")
    if codigo != 0:
        for h in estado.get("findings", []):
            print("  - " + (h if isinstance(h, str) else json.dumps(h, ensure_ascii=False)))
        print("Preparación bloqueada; vea preparacion/LEER_PRIMERO.md y preparacion/preparacion/hallazgos_preparacion.csv.", file=sys.stderr)
        return codigo
    if limite < PASOS.index("ejecutar"):
        return 0

    codigo, _, stderr = motor(run_dir, "06_run", ["run", "--config", str(config), "--out", str(run_dir / "resultado")])
    estado = _estado(run_dir, "resultado", codigo, stderr)
    if estado is None:
        return codigo or 2
    print(f"[ejecutar] estado {estado.get('status')} · modelo {estado.get('selected_model')} · horizontes {estado.get('predicted_horizons_months')} (código {codigo})")
    if limite < PASOS.index("informe"):
        return codigo
    destino = informe(run_dir, decisiones, args, hashes)
    print(f"[informe] {destino}")
    return codigo


if __name__ == "__main__":
    raise SystemExit(main())
