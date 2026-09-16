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
  informe     → INFORME_RESUMEN.md con agregados (sin registros individuales).

Las reglas de derivación de disponibilidad contractual y de seguimiento son
declaraciones del operador. Sin ``--ratificado-por`` el pipeline se detiene tras
diligenciar los formularios (reviewed=false) y muestra las declaraciones D1–D3.

Ejemplo:
  python ejecutar_asear.py --originales trabajo/originales --ratificado-por "Nombre Apellido"
"""
from __future__ import annotations

import argparse
import csv
import json
import shutil
import subprocess
import sys
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path

AQUI = Path(__file__).resolve().parent
MOTOR = AQUI / "Rehavid_EL_V5_Codigo_Legible.py"
PASOS = ["verificar", "derivar", "formularios", "configurar", "preparar", "ejecutar", "informe"]
sys.path.insert(0, str(AQUI))
import derivar_fuentes  # noqa: E402
import verificar_bases  # noqa: E402


class Detenido(SystemExit):
    pass


def _log(run_dir: Path, nombre: str, texto: str):
    (run_dir / "logs").mkdir(exist_ok=True)
    (run_dir / "logs" / nombre).write_text(texto, encoding="utf-8")


def motor(run_dir: Path, etiqueta: str, argumentos: list[str]) -> tuple[int, str]:
    """Llama al archivo autónomo del motor con el mismo intérprete y conserva el comando."""
    comando = [sys.executable, str(MOTOR), *argumentos]
    proceso = subprocess.run(comando, capture_output=True, text=True, cwd=str(AQUI))
    _log(run_dir, f"{etiqueta}.log", "COMANDO: " + " ".join(comando) + f"\nCODIGO: {proceso.returncode}\n\n--- STDOUT ---\n"
         + proceso.stdout + "\n--- STDERR ---\n" + proceso.stderr)
    print(f"[{etiqueta}] código de salida {proceso.returncode}")
    return proceso.returncode, proceso.stdout


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


def diligenciar_formularios(formularios: Path, decisiones: dict, protocolo_extra: dict) -> dict:
    """Escribe las decisiones revisadas en los cuatro formularios generados por el motor."""
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
    for fila in columnas:
        decision = asignadas.get((fila["entrada_id"], fila["fuente"]))
        if decision is None:
            continue
        campo = fila["campo_destino"]
        if campo in decision["columnas"]:
            fila["columna_original"] = decision["columnas"][campo]
            fila["formato_fecha"] = decision.get("formatos_fecha", {}).get(campo, "")
        elif campo in decision.get("constantes", {}):
            fila["valor_constante"] = decision["constantes"][campo]
    _escribir_csv(formularios / "plan_fuentes.csv", campos_f, fuentes)
    _escribir_csv(formularios / "plan_columnas.csv", campos_c, columnas)
    _escribir_csv(formularios / "plan_estados.csv", ["estado_original", "estado_destino", "revisado"],
                  [{"estado_original": e["estado_original"], "estado_destino": e["estado_destino"], "revisado": "SI"}
                   for e in decisiones["estados"]])
    protocolo = json.loads((formularios / "protocolo.json").read_text(encoding="utf-8"))
    for clave, valor in decisiones["protocolo"].items():
        protocolo[clave] = deepcopy(valor)
    protocolo.update(protocolo_extra)
    protocolo["mapping_reviewed"] = True
    (formularios / "protocolo.json").write_text(json.dumps(protocolo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return protocolo


def aplicar_parametros(decisiones: dict, args) -> dict:
    """Devuelve una copia de las decisiones con sensibilidad, fechas y ratificación aplicadas."""
    d = deepcopy(decisiones)
    p = d["protocolo"]
    variantes = d.get("variantes_vinculos", {})
    if args.vinculos in variantes:
        for fuente in d["fuentes_motor"]:
            if fuente["fuente"] == "employment":
                fuente["archivo"] = variantes[args.vinculos]
    if args.sensibilidad:
        sens = d["sensibilidades_opcionales"][args.sensibilidad]
        p["outcome_date_basis"] = sens["outcome_date_basis"]
        p["outcome_name"] += f" [Sensibilidad {args.sensibilidad}: fecha del evento = fecha del siniestro/diagnóstico; disponibilidad = fecha de calificación.]"
        for fuente in d["fuentes_motor"]:
            if fuente["fuente"] == "outcomes":
                fuente["columnas"].update(sens["columnas_outcomes"])
    if args.as_of:
        p["as_of"] = args.as_of
        p["landmarks"]["score"] = args.as_of
    if args.fecha_indice:
        for etapa in ["train", "validation", "test"]:
            p["landmarks"][etapa] = args.fecha_indice
    cobertura = p["followup_derivation"]["coverage"][0]
    if args.cobertura_fin:
        cobertura["end"] = args.cobertura_fin
    if args.verificado_en:
        cobertura["verified_at"] = args.verificado_en
    if args.ratificado_por:
        fecha = args.fecha_ratificacion or datetime.now(timezone.utc).strftime("%Y-%m-%d")
        sello = f" Ratificado por {args.ratificado_por} el {fecha}."
        p["contract_availability"].update(reviewed=True, rationale=p["contract_availability"]["rationale"] + sello)
        p["followup_derivation"].update(reviewed=True, employment_implies_registry_observation=True,
                                        rationale=p["followup_derivation"]["rationale"] + sello)
    return d


def _tabla_md(filas: list[dict]) -> str:
    if not filas:
        return "_(sin filas)_\n"
    campos = list(filas[0].keys())
    lineas = ["| " + " | ".join(campos) + " |", "|" + "---|" * len(campos)]
    for fila in filas:
        lineas.append("| " + " | ".join(str(fila.get(c, "")) for c in campos) + " |")
    return "\n".join(lineas) + "\n"


def informe(run_dir: Path, decisiones: dict, args) -> Path:
    import pandas as pd
    resultado = run_dir / "resultado"
    estado = json.loads((resultado / "estado_ejecucion.json").read_text(encoding="utf-8")) if (resultado / "estado_ejecucion.json").exists() else {}
    partes = ["# Rehavid V5 · ASEAR S.A.S. E.S.P. · resumen de la ejecución", "",
              f"Carpeta de ejecución: `{run_dir}`  ", f"Fecha (UTC): {datetime.now(timezone.utc).isoformat(timespec='seconds')}  ",
              f"Diseño de vínculos: {args.vinculos} (A = contratos; B = consolidados)  ",
              f"Sensibilidad: {args.sensibilidad or 'ninguna (análisis principal)'}  ",
              f"Ratificación de declaraciones D1–D3: {args.ratificado_por or 'NO RATIFICADA'}", "",
              "## Estado del motor", "", "```json", json.dumps({k: estado.get(k) for k in
              ["software", "status", "phase", "exit_code", "training_completed", "selection_completed", "selected_model",
               "predicted_horizons_months", "cohorts", "clinical_validation"]}, ensure_ascii=False, indent=2), "```", ""]
    hallazgos = estado.get("findings", [])
    if hallazgos:
        partes += ["### Hallazgos reportados por el motor", ""] + [f"- {h if isinstance(h, str) else json.dumps(h, ensure_ascii=False)}" for h in hallazgos] + [""]
    verif = run_dir / "verificaciones" / "verificaciones_previas.json"
    if verif.exists():
        v = json.loads(verif.read_text(encoding="utf-8"))
        partes += ["## Verificaciones previas (agregados)", "", "Cruces desenlaces ↔ nómina: `" + json.dumps(v.get("cruces"), ensure_ascii=False) + "`", ""]
        if v.get("hallazgos"):
            partes += ["Hallazgos:", ""] + [f"- [{h['nivel']}] {h['base']}: {h['mensaje']}" for h in v["hallazgos"]] + [""]
        if v.get("soporte_por_fecha_indice"):
            partes += ["### Soporte por fecha índice candidata (antes de entrenar)", "", _tabla_md(v["soporte_por_fecha_indice"])]
    tablas = resultado / "analisis" / "tables"
    for nombre, titulo in [("cohort_flow.csv", "Flujo de cohortes"), ("feasibility_by_horizon.csv", "Factibilidad por horizonte"),
                           ("followup.csv", "Seguimiento observado"), ("event_status.csv", "Estados de desenlace al cierre")]:
        ruta = tablas / nombre
        if ruta.exists():
            frame = pd.read_csv(ruta)
            if nombre == "cohort_flow.csv" and {"stage", "step", "count"}.issubset(frame.columns):
                frame = frame.pivot_table(index="step", columns="stage", values="count", aggfunc="first", sort=False).reset_index()
            partes += [f"## {titulo}", "", _tabla_md(frame.to_dict("records"))]
    modelo = resultado / "analisis" / "model_result.json"
    if modelo.exists():
        texto = modelo.read_text(encoding="utf-8")
        partes += ["## Resultado de modelos (`analisis/model_result.json`)", "", "```json", texto if len(texto) < 60000 else texto[:60000] + "\n... (truncado; ver archivo)", "```", ""]
    predicciones = tablas / "predicciones_por_persona_y_horizonte.csv"
    if predicciones.exists():
        frame = pd.read_csv(predicciones)
        columnas_estado = [c for c in frame.columns if "status" in c.lower() or "motivo" in c.lower() or "reason" in c.lower()]
        partes += ["## Predicciones (agregado; el archivo individual queda en la carpeta de resultados)", "",
                   f"Filas: {len(frame)}. Columnas: {', '.join(frame.columns)}", ""]
        for columna in columnas_estado:
            partes += [f"Distribución de `{columna}`:", "", _tabla_md(frame[columna].value_counts(dropna=False).rename_axis(columna).reset_index(name="n").to_dict("records"))]
        for columna in [c for c in frame.columns if c.startswith("prob") or c.startswith("risk") or c.startswith("probabil")]:
            serie = pd.to_numeric(frame[columna], errors="coerce")
            partes += [f"`{columna}`: n={int(serie.notna().sum())}, media={serie.mean():.4f}, mediana={serie.median():.4f}, p90={serie.quantile(0.9):.4f}", ""]
    informe_motor = resultado / "analisis" / "informe.md"
    if informe_motor.exists():
        partes += ["## Informe generado por el motor (`analisis/informe.md`)", "", informe_motor.read_text(encoding="utf-8")]
    partes += ["", "## Declaraciones del operador incorporadas", ""] + [f"- {d}" for d in decisiones["declaraciones_que_ratifica_el_operador"]] + [
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
    parser.add_argument("--ratificado-por", default="", help="Nombre de quien ratifica las declaraciones D1–D3.")
    parser.add_argument("--fecha-ratificacion", default="", help="AAAA-MM-DD; por defecto hoy (UTC).")
    parser.add_argument("--sensibilidad", choices=["verified_diagnosis"], default="")
    parser.add_argument("--vinculos", choices=["contratos", "consolidados"], default="contratos",
                        help="Diseño A (contratos: cada fila de rotación es un vínculo) o B (consolidados: contratos consecutivos unidos).")
    parser.add_argument("--as-of", default="", help="Sobrescribe as_of y score (AAAA-MM-DD).")
    parser.add_argument("--fecha-indice", default="", help="Sobrescribe la fecha índice común (AAAA-MM-DD).")
    parser.add_argument("--cobertura-fin", default="", help="Sobrescribe followup_derivation.coverage[0].end.")
    parser.add_argument("--verificado-en", default="", help="Sobrescribe followup_derivation.coverage[0].verified_at.")
    args = parser.parse_args(argv)

    decisiones = aplicar_parametros(json.loads(Path(args.decisiones).read_text(encoding="utf-8")), args)
    originales = Path(args.originales).resolve()
    if not originales.is_dir():
        print(f"No existe la carpeta de originales: {originales}", file=sys.stderr)
        return 3
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    sufijo = (f"_{args.vinculos}" if args.vinculos != "contratos" else "") + (f"_{args.sensibilidad}" if args.sensibilidad else "")
    run_dir = Path(args.trabajo).resolve() / f"ejecucion_{stamp}{sufijo}"
    run_dir.mkdir(parents=True)
    (run_dir / "parametros_ejecucion.json").write_text(json.dumps({**vars(args), "originales": str(originales), "run_dir": str(run_dir),
        "protocolo_aplicado": decisiones["protocolo"]}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Carpeta de ejecución: {run_dir}")
    limite = PASOS.index(args.hasta)

    # 0. Integridad y entorno del motor.
    codigo, _ = motor(run_dir, "00_verify_code", ["--verify-code"])
    if codigo != 0:
        print("El archivo autónomo del motor no supera --verify-code.", file=sys.stderr)
        return 2
    codigo, salida = motor(run_dir, "00_check_env", ["check-env"])
    if codigo != 0 or '"software": "5.0.0"' not in salida:
        print("check-env no informa software 5.0.0; instale requirements.txt del motor en este intérprete.", file=sys.stderr)
        return 2

    # 1. Verificaciones previas.
    verificacion = verificar_bases.verificar(originales, decisiones, run_dir / "verificaciones")
    for h in verificacion["hallazgos"]:
        print(f"[verificar] {h['nivel']}: {h['base']}: {h['mensaje']}")
    if verificacion["bloqueante"]:
        print("Verificaciones previas bloqueantes; revise verificaciones/verificaciones_previas.json.", file=sys.stderr)
        return 3
    if limite < PASOS.index("derivar"):
        return 0

    # 2. Fuentes para el motor.
    manifest = derivar_fuentes.derivar(originales, decisiones, run_dir / "fuentes_motor", args.vinculos)
    for d in manifest["derivados"]:
        print(f"[derivar] {d['salida']}: {d['filas_salida']} filas de {d['filas_origen']} (regla {d['regla']})")
    if limite < PASOS.index("formularios"):
        return 0

    # 3. Formularios del motor + diligenciamiento.
    codigo, _ = motor(run_dir, "03_forms", ["forms", "--dir", str(run_dir / "fuentes_motor"), "--out", str(run_dir / "formularios"),
                                            "--company", decisiones["empresa"]])
    if codigo != 0:
        print("forms falló; vea logs/03_forms.log.", file=sys.stderr)
        return 2
    diligenciar_formularios(run_dir / "formularios", decisiones, {})
    print("[formularios] diligenciados desde decisiones_mapeo_asear.json")
    if not args.ratificado_por:
        print("\nLas reglas de derivación quedan con reviewed=false. Para configurar y ejecutar, ratifique las declaraciones:")
        for d in decisiones["declaraciones_que_ratifica_el_operador"]:
            print("  - " + d)
        print("y vuelva a ejecutar con --ratificado-por \"Nombre Apellido\" (opcionalmente --cobertura-fin/--verificado-en/--as-of).")
        return 5
    if limite < PASOS.index("configurar"):
        return 0

    # 4. configure
    config = run_dir / "config_asear.json"
    codigo, salida = motor(run_dir, "04_configure", ["configure", "--forms", str(run_dir / "formularios"), "--out", str(config)])
    if codigo != 0 or not config.exists():
        resultado = run_dir / "formularios" / "resultado_configuracion.json"
        if resultado.exists():
            for f in json.loads(resultado.read_text(encoding="utf-8")).get("findings", []):
                print(f"[configure] {f.get('code')} ({f.get('entry')}): {f.get('message')} → {f.get('resolution')}")
        print("Configuración bloqueada; corrija los formularios o las decisiones.", file=sys.stderr)
        return 3
    print(f"[configurar] {config}")
    if limite < PASOS.index("preparar"):
        return 0

    # 5. prepare
    codigo, _ = motor(run_dir, "05_prepare", ["prepare", "--config", str(config), "--out", str(run_dir / "preparacion")])
    estado = json.loads((run_dir / "preparacion" / "estado_ejecucion.json").read_text(encoding="utf-8"))
    print(f"[preparar] estado {estado.get('status')} (código {codigo})")
    if codigo != 0:
        for h in estado.get("findings", []):
            print("  - " + (h if isinstance(h, str) else json.dumps(h, ensure_ascii=False)))
        print("Preparación bloqueada; vea preparacion/LEER_PRIMERO.md y preparacion/preparacion/hallazgos_preparacion.csv.", file=sys.stderr)
        return codigo
    if limite < PASOS.index("ejecutar"):
        return 0

    # 6. run
    codigo, _ = motor(run_dir, "06_run", ["run", "--config", str(config), "--out", str(run_dir / "resultado")])
    estado = json.loads((run_dir / "resultado" / "estado_ejecucion.json").read_text(encoding="utf-8"))
    print(f"[ejecutar] estado {estado.get('status')} · modelo {estado.get('selected_model')} · horizontes {estado.get('predicted_horizons_months')} (código {codigo})")
    if limite < PASOS.index("informe"):
        return codigo

    # 7. informe
    destino = informe(run_dir, decisiones, args)
    print(f"[informe] {destino}")
    return codigo


if __name__ == "__main__":
    raise SystemExit(main())
