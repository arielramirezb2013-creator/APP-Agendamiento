# Herramientas del mapa de usuario

Regeneran `Mapa_de_usuario_y_validacion_Rehavid_v12.xlsx`:

```bash
pip install openpyxl matplotlib
python3 diagrama_v12.py     # dibuja el diagrama del proceso (PNG)
python3 construir_v12.py    # arma el Excel completo (11 pestañas)
```

`contenido_v12.py` tiene el mapa de usuario y las actividades por cargo;
`diagrama_v12.py` el contenido del diagrama (entradas, operación y salidas por paso).
