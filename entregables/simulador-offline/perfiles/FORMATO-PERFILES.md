# Formato de los perfiles sintéticos

Un **perfil** es un caso completo: la persona incapacitada y el contenido real de las cinco piezas
de evidencia que viajan por la ruta. Es lo que convierte «HC parcial · APT sin versión» en un
documento que el participante puede leer.

La simulación carga uno o varios perfiles y el investigador asigna, en el panel, con qué perfil
recorre cada participante. Las ramificaciones —qué ocurre según lo que el participante decide y
según su rol— **no van en el perfil**: son reglas de la simulación, construidas sobre el service
blueprint y la matriz de contratos del proyecto, y son iguales para los cuatro casos.

## Reglas que no se pueden romper

- **Todo es sintético.** Ningún perfil corresponde a una persona real. Si se inspira en una
  sentencia judicial, se toma el patrón del caso —el tipo de diagnóstico, el punto donde se rompe
  la ruta, la clase de controversia—, nunca los datos de las partes, ni el radicado, ni la empresa.
- **Nombre con iniciales.** Como el caso base: `M.P.`, `J.A.`, `R.C.`, `L.T.`.
- **Las cinco piezas son siempre las mismas y sus campos no se cambian de orden.** La simulación
  los lee por posición. Si un campo no aplica al caso, se escribe igualmente, diciendo que no
  aplica y por qué.
- **Un párrafo por campo, en lenguaje de trámite.** No una palabra, no una página: una o dos
  frases con el dato concreto. Es lo que el participante va a leer para decidir.

## Las cinco piezas y el orden exacto de sus campos

| Clave | Pieza | Custodio | Campos, en este orden |
|---|---|---|---|
| `hc` | Resumen clínico estructurado | IPS | 1 diagnóstico CIE-10 · 2 incapacidad continua · 3 restricciones funcionales · 4 concepto de rehabilitación · 5 evolución clínica completa · 6 antecedentes psicosociales |
| `apt` | Matriz de exposición / análisis de puesto | Empleador | 1 cargo y tareas · 2 cargas manipuladas · 3 índice de levantamiento · 4 versión · fecha · responsable · 5 historial disciplinario |
| `inc` | Certificados de incapacidad | EPS | 1 días acumulados · 2 prórrogas · 3 fecha de inicio · 4 IBC |
| `hl` | Historia laboral y semanas | Administradora de pensiones | 1 semanas cotizadas · 2 densidad de cotización · 3 IBC histórico · 4 historial de empleadores |
| `dic` | Dictamen de primera instancia | Junta Regional | 1 origen · 2 PCL · 3 fecha de estructuración · 4 motivación |

`dic` solo existe a partir del paso E3. Lo que se escriba allí es **el dictamen que saldría si la
Junta la juega el sistema**: cuando el participante es la Junta, lo reemplaza su decisión.

## Qué lleva cada perfil

```
id            Identificador corto y sin espacios: "mp", "ja", "rc", "lt".
persona       nombre, edad, cargo, empresa, sector, antiguedad, contrato, jornada,
              ingreso, ciudad, hogar, acompana, afiliaciones {eps, arl, pensiones}
caso          diagnostico, diaRuta (en qué día de incapacidad empieza el recorrido),
              origenEnDisputa (true/false), resumen (tres o cuatro frases),
              fuente (de qué patrón se construyó, sin identificar a nadie)
evidencia     Para cada una de las cinco claves:
              pieza, version, custodio, campos [uno por campo, en el orden de la tabla],
              faltaHoy [posiciones, empezando en 0, de los campos que en la ruta de hoy
                        NO llegan a quien los necesita]
```

`faltaHoy` es la pieza clave del contraste que mide el estudio: en la ruta de hoy esos campos no
llegan y la pantalla los muestra como vacíos con nombre («sin el concepto de rehabilitación»); en
la ruta con el módulo llegan si el contrato del actor que consulta los autoriza.

## Ejemplo completo

`perfil-ejemplo-mp.json` es el caso base del proyecto escrito en este formato, con los 23 campos
llenos. Sirve de molde: un perfil nuevo se escribe cambiando los valores, nunca la estructura.

## Cómo se carga

Un archivo `.json` con los cuatro perfiles, por el panel del investigador (pestaña Estudio,
«Perfiles del caso»). El panel valida la estructura, dice cuántos campos trae cada perfil y avisa
si falta alguno. Los perfiles viajan en la configuración publicada, así que el simulador funciona
sin conexión con todos ellos dentro.
