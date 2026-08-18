# Herramientas de generación

## Mapa de usuario y validación (v13)

Regeneran `Mapa_de_usuario_y_validacion_Rehavid_v13.xlsx`:

```bash
pip install openpyxl matplotlib pillow
python3 diagrama_v13.py     # dibuja el diagrama del proceso (PNG), incluido el paso 0
python3 construir_v13.py    # arma el Excel completo (11 pestañas)
```

`contenido_v13.py` tiene el mapa de usuario y las actividades por cargo (con el
paso 0 de guía y alimentación por bases); `diagrama_v13.py` el contenido del
diagrama (entradas, operación y salidas por paso). Los `_v12` se conservan como
evidencia de la ronda anterior.

## Bases de alimentación (v13)

`bases_v13.py` regenera los tres libros de `../bases/`:

```bash
pip install openpyxl
python3 bases_v13.py        # escribe Base_BI, Base_Diseno_Ergonomico y Base_General
```

Cada libro trae hoja de instrucciones, encabezados, fila de pistas, ejemplos y
listas desplegables. La aplicación los lee directamente desde
**09 Bases y auditoría → Cargar base de alimentación (Excel)**.
