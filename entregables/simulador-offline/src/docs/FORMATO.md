# Documentos sintéticos de los casos

Cada simulación trae los documentos que un actor real tendría en la mano: la solicitud, los dictámenes, las
constancias, los certificados, la historia clínica con sus exámenes e imágenes diagnósticas, los informes de
higiene y de puesto, la historia laboral. Son **sintéticos**: ninguna persona, ningún número de identificación,
ningún profesional y ningún documento corresponde a uno real. Son **verosímiles**: tienen la estructura, el
vocabulario, las unidades, las normas y las cifras que tendría el documento real, y son coherentes con el
expediente del instrumento (fechas, porcentajes, diagnósticos, versiones, defectos de cada versión).

El participante abre un documento desde el soporte o la pieza que tiene a la vista («Ver el documento»). El
investigador los revisa todos en `documentos-sinteticos.html`.

## Archivos

| Archivo | Qué trae |
|---|---|
| `src/docs/base.js` | `const DOCS = { exp:{}, ruta:{} };` |
| `src/docs/exp-pi-l01.js` … `exp-pi-l04.js` | `DOCS.exp["PI-L01"] = { … };` los documentos de cada expediente |
| `src/docs/ruta-mp.js` | `DOCS.ruta.mp = { … };` los documentos del caso de la ruta (perfil `mp`) |
| `src/doc-1-render.js` | `docHtml(doc, opc)` y las figuras SVG (audiograma, espirometría, resonancia, radiografía…) |
| `src/estilos-doc.css` | el aspecto de hoja de papel, la marca de agua y la impresión |

Los archivos de datos son JavaScript plano, sin `import`/`export`, que se concatena dentro de la IIFE del
simulador: solo asignan propiedades de `DOCS`. Nada de funciones, nada de `Date`, nada de HTML: solo datos.

## Un expediente (`DOCS.exp[id]`)

```js
DOCS.exp["PI-L01"] = {
  identidad: {                       // los identificadores sintéticos que repiten todos los documentos del caso
    documento: "C.C. SIM-71.384.226",  // siempre con el prefijo SIM-
    historia: "HC SIM-0471-2023",
    afiliacionArl: "SIM-ARL-2013-55810",
    // … lo que el caso necesite: NIT sintéticos de empresas («NIT SIM-900.412.733-5»), radicados, etc.
  },
  soportes: {                        // uno por cada soporte del caso (mismas claves que caso.soportes[].k)
    IBC: {
      v1: DOC,                       // una entrada por versión que el expediente puede tener en la mano:
      v2: DOC                        // la inicial (`ver`) y la de referencia (`verRef`); la ausente solo tiene verRef
    },
    HC: { v2: DOC },
    …
  }
};
```

## La ruta (`DOCS.ruta[perfilId]`)

```js
DOCS.ruta.mp = {
  identidad: { … },
  piezas: { hc: DOC, apt: DOC, inc: DOC, hl: DOC }   // dic no: el dictamen de la ruta lo produce el recorrido
};
```

En la ruta, cada dato que corresponde a un campo de la pieza (`EV[k].campos[i]`, valores en
`perfiles/perfil-ejemplo-mp.json`) lleva el índice `campo: i`. El visor tacha lo que no llegó a la entidad del
participante o lo que el contrato retiene en origen, de modo que el documento muestra exactamente lo mismo que
el expediente de la pantalla.

## Un documento (`DOC`)

```js
{
  tipo: "dictamen",                  // solicitud | dictamen | constancia | certificado | historia | informe |
                                     // examen | imagen | incapacidad | historia_laboral | analisis_puesto | oficio
  titulo: "Dictamen de pérdida de capacidad laboral",
  emisor: { n: "ARL SURA", area: "Medicina laboral", ciudad: "Medellín", id: "NIT SIM-…" },   // solo texto
  numero: "DIC-L01",                 // el identificador del documento; los del instrumento se respetan tal cual
  fecha: "18/03/2026",
  version: "v1",
  estadoNota: "",                    // opcional: lo que este ejemplar tiene de particular («copia sin firma», …)
  paginas: [                         // una o varias hojas; las siguientes son anexos del mismo documento
    { titulo: "Dictamen", bloques: [ BLOQUE, … ] },
    { titulo: "Anexo 1 · Informe de resonancia magnética", bloques: [ … ] }
  ]
}
```

### Bloques

| Bloque | Forma | Para qué |
|---|---|---|
| sección | `{ h: "Fundamentos de hecho" }` | un subtítulo |
| párrafo | `{ p: "texto" }` | prosa |
| datos | `{ kv: [["Campo", "Valor"], ["Campo", "Valor", 2]] }` | pares; el tercer elemento, si está, es el `campo` de la ruta |
| tabla | `{ tabla: { cols: ["Mes", "IBC"], filas: [["Oct. 2023", "$3.280.000"]], nota: "" } }` | |
| lista | `{ lista: ["…", "…"] }` | |
| figura | `{ figura: { tipo, datos, pie } }` | ver abajo |
| firma | `{ firma: { nombre, cargo, registro, fecha } }` | firma electrónica sintética |
| nota | `{ nota: "texto menor" }` | aclaraciones, sellos, pies |
| vacío | `{ vacio: "Septiembre de 2024: sin registro en esta exportación." }` | lo que el documento deja ver que le falta |

Cualquier bloque puede llevar `campo: i` (ruta) para tacharlo entero cuando ese campo no está a la vista.

### Figuras (`figura.tipo`)

| Tipo | `datos` |
|---|---|
| `audiograma` | `{ od: {250:15, 500:20, 1000:25, 2000:40, 3000:55, 4000:70, 6000:65, 8000:50}, oi: {…}, via: "aérea" }` (dB HL) |
| `espirometria` | `{ fvc: 3.10, fvcPred: 4.25, fev1: 2.20, fev1Pred: 3.40, pef: 6.1, pefPred: 8.9, patron: "restrictivo" | "obstructivo" | "mixto" | "normal" }` (L, L/s) |
| `rm_columna` | `{ region: "cervical" | "lumbar", secuencia: "T2 sagital", hallazgos: [{ nivel: "C5-C6", tipo: "hernia" | "protrusion" | "estenosis" | "artrodesis" | "mielopatia" }] }` |
| `rx_torax` | `{ profusion: "2/1", forma: "q/r", zonas: ["sd", "si", "md", "mi", "id", "ii"], grandes: "0" }` (clasificación OIT; cada zona es altura + lado: `s` superior, `m` media, `i` inferior; `d` derecha, `i` izquierda — `sd` es la zona superior derecha, `ii` la inferior izquierda) |
| `neuroconduccion` | `{ filas: [{ nervio: "Mediano derecho", tipo: "sensitivo" | "motor", latencia: 4.9, latRef: 3.5, amplitud: 8, ampRef: 20, velocidad: 38, velRef: 50 }] }` |
| `serie` | `{ titulo, unidad, puntos: [["Oct. 2023", 3280000], …], limite: { valor, etiqueta }, forma: "barras" | "linea" }` |

Las imágenes diagnósticas son **esquemas sintéticos** dibujados a partir de los hallazgos (no fotografías): el
visor las rotula así.

## Reglas de contenido

1. **Coherencia con el instrumento.** Fechas, porcentajes, diagnósticos (CIE-10), números de documento
   (`RAD-L01`, `DIC-L01`, `FIR-L01`…), emisores, custodios y la cronología salen de `src/datos-expedientes.js`
   y no se contradicen. Cada versión muestra lo que dice su `notaEstado`: la versión no conforme tiene de verdad
   el defecto (el mes que falta, el anexo que no está, la constancia que corresponde a otro dictamen, la consulta
   «inactiva» sin fechas…); la versión de referencia (`verRef`) lo resuelve y coincide con `contenido` y `criterio`.
2. **Sintético a la vista.** Identificaciones con prefijo `SIM-`; nombres de profesionales inventados; IPS y
   empresas con los nombres que ya trae el caso o nombres inventados; ninguna dirección, teléfono ni correo
   reales. Ningún logotipo: el emisor se escribe en texto. El visor añade la marca de agua y el pie
   «Documento sintético para simulación académica».
3. **Verosímil.** Vocabulario, unidades y estructura del documento colombiano real (Decreto 1507 de 2014 para la
   calificación, Decreto 1352 de 2013 para las juntas, Ley 776 de 2002 para las prestaciones, Ley 1562 de 2012,
   Resolución 1995 de 1999 para la historia clínica, guías de vigilancia epidemiológica para ruido, sílice y
   desórdenes musculoesqueléticos). Valores clínicos y de exposición plausibles y coherentes con la PCL y el
   diagnóstico. Solo normas que existen; ninguna sentencia inventada.
4. **Sin códigos de análisis.** El participante no ve los códigos con que el investigador analiza: en ningún
   texto aparecen solos `H1`–`H4`, `SP1`–`SP3`, `P1`–`P4`, `R01`–`R06`, `A1`–`A4`, los pasos `A1`–`A3`, `E1`–`E5`,
   `D1`–`D3`, `r1`–`r5`, `①`–`⑤`, ni los códigos sueltos de los soportes (`SOL`, `ORI`, `REG`, `CAR`, `DIC`, `FIR`,
   `AFI`, `APT`, `EXP`, `NEX`, `FUN`, `AUD`, `HC`, `INC`, `HL`, `SL`), ni `PI-L0x`, ni `DGIT-…`. Los números de
   documento con guion (`DIC-L01`, `REG-L02`) sí, porque son el número del documento. Los plazos se escriben
   completos («10 días hábiles», no «10 d.h.»).
5. **Español claro**, como lo escribiría la entidad emisora, sin inglés ni abreviaturas que no use el documento
   real.
