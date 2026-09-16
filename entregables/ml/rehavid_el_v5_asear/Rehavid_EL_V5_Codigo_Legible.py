#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""REHAVID V5 — CÓDIGO COMPLETO VISIBLE PARA COPIAR Y EJECUTAR.

Este archivo es Python válido, también disponible con extensión .txt.
Contiene los mismos 25 archivos del motor V5, escritos como texto visible.
Cada bloque FUENTES[...] conserva un módulo o documento original completo.
Las comillas triples delimitan esos archivos: copie el contenido completo.
Al ejecutarlo, se reconstruye la carpeta del motor y se comprueba su integridad.
No se necesita el archivo Base64 ni otro ZIP. No genera bases empresariales.

1. Guarde todo este texto como Rehavid_EL_V5_Codigo_Legible.py, en UTF-8.
2. Compruebe integridad sin instalar bibliotecas:
   python Rehavid_EL_V5_Codigo_Legible.py --verify-code
3. Instale dependencias y compruebe el entorno:
   python Rehavid_EL_V5_Codigo_Legible.py install
   python Rehavid_EL_V5_Codigo_Legible.py check-env
4. Con una configuración revisada y fuentes accesibles:
   python Rehavid_EL_V5_Codigo_Legible.py run --config config_empresa.json --out resultado_nuevo

Para crear la configuración use forms y configure; para adaptar rutas antiguas,
relocate-config. Los comandos conservan el funcionamiento del motor V5.
La IA necesita intérprete Python y acceso a los originales de una sola empresa.
Pegar este texto en un chat no ejecuta automáticamente Python.

Sólo cambió la presentación del código; no cambiaron los modelos, datos,
criterios de entrenamiento o definición de predicción de EL a 12/36/60 meses.
"""

FUENTES = {}

# ARCHIVO 01 DE 25: Pronostico_EL_IA.py
FUENTES['Pronostico_EL_IA.py'] = r'''#!/usr/bin/env python3
"""Rehavid V5: fuentes empresariales, modelos y predicción EL a 12/36/60 meses."""
import argparse
import json
from pathlib import Path
import subprocess
import sys


def main(argv=None):
    parser=argparse.ArgumentParser(description='Rehavid V5: predicción de enfermedad laboral desde las fuentes de una empresa.')
    sub=parser.add_subparsers(dest='command',required=True)
    sub.add_parser('install',help='Instalar las dependencias declaradas en este intérprete.')
    sub.add_parser('check-env',help='Verificar Python e importaciones antes de procesar bases.')
    ingest=sub.add_parser('ingest',help='Cargar originales o un ZIP de una empresa conservando sus carpetas.')
    inputs=ingest.add_mutually_exclusive_group(required=True)
    inputs.add_argument('--dir',help='Carpeta que contiene sólo originales y opcionalmente su configuración.')
    inputs.add_argument('--files',nargs='+',help='Archivos originales o ZIP; nombres individuales únicos.')
    ingest.add_argument('--company',required=True)
    ingest.add_argument('--out',required=True,help='Carpeta nueva o vacía de originales importados.')
    for command in ['forms','suggest','discover']:
        p=sub.add_parser(command,help='Inventariar todas las fuentes; preparar asignaciones revisables.')
        p.add_argument('--dir',required=True)
        p.add_argument('--out',required=True)
        p.add_argument('--company',required=True)
        p.add_argument('--options',help='JSON con encabezados y formatos verificados por archivo/hoja.')
    cfg=sub.add_parser('configure',help='Construir configuración a partir de los formularios revisados.')
    cfg.add_argument('--forms',required=True)
    cfg.add_argument('--out',required=True,help='Ruta del archivo config_empresa.json que se creará.')
    relocate=sub.add_parser('relocate-config',help='Adaptar únicamente rutas a los originales cargados en esta sesión.')
    relocate.add_argument('--config',required=True)
    relocate.add_argument('--originals',required=True)
    relocate.add_argument('--company',required=True)
    relocate.add_argument('--out',required=True,help='JSON nuevo; conserva protocolo y mapeos.')
    for command in ['prepare','run']:
        p=sub.add_parser(command,help='Preparar datos y cohortes'+('; entrenar, evaluar y predecir.' if command=='run' else '.'))
        p.add_argument('--config',required=True)
        p.add_argument('--out',help='Carpeta nueva o vacía; se crea con fecha/hora si se omite.')
    status=sub.add_parser('status',help='Leer el diagnóstico preciso de una ejecución.')
    status.add_argument('--out',required=True)
    args=parser.parse_args(argv)
    here=Path(__file__).resolve().parent
    if args.command=='install':
        return subprocess.call([sys.executable,'-m','pip','install','-r',str(here/'requirements.txt')])
    try:
        if args.command=='ingest':
            from rehavid_el.ingest import import_company_files
            if args.dir:
                directory=Path(args.dir).resolve()
                if not directory.is_dir():
                    raise ValueError('No existe la carpeta de originales indicada.')
                paths=sorted(p for p in directory.rglob('*') if p.is_file() or p.is_symlink())
                if any(p.is_symlink() for p in paths):
                    raise ValueError('La entrada contiene enlaces; seleccione los originales reales.')
                uploaded={p.relative_to(directory).as_posix():p.read_bytes() for p in paths}
            else:
                paths=[Path(p) for p in args.files]
                if len({p.name.casefold() for p in paths})!=len(paths):
                    raise ValueError('Hay nombres repetidos. Use --dir o un ZIP con carpetas distintas.')
                if any(p.is_symlink() or not p.is_file() for p in paths):
                    raise ValueError('Seleccione archivos originales existentes, sin enlaces.')
                uploaded={p.name:p.read_bytes() for p in paths}
            result=import_company_files(uploaded,args.out,args.company)
            print(json.dumps(result,ensure_ascii=False,indent=2));return 0
        if args.command=='check-env':
            import importlib, platform
            from rehavid_el import __version__
            versions={name:importlib.import_module(module).__version__ for name,module in [('numpy','numpy'),('pandas','pandas'),('scikit-learn','sklearn'),('scikit-survival','sksurv')]}
            print(json.dumps({'python':platform.python_version(),'software':__version__,'packages':versions},indent=2));return 0
        if args.command=='relocate-config':
            from rehavid_el.portable import normalize_configuration
            result=normalize_configuration(args.config,args.originals,args.out,args.company)
            print(json.dumps(result,ensure_ascii=False,indent=2,default=str));return 0
        if args.command in ['forms','suggest','discover']:
            options=json.loads(Path(args.options).read_text(encoding='utf-8')) if args.options else None
            if args.command=='forms':
                from rehavid_el.configurator import export_forms
                result=export_forms(args.dir,args.out,args.company,options=options)
            elif args.command=='suggest':
                from rehavid_el.mapping import suggest_mapping
                result=suggest_mapping(args.dir,args.out,company=args.company,options=options)
            else:
                from rehavid_el.discovery import discover_sources
                result=discover_sources(args.dir,args.out,options=options)
            print(json.dumps(result,ensure_ascii=False,indent=2,default=str));return 0
        if args.command=='configure':
            from rehavid_el.configurator import build_config
            result=build_config(args.forms,args.out)
            print(json.dumps(result,ensure_ascii=False,indent=2,default=str))
            return 0 if result.get('status')=='configured' else 3
        if args.command=='status':
            state=json.loads((Path(args.out)/'estado_ejecucion.json').read_text(encoding='utf-8'))
        else:
            from rehavid_el.project import ProjectRun
            project=ProjectRun(args.config,args.out)
            state=project.run(prepare_only=args.command=='prepare')
            print('Resultado y motivos:',project.out/'LEER_PRIMERO.md')
        print(json.dumps(state,ensure_ascii=False,indent=2,default=str))
        return int(state['exit_code'])
    except Exception as exc:
        print(f'Ejecución detenida ({type(exc).__name__}): {exc}',file=sys.stderr)
        return 2

if __name__=='__main__':
    raise SystemExit(main())
'''

# ARCHIVO 02 DE 25: README.md
FUENTES['README.md'] = r'''# Rehavid V5 · Predicción de enfermedad laboral

Dos archivos con el mismo motor: `Pronostico_EL_Colab.ipynb` y `Pronostico_EL_IA_autonomo.py`. Cada uno incorpora el código y permite instalar sus bibliotecas. No tiene un modo demo ni genera bases.

Colab: abra el cuaderno, ejecute sus 17 celdas y cargue los originales de una empresa, sueltos o en ZIP. Aporte un JSON revisado o complete los formularios. El paso 14 entrena, selecciona y evalúa. El paso 17 descarga el resultado.

Python/IA: ejecute `install`, `check-env`, adapte fuentes con `forms` y `configure` —o `relocate-config` si ya existe un JSON revisado— y ejecute `run --config config_empresa.json --out resultado_nuevo`. La IA necesita un intérprete Python y acceso autorizado a los archivos. `prepare` por sí solo no entrena.

Compara Cox penalizado, bosque y boosting de supervivencia. Produce probabilidades de primer evento EL a 12, 36 y 60 meses cuando existe soporte. Los horizontes se evalúan por separado. Consulte estado, métricas e incertidumbre: ajustar un modelo no demuestra utilidad predictiva.

Consulte `docs/MANUAL.md`, `docs/FORMULARIOS_EMPRESA.md`, `docs/RESPONSABILIDADES.md` y la auditoría de la entrega. El código legible permite revisar los módulos. Las pruebas y sus registros de laboratorio se mantienen fuera de este paquete empresarial.
'''

# ARCHIVO 03 DE 25: docs/CONTRATO_DATOS.md
FUENTES['docs/CONTRATO_DATOS.md'] = r'''# Contrato de datos — Rehavid predictivo EL V4

Este contrato define campos, significado y transformaciones admitidas. Los nombres
canónicos son internos: una empresa no necesita entregar columnas llamadas
literalmente `followup` o `recorded_at`. Debe existir información equivalente cuyo
significado y disponibilidad se puedan defender. Un mapeo convierte nombres;
no crea evidencia clínica ni seguimiento.

Cada ejecución corresponde a **una empresa**, un desenlace explícito y horizontes
de 12, 36 y 60 meses. La salida es una probabilidad de primer evento EL verificado.
No estima la aparición biológica de una enfermedad no observada.

## 1. Fuentes y campos

| Fuente | Campos canónicos | Uso y controles |
|---|---|---|
| `employment`, esencial | `company`, `person_id`, `spell_id`, `start_date`, `end_date`, `recorded_at` | Vínculos laborales identificables. Un retiro vacío se interpreta como vínculo abierto; no debe representar un retiro desconocido. No se rellena con el cierre del estudio. |
| Atributos de empleo | `job`, `area`, `site` | Sólo se requieren las columnas seleccionadas en `employment_features`. Sus faltantes se tratan en el pipeline de entrenamiento. |
| Vigencia de empleo | `effective_from`, cuando corresponde | Si los atributos seleccionados cambian dentro del vínculo, su vigencia debe documentarse además de `recorded_at`. Un cambio conocido pero aún no efectivo no modifica el cargo histórico. |
| `outcomes`, esencial | `company`, `person_id`, `event_id`, `status`, `event_date`, `available_at` | Eventos y versiones. `status_map` traduce estados exactos revisados con medicina laboral; nunca confirma EL por coincidencia parcial de texto. |
| Grupo de enfermedad | `outcome_group`, cuando se solicita | Necesario si se configura un grupo. El último estado del evento se resuelve antes de filtrar su grupo. |
| `followup`, esencial, explícita o derivada bajo regla documentada | `company`, `person_id`, `obs_start`, `obs_end`, `verified_at` | Observación individual del desenlace. Debe cumplirse `obs_start <= obs_end <= verified_at`. Se unen intervalos adyacentes sin atravesar lagunas. |
| `health_events`, opcional | `company`, `person_id`, `event_id`, `event_date`, `available_at`, `source_kind`; `days` y `severity` opcionales | Antecedentes anteriores al índice. `source_kind` admite `ausentismo_comun`, `ausentismo_laboral`, `at` y `veo`. El modelo usa conteos y días, no severidad. |
| `exposures`, opcional | `company`, `person_id`, `start_date`, `end_date`, `available_at`, `exposure_name`, `exposure_value` | Mediciones numéricas, vigentes y disponibles, con nombre y unidad declarados en `exposure_features`. No se deducen del cargo. |

Empleo y seguimiento vacíos bloquean la preparación. Una tabla de eventos puede
estar vacía, sin que eso pruebe ausencia clínica de enfermedad; la suficiencia
para entrenar se comprueba posteriormente.

Sólo `company` y `source_kind` admiten constantes explícitas. No se aceptan
constantes para fechas, eventos, personas ni seguimiento. Si se utiliza una
constante de empresa, debe verificarse previamente que todo el archivo pertenece
a ella: esa constante no comprueba la procedencia de las filas.

## 2. Predictores mínimos y opcionales

Las plantillas V4 incluyen este bloque; no es una configuración completa:

```json
{
  "employment_features": ["tenure_years"],
  "exposure_features": {},
  "sources": {
    "health_events": {"enabled": false},
    "exposures": {"enabled": false}
  }
}
```

`tenure_years` se calcula a partir del inicio del vínculo vigente; no requiere
una columna original de antigüedad ni suma reingresos. Pueden seleccionarse
`job`, `area` y `site` si sus valores históricos son defendibles. Los atributos
no seleccionados quedan fuera del modelo y no bloquean la preparación aunque
una plantilla anterior conserve sus mapeos. Si se selecciona un atributo cuya
columna mapeada no existe, sí se registra un error.

Con `health_events.enabled=false` no se crean predictores de antecedentes.
Con la fuente habilitada se crean indicadores de cobertura, conteos y días por
tipo y ventana. Declarar `exposure_features` con `exposures.enabled=false` es una
inconsistencia que requiere corrección explícita.

Antigüedad sola es una especificación mínima comprobable, no una garantía de
entrenamiento ni buen desempeño; necesita variación y evaluación. Otras variables
requieren ampliar el contrato y justificar su disponibilidad y pertinencia.

**Compatibilidad:** si una configuración anterior omite `employment_features`,
conserva `job`, `area`, `site` y `tenure_years`. Pasar a la selección mínima es una
decisión explícita, no una modificación automática para conseguir un ajuste.

## 3. Múltiples archivos, hojas y mapeos

`sources.<fuente>.inputs` admite un objeto por archivo y hoja, cada uno con sus
opciones. Las rutas relativas se resuelven desde la carpeta del JSON original.
La alternativa `path` acepta una ruta o lista de rutas que comparten mapeo.

Ejemplo estructural para colocar dentro de `sources`. Los textos entre `<...>`
son marcadores que deben reemplazarse con información verificada; no describen
archivos de una empresa y el bloque no está listo para ejecutarse:

```json
{
  "employment": {
    "enabled": true,
    "inputs": [
      {
        "path": "<RUTA_ARCHIVO_ORIGINAL_1.xlsx>",
        "sheet": "<NOMBRE_EXACTO_HOJA_1>",
        "header": 0,
        "date_format": "ISO8601",
        "constants": {"company": "<MISMA_EMPRESA_QUE_CONFIG_COMPANY>"},
        "columns": {
          "person_id": "<COLUMNA_ORIGINAL_IDENTIFICADOR>",
          "spell_id": "<COLUMNA_ORIGINAL_VINCULO>",
          "start_date": "<COLUMNA_ORIGINAL_INGRESO>",
          "end_date": "<COLUMNA_ORIGINAL_RETIRO>",
          "recorded_at": "<COLUMNA_ORIGINAL_DISPONIBILIDAD_VERIFICADA>"
        }
      },
      {
        "path": "<RUTA_ARCHIVO_ORIGINAL_2.xlsb>",
        "sheet": "<NOMBRE_EXACTO_HOJA_2>",
        "header": 1,
        "date_format": "%d/%m/%Y",
        "constants": {"company": "<MISMA_EMPRESA_QUE_CONFIG_COMPANY>"},
        "columns": {
          "person_id": "<OTRA_COLUMNA_IDENTIFICADOR>",
          "spell_id": "<OTRA_COLUMNA_VINCULO>",
          "start_date": "<OTRA_COLUMNA_INGRESO>",
          "end_date": "<OTRA_COLUMNA_RETIRO>",
          "recorded_at": "<OTRA_COLUMNA_DISPONIBILIDAD_VERIFICADA>"
        },
        "date_formats": {
          "start_date": {
            "kind": "excel_serial",
            "origin": "<ORIGEN_EXCEL_VERIFICADO_AAAA-MM-DD>"
          },
          "recorded_at": "%d/%m/%Y"
        }
      }
    ]
  }
}
```

`columns` siempre tiene dirección **campo canónico → columna original**.
`header=0` y `header=1` ilustran encabezados en la primera y segunda fila física;
se debe verificar la fila de cada hoja. Una entrada hereda opciones comunes,
pero su objeto `columns`, si se declara, sustituye completamente el mapeo común.
No concatene todas las hojas: pueden ser copias, resúmenes o versiones repetidas.

Para CSV/TSV pueden declararse `sep` y `encoding`; los valores predeterminados
son coma para CSV, tabulador para TSV y `utf-8-sig`. Los identificadores se leen
como texto y conservan sus ceros iniciales.

### Identificadores y vínculos

`person_id` debe identificar a la misma persona entre fuentes. Se eliminan
espacios exteriores, sin borrar letras globalmente. Una equivalencia por prefijo
literal utiliza `person_id_normalization` con `strip_prefix`, `reviewed=true` y
`evidence_ref`. Se rechazan colisiones detectadas dentro de una entrada; la
conciliación entre sistemas sigue requiriendo una llave maestra.

Si no existe identificador contractual, puede omitirse el mapeo de `spell_id` y
declarar `spell_key_fields` con al menos los campos canónicos `person_id` y
`start_date`. El motor genera una clave determinista; no crea contratos. Esa
combinación debe identificar realmente el mismo vínculo en todos sus registros.
Si varios vínculos comparten la combinación, se necesita una llave más precisa.

### Fechas heterogéneas

`date_format` es el formato común de una entrada. `date_formats` lo reemplaza por
campo **canónico**. Se admiten fechas textuales y seriales Excel en columnas
diferentes con formatos explícitos. El origen del serial debe verificarse en el
archivo; no se adivina el sistema de fechas. Una columna declarada serial que
mezcle números con texto produce un hallazgo: se deben separar o normalizar esas
versiones bajo una regla documentada.

Las fechas se normalizan al día; no se resuelven eventos intradía. Un evento en
la fecha índice se considera previo. La fecha de exportación no se convierte en
disponibilidad histórica, ni la última modificación en diagnóstico por defecto.

## 4. Disponibilidad contractual

El modo predeterminado utiliza una columna equivalente a `recorded_at`:

```json
{
  "contract_availability": {
    "mode": "explicit",
    "reviewed": false,
    "evidence_ref": "",
    "rationale": ""
  }
}
```

`recorded_at` indica cuándo la información contractual era utilizable. Los
metadatos de revisión del modo explícito no reemplazan la columna. Asignar a toda
la nómina una fecha de extracción actual puede dejar vacías las cohortes históricas:
es un hallazgo sobre disponibilidad, no una prueba de imposibilidad de modelación.

La alternativa `documented_contract_start` sólo admite
`employment_features=["tenure_years"]`. Exige evidencia revisada de que el inicio
documentado del vínculo puede utilizarse como disponibilidad de ese dato. No
autoriza retrofechar cargo, área, sede, antecedentes, exposición ni desenlaces.

La preparación deriva `recorded_at=start_date` **sólo si se omite `recorded_at`
de `columns`**. Si sigue mapeado a una columna inexistente o vacía, no se sustituye.
La regla tampoco elimina `effective_from`: no mapee la vigencia de un cargo
actual como vigencia contractual si ese significado no corresponde.

## 5. Seguimiento explícito o derivación documentada

Con `followup_derivation.mode="none"` se requieren intervalos individuales
explícitos, aunque sus campos originales se llamen de otra manera. Una persona
sin EL registrada **no equivale** a una persona observada y libre del evento.
Nómina, ausentismo o fechas extremas de casos no prueban por sí solos captura del
desenlace en toda la población.

`employment_intersect_registry` combina vínculos con cobertura de un registro
**sólo cuando se ha comprobado que ese registro observa a la población durante
el vínculo**. No debe activarse porque sólo se entregaron nómina y una lista de
enfermos.

Bloque completo de ambas reglas alternativas. Está deliberadamente pendiente de
revisión: contiene marcadores y valores `false`, no evidencia ni autorización:

```json
{
  "employment_features": ["tenure_years"],
  "contract_availability": {
    "mode": "documented_contract_start",
    "reviewed": false,
    "evidence_ref": "<REFERENCIA_A_EVIDENCIA_DE_DISPONIBILIDAD_CONTRACTUAL>",
    "rationale": "<JUSTIFICACION_REVISADA_DEL_USO_DE_LA_FECHA_DE_INICIO>"
  },
  "followup_derivation": {
    "mode": "employment_intersect_registry",
    "reviewed": false,
    "evidence_ref": "<REFERENCIA_A_EVIDENCIA_DE_COBERTURA_DEL_REGISTRO>",
    "rationale": "<JUSTIFICACION_REVISADA_DE_LA_POBLACION_OBSERVADA>",
    "employment_implies_registry_observation": false,
    "coverage": [
      {
        "start": "<INICIO_COBERTURA_AAAA-MM-DD>",
        "end": "<FIN_COBERTURA_AAAA-MM-DD>",
        "verified_at": "<FECHA_VERIFICACION_AAAA-MM-DD>"
      }
    ]
  },
  "sources": {
    "followup": {"enabled": false}
  }
}
```

Integre el bloque conservando las demás fuentes de la configuración. Las reglas
son independientes: puede mantener disponibilidad explícita y derivar sólo
seguimiento, o usar disponibilidad contractual documentada con seguimiento
explícito. Cada regla activada exige su evidencia y revisión propias.

Para derivar, deshabilite conscientemente la fuente explícita `followup`; no se
aceptan al tiempo su fuente habilitada con archivos y una derivación. La regla
`coverage` utiliza `start`, `end`, `verified_at`, con fechas ISO verificadas y
`start <= end <= verified_at <= as_of`. El CSV resultante utiliza `obs_start`,
`obs_end` y `verified_at`.

Se toma el máximo entre inicio del vínculo e inicio de cobertura y el mínimo
entre fin del vínculo y fin de cobertura. Para vínculos abiertos se utiliza el
fin de cobertura, sin inventar retiro. Las lagunas se conservan. Una verificación
posterior a un cierre histórico no acredita disponibilidad en aquel cierre;
la construcción de cohortes también respeta `verified_at`.

`reviewed=true` y las referencias son declaraciones humanas. El software verifica
estructura y coherencia; no comprueba automáticamente el contenido de documentos
clínicos o certificaciones. Cambiar indicadores a `true` sin evidencia no resuelve
una carencia de datos.

## 6. Evento, estados y seguimiento incompleto

`outcome_name` debe precisar evento, población, criterio de confirmación y fecha.
`outcome_date_basis` admite `final_decision` o `verified_diagnosis`. Una futura
decisión de origen y un diagnóstico verificado son objetivos distintos; la
definición elegida debe ser consistente entre fuentes y períodos de la empresa.

`status_map` traduce estados exactos a `confirmed`, `pending`, `suspected`,
`rejected` o `unknown`, e incluye al menos una equivalencia confirmada. Normaliza
espacios y mayúsculas, sin deducir estados por palabras sueltas. Un reporte no se
convierte automáticamente en confirmación.

Se excluyen confirmados previos y sospechas, pendientes o estados desconocidos
conocidos en el índice, aunque después se descarten. La resolución futura no
cambia la elegibilidad inicial. Eventos anteriores conocidos tardíamente se
excluyen y cuentan aparte, sin convertirlos en incidencia futura; debe revisarse
el sesgo de detección.

Un confirmado posterior cuenta aunque ocurra antes de completar el horizonte.
Estados inciertos posteriores aún no resueltos al cierre limitan el seguimiento
antes de su fecha. Esa censura puede ser informativa; el motor no elimina dicho
sesgo. La ausencia de enfermedad previa sólo es defendible dentro de la historia
observada y documentada.

`available_at` debe ser igual o posterior a `event_date`. Controla qué estado
era conocido en cada cierre. `label_maturation_days` recorta el seguimiento para
tratar retrasos documentados de adjudicación; cero es su valor predeterminado,
no una recomendación universal ni corrección automática del subregistro.

## 7. Cobertura de antecedentes y exposición

Para interpretar como cero un conteo de antecedentes, la fuente debe declarar
`coverage_start`, `coverage_end`, `available_through` y `covered_kinds`. Además,
el vínculo debe abarcar la ventana retrospectiva. Si no se cumple, conteos y días
quedan ausentes y la cobertura vale cero. Los límites de una muestra del inventario
no demuestran cobertura.

Si no existen `days` o `severity`, omita sus claves de `columns`: un atributo
opcional ausente conserva faltantes; una columna declarada pero inexistente produce
error. Si algún valor de días de la ventana es desconocido, su suma queda ausente.
No se utiliza una duración final conocida después del índice como antecedente.

Para exposición se toma la última medición vigente y disponible. Cada predictor
de `exposure_features` exige un nombre interno seguro, `name` y `unit`; la falta
de medición permanece ausente. Esos predictores no acreditan por sí solos causalidad
ni origen laboral.

## 8. Diseño, ejecución y resultados

V4 declara `validation_design="person_holdout"` con fechas vacías: el responsable
debe definirlas antes de evaluar. Exige `train = validation = test < as_of` y
`score = as_of`. Las personas se separan determinísticamente, por defecto en
60/20/20. Se entrena en train, selecciona en validation y evalúa el modelo congelado
en test. Es validación interna; no acredita otro período ni otra empresa.

La alternativa temporal exige `train < validation < test < as_of` y
`test <= score <= as_of`. Utiliza cierres consecutivos y puede repetir personas,
salvo `split_mode="temporal_disjoint"`. El seguimiento necesario en cada tramo
depende del horizonte. Exigir varios tramos largos es una consecuencia de esta
implementación temporal, no una exigencia universal de supervivencia.
Configuraciones anteriores sin `validation_design` conservan diseño temporal.
No se buscan fechas, semillas o particiones para conseguir resultados.

La preparación conserva originales, convierte entradas, registra procedencia y
produce `preparacion/config_canonica.json` sólo si logra preparar su estructura.
La limpieza posterior elimina duplicados exactos, rechaza versiones contradictorias
y verifica enlaces e intervalos. Se imputan predictores únicamente en entrenamiento;
nunca desenlaces, identificadores ni tiempos observados.

Consola y Colab usan `ProjectRun.prepare_inputs()`, `clean()`, `organize()`,
`assess()`, `train()` y `finish()`. `prepare` llega hasta evaluar soporte; `run`
continúa con ajuste, selección y evaluación. Se exigen carpetas de salida nuevas
para conservar ejecuciones previas.

`estado_ejecucion.json` y `LEER_PRIMERO.md` indican fase alcanzada, bloqueos,
modelo seleccionado y horizontes con predicciones. Las tablas detalladas están
en `analisis/tables/`; las probabilidades individuales son valores 0–1 con estado
y motivo por horizonte. Lo no estimable queda ausente, no cero. El resultado de
los candidatos se conserva en `analisis/model_result.json`. Estos estados
describen ejecución; no certifican validez clínica, utilidad ni tamaño muestral.

Los contadores distinguen registros cargados, disponibles, efectivos, vínculos
conocidos, personas activas y elegibles. No sume registros como si fueran personas
independientes. La matriz de etapas diferencia ejecución de revisión profesional.
`release.predeclared_criteria` documenta el protocolo; no aprueba uso clínico.

Los CSV canónicos conservan identificadores para integración local. Las salidas
predictivas usan HMAC y siguen siendo sensibles. `REHAVID_EL_SALT` permite mantener
la clave fuera de archivos; si no se proporciona, cambia entre ejecuciones. El
motor no envía datos a proveedores de IA. Los paquetes de esquema no contienen
registros individuales; datos canónicos y modelos serializados necesitan accesos
gestionados por la organización.

La correspondencia local entre `person_key`, `person_id` y `company` se guarda en
`analisis/privado/correspondencia_personas.csv` para vincular resultados con los
trabajadores de esa ejecución. No se incorpora al paquete de esquema para IA ni
al informe general. Es un archivo identificable y sensible, sujeto a los accesos
definidos por la empresa.

**Fuente del contrato:** comportamiento implementado en `config.py`,
`preparation.py`, `data.py`, `cohort.py`, `project.py` y `models.py` de V4.


## Reglas reforzadas en V4

El cierre nunca puede estar en el futuro. La configuración no admite una bandera para eludir esta regla. Se exige formato ISO estricto en el protocolo. Si una empresa está mapeada en la fuente, una constante no puede ocultar valores contradictorios. El seguimiento derivado utiliza la versión de cada contrato conocida al verificar cada intervalo y conserva trazabilidad de ambas fuentes. La interfaz no genera registros.
'''

# ARCHIVO 04 DE 25: docs/FORMULARIOS_EMPRESA.md
FUENTES['docs/FORMULARIOS_EMPRESA.md'] = r'''# Configurar los archivos de una empresa

El configurador convierte decisiones revisadas en una configuración ejecutable.
Inventaría todas las hojas y permite seleccionar varias entradas por fuente.
El entrenamiento y la evaluación se ejecutan después con el motor común.

## 1. Reunir los originales

Coloque los Excel, CSV u otros formatos admitidos de **una sola empresa** en una
carpeta. Conserve los archivos originales. Si están en OneDrive o SharePoint
privados, descárguelos mediante su acceso autorizado y súbalos a Colab o al
entorno de Python de la IA. Un enlace a la página de la carpeta o su HTML no
contiene necesariamente los libros; este código no elude la autenticación.

## 2. Crear los formularios

Después de instalar y cargar el motor, ejecute:

```python
from rehavid_el.configurator import export_forms, build_config

formularios = export_forms(
    directory="/ruta/originales_empresa",
    output="/ruta/formularios_empresa",
    company="NOMBRE_EXACTO_EMPRESA",
)
print(formularios["paths"])
```

Las rutas deben existir en su entorno. En Colab normalmente comienzan con
`/content/`. La salida no debe ser la misma carpeta que los originales. Si
existen formularios diligenciados, continúe editándolos: no se sobrescriben.

Abra los CSV con **Datos → Desde texto/CSV**, separador **coma**, codificación
**UTF-8** y columnas de tipo **Texto**. Así conserva valores literales, espacios
de encabezados y ceros iniciales. Guarde como CSV UTF-8 con coma.

| Archivo | Qué diligenciar |
|---|---|
| `plan_fuentes.csv` | `usar=SI`, `revisado=SI`, `fuente`, archivo y hoja exacta de cada entrada seleccionada. |
| `plan_columnas.csv` | Para esa `entrada_id` y `fuente`, escriba el encabezado exacto en `columna_original` y el formato de cada fecha. |
| `plan_estados.csv` | Estado literal del original, estado canónico y revisión de cada equivalencia. |
| `protocolo.json` | Empresa, desenlace, definición de su fecha, cortes temporales, predictores y evidencia de cobertura. |

## 3. Seleccionar fuentes y columnas

`fuente` admite `employment` (historia contractual), `outcomes` (casos del
desenlace), `followup` (observación individual), `health_events` (antecedentes) y
`exposures`. Las dos últimas son opcionales. Marque todas las entradas que
correspondan: **varios archivos u hojas pueden pertenecer a la misma fuente**.
El programa no elige la primera hoja.

`encabezado` comienza en cero: si los títulos están en la tercera fila, escriba
`2`. Ajuste `separador` y `codificacion` cuando corresponda. Para usar una hoja en
dos fuentes, duplique su fila con otra `entrada_id` y duplique también sus filas
de `plan_columnas.csv`; asigne una fuente a cada entrada.

`candidatos_revisar` contiene sugerencias por encabezado y nunca se aplica sola.
`valor_constante` sólo permite `company` y `source_kind`, cuando su procedencia
lo acredita; no permite inventar fechas, identificadores, estados ni eventos.

Cada fecha mapeada requiere `formato_fecha`, por ejemplo `ISO8601`, `%d/%m/%Y` o
`%Y-%m-%d`. Para números seriales: `excel_serial` y `origen_excel` verificado en
formato `AAAA-MM-DD`. No deduzca el origen por la apariencia de los números.

## 4. Revisar el protocolo y el desenlace

Medicina laboral debe definir el evento y sus estados. `plan_estados.csv`
admite `confirmed`, `pending`, `suspected`, `rejected` y `unknown`, con
`revisado=SI` en cada asignación. No hay equivalencias clínicas predefinidas.

En `protocolo.json`, `outcome_date_basis` admite `final_decision` o
`verified_diagnosis`, según el evento documentado. Las fechas son `AAAA-MM-DD`:

- `person_holdout`: `train=validation=test < as_of` y `score=as_of`.
- `temporal`: `train < validation < test < as_of` y `test <= score <= as_of`.

Seleccione `employment_features` entre `tenure_years`, `job`, `area` y `site`
según los históricos disponibles. Documente cobertura de fuentes utilizadas
en `source_metadata`; para antecedentes, también sus `covered_kinds`.
Mantenga las reglas de derivación desactivadas salvo evidencia verificable
conforme al manual. La nómina por sí sola no acredita seguimiento del desenlace.

Tras revisar todos los mapeos, escriba `mapping_reviewed=true`. Las marcas de
revisión registran decisiones del operador; no certifican revisión independiente.

## 5. Construir y revisar el resultado

```python
resultado = build_config(
    forms_dir="/ruta/formularios_empresa",
    output_json="/ruta/config_empresa.json",
)
print(resultado["status"])
for hallazgo in resultado["findings"]:
    print(hallazgo["code"], hallazgo["message"], hallazgo["resolution"])
```

`configured` significa **configuración construida, todavía sin entrenamiento**.
Use `resultado["config_path"]` para preparar y ejecutar el motor.
`blocked` devuelve correcciones específicas en `resultado_configuracion.json`;
no crea una configuración ejecutable. Una configuración de destino existente
no se sobrescribe: use otro nombre para conservar el historial.

Después de preparar los datos, el motor comprueba cohortes, eventos,
seguimiento y evaluación antes de publicar predicciones a 12, 36 y 60 meses.
'''

# ARCHIVO 05 DE 25: docs/INGESTA_ORIGINALES.md
FUENTES['docs/INGESTA_ORIGINALES.md'] = r'''# Carga de originales de una empresa

La V5 acepta archivos sueltos o un ZIP de originales y conserva sus subcarpetas. La carga no transforma el contenido. Los formatos admitidos son `.xlsx`, `.xlsm`, `.xls`, `.xlsb`, `.csv`, `.tsv` y `.parquet`. Se puede incluir un único JSON de configuración cuyo campo `company` coincida exactamente con la empresa declarada.

En Colab, la entrada al importador es el resultado de `files.upload()`. En Python se usa un diccionario de nombres relativos y bytes:

```python
from pathlib import Path
from rehavid_el.ingest import import_company_files

fuentes = Path("/ruta/a/originales_empresa")
# Seleccione una carpeta que contenga exclusivamente los originales de esta empresa.
# El destino debe ser nuevo o estar vacío y fuera de esa carpeta.
entradas = {
    archivo.relative_to(fuentes).as_posix(): archivo.read_bytes()
    for archivo in fuentes.rglob("*")
    if archivo.is_file()
}
manifest = import_company_files(
    entradas,
    Path("/ruta/a/nueva_ejecucion/originales"),
    company="NOMBRE EXACTO DE LA EMPRESA",
)
print(manifest["source_count"])
print(manifest["manifest_path"])
```

Para un ZIP:

```python
zip_originales = Path("/ruta/bases_empresa.zip")
manifest = import_company_files(
    {zip_originales.name: zip_originales.read_bytes()},
    Path("/ruta/a/nueva_ejecucion/originales"),
    company="NOMBRE EXACTO DE LA EMPRESA",
)
```

El resultado registra el archivo de origen, la entrada dentro del ZIP, la ruta relativa conservada, la ruta de destino, el tamaño y el SHA-256 de cada archivo. Registra por separado el SHA-256 del ZIP. Si existe configuración, `configuration_path` permite pasarla a la normalización de rutas del motor.

Si el ZIP contiene resultados anteriores, documentos u otro formato no admitido, la carga se detiene antes de guardar sus archivos. Seleccione los originales necesarios o cree otro ZIP que sólo los contenga. El importador no decide automáticamente que una tabla de predicciones sea una fuente histórica. Los metadatos de macOS (`__MACOSX`, `.DS_Store`) se omiten y quedan registrados.

No se sobrescriben archivos existentes. Dos archivos `2024/base.csv` y `2025/base.csv` se conservan por separado. Dos entradas que pretendan ocupar la misma ruta, incluso con cambios sólo de mayúsculas o representación Unicode, requieren selección explícita. El límite predeterminado es 2 GiB descomprimidos y 10.000 archivos; puede ajustarse al llamar al importador si el equipo dispone de los recursos necesarios.

**Alcance de la comprobación:** el nombre de un archivo, una carpeta o un hash no demuestra a qué empresa pertenecen sus registros. La carga registra la empresa declarada y comprueba la coincidencia del JSON cuando existe. La comprobación de las columnas empresariales ocurre después, al preparar y limpiar las fuentes. No se acredita seguimiento clínico, ausencia de enfermedad ni entrenabilidad en esta etapa.
'''

# ARCHIVO 06 DE 25: docs/MANUAL.md
FUENTES['docs/MANUAL.md'] = r'''# Rehavid V5 para predicción de enfermedad laboral

Esta entrega procesa las bases aportadas por una empresa. No crea personas, eventos ni períodos de seguimiento. Construye cohortes, ajusta modelos de supervivencia, selecciona con validación y evalúa una prueba reservada antes de generar predicciones de primer evento EL a 12, 36 y 60 meses cuando hay soporte.

## Archivos de la entrega

- `Pronostico_EL_IA_autonomo.py`: ejecutable completo para una IA que disponga de Python o para consola. El mismo archivo permite extraer su código legible.
- `Pronostico_EL_Colab.ipynb`: instrucciones y código por pasos para Google Colab.
- Ambos archivos incorporan el mismo motor. Colab no requiere cargar otro archivo de código.
- `Rehavid_Motor_EL_V5.zip`: copia opcional del motor para inspección o uso modular.
- Paquete completo: ejecutables, código legible, instrucciones, auditoría y verificación. No contiene bases empresariales ni generadores de datos de prueba. Las celdas vigentes están en el cuaderno; no se incluye un Word V5.


Python 3.12 fue el entorno verificado; use las versiones declaradas en `requirements.txt`. La instalación necesita acceso al repositorio de paquetes. No requiere una clave de una IA comercial. Una IA sin intérprete de Python puede revisar la configuración pero no ejecutar ni afirmar entrenamiento.

## Flujo para una empresa

1. Reúna los Excel/CSV/Parquet originales en una carpeta propia. Un enlace privado de OneDrive necesita acceso autorizado y descarga de los archivos; el motor no utiliza una página HTML de navegación como si fuera una base.
2. Instale dependencias y compruebe el entorno.
3. Genere formularios de fuentes y columnas. Revise todas las hojas, no sólo la primera.
4. Complete los formularios y el protocolo con los significados que realmente tienen los datos. Puede hacerlo con apoyo de una IA que examine los originales.
5. Construya la configuración. El diagnóstico enumera incidencias; construir la configuración todavía no entrena.
6. Prepare fuentes y cohortes. Examine enlaces, duplicados, fechas, exclusiones y soporte por horizonte.
7. Ejecute entrenamiento, selección, evaluación y predicción. Revise `LEER_PRIMERO.md` antes de interpretar archivos de salida.

Una empresa nueva necesita su propio mapeo y protocolo. El motor es reutilizable; no presupone que distintas empresas registren las mismas columnas o estados clínicos. No se cambia el desenlace ni se inventa seguimiento para conseguir un ajuste.

## Consola o IA con Python

```bash
python Pronostico_EL_IA_autonomo.py install
python Pronostico_EL_IA_autonomo.py check-env
python Pronostico_EL_IA_autonomo.py forms --dir originales --out formularios --company "NOMBRE DE LA EMPRESA"
```

Edite `plan_fuentes.csv`, `plan_columnas.csv`, `plan_estados.csv` y `protocolo.json` según `FORMULARIOS_EMPRESA.md`. Los CSV se deben abrir conservando columnas de texto y guardar en UTF-8 con coma. Las instrucciones distinguen los campos esenciales de predictores opcionales.

```bash
python Pronostico_EL_IA_autonomo.py configure --forms formularios --out config_empresa.json
python Pronostico_EL_IA_autonomo.py prepare --config config_empresa.json --out preparacion_01
python Pronostico_EL_IA_autonomo.py run --config config_empresa.json --out resultado_01
python Pronostico_EL_IA_autonomo.py status --out resultado_01
```

Si ya cuenta con una configuración revisada, puede ir directamente a `prepare` y `run`. Los directorios de resultados deben ser nuevos o vacíos. Los originales se conservan; no se mezclan ejecuciones.

Para leer todos los módulos:

```bash
python Pronostico_EL_IA_autonomo.py --extract-code motor_legible
```

## Google Colab

Abra el `.ipynb` y siga sus 17 celdas de código en orden. Ingrese el nombre de la empresa; el paso 2 extrae el motor incorporado. El paso 5 acepta originales sueltos o un ZIP con sus carpetas y, opcionalmente, su JSON de configuración. Instale antes de importar las bibliotecas; si había importado versiones diferentes, reinicie el entorno y comience otra ejecución.

El cuaderno permite cargar una configuración ya revisada o generar formularios. Cuando elija formularios, descárguelos, complete la revisión y cargue los cuatro archivos en el paso indicado. No continúe con una configuración bloqueada. Los fallos de las etapas del motor conservan su diagnóstico; los errores anteriores de carga o configuración se muestran en su celda.

Al terminar, descargue el ZIP de resultados. Incluye fuentes canónicas y correspondencia privada de personas; mantenga los accesos adecuados a sus bases. No se envían registros a una API de lenguaje ni se publica información.

## Qué datos se necesitan

| Elemento | Evidencia requerida |
|---|---|
| Población | Identificador estable, vínculos y fechas verificables de trabajadores en riesgo |
| Desenlace | Evento EL definido, estados verificados, fecha del evento y cuándo se conoció |
| Seguimiento | Intervalos verificables de observación individual o derivación documentada admisible |
| Predictores | Información disponible antes de la fecha índice |
| Evaluación | Personas, eventos y seguimiento suficientes en entrenamiento, validación y prueba |

Diagnóstico, sospecha y calificación de origen no son intercambiables. La ausencia en una lista de casos no significa que una persona esté observada y libre de enfermedad.

Antigüedad, cargo, área y sede son seleccionables; no se exige historia de un predictor descartado. Antecedentes de salud y exposiciones son opcionales en el motor. Su ausencia puede reducir utilidad, que debe medirse. No se genera exposición a partir de nombres de cargo.

## Fechas y derivaciones

Todas las fechas del protocolo deben ser `AAAA-MM-DD`. El cierre no puede estar en el futuro. La información futura del desenlace puede identificar etiquetas dentro del cierre predefinido; no puede convertirse en predictor retrospectivo.

`contract_availability.mode=documented_contract_start` permite usar el inicio contractual para disponibilidad sólo con evidencia, revisión y justificación, y únicamente con antigüedad como predictor laboral. No retrofecha cargo, área o sede.

`followup_derivation.mode=employment_intersect_registry` intersecta vínculos y cobertura documentada de un registro que observa a la población. Exige evidencia, intervalos y revisión; conserva brechas y utiliza la versión contractual conocida al verificar cada intervalo. Nómina por sí sola no demuestra vigilancia. Para seguimiento explícito, deje la derivación en `none`.

## Validación y modelos

`person_holdout`: una fecha índice histórica común, personas disjuntas en entrenamiento/validación/prueba, y fecha de predicción igual al cierre. Es validación interna; no demuestra rendimiento en otro período o empresa.

`temporal`: fechas sucesivas y cierres de etiquetas por etapa. `temporal_disjoint` separa además las personas. El diseño se declara antes de evaluar; el programa no prueba cortes hasta encontrar cifras favorables.

Se comparan Cox penalizado, bosque de supervivencia y boosting de supervivencia. La imputación y codificación se ajustan en entrenamiento. La selección usa Brier IPCW en validación; después se examina el test reservado. Se informa discriminación, calibración, Brier frente a referencia e incertidumbre cuando es estimable. Una probabilidad calculada no acredita utilidad clínica o empresarial.

Los mínimos de personas/eventos son controles de cálculo, no tamaño muestral científicamente suficiente. No hay riesgos competitivos, recalibración automática, validación externa ni operación monitorizada en producción. La revisión profesional debe valorar los supuestos de censura, selección de población y pertinencia de predictores.

## Salidas y estados

- `LEER_PRIMERO.md` y `estado_ejecucion.json`: fase, causa, modelo y horizontes realmente producidos.
- `preparacion/`: configuración canónica, incidencias y procedencia de fuentes.
- `analisis/tables/cohort_flow.csv`: población y exclusiones.
- `analisis/tables/feasibility_by_horizon.csv`: eventos/seguimiento por horizonte.
- `analisis/model_result.json`: candidatos, selección, métricas y causas de no estimación.
- `analisis/tables/predicciones_por_persona_y_horizonte.csv`: predicciones a 12/36/60 o motivo de ausencia.
- `analisis/privado/correspondencia_personas.csv`: correspondencia local de identificadores; no enviar a IA.
- `analisis/figures/`: gráficos de preparación y de evaluación/predicción según disponibilidad.

Para `run`, salida 0 significa predicciones en todos los horizontes configurados, 3 bloqueo sin modelo seleccionado, 4 resultado parcial —ajuste sin selección, o selección con horizontes incompletos—, y 2 error de ejecución/informe. El éxito de `configure` o `prepare` tiene el alcance de esa etapa; no afirma entrenamiento.

Los ocho roles están detallados en `RESPONSABILIDADES.md`. No se presume que una ejecución equivalga a revisión médica o independiente.

## Referencias metodológicas

[TRIPOD+AI](https://www.tripod-statement.org/wp-content/uploads/2019/12/TRIPODAI_checklist.pdf) orienta la documentación del desarrollo y la evaluación. [PROBAST+AI](https://www.probast.org/) orienta la revisión de calidad y riesgo de sesgo. La [documentación de scikit-survival](https://scikit-survival.readthedocs.io/en/v0.27.0/user_guide/evaluating-survival-models.html) describe las métricas utilizadas. Estas referencias no certifican automáticamente el modelo entregado.

## Uso simplificado de originales y configuraciones

Si tiene un ZIP con sólo originales de una empresa, puede importarlo conservando carpetas:

```bash
python Pronostico_EL_IA_autonomo.py ingest --files bases_empresa.zip --out originales --company "NOMBRE DE LA EMPRESA"
```

`ingest` también admite `--dir CARPETA` o varios archivos con `--files`. Es opcional si ya tiene una carpeta apropiada. No cargue un ZIP de resultados como si contuviera los originales. Los archivos y sus huellas quedan registrados en `manifest_importacion.json`; un hash demuestra identidad de bytes, no cobertura clínica ni pertenencia empresarial.

Para un JSON revisado de otra sesión, adapte sólo sus rutas antes de ejecutar:

```bash
python Pronostico_EL_IA_autonomo.py relocate-config --config CONFIG_ANTERIOR.json --originals originales --company "NOMBRE DE LA EMPRESA" --out config_local.json
python Pronostico_EL_IA_autonomo.py run --config config_local.json --out resultado_nuevo
```

Colab hace esa relocalización en el paso 6. Conserva el JSON original y rechaza coincidencias ambiguas. El archivo `.rutas.json` vecino documenta rutas y hashes; un hash recién calculado no demuestra identidad histórica si el original no tenía una huella conocida. `run` ya incluye la preparación: ejecutar sólo `forms`, `configure` o `prepare` no entrena.

## Controles V5 y límites

`check-env` debe informar `software: 5.0.0`; el cuaderno comprueba la misma versión. El paso 14 llama a `ProjectRun.train()`. No use el auditor particular de ASEAR como sustituto de ese entrenamiento. No combine este cuaderno con el Word o motor de otra versión.

V5 distingue `training_completed`, `selection_completed`, `candidate_status` y `predicted_horizons_months`. `FITTED_WITHOUT_SELECTION` indica algún ajuste terminado sin candidato seleccionado ni predicciones. Un código de salida 4 requiere leer el estado: no es sinónimo de excepción ni de fracaso de todos los algoritmos.

El control de evidencia detecta contradicciones explícitas reconocibles, por ejemplo `reviewed=true` junto a «cobertura por confirmar», y estados opcionales pendientes/no verificados. No autentica documentos; su silencio no acredita seguimiento. Debe resolver el hecho pendiente, no borrar las palabras para pasar el control. Las fechas extremas de una lista de casos no establecen observación poblacional.

También se valida `min_train_events_at_horizon` como entero positivo. No se redujeron los mínimos predeterminados ni se relajaron las restricciones de seguimiento. El diseño actual exige conjuntos de entrenamiento, validación y prueba. Con muy pocos eventos, un diseño de validación interna por remuestreo podría aprovechar mejor la información, pero no está implementado en esta entrega y tampoco sustituye seguimiento verificable.

Las predicciones son probabilidades acumuladas del evento EL definido, calculadas como `1 - S(t|X)`. Su interpretación depende de vigilancia y censura. El motor no implementa riesgos competitivos: no convierta la suma de probabilidades en una proyección de casos que reconocerá efectivamente una empresa considerando su rotación futura.
'''

# ARCHIVO 07 DE 25: docs/PROMPT_PARA_CUALQUIER_IA.md
FUENTES['docs/PROMPT_PARA_CUALQUIER_IA.md'] = r'''# Instrucciones para ejecutar Rehavid V5 con una IA

## Verificación obligatoria de esta entrega

Ejecuta el archivo autónomo adjunto y comprueba que `check-env` informe `software: 5.0.0`. No reutilices otro motor de una carpeta anterior ni sustituyas `run` por un script que sólo calcula factibilidad. Conserva `estado_ejecucion.json`, `analisis/model_result.json` y el comando ejecutado. Si no llamaste a `run` o a `ProjectRun.train()`, declara «entrenamiento no ejecutado».

Si el JSON viene de otra sesión, ejecuta `relocate-config --config CONFIG_ORIGINAL.json --originals ORIGINALES --company "EMPRESA" --out CONFIG_LOCAL.json` y utiliza el JSON local. Esta operación sólo relocaliza archivos: no completa fechas ni mapeos. Un Word de Colab no reemplaza al archivo autónomo para una IA que ejecuta Python.

Nunca marques una cobertura como revisada si está pendiente de confirmar. Las fechas primera y última de los casos no acreditan vigilancia de la población. No asignes `verified_at` a la última fecha de un caso ni equipares calificación, notificación y disponibilidad sin evidencia. Una referencia escrita por la misma IA que dice «por confirmar» no documenta verificación. Usa las alternativas de derivación del manual sólo cuando exista información que las respalde; identifica los datos indispensables pendientes sin sustituirlos por una autorización ficticia.

## Ejecución

Trabaja exclusivamente con las bases originales de la empresa indicada y el motor Rehavid V5 adjunto. El objetivo es predecir primer evento de enfermedad laboral a 12, 36 y 60 meses. No mezcles personas, diagnósticos, fechas, configuraciones ni resultados de otras empresas. No presentes resultados de pruebas de software como si fueran empresariales.

1. Comprueba si dispones de intérprete de Python y de los archivos originales. Un enlace privado de OneDrive requiere acceso autorizado; descarga sus Excel reales mediante la herramienta disponible. No leas una página HTML como tabla de casos. Si no tienes los bytes, informa exactamente qué falta.
2. Instala las dependencias con `python Pronostico_EL_IA_autonomo.py install` y ejecuta `check-env`. Si hay errores, corrige el entorno y conserva su diagnóstico. Una respuesta redactada no constituye ejecución.
3. Genera formularios con `forms --dir ORIGINALES --out FORMULARIOS --company "EMPRESA"`. Examina cada archivo y todas sus hojas, encabezados, identificadores, fechas, estados y cobertura.
4. Completa los formularios a partir de evidencia de las fuentes: `plan_fuentes.csv`, `plan_columnas.csv`, `plan_estados.csv`, `protocolo.json`. Las propuestas de encabezado no certifican equivalencia. No asignes estados, fecha de disponibilidad o vigilancia por el nombre de un archivo. No conviertas sospechas en EL confirmada ni censura en negativo definitivo.
5. Si el significado está documentado, aplica el mapeo y explica su evidencia sin pedir autorización para cada transformación reversible. Si falta una decisión clínica/metodológica indispensable, documenta el pendiente específico y solicita únicamente esa información. No inventes la respuesta.
6. Permite varias entradas por fuente. Conserva identificadores como texto. Declara formatos por columna y origen de serial Excel cuando corresponda. No retires prefijos de documentos sin regla verificada y control de colisiones.
7. Selecciona sólo predictores con información anterior a la fecha índice. Historia de cargo/área/sede no es obligatoria si no se usan esas variables. Antecedentes y exposición son opcionales. No uses variables de diagnóstico posterior como predictores.
8. Las derivaciones de disponibilidad contractual y seguimiento requieren las reglas y evidencia del manual. No crees seguimiento a partir de ausencia de casos. Revisa versiones corregidas y lagunas.
9. Declara desenlace, horizonte, población y diseño antes de mirar desempeño. No cambies fechas, semilla o mínimos para publicar sólo el resultado favorable.
10. Construye configuración con `configure --forms FORMULARIOS --out config_empresa.json`. Revisa `resultado_configuracion.json`; un estado configured no significa entrenado.
11. Ejecuta `prepare --config config_empresa.json --out PREPARACION_NUEVA`. Revisa calidad, enlaces, exclusiones y soporte. Resuelve errores de adaptación comprobables sin eliminar controles.
12. Ejecuta `run --config config_empresa.json --out RESULTADO_NUEVO`. Comprueba el estado, los candidatos realmente ajustados, la selección, métricas del test y las columnas predictivas por horizonte. Una cohorte vacía no es evidencia de fallo de los tres algoritmos.
13. Entrega archivos de resultados y explica qué ocurrió. Si se generaron predicciones, informa desempeño y límites; si no, identifica la fase y causa demostrada, lo que puede corregirse y la evidencia/datos adicionales necesarios. No garantices que toda base permita predecir.

La IA apoya las funciones de ingeniería y análisis. No afirma que hubo revisión profesional humana, calificación de origen, validez clínica o autorización de uso cuando no existe evidencia. Conserva los archivos privados con acceso restringido; el paquete de esquema para IA no incluye registros individuales.

Si recibe originales en ZIP, use `ingest --files BASES.zip --out ORIGINALES --company "EMPRESA"`. Si ya están en una carpeta, puede usarla directamente. Preserve subcarpetas y no use resultados previos como fuentes. No envíe las bases a un proveedor externo de IA mediante API sin autorización específica. V5 incorpora un detector acotado de contradicciones de evidencia; no cambie el texto para ocultar un pendiente ni afirme que el detector verifica la verdad de una cobertura.
'''

# ARCHIVO 08 DE 25: docs/RESPONSABILIDADES.md
FUENTES['docs/RESPONSABILIDADES.md'] = r'''# Responsabilidades y revisión — Modelo predictivo Rehavid EL

Este proyecto construye un **modelo predictivo de enfermedad laboral (EL)**: estima la probabilidad del primer evento confirmado definido por el equipo, a 12, 36 y 60 meses cuando hay soporte verificable. En salud, predecir un evento futuro también se denomina pronóstico. Usar probabilidades describe la salida del modelo; no cambia el objetivo hacia una priorización relativa. Los métodos implementados son de supervivencia con censura a la derecha.

El evento observado se refiere a la vigilancia documentada y a la definición clínica acordada. No permite conocer con certeza la aparición biológica de una enfermedad no registrada. Las empresas se analizan de forma aislada; no se combinan sus datos ni se trasladan conclusiones entre ellas sin un protocolo nuevo.

El funcionamiento del código, una métrica favorable o la elección de Cox, bosque aleatorio de supervivencia (RSF) o gradient boosting de supervivencia no constituyen validación clínica ni autorización de uso operativo.

## Equipo: ocho roles

| Rol y nivel recomendado | Funciones incorporadas en el software | Revisión y evidencia que siguen correspondiendo a profesionales |
|---|---|---|
| **1. Líder de bioestadística y epidemiología — sénior** | Cohortes, seguimiento, censura, particiones, comprobación de soporte y métricas por horizonte. | Define estimando, población, eventos, diseño y criterios de aceptación. Revisa suficiencia de eventos y supuestos; los mínimos del programa sólo habilitan cálculos. H0: protocolo. H2–H3: interpretación de soporte, evaluación e incertidumbre. |
| **2. Científico/a de datos en salud con Python — sénior** | Preprocesamiento ajustado con entrenamiento; Cox, bosque y boosting de supervivencia; selección en validación; prueba reservada y exportación. | Revisa predictores, complejidad, desempeño, reproducibilidad y limitaciones. H1–H3: código revisado, parámetros, semilla y resultados. Que se entrenen los tres candidatos no constituye por sí solo validación. |
| **3. Ingeniero/a de datos — intermedio avanzado o sénior** | Inventario de archivos/hojas, normalización de fechas y tipos, duplicados, enlaces, separación de empresas y control de historias laborales. | Valida mapeos y procedencia; resuelve contradicciones y demuestra cobertura y disponibilidad histórica. H1–H2: diccionario, calidad y trazabilidad de exclusiones. Un cero exige observación suficiente. |
| **4. Médico/a laboral — especialista con experiencia en EL** | Mapeo explícito de estados; distinción entre confirmado, sospechoso, pendiente, descartado y desconocido; exclusión/censura según reglas declaradas. | Define y revisa el evento, la fecha clínica o de calificación y el significado de cada estado. H0–H3: revisión clínica documentada; el programa y la IA no adjudican origen laboral ni certifican diagnósticos. |
| **5. Experto/a en exposición ocupacional — sénior** | Variables de exposición con nombre/unidad explícitos y disponibilidad anterior a la predicción. | Revisa métodos, mediciones, unidades, vigencia y correspondencia con tareas/cargos. H1–H3: diccionario e interpretación ocupacional. No se inventa exposición a partir del nombre de un cargo. |
| **6. Revisor/a independiente — sénior** | Manifiesto, trazabilidad de etapas, pruebas, soporte y resultados reproducibles para auditoría. | Audita sin haber desarrollado o seleccionado el modelo. H3–H4: concepto independiente sobre fuga de información, sesgo, discriminación, calibración, incertidumbre y aplicabilidad. La ejecución no genera una firma ni una revisión ficticia. |
| **7. Ingeniero/a de MLOps — intermedio avanzado o sénior** | Dependencias, versiones, hashes, semilla, artefactos y registros de ejecución. | Prepara despliegue, monitoreo, accesos y actualización. H1–H4: reproducción y plan de operación. Esta entrega no incorpora un servicio de monitoreo en producción ni autoriza actualizaciones automáticas. |
| **8. Responsable de producto y gobernanza — líder con autoridad** | Empresa aislada, seudonimización, paquete de esquema para IA sin transferencia automática de registros y salidas de auditoría. | Define decisión de uso, aceptación, finalidad, permisos, retención y acceso con privacidad/seguridad. H0–H4: responsables y alcance registrados. La entrega de código no demuestra por sí sola cumplimiento de todas esas obligaciones. |

Los ocho roles orientan los controles y entregables. No significa que ocho profesionales humanos hayan participado, firmado o revisado clínicamente los datos. Son funciones; algunas pueden combinarse en una persona competente, manteniendo la revisión independiente separada del desarrollo.

## Los quince pasos de una ejecución revisable

El archivo `tables/etapas_y_responsabilidades.csv` relaciona cada paso con responsables, estado y evidencia requerida. Registra: preparar bibliotecas; definir el protocolo; inventariar; mapear; limpiar; integrar; construir cohortes; crear variables; separar conjuntos; entrenar; seleccionar; evaluar; predecir; revisar independientemente; y preparar la operación.

El programa marca como ejecutadas sólo las operaciones efectivamente terminadas que registra el flujo. La revisión profesional permanece pendiente hasta contar con evidencia externa al programa. Completar `config.json` o pedir ayuda a una IA no equivale a una revisión médica, epidemiológica o independiente. Esta distinción no impide ejecutar y revisar el código de investigación.

## Dos diseños, dos alcances de validación

- **`validation_design="person_holdout"`:** reserva personas diferentes para entrenamiento, validación y prueba, con fecha índice común. Se informa como `internal_independent_person_holdout`: validación interna por personas independientes. Utiliza seguimiento posterior para etiquetar desenlaces sin transformarlo en predictor; no acredita evaluación en otro período ni en otra empresa.
- **`validation_design="temporal"`:** entrena, selecciona y evalúa en fechas sucesivas, con cierres de etiquetas definidos. `split_mode="temporal"` puede repetir personas en distintos momentos; `temporal_disjoint` añade separación de personas. Esta opción exige historia suficiente en cada período para los horizontes solicitados.

El equipo metodológico elige y documenta el diseño antes de examinar el resultado de prueba. El código no cambia silenciosamente el diseño para obtener mejores métricas. La tabla `feasibility_by_horizon.csv` informa soporte preliminar; «potencialmente evaluable» no equivale a modelo validado.

## Hitos y condiciones comunes

- **H0 — Protocolo:** acordar qué evidencia permite llamar a un evento «confirmado». La fecha de diagnóstico, la de calificación y la fecha de disponibilidad del registro son conceptos distintos; se declara cuál representa el evento y por qué. No se resuelve esta semántica automáticamente con IA.
- **H1 — Datos:** documentar, por empresa y fuente, fechas de ocurrencia y de disponibilidad, cobertura y calidad. Un predictor debe haber estado disponible al inicio de predicción. Información posterior puede verificar etiquetas hasta su cierre establecido, pero no convertirse en predictor retrospectivo.
- **H2 — Cohortes:** identificar personas en riesgo del primer evento, verificar vigilancia continua y definir censura. Los casos pendientes o sospechosos no son eventos confirmados ni negativos definitivos; se aplica la regla preestablecida de seguimiento ante incertidumbre. La ausencia de vigilancia no equivale a ausencia de enfermedad. El estimando describe incidencia durante vigilancia, sin inferir riesgo biológico después de perder seguimiento.
- **H3 — Evaluación:** congelar el modelo antes de evaluar la prueba reservada. Revisar discriminación, calibración, soporte e incertidumbre por horizonte cuando sean estimables. Los umbrales técnicos de cálculo no certifican suficiencia estadística. No completar métricas faltantes ni inventar intervalos individuales; distinguir los intervalos de rendimiento condicionados al modelo de la incertidumbre de una predicción personal.
- **H4 — Decisión:** conservar evidencia, observaciones, cambios y firmas. La aceptación requiere dictamen independiente y autorización humana para un alcance explícito. Si faltan datos, soporte o criterios satisfechos, se documenta el impedimento y se mantiene el resultado como investigación sin aprobación de uso operativo.

Cada revisión debe registrar fecha, versión de datos y código, responsable, evidencia examinada, hallazgos y decisión. Este documento asigna funciones; no acredita que las personas hayan sido designadas ni que los hitos hayan sido aprobados. No implica contactar a terceros.
'''

# ARCHIVO 09 DE 25: rehavid_el/__init__.py
FUENTES['rehavid_el/__init__.py'] = r'''"""Rehavid: investigación reproducible de pronóstico de enfermedad laboral."""
__version__ = "5.0.0"
'''

# ARCHIVO 10 DE 25: rehavid_el/cohort.py
FUENTES['rehavid_el/cohort.py'] = r'''"""Cohortes landmark: información disponible en t0, etiquetas hasta un cierre.

Un snapshot por etapa evita contar ventanas repetidas como personas distintas.
El endpoint es el primer evento verificado registrado durante vigilancia y
vínculo laboral. No estima aparición biológica no observada ni después del retiro.
"""
import hashlib
import hmac
import re
import numpy as np
import pandas as pd
from .config import KINDS, DataContractError, normalized, employment_features, validation_rules

META = ["person_key", "index_date", "followup_end", "event", "duration_days"]

def person_key(company, person, salt):
    return hmac.new(str(salt).encode(), f"{company}\0{person}".encode(), hashlib.sha256).hexdigest()

def partition(person, cfg):
    text = f"{cfg.get('seed', 2026)}\0{cfg['company']}\0{person}"
    value = int(hashlib.sha256(text.encode()).hexdigest()[:16], 16) / 2**64
    fractions = cfg.get("split_fractions", [0.6, 0.2, 0.2])
    return "train" if value < fractions[0] else ("validation" if value < sum(fractions[:2]) else "test")

def continuous_end(intervals, index_date, cutoff):
    """Une intervalos observados adyacentes; nunca atraviesa una laguna."""
    rows = intervals.loc[intervals.verified_at.le(cutoff)].sort_values(["obs_start", "obs_end"])
    end = None
    for row in rows.itertuples():
        if end is None:
            if row.obs_start <= index_date <= row.obs_end:
                end = row.obs_end
        elif row.obs_start <= end + pd.Timedelta(days=1):
            end = max(end, row.obs_end)
        else:
            break
    return None if end is None else min(end, cutoff)

def states_at(outcomes, cutoff, cfg):
    eligible = outcomes.loc[outcomes.available_at.le(cutoff) & outcomes.event_date.le(cutoff)].copy()
    if "state" not in eligible:
        status_map = {normalized(k): v for k, v in cfg["status_map"].items()}
        eligible["state"] = eligible.status.map(lambda s: status_map.get(normalized(s), "unknown"))
    eligible = eligible.sort_values("available_at").drop_duplicates(["person_id", "event_id"], keep="last")
    if cfg.get("outcome_group") is not None:
        eligible = eligible.loc[eligible.outcome_group.astype(str).eq(str(cfg["outcome_group"]))]
    return eligible

def health_coverage(cfg, index_date, months, kind):
    source = cfg.get("sources", {}).get("health_events", {})
    if not source.get("enabled", False) or kind not in source.get("covered_kinds", []):
        return False
    try:
        dates = [pd.Timestamp(source.get(k)) for k in ["coverage_start", "coverage_end", "available_through"]]
        if any(pd.isna(d) for d in dates):
            return False
        return dates[0] <= index_date - pd.DateOffset(months=months) and min(dates[1:]) >= index_date
    except (ValueError, TypeError):
        return False

def _feature_names(cfg):
    validation_rules(cfg)
    features = employment_features(cfg)
    descriptions = [dict(feature=c, source="employment", definition=(
        "Antigüedad del vínculo vigente, sin sumar lagunas ni reingresos." if c == "tenure_years" else
        "Valor conocido en la fecha índice; categoría explícita, sin ID.")) for c in features]
    health_enabled = cfg.get("sources", {}).get("health_events", {}).get("enabled", False)
    for months in cfg["feature_windows_months"] if health_enabled else []:
        for kind in KINDS:
            for prefix in ["available", "count", "days"]:
                name = f"health_{prefix}_{kind}_{months}m"
                features.append(name)
                descriptions.append(dict(feature=name, source="health_events", definition=(
                    "Cobertura de registros documentada en configuración: 1 completa / 0 no completa." if prefix == "available" else
                    f"{'Número de registros' if prefix == 'count' else 'Días documentados'} de {kind}, ventana retrospectiva {months} meses, disponibles en t0; NaN si cobertura incompleta.")))
    for name, definition in cfg.get("exposure_features", {}).items():
        if not re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", name) or name in features or name in META:
            raise DataContractError("exposure_features: nombres únicos seguros, distintos de metadatos.")
        if not definition.get("name") or not definition.get("unit"):
            raise DataContractError("Cada exposure_feature requiere name y unit definidos por el experto.")
        features.append(name)
        descriptions.append(dict(feature=name, source="exposures", definition=f"Última medición vigente y disponible de {definition['name']}; unidad {definition['unit']}; sin medición=NaN."))
    if not features:
        raise DataContractError("No hay predictores seleccionados: declare variables disponibles antes de la fecha índice; no se entrena con identificadores o etiquetas.")
    return features, pd.DataFrame(descriptions)

def build_cohorts(tables, cfg, salt):
    if not salt:
        raise DataContractError("Se requiere una clave HMAC no vacía para seudonimización.")
    features, dictionary = _feature_names(cfg)
    emp = tables["employment"]
    out = tables["outcomes"]
    fu = tables["followup"]
    health = tables.get("health_events", pd.DataFrame())
    exposure = tables.get("exposures", pd.DataFrame())
    issues, flow_rows, followup_rows = [], [], []
    cohorts = {}
    design = cfg.get("validation_design", "temporal")
    if design == "person_holdout":
        ends = {stage: cfg["as_of"] for stage in ["train", "validation", "test"]}
        ends["score"] = cfg["landmarks"]["score"]
    else:
        ends = {"train": cfg["landmarks"]["validation"], "validation": cfg["landmarks"]["test"],
                "test": cfg["as_of"], "score": cfg["landmarks"]["score"]}
    group_fu = {k: g for k, g in fu.groupby("person_id", sort=False)}
    for stage in ["train", "validation", "test", "score"]:
        t0 = pd.Timestamp(cfg["landmarks"][stage])
        cutoff = pd.Timestamp(ends[stage])
        label_end = cutoff - pd.Timedelta(days=cfg.get("label_maturation_days", 0)) if stage != "score" else cutoff
        effective = emp["effective_from"] if "effective_from" in emp else emp.start_date
        ordering = ["effective_from", "recorded_at"] if "effective_from" in emp else ["recorded_at"]
        known = emp.loc[emp.recorded_at.le(t0) & effective.le(t0)].sort_values(ordering).drop_duplicates(["person_id", "spell_id"], keep="last")
        active = known.loc[known.start_date.le(t0) & (known.end_date.isna() | known.end_date.gt(t0))]
        counts = {"employment_records": len(emp),
                  "records_available_by_index": int(emp.recorded_at.le(t0).sum()),
                  "records_effective_by_index": int(effective.le(t0).sum()),
                  "records_available_and_effective_by_index": int((emp.recorded_at.le(t0) & effective.le(t0)).sum()),
                  "known_spells": len(known),
                  "active_people": int(active.person_id.nunique()), "overlapping_spells": 0,
                  "other_partition": 0, "prevalent_confirmed": 0, "baseline_uncertain": 0,
                  "prevalent_confirmed_found_late": 0, "baseline_uncertain_found_late": 0,
                  "no_observation": 0, "no_positive_followup": 0, "eligible": 0, "events": 0}
        duplicate = set(active.loc[active.duplicated("person_id", keep=False), "person_id"])
        counts["overlapping_spells"] = len(duplicate)
        active = active.loc[~active.person_id.isin(duplicate)]
        # La elegibilidad clínica conocida en t0 no puede usar la resolución
        # futura de una sospecha. El cierre se usa sólo para adjudicar etiquetas.
        baseline = states_at(out, t0, cfg)
        grouped_baseline = {k: g for k, g in baseline.groupby("person_id", sort=False)}
        labels = states_at(out, cutoff, cfg)
        grouped_labels = {k: g for k, g in labels.groupby("person_id", sort=False)}
        final_spells = emp.loc[emp.recorded_at.le(cutoff) & effective.le(cutoff)].sort_values(ordering).drop_duplicates(["person_id", "spell_id"], keep="last")
        spell_lookup = {(r.person_id, r.spell_id): r for r in final_spells.itertuples()}
        if len(health):
            hknown = health.loc[health.event_date.lt(t0) & health.available_at.le(t0)].sort_values("available_at").drop_duplicates(["person_id", "source_kind", "event_id"], keep="last")
            grouped_health = {k: g for k, g in hknown.groupby("person_id", sort=False)}
        else:
            grouped_health = {}
        if len(exposure):
            ex = exposure.loc[exposure.start_date.le(t0) & exposure.available_at.le(t0)].sort_values("available_at").drop_duplicates(["person_id", "exposure_name", "start_date"], keep="last")
            ex = ex.loc[ex.end_date.isna() | ex.end_date.ge(t0)]
            grouped_exposure = {k: g for k, g in ex.groupby("person_id", sort=False)}
        else:
            grouped_exposure = {}
        coverage = {(m, kind): health_coverage(cfg, t0, m, kind) for m in cfg["feature_windows_months"] for kind in KINDS}
        rows = []
        for employee in active.itertuples():
            pid = employee.person_id
            disjoint = design == "person_holdout" or cfg.get("split_mode", "temporal") == "temporal_disjoint"
            if stage != "score" and disjoint and partition(pid, cfg) != stage:
                counts["other_partition"] += 1
                continue
            events = grouped_labels.get(pid, labels.iloc[:0])
            confirmed = events.loc[events.state.eq("confirmed")]
            uncertain = events.loc[events.state.isin(["pending", "suspected", "unknown"])]
            known_events = grouped_baseline.get(pid, baseline.iloc[:0])
            if known_events.state.eq("confirmed").any():
                counts["prevalent_confirmed"] += 1
                continue
            if known_events.state.isin(["pending", "suspected", "unknown"]).any():
                counts["baseline_uncertain"] += 1
                continue
            # Una confirmación tardía de un evento anterior a t0 tampoco puede
            # convertirse en incidencia futura. Se declara esta exclusión
            # retrospectiva separadamente: no implica que se supiera en t0.
            if confirmed.event_date.le(t0).any():
                counts["prevalent_confirmed_found_late"] += 1
                continue
            if uncertain.event_date.le(t0).any():
                counts["baseline_uncertain_found_late"] += 1
                continue
            observation = group_fu.get(pid, fu.iloc[:0])
            observed_end = continuous_end(observation, t0, cutoff)
            if observed_end is None:
                counts["no_observation"] += 1
                continue
            current_spell = spell_lookup[(pid, employee.spell_id)]
            limit = min(observed_end, label_end)
            if pd.notna(current_spell.end_date):
                limit = min(limit, current_spell.end_date)
            # Ante un evento pendiente, no sabemos si era un primer caso: se
            # censura ANTES de esa fecha, sin llamarlo negativo ni confirmado.
            uncertain_future = uncertain.loc[uncertain.event_date.gt(t0), "event_date"]
            if len(uncertain_future):
                limit = min(limit, uncertain_future.min() - pd.Timedelta(days=1))
            future = confirmed.loc[confirmed.event_date.gt(t0) & confirmed.event_date.le(limit), "event_date"]
            happened = len(future) > 0 and stage != "score"
            end = future.min() if happened else limit
            duration = float((end - t0).days)
            if stage != "score" and duration <= 0:
                counts["no_positive_followup"] += 1
                continue
            row = dict(person_key=person_key(cfg["company"], pid, salt), index_date=t0,
                       followup_end=end, event=bool(happened), duration_days=duration if stage != "score" else np.nan)
            for feature in employment_features(cfg):
                row[feature] = ((t0 - employee.start_date).days / 365.25 if feature == "tenure_years"
                                else getattr(employee, feature))
            hist = grouped_health.get(pid)
            for months in cfg["feature_windows_months"] if cfg.get("sources", {}).get("health_events", {}).get("enabled", False) else []:
                start = t0 - pd.DateOffset(months=months)
                for kind in KINDS:
                    # Cobertura de empresa no garantiza historia de una persona
                    # recién vinculada; no convertir meses no observados en ceros.
                    covered = coverage[(months, kind)] and employee.start_date <= start
                    row[f"health_available_{kind}_{months}m"] = int(covered)
                    if covered:
                        subset = hist.loc[hist.event_date.ge(start) & hist.source_kind.eq(kind)] if hist is not None else None
                        count = len(subset) if subset is not None else 0
                        days = (float(subset.days.sum()) if subset.days.notna().all() else np.nan) if count else 0.0
                        row[f"health_count_{kind}_{months}m"] = count
                        row[f"health_days_{kind}_{months}m"] = days
                    else:
                        row[f"health_count_{kind}_{months}m"] = np.nan
                        row[f"health_days_{kind}_{months}m"] = np.nan
            exposures = grouped_exposure.get(pid)
            for name, definition in cfg.get("exposure_features", {}).items():
                measures = exposures.loc[exposures.exposure_name.eq(definition["name"])].sort_values(["start_date", "available_at"]) if exposures is not None else None
                row[name] = float(measures.iloc[-1].exposure_value) if measures is not None and len(measures) else np.nan
            rows.append(row)
        frame = pd.DataFrame(rows, columns=META + features)
        frame["event"] = frame["event"].astype(bool)
        cohorts[stage] = frame
        counts["eligible"] = len(frame)
        counts["events"] = int(frame.event.sum()) if stage != "score" else np.nan
        for reason, count in counts.items():
            flow_rows.append(dict(stage=stage, step=reason, count=count, index_date=str(t0.date()), label_cutoff=str(cutoff.date())))
        if stage != "score":
            for group, group_df in frame.groupby("event"):
                followup_rows.append(dict(stage=stage, event=bool(group), n=len(group_df),
                    median_days=float(group_df.duration_days.median()), min_days=float(group_df.duration_days.min()),
                    max_days=float(group_df.duration_days.max())))
        if duplicate:
            issues.append(dict(severity="warning", code=f"{stage}_overlapping_spells_excluded", count=len(duplicate), message="Vínculos simultáneos requieren regla explícita; personas excluidas."))
    current = states_at(out, pd.Timestamp(cfg["as_of"]), cfg)
    status = current.groupby("state").agg(events=("event_id", "size"), people=("person_id", "nunique")).reset_index()
    issues.append(dict(severity="limitation", code="observed_endpoint_and_censoring", count=1,
        message="Riesgo de evento registrado bajo vigilancia. La censura por salida o sospecha puede ser informativa: requiere revisión y análisis de sensibilidad."))
    issues.append(dict(severity="limitation", code="historical_negative_status", count=1,
        message="La ausencia de EL previa sólo es defendible dentro de la historia verificada disponible; documente el período retrospectivo y la posible enfermedad no registrada."))
    issues.append(dict(severity="limitation", code="late_baseline_adjudication", count=1,
        message="Los estados inciertos conocidos en la fecha índice se excluyen aunque se resuelvan después. Los eventos anteriores descubiertos al cierre se excluyen y contabilizan aparte; revise sesgo de detección y disponibilidad del diagnóstico al desplegar."))
    if design == "person_holdout":
        issues.append(dict(severity="limitation", code="internal_person_holdout_not_temporal", count=1,
            message="Validación interna con personas independientes en una misma fecha índice. No demuestra funcionamiento en períodos posteriores ni en otras empresas. La partición no se elige por sus resultados."))
    return cohorts, features, {"cohort_flow": pd.DataFrame(flow_rows), "followup": pd.DataFrame(followup_rows),
                              "event_status": status, "feature_dictionary": dictionary}, issues
'''

# ARCHIVO 11 DE 25: rehavid_el/config.py
FUENTES['rehavid_el/config.py'] = r'''"""Contrato explícito de fuentes; no deduce significados clínicos con IA."""
from pathlib import Path
import json
import re
import math
import pandas as pd
from .evidence import derivation_evidence_contradictions

SCHEMAS = {
    "employment": ["company", "person_id", "spell_id", "start_date", "end_date", "recorded_at", "job", "area", "site"],
    "outcomes": ["company", "person_id", "event_id", "status", "event_date", "available_at"],
    "followup": ["company", "person_id", "obs_start", "obs_end", "verified_at"],
    "health_events": ["company", "person_id", "event_id", "event_date", "available_at", "source_kind", "days", "severity"],
    "exposures": ["company", "person_id", "start_date", "end_date", "available_at", "exposure_name", "exposure_value"],
}
DATES = {"start_date", "end_date", "recorded_at", "effective_from", "event_date", "available_at", "obs_start", "obs_end", "verified_at"}
KINDS = ["ausentismo_comun", "ausentismo_laboral", "at", "veo"]
VALID_STATUS = {"confirmed", "pending", "suspected", "rejected", "unknown"}
EMPLOYMENT_FEATURES = ["job", "area", "site", "tenure_years"]

class DataContractError(ValueError):
    """Impide modelar cuando no se puede sostener el contrato de datos."""

def normalized(value):
    return " ".join(str(value).strip().casefold().split())

def employment_features(cfg):
    """La ausencia de la clave conserva la selección V2; V3 la declara."""
    selected = cfg.get("employment_features", EMPLOYMENT_FEATURES)
    if (not isinstance(selected, list) or any(not isinstance(x, str) or x not in EMPLOYMENT_FEATURES for x in selected)
            or len(selected) != len(set(selected))):
        raise DataContractError("employment_features: seleccione sin duplicados entre tenure_years, job, area y site.")
    return list(selected)

def required_columns(cfg, name):
    """Campos canónicos mínimos; el nombre original se configura por fuente."""
    columns = list(SCHEMAS[name])
    if name == "employment":
        selected = employment_features(cfg)
        columns = [c for c in columns if c not in {"job", "area", "site"} or c in selected]
    if name == "health_events":
        columns = [c for c in columns if c not in {"days", "severity"}]
    return columns

def evaluation_rules(cfg):
    """Valida umbrales operativos; sus mínimos no prueban suficiencia clínica."""
    evaluation = cfg.get("evaluation", {})
    if not isinstance(evaluation, dict):
        raise DataContractError("evaluation debe ser un objeto de parámetros explícitos.")
    positive_integers = {
        "min_train_people", "min_train_events", "min_train_events_at_horizon", "min_validation_people", "min_validation_events",
        "min_test_people", "min_test_events", "min_at_risk", "calibration_bins", "min_calibration_group",
        "min_calibration_at_risk", "min_group_size", "min_cell_count",
    }
    for key in positive_integers & evaluation.keys():
        value = evaluation[key]
        if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
            raise DataContractError(f"evaluation.{key}: entero estrictamente positivo; no anule los controles con cero o negativos.")
    if "bootstrap_repetitions" in evaluation:
        value = evaluation["bootstrap_repetitions"]
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            raise DataContractError("evaluation.bootstrap_repetitions: entero no negativo; 0 desactiva intervalos bootstrap explícitamente.")
    for key in ["min_censoring_survival", "bootstrap_confidence"]:
        if key in evaluation:
            value = evaluation[key]
            if (not isinstance(value, (int, float)) or isinstance(value, bool)
                    or not math.isfinite(value) or not 0 < value < 1):
                raise DataContractError(f"evaluation.{key}: número estrictamente entre 0 y 1.")
    if "decision_thresholds" in evaluation:
        values = evaluation["decision_thresholds"]
        if (not isinstance(values, list) or any(not isinstance(value, (int, float)) or isinstance(value, bool)
                or not math.isfinite(value) or not 0 < value < 1 for value in values)):
            raise DataContractError("evaluation.decision_thresholds: lista de probabilidades estrictamente entre 0 y 1.")
    return cfg

def validation_rules(cfg):
    """Verifica decisiones explícitas; no certifica su veracidad clínica."""
    contradictions = derivation_evidence_contradictions(cfg)
    if contradictions:
        first = contradictions[0]
        raise DataContractError(f"Evidencia contradictoria en {first['path']}: {first['reason']} "
                                "Aporte la cobertura o disponibilidad acreditada y corrija su declaración; cambiar el texto no verifica la fuente.")
    selected = employment_features(cfg)
    if cfg.get("exposure_features") and not cfg.get("sources", {}).get("exposures", {}).get("enabled", False):
        raise DataContractError("exposure_features tiene variables declaradas pero exposures está deshabilitada; habilite la fuente o retire explícitamente esas variables.")
    availability = cfg.get("contract_availability", {"mode": "explicit"})
    if not isinstance(availability, dict) or availability.get("mode") not in {"explicit", "documented_contract_start"}:
        raise DataContractError("contract_availability.mode debe ser explicit o documented_contract_start.")
    if availability["mode"] == "documented_contract_start":
        if selected != ["tenure_years"]:
            raise DataContractError("documented_contract_start sólo permite employment_features=['tenure_years']; no retrofechar cargo, área ni sede actuales.")
        if availability.get("reviewed") is not True or any(not isinstance(availability.get(k), str) or not availability[k].strip() for k in ["evidence_ref", "rationale"]):
            raise DataContractError("documented_contract_start requiere reviewed=true, evidence_ref y rationale documentados; no se presume disponibilidad histórica.")
    derivation = cfg.get("followup_derivation", {"mode": "none"})
    if not isinstance(derivation, dict) or derivation.get("mode") not in {"none", "employment_intersect_registry"}:
        raise DataContractError("followup_derivation.mode debe ser none o employment_intersect_registry.")
    if derivation["mode"] == "employment_intersect_registry":
        if (derivation.get("reviewed") is not True or derivation.get("employment_implies_registry_observation") is not True
                or any(not isinstance(derivation.get(k), str) or not derivation[k].strip() for k in ["evidence_ref", "rationale"])):
            raise DataContractError("employment_intersect_registry requiere revisión, evidencia, justificación y employment_implies_registry_observation=true; una lista de EL no acredita seguimiento.")
        coverage = derivation.get("coverage")
        if not isinstance(coverage, list) or not coverage:
            raise DataContractError("followup_derivation.coverage requiere intervalos de cobertura documentados.")
        for interval in coverage:
            try:
                if not isinstance(interval, dict):
                    raise ValueError("intervalo no estructurado")
                if any(not isinstance(interval.get(k), str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", interval[k]) for k in ["start", "end", "verified_at"]):
                    raise ValueError("fechas no ISO")
                start, end, verified = (pd.Timestamp(interval[k]) for k in ["start", "end", "verified_at"])
                if any(pd.isna(t) for t in [start, end, verified]) or not start <= end <= verified:
                    raise ValueError("fechas faltantes o invertidas")
                if interval.get("company", cfg.get("company")) != cfg.get("company"):
                    raise ValueError("otra empresa")
                close = pd.Timestamp(cfg.get("as_of"))
                if pd.notna(close) and verified > close:
                    raise ValueError("verificación posterior al cierre")
            except (ValueError, TypeError) as exc:
                raise DataContractError("followup_derivation.coverage: use start <= end <= verified_at <= as_of en formato ISO y una sola empresa; no se inventan períodos.") from exc
    return cfg

def template():
    return {
        "company": "POR_DEFINIR", "outcome_name": "POR_DEFINIR_CON_MEDICINA_LABORAL",
        "outcome_date_basis": "final_decision", "outcome_group": None,
        "as_of": None, "landmarks": dict.fromkeys(["train", "validation", "test", "score"]),
        "validation_design": "person_holdout",
        "split_mode": "temporal", "split_fractions": [0.6, 0.2, 0.2],
        "feature_windows_months": [3, 6, 12], "horizons_months": [12, 36, 60],
        "label_maturation_days": 0, "exposure_features": {},
        "employment_features": ["tenure_years"],
        "contract_availability": {"mode": "explicit", "reviewed": False, "evidence_ref": "", "rationale": ""},
        "followup_derivation": {"mode": "none", "reviewed": False, "evidence_ref": "", "rationale": "",
            "employment_implies_registry_observation": False, "coverage": []},
        "status_map": {},
        "sources": {name: {"enabled": name in ["employment", "outcomes", "followup"],
            "path": f"datos/{name}.csv", "sheet": 0, "columns": {c: c for c in cols},
            "constants": {}, "coverage_start": None, "coverage_end": None,
            "available_through": None, **({"covered_kinds": []} if name == "health_events" else {})} for name, cols in SCHEMAS.items()},
        "models": {"enabled": ["cox", "rsf", "gb"], "cox": {"alpha": 1.0},
            "rsf": {"n_estimators": 100, "min_samples_leaf": 10, "n_jobs": 1},
            "gb": {"n_estimators": 100, "learning_rate": 0.05, "max_depth": 2}},
        "evaluation": {"min_train_people": 20, "min_train_events": 5,
            "min_validation_people": 10, "min_validation_events": 2,
            "min_test_people": 10, "min_test_events": 2, "min_at_risk": 5,
            "min_censoring_survival": 0.05, "calibration_bins": 5,
            "min_calibration_group": 10, "bootstrap_repetitions": 200,
            "bootstrap_confidence": 0.95, "min_group_size": 10, "min_cell_count": 5},
        "release": {"independent_review_required": True, "predeclared_criteria": {}},
        "seed": 2026,
    }

def validate_config(cfg):
    if cfg.get("synthetic", False) is not False:
        raise DataContractError("La ejecución empresarial no admite synthetic=True ni banderas equivalentes. Use exclusivamente las fuentes reales de la empresa.")
    validation_rules(cfg)
    evaluation_rules(cfg)
    if not cfg.get("company") or cfg["company"] == "POR_DEFINIR":
        raise DataContractError("Defina company: una sola empresa por ejecución.")
    if not cfg.get("outcome_name") or "POR_DEFINIR" in cfg["outcome_name"]:
        raise DataContractError("Defina el evento con medicina laboral antes de modelar.")
    if cfg.get("outcome_date_basis") not in {"final_decision", "verified_diagnosis"}:
        raise DataContractError("outcome_date_basis debe ser final_decision o verified_diagnosis; explique la elección en outcome_name.")
    design = cfg.get("validation_design", "temporal")
    if design not in {"temporal", "person_holdout"}:
        raise DataContractError("validation_design debe ser temporal o person_holdout; no se elige automáticamente para obtener resultados.")
    try:
        values = {k: cfg["landmarks"][k] for k in ["train", "validation", "test", "score"]}
        values["as_of"] = cfg["as_of"]
        if any(not isinstance(v, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v) for v in values.values()):
            raise ValueError("Use fechas ISO YYYY-MM-DD explícitas; no se infiere día/mes.")
        dates = {k: pd.Timestamp(v) for k, v in values.items() if k != "as_of"}
        close = pd.Timestamp(values["as_of"])
        if any(pd.isna(v) for v in [*dates.values(), close]):
            raise ValueError("fecha vacía")
        if design == "temporal":
            if not dates["train"] < dates["validation"] < dates["test"] < close or not dates["test"] <= dates["score"] <= close:
                raise ValueError("orden temporal incorrecto")
        elif not (dates["train"] == dates["validation"] == dates["test"] < close and dates["score"] == close):
            raise ValueError("person_holdout requiere una fecha índice histórica común y score=as_of")
        if close > pd.Timestamp.now(tz="UTC").tz_localize(None).normalize():
            raise ValueError("cierre futuro en datos reales")
    except (ValueError, TypeError, KeyError) as exc:
        rule = ("train < validation < test < as_of; test <= score <= as_of" if design == "temporal" else
                "train = validation = test < as_of; score = as_of")
        raise DataContractError(f"Fechas ISO para {design}: {rule}. Cierre real no puede estar en el futuro.") from exc
    if cfg.get("split_mode", "temporal") not in {"temporal", "temporal_disjoint"}:
        raise DataContractError("split_mode inválido.")
    fractions = cfg.get("split_fractions", [0.6, 0.2, 0.2])
    if (not isinstance(fractions, list) or len(fractions) != 3
            or any(not isinstance(x, (int, float)) or isinstance(x, bool) or not math.isfinite(x) or x <= 0 for x in fractions)
            or abs(sum(fractions) - 1) > 1e-8):
        raise DataContractError("split_fractions: tres proporciones positivas que sumen 1.")
    for field in ["feature_windows_months", "horizons_months"]:
        values = cfg.get(field, [])
        if not values or len(set(values)) != len(values) or any(not isinstance(x, int) or isinstance(x, bool) or x <= 0 for x in values):
            raise DataContractError(f"{field}: lista de meses enteros positivos, sin duplicados.")
    maturation = cfg.get("label_maturation_days", 0)
    if not isinstance(maturation, int) or isinstance(maturation, bool) or maturation < 0:
        raise DataContractError("label_maturation_days debe ser un entero no negativo.")
    mapping = cfg.get("status_map", {})
    if not mapping or not all(v in VALID_STATUS for v in mapping.values()) or "confirmed" not in mapping.values():
        raise DataContractError("status_map debe mapear estados EXACTOS e incluir confirmed, verificado por medicina laboral.")
    normkeys = [normalized(k) for k in mapping]
    if len(normkeys) != len(set(normkeys)):
        raise DataContractError("status_map contiene estados duplicados tras normalizar espacios/mayúsculas.")
    return cfg

def initialize(directory):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "datos").mkdir(exist_ok=True)
    dest = directory / "config.json"
    if dest.exists():
        raise FileExistsError(f"No se sobrescribe {dest}")
    for table, columns in SCHEMAS.items():
        path = directory / "datos" / f"{table}.csv"
        if path.exists():
            raise FileExistsError(f"No se sobrescribe {path}")
        pd.DataFrame(columns=columns).to_csv(path, index=False)
    dest.write_text(json.dumps(template(), ensure_ascii=False, indent=2), encoding="utf-8")
    return dest
'''

# ARCHIVO 12 DE 25: rehavid_el/configurator.py
FUENTES['rehavid_el/configurator.py'] = r'''"""Formularios locales de configuración de una empresa, sin asignaciones clínicas.

Las dos funciones públicas sirven en Python, CLI y Colab. ``export_forms``
inventaría archivos y hojas reales; ``build_config`` materializa exclusivamente
las decisiones escritas y revisadas por el operador. No genera registros.
"""
from __future__ import annotations

import csv
from copy import deepcopy
from datetime import datetime
import json
from pathlib import Path
import re

import pandas as pd

from .config import (DATES, KINDS, SCHEMAS, VALID_STATUS, DataContractError,
                     normalized, required_columns, template, validate_config)
from .data import read_file
from .discovery import EXCEL_SUFFIXES, _options_for
from .mapping import suggest_mapping


SOURCE_COLUMNS = ["entrada_id", "usar", "revisado", "fuente", "archivo", "hoja",
                  "encabezado", "separador", "codificacion", "campos_clave_contrato",
                  "prefijo_id_a_retirar", "normalizacion_id_revisada", "evidencia_normalizacion_id"]
MAPPING_COLUMNS = ["entrada_id", "fuente", "campo_destino", "columna_original",
                   "valor_constante", "formato_fecha", "origen_excel", "candidatos_revisar"]
STATUS_COLUMNS = ["estado_original", "estado_destino", "revisado"]
_PROTOCOL_KEYS = ["company", "outcome_name", "outcome_date_basis", "outcome_group", "as_of",
                  "landmarks", "validation_design", "employment_features", "exposure_features",
                  "contract_availability", "followup_derivation", "label_maturation_days"]


def _write_csv(path, rows, fields):
    with Path(path).open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def _write_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")


def export_forms(directory, output, company, options=None) -> dict:
    """Genera tres CSV editables, protocolo breve e instrucciones.

    ``options`` admite defaults/files/sheets del inventario. Ninguna hoja ni
    equivalencia se selecciona sola. Las rutas relativas se resuelven respecto
    de los originales, cuya ubicación queda en protocolo.json. No sobrescribe
    formularios ya diligenciados. Los CSV se leen y escriben como texto.
    """
    directory = Path(directory).expanduser().resolve()
    output = Path(output).expanduser().resolve()
    if not isinstance(company, str) or not company.strip() or company == "POR_DEFINIR":
        raise ValueError("Indique el nombre de una sola empresa para sus formularios.")
    if directory == output:
        raise ValueError("La salida de formularios debe estar separada de los originales.")
    names = ["plan_fuentes.csv", "plan_columnas.csv", "plan_estados.csv", "protocolo.json", "COMO_CONFIGURAR.md"]
    if any((output / name).exists() for name in names):
        raise FileExistsError("Ya existen formularios: continúe editándolos o use otra carpeta; no se sobrescriben.")
    discovered = suggest_mapping(directory, output / "inventario", company=company, options=options)
    inventory = pd.read_csv(discovered["paths"]["inventory"], dtype=str, keep_default_na=False)
    candidates = pd.read_csv(discovered["paths"]["mapping_review"], dtype=str, keep_default_na=False)
    source_rows, mapping_rows = [], []
    for number, item in enumerate(inventory.to_dict("records"), start=1):
        entry = f"ENTRADA_{number:04d}"
        sheet = item.get("sheet_local", "")
        reader = _options_for(item["path_local"], options or {}, sheet or None)
        suffix = Path(item["path_local"]).suffix.lower()
        source_rows.append(dict(entrada_id=entry, usar="NO", revisado="NO", fuente="",
            archivo=item["path_local"], hoja=sheet, encabezado=reader.get("header", 0),
            separador=reader.get("sep", "\t" if suffix == ".tsv" else ","),
            codificacion=reader.get("encoding", "utf-8-sig"), campos_clave_contrato="",
            prefijo_id_a_retirar="", normalizacion_id_revisada="NO", evidencia_normalizacion_id=""))
        for role, fields in SCHEMAS.items():
            optional = ["effective_from"] if role == "employment" else (["outcome_group"] if role == "outcomes" else [])
            for field in fields + optional:
                matches = candidates[(candidates.source_id == item["source_id"])
                    & (candidates.sheet_id == item.get("sheet_id", ""))
                    & (candidates.role == role) & (candidates.canonical == field)]
                mapping_rows.append(dict(entrada_id=entry, fuente=role, campo_destino=field,
                    columna_original="", valor_constante="", formato_fecha="", origen_excel="",
                    candidatos_revisar=json.dumps(list(dict.fromkeys(matches.column)), ensure_ascii=False)))
    _write_csv(output / names[0], source_rows, SOURCE_COLUMNS)
    _write_csv(output / names[1], mapping_rows, MAPPING_COLUMNS)
    _write_csv(output / names[2], [], STATUS_COLUMNS)
    default = template()
    protocol = {key: deepcopy(default[key]) for key in _PROTOCOL_KEYS}
    protocol.update(company=company, outcome_name="", outcome_date_basis="", validation_design="",
                    originals_directory=str(directory), mapping_reviewed=False)
    protocol["source_metadata"] = {
        name: {"coverage_start": None, "coverage_end": None, "available_through": None,
               **({"covered_kinds": []} if name == "health_events" else {})}
        for name in SCHEMAS}
    _write_json(output / names[3], protocol)
    instructions = """# Configurar una empresa con sus originales

Estos formularios no contienen registros individuales ni seleccionan datos por usted.
Abra los CSV con **Datos → Desde texto/CSV** y columnas de tipo **Texto** para
conservar encabezados y valores literales. Guarde como CSV UTF-8 con coma.

1. En **plan_fuentes.csv**, cada fila identifica un archivo y una hoja. Escriba
   `SI` en `usar` para las entradas verificadas y elija `fuente`: `employment`
   (historia contractual), `outcomes` (casos y estados del desenlace), `followup`
   (observación individual), `health_events` (antecedentes) o `exposures`.
   Seleccione todas las entradas necesarias: varias pueden pertenecer a una fuente.
   Revise el nombre exacto de hoja; `encabezado` empieza en 0 (tercera fila = 2).
   Para usar una misma hoja en dos fuentes, duplique su fila con una `entrada_id`
   nueva y duplique también las filas correspondientes de plan_columnas.
2. En **plan_columnas.csv**, filtre por `entrada_id` y la `fuente` seleccionada.
   Escriba en `columna_original` el encabezado exacto de cada campo requerido.
   `candidatos_revisar` sólo orienta: nunca se convierte en una asignación.
   Si hay dos candidatos, documente y escriba únicamente el correcto.
   `valor_constante` sólo admite `company` y `source_kind`; para empresa escriba
   la empresa del protocolo. No puede crear fechas, estados, eventos o personas.
3. Para cada columna de fecha mapeada declare `formato_fecha`: `ISO8601`,
   `%d/%m/%Y`, `%Y-%m-%d`, u otro formato explícito de Python. Un serial Excel
   requiere `excel_serial` y `origen_excel` documentado, como `1899-12-30` para
   el sistema correspondiente o `1904-01-01` para el sistema 1904. El origen
   debe verificarse; no se selecciona por la apariencia del número.
4. En **plan_estados.csv**, escriba los estados exactos del archivo y su
   `estado_destino`: `confirmed`, `pending`, `suspected`, `rejected` o `unknown`.
   Medicina laboral debe verificar el significado; diagnóstico, sospecha,
   calificación y firmeza no son intercambiables. Cada asignación requiere
   `revisado=SI`. No hay estados preasignados.
5. En **protocolo.json**, complete desenlace, tipo de fecha y fechas de corte.
   `outcome_date_basis`: `final_decision` o `verified_diagnosis` según evidencia.
   `validation_design=person_holdout` requiere train=validation=test < as_of,
   y score=as_of. `temporal` requiere train < validation < test < as_of,
   y test <= score <= as_of. Use fechas `AAAA-MM-DD`. No invente historia.
   Los horizontes de salida son 12, 36 y 60 meses y su soporte se evalúa después.
6. Seleccione `employment_features`: `tenure_years`, `job`, `area`, `site` según
   los históricos disponibles. Antecedentes y exposiciones son opcionales;
   declare su cobertura verificada en `source_metadata` cuando los utilice.
   En health_events declare también `covered_kinds`: `ausentismo_comun`,
   `ausentismo_laboral`, `at` o `veo`, exclusivamente los tipos observados.
   Ausencia de eventos no prueba ausencia de enfermedad ni cobertura.
7. Conserve las reglas contractuales y de seguimiento en sus valores explícitos
   salvo que cuente con la evidencia exigida por el manual. La derivación desde
   registros no equivale a rellenar fechas. Una clave contractual derivada
   exige `campos_clave_contrato` separados por `;`, incluidos `person_id` y
   `start_date`. Retirar un prefijo literal de ID exige revisión y evidencia.
8. Tras revisar las selecciones, marque `revisado=SI` en cada entrada usada y
   `mapping_reviewed=true` en el protocolo. Estas marcas registran decisiones
   del operador; no certifican revisión clínica independiente.
9. Ejecute `build_config(carpeta_formularios, ruta_config_json)`. Revise
   **resultado_configuracion.json**: `configured` significa configuración
   construida, todavía sin entrenamiento. `blocked` enumera correcciones
   concretas. Después prepare los datos y ejecute el motor en una carpeta nueva.

Una ruta de fuente relativa se resuelve respecto de `originals_directory`.
Para mover el proyecto, actualice esa ruta. Un cambio de encabezado o selección
requiere revisar nuevamente el mapeo. Los originales no se modifican.
"""
    (output / names[4]).write_text(instructions, encoding="utf-8")
    return {"status": "forms_created_review_required", "counts": {"entries": len(source_rows),
        "selected_entries": 0, "clinical_assignments": 0}, "issues": discovered["issues"],
        "paths": {"sources": str(output / names[0]), "columns": str(output / names[1]),
                  "statuses": str(output / names[2]), "protocol": str(output / names[3]),
                  "instructions": str(output / names[4]), "inventory": discovered["paths"]["inventory"]}}


def _flag(value):
    value = normalized(value)
    if value in {"si", "sí", "true", "1"}:
        return True
    if value in {"", "no", "false", "0"}:
        return False
    raise ValueError("Use SI o NO.")


def _date_format_valid(fmt):
    if fmt == "ISO8601":
        return True
    if not isinstance(fmt, str) or not re.search(r"%[Yy]", fmt):
        return False
    if not (re.search(r"%[mbB]", fmt) and "%d" in fmt) and "%j" not in fmt:
        return False
    try:
        sample = datetime(2024, 12, 31, 18, 30, 22)
        parsed = pd.to_datetime(sample.strftime(fmt), format=fmt, errors="raise")
        return parsed.date() == sample.date()
    except (ValueError, TypeError, OverflowError):
        return False


def _read_form(path, columns):
    with Path(path).open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None or len(set(reader.fieldnames)) != len(reader.fieldnames):
            raise ValueError("Encabezados vacíos o repetidos.")
        if set(columns) - set(reader.fieldnames):
            raise ValueError("Faltan columnas del formulario. Conserve los encabezados y el separador coma.")
        rows = []
        for row in reader:
            if None in row or any(value is None for value in row.values()):
                raise ValueError("Filas con distinto número de campos; revise comillas y separador coma.")
            if any(value.strip() for value in row.values()):
                rows.append(row)
        return rows


def build_config(forms_dir, output_json) -> dict:
    """Compila selecciones revisadas; devuelve hallazgos en vez de un falso éxito.

    Sólo lee encabezados de los originales para verificar el mapeo. Validar una
    configuración no prueba suficiencia de datos ni entrena un modelo. El motor
    posterior conserva los controles de calidad, seguimiento y evaluación.
    """
    forms_dir = Path(forms_dir).expanduser().resolve()
    output_json = Path(output_json).expanduser().resolve()
    findings = []

    def fail(code, message, *, entry=None, resolution="Corrija el formulario y vuelva a construir la configuración."):
        findings.append({"code": code, "entry": entry, "message": message, "resolution": resolution})

    def finish(cfg=None):
        if cfg is not None and not findings:
            output_json.parent.mkdir(parents=True, exist_ok=True)
            _write_json(output_json, cfg)
        result = {"status": "blocked" if findings else "configured",
                  "config_path": str(output_json) if cfg is not None and not findings else None,
                  "findings": findings, "trained": False,
                  "paths": {"report": str(forms_dir / "resultado_configuracion.json")}}
        forms_dir.mkdir(parents=True, exist_ok=True)
        _write_json(forms_dir / "resultado_configuracion.json", result)
        return result

    if output_json.exists():
        fail("output_already_exists", "La configuración de destino ya existe; no se sobrescribe.",
             resolution="Indique otro nombre o conserve explícitamente una copia de la versión anterior.")
        return finish()
    try:
        protocol = json.loads((forms_dir / "protocolo.json").read_text(encoding="utf-8"))
        if not isinstance(protocol, dict):
            raise ValueError("protocolo.json debe ser un objeto.")
        sources = _read_form(forms_dir / "plan_fuentes.csv", SOURCE_COLUMNS)
        mappings = _read_form(forms_dir / "plan_columnas.csv", MAPPING_COLUMNS)
        statuses = _read_form(forms_dir / "plan_estados.csv", STATUS_COLUMNS)
    except (OSError, ValueError, csv.Error) as exc:
        fail("forms_unreadable", "No se pudieron leer los formularios: " + str(exc))
        return finish()
    if protocol.get("mapping_reviewed") is not True:
        fail("review_required", "protocolo.json no declara mapping_reviewed=true tras la revisión.")
    cfg = template()
    for key in _PROTOCOL_KEYS:
        if key in protocol:
            cfg[key] = deepcopy(protocol[key])
    cfg.update(mapping_reviewed=protocol.get("mapping_reviewed") is True, synthetic=False, status_map={})
    originals = protocol.get("originals_directory")
    if not isinstance(originals, str) or not originals.strip():
        fail("originals_directory_missing", "Indique originals_directory en protocolo.json.")
        base = forms_dir
    else:
        base = Path(originals).expanduser()
        base = (base if base.is_absolute() else forms_dir / base).resolve()
        if not base.is_dir():
            fail("originals_directory_missing", "La carpeta originals_directory no existe.")
    metadata = protocol.get("source_metadata", {})
    if not isinstance(metadata, dict) or set(metadata) - set(SCHEMAS):
        fail("source_metadata_invalid", "source_metadata debe contener sólo fuentes canónicas conocidas.")
        metadata = {}
    cfg["sources"] = {}
    for name in SCHEMAS:
        item = metadata.get(name, {})
        allowed = {"coverage_start", "coverage_end", "available_through", "covered_kinds"}
        if not isinstance(item, dict) or set(item) - allowed:
            fail("source_metadata_invalid", "Revise los campos de cobertura de " + name)
            item = {}
        cfg["sources"][name] = {"enabled": False, "inputs": [], "columns": {}, "constants": {},
                                "mapping_reviewed": False, **deepcopy(item)}
    normalized_states = set()
    for row in statuses:
        raw, target = row["estado_original"], row["estado_destino"].strip()
        if not raw.strip() and not target:
            continue
        try:
            reviewed = _flag(row["revisado"])
        except ValueError:
            reviewed = False
        if not raw.strip() or target not in VALID_STATUS or not reviewed:
            fail("clinical_state_unreviewed", "Cada estado requiere origen literal, destino permitido y revisado=SI.")
            continue
        if normalized(raw) in normalized_states:
            fail("clinical_state_duplicate", "Un estado original tiene varias asignaciones después de normalizar espacios/mayúsculas.")
            continue
        normalized_states.add(normalized(raw))
        cfg["status_map"][raw] = target
    seen, selected_roles = set(), {}
    for row in sources:
        entry = row["entrada_id"].strip()
        if not entry or entry in seen:
            fail("duplicate_or_empty_entry", "Cada fila de plan_fuentes debe tener una entrada_id única y no vacía.", entry=entry)
        seen.add(entry)
        try:
            use, reviewed = _flag(row["usar"]), _flag(row["revisado"])
        except ValueError:
            fail("invalid_selection", "usar y revisado admiten SI o NO.", entry=entry)
            continue
        if not use:
            continue
        name = row["fuente"].strip()
        if name not in SCHEMAS:
            fail("unknown_source_role", "Seleccione una fuente canónica en la fila utilizada.", entry=entry)
            continue
        selected_roles[entry] = name
        if not reviewed:
            fail("entry_unreviewed", "La entrada seleccionada requiere revisado=SI tras verificar sus asignaciones.", entry=entry)
        try:
            header_text = row["encabezado"].strip()
            if not re.fullmatch(r"\d+", header_text):
                raise ValueError("encabezado debe ser un entero no negativo, contado desde cero")
            if not row["archivo"].strip():
                raise ValueError("falta archivo")
            path = Path(row["archivo"]).expanduser()
            path = (path if path.is_absolute() else base / path).resolve()
            spec = {"path": str(path), "header": int(header_text), "columns": {}, "constants": {},
                    "date_formats": {}, "encoding": row["codificacion"].strip() or "utf-8-sig",
                    "sep": row["separador"]}
            if not spec["sep"]:
                raise ValueError("separador vacío")
            if path.suffix.lower() in EXCEL_SUFFIXES:
                if not row["hoja"]:
                    raise ValueError("Excel exige nombre exacto de hoja; no se escoge la primera")
                spec["sheet"] = row["hoja"]
            elif row["hoja"]:
                raise ValueError("la hoja sólo se usa en archivos Excel")
            frame = read_file(path, spec.get("sheet", 0), options=spec, nrows=0)
        except (OSError, ValueError, ImportError, DataContractError) as exc:
            fail("source_header_unreadable", "No se pudo verificar el encabezado de la entrada (" + type(exc).__name__ + ").",
                 entry=entry, resolution="Revise archivo, hoja exacta, encabezado, separador, codificación y bibliotecas de lectura.")
            continue
        used_fields = set()
        for mapping in mappings:
            if mapping["entrada_id"].strip() != entry or mapping["fuente"].strip() != name:
                continue
            field = mapping["campo_destino"].strip()
            original, constant = mapping["columna_original"], mapping["valor_constante"]
            if not original and not constant:
                continue
            allowed_fields = set(SCHEMAS[name]) | ({"effective_from"} if name == "employment" else {"outcome_group"} if name == "outcomes" else set())
            if field not in allowed_fields or field in used_fields:
                fail("ambiguous_mapping", "Campo desconocido o asignado más de una vez: " + field, entry=entry)
                continue
            used_fields.add(field)
            if original and constant:
                fail("column_and_constant", "Elija columna o constante, no ambas, para " + field, entry=entry)
                continue
            if constant:
                if field not in {"company", "source_kind"}:
                    fail("forbidden_constant", "No se pueden crear constantes para " + field, entry=entry)
                    continue
                if (field == "company" and constant != cfg.get("company")) or (field == "source_kind" and constant not in KINDS):
                    fail("invalid_constant", "Constante de empresa o tipo de antecedente no válida.", entry=entry)
                    continue
                spec["constants"][field] = constant
            else:
                if original not in frame.columns:
                    fail("header_not_found", "El encabezado exacto asignado a " + field + " no existe en esa entrada.", entry=entry)
                    continue
                spec["columns"][field] = original
            if field in DATES and original:
                fmt = mapping["formato_fecha"].strip()
                origin = mapping["origen_excel"].strip()
                if fmt == "excel_serial":
                    try:
                        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", origin):
                            raise ValueError("origen no ISO")
                        pd.Timestamp(origin)
                        spec["date_formats"][field] = {"kind": "excel_serial", "origin": origin}
                    except ValueError:
                        fail("excel_origin_required", "Declare un origen Excel válido y verificado para " + field, entry=entry)
                elif _date_format_valid(fmt) and not origin:
                    spec["date_formats"][field] = fmt
                else:
                    fail("date_format_required", "Declare un formato explícito o serial Excel con origen para " + field, entry=entry)
        key_fields = [x.strip() for x in row["campos_clave_contrato"].split(";") if x.strip()]
        if key_fields:
            if name != "employment" or not {"person_id", "start_date"}.issubset(key_fields) or len(key_fields) != len(set(key_fields)):
                fail("invalid_contract_key", "La clave contractual requiere campos canónicos únicos, incluidos person_id y start_date.", entry=entry)
            elif any(field not in spec["columns"] and field not in spec["constants"] for field in key_fields):
                fail("invalid_contract_key", "Los campos de la clave contractual deben estar mapeados.", entry=entry)
            else:
                spec["spell_key_fields"] = key_fields
        if row["prefijo_id_a_retirar"]:
            try:
                id_reviewed = _flag(row["normalizacion_id_revisada"])
            except ValueError:
                id_reviewed = False
            if not id_reviewed or not row["evidencia_normalizacion_id"].strip():
                fail("id_normalization_unreviewed", "Retirar un prefijo exige revisión y referencia de evidencia.", entry=entry)
            else:
                spec["person_id_normalization"] = {"strip_prefix": row["prefijo_id_a_retirar"],
                    "reviewed": True, "evidence_ref": row["evidencia_normalizacion_id"]}
        try:
            required = set(required_columns(cfg, name))
            if name == "employment" and cfg.get("contract_availability", {}).get("mode") == "documented_contract_start":
                required.discard("recorded_at")
            if spec.get("spell_key_fields"):
                required.discard("spell_id")
            missing = required - set(spec["columns"]) - set(spec["constants"])
            if missing:
                fail("required_mappings_missing", "Faltan asignaciones explícitas: " + ", ".join(sorted(missing)), entry=entry)
        except (ValueError, TypeError, AttributeError):
            fail("protocol_feature_selection_invalid", "Revise employment_features y reglas de disponibilidad.", entry=entry)
        cfg["sources"][name]["inputs"].append(spec)
        cfg["sources"][name].update(enabled=True, mapping_reviewed=reviewed)
    for row in mappings:
        if (row["columna_original"] or row["valor_constante"]) and row["entrada_id"].strip() not in seen:
            fail("orphan_mapping", "Hay asignaciones con entrada_id inexistente en plan_fuentes.")
        if ((row["columna_original"] or row["valor_constante"])
                and row["entrada_id"].strip() in selected_roles
                and selected_roles[row["entrada_id"].strip()] != row["fuente"].strip()):
            fail("mapping_role_mismatch", "Hay asignaciones para una fuente distinta de la seleccionada en esa entrada.",
                 entry=row["entrada_id"].strip(), resolution="Corrija fuente en plan_fuentes o duplique la entrada con otro identificador para usar la misma hoja en dos fuentes.")
    for name in ["employment", "outcomes", "followup"]:
        derived = name == "followup" and isinstance(cfg.get("followup_derivation"), dict) and cfg["followup_derivation"].get("mode") == "employment_intersect_registry"
        if not cfg["sources"][name]["enabled"] and not derived:
            fail("required_source_not_selected", "Seleccione las entradas de la fuente obligatoria " + name + ".")
    if (isinstance(cfg.get("followup_derivation"), dict)
            and cfg["followup_derivation"].get("mode") == "employment_intersect_registry"
            and cfg["sources"]["followup"]["enabled"]):
        fail("duplicate_followup_strategy", "Elija seguimiento explícito o derivado documentado; no ambos simultáneamente.")
    try:
        validate_config(cfg)
    except (ValueError, TypeError, KeyError, AttributeError) as exc:
        fail("protocol_invalid", str(exc))
    return finish(cfg)
'''

# ARCHIVO 13 DE 25: rehavid_el/data.py
FUENTES['rehavid_el/data.py'] = r'''"""Lectura, trazabilidad y validación estructural. No imputa etiquetas."""
from pathlib import Path
import hashlib
import numpy as np
import pandas as pd
from .config import SCHEMAS, DATES, KINDS, DataContractError, normalized, employment_features, required_columns, validation_rules

def read_file(path, sheet=0, *, options=None, nrows=None, usecols=None):
    options = options or {}
    path = Path(path)
    suffix = path.suffix.lower()
    if suffix in {".csv", ".tsv"}:
        return pd.read_csv(path, sep=options.get("sep", "\t" if suffix == ".tsv" else ","),
                           encoding=options.get("encoding", "utf-8-sig"), header=options.get("header", 0),
                           dtype=str, nrows=nrows, usecols=usecols)
    if suffix in {".xlsx", ".xlsm", ".xls", ".xlsb"}:
        engine = "pyxlsb" if suffix == ".xlsb" else ("xlrd" if suffix == ".xls" else "openpyxl")
        return pd.read_excel(path, sheet_name=sheet, dtype=str, engine=engine,
                             header=options.get("header", 0), nrows=nrows, usecols=usecols)
    if suffix == ".parquet":
        if nrows == 0:
            import pyarrow.parquet as pq
            return pd.DataFrame(columns=pq.read_schema(path).names)
        frame = pd.read_parquet(path, columns=usecols)
        return frame.head(nrows) if nrows is not None else frame
    raise DataContractError(f"Formato no soportado: {suffix}")

def source_paths(source, base):
    paths = source.get("path", [])
    if isinstance(paths, str):
        paths = [paths]
    return [Path(p) if Path(p).is_absolute() else Path(base) / p for p in paths]

def inspect_sources(cfg, base):
    rows, packet = [], {"company": cfg.get("company"), "sources": {},
        "instructions": "Sólo esquema y recuentos agregados. No deduzca origen laboral, fechas de disponibilidad ni cobertura. Proponga mapeos para revisión humana. No hay registros individuales."}
    for name, source in cfg.get("sources", {}).items():
        if not source.get("enabled", True):
            continue
        schemas = []
        for path in source_paths(source, base):
            if not path.exists():
                rows.append(dict(source=name, file=path.name, status="missing", rows=None, columns=None))
                schemas.append({"file": path.name, "status": "missing"})
                continue
            df = read_file(path, source.get("sheet", 0), options=source, nrows=0)
            with path.open("rb") as handle:
                sha = hashlib.file_digest(handle, "sha256").hexdigest()
            rows.append(dict(source=name, file=path.name, status="schema_read", rows=None, columns=len(df.columns), sha256=sha))
            schemas.append({"file": path.name, "columns": [str(c) for c in df.columns], "rows": None,
                            "row_count_status": "not_counted_header_only", "sheet": source.get("sheet", 0),
                            "proposed_mapping": source.get("columns", {})})
        packet["sources"][name] = schemas
    return pd.DataFrame(rows), packet

def load_tables(cfg, base):
    # Las reglas V3 se comprueban también al cargar directamente. Configuraciones
    # V2 sin las nuevas claves conservan el comportamiento de sus predictores.
    validation_rules(cfg)
    tables, quality, issues = {}, [], []
    for name, columns in SCHEMAS.items():
        source = cfg.get("sources", {}).get(name, {})
        if not source.get("enabled", False):
            if name in {"employment", "outcomes", "followup"}:
                raise DataContractError(f"Fuente obligatoria no habilitada: {name}")
            tables[name] = pd.DataFrame(columns=columns)
            continue
        paths = source_paths(source, base)
        if not paths:
            raise DataContractError(f"{name}: falta path.")
        chunks = []
        for path in paths:
            raw = read_file(path, source.get("sheet", 0), options=source)
            if not raw.columns.is_unique:
                raise DataContractError(f"{name}: columnas repetidas.")
            mapping = source.get("columns", {})
            constants = source.get("constants", {})
            if set(constants) - {"company", "source_kind"}:
                raise DataContractError(f"{name}: no se permite inventar constantes de fechas, eventos o seguimiento.")
            for canonical, constant in constants.items():
                original = mapping.get(canonical)
                if original in raw.columns:
                    observed = raw[original].dropna().astype(str).str.strip()
                    if observed.ne(str(constant).strip()).any():
                        raise DataContractError(
                            f"{name}: constants.{canonical} contradice una columna original mapeada; "
                            "una constante no puede ocultar otra empresa ni reclasificar una fuente.")
            mapped = {}
            optional = (["outcome_group"] if name == "outcomes" and "outcome_group" in mapping else [])
            optional += (["effective_from"] if name == "employment" and "effective_from" in mapping else [])
            for canonical in columns + optional:
                if name == "employment" and canonical in {"job", "area", "site"} and canonical not in required_columns(cfg, name):
                    # Una selección mínima no transporta atributos actuales a
                    # fechas históricas, aunque estén presentes en el original.
                    mapped[canonical] = pd.Series(np.nan, index=raw.index)
                elif canonical in constants:
                    mapped[canonical] = pd.Series(constants[canonical], index=raw.index)
                elif canonical in mapping and mapping[canonical] in raw.columns:
                    mapped[canonical] = raw[mapping[canonical]]
                elif name == "health_events" and canonical in {"days", "severity"} and canonical not in mapping:
                    # Ausencia declarada de un atributo opcional: faltante, nunca cero.
                    mapped[canonical] = pd.Series(np.nan, index=raw.index)
                else:
                    raise DataContractError(f"{name}: falta mapeo/columna {canonical}. Corrija config; no se sustituye por cero.")
            chunks.append(pd.DataFrame(mapped))
        df = pd.concat(chunks, ignore_index=True)
        n_before = len(df)
        quality.append(dict(source=name, check="rows_read", count=n_before))
        df = df.drop_duplicates().reset_index(drop=True)
        quality.append(dict(source=name, check="exact_duplicates_removed", count=n_before-len(df)))
        for col in columns:
            quality.append(dict(source=name, check=f"missing_{col}", count=int(df[col].isna().sum())))
        for col in [c for c in ["company", "person_id", "spell_id", "event_id"] if c in df]:
            if df[col].isna().any() or df[col].astype(str).str.strip().eq("").any():
                raise DataContractError(f"{name}: {col} vacío.")
            df[col] = df[col].astype(str).str.strip()
        if len(df) and set(df["company"]) != {cfg["company"]}:
            raise DataContractError(f"{name}: contiene otra empresa. Separe explícitamente antes de ejecutar.")
        for col in set(df.columns) & DATES:
            raw = df[col].map(lambda x: np.nan if isinstance(x, str) and not x.strip() else x)
            # ISO recomendado. dayfirst no se infiere silenciosamente.
            fmt = source.get("date_formats", {}).get(col, source.get("date_format", "ISO8601"))
            if isinstance(fmt, dict):
                if fmt.get("kind") != "excel_serial" or not fmt.get("origin"):
                    raise DataContractError(f"{name}: formato de fecha estructurado requiere kind=excel_serial y origin verificado.")
                number = pd.to_numeric(raw, errors="coerce")
                if (raw.notna() & number.isna()).any():
                    raise DataContractError(f"{name}: {col} mezcla números seriales con texto; normalice las versiones explícitamente.")
                parsed = pd.to_datetime(number, unit="D", origin=fmt["origin"], errors="coerce", utc=True).dt.tz_convert(None).dt.normalize()
            else:
                parsed = pd.to_datetime(raw, format=fmt, errors="coerce", utc=True).dt.tz_convert(None).dt.normalize()
            if (raw.notna() & parsed.isna()).any():
                raise DataContractError(f"{name}: fechas ilegibles en {col}; use ISO o date_format explícito.")
            if col != "end_date" and parsed.isna().any():
                raise DataContractError(f"{name}: falta fecha {col}.")
            df[col] = parsed
        for col in set(df.columns) & {"days", "severity", "exposure_value"}:
            original = df[col].replace(r"^\s*$", np.nan, regex=True)
            num = pd.to_numeric(original, errors="coerce")
            if (original.notna() & num.isna()).any() or np.isinf(num).any():
                raise DataContractError(f"{name}: {col} debe ser numérico; no se infieren escalas clínicas.")
            if col == "days" and (num < 0).any():
                raise DataContractError("health_events: días negativos.")
            df[col] = num
        if name == "employment":
            if (df.end_date < df.start_date).any():
                raise DataContractError("employment: fin contractual anterior al inicio.")
            if "effective_from" not in df:
                attributes = [c for c in employment_features(cfg) if c in {"job", "area", "site"}]
                changed = df.groupby(["person_id", "spell_id"])[attributes].nunique(dropna=False).gt(1).any(axis=1)
                if changed.any():
                    raise DataContractError("employment: los cambios de cargo/área/sede requieren effective_from (vigencia) además de recorded_at (disponibilidad).")
                df["effective_from"] = df.start_date
            if (df.effective_from < df.start_date).any():
                raise DataContractError("employment: effective_from anterior al vínculo; revise historia.")
            key = ["person_id", "spell_id", "effective_from", "recorded_at"]
        elif name == "outcomes":
            exact = {normalized(k): v for k, v in cfg["status_map"].items()}
            df["state"] = df.status.map(lambda x: exact.get(normalized(x), "unknown"))
            n_unknown = int(df.state.eq("unknown").sum())
            if n_unknown:
                issues.append(dict(severity="warning", code="unknown_outcome_status", count=n_unknown,
                                   message="Estados no resueltos: no cuentan como confirmados; restringen seguimiento."))
            if (df.event_date > df.available_at).any():
                raise DataContractError("outcomes: evento posterior a disponibilidad; revise significado de ambas fechas.")
            if cfg.get("outcome_group") is not None and "outcome_group" not in df:
                raise DataContractError("outcomes: se pidió grupo específico sin campo outcome_group.")
            key = ["person_id", "event_id", "available_at"]
        elif name == "followup":
            if (df.obs_end < df.obs_start).any() or (df.obs_end > df.verified_at).any():
                raise DataContractError("followup: intervalo invertido o verificado antes de terminar. No se permite seguimiento futuro inventado.")
            key = ["person_id", "obs_start", "obs_end", "verified_at"]
        elif name == "health_events":
            if not set(df.source_kind.dropna()).issubset(set(KINDS)):
                raise DataContractError("health_events: source_kind no reconocido; mapee explícitamente las cuatro categorías canónicas.")
            if (df.event_date > df.available_at).any():
                raise DataContractError("health_events: evento posterior a disponibilidad.")
            if df.source_kind.isna().any():
                raise DataContractError("health_events: source_kind vacío; no se puede atribuir el registro a su fuente.")
            key = ["person_id", "source_kind", "event_id", "available_at"]
        else:
            if (df.end_date < df.start_date).any():
                raise DataContractError("exposures: intervalo invertido.")
            key = ["person_id", "exposure_name", "start_date", "available_at"]
        # Dos representaciones equivalentes (espacios en llaves, ISO con/sin
        # hora o números textuales) pueden volverse idénticas tras normalizar.
        # Se eliminan sólo filas completas iguales; las contradicciones reales
        # de una misma clave siguen bloqueadas en la comprobación siguiente.
        canonical_before = len(df)
        df = df.drop_duplicates().reset_index(drop=True)
        quality.append(dict(source=name, check="normalized_exact_duplicates_removed", count=canonical_before-len(df)))
        if df.duplicated(key).any():
            raise DataContractError(f"{name}: versiones contradictorias para la misma clave/fecha; resuelva duplicados.")
        tables[name] = df
    roster_ids = set(tables["employment"].person_id)
    for name, frame in tables.items():
        if name == "employment" or frame.empty:
            continue
        unlinked = frame.loc[~frame.person_id.isin(roster_ids)]
        quality.append(dict(source=name, check="unlinked_people_to_employment", count=int(unlinked.person_id.nunique())))
        if len(unlinked):
            issues.append(dict(severity="warning", code=f"{name}_unlinked_people", count=int(unlinked.person_id.nunique()),
                public_message="Hay personas sin enlace con el historial laboral. Verifique ex empleados y equivalencias de identificadores antes de interpretar ausencia de eventos."))
    return tables, pd.DataFrame(quality), issues
'''

# ARCHIVO 14 DE 25: rehavid_el/discovery.py
FUENTES['rehavid_el/discovery.py'] = r'''"""Inventario previo al mapeo, sin remitir registros individuales a una IA.

Lee todas las fuentes compatibles y todas las hojas Excel. Los recuentos de
muestras nunca se presentan como el tamaño total. Las fechas sólo se examinan
si el usuario identifica la columna y su formato; la cobertura observada en
una muestra NO certifica cobertura clínica ni seguimiento individual.
"""
from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any

import pandas as pd

from .config import SCHEMAS

SUPPORTED_SUFFIXES = frozenset({".csv", ".tsv", ".parquet", ".xls", ".xlsx", ".xlsm", ".xlsb"})
EXCEL_SUFFIXES = frozenset({".xls", ".xlsx", ".xlsm", ".xlsb"})
_ENGINES = {".xls": "xlrd", ".xlsx": "openpyxl", ".xlsm": "openpyxl", ".xlsb": "pyxlsb"}


def _public_header(value: Any, position: int) -> tuple[str, bool]:
    """Oculta encabezados que parecen identificadores personales directos.

    Es una precaución limitada: nombres libres en cabeceras no se pueden
    detectar con certeza. El paquete sigue requiriendo revisión antes de envío.
    """
    label = str(value).strip()
    suspicious = bool(re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", label))
    suspicious |= bool(re.fullmatch(r"[\d\s.()+-]{6,}", label))
    return (f"COLUMNA_{position + 1}_REVISAR", True) if suspicious else (label, False)


def _options_for(relative: str, options: dict[str, Any], sheet: str | None = None) -> dict[str, Any]:
    result = dict(options.get("defaults", {}))
    result.update(options.get("files", {}).get(relative, {}))
    sheet_settings = result.pop("sheets", {})
    if not isinstance(sheet_settings, dict):
        raise ValueError("Las opciones sheets deben ser un objeto indexado por el nombre exacto de hoja.")
    if sheet is not None:
        override = sheet_settings.get(sheet, {})
        if not isinstance(override, dict):
            raise ValueError("Las opciones de cada hoja deben ser un objeto.")
        result.update(override)
    return result


def _read_sample(path: Path, sheet: str | None, opt: dict, limit: int):
    """Devuelve muestra acotada, total comprobado o None, y si hubo truncado."""
    suffix = path.suffix.lower()
    if suffix in {".csv", ".tsv"}:
        frame = pd.read_csv(
            path, sep=opt.get("sep", "\t" if suffix == ".tsv" else ","),
            encoding=opt.get("encoding", "utf-8-sig"), dtype=str,
            nrows=limit + 1, header=opt.get("header", 0),
            keep_default_na=True, on_bad_lines="error",
        )
        n_rows = len(frame) if len(frame) <= limit else None
    elif suffix in EXCEL_SUFFIXES:
        frame = pd.read_excel(path, sheet_name=sheet, engine=_ENGINES[suffix],
                              dtype=str, nrows=limit + 1, header=opt.get("header", 0))
        # Una hoja puede tener grandes espacios vacíos y filas posteriores.
        # Ni len(muestra) ni max_row del archivo prueban registros totales.
        n_rows = None
    else:
        import pyarrow.parquet as pq
        parquet = pq.ParquetFile(path)
        n_rows = int(parquet.metadata.num_rows)
        if n_rows:
            first = next(parquet.iter_batches(batch_size=limit + 1))
            frame = first.to_pandas()
        else:
            frame = pd.DataFrame(columns=parquet.schema_arrow.names)
    return frame.iloc[:limit].copy(), n_rows, bool(len(frame) > limit)


def _date_summary(frame: pd.DataFrame, opt: dict, minimum: int = 5) -> list[dict]:
    """Rango agregado de muestra para fechas expresamente declaradas."""
    declarations = opt.get("date_columns", {})
    if isinstance(declarations, list):
        declarations = {name: opt.get("date_format") for name in declarations}
    summaries = []
    for name, date_format in declarations.items():
        position = next((i for i, col in enumerate(frame.columns) if str(col) == str(name)), None)
        if position is None:
            summaries.append({"column": str(name), "status": "declared_column_missing"})
            continue
        header, redacted = _public_header(name, position)
        if redacted:
            summaries.append({"column": header, "status": "header_requires_local_review"})
            continue
        if not date_format:
            summaries.append({"column": header, "status": "explicit_date_format_required"})
            continue
        values = frame.iloc[:, position].replace(r"^\s*$", pd.NA, regex=True)
        parsed = pd.to_datetime(values, format=date_format, errors="coerce", utc=True)
        observed = int(values.notna().sum())
        valid = int(parsed.notna().sum())
        summary = {"column": header, "format_declared": str(date_format),
                   "status": "sample_only", "nonmissing_sample": observed,
                   "parse_failures_sample": observed - valid,
                   "minimum_sample_date": None, "maximum_sample_date": None}
        if valid >= minimum:
            # Rango de cobertura por mes: evita publicar fechas individuales.
            summary["minimum_sample_date"] = parsed.min().strftime("%Y-%m")
            summary["maximum_sample_date"] = parsed.max().strftime("%Y-%m")
        else:
            summary["status"] = "range_withheld_small_sample"
        summaries.append(summary)
    return summaries


def discover_sources(directory, output_dir, *, options=None, sample_rows=200) -> dict:
    """Inventaría recursivamente archivos/hojas y crea un paquete de esquema.

    ``options`` admite ``defaults`` y ``files`` por ruta relativa, por ejemplo:
    {"files": {"ausentismo.csv": {"sep": ";", "encoding": "utf-8-sig",
       "date_columns": {"FECHA": "%d/%m/%Y"}},
       "casos.xlsx": {"header": 0, "sheets": {"EL": {"header": 2}}}}}.
    La precedencia es defaults, archivo y hoja. La hoja usa su nombre exacto;
    header es el número de fila base cero, declarado, no detectado por la IA.
    La selección de columnas canónicas, desenlace, estado y cobertura queda
    vacía. Los CSV de inventario contienen rutas locales y NO deben enviarse
    automáticamente a una IA. El JSON público usa códigos de fuente/hoja.
    """
    directory = Path(directory).expanduser().resolve()
    output_dir = Path(output_dir).expanduser().resolve()
    if not directory.is_dir():
        raise NotADirectoryError("La carpeta de fuentes no existe o no es una carpeta.")
    if isinstance(sample_rows, bool) or not isinstance(sample_rows, int) or not 1 <= sample_rows <= 10000:
        raise ValueError("sample_rows debe ser un entero entre 1 y 10000.")
    options = options or {}
    if not isinstance(options, dict):
        raise ValueError("options debe ser un objeto con defaults/files.")
    # Congelar el inventario antes de escribir evita inventariar estos resultados.
    exclude_output_tree = directory in output_dir.parents
    paths = sorted(p for p in directory.rglob("*") if p.is_file()
                   and p.suffix.lower() in SUPPORTED_SUFFIXES
                   and not p.name.startswith("~$")
                   and not (exclude_output_tree and output_dir in p.parents)
                   and p != output_dir / "inventario_fuentes_local.csv")
    output_dir.mkdir(parents=True, exist_ok=True)
    rows, sources, issues = [], [], []
    for file_number, path in enumerate(paths, start=1):
        source_id = f"FUENTE_{file_number:04d}"
        relative = path.relative_to(directory).as_posix()
        opt = _options_for(relative, options)
        try:
            if path.suffix.lower() in EXCEL_SUFFIXES:
                with pd.ExcelFile(path, engine=_ENGINES[path.suffix.lower()]) as workbook:
                    sheets = list(workbook.sheet_names)
            else:
                sheets = [None]
        except Exception as exc:
            issues.append({"source_id": source_id, "code": "workbook_unreadable", "error_type": type(exc).__name__})
            rows.append({"source_id": source_id, "path_local": relative, "sheet_local": None,
                         "status": "unreadable", "n_rows": None, "n_columns": None,
                         "sample_rows": 0, "sample_truncated": None})
            sources.append({"source_id": source_id, "format": path.suffix.lower(), "status": "unreadable", "sheets": []})
            continue
        public_sheets = []
        for sheet_number, sheet in enumerate(sheets, start=1):
            sheet_id = f"HOJA_{sheet_number:03d}"
            row = {"source_id": source_id, "path_local": relative, "sheet_local": sheet,
                   "sheet_id": sheet_id, "status": "read", "n_rows": None,
                   "n_columns": None, "sample_rows": 0, "sample_truncated": None}
            try:
                sheet_opt = _options_for(relative, options, sheet)
                frame, n_rows, truncated = _read_sample(path, sheet, sheet_opt, sample_rows)
                headers, redacted = [], []
                for position, col in enumerate(frame.columns):
                    header, hidden = _public_header(col, position)
                    headers.append(header)
                    if hidden:
                        redacted.append(position + 1)
                sample_status = "read" if len(frame) else ("empty" if n_rows == 0 else "sample_empty_total_unknown")
                row.update(n_rows=n_rows, n_columns=len(frame.columns), sample_rows=len(frame), sample_truncated=truncated,
                           status=sample_status)
                public_sheets.append({"sheet_id": sheet_id, "status": row["status"],
                    "columns": headers, "header_positions_requiring_local_review": redacted,
                    "n_rows": n_rows, "total_rows_known": n_rows is not None,
                    "sample_rows": len(frame), "sample_truncated": truncated,
                    "missingness_sample": [{"column": label, "missing_count": int(frame.iloc[:, i].isna().sum())}
                                           for i, label in enumerate(headers)],
                    "declared_date_columns_sample": _date_summary(frame, sheet_opt),
                    "proposed_mapping": {}})
            except pd.errors.EmptyDataError:
                row.update(status="empty_without_header", n_rows=0, n_columns=0, sample_truncated=False)
                public_sheets.append({"sheet_id": sheet_id, "status": "empty_without_header", "columns": [],
                                      "n_rows": 0, "total_rows_known": True, "sample_rows": 0,
                                      "sample_truncated": False, "proposed_mapping": {}})
            except Exception as exc:
                row["status"] = "unreadable"
                # El texto de una excepción puede contener valores del archivo.
                issues.append({"source_id": source_id, "sheet_id": sheet_id,
                               "code": "sheet_unreadable", "error_type": type(exc).__name__})
                public_sheets.append({"sheet_id": sheet_id, "status": "unreadable", "proposed_mapping": {}})
            rows.append(row)
        sources.append({"source_id": source_id, "format": path.suffix.lower(), "sheets": public_sheets})
    packet = {"purpose": "Descubrimiento de fuentes para un modelo predictivo de enfermedad laboral",
              "created_utc": datetime.now(timezone.utc).isoformat(),
              "sample_limit_per_sheet": sample_rows, "sources": sources, "issues": issues,
              "no_individual_records": True, "automatic_data_transfer": False,
              "instructions": [
                  "No se incluyeron registros, categorías observadas ni identificadores de personas.",
                  "Revisar nombres de columnas antes de compartir: los encabezados libres pueden contener datos personales.",
                  "n_rows=null significa total desconocido; sample_rows no es el total de la base.",
                  "El rango de meses de una muestra no acredita cobertura, ausencia de enfermedad ni seguimiento.",
                  "No adivinar mapeos, estados clínicos, origen laboral, fechas de disponibilidad ni datos faltantes.",
                  "Solicitar y documentar validación humana del desenlace y de cada mapeo propuesto.",
              ]}
    mapping_template = {"explanation": "Plantilla sin mapeos inferidos. Completar con ingeniería de datos y medicina laboral.",
                        "status_map": {}, "outcome_name": None, "outcome_date_basis": None,
                        "sources": {name: {"source_ids": [], "sheet_ids": [], "path": None,
                                            "columns": {col: None for col in schema},
                                            "date_format": None, "coverage_start": None,
                                            "coverage_end": None, "available_through": None}
                                    for name, schema in SCHEMAS.items()}}
    columns = ["source_id", "path_local", "sheet_local", "sheet_id", "status", "n_rows",
               "n_columns", "sample_rows", "sample_truncated"]
    inventory_path = output_dir / "inventario_fuentes_local.csv"
    pd.DataFrame(rows, columns=columns).to_csv(inventory_path, index=False)
    packet_path = output_dir / "paquete_descubrimiento_para_ia.json"
    mapping_path = output_dir / "plantilla_mapeo_por_completar.json"
    for target, content in [(packet_path, packet), (mapping_path, mapping_template)]:
        target.write_text(json.dumps(content, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    return {"status": "completed_with_issues" if issues else "completed", "files": len(paths),
            "sheets_or_tables": len(rows), "inventory": rows, "issues": issues,
            "paths": {"inventory_local": str(inventory_path), "ai_packet": str(packet_path),
                      "mapping_template": str(mapping_path)}}
'''

# ARCHIVO 15 DE 25: rehavid_el/evidence.py
FUENTES['rehavid_el/evidence.py'] = r'''"""Detecta contradicciones explícitas; no verifica documentos ni su autenticidad.

La ausencia de un hallazgo significa solamente que no se encontró una de las
declaraciones contradictorias reconocidas. No acredita vigilancia del registro,
disponibilidad histórica ni suficiencia clínica. No se infiere cobertura a
partir de las fechas mínima/máxima de los casos.
"""
import re
import unicodedata


def _text(value):
    if not isinstance(value, str):
        return ""
    return " ".join("".join(char for char in unicodedata.normalize("NFKD", value.casefold())
                            if not unicodedata.combining(char)).split())


_PENDING_STATUS = {
    "pending", "unverified", "inferred_from_case_dates", "pending_verification",
    "pendiente", "sin_verificar", "no_verificado", "por_confirmar",
    "inferida_de_fechas_de_casos", "inferred_from_outcome_dates",
}
_PLACEHOLDERS = {
    "por definir", "por confirmar", "por verificar", "pendiente", "sin verificar",
    "no verificado", "no verificada", "pending", "unverified", "tbd", "todo",
    "placeholder", "completar", "por completar", "pendiente de confirmar",
    "pendiente de verificar", "pendiente de validacion", "pending verification",
}

# Sólo estados directos al inicio de una cláusula. No basta la mera aparición
# de "pendiente" (p. ej. casos pendientes dentro de un registro completo), ni una
# recomendación/negación como "no se debe usar cobertura por confirmar".
_SUBJECT = r"(?:(?:la|el|su|the)\s+)?(?:cobertura|seguimiento|vigilancia|evidencia|coverage|follow.up|evidence)"
_QUALIFIER = r"(?:\s+(?:del?\s+registro|documental|poblacional|historica|del?\s+registro\s+el))?"
_COPULA = r"(?:\s+(?:esta|es|sigue|permanece|se\s+encuentra|is|remains))?"
_PENDING = r"(?:por\s+(?:confirmar|verificar|definir|documentar)|pendiente(?:\s+de\s+(?:confirmar|verificar|validar|confirmacion|verificacion|validacion))?|sin\s+(?:confirmar|verificar|documentar)|no\s+(?:confirmad[ao]|verificad[ao]|documentad[ao])|unverified|pending(?:\s+verification)?|not\s+(?:verified|confirmed))"
_DIRECT_PENDING = re.compile(r"^" + _SUBJECT + _QUALIFIER + _COPULA + r"\s+" + _PENDING + r"\b")
_DIRECT_LACK = re.compile(r"^(?:no\s+(?:hay|existe|se\s+dispone\s+de)|se\s+carece\s+de)\s+" + _SUBJECT
                          + _QUALIFIER + r"(?:\s+(?:confirmad[ao]|verificad[ao]|documentad[ao])\b|$)")
_PENDING_ASSIGNMENT = re.compile(r"^(?:estado\s+(?:de\s+)?(?:la\s+)?(?:cobertura|evidencia)|evidence\s+status)\s*[:=]\s*"
                                + _PENDING + r"\b")


def _explicit_pending(value):
    text = _text(value)
    if text.replace("_", " ").strip(" .:;-[]<>") in _PLACEHOLDERS:
        return True
    for clause in re.split(r"[;.!?\n]+", text):
        clause = clause.strip()
        match = _DIRECT_PENDING.match(clause) or _PENDING_ASSIGNMENT.match(clause)
        if match:
            # Una frase genérica que rechaza ese estado no afirma que exista.
            remainder = clause[match.end():].strip()
            if re.match(r"^(?:no\s+(?:es|implica|equivale)|is\s+not)\b", remainder):
                continue
            return True
        if _DIRECT_LACK.match(clause):
            return True
    return False


def rule_evidence_contradictions(rule, path):
    """Lista contradicciones de una regla revisada, sin devolver su texto libre."""
    if not isinstance(rule, dict) or rule.get("reviewed") is not True:
        return []
    findings = []
    status = _text(rule.get("evidence_status")).replace(" ", "_")
    if status in _PENDING_STATUS:
        findings.append({"path": f"{path}.evidence_status", "reason":
            "reviewed=true contradice un estado de evidencia pendiente, no verificada o inferida de fechas de casos."})
    for field in ("evidence_ref", "rationale"):
        if _explicit_pending(rule.get(field)):
            findings.append({"path": f"{path}.{field}", "reason":
                "reviewed=true contradice una declaración explícita de evidencia o cobertura pendiente/no acreditada."})
    return findings


def derivation_evidence_contradictions(cfg):
    """Revisa reglas activas y procedencia conservada de una preparación previa.

    ``evidence_status`` es opcional. No se exige ningún campo nuevo ni se
    considera que una palabra como ``verified`` autentique los documentos.
    """
    findings = []
    containers = [("", cfg)]
    provenance = cfg.get("preparation_provenance")
    if isinstance(provenance, dict):
        containers.append(("preparation_provenance.", provenance))
    for prefix, container in containers:
        for name, active_mode in [("contract_availability", "documented_contract_start"),
                                  ("followup_derivation", "employment_intersect_registry")]:
            rule = container.get(name)
            if not isinstance(rule, dict) or rule.get("mode") != active_mode:
                continue
            path = prefix + name
            findings.extend(rule_evidence_contradictions(rule, path))
            if name == "followup_derivation" and rule.get("reviewed") is True:
                coverage = rule.get("coverage", [])
                for index, interval in enumerate(coverage if isinstance(coverage, list) else []):
                    if isinstance(interval, dict):
                        # El intervalo hereda la revisión de la regla; no la puede
                        # contradecir con un estado pendiente omitido en el padre.
                        findings.extend(rule_evidence_contradictions(
                            {**interval, "reviewed": True}, f"{path}.coverage[{index}]"))
    return findings
'''

# ARCHIVO 16 DE 25: rehavid_el/ingest.py
FUENTES['rehavid_el/ingest.py'] = r'''"""Carga archivos originales sin aplanar rutas ni inferir decisiones clínicas.

La empresa es declarada por quien carga. Una configuración incluida debe
coincidir; las columnas empresariales se comprueban en preparación/limpieza.
Un nombre de carpeta o un hash no demuestra pertenencia ni cobertura clínica.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath, PureWindowsPath
import shutil
import stat
import tempfile
import unicodedata
import zipfile
from collections.abc import Mapping

from .config import DataContractError

_SOURCE_SUFFIXES = frozenset({".xlsx", ".xlsm", ".xls", ".xlsb", ".csv", ".tsv", ".parquet"})
_OUTPUT_FOLDERS = frozenset({"analisis", "analysis", "resultados", "results", "outputs",
                             "tables", "figures", "models", "tablas", "graficos", "modelos", "privado"})
_OUTPUT_NAMES = frozenset({"predicciones_por_persona_y_horizonte.csv", "metricas_por_horizonte.csv",
                          "estado_ejecucion.json", "manifiesto_ejecucion.json", "manifest_importacion.json"})
_MANIFEST_NAME = "manifest_importacion.json"


def _relative_name(name):
    if not isinstance(name, str) or not name or "\x00" in name:
        raise DataContractError("Cada archivo debe tener un nombre relativo válido.")
    # Se rechazan nombres de Windows, no se interpretan como carpetas Linux.
    win = PureWindowsPath(name)
    if "\\" in name or win.drive or name.startswith("/"):
        raise DataContractError(f"Ruta no admitida: {name!r}. Use nombres relativos con '/'.")
    pieces = name.split("/")
    if any(piece in {"", ".", ".."} for piece in pieces):
        raise DataContractError(f"Ruta ambigua o fuera de la carpeta: {name!r}.")
    return PurePosixPath(name)


def import_company_files(inputs, destination, company, *, max_total_bytes=2 * 1024**3, max_files=10000):
    """Importa ``{nombre_relativo: bytes}`` en una carpeta nueva o vacía.

    Admite originales sueltos, ZIP con carpetas conservadas y un JSON opcional
    de configuración (objeto con ``company`` exacto y ``sources``). El ZIP no
    identifica automáticamente qué archivos son fuentes. Si contiene salidas,
    documentos, otro JSON o formatos no admitidos, se rechaza íntegramente:
    seleccione únicamente los originales de la empresa o cree un ZIP con ellos.

    Valida todo antes de escribir. Rechaza archivos vacíos, colisiones también
    por mayúsculas/Unicode, rutas inseguras, enlaces, ZIP anidados y carpetas con
    contenido previo. Ignora sólo metadatos de macOS y los registra. No ejecuta
    macros, no cambia bytes, no normaliza fechas y no declara cobertura clínica.

    ``max_total_bytes`` acota el tamaño descomprimido; el límite predeterminado
    es 2 GiB. ``max_files`` acota archivos incluidos, también los metadatos.
    Devuelve un manifiesto serializable y lo guarda dentro de ``destination``.
    ``files`` contiene ruta, origen, tamaño y SHA-256 de cada archivo guardado;
    ``configuration_path`` es None si no se incluyó configuración. La carga
    no acredita que una fuente sin identificador pertenezca a la empresa.
    """
    if not isinstance(company, str) or not company.strip() or company != company.strip():
        raise DataContractError("Declare la empresa exacta, sin espacios exteriores.")
    if not isinstance(inputs, Mapping) or not inputs:
        raise DataContractError("No se cargaron archivos originales.")
    for value, label in ((max_total_bytes, "max_total_bytes"), (max_files, "max_files")):
        if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
            raise ValueError(f"{label} debe ser un entero positivo.")
    raw_destination = Path(destination).expanduser()
    if raw_destination.is_symlink():
        raise DataContractError("La carpeta de destino no puede ser un enlace simbólico.")
    root = raw_destination.resolve()
    if root.exists() and (not root.is_dir() or any(root.iterdir())):
        raise FileExistsError("La carpeta de originales ya tiene contenido. Use una carpeta nueva para esta empresa y ejecución.")

    pending, ignored, archives = [], [], []
    occupied, total_bytes, member_count = {}, 0, 0

    def stage_item(name, data, origin, member=None):
        nonlocal total_bytes, member_count
        relative = _relative_name(name)
        member_count += 1
        if member_count > max_files:
            raise DataContractError("La carga supera max_files. Seleccione únicamente las bases de esta empresa.")
        total_bytes += len(data)
        if total_bytes > max_total_bytes:
            raise DataContractError("La carga supera max_total_bytes descomprimidos. Divida la entrada o ajuste el límite explícitamente.")
        if "__MACOSX" in relative.parts or relative.name == ".DS_Store":
            ignored.append({"origin_name": origin, "archive_member": member, "reason": "macos_metadata"})
            return
        if (any(part.casefold() in _OUTPUT_FOLDERS for part in relative.parts[:-1])
                or relative.name.casefold() in _OUTPUT_NAMES
                or relative.parts[0].casefold() == _MANIFEST_NAME):
            raise DataContractError(f"{name!r} parece una salida de análisis. Seleccione sólo los originales de la empresa; no se reclasifica automáticamente.")
        suffix = relative.suffix.lower()
        if suffix not in _SOURCE_SUFFIXES and suffix != ".json":
            raise DataContractError(f"Formato no admitido como original: {name!r}. Seleccione sólo Excel, CSV, TSV o Parquet y, opcionalmente, su JSON de configuración.")
        if not data:
            raise DataContractError(f"El archivo {name!r} está vacío.")
        key = unicodedata.normalize("NFC", relative.as_posix()).casefold()
        if key in occupied:
            raise DataContractError(f"Colisión de archivos: {occupied[key]!r} y {name!r}. Conserve carpetas distintas o seleccione un único original; no se sobrescribe.")
        # Un archivo no puede ser el directorio de otro archivo.
        for previous in occupied:
            if key.startswith(previous + "/") or previous.startswith(key + "/"):
                raise DataContractError(f"Conflicto entre archivo y carpeta en {name!r}.")
        occupied[key] = name
        kind = "source"
        if suffix == ".json":
            try:
                cfg = json.loads(data.decode("utf-8-sig"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise DataContractError(f"JSON de configuración ilegible: {name!r}.") from exc
            if not isinstance(cfg, dict) or not isinstance(cfg.get("sources"), dict):
                raise DataContractError(f"{name!r} no es una configuración del motor. Seleccione sólo originales y el JSON de configuración de esta empresa.")
            if cfg.get("company") != company:
                raise DataContractError(f"La empresa del JSON {name!r} no coincide exactamente con la empresa declarada.")
            if any(item["kind"] == "configuration" for item in pending):
                raise DataContractError("Se encontró más de una configuración. Seleccione un único JSON revisado para esta empresa.")
            kind = "configuration"
        pending.append({"relative_path": relative.as_posix(), "origin_name": origin, "archive_member": member,
                        "size_bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
                        "kind": kind, "data": data})

    for name, value in sorted(inputs.items(), key=lambda item: str(item[0])):
        relative = _relative_name(name)
        if not isinstance(value, (bytes, bytearray, memoryview)):
            raise TypeError(f"El contenido de {name!r} debe ser bytes.")
        data = bytes(value)
        if relative.suffix.lower() != ".zip":
            stage_item(name, data, name)
            continue
        archives.append({"name": name, "size_bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
        try:
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                infos = archive.infolist()
                if len(infos) > max_files:
                    raise DataContractError("El ZIP supera max_files. Seleccione únicamente las bases de esta empresa.")
                if total_bytes + sum(info.file_size for info in infos) > max_total_bytes:
                    raise DataContractError("El ZIP supera max_total_bytes descomprimidos. Divida la entrada o ajuste el límite explícitamente.")
                for info in infos:
                    member_name = info.filename[:-1] if info.is_dir() else info.filename
                    _relative_name(member_name)
                    _relative_name(info.orig_filename.rstrip("/"))
                    mode = info.external_attr >> 16
                    file_type = stat.S_IFMT(mode)
                    if file_type not in (0, stat.S_IFREG, stat.S_IFDIR):
                        raise DataContractError(f"El ZIP contiene un enlace o archivo especial: {info.filename!r}.")
                    if info.flag_bits & 1:
                        raise DataContractError("El ZIP está cifrado. Descomprima sus originales y cargue sólo los archivos necesarios.")
                    if info.is_dir():
                        continue
                    if file_type == stat.S_IFDIR:
                        raise DataContractError(f"Entrada ZIP contradictoria: {info.filename!r}.")
                    stage_item(info.filename, archive.read(info), name, info.filename)
        except (zipfile.BadZipFile, NotImplementedError, RuntimeError) as exc:
            raise DataContractError(f"No se puede leer el ZIP {name!r}: {type(exc).__name__}.") from exc
    if not any(item["kind"] == "source" for item in pending):
        raise DataContractError("La carga no contiene ninguna base empresarial admitida.")

    files = [{**{k: v for k, v in item.items() if k != "data"},
              "path": str(root / item["relative_path"])} for item in pending]
    configs = [item["path"] for item in files if item["kind"] == "configuration"]
    manifest_path = root / _MANIFEST_NAME
    manifest = {"status": "imported", "company": company, "originals_directory": str(root),
                "company_check": "configuration_matches_declared_company" if configs else "uploader_declaration_only",
                "data_company_validation": "pending_source_mapping_and_preparation",
                "clinical_coverage_verified": False,
                "source_count": sum(item["kind"] == "source" for item in files),
                "configuration_path": configs[0] if configs else None,
                "files": files, "archives": archives, "ignored": ignored,
                "manifest_path": str(manifest_path)}
    root.parent.mkdir(parents=True, exist_ok=True)
    staged = Path(tempfile.mkdtemp(prefix=".rehavid_import_", dir=root.parent))
    try:
        for item in pending:
            target = staged / item["relative_path"]
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(item["data"])
        (staged / _MANIFEST_NAME).write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if root.exists():
            root.rmdir()  # Sólo se elimina la carpeta vacía; falla si apareció contenido.
        os.rename(staged, root)
    except Exception:
        shutil.rmtree(staged, ignore_errors=True)
        raise
    return manifest
'''

# ARCHIVO 17 DE 25: rehavid_el/mapping.py
FUENTES['rehavid_el/mapping.py'] = r'''"""Propuestas léxicas revisables para integrar originales de una empresa.

Reconocer un encabezado no acredita su significado clínico ni su disponibilidad
histórica. Este módulo inventaría todas las hojas mediante discovery y propone
candidatos sin asignarlos a las fuentes de entrenamiento. No transmite datos a
ningún proveedor de IA y nunca deduce un desenlace de los valores observados.
"""
from __future__ import annotations

from collections import Counter
import json
from pathlib import Path
import re
import unicodedata

import pandas as pd

from .config import SCHEMAS, template
from .discovery import _options_for, discover_sources


def _label(value):
    """Igualdad de encabezados, ignorando acentos, espacios y puntuación."""
    value = unicodedata.normalize("NFKD", str(value)).casefold()
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in value if not unicodedata.combining(c)))


# Las coincidencias son exactas después de normalizar; no se buscan subcadenas
# como «laboral» ni se usan similitudes difusas para decidir equivalencias.
_COMMON = {
    "company": ["company", "empresa", "razon social", "sociedad"],
    "person_id": ["person_id", "cedula", "identificacion", "numero identificacion",
                  "numero de identificacion", "numero de documento", "documento identidad",
                  "numero de personal", "SAPId", "numero ID Txt", "ID trabajador"],
}
_ALIASES = {
    "employment": {
        "spell_id": ["spell_id", "id vinculacion", "id contrato"],
        "start_date": ["start_date", "FechaIngreso", "fecha de ingreso", "inicio contrato"],
        "end_date": ["end_date", "FechaRetiro", "fecha de retiro", "fin contrato"],
        "recorded_at": ["recorded_at", "fecha disponibilidad", "fecha registro historico"],
        "job": ["job", "cargo", "puesto de trabajo", "PosicionName"],
        "area": ["area", "departamento", "centro de coste", "centro de costos"],
        "site": ["site", "sede", "centro de trabajo"],
    },
    "outcomes": {
        "event_id": ["event_id", "id caso", "numero de caso", "numero de expediente"],
        "status": ["status", "estado", "origen", "estado calificacion", "calificacion de origen"],
        "event_date": ["event_date", "FechaCalificacion", "fecha de calificacion",
                       "FechaEmisionConcepto", "fecha de emision concepto", "fecha diagnostico",
                       "fecha de diagnostico", "fecha firmeza", "fecha de firmeza"],
        "available_at": ["available_at", "fecha disponibilidad", "fecha recepcion concepto",
                         "fecha de recepcion concepto"],
    },
    "followup": {
        "obs_start": ["obs_start", "inicio observacion", "inicio seguimiento"],
        "obs_end": ["obs_end", "fin observacion", "fin seguimiento"],
        "verified_at": ["verified_at", "fecha verificacion seguimiento"],
    },
    "health_events": {
        "event_id": ["event_id", "id evento", "id incapacidad", "numero incapacidad"],
        "event_date": ["event_date", "fecha evento", "fecha accidente", "fecha inicio incapacidad"],
        "available_at": ["available_at", "fecha disponibilidad", "fecha registro evento"],
        "source_kind": ["source_kind", "tipo fuente", "tipo evento"],
        "days": ["days", "dias incapacidad", "dias de incapacidad", "dias ausentismo"],
        "severity": ["severity", "severidad", "gravedad"],
    },
    "exposures": {
        "start_date": ["start_date", "inicio exposicion", "fecha inicio exposicion"],
        "end_date": ["end_date", "fin exposicion", "fecha fin exposicion"],
        "available_at": ["available_at", "fecha disponibilidad", "fecha registro medicion"],
        "exposure_name": ["exposure_name", "exposicion", "factor exposicion", "factor de riesgo"],
        "exposure_value": ["exposure_value", "valor exposicion", "valor medicion"],
    },
}
_CRITICAL = {"person_id", "event_id", "status", "event_date", "recorded_at", "available_at",
             "obs_start", "obs_end", "verified_at", "start_date", "end_date"}


def _reason(role, canonical, column):
    if canonical == "person_id":
        return ("Comprobar tipo de identificador y conciliación entre bases; SAP, cédula y número "
                "de personal no son intercambiables por el nombre del campo.")
    if role == "outcomes" and canonical == "event_date":
        return ("La fecha de diagnóstico, emisión de concepto, calificación y firmeza pueden ser "
                "eventos distintos. Elegir la fecha que documente el desenlace definido; el nombre "
                "del encabezado no lo certifica.")
    if role == "outcomes" and canonical == "status":
        return ("Medicina laboral debe verificar estados exactos y su evidencia. La palabra LABORAL "
                "por sí sola no se transforma en confirmed.")
    if canonical in {"recorded_at", "available_at", "verified_at"}:
        return ("Verificar cuándo esta información concreta estaba disponible o fue comprobada. "
                "No sustituir por fecha de exportación, corte, ingreso o modificación sin evidencia.")
    if role == "followup":
        return ("Acreditar observación del desenlace por persona en este intervalo. La permanencia "
                "en nómina o la ausencia de registros no prueban seguimiento clínico completo.")
    if canonical in {"start_date", "end_date"}:
        return "Verificar significado, formato e historial de intervalos; no completar fechas por suposición."
    return "Coincidencia de encabezado; revisar definición, unidades, fuente y pertinencia antes de asignar."


def suggest_mapping(directory, output_dir, *, company="POR_DEFINIR", options=None) -> dict:
    """Crea candidatos revisables y una configuración deliberadamente incompleta.

    options conserva el contrato de discovery: defaults/files y sheets por
    archivo con sep, encoding y header (fila de encabezado base cero).
    No hay selección automática de
    archivos, fechas índice, estados clínicos ni identificadores equivalentes.
    Los CSV son locales; el paquete de IA usa códigos de fuente/hoja, no rutas,
    nombres de archivo, valores, filas ni categorías clínicas observadas.
    """
    directory = Path(directory).expanduser().resolve()
    output_dir = Path(output_dir).expanduser().resolve()
    if output_dir == directory:
        raise ValueError("Guarde el mapeo en una subcarpeta de salida o fuera de los originales.")
    discovered = discover_sources(directory, output_dir, options=options)
    packet = json.loads(Path(discovered["paths"]["ai_packet"]).read_text(encoding="utf-8"))
    inventory = {(r["source_id"], r.get("sheet_id")): r for r in discovered["inventory"]}
    normalized_aliases = {
        role: {canonical: {_label(alias) for alias in aliases}
               for canonical, aliases in {**_COMMON, **fields}.items()}
        for role, fields in _ALIASES.items()
    }
    rows, public_candidates = [], []
    for source in packet["sources"]:
        for sheet in source.get("sheets", []):
            item = inventory[(source["source_id"], sheet["sheet_id"])]
            reader_options = _options_for(item["path_local"], options or {}, item["sheet_local"])
            for position, column in enumerate(sheet.get("columns", []), start=1):
                if position in sheet.get("header_positions_requiring_local_review", []):
                    continue
                label = _label(column)
                for role, fields in normalized_aliases.items():
                    for canonical, aliases in fields.items():
                        if label not in aliases:
                            continue
                        public = {
                            "source_id": source["source_id"], "sheet_id": sheet["sheet_id"],
                            "role": role, "canonical": canonical, "column": column,
                            "column_position": position, "candidate_type": "exact_header_review_only",
                            "confidence": "lexical_match_only", "requires_review": True,
                            "critical_semantics": canonical in _CRITICAL,
                            "reason": _reason(role, canonical, column),
                        }
                        public_candidates.append(public)
                        rows.append({**public, "file": item["path_local"], "sheet": item["sheet_local"],
                                     "header": reader_options.get("header", 0)})
    counts_by_field = Counter((r["source_id"], r["sheet_id"], r["role"], r["canonical"]) for r in rows)
    for row in [*rows, *public_candidates]:
        row["candidates_in_sheet_for_field"] = counts_by_field[(row["source_id"], row["sheet_id"], row["role"], row["canonical"])]
    columns = ["role", "canonical", "file", "sheet", "header", "column", "column_position",
               "source_id", "sheet_id", "candidate_type", "confidence", "requires_review",
               "critical_semantics", "candidates_in_sheet_for_field", "reason"]
    review_path = output_dir / "propuestas_mapeo_revisar.csv"
    pd.DataFrame(rows, columns=columns).to_csv(review_path, index=False)

    draft = template()
    draft.update(company=company, outcome_name=None, outcome_date_basis=None,
                 mapping_reviewed=False, status_map={})
    for name, source in draft["sources"].items():
        source.update(enabled=False, path=None, inputs=[], columns={}, constants={},
                      coverage_start=None, coverage_end=None, available_through=None)
        source["mapping_reviewed"] = False
    draft_path = output_dir / "config_borrador_revisar.json"
    draft_path.write_text(json.dumps(draft, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")

    instructions = {
        "status": "human_mapping_required", "no_automatic_assignments": True,
        "purpose": "Preparar datos originales para predecir enfermedad laboral a 12, 36 y 60 meses.",
        "steps": [
            "Revisar el inventario de todas las hojas y corregir header/sep/encoding antes de usar candidatos.",
            "Seleccionar explícitamente qué archivos y hojas pertenecen a cada tabla canónica de una sola empresa.",
            "Conciliar identificadores con una tabla de equivalencias verificada cuando las fuentes usen claves diferentes.",
            "Definir desenlace y fecha con medicina laboral; documentar estados exactos en status_map.",
            "Acreditar seguimiento individual y disponibilidad histórica; derivar sólo de evidencia verificable y guardar la regla.",
            "Completar sources.<tabla>.inputs para varias entradas o path/sheet para una entrada; activar sólo tablas mapeadas.",
            "Los antecedentes y las exposiciones son opcionales; empleo, desenlace y seguimiento requieren fuentes verificadas.",
            "Completar cortes y diseño de validación antes de preflight/prepare; no elegir fechas para forzar resultados.",
            "Marcar mapping_reviewed=true sólo después de revisar cada asignación. No certifica revisión clínica independiente.",
        ],
        "input_specification_review_only": {
            "path": "RUTA_REAL_REVISADA", "sheet": "HOJA_REAL_REVISADA",
            "header": 0, "sep": ",", "encoding": "utf-8-sig",
            "columns": {"person_id": "ENCABEZADO_REAL_VERIFICADO"},
            "constants": {}, "date_formats": {},
        },
        "fields_to_document": SCHEMAS,
        "field_notes": {
            "company": "Constante de una sola empresa, si está acreditada por la procedencia del archivo.",
            "source_kind": "Constante sólo si se verificó el tipo de fuente; no deducir enfermedad laboral de ausentismo.",
            "available_at": "Fecha real de disponibilidad del registro; no asignar automáticamente la fecha del archivo.",
            "obs_end": "Fin de seguimiento acreditado por persona; no asumir que ausencia de evento significa sano.",
            "dates": "Declarar formatos; para fechas seriales Excel verificar el origen 1900/1904.",
        },
    }
    instructions_path = output_dir / "instrucciones_mapeo.json"
    instructions_path.write_text(json.dumps(instructions, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    packet["mapping_candidates"] = public_candidates
    packet["mapping_assignment_status"] = "no_assignments_human_review_required"
    packet["instructions"].extend([
        "Los candidatos son coincidencias de encabezados, no equivalencias verificadas.",
        "No seleccionar automáticamente entre varios candidatos ni entre fuentes por su nombre.",
        "No convertir LABORAL, sospecha o trámite en confirmed sin verificación del desenlace.",
    ])
    Path(discovered["paths"]["ai_packet"]).write_text(
        json.dumps(packet, ensure_ascii=False, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    return {
        "status": "review_required", "discovery_status": discovered["status"],
        "counts": {"files": discovered["files"], "sheets_or_tables": discovered["sheets_or_tables"],
                   "candidates": len(rows), "issues": len(discovered["issues"]),
                   "automatic_assignments": 0},
        "issues": discovered["issues"],
        "paths": {"config_template": str(draft_path), "mapping_review": str(review_path),
                  "inventory": discovered["paths"]["inventory_local"],
                  "ai_packet": discovered["paths"]["ai_packet"], "instructions": str(instructions_path)},
    }
'''

# ARCHIVO 18 DE 25: rehavid_el/models.py
FUENTES['rehavid_el/models.py'] = r'''"""Pronóstico de primer evento laboral mediante supervivencia.

El modelo se ajusta UNA vez en ``train``; su elección usa únicamente ``validation``.
``test`` se abre después de elegirlo. No se interpreta una puntuación de riesgo
como probabilidad, no se rellenan horizontes sin soporte y no se certifica validez
clínica por superar un umbral informático. La unidad es una persona por snapshot.

Las métricas IPCW usan Kaplan–Meier de censura en entrenamiento, lo que requiere
censura independiente. No corrigen pérdidas informativas, etiquetas incompletas,
sesgo de detección, confusión causal ni diferencias no medidas entre empresas.
La calibración se EVALÚA; este módulo no reajusta las probabilidades después.
"""
from __future__ import annotations

import json
import math
import platform
import warnings
from importlib.metadata import version
from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from sklearn.compose import ColumnTransformer
from sklearn.exceptions import ConvergenceWarning
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sksurv.ensemble import GradientBoostingSurvivalAnalysis, RandomSurvivalForest
from sksurv.linear_model import CoxPHSurvivalAnalysis
from sksurv.metrics import brier_score, concordance_index_ipcw, cumulative_dynamic_auc
from sksurv.nonparametric import CensoringDistributionEstimator, kaplan_meier_estimator
from sksurv.util import Surv

from .config import evaluation_rules


LIMITATIONS = [
    "Probabilidades de investigación; no constituyen diagnóstico ni calificación de origen laboral.",
    "No hay certificación automática de utilidad clínica ni autorización automática para decisiones individuales.",
    "Los mínimos de personas/eventos son guardas de cálculo, no un cálculo de tamaño muestral.",
    "IPCW y Kaplan–Meier suponen censura no informativa; el método no corrige su incumplimiento.",
    "La distribución de censura del entrenamiento debe ser apropiada para evaluar periodos posteriores; revisar cambios de seguimiento.",
    "No se implementan riesgos competitivos: si muerte, retiro u otro evento impiden el desenlace, revisar el estimando antes de interpretar estas probabilidades como incidencia acumulada.",
    "La selección de Cox no verifica automáticamente su supuesto de riesgos proporcionales; no se incluyen diagnósticos de Schoenfeld.",
    "No se implementa recalibración posterior; los gráficos evalúan la calibración del modelo congelado.",
    "Los intervalos bootstrap del rendimiento son condicionales al modelo ajustado; no incluyen incertidumbre de entrenamiento.",
    "No se producen intervalos individuales ni intervalos para la suma de probabilidades.",
    "No se extrapola a horizontes sin seguimiento, soporte de entrenamiento y evaluación estimable en el diseño declarado.",
    "Una empresa se analiza por separado; este ajuste no demuestra transporte a otras empresas.",
    "No se estima el efecto causal de una intervención ni el riesgo biológico fuera de la vigilancia definida.",
]


def _finite(value):
    """Representación JSON estricta: métricas no finitas se vuelven null."""
    if isinstance(value, dict):
        return {str(k): _finite(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_finite(v) for v in value]
    if isinstance(value, (np.bool_,)):
        return bool(value)
    if isinstance(value, (np.integer,)):
        return int(value)
    if isinstance(value, (np.floating, float)):
        return float(value) if math.isfinite(value) else None
    return value


def horizon_days(index_date, months: int) -> float:
    """Meses calendario desde la fecha de predicción, sin usar meses de 30 días."""
    start = pd.Timestamp(index_date)
    return float(((start + pd.DateOffset(months=int(months))) - start).days)


def _horizon(frame: pd.DataFrame, months: int) -> float:
    dates = pd.to_datetime(frame["index_date"]).dropna().unique()
    if len(dates) != 1:
        raise ValueError("Cada cohorte debe contener exactamente una fecha de predicción.")
    return horizon_days(dates[0], months)


def _survival(frame: pd.DataFrame):
    return Surv.from_arrays(frame["event"].to_numpy(dtype=bool), frame["duration_days"].to_numpy(dtype=float))


def _preprocessor(train: pd.DataFrame, features: list[str]) -> ColumnTransformer:
    numeric = [name for name in features if pd.api.types.is_numeric_dtype(train[name])]
    categorical = [name for name in features if name not in numeric]
    parts = []
    if numeric:
        parts.append(("numeric", Pipeline([
            ("impute", SimpleImputer(strategy="median", add_indicator=True, keep_empty_features=True)),
            ("scale", StandardScaler()),
        ]), numeric))
    if categorical:
        parts.append(("categorical", Pipeline([
            ("impute", SimpleImputer(strategy="constant", fill_value="SIN_DATO", keep_empty_features=True)),
            ("encode", OneHotEncoder(handle_unknown="ignore", sparse_output=False, drop="first")),
        ]), categorical))
    return ColumnTransformer(parts, remainder="drop", sparse_threshold=0)


def _candidate(name: str, train: pd.DataFrame, features: list[str], config: dict) -> Pipeline:
    seed = int(config.get("seed", 2026))
    user = config.get("models", {}).get(name, {})
    if name == "cox":
        params = {"alpha": 1.0, "n_iter": 200}
        params.update(user)
        estimator = CoxPHSurvivalAnalysis(**params)
    elif name == "rsf":
        params = {"n_estimators": 100, "min_samples_leaf": 10, "max_features": "sqrt", "n_jobs": 1, "random_state": seed}
        params.update(user)
        estimator = RandomSurvivalForest(**params)
    elif name == "gb":
        params = {"loss": "coxph", "n_estimators": 100, "learning_rate": 0.05, "max_depth": 2, "random_state": seed}
        params.update(user)
        if params["loss"] != "coxph":
            raise ValueError("GB requiere loss='coxph' para producir funciones de supervivencia.")
        estimator = GradientBoostingSurvivalAnalysis(**params)
    else:
        raise ValueError(f"Modelo no implementado: {name}")
    return Pipeline([("preprocess", _preprocessor(train, features)), ("survival", estimator)])


def _x(frame: pd.DataFrame, features: list[str]) -> pd.DataFrame:
    out = frame[features].copy()
    for col in out:
        if pd.api.types.is_numeric_dtype(out[col]):
            out[col] = pd.to_numeric(out[col], errors="coerce").replace([np.inf, -np.inf], np.nan)
        else:
            # SimpleImputer cannot compare pd.NA reliably with mixed object values.
            out[col] = out[col].map(lambda item: str(item) if pd.notna(item) else np.nan)
    return out


def _risks(model: Pipeline, frame: pd.DataFrame, features: list[str], horizon: float) -> np.ndarray:
    probabilities = []
    # La evaluación por lotes limita la memoria al puntuar plantillas grandes.
    for start in range(0, len(frame), 512):
        functions = model.predict_survival_function(_x(frame.iloc[start:start + 512], features))
        for function in functions:
            if horizon < float(function.domain[0]) or horizon > float(function.domain[1]):
                raise ValueError("Horizonte fuera del dominio de la supervivencia ajustada; no se extrapola.")
            probabilities.append(1.0 - float(function(horizon)))
    result = np.asarray(probabilities)
    if not np.isfinite(result).all() or ((result < -1e-10) | (result > 1 + 1e-10)).any():
        raise ValueError("El estimador produjo probabilidades inválidas.")
    return np.clip(result, 0, 1)


def _km_risk(y, horizon: float, confidence=0.95) -> tuple[float, float, float]:
    if not np.any(y["event"] & (y["time"] <= horizon)):
        # Greenwood/log-log degenera en [0,0] sin eventos, lo que no demuestra
        # riesgo nulo. Se conserva el estimador puntual y se omite ese intervalo.
        return 0.0, np.nan, np.nan
    times, survival, intervals = kaplan_meier_estimator(
        y["event"], y["time"], conf_type="log-log", conf_level=confidence,
    )
    pos = np.searchsorted(times, horizon, side="right") - 1
    if pos < 0:
        return 0.0, np.nan, np.nan
    return float(1 - survival[pos]), float(1 - intervals[1, pos]), float(1 - intervals[0, pos])


def _support(train_y, target_y, horizon: float, evaluation: dict, stage: str) -> dict:
    """Guardas explícitas antes de consultar un estimador; no son criterios clínicos."""
    result = {
        "status": "estimable", "reason": "", "horizon_days": horizon,
        "n_people": len(target_y), "events_by_horizon": int(np.sum(target_y["event"] & (target_y["time"] <= horizon))),
        "at_risk_horizon": int(np.sum(target_y["time"] > horizon)),
        "training_at_risk_horizon": int(np.sum(train_y["time"] > horizon)),
        "training_events_by_horizon": int(np.sum(train_y["event"] & (train_y["time"] <= horizon))),
    }
    reasons = []
    min_people = int(evaluation.get(f"min_{stage}_people", 10))
    min_events = int(evaluation.get(f"min_{stage}_events", 2))
    min_at_risk = int(evaluation.get("min_at_risk", 5))
    if len(target_y) < min_people:
        reasons.append("personas insuficientes para la guarda de cálculo")
    if horizon >= float(np.max(train_y["time"])):
        reasons.append("horizonte sin seguimiento posterior en entrenamiento")
    if result["training_at_risk_horizon"] < min_at_risk:
        reasons.append("pocas personas con seguimiento posterior al horizonte en entrenamiento")
    if result["at_risk_horizon"] < min_at_risk:
        reasons.append("pocas personas con seguimiento posterior al horizonte en evaluación")
    if result["events_by_horizon"] < min_events:
        reasons.append("pocos eventos observados al horizonte para evaluar discriminación")
    if result["training_events_by_horizon"] < int(evaluation.get("min_train_events_at_horizon", 2)):
        reasons.append("pocos eventos de entrenamiento al horizonte para estimar probabilidades")
    try:
        censor = CensoringDistributionEstimator().fit(train_y)
        g = float(censor.predict_proba(np.asarray([horizon]))[0])
        result["censoring_survival_train"] = g
        if g < float(evaluation.get("min_censoring_survival", 0.05)):
            reasons.append("probabilidad de seguimiento insuficiente para ponderación IPCW estable")
    except ValueError as exc:
        reasons.append(f"soporte de censura no estimable: {exc}")
    if reasons:
        result.update(status="not_estimable", reason="; ".join(reasons))
    return result


def _truncate_at_horizon(target_y, horizon: float, train_y):
    """Censura administrativa justo después del horizonte para métricas a ese tiempo.

    Un evento posterior no cambia el estado al horizonte. Truncarlo evita pedir
    pesos IPCW fuera del soporte de entrenamiento. NO elimina ni reclasifica un
    evento observado antes/al horizonte. La fracción de día es computacional;
    nunca se usa como tiempo observado ni se exporta como historia laboral.
    """
    remaining = float(np.max(train_y["time"])) - horizon
    if remaining <= 0:
        raise ValueError("No existe soporte posterior al horizonte.")
    cap = horizon + min(0.001, remaining / 2)
    return Surv.from_arrays(target_y["event"] & (target_y["time"] <= horizon), np.minimum(target_y["time"], cap))


def _weights(train_y, target_y, horizon):
    censor = CensoringDistributionEstimator().fit(train_y)
    positive = target_y["event"] & (target_y["time"] <= horizon)
    negative = target_y["time"] > horizon
    weights = np.zeros(len(target_y), dtype=float)
    if positive.any():
        weights[positive] = 1 / censor.predict_proba(target_y["time"][positive])
    if negative.any():
        weights[negative] = 1 / censor.predict_proba(np.asarray([horizon]))[0]
    return positive, negative, weights


def _calibration_coefficients(train_y, target_y, risk, horizon):
    positive, negative, weights = _weights(train_y, target_y, horizon)
    keep = positive | negative
    logits = np.log(np.clip(risk[keep], 1e-8, 1 - 1e-8) / np.clip(1 - risk[keep], 1e-8, 1))
    response = positive[keep].astype(float)
    w = weights[keep]
    if np.unique(response).size < 2 or np.std(logits) < 1e-8:
        return np.nan, np.nan
    def loss(beta):
        eta = beta[0] + beta[1] * logits
        return float(np.sum(w * (np.logaddexp(0, eta) - response * eta)) / np.sum(w))
    estimate = minimize(loss, np.asarray([0., 1.]), method="BFGS")
    if not estimate.success or not np.isfinite(estimate.x).all():
        return np.nan, np.nan
    # Intercept/slope diagnosed jointly: ideal (0,1), no correction is applied.
    return float(estimate.x[0]), float(estimate.x[1])


def _metric_record(train_y, target_y, risk, horizon) -> dict:
    target_truncated = _truncate_at_horizon(target_y, horizon, train_y)
    _, brier = brier_score(train_y, target_truncated, (1 - risk).reshape(-1, 1), np.asarray([horizon]))
    auc, _ = cumulative_dynamic_auc(train_y, target_truncated, risk, np.asarray([horizon]))
    baseline_risk, _, _ = _km_risk(train_y, horizon)
    _, reference = brier_score(train_y, target_truncated, np.full((len(risk), 1), 1 - baseline_risk), np.asarray([horizon]))
    if not np.isfinite(brier[0]) or not np.isfinite(auc[0]) or not np.isfinite(reference[0]):
        raise ValueError("AUC o Brier no finito; no se utiliza para seleccionar el modelo.")
    concordance_reason = ""
    try:
        concordance = concordance_index_ipcw(train_y, target_truncated, risk, tau=horizon + 0.00001)[0]
    except (ValueError, ArithmeticError, np.linalg.LinAlgError) as exc:
        concordance = np.nan
        concordance_reason = str(exc)
    observed_risk, lower, upper = _km_risk(target_y, horizon)
    coefficient_reason = ""
    try:
        intercept, slope = _calibration_coefficients(train_y, target_y, risk, horizon)
        if not np.isfinite(intercept) or not np.isfinite(slope):
            coefficient_reason = "Coeficientes no estimables: falta de variación o ajuste sin convergencia."
    except (ValueError, ArithmeticError, np.linalg.LinAlgError) as exc:
        intercept, slope = np.nan, np.nan
        coefficient_reason = str(exc)
    mean_risk = float(np.mean(risk))
    return {
        "auc_ipcw": float(auc[0]), "brier_ipcw": float(brier[0]), "brier_km_training": float(reference[0]),
        "brier_skill_vs_km": float(1 - brier[0] / reference[0]) if reference[0] > 0 else np.nan,
        "concordance_ipcw_at_horizon": float(concordance), "mean_predicted_risk": mean_risk,
        "concordance_reason": concordance_reason,
        "observed_risk_km": observed_risk, "observed_risk_km_low": lower, "observed_risk_km_high": upper,
        "observed_minus_predicted": observed_risk - mean_risk,
        "expected_observed_ratio": mean_risk / observed_risk if observed_risk > 0 else np.nan,
        "calibration_intercept_joint_ipcw": intercept, "calibration_slope_joint_ipcw": slope,
        "calibration_coefficients_reason": coefficient_reason,
    }


def _bootstrap(train_y, target_y, risk, horizon, evaluation, seed):
    count = int(evaluation.get("bootstrap_repetitions", 0))
    result = {"bootstrap_requested": count, "bootstrap_successful": 0, "ci_scope": "conditional_on_fitted_model"}
    if count <= 0:
        return result
    rng = np.random.default_rng(seed)
    draws = []
    for _ in range(count):
        indices = rng.integers(0, len(target_y), len(target_y))
        try:
            metrics = _metric_record(train_y, target_y[indices], risk[indices], horizon)
            draws.append([metrics["auc_ipcw"], metrics["brier_ipcw"], metrics["observed_minus_predicted"]])
        except (ValueError, ZeroDivisionError, FloatingPointError):
            continue
    result["bootstrap_successful"] = len(draws)
    # With very few successful draws, bounds give spurious precision: report null.
    if len(draws) < max(20, math.ceil(0.8 * count)):
        result["bootstrap_reason"] = "menos de 20 réplicas válidas o de 80% de las solicitadas"
        return result
    confidence = float(evaluation.get("bootstrap_confidence", 0.95))
    alpha = (1 - confidence) / 2
    bounds = np.quantile(np.asarray(draws), [alpha, 1 - alpha], axis=0)
    for j, metric in enumerate(["auc_ipcw", "brier_ipcw", "observed_minus_predicted"]):
        result[f"{metric}_ci_low"] = float(bounds[0, j])
        result[f"{metric}_ci_high"] = float(bounds[1, j])
    result["bootstrap_confidence"] = confidence
    return result


def _calibration_rows(target_y, risk, horizon, months, evaluation):
    n_bins = min(int(evaluation.get("calibration_bins", 5)), len(risk))
    groups = pd.qcut(pd.Series(risk), q=n_bins, labels=False, duplicates="drop")
    if groups.isna().all():
        groups = pd.Series(np.zeros(len(risk), dtype=int))
    result = []
    minimum = int(evaluation.get("min_calibration_group", 10))
    for group in sorted(groups.dropna().unique()):
        mask = groups.to_numpy() == group
        n = int(np.sum(mask))
        if n < minimum:
            # Suppress small cells, including their exact size and risk values.
            result.append({"horizon_months": months, "group": int(group) + 1, "status": "suppressed_small_group"})
            continue
        row = {"horizon_months": months, "group": int(group) + 1, "n_people": n, "mean_predicted_risk": float(np.mean(risk[mask]))}
        if np.sum(target_y["time"][mask] > horizon) < int(evaluation.get("min_calibration_at_risk", 2)):
            row.update(status="not_estimable", reason="seguimiento insuficiente en el grupo")
        else:
            observed, low, high = _km_risk(target_y[mask], horizon)
            row.update(status="estimable", observed_risk_km=observed, observed_risk_km_low=low, observed_risk_km_high=high)
        result.append(row)
    return result


def _decision_rows(train_y, target_y, risk, horizon, months, thresholds):
    """Utilidad exploratoria IPCW; los umbrales deben responder a una decisión real."""
    positive, negative, weights = _weights(train_y, target_y, horizon)
    result = []
    for threshold in thresholds:
        threshold = float(threshold)
        if not 0 < threshold < 1:
            raise ValueError("decision_thresholds requiere probabilidades estrictamente entre 0 y 1.")
        odds = threshold / (1 - threshold)
        selected = risk >= threshold
        net = (np.sum(weights[selected & positive]) - odds * np.sum(weights[selected & negative])) / len(risk)
        all_net = (np.sum(weights[positive]) - odds * np.sum(weights[negative])) / len(risk)
        result.append({"horizon_months": months, "threshold": threshold, "net_benefit_model_ipcw": net, "net_benefit_all_ipcw": all_net, "net_benefit_none": 0., "scope": "exploratory_user_defined_decision"})
    return result


def _write_csv(path: Path, rows, columns=None):
    frame = rows if isinstance(rows, pd.DataFrame) else pd.DataFrame(rows)
    if frame.empty and len(frame.columns) == 0:
        frame = pd.DataFrame(columns=columns or ["status", "reason"])
    frame.to_csv(path, index=False, encoding="utf-8-sig")


def _save_figure(fig, path: Path):
    fig.savefig(path, dpi=150)


def _state_figure(path: Path, title: str, message: str):
    fig, ax = plt.subplots(figsize=(9, 4.5))
    ax.axis("off")
    ax.set_title(title, fontsize=13)
    import textwrap
    ax.text(.5, .5, textwrap.fill(message, 95), ha="center", va="center", transform=ax.transAxes, fontsize=11)
    fig.tight_layout()
    _save_figure(fig, path)
    plt.close(fig)


def _figures(out, validation, metrics, calibration, decisions, model=None, score=None, features=None, horizons=None, evaluation=None, validation_design: str = "temporal"):
    figures = out / "figures"
    evaluation_label = "personas independientes" if validation_design == "person_holdout" else "temporal"
    def state(path, title, message):
        _state_figure(path, title, message)
    if validation:
        frame = pd.DataFrame(validation)
        ok = frame[frame["status"] == "estimable"]
        if len(ok):
            pivot = ok.pivot(index="horizon_months", columns="model", values="brier_ipcw")
            ax = pivot.plot.bar(figsize=(9, 4.5))
            ax.set(xlabel="Horizonte (meses)", ylabel="Brier IPCW (menor es mejor)", title=f"Comparación de modelos: validación {evaluation_label}")
            ax.figure.tight_layout()
            _save_figure(ax.figure, figures / "model_comparison.png")
            plt.close(ax.figure)
        else:
            state(figures / "model_comparison.png", "Comparación de modelos", "No hay métricas de validación estimables.")
    else:
        state(figures / "model_comparison.png", "Comparación de modelos", "No hay métricas de validación disponibles. Consulte candidate_status para distinguir ajuste y evaluación.")
    if metrics:
        frame = pd.DataFrame(metrics)
        fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))
        axes[0].plot(frame.horizon_months, frame.auc_ipcw, "o-", label="AUC IPCW")
        axes[0].axhline(.5, color="gray", linestyle=":")
        axes[0].set(xlabel="Horizonte (meses)", ylabel="AUC", ylim=(0, 1), title=f"Discriminación: test {evaluation_label}")
        axes[1].plot(frame.horizon_months, frame.brier_ipcw, "o-", label="Modelo")
        axes[1].plot(frame.horizon_months, frame.brier_km_training, "s--", label="Kaplan–Meier de entrenamiento")
        axes[1].set(xlabel="Horizonte (meses)", ylabel="Brier IPCW", title=f"Error de probabilidades: test {evaluation_label}")
        axes[1].legend(fontsize=8)
        fig.tight_layout()
        _save_figure(fig, figures / "performance_by_horizon.png")
        plt.close(fig)
    else:
        state(figures / "performance_by_horizon.png", "Rendimiento por horizonte", "Test no estimable; no se inventan indicadores.")
    cal = pd.DataFrame(calibration)
    cal = cal[cal.status == "estimable"] if "status" in cal else pd.DataFrame()
    if len(cal):
        fig, ax = plt.subplots(figsize=(7, 6))
        bound = max(.01, float(max(cal.mean_predicted_risk.max(), cal.observed_risk_km_high.max())) * 1.1)
        bound = min(1., bound)
        ax.plot([0, bound], [0, bound], ":", color="gray", label="Correspondencia ideal")
        for month, group in cal.groupby("horizon_months"):
            ax.errorbar(group.mean_predicted_risk, group.observed_risk_km, yerr=[np.maximum(0, group.observed_risk_km - group.observed_risk_km_low), np.maximum(0, group.observed_risk_km_high - group.observed_risk_km)], fmt="o-", capsize=3, label=f"{month} meses")
        ax.set(xlim=(0, bound), ylim=(0, bound), xlabel="Probabilidad media predicha", ylabel="Incidencia observada (Kaplan–Meier)", title="Calibración en test: IC del desenlace por grupo")
        ax.legend(fontsize=8)
        fig.tight_layout()
        _save_figure(fig, figures / "calibration.png")
        plt.close(fig)
    else:
        state(figures / "calibration.png", "Calibración en test", "No hay grupos con tamaño y seguimiento suficientes.")
    if decisions:
        fig, ax = plt.subplots(figsize=(9, 5))
        frame = pd.DataFrame(decisions)
        for month, group in frame.groupby("horizon_months"):
            line = ax.plot(group.threshold, group.net_benefit_model_ipcw, label=f"Modelo {month}m")[0]
            ax.plot(group.threshold, group.net_benefit_all_ipcw, "--", color=line.get_color(), alpha=.5, label=f"Actuar en todos {month}m")
        ax.axhline(0, color="gray", linestyle=":", label="Actuar en ninguno")
        ax.set(xlabel="Umbral de probabilidad declarado", ylabel="Beneficio neto IPCW por persona", title=f"Curva de decisión exploratoria: test {evaluation_label}")
        ax.legend(fontsize=8)
        fig.tight_layout()
        _save_figure(fig, figures / "decision_curve.png")
        plt.close(fig)
    else:
        state(figures / "decision_curve.png", "Utilidad para una decisión", "No se definieron umbrales vinculados a una decisión real, o no hay test estimable. No se inventa utilidad clínica.")
    # Population mean only; plotting individual curves would disclose health data.
    if model is not None and score is not None and len(score) >= int((evaluation or {}).get("min_group_size", 10)) and horizons:
        maximum = max(horizons)
        times = np.linspace(0., maximum, 100)
        curve_sum = np.zeros(len(times))
        for start in range(0, len(score), 512):
            functions = model.predict_survival_function(_x(score.iloc[start:start + 512], features))
            for function in functions:
                curve_sum += 1 - function(times)
        fig, ax = plt.subplots(figsize=(9, 4.5))
        ax.plot(times / 365.2425 * 12, curve_sum / len(score))
        ax.set(xlabel="Meses aproximados desde la fecha de predicción", ylabel="Probabilidad acumulada media", ylim=(0, 1), title="Pronóstico medio en población elegible: investigación")
        ax.text(.01, .97, "Eje continuo usa 365,2425 días/año; tablas usan meses calendario.", transform=ax.transAxes, va="top", fontsize=8)
        fig.tight_layout()
        _save_figure(fig, figures / "risk_curves.png")
        plt.close(fig)
    else:
        state(figures / "risk_curves.png", "Curva de probabilidad", "Sin horizonte evaluable o grupo suficientemente grande para mostrar.")


def _validate_inputs(cohorts, features, config=None):
    config = config or {}
    evaluation_rules(config)
    design = config.get("validation_design", "temporal")
    if design not in {"temporal", "person_holdout"}:
        raise ValueError("validation_design debe ser temporal o person_holdout.")
    split_mode = config.get("split_mode", "temporal")
    if split_mode not in {"temporal", "temporal_disjoint"}:
        raise ValueError("split_mode debe ser temporal o temporal_disjoint.")
    try:
        cutoff = pd.Timestamp(config.get("as_of"))
        if pd.isna(cutoff):
            raise ValueError("fecha vacía")
    except (ValueError, TypeError) as exc:
        raise ValueError("El motor requiere as_of válido para verificar el cierre de las etiquetas.") from exc
    if not features or len(set(features)) != len(features):
        raise ValueError("Se requiere una lista no vacía de predictores distintos.")
    forbidden = {"person_key", "person_id", "event", "duration_days", "followup_end", "index_date", "company", "event_date", "status", "end_date"}
    if set(features) & forbidden:
        raise ValueError(f"Identificador, desenlace o tiempo futuro usado como predictor: {sorted(set(features) & forbidden)}")
    for name in ["train", "validation", "test", "score"]:
        if name not in cohorts:
            raise ValueError(f"Falta cohorte {name}")
        frame = cohorts[name]
        if frame.empty:
            continue
        required = ["person_key", "index_date"] + features
        if name != "score":
            required += ["event", "duration_days"]
        missing = set(required) - set(frame.columns)
        if missing:
            raise ValueError(f"{name}: faltan columnas {sorted(missing)}")
        if frame.person_key.duplicated().any():
            raise ValueError(f"{name}: más de una fila por persona; no son observaciones independientes.")
        if frame.index_date.isna().any() or pd.to_datetime(frame.index_date).nunique() != 1:
            raise ValueError(f"{name}: debe existir una sola fecha de predicción sin faltantes.")
        if name != "score":
            if frame.event.isna().any() or not set(frame.event.unique()).issubset({True, False, 0, 1}):
                raise ValueError(f"{name}: evento debe ser booleano verificado.")
            duration = pd.to_numeric(frame.duration_days, errors="coerce")
            if (~np.isfinite(duration) | (duration <= 0)).any():
                raise ValueError(f"{name}: seguimiento debe ser positivo y finito.")
    # Defensa adicional para usuarios que llamen el motor sin pasar por workflow.
    stages = [name for name in ["train", "validation", "test"] if len(cohorts[name])]
    dates = [pd.Timestamp(cohorts[name].index_date.iloc[0]) for name in stages]
    if any(date >= cutoff for date in dates):
        raise ValueError("Las fechas índice históricas deben preceder as_of.")
    for stage in stages:
        origin = pd.to_datetime(cohorts[stage].index_date)
        if (origin + pd.to_timedelta(cohorts[stage].duration_days, unit="D") > cutoff).any():
            raise ValueError(f"{stage}: seguimiento posterior al cierre as_of.")
    if len(cohorts["score"]):
        score_date = pd.Timestamp(cohorts["score"].index_date.iloc[0])
        if score_date > cutoff:
            raise ValueError("La fecha de predicción score no puede superar as_of.")
        if design == "temporal" and dates and score_date < max(dates):
            raise ValueError("Fuga temporal: score precede el cierre de selección o el inicio de test.")
    if design == "person_holdout" or split_mode == "temporal_disjoint":
        for index, earlier in enumerate(stages):
            for later in stages[index + 1:]:
                if set(cohorts[earlier].person_key) & set(cohorts[later].person_key):
                    raise ValueError(f"Fuga de personas: {earlier} y {later} comparten identificadores en {design}/{split_mode}.")
    if design == "person_holdout":
        if len(set(dates)) > 1:
            raise ValueError("person_holdout requiere la misma fecha índice en train, validation y test.")
        if len(cohorts["score"]) and pd.Timestamp(cohorts["score"].index_date.iloc[0]) != cutoff:
            raise ValueError("person_holdout requiere score en la fecha as_of.")
        return
    if any(left >= right for left, right in zip(dates, dates[1:])):
        raise ValueError("Entrenamiento, validación y test deben respetar el orden temporal estricto.")
    for earlier, later in [("train", "validation"), ("validation", "test")]:
        if cohorts[earlier].empty or cohorts[later].empty:
            continue
        origin = pd.to_datetime(cohorts[earlier].index_date)
        inferred_end = origin + pd.to_timedelta(cohorts[earlier].duration_days, unit="D")
        cutoff = pd.Timestamp(cohorts[later].index_date.iloc[0])
        if (inferred_end > cutoff).any():
            raise ValueError(f"Fuga temporal: seguimiento de {earlier} posterior al inicio de {later}.")


def fit_select_evaluate(cohorts: dict[str, pd.DataFrame], features: list[str], config: dict, output_dir: Path) -> dict:
    """Entrena tres familias, selecciona en validación y evalúa un test reservado.

    Retorna sólo metadatos JSON; los modelos quedan en archivos joblib locales.
    No volver a ajustar después de examinar el test. Los archivos joblib sólo se
    deben cargar si se confía en su procedencia (pueden ejecutar código Python).
    """
    out = Path(output_dir)
    for name in ["tables", "figures", "models"]:
        (out / name).mkdir(parents=True, exist_ok=True)
    result = {"status": "not_trained", "selected_model": None, "model_path": None, "metrics": [], "horizon_status": [], "validation_metrics": [], "paths": {}, "limitations": list(LIMITATIONS), "warnings": [], "release_status": "research_only_requires_independent_review"}
    validation_rows, test_rows, calibration_rows, decision_rows = [], [], [], []
    prediction_rows, grouped_rows, candidate_rows = [], [], []
    selected_pipeline = None
    score_horizon_days = []
    evaluation = config.get("evaluation", {})
    design = config.get("validation_design", "temporal")
    scope = "internal_independent_person_holdout" if design == "person_holdout" else "temporal_validation"
    result.update(validation_design=design, validation_scope=scope)
    if design == "person_holdout":
        result["limitations"].append("Validación interna con personas independientes; no es validación temporal ni externa. No demuestra desempeño en fechas posteriores a la cohorte histórica.")
    months_list = [int(h) for h in config.get("horizons_months", [12, 36, 60])]
    if not months_list or any(h <= 0 for h in months_list) or len(set(months_list)) != len(months_list):
        raise ValueError("Horizontes deben ser meses positivos, distintos y explícitos.")
    months_list = sorted(months_list)
    try:
        if not 0 < float(evaluation.get("bootstrap_confidence", .95)) < 1:
            raise ValueError("bootstrap_confidence debe estar estrictamente entre 0 y 1.")
        if not 0 < float(evaluation.get("min_censoring_survival", .05)) < 1:
            raise ValueError("min_censoring_survival debe estar estrictamente entre 0 y 1.")
        if any(not 0 < float(t) < 1 for t in evaluation.get("decision_thresholds", [])):
            raise ValueError("Los umbrales de decisión deben estar estrictamente entre 0 y 1.")
        _validate_inputs(cohorts, features, config)
        train, validation, test, score = [cohorts[name] for name in ["train", "validation", "test", "score"]]
        if len(train) < int(evaluation.get("min_train_people", 20)):
            raise ValueError("Cohorte de entrenamiento inferior al mínimo informático de personas.")
        if int(train.event.sum()) < int(evaluation.get("min_train_events", 5)):
            raise ValueError("Cohorte de entrenamiento inferior al mínimo informático de eventos.")
        if validation.empty:
            raise ValueError("No existe cohorte de validación reservada para seleccionar un modelo.")
        train_y, val_y = _survival(train), _survival(validation)
        supports = {}
        for months in months_list:
            supports[months] = _support(train_y, val_y, _horizon(validation, months), evaluation, "validation")
            result["horizon_status"].append({"stage": "validation", "horizon_months": months, **supports[months]})
        viable = [h for h in months_list if supports[h]["status"] == "estimable"]
        if not viable:
            raise ValueError("Ningún horizonte tiene soporte en la validación reservada; no se elige el mejor por entrenamiento.")
        fitted = {}
        enabled = config.get("models", {}).get("enabled", ["cox", "rsf", "gb"])
        if not enabled or len(set(enabled)) != len(enabled):
            raise ValueError("models.enabled debe contener candidatos distintos.")
        for name in enabled:
            fit_completed = False
            candidate_phase = "fit"
            try:
                candidate = _candidate(name, train, features, config)
                with warnings.catch_warnings(record=True) as caught:
                    warnings.simplefilter("always")
                    candidate.fit(_x(train, features), train_y)
                fit_completed = True
                candidate_phase = "convergence_check"
                result["warnings"].extend([{"model": name, "message": str(item.message)} for item in caught])
                if any(issubclass(item.category, ConvergenceWarning) for item in caught):
                    raise ValueError("El ajuste no convergió; revisar complejidad, datos o parámetros antes de usarlo.")
                candidate_phase = "validation"
                rows = []
                for months in months_list:
                    row = {"model": name, "horizon_months": months, **supports[months]}
                    if months in viable:
                        horizon = supports[months]["horizon_days"]
                        risk = _risks(candidate, validation, features, horizon)
                        row.update(_metric_record(train_y, val_y, risk, horizon))
                    rows.append(row)
                validation_rows.extend(rows)
                fitted[name] = candidate
                candidate_rows.append({"model": name, "status": "fitted", "fit_completed": True, "validation_completed": True, "n_train": len(train), "train_events": int(train.event.sum())})
            except (ValueError, ArithmeticError, np.linalg.LinAlgError) as exc:
                candidate_rows.append({"model": name, "status": "failed", "fit_completed": fit_completed, "validation_completed": False, "failed_phase": candidate_phase, "reason": str(exc)})
                result["warnings"].append({"model": name, "message": f"Candidato excluido: {exc}"})
        if not fitted:
            raise ValueError("Ningún candidato pudo ajustarse y evaluarse en todos los horizontes comunes.")
        means = {name: float(np.mean([row["brier_ipcw"] for row in validation_rows if row["model"] == name and row["horizon_months"] in viable])) for name in fitted}
        selected = min(means, key=lambda name: (means[name], name))
        selected_pipeline = fitted[selected]
        model_path = out / "models" / "selected_model.joblib"
        joblib.dump({"pipeline": selected_pipeline, "features": features, "company": config.get("company"), "outcome_name": config.get("outcome_name"), "outcome_date_basis": config.get("outcome_date_basis"), "fitted_landmark": config.get("landmarks", {}).get("train"), "scope": "research_only", "training_survival": train_y, "config": config}, model_path)
        result.update(status="trained_research", selected_model=selected, model_path=str(model_path), selection={"criterion": "mean_validation_brier_ipcw", "common_horizons_months": viable, "candidate_mean_brier": means, "refitted_after_selection": False, "validation_scope": scope})
        # Test is consulted only here, after the candidate is fixed.
        eligible_prediction_horizons = []
        test_y = _survival(test) if len(test) else None
        for months in months_list:
            if test_y is None:
                support = {"status": "not_estimable", "reason": "cohorte test vacía"}
            else:
                horizon = _horizon(test, months)
                support = _support(train_y, test_y, horizon, evaluation, "test")
                if months not in viable:
                    support.update(status="not_estimable", reason="horizonte no evaluable en validación")
                if support["status"] == "estimable":
                    try:
                        risk = _risks(selected_pipeline, test, features, horizon)
                        metrics = _metric_record(train_y, test_y, risk, horizon)
                        row = {"model": selected, "horizon_months": months, **support, **metrics}
                        row.update(_bootstrap(train_y, test_y, risk, horizon, evaluation, int(config.get("seed", 2026)) + months))
                        test_rows.append(row)
                        calibration_rows.extend(_calibration_rows(test_y, risk, horizon, months, evaluation))
                        decision_rows.extend(_decision_rows(train_y, test_y, risk, horizon, months, evaluation.get("decision_thresholds", [])))
                        eligible_prediction_horizons.append(months)
                    except (ValueError, ArithmeticError, np.linalg.LinAlgError) as exc:
                        support.update(status="not_estimable", reason=f"evaluación falló: {exc}")
            result["horizon_status"].append({"stage": "test", "horizon_months": months, **support})
        for months in months_list:
            reason = ""
            risk = None
            horizon = None
            if score.empty:
                reason = "cohorte de predicción vacía"
            elif months not in eligible_prediction_horizons:
                reason = "horizonte sin evaluación estimable en el test reservado"
            else:
                horizon = _horizon(score, months)
                # Score may fall on a leap year and differ slightly from test.
                if int(np.sum(train_y["time"] > horizon)) < int(evaluation.get("min_at_risk", 5)):
                    reason = "horizonte calendario de predicción sin soporte suficiente en entrenamiento"
                else:
                    try:
                        g = CensoringDistributionEstimator().fit(train_y).predict_proba(np.asarray([horizon]))[0]
                        if g < float(evaluation.get("min_censoring_survival", .05)):
                            reason = "soporte insuficiente de censura en el horizonte de predicción"
                        else:
                            risk = _risks(selected_pipeline, score, features, horizon)
                            score_horizon_days.append(horizon)
                    except ValueError as exc:
                        reason = str(exc)
            result["horizon_status"].append({"stage": "score", "horizon_months": months, "horizon_days": horizon, "status": "research_probability" if risk is not None else "not_estimable", "reason": reason})
            for i, (_, person) in enumerate(score.iterrows()):
                prediction_rows.append({"person_key": person.person_key, "index_date": str(pd.Timestamp(person.index_date).date()), "horizon_months": months, "horizon_days": horizon, "probability": float(risk[i]) if risk is not None else np.nan, "status": "research_probability" if risk is not None else "not_estimable", "reason": reason, "model": selected, "validation_scope": scope})
            if risk is not None:
                temporary = score.copy()
                temporary["_probability"] = risk
                minimum = int(evaluation.get("min_group_size", 10))
                for column in ["job", "area", "site"]:
                    if column not in temporary:
                        continue
                    for label, group in temporary.groupby(column, dropna=False):
                        if len(group) < minimum:
                            continue
                        grouped_rows.append({"group_variable": column, "group_value": str(label), "horizon_months": months, "n_people": len(group), "mean_probability": float(group._probability.mean()), "sum_probabilities_expected_events": float(group._probability.sum()), "scope": "research_expectation_under_continued_followup_not_turnover_forecast"})
        if not test_rows:
            result["status"] = "trained_research_test_not_estimable"
    except (ValueError, ArithmeticError, np.linalg.LinAlgError) as exc:
        result["reason"] = str(exc)
    result["metrics"] = test_rows
    result["validation_metrics"] = validation_rows
    result["candidate_status"] = candidate_rows
    result["fit_completed"] = any(row.get("fit_completed", False) for row in candidate_rows)
    result["selection_completed"] = result.get("selected_model") is not None
    if result["fit_completed"] and not result["selection_completed"]:
        result["status"] = "fitted_without_selection"
    result["decision_analysis"] = {"configured_thresholds": evaluation.get("decision_thresholds", []), "status": "exploratory" if decision_rows else "not_evaluated"}
    result["environment"] = {"python": platform.python_version(), **{name: version(name) for name in ["numpy", "pandas", "scipy", "scikit-learn", "scikit-survival", "joblib"]}}
    tables = {
        "candidate_validation": validation_rows, "candidate_status": candidate_rows, "test_metrics": test_rows,
        "calibration": calibration_rows, "decision_curve": decision_rows, "horizon_status": result["horizon_status"],
        "predictions": prediction_rows, "group_predictions": grouped_rows,
    }
    for name, rows in tables.items():
        path = out / "tables" / f"{name}.csv"
        _write_csv(path, rows)
        result["paths"][name] = str(path)
    _figures(out, validation_rows, test_rows, calibration_rows, decision_rows, selected_pipeline, cohorts.get("score"), features, score_horizon_days, evaluation, validation_design=design)
    result = _finite(result)
    path = out / "models" / "model_metadata.json"
    path.write_text(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
    result["paths"]["metadata"] = str(path)
    return result
'''

# ARCHIVO 19 DE 25: rehavid_el/portable.py
FUENTES['rehavid_el/portable.py'] = r'''"""Relocaliza rutas de un JSON revisado hacia los originales cargados.

No modifica datos, fechas, estados, predictores ni decisiones de modelación.
La empresa se comprueba en el protocolo; las columnas de los originales siguen
siendo verificadas por preparación y limpieza. No se leen rutas de otra sesión.
"""
from __future__ import annotations

from copy import deepcopy
import hashlib
import json
from pathlib import Path, PureWindowsPath
import re

from .config import DataContractError

_SUFFIXES = {".csv", ".tsv", ".xlsx", ".xlsm", ".xls", ".xlsb", ".parquet"}
_HASH_KEYS = ("sha256", "expected_sha256", "source_sha256", "_source_sha256")


def normalize_configuration(config_path, originals_dir, output_path, company):
    """Crea otra configuración conservando todas las decisiones salvo las rutas.

    Las fuentes habilitadas se buscan exclusivamente en ``originals_dir``:
    primero por ruta relativa exacta y, si ésta no existe, por nombre exacto
    único entre sus archivos. Una ruta absoluta previa usa ese nombre. No se
    aplican coincidencias parciales, sinónimos ni cambios de mayúsculas.

    Admite ``path`` como cadena/lista y ``inputs`` con opciones heredadas.
    Verifica los hashes SHA-256 declarados mediante ``sha256``,
    ``expected_sha256``, ``source_sha256`` o ``_source_sha256`` por fuente/entrada.
    Sin hash previo, registra el actual sin afirmar identidad histórica.

    Devuelve ``status``, ``config_path``, ``manifest_path``, ``company`` y
    ``files``. Crea el manifiesto vecino ``<config>.rutas.json``. No sobrescribe
    archivos. Los errores de rutas, empresa o hash abortan antes de escribir.
    """
    config_path = Path(config_path).expanduser().resolve()
    original_root = Path(originals_dir).expanduser().resolve()
    output_path = Path(output_path).expanduser().resolve()
    manifest_path = output_path.with_suffix(".rutas.json")
    if not isinstance(company, str) or not company.strip():
        raise DataContractError("Declare la empresa de los originales cargados.")
    cfg = json.loads(config_path.read_text(encoding="utf-8-sig"))
    if not isinstance(cfg, dict) or cfg.get("company") != company:
        raise DataContractError("La empresa del JSON no coincide exactamente con la empresa declarada.")
    if not original_root.is_dir():
        raise DataContractError("La carpeta de originales declarada no existe.")
    if output_path == config_path or output_path == manifest_path:
        raise FileExistsError("Use otro nombre para la configuración portable; se conserva el JSON original.")
    if output_path.exists() or manifest_path.exists():
        raise FileExistsError("La configuración o su manifiesto ya existen; use un nombre de salida nuevo.")
    sources = cfg.get("sources")
    if not isinstance(sources, dict):
        raise DataContractError("sources debe ser un objeto de fuentes configuradas.")
    by_name = {}
    for path in original_root.rglob("*"):
        if path.is_file() and path.suffix.lower() in _SUFFIXES:
            # No sigue enlaces a datos fuera de la carpeta explícitamente elegida.
            if not path.resolve().is_relative_to(original_root):
                continue
            by_name.setdefault(path.name, []).append(path)
    converted = deepcopy(cfg)
    records = []
    digest_cache = {}

    def resolve_reference(reference, metadata, role, index):
        if not isinstance(reference, str) or not reference.strip():
            raise DataContractError(f"{role}: una entrada no contiene una ruta de archivo válida.")
        if "://" in reference:
            raise DataContractError(f"{role}: descargue primero el archivo; un enlace web no es una ruta de originales.")
        windows = PureWindowsPath(reference)
        portable_reference = Path(reference.replace("\\", "/"))
        name = windows.name if "\\" in reference or windows.drive else portable_reference.name
        if not name or Path(name).suffix.lower() not in _SUFFIXES:
            raise DataContractError(f"{role}: formato de archivo no admitido en {name!r}.")
        relative = not portable_reference.is_absolute() and not windows.is_absolute() and not windows.drive
        direct = (original_root / portable_reference).resolve() if relative else None
        if direct is not None and not direct.is_relative_to(original_root):
            raise DataContractError(f"{role}: la ruta relativa sale de la carpeta de originales.")
        if direct is not None and direct.is_file():
            selected, strategy = direct, "exact_relative_path"
        else:
            candidates = by_name.get(name, [])
            if len(candidates) != 1:
                diagnosis = "ausente" if not candidates else "ambiguo: hay varios archivos con ese nombre"
                raise DataContractError(f"{role}: {name!r} está {diagnosis} en la carpeta de originales. Declare una ruta relativa exacta.")
            selected, strategy = candidates[0].resolve(), "unique_exact_filename"
        if selected.suffix.lower() not in _SUFFIXES:
            raise DataContractError(f"{role}: el destino resuelto no tiene formato admitido.")
        if selected not in digest_cache:
            with selected.open("rb") as handle:
                digest_cache[selected] = hashlib.file_digest(handle, "sha256").hexdigest()
        actual = digest_cache[selected]
        expected = {}
        for key in _HASH_KEYS:
            if key not in metadata:
                continue
            value = metadata[key]
            if not isinstance(value, str) or not re.fullmatch(r"[0-9a-fA-F]{64}", value):
                raise DataContractError(f"{role}: {key} debe contener un hash SHA-256 hexadecimal válido.")
            expected[key] = value.lower()
            if value.lower() != actual:
                raise DataContractError(f"{role}: el SHA-256 de {name!r} no coincide con {key}; no se sustituye el archivo.")
        records.append({"source": role, "input_index": index, "previous_path": reference,
                        "resolved_path": str(selected), "resolution": strategy,
                        "sha256": actual, "expected_sha256_fields": expected,
                        "identity_check": "declared_hash_verified" if expected else "current_hash_recorded_no_prior_hash"})
        return str(selected)

    for role, source in sources.items():
        if not isinstance(source, dict):
            raise DataContractError(f"{role}: la fuente debe ser un objeto.")
        if not source.get("enabled", False):
            continue
        destination = converted["sources"][role]
        if "inputs" in source:
            inputs = source["inputs"]
            if not isinstance(inputs, list) or not inputs:
                raise DataContractError(f"{role}: inputs debe ser una lista no vacía de entradas.")
            common = {key: value for key, value in source.items() if key not in {"inputs", "path"}}
            for index, entry in enumerate(inputs):
                if not isinstance(entry, dict):
                    raise DataContractError(f"{role}: cada entrada de inputs debe ser un objeto.")
                destination["inputs"][index]["path"] = resolve_reference(entry.get("path"), {**common, **entry}, role, index)
        else:
            paths = source.get("path")
            if isinstance(paths, str):
                destination["path"] = resolve_reference(paths, source, role, 0)
            elif isinstance(paths, list) and paths:
                destination["path"] = [resolve_reference(value, source, role, index) for index, value in enumerate(paths)]
            else:
                raise DataContractError(f"{role}: falta path o inputs para una fuente habilitada.")
    if not records:
        raise DataContractError("No hay archivos de fuentes habilitadas que relocalizar.")
    manifest = {"company": company, "company_check": "configuration_matches_declared_company",
                "scope": "Path relocation only; original data and modeling decisions unchanged",
                "source_config": str(config_path), "originals_directory": str(original_root),
                "files": records}
    config_text = json.dumps(converted, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    manifest_text = json.dumps(manifest, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("x", encoding="utf-8") as handle:
        handle.write(config_text)
    try:
        with manifest_path.open("x", encoding="utf-8") as handle:
            handle.write(manifest_text)
    except Exception:
        output_path.unlink()  # Sólo el archivo recién creado por esta llamada.
        raise
    return {"status": "ready", "config_path": str(output_path), "manifest_path": str(manifest_path),
            "company": company, "files": records}
'''

# ARCHIVO 20 DE 25: rehavid_el/preparation.py
FUENTES['rehavid_el/preparation.py'] = r'''"""Preparación explícita de fuentes heterogéneas sin inferir diagnósticos.

No modifica archivos originales, no entrena y no transforma la ausencia de
registros de enfermedad en seguimiento negativo. Los hallazgos exportados son
agregados; los CSV canónicos son datos personales y permanecen en el entorno
local elegido por el operador.
"""
from copy import deepcopy
import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd

from .config import DATES, SCHEMAS, required_columns, employment_features
from .data import read_file
from .evidence import derivation_evidence_contradictions


def _finding(findings, code, source, message, resolution, *, count=None,
             input_index=None, severity="error"):
    item = dict(severity=severity, code=code, source=source,
                message=message, resolution=resolution)
    if count is not None:
        item["count"] = int(count)
    if input_index is not None:
        item["input_index"] = int(input_index)
    findings.append(item)


def _nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def _missing(series):
    blanks = pd.Series([isinstance(v, str) and not v.strip() for v in series], index=series.index, dtype=bool)
    return series.isna() | blanks


def _parse_date(series, fmt):
    values = series.mask(_missing(series), np.nan)
    if isinstance(fmt, dict):
        if fmt.get("kind") != "excel_serial" or not _nonempty(fmt.get("origin")):
            raise ValueError("Serial Excel requiere kind=excel_serial y origin verificado.")
        numeric = pd.to_numeric(values, errors="coerce")
        if (values.notna() & numeric.isna()).any():
            raise ValueError("Serial Excel contiene valores no numéricos; separe formatos por entrada.")
        dates = pd.to_datetime(numeric, unit="D", origin=fmt["origin"], errors="coerce", utc=True)
    elif isinstance(fmt, str):
        dates = pd.to_datetime(values, format=fmt, errors="coerce", utc=True)
    else:
        raise ValueError("Formato de fecha no reconocido.")
    if (values.notna() & dates.isna()).any():
        raise ValueError("Hay fechas que no corresponden al formato declarado.")
    return dates.dt.tz_convert(None).dt.normalize()


def _iso(value):
    if not isinstance(value, str) or len(value) != 10:
        raise ValueError("Fecha ISO YYYY-MM-DD obligatoria.")
    parsed = pd.to_datetime(value, format="%Y-%m-%d", errors="raise")
    if parsed.strftime("%Y-%m-%d") != value:
        raise ValueError("Fecha ISO YYYY-MM-DD obligatoria.")
    return parsed


def _rules(cfg, findings):
    for contradiction in derivation_evidence_contradictions(cfg):
        _finding(findings, "contradictory_evidence", contradiction["path"], contradiction["reason"],
                 "Aporte cobertura o disponibilidad acreditada y corrija la declaración; cambiar el texto no verifica la fuente.")
    contract = cfg.get("contract_availability", {"mode": "explicit"})
    followup = cfg.get("followup_derivation", {"mode": "none"})
    if not isinstance(contract, dict):
        contract = {}
    if not isinstance(followup, dict):
        followup = {}
    for name, rule, accepted, derived in [
        ("contract_availability", contract, {"explicit", "documented_contract_start"}, "documented_contract_start"),
        ("followup_derivation", followup, {"none", "employment_intersect_registry"}, "employment_intersect_registry"),
    ]:
        if rule.get("mode") not in accepted:
            _finding(findings, "invalid_derivation_mode", name, "Modo de derivación inválido.",
                     "Seleccione un modo documentado del contrato de configuración.")
        if rule.get("mode") == derived:
            if not (rule.get("reviewed") is True and _nonempty(rule.get("evidence_ref"))
                    and _nonempty(rule.get("rationale"))):
                _finding(findings, "undocumented_derivation", name,
                         "La derivación requiere reviewed=true, evidence_ref y rationale documentados.",
                         "Verifique la evidencia con el responsable de la fuente y registre su fundamento.")
    try:
        selected = employment_features(cfg)
    except ValueError:
        selected = []
        _finding(findings, "invalid_employment_features", "employment", "Selección de predictores laborales inválida.",
                 "Seleccione una lista sin duplicados entre tenure_years, job, area y site.")
    if contract.get("mode") == "documented_contract_start" and selected != ["tenure_years"]:
        _finding(findings, "unsafe_contract_backdating", "employment",
                 "La disponibilidad basada en inicio contractual sólo admite employment_features=['tenure_years'].",
                 "Quite cargo, área y sede históricos no demostrados o aporte recorded_at/effective_from reales.")
    coverage = []
    if followup.get("mode") == "employment_intersect_registry":
        if followup.get("employment_implies_registry_observation") is not True:
            _finding(findings, "registry_capture_not_asserted", "followup",
                     "No se ha verificado que el registro observe a la población empleada durante la cobertura.",
                     "Documente el alcance del registro; no use nómina sola como ausencia de enfermedad.")
        entries = followup.get("coverage")
        if not isinstance(entries, list) or not entries:
            _finding(findings, "missing_registry_coverage", "followup",
                     "Faltan intervalos documentados de cobertura del registro.",
                     "Declare coverage con start, end y verified_at; no use las fechas extremas de casos.")
        else:
            for index, entry in enumerate(entries):
                try:
                    start, end, verified = (_iso(entry[key]) for key in ["start", "end", "verified_at"])
                    if not start <= end <= verified:
                        raise ValueError("Intervalo o verificación incoherentes.")
                    if entry.get("company", cfg.get("company")) != cfg.get("company"):
                        raise ValueError("Otra empresa en cobertura.")
                    if cfg.get("as_of") and verified > _iso(cfg["as_of"]):
                        raise ValueError("Verificación posterior al cierre.")
                    coverage.append((start, end, verified))
                except (KeyError, TypeError, ValueError):
                    _finding(findings, "invalid_registry_interval", "followup",
                             "Intervalo inválido, otra empresa o verificación posterior a as_of.",
                             "Corrija start <= end <= verified_at <= as_of con evidencia del registro.", input_index=index)
    return contract, followup, coverage


def _inputs(source):
    if "inputs" in source:
        entries = source["inputs"]
        if not isinstance(entries, list):
            raise ValueError("inputs debe ser una lista.")
        # Una entrada puede heredar opciones comunes; su mapeo se sustituye
        # íntegramente cuando se especifica, evitando arrastrar columnas ajenas.
        common = {k: v for k, v in source.items() if k not in {"inputs", "path"}}
        return [{**common, **entry} if isinstance(entry, dict) else entry for entry in entries]
    paths = source.get("path", [])
    if isinstance(paths, str):
        paths = [paths]
    if not isinstance(paths, list):
        raise ValueError("path debe ser una ruta o lista de rutas.")
    return [{**source, "path": path} for path in paths]


def _normalize_ids(frame, spec, findings, name, index):
    if "person_id" not in frame:
        return
    values = frame.person_id.map(lambda v: v.strip() if isinstance(v, str) else v)
    rule = spec.get("person_id_normalization")
    if rule is None:
        frame["person_id"] = values
        return
    if not (isinstance(rule, dict) and rule.get("reviewed") is True
            and _nonempty(rule.get("evidence_ref")) and _nonempty(rule.get("strip_prefix"))):
        _finding(findings, "unreviewed_id_normalization", name,
                 "La equivalencia de identificadores no está documentada.",
                 "Indique un prefijo literal, reviewed=true y evidence_ref; no elimine letras globalmente.", input_index=index)
        return
    prefix = rule["strip_prefix"]
    # No convierte a número: conserva ceros iniciales y faltantes.
    normalized = values.map(lambda v: v[len(prefix):] if isinstance(v, str) and v.startswith(prefix) else v)
    mapping = pd.DataFrame({"raw": values, "normalized": normalized}).dropna()
    collisions = mapping.groupby("normalized")["raw"].nunique().gt(1)
    if collisions.any():
        _finding(findings, "id_normalization_collision", name,
                 "Dos identificadores distintos de una entrada producirían el mismo identificador.",
                 "Resuelva la equivalencia contra una llave maestra; no una automáticamente estas personas.",
                 count=collisions.sum(), input_index=index)
    frame["person_id"] = normalized


def _map_input(raw, spec, name, cfg, contract, findings, index):
    required = set(required_columns(cfg, name))
    mapping = spec.get("columns", {})
    constants = spec.get("constants", {})
    if not isinstance(mapping, dict) or not isinstance(constants, dict):
        _finding(findings, "invalid_mapping", name, "columns y constants deben ser objetos.",
                 "Declare columnas canónicas hacia columnas originales.", input_index=index)
        return None
    if set(constants) - {"company", "source_kind"}:
        _finding(findings, "forbidden_constants", name,
                 "No se aceptan constantes de eventos, fechas, identificadores ni seguimiento.",
                 "Aporte datos originales; sólo company y source_kind admiten constantes explícitas.", input_index=index)
    for column, constant in constants.items():
        original = mapping.get(column)
        if original in raw.columns:
            observed = raw[original].dropna().astype(str).str.strip()
            conflict = observed.ne(str(constant).strip())
            if conflict.any():
                _finding(findings, "constant_contradicts_original", name,
                         f"La constante de {column} contradice una columna original mapeada.",
                         "Separe empresas o concilie el tipo de fuente; no sobrescriba su identidad mediante constantes.",
                         count=conflict.sum(), input_index=index)
    extra = [c for c in ["effective_from", "outcome_group"] if c in mapping]
    columns = list(dict.fromkeys(SCHEMAS[name] + extra))
    mapped = {}
    derived_contract = name == "employment" and contract.get("mode") == "documented_contract_start"
    spell_fields = spec.get("spell_key_fields") if name == "employment" else None
    for column in columns:
        if name == "employment" and column in {"job", "area", "site"} and column not in required:
            continue  # Un atributo no seleccionado no se convierte en requisito.
        if column in constants and column in {"company", "source_kind"}:
            mapped[column] = pd.Series(constants[column], index=raw.index)
        elif column in mapping and mapping[column] in raw:
            mapped[column] = raw[mapping[column]].copy()
        elif column == "recorded_at" and derived_contract and column not in mapping:
            continue
        elif column == "spell_id" and spell_fields is not None and column not in mapping:
            continue
        elif column not in required and column not in mapping:
            mapped[column] = pd.Series(np.nan, index=raw.index)
        else:
            _finding(findings, "missing_column", name, f"Falta mapeo o columna original de {column}.",
                     f"Corrija columns.{column} o aporte una fuente que contenga el atributo.", input_index=index)
    frame = pd.DataFrame(mapped, index=raw.index)
    _normalize_ids(frame, spec, findings, name, index)
    for column in set(frame.columns) & DATES:
        fmt = spec.get("date_formats", {}).get(column, spec.get("date_format", "ISO8601"))
        try:
            frame[column] = _parse_date(frame[column], fmt)
        except (ValueError, TypeError, OverflowError):
            _finding(findings, "invalid_date_format", name,
                     f"No se pudo convertir {column} con el formato explícito de esta entrada.",
                     f"Revise date_formats.{column}, encabezado y origen del serial Excel; separe formatos distintos.", input_index=index)
    if derived_contract and "recorded_at" not in frame and "start_date" in frame:
        frame["recorded_at"] = frame.start_date.copy()
    if name == "employment" and "spell_id" not in frame and spell_fields is not None:
        if not (isinstance(spell_fields, list) and "person_id" in spell_fields and "start_date" in spell_fields
                and len(set(spell_fields)) == len(spell_fields)
                and all(c in frame and c in SCHEMAS[name] and c != "spell_id" for c in spell_fields)):
            _finding(findings, "invalid_spell_key", name,
                     "La clave contractual requiere campos canónicos explícitos, incluidos person_id y start_date.",
                     "Declare spell_key_fields con campos presentes; la misma clave debe representar el mismo vínculo.", input_index=index)
        else:
            def spell_key(row):
                if any(pd.isna(row[c]) or str(row[c]).strip() == "" for c in spell_fields):
                    return np.nan
                tokens = [str(row[c]).strip() for c in spell_fields]
                return "EP_" + hashlib.sha256(json.dumps(tokens, ensure_ascii=False).encode()).hexdigest()[:32]
            frame["spell_id"] = frame.apply(spell_key, axis=1)
    for column in sorted(required & set(frame.columns)):
        if column == "end_date":
            continue  # Retiro no observado no se reemplaza por el cierre.
        # Sólo atributos imprescindibles. Cargo/área/sede pueden tener faltantes
        # que imputa el pipeline de entrenamiento, nunca todo el conjunto.
        if column in DATES or column in {"company", "person_id", "spell_id", "event_id", "source_kind"}:
            missing = _missing(frame[column])
            if missing.any():
                _finding(findings, "missing_essential_values", name, f"Hay valores esenciales vacíos en {column}.",
                         f"Complete o concilie {column} desde la fuente; no se imputa una fecha o identificador.",
                         count=missing.sum(), input_index=index)
    if "company" in frame and len(frame):
        mismatch = frame.company.astype("string").str.strip().ne(str(cfg.get("company"))).fillna(True)
        if mismatch.any():
            _finding(findings, "mixed_company", name, "Hay filas que no corresponden a la empresa configurada.",
                     "Separe empresas antes de preparar; no se realiza mezcla ni filtrado silencioso.", count=mismatch.sum(), input_index=index)
    return frame


def _derive_followup(employment, intervals, cfg, findings):
    rows = []
    essential = {"company", "person_id", "spell_id", "start_date", "end_date", "recorded_at"}
    if employment is None or not essential.issubset(employment.columns) or employment.empty:
        _finding(findings, "no_employment_for_followup", "followup", "No hay vínculos válidos para intersectar.",
                 "Complete primero las fechas y llaves del historial contractual.")
        return None
    if not all(pd.api.types.is_datetime64_any_dtype(employment[column])
               for column in ["start_date", "end_date", "recorded_at"]):
        return None  # El hallazgo específico ya figura en la preparación.
    provenance = [c for c in ["_source_sha256", "_source_input_index", "_source_record_index"] if c in employment]
    effective = employment.get("effective_from", employment.start_date)
    if not pd.api.types.is_datetime64_any_dtype(effective):
        return None
    # Cada verificación sólo puede usar la versión contractual conocida en
    # esa fecha. La unión de todas las versiones conservaba retiros corregidos
    # o contratos abiertos que una versión posterior había cerrado.
    for interval_index, (start, end, verified) in enumerate(intervals):
        known = employment.loc[employment.recorded_at.le(verified) & effective.le(verified)].copy()
        known["_effective_sort"] = effective.loc[known.index]
        known = known.sort_values(["_effective_sort", "recorded_at"]).drop_duplicates(
            ["company", "person_id", "spell_id"], keep="last")
        for _, row in known.iterrows():
            if pd.isna(row.start_date):
                continue
            left = max(row.start_date, start)
            right = min(row.end_date, end) if pd.notna(row.end_date) else end
            if left <= right:
                rows.append({"company": row.company, "person_id": row.person_id,
                             "obs_start": left, "obs_end": right, "verified_at": verified,
                             "_source_spell_id": row.spell_id,
                             "_registry_interval_index": interval_index,
                             **{column: row[column] for column in provenance}})
    result = pd.DataFrame(rows, columns=SCHEMAS["followup"] + ["_source_spell_id", "_registry_interval_index"] + provenance).drop_duplicates()
    if result.empty:
        _finding(findings, "empty_followup_intersection", "followup",
                 "Los vínculos y la cobertura documentada no tienen intersección.",
                 "Verifique fechas y alcance del registro; no se fabrican intervalos ni negativos.")
    return result


def prepare_sources(config_path, output_dir):
    """Convierte entradas explícitamente mapeadas y devuelve un dict auditable.

    ``prepared`` significa estructura convertida, no aprobación clínica ni
    suficiencia para entrenar. Ejecute después las validaciones y las cohortes.
    ``blocked`` conserva todos los hallazgos y nunca publica una configuración
    canónica utilizable. Las rutas relativas se resuelven respecto al JSON fuente.
    """
    source_config = Path(config_path).resolve()
    output = Path(output_dir).resolve()
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        findings = []
        _finding(findings, "output_not_empty", "configuration",
                 "La salida ya contiene archivos o no es una carpeta. No se reutilizan resultados anteriores.",
                 "Seleccione una carpeta nueva y vacía; se conservaron todos los archivos existentes.")
        return {"status": "blocked", "config_path": None, "findings": findings, "row_counts": {},
                "clinical_validation_claim": False,
                "paths": {"report": None, "manifest_local": None, "findings_csv": None}}
    output.mkdir(parents=True, exist_ok=True)
    findings, manifest, tables, original_paths = [], [], {}, {source_config}
    cfg = json.loads(source_config.read_text(encoding="utf-8"))
    converted = deepcopy(cfg)
    contract, followup_rule, coverage = _rules(cfg, findings)
    derive = followup_rule.get("mode") == "employment_intersect_registry"
    sources = cfg.get("sources", {})
    if not isinstance(sources, dict):
        sources = {}
        _finding(findings, "invalid_sources", "configuration", "sources debe ser un objeto.",
                 "Declare cada fuente canónica con su mapeo y entradas.")
    explicit_followup = sources.get("followup", {})
    if derive and explicit_followup.get("enabled", False) and (explicit_followup.get("path") or explicit_followup.get("inputs")):
        _finding(findings, "followup_derivation_conflict", "followup",
                 "Se declaró seguimiento explícito habilitado junto con una derivación.",
                 "Use el seguimiento explícito o deshabilítelo conscientemente antes de derivar.")
    for name in SCHEMAS:
        source = sources.get(name, {})
        if not isinstance(source, dict):
            _finding(findings, "invalid_source_specification", name, "La fuente debe ser un objeto de configuración.",
                     "Declare enabled, inputs y columns con el esquema documentado.")
            continue
        if name == "followup" and derive:
            continue
        if not source.get("enabled", False):
            if name in {"employment", "outcomes", "followup"}:
                _finding(findings, "essential_source_disabled", name,
                         "Fuente esencial no habilitada.", "Mapee y habilite esta fuente; seguimiento sólo admite derivación documentada.")
            continue
        try:
            entries = _inputs(source)
        except ValueError:
            entries = []
            _finding(findings, "invalid_inputs", name, "La declaración de entradas es inválida.",
                     "Use inputs como lista de objetos o path como ruta/lista de rutas.")
        if not entries:
            _finding(findings, "no_inputs", name, "No hay archivos declarados para la fuente habilitada.",
                     "Declare inputs o path; deshabilite una fuente únicamente si es opcional.")
        chunks = []
        for index, spec in enumerate(entries):
            if not isinstance(spec, dict) or not _nonempty(spec.get("path")):
                _finding(findings, "invalid_input_path", name, "Entrada sin ruta explícita.",
                         "Declare una ruta por objeto de inputs.", input_index=index)
                continue
            path = Path(spec["path"])
            path = path.resolve() if path.is_absolute() else (source_config.parent / path).resolve()
            original_paths.add(path)
            record = {"source": name, "input_index": index, "path_local": str(path),
                      "sheet": spec.get("sheet", 0), "rows_read": None, "status": "not_read"}
            manifest.append(record)
            try:
                raw = read_file(path, spec.get("sheet", 0), options=spec)
                with path.open("rb") as handle:
                    digest = hashlib.file_digest(handle, "sha256").hexdigest()
                record.update(rows_read=len(raw), columns_read=len(raw.columns), sha256=digest, status="read")
            except Exception as exc:
                # No publicar repr(exc): puede incluir valores o rutas con IDs.
                record["status"] = "read_failed"
                _finding(findings, "input_read_failed", name,
                         f"No se pudo leer la entrada ({type(exc).__name__}).",
                         "Revise existencia, formato, hoja, encabezado, separador y codificación.", input_index=index)
                continue
            if not raw.columns.is_unique:
                _finding(findings, "duplicate_headers", name, "Los encabezados no son únicos.",
                         "Resuelva nombres de columnas antes del mapeo.", input_index=index)
                continue
            try:
                frame = _map_input(raw, spec, name, cfg, contract, findings, index)
            except (ValueError, TypeError, AttributeError, KeyError) as exc:
                frame = None
                _finding(findings, "invalid_input_specification", name,
                         f"Configuración de mapeo o tipos de entrada inválida ({type(exc).__name__}).",
                         "Revise columns, date_formats, constants y selecciones de variables de esta entrada.", input_index=index)
            if frame is not None:
                frame["_source_sha256"] = digest
                frame["_source_input_index"] = index
                frame["_source_record_index"] = np.arange(1, len(frame) + 1)
                chunks.append(frame)
        if chunks:
            tables[name] = pd.concat(chunks, ignore_index=True)
            if tables[name].empty and name in {"employment", "followup"}:
                _finding(findings, "empty_essential_source", name, "La fuente esencial tiene cero registros.",
                         "Aporte vínculos o seguimiento observados; una plantilla vacía no es evidencia.")
    if derive and not any(item["code"] == "contradictory_evidence" for item in findings):
        frame = _derive_followup(tables.get("employment"), coverage, cfg, findings)
        if frame is not None:
            frame["_source_derivation"] = "employment_intersect_registry"
            tables["followup"] = frame
            manifest.append({"source": "followup", "status": "derived", "rows_derived": len(frame),
                             "evidence_ref": followup_rule.get("evidence_ref"), "coverage_intervals": len(coverage),
                             "assumption": "Documented registry observation during employment; not absence of case records."})
    canonical_dir = output / "datos_canonicos"
    destinations = {canonical_dir / f"{name}.csv" for name in tables} | {
        output / "config_canonica.json", output / "procedencia_local.json",
        output / "preparacion_fuentes.json", output / "hallazgos_preparacion.csv"}
    original_collision = bool(destinations & original_paths)
    if original_collision:
        _finding(findings, "original_overwrite_forbidden", "configuration",
                 "La salida coincidiría con un archivo de entrada.", "Seleccione otra carpeta de salida para conservar originales.")
    blocked = any(item["severity"] == "error" for item in findings)
    config_result = None
    if not blocked:
        canonical_dir.mkdir(exist_ok=True)
        converted.setdefault("sources", {})
        for name, frame in tables.items():
            dest = canonical_dir / f"{name}.csv"
            exported = frame.copy()
            for column in set(exported.columns) & DATES:
                if pd.api.types.is_datetime64_any_dtype(exported[column]):
                    exported[column] = exported[column].dt.strftime("%Y-%m-%d")
            exported.to_csv(dest, index=False, encoding="utf-8-sig")
            source = deepcopy(sources.get(name, {}))
            for key in ["inputs", "constants", "date_formats", "person_id_normalization", "spell_key_fields"]:
                source.pop(key, None)
            source.update(enabled=True, path=str(dest), sheet=0, header=0, sep=",", encoding="utf-8-sig",
                          date_format="ISO8601", columns={c: c for c in frame if c in SCHEMAS[name] or c in {"effective_from", "outcome_group"}})
            converted["sources"][name] = source
        # La derivación ya se materializó y no debe repetirse al preparar de nuevo.
        converted["preparation_provenance"] = {"source_config": str(source_config), "contract_availability": contract,
                                              "followup_derivation": followup_rule, "clinical_validation_claim": False}
        converted["contract_availability"] = {"mode": "explicit"}
        converted["followup_derivation"] = {"mode": "none"}
        config_result = output / "config_canonica.json"
        config_result.write_text(json.dumps(converted, ensure_ascii=False, indent=2), encoding="utf-8")
    report = {"status": "blocked" if blocked else "prepared", "config_path": str(config_result) if config_result else None,
              "findings": findings, "row_counts": {name: len(frame) for name, frame in tables.items()},
              "clinical_validation_claim": False,
              "paths": {"report": str(output / "preparacion_fuentes.json"),
                        "manifest_local": str(output / "procedencia_local.json"),
                        "findings_csv": str(output / "hallazgos_preparacion.csv")}}
    if original_collision:
        report["paths"] = {name: None for name in report["paths"]}
        return report  # Ni el informe agregado puede ocupar una ruta original.
    (output / "procedencia_local.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "preparacion_fuentes.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    pd.DataFrame(findings, columns=["severity", "code", "source", "input_index", "count", "message", "resolution"]).to_csv(
        output / "hallazgos_preparacion.csv", index=False, encoding="utf-8-sig")
    return report
'''

# ARCHIVO 21 DE 25: rehavid_el/project.py
FUENTES['rehavid_el/project.py'] = r'''"""Preparación de originales y etapas visibles; nunca confunde terminar con entrenar."""
from datetime import datetime, timezone
from pathlib import Path
import json
import traceback

from .config import DataContractError, validate_config
from . import __version__


def _write(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2, default=str, allow_nan=False) + "\n", encoding="utf-8")


class ProjectRun:
    """Una carpeta nueva por ejecución. API común a consola, IA y Colab."""

    def __init__(self, config_path, output_dir=None, salt=None):
        self.config_path = Path(config_path).expanduser().resolve()
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S_%fZ")
        self.out = Path(output_dir or self.config_path.parent / f"resultado_{stamp}").expanduser().resolve()
        if self.out.exists() and any(self.out.iterdir()):
            raise FileExistsError(f"Use una carpeta de salida nueva o vacía: {self.out}. Se conservan ejecuciones anteriores.")
        self.out.mkdir(parents=True, exist_ok=True)
        self.analysis = None
        self.salt = salt
        self.preparation = None
        self.state = {"software": __version__, "status": "CREATED", "phase": "configuration",
                      "exit_code": 3, "training_completed": False, "selected_model": None,
                      "selection_completed": False,
                      "predicted_horizons_months": [], "findings": [], "cohorts": {},
                      "clinical_validation": "not_established"}
        self._save()

    def _save(self):
        _write(self.out / "estado_ejecucion.json", self.state)
        rows = ["# Resultado de esta ejecución", "", f"Estado: **{self.state['status']}**.",
                f"Fase: {self.state['phase']}. Código de salida: {self.state['exit_code']}.",
                f"Algún ajuste terminó: {self.state.get('training_completed', False)}. Selección terminada: {self.state.get('selection_completed', False)}.",
                f"Modelo seleccionado: {self.state.get('selected_model') or 'ninguno'}.",
                f"Horizontes con predicciones: {self.state.get('predicted_horizons_months', [])} meses.", "",
                "Estos estados describen el software y los datos utilizados. No certifican validez clínica ni utilidad del modelo.", ""]
        if self.state.get("cohorts"):
            rows += ["| Etapa | Personas | Eventos observados |", "|---|---:|---:|"]
            for stage, values in self.state["cohorts"].items():
                rows.append(f"| {stage} | {values['people']} | {values.get('events') if values.get('events') is not None else 'no corresponde'} |")
            rows.append("")
        for finding in self.state.get("findings", []):
            rows.append("- " + (finding if isinstance(finding, str) else json.dumps(finding, ensure_ascii=False)))
        rows += ["", "Consulte `preparacion/` para incidencias de fuentes; `analisis/tables/cohort_flow.csv` para exclusiones; "
                 "`analisis/tables/feasibility_by_horizon.csv` para seguimiento y eventos; "
                 "`analisis/model_result.json` para ajustes y evaluación; y "
                 "`analisis/tables/predicciones_por_persona_y_horizonte.csv` para predicciones o motivos de ausencia.",
                 "", "Una predicción individual de enfermedad futura expresa probabilidad a un horizonte; no asegura que la persona enfermará."]
        (self.out / "LEER_PRIMERO.md").write_text("\n".join(rows) + "\n", encoding="utf-8")
        return self.state

    def _fail(self, exc, status):
        # El registro detallado permanece local y puede contener nombres de columnas/rutas.
        (self.out / "error_local.txt").write_text(traceback.format_exc(), encoding="utf-8")
        self.state.update(status=status, exit_code=3 if isinstance(exc, (DataContractError, ValueError, FileNotFoundError)) else 2,
                          findings=[f"{type(exc).__name__}: {exc}"])
        self._save()
        return self.state

    def prepare_inputs(self):
        from .preparation import prepare_sources
        try:
            cfg = json.loads(self.config_path.read_text(encoding="utf-8"))
            self.state["company"] = cfg.get("company")
            if "mapping_reviewed" in cfg and cfg["mapping_reviewed"] is not True:
                raise DataContractError("El borrador no está revisado: complete fuentes, fechas, desenlace y mapeos; documente la revisión antes de establecer mapping_reviewed=true.")
            validate_config(cfg)
            self.state["phase"] = "source_preparation"
            self.preparation = prepare_sources(self.config_path, self.out / "preparacion")
            self.state["findings"] = self.preparation.get("findings", [])
            if self.preparation.get("status") != "prepared":
                self.state.update(status="DATA_PREPARATION_BLOCKED", exit_code=3)
                return self._save()
            from .workflow import Analysis
            self.analysis = Analysis(self.preparation["config_path"], self.out / "analisis", salt=self.salt)
            self.state.update(status="SOURCES_PREPARED", exit_code=0)
            return self._save()
        except Exception as exc:
            return self._fail(exc, "CONFIGURATION_BLOCKED" if self.state["phase"] == "configuration" else "DATA_PREPARATION_BLOCKED")

    def clean(self):
        if self.analysis is None:
            raise DataContractError("Prepare las fuentes y resuelva estado_ejecucion.json antes de limpiar.")
        self.state["phase"] = "cleaning_and_linkage"
        try:
            quality = self.analysis.load_and_clean()
            self.state.update(status="SOURCES_CLEANED", exit_code=0)
            self._save()
            return quality
        except Exception as exc:
            self._fail(exc, "DATA_CONTRACT_BLOCKED")
            raise

    def organize(self):
        if self.analysis is None:
            raise DataContractError("Prepare y limpie las fuentes antes de construir cohortes.")
        self.state["phase"] = "cohort_construction"
        try:
            self.state["cohorts"] = self.analysis.organize()
            self.state.update(status="COHORTS_BUILT", exit_code=0)
            self._save()
            return self.state["cohorts"]
        except Exception as exc:
            self._fail(exc, "COHORT_CONSTRUCTION_BLOCKED")
            raise

    def assess(self):
        if self.analysis is None:
            raise DataContractError("Construya cohortes antes de evaluar soporte.")
        self.state["phase"] = "feasibility"
        try:
            support = self.analysis.assess_feasibility()
            self.state["findings"] = ["Preparación terminada; todavía no se ha entrenado. Consulte feasibility_by_horizon.csv: potencialmente evaluable no equivale a suficiencia estadística ni buen desempeño."]
            if self.state["cohorts"].get("train", {}).get("people", 0) == 0:
                self.state["findings"].append("La cohorte de entrenamiento está vacía. Revise cohort_flow.csv antes de intentar ajustar.")
            self.state.update(status="PREPARED_NOT_TRAINED", exit_code=0)
            self._save()
            return support
        except Exception as exc:
            self._fail(exc, "FEASIBILITY_BLOCKED")
            raise

    def train(self):
        if self.analysis is None:
            raise DataContractError("Prepare datos y cohortes antes de entrenar.")
        self.state["phase"] = "training_and_evaluation"
        try:
            result = self.analysis.model()
            self.state["selected_model"] = result.get("selected_model")
            self.state["training_completed"] = bool(result.get("fit_completed", bool(result.get("selected_model"))))
            self.state["selection_completed"] = bool(result.get("selected_model"))
            self.state["candidate_status"] = result.get("candidate_status", [])
            self.state["validation_scope"] = result.get("validation_scope")
            self.state["horizon_status"] = result.get("horizon_status", [])
            good = sorted({r["horizon_months"] for r in result.get("horizon_status", [])
                           if r.get("stage") == "score" and r.get("status") == "research_probability"})
            self.state["predicted_horizons_months"] = good
            train = self.state["cohorts"].get("train", {})
            if self.state["training_completed"] and not self.state["selection_completed"]:
                self.state.update(status="FITTED_WITHOUT_SELECTION", exit_code=4,
                                  findings=[result.get("reason", "Hubo ajustes, pero no se pudo seleccionar un modelo."),
                                            "Revise candidate_status y failed_phase. No hay modelo seleccionado ni predicciones; un ajuste completado no demuestra convergencia, evaluación ni validez."])
            elif not self.state["training_completed"]:
                if train.get("people", 0) == 0:
                    status = "EMPTY_TRAINING_COHORT"
                    action = "Revise cohort_flow.csv: disponibilidad histórica, fecha índice, seguimiento y exclusiones por EL previa. No cambie fechas para forzar elegibilidad."
                elif train.get("events", 0) < self.analysis.cfg.get("evaluation", {}).get("min_train_events", 5):
                    status = "INSUFFICIENT_TRAINING_EVENTS"
                    action = "Verifique desenlace, enlaces y fechas. Si el recuento es correcto, hace falta una muestra con más eventos; la guarda informática no es un cálculo de tamaño muestral."
                elif self.state["candidate_status"]:
                    status = "CANDIDATE_ADJUSTMENT_OR_EVALUATION_FAILED"
                    action = "Revise candidate_status: la falla puede ocurrir en ajuste o evaluación posterior. No atribuya automáticamente esta falla a falta de datos."
                else:
                    status = "TRAINING_SUPPORT_BLOCKED"
                    action = "Revise el motivo y el soporte de entrenamiento/validación por horizonte; no se concluye inviabilidad de toda la empresa."
                self.state.update(status=status, exit_code=3,
                                  findings=[result.get("reason", "No se seleccionó un modelo."), action])
            elif self.state["cohorts"].get("score", {}).get("people", 0) == 0:
                self.state.update(status="SCORE_COHORT_EMPTY", exit_code=4,
                                  findings=["Modelo ajustado, pero no hay personas elegibles en la fecha de predicción. Revise la población de score."])
            elif set(good) == set(self.analysis.cfg["horizons_months"]):
                self.state.update(status="PREDICTIONS_GENERATED", exit_code=0,
                                  findings=["Se ajustó y seleccionó un modelo y se generaron predicciones en los horizontes declarados. Su desempeño debe revisarse antes de uso. No se ha demostrado validación en otra empresa."])
            else:
                self.state.update(status="TRAINED_WITH_PARTIAL_HORIZONS" if good else "TRAINED_TEST_NOT_EVALUABLE", exit_code=4,
                                  findings=["Se ajustó un modelo. Consulte horizon_status: los horizontes sin soporte o sin evaluación del test permanecen sin predicción."])
            self.state["phase"] = "completed"
            return self._save()
        except Exception as exc:
            self._fail(exc, "MODEL_EXECUTION_FAILED")
            raise

    def finish(self):
        if self.analysis is not None:
            try:
                self.analysis.finish()
            except Exception as exc:
                self.state["report_failure"] = f"{type(exc).__name__}: {exc}"
                if self.state["exit_code"] == 0:
                    self.state.update(status="REPORT_GENERATION_FAILED", exit_code=2)
        self._save()
        return self.out / "LEER_PRIMERO.md"

    def run(self, prepare_only=False):
        self.prepare_inputs()
        if self.analysis is None:
            return self.state
        try:
            self.clean()
            self.organize()
            self.assess()
            if not prepare_only:
                self.train()
        except Exception:
            # Cada etapa ya registró el error preciso. No continuar con datos parciales.
            pass
        finally:
            self.finish()
        return self.state
'''

# ARCHIVO 22 DE 25: rehavid_el/reports.py
FUENTES['rehavid_el/reports.py'] = r'''"""Informe de investigación y figuras agregadas; no publica registros personales."""
from __future__ import annotations

from pathlib import Path
from typing import Any
import json
import re

import numpy as np
import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt


_STAGES = {
    "inventory": "Inventario de fuentes",
    "quality": "Calidad de los datos",
    "event_status": "Estados del evento",
    "cohort_flow": "Construcción de las cohortes",
    "followup": "Seguimiento observable",
    "feature_dictionary": "Variables utilizadas",
    "feasibility_by_horizon": "Factibilidad de evaluación por horizonte",
}
_IDENTIFIERS = {
    "person_id", "person_key", "worker_id", "employee_id", "event_id", "spell_id",
    "name", "nombre", "apellido", "email", "documento", "cedula", "cédula",
    "diagnosis_text", "clinical_text", "raw_text", "note", "notes", "row_id",
}
_COUNT_NAMES = {
    "n", "count", "counts", "rows", "records", "events", "persons", "workers",
    "n_rows", "n_events", "n_persons", "n_missing", "missing_count", "duplicates",
    "n_records", "n_excluded", "excluded", "included", "n_included", "eligible",
    "n_eligible", "total", "cantidad", "recuento", "missing", "duplicates_count", "people",
    "events_by_horizon", "known_event_free", "early_censored",
}
_LABELS = {
    "train": "Entrenamiento", "validation": "Validación", "test": "Prueba", "score": "Predicción actual",
    "confirmed": "Confirmado", "pending": "Pendiente", "suspected": "Sospecha", "rejected": "Descartado", "unknown": "Desconocido",
    "active_people": "Personas activas", "overlapping_spells": "Vínculos simultáneos", "other_partition": "Otro grupo",
    "prevalent_confirmed": "Evento previo", "baseline_uncertain": "Evento incierto al inicio",
    "no_observation": "Sin vigilancia verificable", "no_positive_followup": "Sin seguimiento posterior",
    "eligible": "Incluidos", "events": "Eventos observados", "exact_duplicates_removed": "Duplicados exactos retirados",
    "employment": "Vínculos laborales", "outcomes": "Desenlaces", "followup": "Vigilancia",
    "health_events": "Antecedentes de salud", "exposures": "Exposiciones",
    "count": "Recuento", "n": "Personas", "n_persons": "Personas", "people": "Personas", "persons": "Personas",
    "n_events": "Eventos", "rows": "Filas", "n_rows": "Filas", "median_days": "Mediana de seguimiento (días)",
    "followup_median_days": "Mediana de seguimiento (días)", "median_followup_days": "Mediana de seguimiento (días)",
    "median_duration_days": "Mediana de seguimiento (días)", "missing_pct": "Porcentaje ausente",
    "missing_rate": "Proporción ausente", "n_missing": "Valores ausentes", "missing_count": "Valores ausentes",
    "stage": "Etapa", "horizon_months": "Horizonte (meses)", "horizon_days": "Horizonte (días)",
    "n_people": "Personas", "n_events_total": "Eventos en todo el seguimiento", "events_by_horizon": "Eventos hasta el horizonte",
    "known_event_free": "Sin evento y con seguimiento hasta el horizonte", "early_censored": "Censura antes del horizonte",
    "max_followup_days": "Seguimiento máximo (días)", "screen_status": "Estado del soporte", "reason": "Razón",
    "potentially_evaluable": "Potencialmente evaluable", "insufficient_support": "Soporte insuficiente",
    "order": "N.º", "step": "Paso", "kind": "Tipo", "responsible_roles": "Responsables",
    "execution_status": "Ejecución", "human_review_status": "Revisión profesional", "required_evidence": "Evidencia requerida",
    "review_criterion": "Criterio de revisión", "automatic": "Automático", "human": "Profesional",
    "executed": "Ejecutado", "not_executed": "Sin ejecutar", "pending_human": "Pendiente de revisión profesional",
    "blocked": "Detenido por error", "source": "Fuente", "check": "Control", "state": "Estado", "snapshot": "Cohorte",
}


def _label(value: Any, column: str = "") -> str:
    if column == "event":
        return "Con evento" if str(value).lower() == "true" else "Sin evento observado"
    raw = str(value)
    return _LABELS.get(raw, "Ausentes: " + raw[8:] if raw.startswith("missing_") else raw)


def _cell(value: Any) -> str:
    if value is None:
        return "—"
    if isinstance(value, (dict, list, tuple)):
        value = json.dumps(value, ensure_ascii=False, default=str)
    elif isinstance(value, (float, np.floating)):
        if not np.isfinite(value):
            return "—"
        value = f"{value:.4g}"
    else:
        try:
            if pd.isna(value):
                return "—"
        except (TypeError, ValueError):
            pass
    return str(value).replace("|", "\\|").replace("\n", " ").replace("\r", " ")


def _markdown(df: pd.DataFrame, limit: int = 60) -> str:
    if df.empty or not len(df.columns):
        return "No hay un resumen disponible para este bloque."
    shown = df.head(limit).copy()
    for column in ["stage", "screen_status", "execution_status", "human_review_status", "kind", "snapshot", "state"]:
        if column in shown:
            shown[column] = shown[column].map(lambda value: _label(value, column))
    shown = shown.rename(columns=lambda value: _LABELS.get(str(value), str(value)))
    header = "| " + " | ".join(_cell(c) for c in shown.columns) + " |"
    rule = "| " + " | ".join("---" for _ in shown.columns) + " |"
    body = ["| " + " | ".join(_cell(v) for v in row) + " |" for row in shown.itertuples(index=False, name=None)]
    tail = f"\n\nSe muestran {limit} de {len(df)} filas agregadas." if len(df) > limit else ""
    return "\n".join([header, rule, *body]) + tail


def _count_column(name: str) -> bool:
    name = name.lower()
    return name in _COUNT_NAMES or name.startswith("n_") or name.endswith("_count")


def _safe_aggregate(df: Any, minimum: int) -> pd.DataFrame:
    """Defensa adicional; la API exige tablas previamente agregadas.

    Una tabla que contenga una clave personal se omite entera: borrar sólo la
    clave dejaría otros datos por persona. Las rutas locales no se publican.
    Supresión simple de celdas pequeñas no equivale a anonimización formal.
    """
    if not isinstance(df, pd.DataFrame) or df.empty:
        return pd.DataFrame()
    lowered = {str(c).lower() for c in df.columns}
    if lowered & _IDENTIFIERS:
        return pd.DataFrame()
    columns = [c for c in df.columns if str(c).lower() not in {"path", "file_path", "filename", "file", "source_path", "path_local", "sheet_local"}]
    result = df.loc[:, columns].copy()
    # No mostrar una mediana, tasa u otra cifra de un grupo demasiado pequeño.
    denominators = [c for c in result.columns if str(c).lower() in {"n", "n_persons", "n_people", "people"}]
    small = pd.Series(False, index=result.index)
    for column in denominators:
        values = pd.to_numeric(result[column], errors="coerce")
        small |= values.gt(0) & values.lt(minimum)
    for column in result.columns:
        if _count_column(str(column)) and pd.api.types.is_numeric_dtype(result[column]):
            values = pd.to_numeric(result[column], errors="coerce")
            mask = values.gt(0) & values.lt(minimum)
            if mask.any():
                result[column] = result[column].astype(object)
                result.loc[mask, column] = f"<{minimum}"
        elif (str(column) not in {"horizon_months", "horizon_days", "order"} and small.any()
              and pd.api.types.is_numeric_dtype(result[column]) and not pd.api.types.is_bool_dtype(result[column])):
            result[column] = result[column].astype(object)
            result.loc[small, column] = "Suprimido"
    return result


def _placeholder(path: Path, title: str, reason: str) -> None:
    fig, ax = plt.subplots(figsize=(9, 3.7))
    ax.axis("off")
    ax.set_title(title, loc="left", fontsize=14, pad=18)
    ax.text(0.02, 0.57, reason, transform=ax.transAxes, va="center", fontsize=11, wrap=True)
    ax.text(0.02, 0.08, "Ausencia de estimación; no representa un valor de cero.", transform=ax.transAxes, fontsize=9, color="#555555")
    fig.tight_layout(rect=(0, 0, 1, 1))
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def _plot_aggregate(df: pd.DataFrame, path: Path, title: str, kind: str) -> None:
    if df.empty:
        _placeholder(path, title, "No hay un resumen agregado disponible o la tabla contiene identificadores.")
        return
    preferred_values = {
        "quality": ["missing_pct", "missing_rate", "pct_missing", "n_missing", "missing_count", "missing", "count", "n"],
        "cohort_flow": ["n", "count", "n_persons", "persons", "n_rows", "rows", "included", "n_included"],
        "event_status": ["n", "count", "n_events", "events", "n_records", "rows"],
        "followup": ["median_days", "followup_median_days", "median_followup_days", "median_duration_days", "duration_median", "median", "n", "count"],
    }[kind]
    preferred_labels = {
        "quality": ["source", "table", "check", "column", "feature", "metric"],
        "cohort_flow": ["stage", "cohort", "split", "step", "reason"],
        "event_status": ["state", "status", "source"],
        "followup": ["stage", "cohort", "split", "event", "metric"],
    }[kind]
    mapping = {str(c).lower(): c for c in df.columns}
    value = next((mapping[c] for c in preferred_values if c in mapping), None)
    labels = [mapping[c] for c in preferred_labels if c in mapping][:3]
    if value is None or not labels:
        _placeholder(path, title, "Consulte la tabla del informe: sus columnas no admiten este resumen gráfico automático.")
        return
    # Tables have already been suppressed; coercion prevents drawing hidden counts.
    draw = df.head(45 if kind == "cohort_flow" else 30).copy()
    values = pd.to_numeric(draw[value], errors="coerce")
    label_frame = pd.DataFrame({c: draw[c].map(lambda v: _label(v, str(c))) for c in labels})
    names = label_frame.astype(str).agg(" · ".join, axis=1).str.slice(0, 110)
    if values.notna().sum() == 0:
        _placeholder(path, title, "No hay valores numéricos publicables; los recuentos pequeños pueden estar suprimidos.")
        return
    fig, ax = plt.subplots(figsize=(10, max(3.8, 0.35 * len(draw) + 1.7)))
    positions = np.arange(len(draw))
    ax.barh(positions, values.fillna(0), color="#176B80")
    ax.set_yticks(positions, names)
    ax.invert_yaxis()
    ax.set_xlabel(_label(value))
    ax.set_title(title, loc="left", fontsize=14)
    ax.grid(axis="x", alpha=0.2)
    ax.set_axisbelow(True)
    for i, (number, raw) in enumerate(zip(values, draw[value])):
        if pd.isna(number):
            ax.text(0, i, " " + _cell(raw), va="center", fontsize=9)
    note = "Celdas suprimidas se rotulan; no se representan como cero."
    if len(df) > len(draw):
        note += f" Se muestran las primeras {len(draw)} filas agregadas."
    fig.text(0.02, 0.01, note, fontsize=8, color="#555555")
    fig.tight_layout(rect=(0, 0.04, 1, 1))
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)


def _issue_summary(issues: list[dict]) -> pd.DataFrame:
    if not issues:
        return pd.DataFrame([{"severity": "info", "code": "NO_RECORDED_ISSUES", "count": 0}])
    rows = []
    for issue in issues:
        if not isinstance(issue, dict):
            rows.append({"severity": "unknown", "code": "UNSTRUCTURED_ISSUE"})
            continue
        # Free-text messages could expose source records; retain structured codes.
        code = str(issue.get("code", issue.get("type", "UNSPECIFIED")))
        code = code if re.fullmatch(r"[A-Za-z0-9_\-.:]{1,100}", code) else "UNSTRUCTURED_CODE"
        known_safe = code in {"unknown_outcome_status", "observed_endpoint_and_censoring", "historical_negative_status"} or code.endswith("_overlapping_spells_excluded")
        message = issue.get("public_message", issue.get("message", "") if known_safe else "")
        rows.append({"severity": str(issue.get("severity", "unknown")), "code": code,
                     "count": issue.get("count", 1), "explanation": str(message)})
    return pd.DataFrame(rows)


def write_report(
    config: dict,
    out: Path,
    stage_tables: dict,
    model_result: dict | None,
    issues: list[dict],
) -> Path:
    """Escribe informe.md y cuatro figuras agregadas, sin modificar métricas.

    ``stage_tables`` debe contener resúmenes, nunca registros individuales.
    Métricas/modelos provienen exclusivamente de ``models.py``. Este módulo no
    genera probabilidades, no adjudica desenlaces y no certifica el modelo.
    """
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    figures = out / "figures"
    figures.mkdir(exist_ok=True)
    evaluation = config.get("evaluation") or {}
    minimum = max(1, int(evaluation.get("min_cell_count", 5)))
    safe = {name: _safe_aggregate(stage_tables.get(name), minimum) for name in _STAGES}
    for name in ("quality", "event_status", "cohort_flow", "followup"):
        _plot_aggregate(safe[name], figures / f"{name}.png", _STAGES[name], name)

    status = (model_result or {}).get("status", "NO_MODEL_RESULT")
    selected = (model_result or {}).get("selected_model") or "No seleccionado"
    scope = "Análisis de las fuentes configuradas; la validez clínica requiere revisión independiente."
    design = config.get("validation_design", "temporal")
    if design == "person_holdout":
        design_description = (
            "Se utiliza una fecha índice común y se reservan personas diferentes para entrenamiento, validación y prueba. "
            "Los predictores se limitan a la información disponible en esa fecha; el seguimiento posterior identifica eventos y censura. "
            "Los candidatos se ajustan con entrenamiento y se seleccionan con validación; el modelo permanece congelado en la prueba. "
            "Este diseño es una validación interna con reserva de personas independientes (`internal_independent_person_holdout`). "
            "No demuestra desempeño en un período posterior ni en otra empresa."
        )
        splitting_description = (
            "La separación por personas evita que un trabajador esté en más de un grupo de desarrollo/evaluación. "
            "Usar el mismo período de seguimiento puede aprovechar mejor la historia disponible, pero limita la evidencia de transporte a períodos futuros."
        )
    else:
        design_description = (
            "Los modelos se ajustan en entrenamiento, se comparan en validación posterior y se evalúan una vez en prueba posterior. "
            "El modelo seleccionado permanece congelado. Los cierres de etiquetas impiden entrenar con desenlaces conocidos después del cierre asignado."
        )
        splitting_description = (
            "En modo `temporal`, una persona puede aparecer en fechas distintas: la prueba describe una plantilla que puede contener trabajadores conocidos. "
            "En `temporal_disjoint`, las personas se separan mediante asignación determinista además del orden temporal. "
            "Ningún modo constituye por sí solo validación externa en otra empresa."
        )
    lines = [
        "# Rehavid — modelo predictivo de enfermedad laboral",
        "",
        "**Uso de investigación. Este informe no acredita validez clínica ni autoriza decisiones individuales.**",
        "",
        scope,
        "",
        f"Empresa configurada: **{_cell(config.get('company', 'Sin definir'))}**. "
        f"Evento configurado: **{_cell(config.get('outcome_name', 'Sin definir'))}**. "
        f"Base temporal del evento: **{_cell(config.get('outcome_date_basis', 'Sin definir'))}**.",
        "",
        f"Cierre de datos: {_cell(config.get('as_of'))}. Estado de ejecución: **{_cell(status)}**. "
        f"Modelo seleccionado: **{_cell(selected)}**.",
        "",
        "La salida, cuando es estimable, es la probabilidad del primer evento confirmado definido en la configuración, "
        "desde una fecha de predicción explícita y bajo los supuestos de seguimiento y censura del modelo. Una calificación registrada no equivale "
        "a la fecha biológica de inicio de la enfermedad. La sospecha, el reporte y la confirmación requieren estados distintos.",
        "",
        "La predicción de un evento futuro en salud se denomina también pronóstico. La probabilidad estimada es la salida "
        "del modelo predictivo para cada horizonte: estos términos no representan algoritmos ni objetivos diferentes. "
        "Una predicción individual no permite afirmar con certeza quién enfermará.",
        "",
        "## Diseño de validación y alcance",
        "",
        _markdown(pd.DataFrame([{"snapshot": k, "fecha": v} for k, v in (config.get("landmarks") or {}).items()])),
        "",
        design_description,
        "",
        splitting_description,
        "",
        f"Diseño configurado: `{_cell(design)}`. "
        + (f"Modo de separación temporal: `{_cell(config.get('split_mode', 'temporal'))}`. " if design != "person_holdout" else "") +
        f"Horizontes solicitados (meses): {_cell(config.get('horizons_months', [12, 36, 60]))}.",
        "",
        "Solicitar un horizonte no garantiza que pueda estimarse: se exige soporte en entrenamiento, validación y prueba. "
        "Los horizontes sin soporte deben tener probabilidad ausente y una razón explícita; nunca se completan mediante "
        "percentiles o copiando una probabilidad de otro horizonte.",
    ]

    stage_file = out / "tables" / "etapas_y_responsabilidades.csv"
    if stage_file.exists():
        stage_frame = pd.read_csv(stage_file)
        desired = ["order", "step", "responsible_roles", "execution_status", "human_review_status", "required_evidence"]
        stage_frame = stage_frame.loc[:, [col for col in desired if col in stage_frame]]
        lines.extend(["", "## Pasos ejecutados y responsabilidades profesionales", "", _markdown(_safe_aggregate(stage_frame, minimum)), "",
                      "La ejecución automática y la revisión profesional se registran por separado. Que una etapa se haya ejecutado "
                      "no significa que medicina laboral, epidemiología o el revisor independiente hayan firmado su revisión. "
                      "La IA no acredita esas revisiones por completar una configuración."])

    for name, title in _STAGES.items():
        lines.extend(["", f"## {title}", "", _markdown(safe[name])])
        if name == "feasibility_by_horizon":
            lines.extend(["", "Esta comprobación describe personas, eventos y seguimiento disponibles antes del entrenamiento. "
                          "«Potencialmente evaluable» no significa modelo entrenado, calibrado ni validado; la evaluación posterior "
                          "puede detectar limitaciones adicionales. Las personas censuradas antes del horizonte no se cuentan como negativos definitivos."])
        if name in {"quality", "event_status", "cohort_flow", "followup"}:
            lines.extend(["", f"![{title}](figures/{name}.png)"])

    lines.extend(["", "## Incidencias de ejecución", "", _markdown(_safe_aggregate(_issue_summary(issues), minimum)), "",
                  "Los detalles técnicos se consultan localmente. Sólo se incluyen explicaciones declaradas seguras; no se publican excepciones libres ni identificadores personales."])
    if model_result:
        for key, title in (("validation_metrics", "Comparación en validación"), ("horizon_status", "Soporte por horizonte"), ("metrics", "Resultados de prueba")):
            data = model_result.get(key)
            if isinstance(data, (list, tuple)) and data:
                lines.extend(["", f"## {title}", "", _markdown(_safe_aggregate(pd.DataFrame(data), minimum))])
        for name, title in (("model_comparison.png", "Comparación de candidatos"), ("calibration.png", "Calibración"), ("performance_by_horizon.png", "Rendimiento por horizonte"), ("risk_curves.png", "Curvas de riesgo")):
            if (figures / name).exists():
                lines.extend(["", f"![{title}](figures/{name})"])
        limits = model_result.get("limitations") or []
        if isinstance(limits, str):
            limits = [limits]
        if limits:
            lines.extend(["", "## Limitaciones registradas", ""])
            lines.extend(f"- {_cell(limit)}" for limit in limits)

    lines.extend([
        "", "## Interpretación y condiciones de uso", "",
        "- AUC temporal evalúa discriminación. Brier evalúa error de probabilidades y se compara con una referencia "
        "Kaplan–Meier ajustada en entrenamiento. La curva de calibración compara riesgo predicho y observado "
        "teniendo en cuenta censura cuando el seguimiento lo permite.",
        "- Evaluar calibración no significa haber aplicado recalibración posterior. Esta versión no implementa "
        "un ajuste de calibración posterior al entrenamiento. El intercepto y la pendiente, cuando se estiman "
        "conjuntamente, son diagnósticos y no corrigen las probabilidades exportadas.",
        "- Los intervalos de rendimiento obtenidos por bootstrap, cuando existen, son condicionales al modelo "
        "ya ajustado. No son intervalos individuales de riesgo ni incorporan toda la incertidumbre del desarrollo.",
        "- Las estimaciones con censura dependen de supuestos sobre seguimiento y registro. La pérdida de "
        "seguimiento relacionada con enfermedad puede producir sesgo; la salida no corrige automáticamente ese problema. "
        "IPCW requiere que la distribución de censura del entrenamiento sea apropiada para evaluar la cohorte reservada.",
        "- Se implementa supervivencia con censura a la derecha, no incidencia acumulada con riesgos competitivos. "
        "Si muerte, retiro u otro suceso impiden el desenlace, se requiere revisar el objetivo y ampliar el método. "
        "La suma de probabilidades no es automáticamente un presupuesto de casos en una empresa con rotación.",
        "- Los candidatos usan parámetros declarados; no se realiza búsqueda anidada de hiperparámetros. "
        "El supuesto de riesgos proporcionales de Cox no se diagnostica automáticamente.",
        "- Las filas de predicción con claves seudónimas siguen siendo datos sensibles. Las tablas agregadas y "
        "la supresión simple de celdas pequeñas tampoco acreditan anonimización formal.",
        f"- Este informe suprime recuentos positivos menores de {minimum}. Un dato ausente o una celda "
        "suprimida no representa ausencia de enfermedad.",
        "- No se estima automáticamente el efecto de una intervención ni la causa laboral de una enfermedad. "
        "No hay umbral universal de riesgo alto. Los criterios de aceptación y las acciones se definen antes "
        "de revisar resultados de prueba y requieren responsables clínicos y metodológicos.",
        "", "## Referencias metodológicas", "",
        "- [TRIPOD+AI: lista de verificación](https://www.tripod-statement.org/wp-content/uploads/2019/12/TRIPODAI_checklist.pdf).",
        "- [PROBAST+AI: calidad, sesgo y aplicabilidad](https://www.probast.org/).",
        "- [scikit-learn: evitar fuga de información](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage).",
        "- [scikit-survival: Brier con censura](https://scikit-survival.readthedocs.io/en/stable/api/generated/sksurv.metrics.brier_score.html).",
        "- [scikit-survival: AUC temporal](https://scikit-survival.readthedocs.io/en/stable/api/generated/sksurv.metrics.cumulative_dynamic_auc.html).",
        "",
    ])
    target = out / "informe.md"
    target.write_text("\n".join(lines), encoding="utf-8")
    return target
'''

# ARCHIVO 23 DE 25: rehavid_el/stages.py
FUENTES['rehavid_el/stages.py'] = r'''"""Trazabilidad del trabajo automático y de la revisión profesional pendiente.

Una ejecución de Python nunca acredita por sí sola validación clínica,
aprobación de un bioestadístico ni auditoría independiente.
"""
from pathlib import Path
import json

import pandas as pd


# Cada ID identifica una etapa observable; el llamador declara qué operaciones
# terminaron. Las responsabilidades humanas no se dan por realizadas por config.
STAGE_DEFINITIONS = [
    ("setup", "Preparar Python, instalar e importar bibliotecas", "automatic", "Científico de datos; MLOps",
     "Manifiesto con versiones instaladas y código identificado.", "Revisar compatibilidad y reproducibilidad del entorno."),
    ("protocol", "Definir enfermedad, primer evento, población y horizontes", "human", "Bioestadístico/epidemiólogo; médico laboral; producto y gobernanza",
     "Protocolo firmado: diagnóstico o calificación, fecha índice, desenlace y decisión de uso.", "Confirmar que el evento y la población representan la pregunta predictiva."),
    ("inventory", "Inventariar archivos, hojas, esquemas y cobertura documentada", "automatic", "Ingeniero de datos",
     "Inventario por archivo/hoja y relación de fuentes faltantes.", "Acreditar que están incluidas todas las bases de esta empresa."),
    ("mapping", "Mapear columnas, estados clínicos, fechas y unidades", "human", "Ingeniero de datos; médico laboral; experto en exposición",
     "Diccionario y mapeos revisados con propietario de datos y especialistas.", "No inferir origen laboral, estados firmes ni disponibilidad histórica desde nombres."),
    ("cleaning", "Normalizar tipos y fechas; tratar duplicados y faltantes", "automatic", "Ingeniero de datos; científico de datos",
     "Informe de calidad con conteos antes/después y errores identificados.", "Resolver contradicciones sin inventar valores ni convertir desconocidos en ceros."),
    ("linkage", "Integrar identificadores, vínculos, reingresos y fuentes", "automatic", "Ingeniero de datos; producto y gobernanza",
     "Controles de enlace, empresa, claves y registros sin correspondencia.", "Revisar cruces, intervalos reales, accesos y seudonimización."),
    ("cohorts", "Construir población en riesgo y seguimiento hasta evento o censura", "automatic", "Bioestadístico/epidemiólogo; médico laboral; científico de datos",
     "Flujo de inclusiones/exclusiones, eventos únicos y duración de seguimiento.", "Evaluar prevalentes, estados inciertos, censura informativa y eventos competitivos."),
    ("features", "Crear predictores disponibles antes de la fecha índice", "automatic", "Científico de datos; experto en exposición; médico laboral",
     "Diccionario de variables, ventanas retrospectivas y disponibilidad/faltantes.", "Confirmar pertinencia clínica, unidades y ausencia de información futura."),
    ("splitting", "Separar entrenamiento, validación y prueba temporal", "automatic", "Bioestadístico/epidemiólogo; científico de datos",
     "Fechas de partición y cierres de etiquetas documentados por cohorte.", "Verificar independencia requerida y soporte temporal de cada horizonte."),
    ("training", "Ajustar preprocesamiento y modelos sólo en entrenamiento", "automatic", "Científico de datos; bioestadístico/epidemiólogo",
     "Modelos entrenados, parámetros y fallas de ajuste registradas.", "Evaluar suficiencia de eventos, complejidad y supuestos; mínimos de cómputo no bastan."),
    ("selection", "Comparar modelos y seleccionar usando validación", "automatic", "Científico de datos; bioestadístico/epidemiólogo",
     "Comparación en horizontes comunes evaluables y regla de selección.", "Evitar seleccionar algoritmos, umbrales o variables mirando la prueba final."),
    ("evaluation", "Evaluar discriminación, calibración e incertidumbre en prueba", "automatic", "Bioestadístico/epidemiólogo; revisor independiente; médico laboral",
     "Métricas, curvas y límites por horizonte; comparación con referencia.", "Interpretar incertidumbre, desempeño en grupos y utilidad para la decisión prevista."),
    ("prediction", "Emitir predicciones por horizonte con soporte y trazabilidad", "automatic", "Científico de datos; médico laboral; producto y gobernanza",
     "Probabilidades y estados por horizonte; fecha índice, modelo y alcance.", "No presentar riesgo estimado como diagnóstico ni emitir horizontes no sustentados."),
    ("independent_review", "Auditar de forma independiente el modelo y su aplicabilidad", "human", "Revisor independiente; bioestadístico/epidemiólogo; médico laboral",
     "Concepto independiente firmado sobre datos, código, sesgo y criterios de aceptación.", "El mismo programa no puede certificar su propia validación clínica."),
    ("operations", "Definir despliegue, accesos, seguimiento y actualización", "human", "MLOps; producto y gobernanza; médico laboral",
     "Plan aprobado de uso, monitoreo, responsabilidades, seguridad y actualización.", "Definir acciones ante deterioro y nueva validación antes de sustituir el modelo."),
]
STAGE_IDS = tuple(row[0] for row in STAGE_DEFINITIONS)


def stage_log(config) -> pd.DataFrame:
    """Genera quince etapas pendientes; la configuración no acredita ejecución."""
    rows = []
    horizons = ", ".join(str(x) for x in config.get("horizons_months", [12, 36, 60]))
    for position, (stage, name, kind, roles, evidence, criterion) in enumerate(STAGE_DEFINITIONS, start=1):
        if stage == "splitting" and config.get("validation_design") == "person_holdout":
            name = "Separar entrenamiento, validación y prueba interna entre personas independientes"
            evidence = "Fecha índice común, partición reproducible por hash y ausencia de personas compartidas entre los tres grupos."
            criterion = "Verificar grupos sin personas compartidas y soporte de seguimiento; este diseño no acredita validación temporal posterior."
        rows.append({"order": position, "stage": stage, "step": name, "kind": kind,
                     "responsible_roles": roles, "execution_status": "pending_human" if kind == "human" else "not_executed",
                     "human_review_status": "pending", "required_evidence": evidence,
                     "review_criterion": criterion, "horizons_months": horizons,
                     "recorded_error_codes": "", "clinical_validation_claim": False})
    return pd.DataFrame(rows)


def write_stage_log(config, out, completed, errors) -> Path:
    """Escribe CSV/JSON de etapas reales y responsabilidades por revisar.

    ``completed`` contiene IDs de operaciones automáticas que efectivamente
    terminaron. No acepta que configurar una regla pruebe revisión humana.
    ``errors`` puede indicar ``stage``/``severity``/``code``. No publica textos
    de excepciones ni registros clínicos. Un error global no borra lo terminado.
    """
    completed = set(completed or [])
    unknown = completed.difference(STAGE_IDS)
    if unknown:
        raise ValueError(f"IDs de etapa desconocidos: {', '.join(sorted(unknown))}")
    frame = stage_log(config)
    for i, row in frame.iterrows():
        stage = row["stage"]
        stage_errors = [item for item in (errors or []) if item.get("stage") == stage and item.get("severity") == "error"]
        if stage_errors:
            frame.at[i, "execution_status"] = "blocked"
            frame.at[i, "recorded_error_codes"] = "; ".join(str(item.get("code", "error")) for item in stage_errors)
        elif stage in completed and row["kind"] == "automatic":
            frame.at[i, "execution_status"] = "executed"
    out = Path(out)
    (out / "tables").mkdir(parents=True, exist_ok=True)
    (out / "audit").mkdir(parents=True, exist_ok=True)
    csv_path = out / "tables" / "etapas_y_responsabilidades.csv"
    frame.to_csv(csv_path, index=False)
    (out / "audit" / "etapas_y_responsabilidades.json").write_text(
        json.dumps({"scope": "Ejecución automática y revisión profesional documentadas por separado.",
                    "human_reviews_automatically_certified": False,
                    "stages": frame.to_dict("records")}, ensure_ascii=False, indent=2, allow_nan=False) + "\n",
        encoding="utf-8")
    return csv_path
'''

# ARCHIVO 24 DE 25: rehavid_el/workflow.py
FUENTES['rehavid_el/workflow.py'] = r'''"""Una misma ejecución auditable para consola, una IA con Python y Colab."""
from datetime import datetime, timezone
from importlib.metadata import version, PackageNotFoundError
from pathlib import Path
import hashlib
import json
import os
import platform
import secrets
import traceback
import pandas as pd
from . import __version__
from .config import validate_config, DataContractError
from .data import inspect_sources, load_tables
from .cohort import build_cohorts, person_key
from .stages import write_stage_log

def _dump(path, obj):
    Path(path).write_text(json.dumps(obj, ensure_ascii=False, indent=2, default=str, allow_nan=False) + "\n", encoding="utf-8")

class Analysis:
    def __init__(self, config_path, output_dir=None, salt=None):
        self.config_path = Path(config_path).expanduser().resolve()
        self.cfg = json.loads(self.config_path.read_text(encoding="utf-8"))
        if not isinstance(self.cfg, dict):
            raise DataContractError("La configuración debe ser un objeto JSON.")
        self.base = self.config_path.parent
        suffix = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        self.out = Path(output_dir or self.base / f"resultado_{suffix}").expanduser().resolve()
        if (self.out / "audit" / "manifest.json").exists():
            raise FileExistsError("La salida contiene una ejecución previa; use una carpeta nueva para evitar resultados antiguos mezclados.")
        self.out.mkdir(parents=True, exist_ok=True)
        for sub in ["tables", "figures", "audit"]:
            (self.out / sub).mkdir(exist_ok=True)
        self.salt = salt or os.environ.get("REHAVID_EL_SALT") or secrets.token_hex(32)
        self.issues = []
        self.stage_tables, self.cohorts, self.features, self.model_result = {}, {}, [], None
        self.tables, self.completed = {}, ["setup"]
        self._prepared = False
        # Una clave aleatoria por ejecución no se escribe ni se envía a IA.
        self._write_manifest()

    def _write_manifest(self):
        packages = {}
        for name in ["pandas", "numpy", "scipy", "scikit-learn", "scikit-survival", "joblib", "matplotlib"]:
            try:
                packages[name] = version(name)
            except PackageNotFoundError:
                packages[name] = "not_installed"
        source_hash = {}
        for file in sorted(Path(__file__).parent.glob("*.py")):
            source_hash[file.name] = hashlib.sha256(file.read_bytes()).hexdigest()
        _dump(self.out / "audit" / "manifest.json", {
            "software": __version__, "python": platform.python_version(), "packages": packages,
            "run_utc": datetime.now(timezone.utc).isoformat(),
            "company": self.cfg.get("company"),
            "config_sha256": hashlib.sha256(self.config_path.read_bytes()).hexdigest(),
            "code_sha256": source_hash, "identity": "HMAC-SHA256; clave fuera de artefactos; no son datos anónimos",
            "intended_use": "Modelo predictivo de primer evento EL verificado: evaluación de probabilidades por horizonte",})
        # Copia auditable de reglas: la config NO debe contener claves ni secretos.
        _dump(self.out / "audit" / "config_used.json", self.cfg)

    def inspect(self):
        inventory, packet = inspect_sources(self.cfg, self.base)
        self.stage_tables["inventory"] = inventory
        inventory.to_csv(self.out / "tables" / "inventory.csv", index=False)
        _dump(self.out / "paquete_para_ia_solo_esquema.json", packet)
        self._mark("inventory")
        return packet

    def _mark(self, *stages):
        for stage in stages:
            if stage not in self.completed:
                self.completed.append(stage)
        write_stage_log(self.cfg, self.out, self.completed, self.issues)

    def load_and_clean(self):
        """Carga, mapea, normaliza, valida, elimina duplicados exactos y enlaza.

        Las filas contradictorias no se corrigen con una conjetura. Los faltantes
        clínicos permanecen faltantes; la imputación predictiva ocurre en train.
        """
        validate_config(self.cfg)
        if "inventory" not in self.stage_tables:
            self.inspect()
        tables, quality, problems = load_tables(self.cfg, self.base)
        self.tables = tables
        self.stage_tables["quality"] = quality
        self.issues.extend(problems)
        self._mark("cleaning", "linkage")
        quality.to_csv(self.out / "tables" / "quality.csv", index=False)
        return quality

    def organize(self):
        """Construye población en riesgo, seguimiento y predictores históricos."""
        if not self.tables:
            raise DataContractError("Ejecute load_and_clean() antes de organize().")
        cohorts, features, summaries, problems = build_cohorts(self.tables, self.cfg, self.salt)
        self.cohorts, self.features = cohorts, features
        # Correspondencia local para que el operador pueda relacionar predicciones
        # con sus registros. Nunca se incorpora al paquete de esquema para IA.
        private = self.out / "privado"
        private.mkdir(exist_ok=True)
        identities = self.tables["employment"][["company", "person_id"]].drop_duplicates().copy()
        identities["person_key"] = [person_key(row.company, row.person_id, self.salt)
                                    for row in identities.itertuples()]
        identities = identities.loc[identities.person_key.isin(cohorts["score"].person_key)]
        identities.to_csv(private / "correspondencia_personas.csv", index=False)
        try:
            private.chmod(0o700)
            (private / "correspondencia_personas.csv").chmod(0o600)
        except OSError:
            pass  # Otros sistemas gestionan accesos mediante su plataforma.
        self.stage_tables.update(summaries)
        self.issues.extend(problems)
        missing = []
        for stage, frame in cohorts.items():
            for feature in features:
                missing.append(dict(stage=stage, feature=feature, n_people=len(frame),
                    n_missing=int(frame[feature].isna().sum()), missing_pct=float(100*frame[feature].isna().mean()) if len(frame) else None))
        self.stage_tables["feature_missingness"] = pd.DataFrame(missing)
        self._mark("cohorts", "features", "splitting")
        for name, frame in self.stage_tables.items():
            frame.to_csv(self.out / "tables" / f"{name}.csv", index=False)
        _dump(self.out / "audit" / "issues.json", self.issues)
        self._prepared = True
        return {name: {"people": len(frame), "events": int(frame.event.sum()) if name != "score" else None}
                for name, frame in cohorts.items()}

    def assess_feasibility(self):
        """Recuento por personas/horizonte previo al ajuste, no aprobación clínica.

        Un positivo temprano cuenta aunque no complete el horizonte. Las personas
        censuradas antes del horizonte no se convierten en negativas definitivas.
        La estabilidad IPCW y el rendimiento se comprueban después en models.py.
        """
        if not self._prepared:
            raise DataContractError("Construya las cohortes antes de evaluar soporte.")
        rows = []
        ev = self.cfg.get("evaluation", {})
        for stage in ["train", "validation", "test"]:
            frame = self.cohorts[stage]
            t0 = pd.Timestamp(self.cfg["landmarks"][stage])
            for horizon in self.cfg["horizons_months"]:
                days = float(((t0 + pd.DateOffset(months=horizon))-t0).days)
                positive = frame.event & frame.duration_days.le(days)
                observed_negative = frame.duration_days.gt(days)
                n, events = len(frame), int(frame.event.sum())
                reasons = []
                if n < int(ev.get("min_train_people" if stage == "train" else f"min_{stage}_people", 20 if stage == "train" else 10)):
                    reasons.append("pocas personas para la guarda de cálculo")
                if int(positive.sum()) < int(ev.get("min_train_events_at_horizon" if stage == "train" else f"min_{stage}_events", 2)):
                    reasons.append("pocos eventos observados al horizonte")
                if int(observed_negative.sum()) < int(ev.get("min_at_risk", 5)):
                    reasons.append("seguimiento posterior al horizonte insuficiente")
                rows.append(dict(stage=stage, horizon_months=horizon, n_people=n,
                    n_events_total=events, events_by_horizon=int(positive.sum()),
                    known_event_free=int(observed_negative.sum()),
                    early_censored=int((~frame.event & frame.duration_days.le(days)).sum()),
                    max_followup_days=float(frame.duration_days.max()) if n else None,
                    horizon_days=days, screen_status="insufficient_support" if reasons else "potentially_evaluable",
                    reason="; ".join(reasons)))
        result = pd.DataFrame(rows)
        self.stage_tables["feasibility_by_horizon"] = result
        result.to_csv(self.out / "tables" / "feasibility_by_horizon.csv", index=False)
        _dump(self.out / "audit" / "feasibility_scope.json", {
            "meaning": "Cribado de soporte de datos; no demuestra suficiencia muestral ni rendimiento predictivo.",
            "validation_design": self.cfg.get("validation_design", "temporal"),
            "training_completed": False, "clinical_validation": "not_established_by_this_screen"})
        return result

    def prepare(self):
        """Atajo reproducible a las tres etapas que el cuaderno muestra separadas."""
        self.load_and_clean()
        summary = self.organize()
        self.assess_feasibility()
        return summary

    def model(self):
        if not self._prepared:
            raise DataContractError("Ejecute prepare() correctamente antes de model().")
        from .models import fit_select_evaluate
        self.model_result = fit_select_evaluate(self.cohorts, self.features, self.cfg, self.out)
        if self.model_result.get("selected_model"):
            self._mark("training", "selection")
        if self.model_result.get("metrics"):
            self._mark("evaluation")
        if any(x.get("stage") == "score" and x.get("status") == "research_probability" for x in self.model_result.get("horizon_status", [])):
            self._mark("prediction")
        self._export_three_horizons()
        _dump(self.out / "model_result.json", self.model_result)
        return self.model_result

    def _export_three_horizons(self):
        """Vista por persona: predicción por horizonte o motivo de ausencia."""
        base = self.cohorts["score"][["person_key", "index_date"]].copy()
        base["index_date"] = pd.to_datetime(base.index_date).dt.strftime("%Y-%m-%d")
        path = self.out / "tables" / "predictions.csv"
        try:
            records = pd.read_csv(path, dtype={"person_key": str})
        except (FileNotFoundError, pd.errors.EmptyDataError):
            records = pd.DataFrame()
        horizon_rows = self.model_result.get("horizon_status", [])
        for months in self.cfg["horizons_months"]:
            info = next((x for x in horizon_rows if x.get("stage") == "score" and x.get("horizon_months") == months), {})
            columns = {"probability": f"probabilidad_EL_{months}m", "status": f"estado_{months}m", "reason": f"motivo_{months}m"}
            if len(records) and "horizon_months" in records:
                subset = records.loc[records.horizon_months.eq(months), ["person_key", "probability", "status", "reason"]].rename(columns=columns)
                base = base.merge(subset, how="left", on="person_key", validate="one_to_one")
            else:
                base[columns["probability"]] = float("nan")
                base[columns["status"]] = "not_estimable"
                base[columns["reason"]] = info.get("reason") or self.model_result.get("reason", "Modelo no evaluable")
        base["validation_scope"] = self.model_result.get("validation_scope", "not_evaluated")
        base.to_csv(self.out / "tables" / "predicciones_por_persona_y_horizonte.csv", index=False)
        _dump(self.out / "dictamen_predictivo.json", {
            "purpose": "Predecir primer evento EL verificado a partir de información previa a la fecha índice",
            "endpoint": self.cfg.get("outcome_name"), "event_date_basis": self.cfg.get("outcome_date_basis"),
            "company": self.cfg.get("company"),
            "validation_scope": self.model_result.get("validation_scope"),
            "model_status": self.model_result.get("status"), "horizons": horizon_rows,
            "clinical_use": "Requiere valoración independiente de discriminación, calibración, utilidad y aplicabilidad; ninguna guarda informática certifica este uso.",
            "certainty": "La predicción individual es probabilística, no una afirmación de que una persona enfermará con certeza."})

    def finish(self):
        from .reports import write_report
        self._mark()
        for name, frame in self.stage_tables.items():
            frame.to_csv(self.out / "tables" / f"{name}.csv", index=False)
        _dump(self.out / "audit" / "issues.json", self.issues)
        return write_report(self.cfg, self.out, self.stage_tables, self.model_result, self.issues)

    def run(self):
        try:
            self.inspect()
            self.prepare()
            self.model()
        except Exception as exc:
            self.issues.append({"severity": "error", "code": "execution_stopped", "count": 1,
                "public_message": "Ejecución detenida: revise el contrato de datos y el registro local. No se sustituyeron resultados por cifras artificiales."})
            # Registro local: puede contener rutas o nombres de columnas. No enviar a IA sin revisar.
            (self.out / "audit" / "error_local.txt").write_text(traceback.format_exc(), encoding="utf-8")
            self.finish()
            raise
        return self.finish()
'''

# ARCHIVO 25 DE 25: requirements.txt
FUENTES['requirements.txt'] = r'''# Entorno probado: Python 3.12.14. Usar Python >=3.11,<3.15.
# scikit-survival 0.27 requiere scikit-learn >=1.8,<1.9.
numpy==2.3.5
pandas==2.2.3
scipy==1.17.0
scikit-learn==1.8.0
scikit-survival==0.27.0
matplotlib==3.10.8
openpyxl==3.1.5
pyarrow==25.0.1
joblib==1.5.3
pyxlsb==1.0.10
xlrd==2.0.1
pytest==9.1.1
'''

# HUELLAS DE LOS ARCHIVOS ORIGINALES: DETECTAN CAMBIOS EN LA COPIA.
HUELLAS = {
    "Pronostico_EL_IA.py": "be8a269abb6d5b7be5b848d8754f9e7b33bf81ba47612862da7ae63f6ff10a51",
    "README.md": "f9b77f0e6b849da44bff25eb67403eb37a5664c10851e7bb365acfa7d1250815",
    "docs/CONTRATO_DATOS.md": "69854825ec70ff36f941cf2dd1f99e83ba33ac962cce89448a6a3fab497d0d7e",
    "docs/FORMULARIOS_EMPRESA.md": "f6dbaffbf379a1071512c28c7d558d2ec99d87d0be3fc97091c66b2439c20cef",
    "docs/INGESTA_ORIGINALES.md": "485a0dca499d22727ad8ae7a6954085d5425c3fcd92d28247dc4461fac60de90",
    "docs/MANUAL.md": "0600c36111bc980757c3f7603cd5eea7200f588354cb6a92490a75687f7bdec1",
    "docs/PROMPT_PARA_CUALQUIER_IA.md": "64778385d775632f2cca8df3c2087c36e0a3c9c98a76daf1aff6dd8ec9c597f3",
    "docs/RESPONSABILIDADES.md": "559c878d8f484253b67f9a7be62b2193aa10b453ccc6bf5ed7094f72cad072e1",
    "rehavid_el/__init__.py": "4af318b63459cf22c943e76d9b51df7a97ebe8a6d022a9395c97d3bfd22920ad",
    "rehavid_el/cohort.py": "8e498e2492a6fd674532bff08efb603ac3752ef10619d75d5fcd41c96d573c19",
    "rehavid_el/config.py": "6395b812cdb790be84cc2c1f984ed2085c4e1d416f4012a04333e6612ab2cdb5",
    "rehavid_el/configurator.py": "8d02605ca18dab095ba9c8a7a959505dce689910814bef3bf6430aa7fda7274a",
    "rehavid_el/data.py": "e72d3665e225588fb799c1b9d29507763dd8b76fa2bb17a24ba29de253f35028",
    "rehavid_el/discovery.py": "d4328d6d1e52f9c15e0fe051101ff5d3b509f2f6e71fb8f5e15825a2076a95c2",
    "rehavid_el/evidence.py": "9d546d6d25cf3b65fba84249895c7395a76a5eb0a8882a52f548410aa7d57ae2",
    "rehavid_el/ingest.py": "53bc4f9e836861e193fc63eb8a4369a73cc1fecf6d1eb9acb768693462ab35b8",
    "rehavid_el/mapping.py": "d78869e82a72156d1bd6b7ad6db8a74d33234f52a133e9c304c95dc72bcb6155",
    "rehavid_el/models.py": "f3f3f44b6e2a2814e6359fd6b3bcb42217668d50c145b895e6dda5e7b9fa2e23",
    "rehavid_el/portable.py": "f304807196ce5653643fc06b848c2ac51e204e33fd93ed7157bb86c0572bad71",
    "rehavid_el/preparation.py": "3c420b3fd71bc30ae54f6399f323e01f0b616e7417ecaa7765fb9e6bb8a16881",
    "rehavid_el/project.py": "34295efd1b0a074a3039e3ad67b0d7f80add379f31c6c4236b698c121ce2c2b1",
    "rehavid_el/reports.py": "de389d5296d4cf5cdc792048ee5890702f384c3cb8dc6da2a7e66713178b0e49",
    "rehavid_el/stages.py": "c915a530b7aa49f1d04428aa20de28a8728f51461f1dfe7ba4dcfe2bf9ec39b1",
    "rehavid_el/workflow.py": "1184d9c5359597ad3d5ff424e1d462aadb3f332b085469829376ec52684ee9a3",
    "requirements.txt": "f36942b5bb7f584218e0a622b23c4e50d9d89fba64f18605de24bd1a0144002d"
}

def verificar_codigo():
    """Comprueba que los módulos y documentos conservan sus bytes originales."""
    import hashlib
    if set(FUENTES) != set(HUELLAS):
        raise RuntimeError("La copia está incompleta: faltan o sobran archivos del motor.")
    for nombre, contenido in FUENTES.items():
        actual = hashlib.sha256(contenido.encode("utf-8")).hexdigest()
        if actual != HUELLAS[nombre]:
            raise RuntimeError("La copia cambió o quedó incompleta en: " + nombre)
    return len(FUENTES)


def extraer_motor(destino):
    """Reconstruye sólo el motor; conserva los archivos existentes."""
    from pathlib import Path
    verificar_codigo()
    destino = Path(destino).expanduser().resolve()
    for nombre in FUENTES:
        if not (destino / nombre).resolve().is_relative_to(destino):
            raise RuntimeError("Ruta fuera de la carpeta del motor: " + nombre)
    if destino.exists() and any(destino.iterdir()):
        for nombre, contenido in FUENTES.items():
            archivo = destino / nombre
            if not archivo.is_file() or archivo.read_bytes() != contenido.encode("utf-8"):
                raise RuntimeError("La carpeta contiene otro motor. Use una carpeta nueva: " + str(destino))
        return destino
    destino.mkdir(parents=True, exist_ok=True)
    for nombre, contenido in FUENTES.items():
        archivo = destino / nombre
        archivo.parent.mkdir(parents=True, exist_ok=True)
        archivo.write_bytes(contenido.encode("utf-8"))
    return destino


def main(argumentos=None):
    """Entrada para consola o para una IA que ejecute Python."""
    import runpy
    import sys
    from pathlib import Path
    argumentos = list(sys.argv[1:] if argumentos is None else argumentos)
    if argumentos == ["--verify-code"]:
        print("Integridad correcta:", verificar_codigo(), "archivos originales V5 completos.")
        return
    if argumentos and argumentos[0] == "--extract-code":
        if len(argumentos) != 2:
            raise SystemExit("Uso: --extract-code CARPETA_NUEVA")
        print(extraer_motor(argumentos[1]))
        return
    base = Path(__file__).resolve().parent if "__file__" in globals() else Path.cwd()
    motor = extraer_motor(base / "rehavid_motor_v5_legible_946e16a11a37")
    anteriores = sys.argv[:]
    ruta_anterior = sys.path[:]
    try:
        sys.path.insert(0, str(motor))
        sys.argv = [str(motor / "Pronostico_EL_IA.py"), *(argumentos or ["--help"])]
        runpy.run_path(str(motor / "Pronostico_EL_IA.py"), run_name="__main__")
    finally:
        sys.argv = anteriores
        sys.path[:] = ruta_anterior


if __name__ == "__main__":
    if "__file__" in globals():
        main()
    else:
        print('Código cargado. Ejecute main(["--verify-code"]) para comprobarlo.')

# FIN COMPLETO DEL CÓDIGO REHAVID V5 LEGIBLE
