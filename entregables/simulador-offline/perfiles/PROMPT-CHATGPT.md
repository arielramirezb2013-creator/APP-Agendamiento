# Instrucción para ChatGPT: generar los cuatro perfiles sintéticos

Copie todo lo que sigue, desde la línea de guiones, en ChatGPT, junto con la investigación de
Perplexity sobre las cinco sentencias. Adjunte también `perfil-ejemplo-mp.json`, que es el molde.

---

Tengo una simulación de la ruta de incapacidad laboral en Colombia, para una investigación
doctoral sobre interoperabilidad clínico-laboral. Necesito **cuatro casos sintéticos** completos,
en un archivo JSON con la estructura exacta del ejemplo que adjunto (`perfil-ejemplo-mp.json`).

**Qué son estos perfiles.** Cada perfil es una persona con una incapacidad prolongada y, sobre
todo, **el contenido real de las cinco piezas de evidencia que viajan por la ruta**. La simulación
le muestra a cada actor el documento que le llega, campo por campo, con ese contenido: por eso cada
campo tiene que traer un dato concreto, no una etiqueta.

**Reglas que no puedo romper:**

1. Todo sintético. Ninguno corresponde a una persona real. De las sentencias tome el **patrón**:
   el tipo de diagnóstico, el punto donde se rompe la ruta, la clase de controversia, el actor que
   incumple. Nunca datos de las partes, ni radicados, ni nombres de empresas o entidades reales.
2. El nombre es dos iniciales con punto: `J.A.`, `R.C.`, `L.T.`, `D.M.`
3. Las cinco piezas son siempre `hc`, `apt`, `inc`, `hl`, `dic`, con sus campos **en el orden del
   ejemplo**. La simulación los lee por posición. Si un campo no aplica al caso, escríbalo
   igualmente diciendo que no aplica y por qué.
4. Cada campo es **una o dos frases con el dato concreto**, en lenguaje de trámite colombiano
   (CIE-10, días de incapacidad, semanas cotizadas, IBC, PCL, SG-SST, índice de levantamiento).
   Ni una palabra sola ni un párrafo largo.
5. `faltaHoy` de cada pieza: las posiciones (empezando en 0) de los campos que **en la ruta de hoy
   no llegan** a quien los necesita. Es el contraste que mide el estudio, así que cada caso debe
   romperse por un lado distinto: uno por la historia laboral que nunca llega, otro por la matriz
   de exposición sin versión, otro por el concepto de rehabilitación que no existe, otro por el
   dictamen que no se notifica.
6. `dic` es el dictamen que saldría **si la Junta la juega el sistema**. Escríbalo completo:
   origen, porcentaje de pérdida de capacidad laboral, fecha de estructuración y motivación.

**Qué quiero que varíe entre los cuatro casos**, para que la simulación cubra situaciones
distintas y no cuatro veces la misma:

- El diagnóstico y su naturaleza: uno osteomuscular, uno de salud mental, uno por accidente de
  trabajo con origen evidente, uno con enfermedad general de origen discutible.
- El sector y el cargo: que no sean todos operarios de planta.
- El día de la ruta en que empieza el recorrido (`diaRuta`): uno antes del día 120, dos entre 120 y
  180, uno pasado el día 181.
- Quién está en falta: en uno el empleador que no entrega la matriz, en otro la EPS que no califica
  a tiempo, en otro la ARL que apela sin notificar, en otro la administradora de pensiones.
- La situación personal: edad, antigüedad, tipo de contrato, ingreso y personas a cargo distintos.

**Qué NO debe generar.** No escriba ramificaciones, consecuencias, ni qué pasa según lo que decida
el participante: esa lógica ya está construida en la simulación y es la misma para los cuatro
casos. Limítese a la persona, el caso y el contenido de las cinco piezas.

**Formato de salida.** Un único bloque de código con JSON válido, con la misma estructura del
ejemplo y los cuatro perfiles dentro de `perfiles`. Sin comentarios dentro del JSON y sin texto
alrededor del bloque.
