# -*- coding: utf-8 -*-
"""Diagrama del proceso · Rehavid Gestión de proyectos v16 (versión final).
Genera un PNG maquetado: por cada paso, qué se ingresa, qué opera la herramienta y qué sale."""
import textwrap
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

MORADO   = "#4125CF"
MORADO_O = "#2e1a99"
LILA     = "#ede9fc"
LILA_B   = "#c4bef5"
VERDE    = "#00C878"
VERDE_CL = "#e0faf2"
VERDE_O  = "#007a4a"
TINTA    = "#1a1a2e"
GRIS     = "#55557a"

PASOS = [
 ("PASO 0", "Alimentación por bases de Excel",
  "Base BI: Tableros BI, la llena el Gestor de Datos · Base de Diseño Ergonómico: la llena el Diseñador · Base General: demás productos y catálogos, la llena la gerencia",
  "Lee el libro .xlsx sin librerías externas · valida hojas, fechas y números · crea lo nuevo y actualiza lo que coincide, sin borrar · aplica contactos, hitos, seguimiento y catálogos · con activar = SI corre las 14 validaciones y genera las asignaciones por cargo",
  "Módulos poblados y proyectos activados, con resumen de carga y bitácora (RN-18)"),
 ("PASO 1-2", "Venta y registro",
  "Empresa, PPR y tipo (del catálogo) · productos con horas, tarifa y fecha solicitada · contactos del cliente · plan estimado · observaciones de la venta",
  "Bloquea vendedor, cargo y fecha al cargo en sesión · genera el código único del proyecto · suma horas y valor total",
  "Proyecto maestro en borrador, con sus productos y contactos"),
 ("PASO 3", "Validación y activación",
  "Orden de activar el proyecto",
  "Corre 14 validaciones: catálogo, fecha solicitada por producto, contactos completos, tecnología, complejidad, horas y duplicados · si alguna falla, bloquea",
  "Proyecto Activo, o la lista exacta de lo que falta"),
 ("PASO 4-5", "Asignación automática",
  "Ninguna: usa las reglas parametrizadas del motor (§8)",
  "Aplica la matriz por tipo y por categoría · crea la asignación de coordinación y una por producto · genera tareas y notificaciones por cargo",
  "Asignaciones «Pendiente de aceptación» y tareas en la bandeja"),
 ("PASO 6", "Aceptación y negociación",
  "Tiempo requerido, capacidad y fechas comprometidas · o propuesta de ajuste con justificación",
  "Contrasta la fecha solicitada con la capacidad · lleva el ciclo Pendiente → En ajuste → Aceptada · registra el historial · la dirección resuelve con 4 decisiones",
  "Asignaciones aceptadas, con fechas comprometidas"),
 ("PASO 7", "Requisitos e información",
  "Requisitos por producto · solicitud consolidada (fecha, medio, contacto, asistentes, evidencia) · respuestas con ubicación o nueva fecha comprometida",
  "Consolida los requisitos del proyecto en una sola solicitud al cliente · controla el estado de cada requisito · alerta los compromisos vencidos",
  "Información recibida, o pendiente con responsable y fecha de seguimiento"),
 ("PASO 8", "Plan de trabajo final",
  "Fechas, horas e hitos por producto · compromisos del cliente y de Rehavid · motivo de la versión",
  "Bloquea la aprobación si hay asignaciones sin resolver o productos sin fechas · advierte festivos y fines de semana · versiona conservando el histórico · compara contra el plan de venta",
  "Plan final versionado: la referencia operativa obligatoria"),
 ("PASO 9", "Ejecución y actualización",
  "Avances, horas, novedades (retraso, suspensión, bloqueo, reprogramación), próxima acción y actualización de hitos",
  "Recalcula avance y condición · desplaza fechas conservando la línea base · restringe la edición al cargo responsable · dispara las 12 alertas de gestión",
  "Panel al día por producto, y alertas con su acción directa"),
 ("PASO 10", "Completado y cierre del producto",
  "Fecha real de finalización, horas ejecutadas y entregable o evidencia",
  "Valida que todo requisito esté recibido o exceptuado, que el plan final esté aprobado y que la evidencia exista · si todo cumple, cierra sin acción manual",
  "Producto Cerrado, o alerta con lo que falta para cerrar"),
 ("PASO 11", "Cierre del proyecto maestro",
  "Ninguna: es automático",
  "Verifica que todos los productos del proyecto estén cerrados · consolida horas ejecutadas frente a vendidas y lo deja en bitácora",
  "Proyecto maestro Cerrado, con su consolidado"),
]

# ---- geometría ----
W = 100.0
BX0, BX1 = 1.5, 14.5          # insignia del paso
IN0, IN1 = 17.5, 41.5         # qué se ingresa
OP0, OP1 = 45.5, 71.5         # qué hace la herramienta
OU0, OU1 = 75.5, 98.5         # qué sale
WRAP_IN, WRAP_OP, WRAP_OU, WRAP_BD = 26, 30, 25, 14
LH  = 2.05                    # alto de línea
PAD = 2.6                     # margen interno vertical de cada caja
GAP = 4.6                     # separación vertical entre pasos
FS  = 9.2                     # tamaño de letra del contenido

def lineas(txt, ancho):
    out = []
    for parte in txt.split(" · "):
        out.extend(textwrap.wrap("• " + parte, ancho, subsequent_indent="   "))
    return out

filas = []
for badge, nombre, ent, ope, sal in PASOS:
    l_in, l_op, l_ou = lineas(ent, WRAP_IN), lineas(ope, WRAP_OP), lineas(sal, WRAP_OU)
    l_bd = textwrap.wrap(nombre, WRAP_BD)
    h = max(len(l_in), len(l_op), len(l_ou), len(l_bd) + 2) * LH + 2 * PAD
    filas.append((badge, l_bd, l_in, l_op, l_ou, h))

TOP = 14.0
alto_total = TOP + sum(f[5] for f in filas) + GAP * (len(filas) - 1) + 4
fig_h = alto_total / 7.2
fig, ax = plt.subplots(figsize=(13.4, fig_h), dpi=200)
ax.set_xlim(0, W); ax.set_ylim(0, alto_total)
ax.invert_yaxis(); ax.axis("off")
fig.subplots_adjust(left=0.005, right=0.995, top=0.995, bottom=0.005)

def caja(x0, x1, y0, h, fc, ec, lw=1.4, r=1.1):
    ax.add_patch(FancyBboxPatch((x0, y0), x1 - x0, h,
        boxstyle=f"round,pad=0,rounding_size={r}", fc=fc, ec=ec, lw=lw,
        mutation_aspect=(13.4 / W) / (fig_h / alto_total)))

def texto_caja(x0, x1, y0, h, lns, color, peso="normal"):
    cy = y0 + h / 2
    n = len(lns)
    for i, ln in enumerate(lns):
        yy = cy + (i - (n - 1) / 2) * LH
        ax.text((x0 + x1) / 2, yy, ln, ha="center", va="center",
                fontsize=FS, color=color, fontweight=peso, family="DejaVu Sans")

# ---- título y leyenda ----
ax.text(W / 2, 2.4, "REHAVID · GESTIÓN DE PROYECTOS v16 · EL FLUJO QUE HACE EL APP",
        ha="center", va="center", fontsize=15, fontweight="bold", color=MORADO)
ax.text(W / 2, 5.4, "La alimentación por bases de Excel y los once pasos del flujo (especificación 1.1) · qué se ingresa, qué opera la herramienta y qué sale",
        ha="center", va="center", fontsize=9.6, color=GRIS)
for (x0, x1, t, fc, tc) in [
    (IN0, IN1, "QUÉ SE INGRESA", LILA, MORADO_O),
    (OP0, OP1, "QUÉ HACE LA HERRAMIENTA", MORADO, "white"),
    (OU0, OU1, "QUÉ SALE", VERDE_CL, VERDE_O)]:
    caja(x0, x1, 7.6, 3.4, fc, MORADO if fc != VERDE_CL else VERDE, 1.6, 0.9)
    ax.text((x0 + x1) / 2, 7.6 + 1.7, t, ha="center", va="center",
            fontsize=10.2, fontweight="bold", color=tc)
ax.text((BX0 + BX1) / 2, 7.6 + 1.7, "PASO", ha="center", va="center",
        fontsize=10.2, fontweight="bold", color=GRIS)

# ---- filas ----
y = TOP
centros = []
for (badge, l_bd, l_in, l_op, l_ou, h) in filas:
    cy = y + h / 2
    centros.append((y, cy, h))
    # insignia
    caja(BX0, BX1, y, h, "white", MORADO, 1.6)
    nb = len(l_bd)
    ax.text((BX0 + BX1) / 2, cy - (nb / 2) * LH - 0.4, badge, ha="center", va="center",
            fontsize=10.5, fontweight="bold", color=MORADO)
    for i, ln in enumerate(l_bd):
        ax.text((BX0 + BX1) / 2, cy + (i - (nb - 1) / 2) * LH + 1.4, ln,
                ha="center", va="center", fontsize=8.6, color=GRIS)
    # cajas
    caja(IN0, IN1, y, h, LILA, LILA_B); texto_caja(IN0, IN1, y, h, l_in, TINTA)
    caja(OP0, OP1, y, h, MORADO, MORADO_O); texto_caja(OP0, OP1, y, h, l_op, "white")
    caja(OU0, OU1, y, h, VERDE_CL, VERDE); texto_caja(OU0, OU1, y, h, l_ou, VERDE_O)
    # flechas horizontales entrada → operación → salida
    for (a, b) in [(IN1, OP0), (OP1, OU0)]:
        ax.add_patch(FancyArrowPatch((a + 0.35, cy), (b - 0.35, cy),
            arrowstyle="-|>", mutation_scale=15, lw=1.7, color=MORADO_O))
    y += h + GAP

# ---- flechas verticales entre pasos (por el centro de la operación) ----
xm = (OP0 + OP1) / 2
for i in range(len(centros) - 1):
    y_fin_caja = centros[i][0] + centros[i][2]
    y_ini_sig  = centros[i + 1][0]
    ax.add_patch(FancyArrowPatch((xm, y_fin_caja + 0.3), (xm, y_ini_sig - 0.3),
        arrowstyle="-|>", mutation_scale=15, lw=1.7, color=VERDE_O))

OUT = "diagrama_v16.png"
fig.savefig(OUT, dpi=200, facecolor="white")
print("PNG:", OUT)
import PIL.Image
im = PIL.Image.open(OUT)
print("tamaño:", im.size)
