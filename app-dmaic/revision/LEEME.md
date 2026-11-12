# Registro de novedades para la revisión

`Registro_de_novedades_revision.xlsx` es el libro que se entrega a quien revise la
aplicación para que anote lo que encuentre.

Hojas:

- **Instrucciones** — qué es, cómo rellenarlo, qué significa cada severidad y cada
  tipo, y un ejemplo de novedad bien escrita.
- **Novedades** — una fila por hallazgo, con listas desplegables y numeración
  automática. Es la hoja principal.
- **Recorrido** — 44 puntos de comprobación guiada, por áreas, para no dejar zonas
  sin probar.
- **Herramientas** — las 78 herramientas de la app, para ir marcando las revisadas.
- **Resumen** — se calcula solo: totales por severidad, tipo, estado y módulo, y
  avance del recorrido.

## Regenerarlo

La lista de módulos y herramientas sale de la propia aplicación, no está escrita a
mano, así que hay que volver a extraerla cuando la app cambie:

1. Servir el HTML construido y volcar el inventario con Playwright a
   `inventario.json` (módulos y herramientas con su id, título y hoja Excel origen).
2. `python3 generar_registro.py`
3. Recalcular con LibreOffice para que las fórmulas queden con valor:
   `python3 <skill xlsx>/scripts/recalc.py Registro_de_novedades_revision.xlsx`

`inventario.json` se deja versionado para poder regenerar el libro sin levantar la app.
