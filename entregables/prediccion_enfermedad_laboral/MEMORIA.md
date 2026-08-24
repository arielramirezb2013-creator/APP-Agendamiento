# Memoria del proyecto · Modelo Predictivo de Enfermedad Laboral (EL)

**Última actualización:** 2026-08-24
**Estado:** V4.0 final auditada y entregada.
**Huella SHA-256 del código base (prefijo):** `6a5034724ff8c037`

Este documento es la memoria de trabajo del proyecto: qué se construyó, por qué, qué se
corrigió y qué contiene cada entregable. Es independiente del paquete Rehavid Operaciones
que vive en el resto de `entregables/`.

---

## 1. Objetivo final acordado con el usuario

Un **modelo predictivo** de enfermedad laboral que, para **tres horizontes de 12, 24 y
60 meses**, proyecte **qué patologías, qué cargos y qué centros de trabajo (sedes/ciudades)**
pueden presentar casos, con casos esperados e intervalos de confianza del 95 %.

Requisitos explícitos del usuario:

1. **Versátil**: ninguna organización tiene las mismas fuentes de información ni la misma
   estructura administrativa/distribución de ciudades → auto-descubrimiento y mapeo de
   fuentes heterogéneas, con override manual (`MANUAL_SOURCE_MAP`).
2. **Neutro**: el código no contiene años, cargos, ciudades ni empresas concretas; todo se
   aprende de los archivos de entrada (verificado por grep en la entrega final).
3. Ejecutable en **Python/Google Colab** o pegable en una **IA** para análisis.

## 2. Cronología

| Fase | Resultado |
|---|---|
| Revisión del código original (Anexo A del documento Word V3 del usuario) | V3 CORREGIDO (`v3/`), Anexo A del docx maestro actualizado |
| Pivote a modelo predictivo real ("¡No!… necesito un modelo predictivo") | Arquitectura V4: patologías × cargos × centros × horizontes |
| 2 rondas de revisión adversarial (Workflows multi-agente) + auditoría final | ~60 hallazgos evaluados; todos los confirmados corregidos (10 tandas de parches) |
| 5 validaciones end-to-end con datos sintéticos multi-patología | Última corrida: 0 errores; recuperación de patrones confirmada; sumas por patología = total global |
| Entrega de las dos versiones (Colab / IA) + dos documentos Word | Esta carpeta |

## 3. Entregables de esta carpeta

| Archivo | Qué es |
|---|---|
| `pipeline_prediccion_enfermedad_laboral_v4_PREDICTIVO.py` | **Fuente de verdad**: pipeline completo (3.603 líneas), V4.0 auditada |
| `VERSION_COLAB_por_celdas.py` | El mismo código dividido en 18 celdas con banners `CELDA N`, para pegar en Google Colab. Verificado idéntico byte a byte al .py (banners aparte) |
| `VERSION_PARA_IA.txt` | Encabezado de instrucciones para un asistente de IA (21 líneas) + el código completo. Verificado idéntico byte a byte |
| `word/Codigo_Google_Colab_Prediccion_EL_V4.docx` | Documento Word: instrucciones de uso + índice + las 18 celdas (código monoespaciado, fiel 1:1) |
| `word/Codigo_para_IA_Prediccion_EL_V4.docx` | Documento Word: instrucciones de uso + bloque único copiable (instrucciones IA + código, fiel 1:1) |
| `informe_predictivo_EJEMPLO_datos_sinteticos.md` | Ejemplo del informe que genera el pipeline (corrida con datos 100 % sintéticos) |
| `v3/` | Histórico: el código V3 corregido y el documento maestro V3 con el Anexo A actualizado |

## 4. Arquitectura V4 (resumen técnico)

- **Panel persona-mes** con censura por entidad (`last_observed_by_entity`) acotada por la
  cobertura temporal de la fuente `casos_el`; unidad analítica auto (persona / persona-mes /
  cargo-mes según datos disponibles).
- **8 fuentes** auto-descubiertas por palabras clave y puntuación: nómina, ausentismo común,
  ausentismo laboral, accidentalidad (AT), VEO, casos EL, riesgos por cargo, estructura;
  sinónimos canónicos de columnas (centro ≈ ciudad/municipio/regional/sucursal/planta/proyecto).
- **Targets futuros** por horizonte (`target_el_{h}m`) y por grupo de patología
  (`target_el_{h}m_pat_{g}`); taxonomía CIE-10 editable (`PATHOLOGY_GROUPS`): osteomuscular,
  auditiva, respiratoria, mental, dermatológica, otras. Clasificación en dos pasadas:
  prefijos CIE-10 primero, luego palabras clave con frontera de palabra.
- **Anti-fuga**: split temporal con purga (`_purge_overlapping_train_rows`: filas de train cuya
  ventana de outcome cruza el corte se descartan); validación interna temporal para elegir
  modelo/umbral (el test se toca una sola vez; nunca se selecciona por métricas de test);
  CV agrupada por entidad (StratifiedGroupKFold).
- **Proyecciones**: reconciliación proporcional (las probabilidades por patología se reescalan
  por persona para sumar la del modelo global); compuerta de calidad PR-AUC > prevalencia;
  casos esperados = Σp con IC 95 % (aproximación normal de Poisson-binomial); banderas de
  confiabilidad (`alta_probabilidad_calibrada` / `media_*` / `baja_solo_ranking_sin_conteo`);
  factores de horizonte por CDF empírica con suavizado de Laplace y cociente con tope 5.0.
- **Operación**: re-anclaje del umbral si la tasa de alerta supera 1.5× `DECISION_MAX_ALERT_RATE`;
  prioridades Alta/Media/Baja/`Caso_existente_seguimiento` (EL confirmada previa queda fuera del
  ranking, de los conteos esperados y de la equidad).
- **Gobernanza**: model card con reglas de interpretación y limitaciones conocidas; PSI de drift
  con bins adaptativos; curva de calibración; importancia por permutación; diagnóstico de equidad;
  informe `informe_predictivo.md` autocontenido y pegable en una IA.
- **Privacidad**: `PERSON_ID_HASH_SALT` de plantilla → `validate_privacy_config` lanza error;
  `person_key` = SHA-256 truncado (seudonimización, no anonimización); fecha de nacimiento
  eliminada; edad en bandas; CIE-10 agrupado.

## 5. Decisiones deliberadas (no son bugs)

- Un horizonte de 60 meses con ~8 años de datos queda `not_trained` a propósito (la purga exige
  ~2× el horizonte de historia); usa extrapolación/fallback transparente y queda marcado.
- El umbral operativo se elige en validación interna; si alerta de más en la población actual,
  se re-ancla al cuantil y queda logueado.
- Patología sin masa crítica o sin señal (PR-AUC ≤ prevalencia) → descomposición
  score global × mezcla histórica suavizada por cargo.
- `EXCLUDE_AFTER_FIRST_CONFIRMED_EL` solo aplica con unidad persona.
- sklearn con folds degenerados (1 clase) lanza un mensaje engañoso "n_classes >= 3"; el código
  lo captura, loguea y continúa.

## 6. Limitaciones conocidas (documentadas en el model card)

Look-ahead leve de atributos de roster/riesgo por cargo (se usa el estado más reciente para todo
el historial); un solo ciclo de contratación por persona; optimismo residual por solapamiento de
ventanas entre personas distintas; folds internos de `CalibratedClassifierCV` sin agrupar por
persona; la purga reduce el entrenamiento en horizontes largos.

## 7. Reglas de seguridad y uso (innegociables)

1. Reemplazar `PERSON_ID_HASH_SALT` por un secreto propio antes de ejecutar con datos reales
   (el pipeline se niega a correr con el valor de plantilla).
2. Los exports son seudonimizados, no anónimos: mismo control de acceso que datos identificables.
3. La salida **no** diagnostica, **no** califica origen (EPS/ARL/Juntas), **no** determina PCL y
   **no** se usa para decisiones disciplinarias ni de contratación.
4. El código entregado debe permanecer neutro (sin cargos/ciudades/años/empresas embebidos).

## 8. Verificaciones de la entrega final (2026-08-24)

- Las tres versiones (.py, Colab, IA) son **idénticas byte a byte** (script de reconstrucción:
  16 inserciones de banner removidas → igualdad exacta; versión IA = 21 líneas de encabezado +
  código exacto). `ast.parse` OK.
- Los dos .docx validados contra el esquema OOXML; los párrafos de código extraídos del Word
  coinciden 1:1 con las fuentes (3.628 y 3.624 párrafos respectivamente); el código extraído
  compila (`compile()` por celda y del bloque completo) y el conjunto de celdas 2–17 ejecuta
  sin errores en un subproceso.
- Verificación adversarial multi-agente (3 verificadores, 33 comprobaciones superadas):
  estructura OOXML (US Letter, estilo Code con Consolas y `xml:space="preserve"` en el 100 %
  de las líneas indentadas, campos de paginación reales, tablas DXA), veracidad de las
  instrucciones frente al código, y simulación de copy-paste desde Word. Se detectaron y
  corrigieron 3 imprecisiones de redacción en las instrucciones: conteo de líneas (3.604→3.603),
  la advertencia del salt ahora señala la Celda 18 (doc Colab) / Sección 15 (doc IA), y el
  paso 6 del doc Colab ahora ubica correctamente los CSV en `tables/` y el ZIP en `/content`
  (junto a la carpeta de salida). Nota: LibreOffice/pandoc no funcionan en el contenedor de
  trabajo, por lo que el render se validó vía conversión HTML (mammoth) + capturas en Chromium,
  no con PDF de Word.

## 9. Posibles siguientes pasos (no solicitados aún)

- Corrida piloto con datos reales de una organización y revisión del informe resultante.
- Ajuste de `PATHOLOGY_GROUPS` a la casuística propia (la taxonomía es editable).
- Programar re-entrenamiento periódico y monitoreo de drift/calibración con datos nuevos.
