#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Copia de una ejecución sólo los archivos agregados (sin registros individuales).

Lista blanca explícita: nunca se copian fuentes, derivados, datos canónicos,
correspondencia de personas, predicciones individuales ni modelos serializados.
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

LISTA_BLANCA = [
    "INFORME_RESUMEN.md", "parametros_ejecucion.json", "config_asear.json",
    "verificaciones/verificaciones_previas.json", "verificaciones/soporte_por_fecha_indice.csv",
    "fuentes_motor/manifest_derivacion.json",
    "formularios/plan_fuentes.csv", "formularios/plan_columnas.csv", "formularios/plan_estados.csv",
    "formularios/protocolo.json", "formularios/resultado_configuracion.json",
    "preparacion/LEER_PRIMERO.md", "preparacion/estado_ejecucion.json",
    "resultado/LEER_PRIMERO.md", "resultado/estado_ejecucion.json",
    "resultado/preparacion/preparacion_fuentes.json", "resultado/preparacion/hallazgos_preparacion.csv",
    "resultado/preparacion/procedencia_local.json",
    "resultado/analisis/informe.md", "resultado/analisis/model_result.json", "resultado/analisis/dictamen_predictivo.json",
    "resultado/analisis/paquete_para_ia_solo_esquema.json",
    "resultado/analisis/audit/config_used.json", "resultado/analisis/audit/issues.json",
    "resultado/analisis/audit/feasibility_scope.json", "resultado/analisis/audit/manifest.json",
    "resultado/analisis/audit/etapas_y_responsabilidades.json",
]
TABLAS = ["cohort_flow", "feasibility_by_horizon", "horizon_status", "followup", "event_status", "quality",
          "feature_missingness", "feature_dictionary", "candidate_status", "candidate_validation", "test_metrics",
          "calibration", "decision_curve", "etapas_y_responsabilidades", "inventory"]


def exportar(run_dir: Path, destino: Path) -> list[str]:
    copiados = []
    rutas = list(LISTA_BLANCA) + [f"resultado/analisis/tables/{t}.csv" for t in TABLAS]
    rutas += [p.relative_to(run_dir).as_posix() for p in (run_dir / "resultado" / "analisis" / "figures").glob("*.png")]
    rutas += [p.relative_to(run_dir).as_posix() for p in (run_dir / "logs").glob("*.log")]
    for relativo in rutas:
        origen = run_dir / relativo
        if origen.is_file():
            objetivo = destino / relativo
            objetivo.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(origen, objetivo)
            copiados.append(relativo)
    return copiados


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run", required=True)
    parser.add_argument("--destino", required=True)
    args = parser.parse_args(argv)
    copiados = exportar(Path(args.run).resolve(), Path(args.destino).resolve())
    print("\n".join(copiados))
    print(f"{len(copiados)} archivos copiados")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
