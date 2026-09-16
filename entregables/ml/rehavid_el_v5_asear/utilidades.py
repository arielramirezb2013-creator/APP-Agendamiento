#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Funciones compartidas por el pipeline ASEAR: hashes, supresión de celdas pequeñas, tablas."""
from __future__ import annotations

import hashlib
from pathlib import Path

import pandas as pd

import re

COLUMNAS_CONTEO = {"count", "n", "n_people", "n_events_total", "events_by_horizon", "known_event_free", "early_censored",
                   "events", "people", "at_risk_horizon", "training_at_risk_horizon", "training_events_by_horizon",
                   "activos", "elegibles", "prevalentes_excluidos", "eventos_totales_observables", "n_missing"}
PATRON_CONTEO = re.compile(r"^(eventos?_.*|elegibles_.*|n_.*|.*_events?|.*_people|con_vinculo|sin_vinculo)$")


def es_columna_conteo(nombre: str) -> bool:
    return nombre in COLUMNAS_CONTEO or bool(PATRON_CONTEO.match(str(nombre)))
COLUMNAS_ESTADISTICO = {"median_days", "min_days", "max_days"}


def sha256_archivo(path: Path) -> str:
    with Path(path).open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def suprimir_celdas(frame: pd.DataFrame, minimo: int = 5) -> pd.DataFrame:
    """Aplica la regla min_cell_count del motor: conteos 0 < n < mínimo se publican como '<mínimo'.

    En filas cuyo tamaño ``n`` queda suprimido también se suprimen sus estadísticos.
    """
    out = frame.copy()
    marca = f"<{minimo}"
    filas_suprimidas = pd.Series(False, index=out.index)
    for columna in [c for c in out.columns if es_columna_conteo(c)]:
        numero = pd.to_numeric(out[columna], errors="coerce")
        pequeno = numero.gt(0) & numero.lt(minimo)
        if columna in {"n", "n_people", "people"}:
            filas_suprimidas |= pequeno
        out[columna] = out[columna].astype(object)
        out.loc[pequeno, columna] = marca
    for columna in [c for c in out.columns if c in COLUMNAS_ESTADISTICO]:
        out[columna] = out[columna].astype(object)
        out.loc[filas_suprimidas, columna] = "suprimido"
    return out


def suprimir_dict(valor, minimo: int = 5):
    """Supresión recursiva de conteos pequeños en diccionarios anidados (para JSON agregados)."""
    if isinstance(valor, dict):
        return {k: suprimir_dict(v, minimo) for k, v in valor.items()}
    if isinstance(valor, bool):
        return valor
    if isinstance(valor, (int, float)) and 0 < valor < minimo and float(valor).is_integer():
        return f"<{minimo}"
    return valor


def formatear_celda(valor) -> str:
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return ""
    if isinstance(valor, float) and valor.is_integer():
        return str(int(valor))
    return str(valor)


def tabla_md(filas: list[dict]) -> str:
    if not filas:
        return "_(sin filas)_\n"
    campos = list(dict.fromkeys(k for fila in filas for k in fila.keys()))
    lineas = ["| " + " | ".join(campos) + " |", "|" + "---|" * len(campos)]
    for fila in filas:
        lineas.append("| " + " | ".join(formatear_celda(fila.get(c)) for c in campos) + " |")
    return "\n".join(lineas) + "\n"
