# Contrato de especificación de herramientas — Rehavid LSS DMAIC

Cada hoja del Excel original se representa como **un objeto TOOL declarativo**. El
renderer genérico (`30_render.js`) los dibuja; el exportador (`82_xlsx.js`) los
vuelca de regreso a la plantilla Excel original celda por celda.

```js
TOOL = {
  id:    'definir.pareto',          // único, `<modulo>.<slug>`
  mod:   'DEFINIR',                 // DEFINIR|MEDIR|ANALIZAR|MEJORAR|CONTROLAR
  sheet: 'Pareto',                  // NOMBRE EXACTO de la hoja en el .xlsx original
  title: 'Gráfico Pareto — Base Line',
  desc:  'Una línea explicando para qué sirve.',
  guide: ['viñeta de ayuda 1', 'viñeta 2'],   // opcional, panel "¿Cómo se usa?"
  blocks: [ ...BLOQUES... ],
  xl:    { ...MAPEO EXCEL... },
  bi:    (d, ctx) => ({...})        // opcional: aporta KPIs al tablero BI
}
```

`d` = objeto de datos de la herramienta (persistido). `ctx` = `{proj, all, tool}` donde
`all` es el mapa `{toolId: data}` de todo el proyecto.

---

## BLOQUES

### 1. `fields` — formulario de campos sueltos
```js
{ type:'fields', title:'Encabezado', cols:3, items:[
  { k:'proceso', label:'PROCESO', input:'text', ph:'placeholder', w:2 },
  { k:'fecha',   label:'FECHA',   input:'date' },
  { k:'meta',    label:'Objetivo',input:'number', step:0.01, unit:'%' },
  { k:'notas',   label:'Notas',   input:'textarea', rows:4, w:3 },
  { k:'turno',   label:'TURNO',   input:'select', opts:['1','2','3'] },
  { k:'total',   label:'TOTAL',   ro:true, calc:(d,ctx)=> num(d.a)+num(d.b), fmt:'n2' },
]}
```
`input`: `text | textarea | number | date | select | check | color | rich`
`w`: ancho en columnas de grid (default 1). `ro:true` + `calc` = celda calculada.

### 2. `grid` — tabla de filas dinámicas
```js
{ type:'grid', key:'rows', title:'Datos', min:5, max:200, addLabel:'Agregar criterio',
  cols:[
    { k:'cat',  label:'Categoría', input:'text', w:'2fr' },
    { k:'fre',  label:'Frecuencia',input:'number', w:'1fr', align:'right' },
    { k:'pct',  label:'%',         ro:true, fmt:'p1',
      calc:(r, i, rows, d, ctx)=> num(r.fre)/sum(rows,'fre') },
  ],
  foot:[ { k:'fre', calc:(rows)=> sum(rows,'fre'), fmt:'n0', label:'TOTAL' } ],
  rowStyle:(r,i)=> '',                 // opcional: clase CSS por fila
  sortBy:'fre', sortDir:'desc',        // opcional: orden de VISUALIZACIÓN
}
```

### 3. `chart` — gráfico SVG (motor propio, sin librerías)
```js
{ type:'chart', kind:'pareto', title:'Pareto', h:340,
  data:(d,ctx)=> ({ labels:[], values:[] }) }
```
`kind`: `line | lineTarget | bar | hbar | pareto | beforeAfter | gantt | control | histogram | pie | stacked | radar | waterfall | scatter`

### 4. `diagram` — lienzo interactivo
```js
{ type:'diagram', kind:'ishikawa', key:'ish', title:'...' }
```
`kind`: `ishikawa | fivewhy | tree | sipoc | swimlane | affinity | ctq | flow`

### 5. `matrix` — tabla de celdas fijas (filas y columnas predefinidas)
```js
{ type:'matrix', key:'m', rows:['DESEADO','GOAL','RETADORA'],
  cols:[{k:'metrico',label:'MÉTRICO'},{k:'base',label:'BASE LINE'}],
  cell:(rk,ck,d)=>..., calc:{ 'DESEADO.benef':(d)=>... } }
```

### 6. `cards` — tarjetas de resultado (KPI grandes)
```js
{ type:'cards', items:(d,ctx)=>[ {label:'RTY', value:'87.4%', tone:'ok'|'warn'|'bad', hint:'...'} ] }
```

### 7. `note` — texto guía / interpretación
```js
{ type:'note', tone:'info'|'warn', text:'...' }
{ type:'note', tone:'info', text:(d,ctx)=> '...' }        // dinámico
```

### 8. `insight` — salida del motor de análisis para esta herramienta
```js
{ type:'insight' }     // renderiza automáticamente ENGINE.forTool(tool.id, d, ctx)
```

### 9. `a3` — bloque A3 (áreas de texto/imagen con layout de cuadrantes)
```js
{ type:'a3', areas:[ {k:'problema', label:'PROBLEM STATEMENT', h:200, w:2, kind:'text'|'image'|'ref'},
                     {k:'graf', label:'GRÁFICO', kind:'ref', ref:'definir.pareto'} ] }
```
`kind:'ref'` incrusta en vivo el gráfico/tabla de otra herramienta.

### 10. `upload` — imagen embebida (foto/bosquejo/ayuda visual)
```js
{ type:'upload', k:'foto', label:'Foto, imagen o bosquejo del problema', h:260 }
```

---

## MAPEO EXCEL (`xl`)

Reproduce EXACTAMENTE la plantilla original. No se escriben celdas con fórmula
(Excel las recalcula solo).

```js
xl:{
  fields:{ proceso:'B3', fecha:'D3' },              // campo -> celda
  grids:[{ key:'rows', row:7, cols:{ cat:'B', fre:'C' } }],   // fila inicial + columna por campo
  matrix:[{ key:'m', map:{ 'DESEADO.metrico':'C4' } }],
  images:[{ k:'foto', anchor:'D5', w:9, h:6 }],     // ancla + tamaño en celdas
  diagrams:[{ key:'ish', kind:'ishikawa', anchor:'B5' }]  // se exporta como imagen PNG
}
```

---

## HELPERS GLOBALES disponibles en los `calc`

`num(v)` → Number seguro (0 si vacío) · `sum(rows,'k')` · `avg(rows,'k')` ·
`count(rows,'k')` · `max/min(rows,'k')` · `pct(a,b)` · `stdev(arr)` ·
`normsinv(p)` · `round(v,n)` · `safeDiv(a,b)` · `fmt(v,'p1')`

Formatos `fmt`: `n0 n1 n2 n3 | p0 p1 p2 | money | int | date | text`

## REGLAS
1. **Fidelidad primero**: mismos títulos, mismo orden de columnas, mismas fórmulas
   que el Excel. Si el Excel dice `=C7*D7*E7*F7*G7`, el `calc` hace lo mismo.
2. Los textos visibles van **en español tal cual el Excel** (incluso si el Excel
   está en inglés: se respeta el original y se agrega traducción en `desc`).
3. Nunca usar librerías externas ni `fetch`. Todo offline.
4. Cada archivo de specs exporta `SPECS_<MODULO>` como array de TOOL.
