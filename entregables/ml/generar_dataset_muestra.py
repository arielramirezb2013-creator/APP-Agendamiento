"""
Genera dataset sintético de muestra · 400 evaluaciones simuladas.

Útil para:
  - Probar el pipeline antes de que Rehavid entregue datos reales
  - Validar que el script funciona end-to-end
  - Demos para stakeholders

USO:
    python generar_dataset_muestra.py --output data/evaluaciones_muestra.csv --n 400

ATENCIÓN: estos datos son SINTÉTICOS · NO usar el modelo entrenado
sobre estos datos en producción. Es solo para validar la tubería.
"""
import argparse
import csv
import random
from pathlib import Path

SERVICIOS = ["Tumeke", "Xsens", "EMG", "Tobii", "GoPro", "Dinamómetro"]
CIUDADES = ["Bogotá", "Medellín", "Cali", "Funza", "Soacha", "Zipaquirá", "Urabá", "Antioquia", "Pasto", "Entrerrios"]
SECTORES = ["manufactura", "agroindustria", "servicios", "salud", "minería", "alimentos", "logística"]
JORNADAS = ["diurna", "nocturna", "rotativa"]
CLIENTES = [
    "Alpina", "Colanta", "Solla", "Mattelsa", "Sodexo", "Tennis",
    "Imbanaco", "Mineros", "Peldar", "Pronavicola", "Crystal",
    "El Retiro", "Cetelsa", "Linea Directa", "Ura Industries",
]


def generar_fila(rng: random.Random, i: int) -> dict:
    servicio = rng.choice(SERVICIOS)
    sector = rng.choice(SECTORES)
    jornada = rng.choice(JORNADAS)
    personas = rng.choice([1, 2, 3, 4, 5, 8, 10, 15, 20])
    antiguedad = rng.choice([0, 3, 6, 12, 24, 36, 48])

    # Generamos el target con una probabilidad que depende de las features
    # · simula que hay una relación real entre variables y resultado
    score = 0.18
    score += personas * 0.04
    if servicio in ("Xsens", "EMG"):
        score += 0.10
    if sector in ("manufactura", "agroindustria", "minería"):
        score += 0.12
    if jornada == "rotativa":
        score += 0.08
    if antiguedad <= 6:
        score += 0.05

    score = min(0.92, score)
    target = 1 if rng.random() < score else 0

    return {
        "id_estudio": f"E-{i:04d}",
        "servicio": servicio,
        "ciudad": rng.choice(CIUDADES),
        "cliente": rng.choice(CLIENTES),
        "sector": sector,
        "personas": personas,
        "jornada": jornada,
        "antiguedad_cliente": antiguedad,
        "hallazgo_msk": target,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--n", type=int, default=400)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    rng = random.Random(args.seed)
    filas = [generar_fila(rng, i) for i in range(args.n)]

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(filas[0].keys()))
        w.writeheader()
        w.writerows(filas)

    print(f"✓ Generadas {args.n} filas → {args.output}")
    pos = sum(1 for r in filas if r["hallazgo_msk"] == 1)
    print(f"  Positivos: {pos} ({pos/args.n*100:.1f}%) · Negativos: {args.n - pos}")


if __name__ == "__main__":
    main()
