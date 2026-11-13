# Auditoría de la herramienta Rehavid LSS DMAIC

Revisión automatizada en 12 frentes, cada auditor obligado a **reproducir** lo que reporta.

Código auditado: rama `claude/excel-to-html-app-lnmy1r`, commit `49802c6`.

## Alcance y estado

- **61 hallazgos** encontrados; los 12 frentes terminaron su trabajo.
- **6 hallazgos verificados** por dos refutadores independientes cada uno: ninguno cayó.
- **55 hallazgos sin verificar**: el contenedor se reinició antes de que terminara esa fase.
  Hay que confirmarlos uno a uno antes de darlos por ciertos.

| Severidad | Hallazgos |
|---|---|
| Alta | 30 |
| Media | 25 |
| Baja | 6 |


## Severidad alta

### [Tablero BI y motor de decisión] La «Salud del proyecto» sigue en verde aunque el resultado del proyecto empeore

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/75_engine.js` línea ~2240
- Qué pasa: salud = clamp(Math.round(av*35 + cal*65),0,100) y semaforo = salud>=70?'ok' no tienen NINGÚN término por riesgos de severidad alta abiertos, por cronograma vencido ni por resultado negativo. `av` (35 de los 100 puntos) sólo mide «formatos con algo escrito», así que un proyecto con todo diligenciado arranca con 35 puntos regalados. Con el caso demo y el antes/después invertido a un EMPEORAMIENTO del 13,1%, la salud sólo baja de 88 a 81 y el semáforo sigue en 'ok' (verde), en la misma tarjeta cuyo texto dice «mejora lograda -13,1% · 18 riesgo(s) abierto(s)».
- Qué sufre el usuario: La tarjeta «Salud del proyecto» del RESUMEN EJECUTIVO muestra 81 en número grande verde y la narrativa escribe «una salud de proyecto de 81 sobre 100 (verde)» para un proyecto cuyo indicador empeoró 13,1%, con 18 riesgos de severidad alta y el cronograma vencido hace 135 días. Es el número que se le presenta al Champion y a la ARL y dice lo contrario de lo que dicen sus propios datos (con el demo sin tocar: 88 verde con 17 riesgos altos y nivel sigma 2,97σ CRÍTICO).
- Arreglo propuesto: Mover el cálculo de las líneas 2240-2241 a DESPUÉS del bloque que ya calcula `riesgos` (2263) y `ad = adCtx(c)` (2264), y penalizar: `const salud = clamp(Math.round(av*35 + cal*65) - Math.min(30, riesgos.length*3) - ((isFinite(ad.mejora) && ad.mejora <= 0) ? 15 : 0), 0, 100);` y forzar el semáforo a no ser 'ok' con riesgos altos abiertos o resultado no positivo: `const semaforo = (riesgos.length || (isFinite(ad.mejora) && ad.mejora <= 0)) ? (salud >= 40 ? 'warn' : 'bad') : (salud >= 70 ? 'ok' : salud >= 40 ? 'warn' : 'bad');`

### [Tablero BI y motor de decisión] La dirección del métrico se adivina del signo de la brecha: alarma de severidad alta falsa y GAP inventado

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/75_engine.js` línea ~187
- Qué pasa: En analizarSerie(), `const menorMejor = m > o;` hace que la condición de la línea 190 `(menorMejor && m > o) || (!menorMejor && m < o)` sea SIEMPRE verdadera cuando |gap| >= 1e-9. Consecuencias: (1) la rama `else` de las líneas 206-209 —el único mensaje que dice «ya cumple el objetivo, con holgura de X»— es código muerto y nunca se emite; (2) toda serie que ya está mejor que su meta recibe un GAP falso; (3) toda tendencia que MEJORA se clasifica como «dirección CONTRARIA al objetivo» con severidad alta, porque `avanzaBien` (194-195) se deriva del mismo menorMejor adivinado.
- Qué sufre el usuario: Afecta a DEFINIR › Serie de tiempo y a MEDIR › Gráfico serie de tiempo (ambos llaman a analizarSerie). A quien ya cumplió la meta el motor le dice que le «faltan 3,18» y que su mejora va en dirección contraria; ese mensaje entra como riesgo de severidad alta en el tablero BI (pestaña RIESGOS), en la narrativa del proyecto y empuja la recomendación del siguiente paso. Nunca puede aparecer el mensaje «ya cumple el objetivo» que el propio código escribió.
- Arreglo propuesto: Dar a analizarSerie (línea 146) un parámetro de dirección: `function analizarSerie(vals, objetivo, unidad, minPuntos, menorMejorArg)` y en la línea 187 usar `const menorMejor = (typeof menorMejorArg === 'boolean') ? menorMejorArg : (m > o);`. En REGLAS['definir.series_tiempo'] (línea 609, cambiar la firma a `function(d, ctx)`) y en la regla de medir.grafico_serie_tiempo pasar la dirección real, que ya está disponible: `const oc = objetivoCuantitativo(ctx); const mm = (oc && isNum(oc.base)) ? num(oc.obj) < num(oc.base) : undefined;` (o tx(T(ctx,'controlar.grafico_antes_despues').direccion) !== 'Mayor es mejor'). Con la dirección real, la rama de las líneas 206-209 vuelve a ser alcanzable.

### [Tablero BI y motor de decisión] El Pareto afirma «POCOS VITALES» y «No hay pocos vitales» al mismo tiempo

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/75_engine.js` línea ~593
- Qué pasa: En REGLAS['definir.pareto'], si nv > 0 se emite siempre GANA('POCOS VITALES: ...') (línea 593) y acto seguido, si safeDiv(nv,P.n) > 0.5, se emite además AVISO('El Pareto está PLANO ... No hay «pocos vitales»: reestratifica los datos ...') (línea 598). Con 4 vitales de 6 categorías las dos salen juntas, derivadas del mismísimo número 4/6.
- Qué sufre el usuario: En el bloque «Interpretación y sugerencia de decisión» del Pareto (y en los hallazgos del tablero BI) el usuario lee dos decisiones opuestas sobre el mismo dato: una en verde con trofeo que le dice que ésas 4 categorías «son el alcance del proyecto», y una en ámbar que le dice que no hay pocos vitales y que debe reestratificar antes de pasar a MEDIR. No hay forma de saber cuál seguir.
- Arreglo propuesto: Condicionar el mensaje positivo a que el Pareto efectivamente discrimine. En la línea 592 cambiar `if (nv){` por `if (nv && safeDiv(nv, P.n) <= 0.5){` y sacar el bloque PLANO (597-599) a un `else if (nv){ out.push(AVISO('El Pareto está PLANO...')) }`, para que se emita un solo veredicto.

### [Coherencia de la simulación] El costo unitario de la hoja de Beneficios es 2.600 y no 1.925.000: la simulacion calcula $ 63.440 de ahorro contra los $ 46.800.000 que afirma todo el resto del caso

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/87_demo.js` línea ~145
- Qué pasa: `definir.beneficios` escribe `'des2.metrico':2600` en la celda que la propia hoja declara como COSTO UNITARIO ($) ("se escribe UNA sola vez, en la fila DESEADO ($) columna METRICO"). Con el ahorro expresado en puntos porcentuales (des1.ahorro 24,4) la hoja calcula 24,4 x 2.600 = $ 63.440. Pero el Project Charter de la misma simulacion (linea 222) dice "Cada punto porcentual de reprogramacion cuesta $ 1.925.000 al año" y a3_definir.savings, a3_controlar.beneficios y definir.tabla_identificacion afirman $ 46.800.000. El valor correcto de esa celda es 1.925.000 (24,4 x 1.925.000 = $ 46.970.000 ~ 46,8 M).
- Qué sufre el usuario: Quien abre la simulacion para ver como funciona la herramienta encuentra, en la hoja de beneficios de DEFINIR, un ahorro de $ 63.440 (tres ordenes de magnitud por debajo del caso) y dos avisos del motor en rojo: uno le dice que el proyecto no justifica un DMAIC y otro que las cifras difieren en 73.670 %. El ejemplo que deberia ensenar el flujo correcto muestra el caso mal armado y una recomendacion de abandonar el proyecto.
- Arreglo propuesto: En app-dmaic/src/87_demo.js linea 145 cambiar `'des2.metrico':2600` por `'des2.metrico':1925000` (el $/punto porcentual que el propio businessCase de la linea 222 declara). Con eso la hoja arroja DESEADO $ 46.970.000, GOAL $ 39.270.000 y RETADORA $ 52.745.000, y desaparecen los avisos de BAJO IMPACTO y de discrepancia contra la tabla de identificacion.

### [Diagramas] Los diagramas exportados (PNG / informe / Excel) recortan el texto con «…» aunque la caja tiene espacio libre

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/50_diagrams.js` línea ~1198
- Qué pasa: `boxH()` dimensiona la caja para N lineas, pero `field()` le pasa a `textBox()` un rectangulo interior mas pequeño (le resta el margen vertical) y `textBox()` resta 2 px mas antes de `Math.floor`, asi que solo caben N-1 lineas. En CTQ y en la subcausa de Ishikawa ademas se mide con un ancho mayor del que el campo recibe de verdad (NW-34=218 vs 204 reales; CW-52=134 vs 124 reales), lo que añade otra linea. Afecta a tree (L1198), sipoc (L1233), affinity (L1275), ctq (L1439) e ishikawa-subcausa (L1029). Solo pasa en modo print, que es el que usan el boton ⤓ PNG, 86_print.js y 82_xlsx.js; en pantalla el campo es un <textarea> con scroll y no se nota.
- Qué sufre el usuario: El usuario exporta el diagrama a PNG, lo imprime o lo mete en el Excel y le faltan palabras al final de los nodos, sin ningun aviso. La caja se ve con un hueco blanco justo donde cabria la linea que falta. En el arbol del demo se pierden 4 de 10 nodos.
- Arreglo propuesto: Darle a `boxH` el mismo ancho que recibe el campo y un pad >= (margen vertical + 9). Cambios minimos, verificados: L1198 `(dep === 0 || nd.raiz) ? 26 : 14` -> `? 29 : 16`; L1233 `boxH(cd.v, CW - 40, 11.5, 46, 5)` -> `boxH(cd.v, CW - 40, 11.5, 46, 5, 14)`; L1275 `sel ? 34 : 12` -> `sel ? 34 : 14`; L1439 `boxH(nd.v, NW - 34, 11.5, 56, 4, 14)` -> `boxH(nd.v, NW - 48, 11.5, 56, 4, 16)`; L1029 `boxH(s.v, CW - 52, 10.5, 22, 3, 8)` -> `boxH(s.v, CW - 62, 10.5, 22, 3, 8)`. El lienzo crece 7 px en el arbol del demo y nada en los demas.

### [Diagramas] 5 WHY'S: el campo «HOW IS THIS CONFIRMED» corta a ~47 caracteres y pierde 7 de las 10 confirmaciones del demo

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/50_diagrams.js` línea ~1157
- Qué pasa: El recuadro de la evidencia es fijo (`rect(..., 28)` en L1156) con un campo de 24 px de alto, asi que `textBox` calcula maxL=1 y solo pinta una linea de ~47 caracteres. No crece con el contenido, aunque el panel de la fila (RH=70) deja 18 px sin usar justo debajo.
- Qué sufre el usuario: La columna que justifica con datos cada «por que» es lo que da validez al analisis, y en el PNG / informe / Excel se publica cortada: de las 10 confirmaciones del demo, 7 salen incompletas.
- Arreglo propuesto: Aprovechar el alto libre de la fila para dos lineas. L1156: `rect(PX + 104, ry + 24, PW - 116, 28, 6, ...)` -> altura `38`. L1157-1158: `field(T, PX + 110, ry + 26, PW - 128, 24, {...})` -> altura `34` y añadir `ml:true`. Queda dentro de RH=70 (ry+24+38 = ry+62) y duplica la capacidad a ~94 caracteres.

### [Estadística] Anderson-Darling: con AD > 306,71 el valor p se invierte, da p = 1 y el app declara NORMALES datos que no lo son

- Estado: **VERIFICADO**
- Archivo: `app-dmaic/src/45_stats.js` línea ~759
- Qué pasa: El valor p de normalidad usa la aproximacion de D'Agostino-Stephens en 4 ramas. La rama AD >= 0,6 es exp(1,2937 - 5,709*AD + 0,0186*AD^2): el exponente es una parabola con minimo en AD = 153,5 y vuelve a cruzar cero en AD = 306,709. Por encima de ese punto la exponencial devuelve valores > 1 (p.ej. AD=320 -> 2,15e34) y el clamp(p,0,1) de la linea 763 los convierte en exactamente 1. Como la linea 764 decide `const normal = p >= a`, el resultado es `normal = true`. La implementacion de referencia (R nortest::ad.test, de donde salen estos cuatro polinomios) acota la rama con `else if (AA < 10) ... else pval <- 3.7e-24`; aqui falta por completo esa guarda. Verificado tambien que las ramas y el ajuste AD = A2*(1+0,75/n+2,25/n^2) son correctos y coinciden con scipy/nortest hasta 1e-14 en el rango valido: el defecto es solo la cola saturada.
- Qué sufre el usuario: En «MEDIR - Capacidad del proceso» el usuario ve «VALOR P 1,0000» y «DISTRIBUCION NORMAL» en verde, junto con la nota «se acepta que los datos siguen una distribucion NORMAL: los indices Cp, Cpk, Pp, Ppk y Cpm de abajo son validos», mientras en la misma pantalla la asimetria vale 31,6. Ademas desaparece la nota de advertencia «CAPACIDAD CON DATOS NO NORMALES» (66_specs_extra_medir.js:632), que es justo la que deberia salir. El usuario aplica Cp/Cpk y pruebas parametricas a datos que no son normales. Afecta igual a «Resumen grafico», «Estadistica descriptiva» (66_specs_extra_medir.js:1113, 1127, 1171, 1183) y a la prueba de normalidad por grupo de ANALIZAR (67_specs_extra_analizar.js:286). Se dispara justo con los datos mas sospechosos: atributos 0/1 pegados en una herramienta de datos continuos, procesos casi constantes con un error de digitacion, o tiempos de servicio muy sesgados.
- Arreglo propuesto: En 45_stats.js linea 759, anteponer la guarda de saturacion que usa la implementacion de referencia (nortest::ad.test), dejando el polinomio solo en el rango donde es valido:      if (AD >= 10)       p = 3.7e-24;                 // cola saturada     else if (AD >= 0.6) p = Math.exp(1.2937 - 5.709 * AD + 0.0186 * AD * AD);  (las tres ramas siguientes quedan igual). Verificado con el parche aplicado en memoria: los casos normales no cambian (normal n=15 AD=0,13 p=0,981; sesgado n=15 AD=2,11 p=2,34e-5) y los cuatro casos roto pasan a p=3,70e-24 y normal=false.

### [Estadística] GR&R por ANOVA: un estudio desbalanceado pasa el control de validez y se calcula con N y grados de libertad inventados

- Estado: **VERIFICADO**
- Archivo: `app-dmaic/src/45_stats.js` línea ~1087
- Qué pasa: El numero de replicas R se fija con el MAXIMO de mediciones por celda (`else R = Math.max(R, c.length)`), mientras el contador `faltan` solo detecta celdas parte x operador COMPLETAMENTE vacias. Si una celda tiene un numero distinto de mediciones que las demas -- un valor en blanco, o una medicion extra -- no se cuenta como faltante, `cel[...].slice(0, R)` entrega menos de R valores en las celdas cortas, pero todo el ANOVA sigue usando las formulas del diseno balanceado: ssP = O*R*sum(...), ssO = P*R*sum(...), glE = P*O*(R-1) y N = P*O*R. El resultado son N y grados de libertad fabricados, un MS del error equivocado y componentes de varianza (EV, AV, GRR, PV, TV), %GR&R y ndc erroneos, SIN ningun aviso -- justo cuando la propia funcion declara en su mensaje de error que «El GR&R por ANOVA exige un diseno balanceado». Con el estudio completo el calculo es exacto: reproduce el ejemplo publicado del AIAG MSA 4.a edicion al digito (SS/MS/F/p de las 4 fuentes, %GR&R 27,86% del estudio, 7,76% de contribucion, ndc 4).
- Qué sufre el usuario: La grilla «GR&R POR VARIABLES - CAPTURA DE DATOS» (66_specs_extra_medir.js:266) es libre: el usuario agrega filas con parte/operador/replica/valor a mano. Basta un valor en blanco (la fila sigue ahi pero `isNum(valor)` la descarta) o una medicion repetida de mas -- «vuelvo a medir esta pieza» -- para que el estudio se recalcule entero con numeros falsos y sin aviso. En el ejemplo sintetico un sistema ACEPTABLE (5,99%, ndc 23) pasa a 7,59% (ndc 18) con una medicion extra y a 8,67% (ndc 16) con una menos. Cerca de los umbrales AIAG (10% y 30%) o del criterio ndc >= 5, una sola medicion sobrante u olvidada cambia el veredicto sobre el sistema de medicion, que es la decision que condiciona todo lo que se mide despues en el proyecto.
- Arreglo propuesto: En 45_stats.js linea 1087 usar el MINIMO de mediciones por celda en lugar del maximo, para que `slice(0, R)` entregue realmente R valores en todas las celdas y N = P*O*R sea cierto:      else R = R ? Math.min(R, c.length) : c.length;  Verificado con el parche en memoria: el caso balanceado no cambia (%GRR 5,990, ndc 23); con una medicion extra ignora la sobrante y devuelve otra vez 5,990/ndc 23; con una medicion menos R baja a 1 y sale el mensaje visible «Se necesitan al menos 2 replicas por parte y operador para separar la repetibilidad» en lugar de numeros erroneos. Mejor aun, y en la misma linea: registrar tambien el maximo y, si max !== min, devolver un `fallo` explicito de desbalanceo con el mismo estilo del mensaje de `faltan` (linea 1090), para que el usuario sepa cual celda corregir.

### [Libro consolidado y macros] 223 celdas de texto se escriben como el número 0 en el libro consolidado (columnas completas perdidas)

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/83_xlsxgen.js` línea ~276
- Qué pasa: writeBlock decide número-vs-texto con isNum(), pero isNum() es verdadero para CUALQUIER valor no vacío porque num() devuelve 0 cuando parseFloat falla. Resultado: todo texto que no esté protegido por el guardia de input acaba como <v>0</v>. Afecta 3 ramas: línea 276 (fields: sólo protege input 'text' y 'textarea', así que TODO select textual cae a 0), línea 302 (grid: toda columna con calc que devuelva texto cae a 0) y línea 359 (matrix: sin guardia alguno, todo texto cae a 0).
- Qué sufre el usuario: El usuario abre el libro «TODO EN UNO» y encuentra columnas enteras llenas de ceros: el rol de cada integrante del equipo, el métrico de los beneficios, el turno de las hojas de verificación, el veredicto de la prueba de hipótesis, el tipo de carta de control, etc. El dato no está en ninguna otra parte de la hoja (67 valores desaparecen por completo del libro) y no hay aviso alguno.
- Arreglo propuesto: En 83_xlsxgen.js añadir junto a los helpers (p.ej. tras la línea 13) un test estricto que NO use el num() permisivo:   const esNum = v => typeof v === 'number' ? isFinite(v)     : (v != null && (s => s !== '' && isFinite(Number(s)))(String(v).replace(/\s|\$|%/g,'').replace(/\.(?=\d{3}\b)/g,'').replace(',','.'))); y sustituir isNum por esNum en las tres decisiones número/texto: línea 276 (y el cálculo de estilo de la 274), línea 302 (y la 300) y línea 359. Number() devuelve NaN para 'TARDE'/'WELCH', así que esos valores vuelven a la rama sh.text().

### [Libro consolidado y macros] La fila TOTAL de cada tabla escribe SUM() a ciegas: 46 de 77 totales quedan con un número distinto al de la app

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/83_xlsxgen.js` línea ~319
- Qué pasa: El generador ignora el cálculo que trae b.foot y pone siempre 'SUM(col)' (línea 319) con la etiqueta fija 'TOTAL' (línea 312). Pero los pies de las especificaciones son promedios, porcentajes, máximos, conteos o valores heredados, y 20 de ellos definen su propia etiqueta vía k:'__label' ('PROMEDIO', 'MÁXIMA', 'AVANCE DEL PROYECTO', 'Total Benefit', 'TOTAL VOTOS'...). El SUM también cuenta columnas acumuladas y columnas de texto.
- Qué sufre el usuario: La fila de cierre de 46 tablas muestra números falsos y encima mal rotulados: la línea base promedio de 27,07 aparece como «TOTAL 162,4», el objetivo de 8 como 48, el Yield del proceso como 562,5 % (imposible), el avance del cronograma como 1620 %, y el Total Benefit del cierre del proyecto como $22.300.000 en vez de los $56.800.000 pactados. Es el número que el usuario copia al informe para el Champion y la ARL.
- Arreglo propuesto: En 83_xlsxgen.js, bloque 'grid' (líneas 310-323): calcular el pie igual que R.b_grid (30_render.js:152-156) y escribir el valor, no un SUM. Sustituir la línea 312 por la etiqueta real —const lb = fs.find(x => x.k === '__label'); sh.text(r, 2, lb ? lb.label : 'TOTAL', 11);— y dentro del if (f) de la línea 316 reemplazar el sh.form(...) de la 319 por el valor calculado: const fv = (typeof f.calc === 'function') ? f.calc(rows, d, ctx) : (f.value !== undefined ? f.value : f.label); y escribirlo con sh.numb(r, 2+ci, fv, st) cuando sea numérico o sh.text(...) si no. Ningún foot de las especificaciones usa el 4.º argumento (computed), comprobado con grep: 0 coincidencias.

### [Libro consolidado y macros] En el libro .xlsx sin macros, el bloque «CÁLCULO EN VIVO» del BI muestra DPMO 0 y Nivel Sigma 0

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/83_xlsxgen.js` línea ~532
- Qué pasa: buildBI escribe siempre las fórmulas REHAVID_DPMO / REHAVID_SIGMA / REHAVID_INTERPRETA (líneas 532, 536, 540), pero vbaProject.bin sólo se adjunta cuando conMacros es true (línea 692). En el .xlsx esos nombres no existen, dan #NAME? y el IFERROR que los envuelve devuelve 0 y "" sin dejar rastro del error. buildBI ni siquiera recibe el flag conMacros (se la llama como buildBI(ctx) en la línea 597).
- Qué sufre el usuario: La misma hoja BI declara DPMO 71.197 y sigma 2,97 arriba, y DPMO 0 y sigma 0 trece filas más abajo bajo el rótulo «CÁLCULO EN VIVO». Un sigma de 0 es el peor valor posible, así que el usuario que mire el bloque de abajo concluye lo contrario de lo que dicen sus datos. Pasa siempre que se usa el botón «libro consolidado» (sin macros), que es el único que abre sin advertencias de seguridad en Excel.
- Arreglo propuesto: En 83_xlsxgen.js usar fórmulas nativas de Excel, que funcionan en los dos formatos, en lugar de las UDF de VBA: línea 532 -> 'IFERROR(C'+rD+'/(C'+rU+'*C'+rO+')*1000000,0)', línea 536 -> 'IFERROR(MIN(6,MAX(0,NORM.S.INV(1-C'+rDp+'/1000000)+1.5)),0)', y línea 540 -> una cadena de IF sobre C+rSg con los mismos cortes 2/3/4/5/6 que REHAVID_INTERPRETA. Alternativa equivalente: pasar conMacros a buildBI (líneas 494 y 597) y emitir las UDF sólo cuando sea true.

### [Exportación a las plantillas Excel] Las fechas salen como número de serie (46062) en 56 de las 98 celdas de fecha

- Estado: **VERIFICADO** · severidad real: media (corregida por los verificadores, el auditor dijo alta)
- Archivo: `app-dmaic/src/82_xlsx.js` línea ~93
- Qué pasa: cellXml() escribe la fecha como serial (<v>46062</v>) y hereda el estilo que la plantilla ya tenía en esa celda. Las celdas de entrada de fecha de las plantillas tienen formato 'General' (solo el Gantt trae formato de fecha), así que Excel/LibreOffice muestran el número crudo en vez de la fecha. Afecta a 56 celdas de 13 herramientas en los 5 módulos: definir.project_charter (20), mejorar.plan_accion (12), analizar.validacion_de_causas (6), controlar.charter_cierre (5), controlar.estandar_3 (3), controlar.estandar_2 (2), medir.hojas_verificacion (2) y definir.arbol_ctq, definir.sipoc, analizar.brainstorming, mejorar.brainstorming, mejorar.quick_improvement, controlar.plan_de_control (1 cada una).
- Qué sufre el usuario: En el Excel entregado al cliente las fechas de inicio/fin del cronograma, de las firmas del Project Charter, del plan de acción y de la validación de causas aparecen como números de 5 cifras. El libro se vuelve ilegible justo en los datos que la ARL revisa.
- Arreglo propuesto: En 82_xlsx.js: leer una vez xl/styles.xml al exportar (en exportModule, tras ZIP.read, línea ~360) y construir el mapa cellXfs->numFmtId. En cellXml (línea 93-96), para val.t==='date', si el numFmtId heredado no es de fecha (ni 14-22/45-47 ni código con d/m/y), usar un xf nuevo añadido a cellXfs que clone el original con numFmtId="14". Así el Gantt (41 celdas que hoy salen bien) no se toca y las otras 56 muestran la fecha.

### [Exportación a las plantillas Excel] Los porcentajes se escriben x100 en celdas con formato %: se exporta 3240,0% donde va 32,4%

- Estado: **VERIFICADO**
- Archivo: `app-dmaic/src/82_xlsx.js` línea ~263
- Qué pasa: La app guarda los porcentajes como número 0-100 (32,4) pero varias celdas de destino de las plantillas tienen formato de porcentaje (0.0% / 0.00% / 0%), que espera la fracción 0-1. collect()/put() escribe el valor tal cual, así que Excel multiplica por 100 al mostrarlo. 21 celdas: controlar.grafico_antes_despues (11: C5:C10 y D12:D16, columnas que en la plantilla original son 0.0% completas), definir.beneficios (4: D4, E4, E7, E10), definir.project_charter (4: F57, G57, F67, G67) y controlar.charter_cierre (2: F67, G67).
- Qué sufre el usuario: El libro de Control (hoja que alimenta el gráfico Antes-Después del Excel original) y la hoja de Beneficios muestran 2150%-3240% donde debe decir 21,5%-32,4%; el Project Charter declara una línea base de 3240% y un objetivo de 800%. La misma columna mezcla 31,8 y 2750,0%. Son los números que se presentan al comité.
- Arreglo propuesto: En 82_xlsx.js, collect(): añadir soporte de una lista `pct` en el mapa xl y en put() (línea 263) escribir v/100 cuando la referencia esté declarada ahí. Declararla en 64_specs_controlar.js:1027 (grid rows de controlar.grafico_antes_despues -> columnas antes/despues) y en el mapa xl de definir.beneficios (celdas D4,E4,E7,E10) y de los dos Project Charter (F57,G57,F67,G67). Alternativa equivalente: escribir esas celdas con un xf sin formato de porcentaje.

### [Exportación a las plantillas Excel] 43 valores se escriben en celdas tapadas por combinaciones: quedan en el XML pero no se ven

- Estado: **VERIFICADO**
- Archivo: `app-dmaic/src/82_xlsx.js` línea ~29
- Qué pasa: writeCells()/putCell() no consulta <mergeCells>. Cuando el mapeo de un grid cae dentro de un rango combinado y la celda no es el ancla, Excel/LibreOffice solo muestran el ancla: el valor queda en el archivo pero invisible. 43 celdas en 3 herramientas: medir.process_mapping_detailed (25 de 138; col B combinada en bloques B6:B10, B12:B14, B18:B22... y col G en G6:H43), medir.plan_recoleccion (14 de 23; B4:B13...H4:H13 es una sola celda por columna) y mejorar.plan_accion (4; B6:B11, B12:B17...).
- Qué sufre el usuario: El plan de recolección de datos exportado pierde 2 de sus 3 filas, el mapa de proceso detallado pierde 4 de 6 nombres de paso y el plan de acción pierde 4 de 6 causas. Desaparecen sin ningún aviso: el usuario cree que exportó todo.
- Arreglo propuesto: En 82_xlsx.js, antes de escribir (exportModule línea 375, o al entrar en writeCells línea 29): parsear <mergeCells> de la hoja y, por cada referencia a escribir que esté cubierta por un rango sin ser su ancla, eliminar ese <mergeCell> y ajustar count. Deshacer la combinación deja los valores visibles cada uno en su celda y no toca estilos ni fórmulas. (Alternativa por spec: declarar las filas-ancla de la columna combinada, p.ej. rowsAt [6,12,18,25,31,38] para la columna B de process_mapping.)

### [Trazabilidad entre módulos] La propagacion llena el A3 final con un texto cortado a mitad de palabra y deja inservible el boton «Armar A3 final»

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/89_flujo.js` línea ~126
- Qué pasa: El MAPA propaga 'resumenDefinir/resumenMedirAnalizar/resumenMejorar' a controlar.a3_final (lineas 126-128) en cuanto el usuario ABRE el formato (90_app.js:107). resumenDefinir (linea 145) hace h.problema.slice(0,220) sin cortar por palabra ni poner puntos suspensivos, y le pega ' Meta: 92,0.' Ademas, el formato ya tiene su propia accion documentada en el manual, CTRL_armarA3final (64_specs_controlar.js:245), que arma el texto completo y estructurado pero solo rellena recuadros VACIOS (linea 250): como FLUJO escribio primero, el boton ya no puede poner nada en esos tres recuadros.
- Qué sufre el usuario: El A3 final es el entregable que se imprime y se entrega a la ARL y a la empresa: sale con la frase cortada a mitad de la palabra «recuperación» y con dos metas contradictorias en el mismo recuadro («meta institucional del 8 %» y «Meta: 92,0»). El usuario que sigue el manual y pulsa «Armar A3 final con las 5 fases» recibe «no se sobrescribio ningun recuadro» y nunca ve el texto bueno.
- Arreglo propuesto: Quitar del MAPA las tres filas de 'controlar.a3_final' (89_flujo.js lineas 126-128) y dejar que ese formato lo arme CTRL_armarA3final, que es el que tiene el texto completo. Si se quieren conservar, en la linea 145 cortar en el ultimo espacio antes de 220 y añadir '…' antes de concatenar ' Meta: '.

### [Trazabilidad entre módulos] El DPMO y el nivel sigma de la trazabilidad no coinciden con los del propio formato DPMO

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/89_flujo.js` línea ~58
- Qué pasa: FLUJO calcula las oportunidades contando cuantas categorias de defecto tienen nombre: oport = ['cat1'..'cat4'].filter(k => T(dp[k])).length || 4 (linea 58). El formato DPMO usa siempre 4 (dpmoCalc en 61_specs_medir.js:121, 'cats = 4; // Excel K7'). Con menos de 4 categorias nombradas, el mismo proyecto tiene dos DPMO y dos niveles sigma distintos.
- Qué sufre el usuario: El numero que la ARL ve en el tablero BI, en la cadena de trazabilidad, en la puerta de MEDIR y en el A3 de MEDIR contradice al que muestra el formato DPMO del mismo proyecto. Solo coinciden si el usuario nombra las cuatro categorias, que es justo lo que hace la simulacion: por eso el error no se ve con la demo.
- Arreglo propuesto: 89_flujo.js linea 58: reemplazar por `const oport = 4;` (la constante del Excel que usa dpmoCalc), o exportar dpmoCalc desde 61_specs_medir.js y usar `dpmoCalc(dp).dpmo` en las lineas 56-59 para que haya una sola formula.

### [Trazabilidad entre módulos] La linea base sale 0 cuando no se ha medido nada, y la cadena y la puerta la dan por buena

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/89_flujo.js` línea ~19
- Qué pasa: primeroNum (linea 19) acepta NaN porque isNum(NaN) es true (num(NaN) devuelve 0, 20_core.js:22-29). En la linea 83, `primeroNum(filaTI.base, serie.length ? avg(serie) : NaN)` pasa el literal NaN cuando no hay serie, asi que baseline = 0 en lugar de NaN y todos los isFinite(h.baseline) dan true.
- Qué sufre el usuario: La app certifica que la linea base esta medida cuando no hay ninguna medicion: eslabon verde en la trazabilidad, criterio verde en la puerta de DEFINIR, variable en verde en el BI y «Línea base 0,0» escrito en el A3 de MEDIR. La brecha contra la meta sale como 9.200 % y, al tomar 0 como base, todo el proyecto queda comparado contra un numero inventado.
- Arreglo propuesto: 89_flujo.js linea 19: `const primeroNum = (...xs) => { for (const x of xs){ if (typeof x === 'number' ? isFinite(x) : isNum(x)) return num(x); } return NaN; };`. Asi el NaN de la linea 83 (y cualquier avg() vacio) deja de colarse como 0.

### [Trazabilidad entre módulos] El dato heredado se queda congelado: si se corrige la fuente, el destino sigue mostrando el texto viejo

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/89_flujo.js` línea ~169
- Qué pasa: propagar() solo mira si el destino esta vacio (linea 169). Marca el campo como heredado en d._her (linea 171) pero NINGUN modulo lee _her (grep -rn '_her' app-dmaic/src -> una sola linea, la que escribe). Resultado: el valor propagado nunca se actualiza cuando cambia su fuente canonica. El efecto espejo tambien ocurre: si el usuario borra a proposito un campo heredado, la siguiente visita lo vuelve a rellenar sin avisar.
- Qué sufre el usuario: El A3 final, el A3 de MEDIR, los 5 por que, el Ishikawa y la tabla de seleccion siguen enunciando el problema, la causa raiz o el nivel sigma de la primera version del proyecto. Son los textos que se imprimen y se exportan a Excel: el entregable contradice a su propia fuente y nada avisa. Al mismo tiempo, un recuadro heredado que el usuario borre porque no aplica reaparece solo.
- Arreglo propuesto: 89_flujo.js lineas 168-172: guardar en _her el valor escrito, no solo el nombre del hecho (`her[campo] = { h: hecho, v: v }`), y decidir con el: si el campo esta vacio y no hay marca, rellenar; si sigue conteniendo exactamente `her[campo].v`, actualizarlo al valor nuevo; en cualquier otro caso (lo edito o lo borro el usuario) no tocarlo.

### [Gráficos] hbar: los nombres de categoria se salen del viewBox y aparecen cortados por la izquierda

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/40_charts.js` línea ~636
- Qué pasa: K.hbar calcula el margen izquierdo con tw() (factor 0,56 px/caracter), que subestima el ancho real del texto en MAYUSCULAS -- el propio archivo ya reconoce el problema y creo twCaps() (linea 376) para la leyenda, pero hbar siguio usando tw(). Resultado: ml queda mas estrecho que el texto que se dibuja en g.x-8 con anchor='end' (linea 657) y las primeras letras quedan fuera del lienzo. Como el SVG recorta a su viewport, el usuario no ve que falta texto; el recorte ocurre con nombres normales de 35-49 caracteres, que es lo que se teclea en 'TIEMPO DE RESPUESTA POR INDICADOR' (68_specs_extra_mc.js:1186, pasa txt(r.indicador) sin recortar) y en 'Causas identificadas por espina' (62_specs_analizar.js:468).
- Qué sufre el usuario: El usuario ve el nombre del indicador/espina mutilado por la izquierda, sin puntos suspensivos ni ninguna senal de que se corto; con varias filas que empiezan igual deja de poder distinguir a que indicador corresponde cada barra. Tambien se arrastra al PNG exportado y al informe impreso, porque ambos parten del mismo viewBox.
- Arreglo propuesto: 40_charts.js linea 636: usar la funcion que ya existe para texto en versales -> `nw = Math.max(nw, twCaps(ell(l, capN), size));` y, en la linea 635, calcular el recorte con el mismo factor -> `const capN = Math.max(6, Math.floor((D.W * 0.34) / (size * 0.68)));`. VERIFICADO: parcheando esas dos lineas y reejecutando los mismos casos el resultado pasa de FUERA a limpio (script /tmp/claude-0/-home-user-APP-Agendamiento/ffc63d94/scratchpad/dim_graficos/t6_fix.js, salida 'OK H1 hbar etiqueta' / 'OK H1b hbar espina').

### [Impresión] El informe tira a la basura todos los bloques de tipo 'html': 25 tablas de resultados desaparecen sin aviso

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/86_print.js` línea ~160
- Qué pasa: El switch de PRINT.bloque() atiende fields, grid, matrix, chart, diagram, cards, a3, upload, insight y note, pero NO 'html'. Al no haber case, cae al 'return \'\'' final (linea 161) y el bloque se descarta en silencio (ni siquiera entra por el try/catch de la linea 171, asi que no hay ni console.warn). Con los datos de la simulacion son 25 bloques en 14 herramientas y 20.615 caracteres de texto que estan en pantalla y no en el papel: la TABLA ANOVA y los COMPONENTES DE LA VARIACION del Gage R&R, el RESUMEN DEL ESTUDIO DE CAPACIDAD (Cp/Cpk/Pp/Ppk, sigma dentro y total, k), los ESTADISTICOS DESCRIPTIVOS del histograma y del resumen grafico, la TABLA DE RESULTADOS DE LA REGRESION, las HIPOTESIS Y ESTADISTICOS DE LA PRUEBA y el DETALLE POR GRUPO de la prueba de hipotesis, los PUNTOS SEÑALADOS de las 8 reglas de Nelson, la CONCORDANCIA POR EVALUADOR, el ESTADO DEL PLAN MSA y las CAUSAS RAIZ MARCADAS. El capitulo de la herramienta si sale (con sus graficos y sus rejillas), solo falta la tabla con los numeros, asi que el usuario no tiene forma de notar que falta.
- Qué sufre el usuario: Quien lee el informe impreso ve el capitulo del MSA, el de capacidad y el de SPC con sus graficos, pero sin ninguna de las tablas de resultados: no aparecen Cp, Cpk, Pp, Ppk, el ANOVA del Gage R&R, el % de contribucion del sistema de medicion, los estadisticos descriptivos ni la ecuacion y los coeficientes de la regresion. Es justo la evidencia numerica que se entrega a la ARL y a la empresa, y desaparece sin ningun aviso.
- Arreglo propuesto: En app-dmaic/src/86_print.js, dentro del switch de bloque(), añadir antes del cierre de la linea 160 (justo despues del case 'note'):   case 'html': { let s=''; try { s = String(callv(b.render, d, ctx) || ''); } catch(e){ return ''; }                  return s.trim() ? caja(b.title, '<div class="p-html">' + s + '</div>') : ''; } Y en app-dmaic/src/10_style.css, dentro del @media print (p.ej. junto a la linea 455), las reglas minimas para que esas tablas tomen el aspecto del informe y no desborden:   .p-html table{width:100%;border-collapse:collapse}   .p-html th,.p-html td{border:.4pt solid #C9C4E8;padding:1.2mm 2mm;font-size:8.5pt!important;text-align:left;overflow-wrap:break-word}   .p-html thead th{background:#EBE9FB;color:#2A1AA6} (el !important es necesario porque los specs traen font-size:12px en el style inline de cada celda).

### [Impresión] Los valores de las fichas KPI salen cortados con «…» en el papel: 16 de 327 en la simulacion

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/86_print.js` línea ~128
- Qué pasa: El case 'cards' emite siempre <span class="v"> sin la clase de tamaño que si calcula el render de pantalla (R.b_cards usa kvCls(v) -> vmd/vsm/vxs, 30_render.js linea 212; kvCls esta en 20_core.js linea 17). Como la hoja de impresion define .p-kpi .v{font-size:14pt; white-space:nowrap; overflow:hidden; text-overflow:ellipsis} (10_style.css lineas 471-472) y la rejilla es de 4 columnas (caja util de 145 px), todo valor que pase de ~12 caracteres se corta con puntos suspensivos. No hay aviso ni tooltip: en papel el texto simplemente no esta. Las clases .vmd/.vsm/.vxs existen en el CSS de impresion (linea 473) pero nadie las pone nunca.
- Qué sufre el usuario: En el informe entregable, fichas clave quedan truncadas: el proyecto ganador de la matriz de priorizacion, el veredicto y el escenario del SPC, la ecuacion de regresion, la decision de la prueba de hipotesis y la idea mas votada del brainstorming. El lector no puede saber que decia el valor y no hay forma de recuperarlo en el papel.
- Arreglo propuesto: En app-dmaic/src/10_style.css linea 471-472, dentro del @media print, quitar el recorte de .p-kpi .v y dejar que el valor envuelva (en papel no hay tooltip, cortar es perdida pura):   .p-kpi .v{display:block;font-size:14pt;font-weight:800;color:#2A1AA6;line-height:1.15;margin:.6mm 0;             white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere} Medido: pasa de 16 recortados a 0. Complementario (para que ademas no crezcan de alto): en app-dmaic/src/86_print.js linea 128 usar la misma clase que la pantalla: '<span class="v' + kvCls(V(k.value)) + '">' (kvCls por si solo baja de 16 a 7, no basta: el cambio de CSS es el que cierra el caso).

### [Impresión] Un enlace o ruta larga en cualquier recuadro A3 saca la rejilla 38 mm fuera del margen y Chrome encoge TODO el informe al 83 %

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/10_style.css` línea ~475
- Qué pasa: .p-a3g usa grid-template-columns:1fr 1fr. Una pista 1fr nunca baja del ancho minimo de su contenido, y .p-a3 p (linea 478) tiene white-space:pre-wrap sin ninguna regla de corte de palabra. Basta un token sin guiones ni espacios de ~60 caracteres (un enlace a la intranet, una ruta de red, un codigo de documento) para que la columna crezca a 417 px: 2 x 417 + 11 de hueco = 846 px contra los 703 px (186 mm) de ancho util. El propio CSS ya resolvio exactamente esto para .p-kpis con minmax(0,1fr) y lo explica en el comentario de las lineas 462-463, pero .p-a3g se quedo con 1fr. Afecta a los 6 bloques A3 del proyecto (A3 Definir, Medir, Analizar, Mejorar, Controlar y el A3 final).
- Qué sufre el usuario: Con pegar un enlace al procedimiento en un recuadro del A3 (algo normal en un A3), el informe completo sale impreso al 83 %: el cuerpo baja de 10,5 pt a ~8,7 pt en las 167 paginas, no solo en la del A3. Con una impresora que recorta en vez de escalar, la columna derecha del A3 se pierde directamente por el borde.
- Arreglo propuesto: En app-dmaic/src/10_style.css, dentro del @media print:   linea 475: .p-a3g{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:3mm}   linea 478: .p-a3 p{margin:0;font-size:9pt;white-space:pre-wrap;overflow-wrap:anywhere} Hacen falta las dos: minmax(0,1fr) deja que la pista baje del minimo del contenido, y overflow-wrap:anywhere evita que el texto se salga de la caja. Comprobado en a3_fix.pdf: gridScrollW 703 y sin reescalado.

### [Núcleo, interfaz y datos] Abrir una herramienta la marca como «con datos»: avance, contadores y puertas de fase mienten

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/20_core.js` línea ~292
- Qué pasa: Al dibujar, rowsOf() (30_render.js:10-16) crea las filas mínimas de cada tabla como {_id:'x…'}. hasContent() sólo descarta la clave '_', así que ve el _id como contenido y toolFilled() devuelve true para una herramienta que el usuario únicamente abrió, sin escribir nada. De ahí cuelgan projProgress, modProgress, las pastillas «con datos», el BI (70_bi.js:251,942), las puertas de fase (89_flujo.js) y el conteo del libro consolidado (83_xlsxgen.js:555).
- Qué sufre el usuario: El usuario ve avance y formatos completados que no existen: «Avance DMAIC 4%», «DEFINIR 3/15 · 20%», «3 formato(s) con datos» en la tarjeta del proyecto, 1/157 en el BI, y sobre todo la puerta de fase da luz verde («El Project Charter está diligenciado y aprobado») a un formato en blanco. Con varios proyectos, el estado de cada cliente queda inflado y la decisión de pasar de fase se toma sobre un dato falso.
- Arreglo propuesto: 20_core.js:292 — en la rama de objeto de hasContent excluir también la clave interna: Object.keys(d).some(k => k !== '_' && k !== '_id' && hasContent(d[k])). Un solo cambio arregla toolFilled/modProgress/projProgress, BI, puertas, impresión y el libro consolidado (comprobado en t14_fix.js: la simulación sigue dando 100% y una fila con un dato real sigue contando).

### [Núcleo, interfaz y datos] «Respaldar» (.json) sólo guarda el proyecto abierto: al restaurar se pierden los demás

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/90_app.js` línea ~781
- Qué pasa: exportJSON() escribe payload.proyecto = ST.proj() (un único proyecto), pero los botones que lo invocan son «Respaldar»/«Restaurar» de la tarjeta Almacenamiento (90_app.js:374-383), junto a «Proyectos guardados: N», «Borrar todo» y la indicación de exportar el .json periódicamente como respaldo. importJSON() sí sabe leer varios (o.projects, línea 795), pero nadie los escribe.
- Qué sufre el usuario: Quien hace el respaldo que la propia app recomienda y luego restaura (cambio de equipo, «Borrar todo», navegador limpiado) recupera un solo proyecto y pierde el resto sin ningún aviso: justo el escenario de varias empresas y varios proyectos por empresa.
- Arreglo propuesto: 90_app.js:777-785 — en exportJSON emitir todos: payload = {app, version, exportado, cfg:{logos:{rehavid}}, projects: ST.db.projects, activeId: ST.db.activeId} (quitar la clave proyecto; importJSON ya la soporta en la línea 795) y nombrar el archivo p.ej. 'respaldo-' + ST.db.projects.length + '-proyectos'. Si se quiere conservar la exportación de uno solo, dejar data-expjson como está y usar un data-expjsonall distinto en los botones Respaldar/Restaurar de Almacenamiento.

### [Núcleo, interfaz y datos] Duplicar la simulación copia la marca «demo»: «Limpiar simulación» borra el proyecto real del usuario

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/20_core.js` línea ~260
- Qué pasa: dupProject() hace una copia profunda y no borra la bandera demo, así que el duplicado sigue siendo «la simulación» para DEMO.esDemo() y DEMO.limpiar() (87_demo.js:1621-1628), que elimina el proyecto ACTIVO completo. Duplicar la simulación para arrancar un proyecto propio es el camino natural (el botón «Duplicar» está en la tarjeta de la simulación).
- Qué sufre el usuario: Pérdida total de un proyecto real, con un mensaje que afirma lo contrario («tus proyectos reales no se tocan»). Además el duplicado luce la pastilla «simulación» y el banner de demo en Inicio, de modo que el usuario cree que sigue en el ejemplo.
- Arreglo propuesto: 20_core.js:260-261 — tras la copia profunda en dupProject añadir delete c.demo; (una copia ya no es la simulación). Refuerzo opcional: en 87_demo.js:1621 exigir que el proyecto a eliminar sea el que creó DEMO.cargar() (guardar su id) en vez de cualquiera con la bandera.

### [Núcleo, interfaz y datos] Un respaldo .json manipulado ejecuta código: el src de logos e imágenes se concatena sin escapar

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/90_app.js` línea ~16
- Qué pasa: El src de las imágenes se inserta crudo en innerHTML en cuatro sitios: renderTop/slot (90_app.js:16), viewAjustes (90_app.js:350), R.b_upload (30_render.js:245) y R.b_a3 (30_render.js:276). Los valores vienen del proyecto, y el proyecto puede entrar por «Importar/Restaurar .json» —la vía que la propia app ofrece para pasar el trabajo a otro computador—. Los campos de texto (nombre, empresa, ARL, área, líder, campos de formato) sí están escapados; las imágenes no.
- Qué sufre el usuario: Abrir un respaldo .json recibido de un tercero (o manipulado) ejecuta JavaScript dentro de la app, que tiene en localStorage los datos de todas las empresas y proyectos: puede leerlos, alterarlos o borrarlos sin que se note. El logo salta en cualquier pantalla, porque la barra superior se dibuja siempre.
- Arreglo propuesto: Escapar el valor en los cuatro puntos: 90_app.js:16 '<img src="' + esc(src) + '"', 90_app.js:350 igual, 30_render.js:245 y 30_render.js:276 '<img src="' + esc(v) + '"'. Conviene además pintar la imagen sólo si /^data:image\//.test(v) (es lo único que la app genera, vía shrinkImage) y descartar el resto al importar.

### [Núcleo, interfaz y datos] «✕ quitar» no quita la imagen ni el logo: abre el selector de archivos

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/90_app.js` línea ~585
- Qué pasa: En el manejador de clics delegado la rama data-up (línea 585) se evalúa antes que data-uprm (línea 590), y data-logo (595) antes que data-logorm (603). Como el ✕ está DENTRO de la zona .upz[data-up] (30_render.js:245 y :276) y dentro de .logo-slot[data-logo] (90_app.js:13-17), e.target.closest('[data-up]') lo captura primero y se lanza pickImage(); el e.stopPropagation() de la rama de quitar no sirve porque ambas viven en el mismo listener.
- Qué sufre el usuario: Una foto o bosquejo subido a un formato (Clarificación del Problema, ayudas visuales de CONTROLAR, áreas de imagen del A3) no se puede eliminar: el botón abre el diálogo de archivos. Para quitarla hay que sobreescribirla o usar «Limpiar», que borra todo el formato. En la barra superior pasa lo mismo con el logo de la ARL o de la empresa.
- Arreglo propuesto: 90_app.js — mover la rama if ((el = T('data-uprm'))) {…} (líneas 590-594) ANTES del bloque data-up (585-589), y la rama data-logorm (603-606) antes de data-logo (595-602). El orden de las comprobaciones es lo único que decide; no hace falta tocar el render.

### [Formatos DEFINIR–CONTROLAR] A3 MEDIR apunta a la herramienta inexistente «definir.smart»: el OBJETIVO SMART nunca aparece y el aviso de «falta diligenciar» es falso

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/61_specs_medir.js` línea ~1301
- Qué pasa: Las tres referencias del A3 MEDIR al objetivo SMART usan el id 'definir.smart', que no existe. El id real es 'definir.objetivo_smart'. Lineas 1301 (area kind:'ref'), 1326 (ctx.all['definir.smart'] del bloque note) y 1334 (xl.refs from). Es la UNICA referencia a un id inexistente en toda la app: verifique las 30 cadenas con forma de id usadas en 60..68/70/75/80-90 contra TOOL_BY_ID y solo falla esta.
- Qué sufre el usuario: Con la simulacion cargada (y con cualquier proyecto real que tenga el SMART diligenciado), MEDIR > A3 MEDIR muestra «—» en el recuadro OBJETIVO SMART y ademas imprime siempre el aviso amarillo «El OBJETIVO SMART aun no esta diligenciado en DEFINIR › Objetivo SMART: completalo alla...». El usuario ve un A3 incompleto y un mensaje que lo manda a corregir algo que ya esta bien. La celda B36 de la hoja «A3 Medir» tampoco recibe el objetivo.
- Arreglo propuesto: En app-dmaic/src/61_specs_medir.js reemplazar 'definir.smart' por 'definir.objetivo_smart' en las tres lineas: 1301 (ref:), 1326 (ctx.all[...]) y 1334 (from:).

### [Formatos extra y guía] Carta P: los limites de especificacion se comparan contra proporciones 0-1 y el veredicto "EN ESPECIFICACION" sale al reves

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/68_specs_extra_mc.js` línea ~636
- Qué pasa: `dentroEspec()` compara `c.res.puntos` (que en la carta P son proporciones 0-1) contra `d.lsl`/`d.usl` tal como los escribe el usuario. Toda la interfaz de la carta P muestra esas mismas magnitudes en porcentaje (columna `p` con fmt 'p2', y LC/LSC/LIC con `esProp ? nf(r.cl,'p2')` en el bloque de tarjetas, linea 838), y los campos LSL/USL (lineas 708-710) no dicen en que escala se escriben. Con la meta escrita en % (8) la comparacion 0,1268 > 8 siempre es falsa y el proceso se declara dentro de especificacion.
- Qué sufre el usuario: El usuario ve el escenario equivocado y, con el, la accion recomendada opuesta: el escenario 1 dice "MANTENER: no ajustes nada" cuando lo correcto es el escenario 2, "hay que MEJORAR el proceso: centrar la media o reducir la variacion... o renegociar la especificacion". Pasa con los datos de simulacion que la app trae de fabrica, que es justo lo que el usuario copia como ejemplo.
- Arreglo propuesto: En `dentroEspec()` (68_specs_extra_mc.js, lineas 636-646) normalizar los limites cuando la carta grafica proporciones, igual que ya hace STATS.prop1 con p0: antes del forEach, `const k = (c && c.code === 'P') ? (x => x > 1 ? x / 100 : x) : (x => x);` y usar `k(lsl)` / `k(usl)` en las dos comparaciones. Complementar con un `hint` en los campos de las lineas 708-710 que diga que en la carta P se escriben en % (igual que la columna PROPORCION).

### [Formatos extra y guía] El cache de cartaDe() no incluye nMuestra: al cambiar el n de la carta NP los limites y el veredicto se quedan congelados

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/68_specs_extra_mc.js` línea ~566
- Qué pasa: La firma del memo es `code + '|' + gnum(d,'n',1) + '|' + rows.length + '|' + JSON.stringify(rows)`. `calculaCarta()` tambien usa `gnum(d,'nMuestra',0)` en la rama NP (cuando la columna TAMANO DE MUESTRA esta vacia), pero ese campo no entra en la firma, asi que al cambiarlo se devuelve el resultado anterior (`_spcRes`) hasta que cambie alguna fila o se recargue la pagina.
- Qué sufre el usuario: El usuario corrige el tamano de muestra y la pantalla sigue mostrando los limites, la columna ESTADO de cada fila, el grafico y el veredicto del valor anterior, sin ningun aviso. En el caso reproducido la app dice "PROCESO INESTABLE · 3 puntos fuera de control · reglas de Nelson 1 y 5" y manda a buscar causas especiales cuando el proceso con el n correcto esta estable. Solo se arregla recargando la pagina o tocando una fila.
- Arreglo propuesto: 68_specs_extra_mc.js linea 566: anadir nMuestra a la firma del memo, p. ej. `const sig = code + '|' + gnum(d,'n',1) + '|' + gnum(d,'nMuestra',0) + '|' + rows.length + '|' + JSON.stringify(rows);`


## Severidad media

### [Tablero BI y motor de decisión] El resumen cuenta 18 riesgos abiertos pero el motor sólo entrega 16, y los 2 que faltan desaparecen sin aviso

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/75_engine.js` línea ~2301
- Qué pasa: La línea 2301 arma el texto con `n0(riesgos.length)` (la lista completa de hallazgos de severidad alta) mientras la línea 2306 devuelve `riesgos: riesgos.slice(0, 16)`. El número del texto y la lista que recibe el tablero no son el mismo conjunto, y el recorte no deja ninguna marca de «+N más».
- Qué sufre el usuario: En la pestaña RESUMEN EJECUTIVO la tarjeta «Salud del proyecto» dice «18 riesgo(s) abierto(s)» y en la pestaña RIESGOS Y DECISIONES la lista «RIESGOS PRIORIZADOS» nunca puede mostrar más de 16 riesgos del motor. Dos riesgos de severidad alta nunca se muestran y el usuario no tiene manera de saber que faltan.
- Arreglo propuesto: Calcular el recorte una sola vez antes del resumen: insertar `const riesgosTop = riesgos.slice(0, 16);` tras la línea 2262, usar `n0(riesgosTop.length)` en la línea 2301 (añadiendo « de N» cuando riesgos.length > riesgosTop.length) y devolver `riesgos: riesgosTop` en la 2306. Alternativa igual de válida: eliminar el tope, porque insBox() de 70_bi.js ya los dibuja todos ordenados por severidad.

### [Tablero BI y motor de decisión] La proyección de cierre dice «256 de 121 días transcurridos (100% del calendario)» y subestima el atraso 7 veces

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/75_engine.js` línea ~816
- Qué pasa: `trans = dDiff(ini, hoy())+1` (días realmente transcurridos) se imprime como «X de Y días transcurridos» contra `dur` (duración planeada), de modo que cuando el proyecto está vencido sale trans > dur. Además `esperado = clamp(safeDiv(trans,dur),0,1)` (línea 816) se topa en 1, así que el porcentaje del calendario sale 100% cuando en realidad va en 212%, y la «brecha de puntos porcentuales» de la línea 831 se calcula con ese valor topado.
- Qué sufre el usuario: El mensaje de mayor severidad del Gantt y del tablero BI lleva un conteo que se contradice solo («256 de 121 días transcurridos») y le dice al usuario que el atraso es de 19 puntos porcentuales cuando es de 131. Quien decida con esa cifra subestima el atraso en un factor de 7.
- Arreglo propuesto: Línea 816: quitar el tope para el dato que se muestra, `const esperado = safeDiv(trans, dur);` (sigue funcionando la comparación `esperado - avance > 0.15` de la línea 829). Línea 822: redactar «... en ' + n0(trans) + ' días transcurridos de los ' + n0(dur) + ' planeados (' + p0(esperado) + ' del calendario)». Si en algún otro punto se necesita el valor 0-1, aplicar clamp allí.

### [Tablero BI y motor de decisión] El COSTO DE IMPLEMENTACIÓN suma todas las cifras con $ de RECURSOS, incluido el precio unitario, y arruina el ROI y el payback

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/70_bi.js` línea ~367
- Qué pasa: costoImplementacion() extrae con /\$\s*[\d.,]+/g todas las cifras con $ del texto de cada fila de RECURSOS y las SUMA (línea 369). Si la fila trae precio unitario y total —la forma normal de escribir un recurso— el precio unitario se cuenta como si fuera otro costo. El propio tablero FINANCIERO le pide al usuario escribir las cifras con $ en RECURSOS para alimentar el ROI.
- Qué sufre el usuario: El costo del proyecto queda inflado 33% y con él el ROI (18% en vez de 58%) y el payback (10,1 en vez de 7,6 meses). Son las tres cifras con las que se defiende el caso financiero ante la ARL y la empresa, presentadas sin ninguna señal de que están mal.
- Arreglo propuesto: En 70_bi.js línea 369, por fila tomar sólo la cifra mayor (el total) en vez de sumarlas todas: `const vs = m.map(num).filter(v => fin(v) && v > 0); if (vs.length){ total += Math.max.apply(null, vs); n++; }`. El arreglo de fondo es dar a definir.recursos una columna numérica de costo (60_specs_definir.js, filas de columnas 1072-1074: añadir `{ k:'costo', label:'COSTO ($)', input:'number', step:'any', w:140 }`) y sumar `num(r.costo)` cuando exista, dejando el rastreo de texto sólo como respaldo.

### [Coherencia de la simulación] El texto del MSA afirma "%Estudio 18,6 % y ndc = 7 ... aceptable" mientras la herramienta calcula 17,06 %, ndc = 8 y veredicto INACEPTABLE

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/87_demo.js` línea ~351
- Qué pasa: `medir.msa_grr.conclusion` (linea 351) y `medir.a3_medir.grr` (linea 372) afirman "%Estudio 18,6 % y ndc = 7". Con los datos que genera `grrDatos(10, 3, 2, 6.8, 1.9, 0.32)` la hoja calcula %GR&R (variacion del estudio) = 17,06 %, NDC = 8 y VEREDICTO AIAG = INACEPTABLE (porque %Tolerancia = 62,62 %). La propia simulacion ya trae esos valores correctos en otro texto: `medir.msa_plan.observaciones` (linea 1019) dice "%GR&R del 17,06 %... 97,09 % de contribucion parte a parte y 8 categorias distinguibles... %Tolerancia: 62,62 %". Los dos primeros textos quedaron con numeros viejos.
- Qué sufre el usuario: En la misma pantalla del MSA el usuario lee "VEREDICTO AIAG: INACEPTABLE / %GR&R 17,06 % / ndc 8" arriba y, en el campo de conclusion justo debajo, "18,6 % y ndc = 7 ... aceptable". El A3 de MEDIR repite los numeros viejos, y la hoja de capacidad muestra un aviso rojo que contradice el "SI, GR&R aceptable" que la simulacion dejo en su encabezado. Tres pantallas de la simulacion se desmienten entre si.
- Arreglo propuesto: En app-dmaic/src/87_demo.js, linea 351 y linea 372: reemplazar "%Estudio 18,6 % y ndc = 7" por "%Estudio 17,06 % y ndc = 8", y sustituir el "aceptable" seco por la misma salvedad que ya esta redactada y verificada en msa_plan.observaciones (linea 1019-1024): aceptable sobre la variacion del estudio, con %Tolerancia de 62,62 % frente a una ventana de 3 dias.

### [Coherencia de la simulación] La hoja de capacidad afirma "6,8 dias promedio" y la misma pantalla calcula una media de 6,48 dias

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/87_demo.js` línea ~342
- Qué pasa: `medir.capacidad_proceso.baseline` (lineas 342-343) dice "6,8 dias promedio contra un maximo aceptable de 4" y `medir.capacidad_proceso.conclusion` (linea 1058) dice "la media (6,8 dias) esta por encima del limite superior". Las 40 mediciones que la simulacion genera con `muestraNormal(6.8, 2.1, 40)` (linea 344) tienen media real 6,475, y la hoja la imprime como "Media 6,48 dias - Centro real del proceso". El 6,8 es el valor que el resto del caso usa como linea base (tabla_identificacion, metDef del charter, A3 de MEJORAR y CONTROLAR), asi que la muestra generada no reproduce la linea base que se afirma. El mismo desfase aparece en medir.histograma, cuyo segundo sorteo de 40 valores da media 6,914.
- Qué sufre el usuario: El usuario lee en el resumen de la hoja "Media 6,48 dias" y dos campos mas abajo, en la misma pantalla, el texto de la simulacion le dice "la media (6,8 dias)". Como 6,8 es el numero que viaja al charter, al A3 y al cierre ("de 6,8 a 3,1 dias"), la linea base del segundo metrico del proyecto no es la que los datos sostienen.
- Arreglo propuesto: En app-dmaic/src/87_demo.js, recentrar la muestra en la media que el caso afirma en lugar de corregir el texto: en `muestraNormal` (lineas 1597-1604) restar la media de la muestra y sumar `mu` antes de devolverla (o hacerlo en el call site de la linea 344 y de la linea 358). Asi la hoja de capacidad y el histograma imprimen 6,8 y coinciden con tabla_identificacion, el charter y los A3. Alternativa minima si no se quiere tocar el generador: escribir 6,48 en las lineas 342 y 1058, aceptando que el resto del caso siga citando 6,8.

### [Coherencia de la simulación] La serie mensual promedia 27,07 % y da un GAP de 19,07, pero toda la narrativa afirma linea base 32,4 % y brecha de 24,4 puntos

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/87_demo.js` línea ~107
- Qué pasa: La serie de la linea 107 deja los 6 meses de la linea base en [21.5, 23.8, 26.1, 28.4, 30.2, 32.4], cuyo promedio es 27,07. `definir.series_tiempo` imprime PROMEDIO (MEAN) 27,07 y GAP VS OBJETIVO 19,07, y el motor anade "Ese GAP es el tamano del proyecto y va textual en el Objetivo SMART". El Objetivo SMART, el PROBLEMA, el charter y a3_definir afirman en cambio 32,4 % y "24,4 puntos" (32,4 es el ultimo mes y tambien 598/1847, no el promedio del semestre). Lo mismo pasa al cierre: `controlar.grafico_antes_despues` calcula PROMEDIO ANTES 27,07 -> DESPUES 17,93 y una mejora del 33,7 %, mientras a3_controlar y charter_cierre afirman "del 32,4 % al 7,4 %".
- Qué sufre el usuario: El recorrido de la simulacion se contradice de punta a punta: en DEFINIR la serie dice que la linea base es 27,07 y la brecha 19,07, y el propio motor le indica al usuario que ese GAP debe ir "textual en el Objetivo SMART", donde encuentra 32,4 % y 24,4 puntos. En CONTROLAR el grafico antes-despues le dice que la mejora es del 33,7 % y que la variabilidad empeoro un 146,7 %, mientras el A3 final le dice que paso del 32,4 % al 7,4 %. No hay forma de saber cual es la cifra del proyecto.
- Arreglo propuesto: En app-dmaic/src/87_demo.js linea 107: subir los 6 valores del semestre base para que su promedio sea 32,4 (p. ej. [26.8, 29.2, 31.5, 33.8, 35.6, 37.5]) y dejar como bloque "despues" solo los meses ya estabilizados, de modo que su promedio sea 7,4. Alternativa: usar en controlar.grafico_antes_despues (linea 607-610) solo los meses posteriores a la estabilizacion en vez de los seis de la transicion. Cualquiera de las dos deja que PROMEDIO/GAP/mejora de las hojas coincidan con el 32,4 % -> 7,4 % y los 24,4 puntos que afirman el charter y los A3.

### [Coherencia de la simulación] Tres textos afirman que dos causas explican el 63 % de las reprogramaciones; el Pareto de la simulacion calcula 59,9 %

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/87_demo.js` línea ~122
- Qué pasa: `definir.objetivo_smart.a` (linea 122), `analizar.descripcion_causa_raiz.conclusion` (linea 462) y `mejorar.descripcion_solucion.conclusion` (linea 548, que lo atribuye explicitamente "del Pareto") afirman el 63 %. Las frecuencias de `definir.pareto` (lineas 113-117) son 212+146+97+71+43+29 = 598, de modo que las dos primeras categorias acumulan 358/598 = 59,9 % y el grafico rotula 35 % y 60 %. El 63 % no corresponde a ningun corte: la otra estratificacion de la simulacion (hojas_verificacion, 214+176 de 598) da 65,2 %, que es la cifra que usan a3_definir.grafSec2 y niveles_causa.descripcion.
- Qué sufre el usuario: El usuario ve en el grafico Pareto que las dos primeras causas acumulan 60 % y, en el Objetivo SMART, en la descripcion de la causa raiz y en la descripcion de la solucion, que son el 63 %. Es la cifra con la que la simulacion justifica el alcance del proyecto y el resultado de las dos soluciones implantadas, y no coincide con ninguna de las dos estratificaciones que ella misma carga (59,9 % en el Pareto, 65,2 % en la hoja de verificacion).
- Arreglo propuesto: En app-dmaic/src/87_demo.js lineas 122, 462 y 548 cambiar "63 %" por "60 %" (el acumulado real de las dos primeras categorias del Pareto). Si se prefiere conservar el 63 %, subir las dos primeras frecuencias de definir.pareto (linea 114) a 225 y 152 y bajar "Otros" a 9 para mantener el total en 598, con lo que el acumulado pasa a 63,0 %.

### [Diagramas] 5 WHY'S: los dos rotulos de cada fila se pisan 76 px y se leen como un amasijo

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/50_diagrams.js` línea ~1148
- Qué pasa: `label(PX + 12, ...,'IS CONFIRMATION NECESSARY?')` mide 180,4 px de ancho, pero el segundo rotulo se dibuja en `PX + 104` (L1155). Se solapan 76,4 x 11 px en las 5 filas de los dos analisis, tanto en pantalla como en el export.
- Qué sufre el usuario: En cada una de las 5 filas del 5 Why's, en pantalla y en el PNG/informe, hay un renglon ilegible encima del selector SI/NO.
- Arreglo propuesto: L1148: acortar el rotulo al hueco disponible (92 px antes del segundo), p.ej. `'IS CONFIRMATION NECESSARY?'` -> `'¿CONFIRMAR?'`. La cabecera de la columna (L1129) ya trae el texto completo. Probado en .../t12.js: superpuestos 5 -> 0.

### [Diagramas] Swim lane: los botones ←/→/↑/↓ dejan encimar dos pasos en la misma celda y uno desaparece debajo del otro

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/50_diagrams.js` línea ~876
- Qué pasa: `izq`/`der`/`arr`/`aba` (L875-878) escriben col/carril sin comprobar si la celda ya esta ocupada. El boton ＋ si respeta las celdas libres (L1414), pero mover no. Los dos pasos se dibujan en las mismas coordenadas exactas.
- Qué sufre el usuario: El usuario pulsa → y su paso desaparece de la vista; tambien quedan tapados su ✕ y sus flechas, asi que no puede tocarlo. El dato sigue en el modelo (sale en el Excel), pero el diagrama miente.
- Arreglo propuesto: En `mSwimlane`, antes de generar las acciones, calcular las celdas ocupadas (`ocupada[carril+':'+col]`) y en L875-878 emitir la accion solo si la celda destino esta libre (si no, no poner `izq`/`der`/`arr`/`aba`, con lo que `btn()` ya devuelve '' en L1400-1403).

### [Diagramas] Swim lane: el titulo de la cabecera se monta sobre los numeros de columna

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/50_diagrams.js` línea ~1352
- Qué pasa: `label(X0 + 12, 44, 'PROCESS STEPS' + ' — ' + UP(M.proceso))` es una linea sin recorte ni ajuste; los numeros de columna se pintan en la misma banda y a la misma y (L1354-1356). Con el nombre de proceso del demo el titulo mide 544,3 px (x=34 a 578) y tapa los numeros de las columnas 1 y 2 (x=282,8 y 463,8).
- Qué sufre el usuario: En el diagrama que trae el demo por defecto, la cabecera sale con el titulo pisando la numeracion de las dos primeras columnas, en pantalla y en el PNG.
- Arreglo propuesto: L1352: recortar el titulo al ancho disponible antes del primer numero (LW + CW/2 - 12 ≈ 251 px), p.ej. envolviendo el texto con `wrapLines(..., 251, 11, 1)[0]`, o pintarlo con `textBox(X0+12, 26, LW+CW/2-24, 26, ...)` que ya recorta solo.

### [Libro consolidado y macros] «AVANCE POR FASE» del BI cuenta los 12 capítulos del manual como formatos sin diligenciar: TOTAL DMAIC 84,6 % frente al 100,0 % de la portada

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/83_xlsxgen.js` línea ~551
- Qué pasa: buildBI recorre MODULES (línea 551), que incluye el módulo GUIA con sus 12 capítulos del manual, mientras las hojas del libro y projProgress() (20_core.js:300) recorren ST.activeMods(), que lo excluye. Los capítulos del manual no son formatos diligenciables —no tienen hoja en el libro y hasContent() siempre da falso para ellos—, así que aportan 12 formatos y 0 diligenciados de forma permanente.
- Qué sufre el usuario: El mismo libro afirma «Avance DMAIC 100,0 %» en la portada y «TOTAL DMAIC 84,6 %» en el tablero BI, y la fila «0. GUÍA DE APLICACIÓN» sale pintada en rojo por el formato condicional y por el nombre definido SEMAFORO_BI (BI!$E$29:$E$35), que arranca justo en esa fila. Un proyecto cerrado al 100 % nunca puede llegar al 100 % en el tablero.
- Arreglo propuesto: En 83_xlsxgen.js línea 551 cambiar MODULES.forEach(m => { por ST.activeMods().forEach(m => {, que es lo que ya usan exportConsolidado (línea 600) y projProgress(). Con eso el rango del semáforo arranca en la primera fase real y el TOTAL coincide con la portada.

### [Libro consolidado y macros] La macro «Informe ejecutivo» siempre reporta 0 hojas y 0 diligenciadas en las cinco fases

- Estado: _sin verificar_
- Archivo: `app-dmaic/assets/macros/RehavidDMAIC.bas` línea ~219
- Qué pasa: ContarFase identifica la fase de una hoja comparando el principio de su nombre con el nombre de la fase: If UCase(Left(ws.Name, Len(fase))) = UCase(fase). Pero el generador nombra cada hoja con safeName(t.title) (83_xlsxgen.js:242), es decir el título de la herramienta, nunca con un prefijo de fase. Ninguna de las 66 hojas empieza por DEFINIR/MEDIR/ANALIZAR/MEJORAR/CONTROLAR, así que total y llenas quedan en 0 para las cinco.
- Qué sufre el usuario: La opción 3 del panel de macros (ALT+F8 · Rehavid_Panel) crea la hoja INFORME con las cinco fases a 0 hojas, 0 diligenciadas y la columna AVANCE vacía, aunque el proyecto esté completo. Es el informe que la portada invita a generar.
- Arreglo propuesto: En app-dmaic/assets/macros/RehavidDMAIC.bas:219 no deducir la fase del nombre de la hoja. Lo más directo es leerla del tablero: reemplazar la llamada a ContarFase (línea 200) por la lectura de las filas de «AVANCE POR FASE» de la hoja BI (columnas C y D), que ya traen formatos y diligenciados por fase. Si se prefiere mantener ContarFase, el generador debe marcar la fase en cada hoja —por ejemplo escribiendo t.mod en una celda fija, dado que 83_xlsxgen.js:251 ya pone «1. DEFINIR · hoja original: …» en B3— y comparar contra esa celda en vez de contra ws.Name. Hay que regenerar vbaProject.bin con app-dmaic/build_vba.py.

### [Exportación a las plantillas Excel] Las filas que la plantilla no trae se crean sin fórmulas ni formato: columnas calculadas en blanco

- Estado: **VERIFICADO**
- Archivo: `app-dmaic/src/82_xlsx.js` línea ~47
- Qué pasa: Cuando el grid tiene más filas que la plantilla, writeCells crea la fila con '<row r="N">' y celdas sin s= ni fórmulas. En la hoja PPM la plantilla solo trae la fila 4 (con E4=C4-D4, F4=D4/C4, G4=E4/C4, H4=F4*1000000, I4=G4*1000000) y el mapa xl (61_specs_medir.js:1118) no tiene endRow, así que el 2º proceso cae en la fila 5 inexistente: se escriben B5/C5/D5 y PASS, % DEFECTS, % PASS-YIELD, PPM defective y PPM PASS quedan vacíos (y sin bordes).
- Qué sufre el usuario: En el Excel exportado el segundo proceso de la hoja PPM aparece sin % de defectos, sin yield y sin PPM (y sin el formato de la tabla). Lo mismo ocurrirá en cualquier herramienta donde el usuario agregue más filas de las que trae la plantilla.
- Arreglo propuesto: En 82_xlsx.js, writeCells líneas 47-60: al crear una fila nueva, clonar la fila base de la plantilla (la que indica g.row) copiando atributos de <row> y las celdas que solo tienen estilo o fórmula, desplazando las referencias con el helper shift() (línea 14, hoy sin usar). Mínimo aceptable: pasar la fila base a writeCells desde exportModule (línea 375) y copiar de ella las celdas con <f> y s=.

### [Trazabilidad entre módulos] La propia propagacion da por diligenciados formatos que el usuario nunca toco y pone criterios en verde

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/89_flujo.js` línea ~171
- Qué pasa: propagar() escribe un campo heredado y la marca _her dentro de los datos del formato; hasContent (20_core.js:292) no distingue esas claves, asi que toolFilled() pasa de false a true. Las puertas de fase usan justo toolFilled para 7 criterios (lineas 228, 233, 234, 252, 253, 254, 255) y VARS para 3 variables del BI (399, 477, 482), varios de ellos sobre formatos que son destino del MAPA.
- Qué sufre el usuario: Las puertas de fase afirman que el Project Charter esta diligenciado y aprobado, que hay una carta de control vigilando el indicador y que el A3 final esta listo para entregar, cuando esos formatos estan vacios y lo unico que contienen es lo que escribio la propia app. Con los demas criterios cumplidos, la puerta de CONTROLAR puede llegar a decir «CERRAR el proyecto y entregarlo. Están los cinco entregables» sin A3 ni carta de control.
- Arreglo propuesto: En 89_flujo.js añadir un helper `function llenoPorUsuario(id){ const d = D(id), her = d._her || {}; return Object.keys(d).some(k => k !== '_her' && !(k in her) && hasContent(d[k])); }` y usarlo en lugar de `toolFilled(TOOL_BY_ID[...] || {})` en las lineas 228, 233, 234, 252, 253, 254, 255 y en VARS 399, 477, 482. Alternativa minima complementaria: renombrar la marca a '_' en la linea 171, que es la unica clave que hasContent ya ignora.

### [Gráficos] histogram: los rotulos TARGET y X-barra se dibujan uno encima del otro cuando el proceso esta centrado

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/40_charts.js` línea ~1151
- Qué pasa: La funcion marca() (linea 1142) coloca SIEMPRE el rotulo en la misma altura, g.y-3 (linea 1147), y se llama cuatro veces seguidas para LSL, USL, TARGET y la media X-barra (lineas 1149-1151). En un estudio de capacidad centrado la media coincide practicamente con el objetivo, asi que los dos textos caen en la misma x y se superponen por completo (frac=1). No es un caso rebuscado: ocurre tal cual en el capitulo del manual 'guia.que_es_six_sigma', que se dibuja igual sin que el usuario introduzca nada, y en los tres histogramas que pasan d.target (66_specs_extra_medir.js:703, :708, :825).
- Qué sufre el usuario: En el grafico de capacidad -- justo donde el usuario compara la media contra el objetivo -- el rotulo de la media queda ilegible, pintado sobre la palabra TARGET. Como ademas la linea discontinua de X-barra queda tapada por la de TARGET, el usuario no puede ver a simple vista si la media esta o no sobre el objetivo.
- Arreglo propuesto: 40_charts.js: anadir un desplazamiento vertical al rotulo de la media. Linea 1142 -> `const marca = (v, col, txtl, dash, dy) => {`; linea 1147 -> `T(x, g.y - 3 + (dy || 0), txtl, {...})`; linea 1151 -> `marca(m, BR.p1, 'X̄', '4 3', size + 13);`. VERIFICADO: con ese parche el caso pasa a 'OK H4 histogram' (dim_graficos/t6_fix.js); LSL, USL y TARGET siguen en su altura original.

### [Gráficos] beforeAfter: las etiquetas de variacion % se encabalgan hasta formar una franja ilegible con 19 periodos o mas

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/40_charts.js` línea ~832
- Qué pasa: K.beforeAfter dibuja la etiqueta de variacion porcentual para TODAS las categorias; la unica condicion (linea 832) es que haya dato antes y despues y que no sea compacto. No hay tope por numero de categorias, a diferencia del resto del motor: bar usa n <= 16 (linea 614), waterfall n <= 18 (linea 1424) y line n <= 12 (linea 505). Con ancho util de ~820 px la etiqueta mide ~44 px, asi que a partir de ~19 categorias el paso entre barras es menor que la etiqueta y los textos se montan. La rejilla de la unica herramienta que usa este tipo ('GRAFICO ANTES Y DESPUES DEL PROYECTO', 64_specs_controlar.js:969) arranca con min:13 filas y admite max:26, o sea que el caso esta dentro de lo que la propia herramienta permite.
- Qué sufre el usuario: Con dos anos de datos mensuales (el uso normal de un antes/despues de proyecto) la fila de porcentajes de mejora se vuelve una mancha de texto superpuesto: el usuario no puede leer ninguna variacion, justo el dato que el grafico existe para mostrar.
- Arreglo propuesto: 40_charts.js linea 832: poner el mismo tope que ya usan los demas tipos -> `if (a !== null && b !== null && a !== 0 && !D.compact && n <= 16){`. VERIFICADO: con ese cambio el caso de 26 periodos queda sin solapes ('OK H3 beforeAfter 26') y el de 8 periodos sigue mostrando las etiquetas ('OK H3b beforeAfter 8'), en dim_graficos/t6_fix.js.

### [Gráficos] hbar con valores negativos: la etiqueta del valor se pinta sobre el nombre de la categoria y se sale del lienzo

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/40_charts.js` línea ~663
- Qué pasa: En K.hbar el margen izquierdo ml solo reserva sitio para los nombres y el derecho mr solo para los valores (linea 639), dando por hecho que las barras crecen hacia la derecha. Cuando un valor es negativo la etiqueta se coloca en left-6 con anchor='end' (lineas 663-664), es decir dentro del canal izquierdo, donde ya esta el nombre dibujado en g.x-8 (linea 657): los dos textos se pisan y, si el nombre es corto, la etiqueta ademas se sale del viewBox. Es alcanzable: el grafico 'TIEMPO DE RESPUESTA POR INDICADOR' (68_specs_extra_mc.js:1186) solo filtra por isFinite(horasDe(r)) y el campo tiempo es `input:'number', step:'any'` sin minimo (68_specs_extra_mc.js:1138), asi que un -2 tecleado por error llega al grafico.
- Qué sufre el usuario: La barra negativa queda sin cifra legible -- el numero y el nombre de la fila se imprimen uno sobre otro -- y parte del texto desaparece por el borde del grafico, de modo que el usuario no puede leer ni el valor ni a que fila pertenece.
- Arreglo propuesto: 40_charts.js: reservar canal para la etiqueta cuando haya negativos. Linea 639 -> `const hayNeg = V.some(v => v !== null && v < 0);` y `const ml = Math.min(D.W * 0.46, nw + 12 + (hayNeg ? vw + 12 : 0)), mr = clamp(vw + 14, 40, D.W * 0.3),`; linea 657 -> dibujar el nombre en `g.x - 8 - (hayNeg ? vw + 12 : 0)`. VERIFICADO: con ese parche el caso pasa a 'OK H2 hbar negativo' (dim_graficos/t6_fix.js).

### [Impresión] La fila de totales se repite al pie de cada hoja de una tabla larga y se lee como un subtotal de esa hoja

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/10_style.css` línea ~417
- Qué pasa: table.p-tab tfoot{display:table-footer-group} hace que el navegador repita el pie al final de CADA trozo de una tabla que se parte entre hojas. Como el pie lleva el total/media de TODAS las filas (lo calcula b.foot sobre el array completo, 86_print.js lineas 62-78), en la primera hoja aparece debajo de 8 filas un «MEDIA GENERAL 6,824» que no es la media de esas 8 filas. El propio CSS ya corrigio esto para las tablas apaisadas en la linea 440 (.p-land table.p-tab tfoot{display:table-row-group}) pero las verticales se quedaron con table-footer-group.
- Qué sufre el usuario: Quien lee la pagina 59 del informe ve 8 mediciones y, justo debajo, «MEDIA GENERAL 6,824», que parece la media de esas 8 (la real de esas 8 es otra). Lo mismo en la 60 con las filas 9-40. El dato es correcto para la tabla entera pero esta colocado donde se lee como un subtotal de la hoja.
- Arreglo propuesto: En app-dmaic/src/10_style.css linea 417, cambiar table.p-tab tfoot{display:table-footer-group} por table.p-tab tfoot{display:table-row-group}, igual que ya se hizo para las apaisadas en la linea 440. Con table-row-group el pie se imprime una sola vez, al final de la ultima hoja de la tabla; la linea 418 (tr{break-inside:avoid}) y la 416 (thead repetido) siguen garantizando que la fila no se parta y que cada hoja lleve encabezado.

### [Impresión] Cuando la tabla apaisada va primero, la hoja vertical de la herramienta queda practicamente en blanco

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/86_print.js` línea ~81
- Qué pasa: El bloque grid de 9 o mas columnas se envuelve en <div class="p-land">, y .p-land{page:apaisada} (10_style.css linea 436) fuerza el salto a hoja horizontal en el punto exacto en que aparece. Si esa tabla es el primer bloque de la herramienta, todo lo que va antes (la etiqueta de fase, el titulo, la hoja Excel y el h3 del bloque, porque caja() deja el h3 FUERA del div.p-land) se queda solo en la hoja vertical, y el resto de los bloques se empuja detras de la apaisada. No es un caso aislado: 12 herramientas del informe llevan tabla apaisada.
- Qué sufre el usuario: El informe completo de la simulacion gasta una hoja en blanco con solo el titulo cada vez que una herramienta empieza por su tabla ancha, y ademas parte la herramienta en tres hojas en vez de dos. En papel parece un error de impresion.
- Arreglo propuesto: En app-dmaic/src/86_print.js, funcion herramienta() (linea 170), en vez de concatenar los bloques en orden, separar los que contienen 'p-land' y ponerlos al final:   const partes = (t.blocks||[]).map(b => { try { return bloque(b,t,d,ctx); } catch(e){ console.warn('print',t.id,b.type,e); return ''; } });   const cuerpo = partes.filter(s => s.indexOf('p-land') < 0).join('') + partes.filter(s => s.indexOf('p-land') >= 0).join(''); Asi la hoja vertical se llena con los campos, las fichas y los graficos, y la apaisada solo arranca cuando ya no queda contenido vertical. Comprobado: PPM pasa de 3 hojas (una con 83 caracteres) a 2 sin hojas vacias.

### [Núcleo, interfaz y datos] «Borrar todo» puede no borrar nada: beforeunload reescribe la base desde memoria

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/90_app.js` línea ~681
- Qué pasa: El manejador de data-wipe sólo hace localStorage.removeItem(DB_KEY) + location.reload(), sin limpiar ST.db ni el autoguardado pendiente. Si ST.dirty está en true (hay un cambio de los últimos ~420 ms del debounce de ST.save), el beforeunload de la línea 713 ejecuta ST.save(true) y vuelve a escribir todos los proyectos con los mismos datos.
- Qué sufre el usuario: El usuario confirma «Se borrarán TODOS los proyectos de este navegador», la app se recarga y los proyectos de todas las empresas siguen ahí, con sus datos. Quien borra antes de entregar o compartir el equipo cree que no queda información de sus clientes y sí queda.
- Arreglo propuesto: 90_app.js:679-683 — en la devolución de llamada limpiar también la memoria y el autoguardado antes de recargar: clearTimeout(ST._t); ST.db = { projects: [], activeId: null }; ST.dirty = false; localStorage.removeItem(DB_KEY); localStorage.removeItem(CFG_KEY) si también se quiere soltar la ruta/logos; location.reload();

### [Formatos DEFINIR–CONTROLAR] Las tablas con sortBy sobre una columna CALCULADA no se ordenan nunca (Matriz de Priorizacion y Seleccion de Soluciones)

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/30_render.js` línea ~108
- Qué pasa: R.b_grid ordena con `num(rows[x][b.sortBy])`, es decir con el valor CRUDO guardado en el modelo, pero `prioridad` y `overall` son columnas con `calc` y no se guardan: `rows[x].prioridad` es undefined, num(undefined)=0 para todas las filas, el comparador devuelve siempre 0 y el orden queda intacto. `computed` (que si tiene el valor) se calcula en la linea 116, DESPUES del sort. Afecta a definir.matriz_priorizacion (60_specs_definir.js:197 sortBy:'prioridad') y mejorar.seleccion_soluciones (63_specs_mejorar.js:345 sortBy:'overall'); mejorar.brainstorming ordena bien porque 'votos' si es un input.
- Qué sufre el usuario: Las dos tablas prometen el orden en su propia ayuda («La tabla se ordena sola de mayor a menor prioridad y resalta al ganador», «La tabla se ordena sola de mayor a menor OVERALL»). El usuario ve la matriz de priorizacion de proyectos y la matriz de seleccion de soluciones en el orden en que escribio las filas, con la prioridad mas baja arriba; el ranking, que es el proposito de ambos formatos, no se produce.
- Arreglo propuesto: En app-dmaic/src/30_render.js mover el bloque `const calcVal...; const computed = rows.map(calcVal);` (lineas 111-116) por encima del `let order` (linea 105) y cambiar la linea 108 por `order.sort((x, y) => (num(computed[x][b.sortBy]) - num(computed[y][b.sortBy])) * dir);`. Los atributos data-r/data-delrow ya usan el indice original, asi que la edicion y el borrado de filas siguen funcionando.

### [Formatos DEFINIR–CONTROLAR] En la simulacion, MEJORAR > Brainstorming muestra vacia la columna CATEGORIA (AFINIDAD) en las 6 ideas

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/87_demo.js` línea ~490
- Qué pasa: El spec construye las opciones del select con `lineas(d.categorias)`, que parte el texto por SALTOS DE LINEA (63_specs_mejorar.js:30 y :233). La simulacion escribe las cuatro categorias en UNA sola linea separadas por ' · ', asi que `opts` queda con una unica opcion, la cadena entera «Agendamiento · Confirmacion · Capacidad · Registro», y ninguno de los valores guardados en las filas ('Agendamiento', 'Confirmacion', 'Registro', 'Capacidad') coincide con ella.
- Qué sufre el usuario: Quien abra la simulacion ve la columna CATEGORIA (AFINIDAD) en blanco en las 6 ideas, mientras el KPI de arriba dice «CATEGORIAS DE AFINIDAD = 4»: la tabla se contradice con su propio resumen. Si el usuario despliega el select solo puede elegir la cadena completa «Agendamiento · Confirmacion · Capacidad · Registro», y al hacerlo pierde la categoria real de esa fila.
- Arreglo propuesto: En app-dmaic/src/87_demo.js linea 490 escribir las categorias una por linea: `categorias:'Agendamiento\nConfirmacion\nCapacidad\nRegistro'` (es el formato que pide el placeholder del campo y que espera lineas() en 63_specs_mejorar.js:30).

### [Formatos DEFINIR–CONTROLAR] En la simulacion, MEJORAR > Poka Yoke muestra vacio el TIPO DE DISPOSITIVO en 2 de las 3 fichas

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/87_demo.js` línea ~559
- Qué pasa: La simulacion guarda tipo:'Informativo (aviso, alarma, senal)' (lineas 559 y 561) pero la lista PY_TIPOS del spec (68_specs_extra_mc.js:89) dice 'Informativo (aviso, luz, sonido, alerta)'. Al no coincidir la cadena, el <select> no selecciona nada.
- Qué sufre el usuario: La ficha de la simulacion se ve incompleta: dos de los tres dispositivos poka yoke quedan sin tipo en pantalla. Si el usuario toca ese select para «arreglarlo», el valor original se pierde definitivamente.
- Arreglo propuesto: En app-dmaic/src/87_demo.js lineas 559 y 561 cambiar 'Informativo (aviso, alarma, senal)' por la cadena exacta de PY_TIPOS: 'Informativo (aviso, luz, sonido, alerta)'.

### [Formatos extra y guía] El pie de la grilla de hipotesis dice "DATOS VALIDOS" junto a 2, que es el numero de grupos, no de observaciones

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/67_specs_extra_analizar.js` línea ~433
- Qué pasa: El `foot` de la grilla PASO 2 es `[{k:'valor', label:'DATOS VALIDOS'}, {k:'grupo', calc: <cuenta de grupos distintos>, fmt:'n0'}]`. La entrada de `valor` no tiene `calc`, asi que el conteo de datos validos nunca se calcula: solo se imprime la etiqueta en la columna VALOR MEDIDO, y la celda inmediatamente a la derecha (columna GRUPO) muestra el numero de grupos. El pie queda literalmente "DATOS VALIDOS | 2".
- Qué sufre el usuario: El usuario lee "DATOS VALIDOS: 2" al pie de una tabla con 24 observaciones. El conteo de datos validos, que es lo que la etiqueta promete y lo que hace falta para juzgar si la prueba tiene muestra suficiente, no aparece en ninguna parte del pie.
- Arreglo propuesto: 67_specs_extra_analizar.js lineas 432-439: darle `calc` a la entrada de `valor` y mover la etiqueta a la pseudo-columna, p. ej. `{ k:'valor', calc:(rows) => arr(rows).filter(r => isNum(r.valor)).length, fmt:'n0' }` y anadir `{ k:'__label', label:'DATOS VALIDOS' }`, dejando la cuenta de grupos en la columna `grupo` con su propia etiqueta en el `help` de la cabecera.

### [Formatos extra y guía] En la prueba de 1 proporcion, H0 y H1 muestran p0 sin normalizar (p = 3,00 cuando el usuario escribe 3 por 3 %)

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/67_specs_extra_analizar.js` línea ~183
- Qué pasa: `PRUEBAS.P1.h0` y `.h1` imprimen `nf(num(d.p0),'n2')` crudo, mientras que STATS.prop1 si normaliza (`num(p0) > 1 ? num(p0)/100 : num(p0)`) y el propio campo p0 tiene el hint "Escribe 3 para 3 %, o 0,03: la app entiende las dos formas". Al escribir la forma en porcentaje, la hipotesis queda enunciada con una proporcion mayor que 1.
- Qué sufre el usuario: En la tarjeta "HIPOTESIS Y ESTADISTICOS DE LA PRUEBA" el usuario ve H0: p = 3,00 (es decir 300 %) al lado del resultado "SI difiere de 3,00 %". Es el enunciado formal que se copia al informe del proyecto y a la presentacion para la ARL, y contradice el numero con el que realmente se corrio la prueba.
- Arreglo propuesto: 67_specs_extra_analizar.js lineas 183-184: anadir junto a `alfaDe` un helper `const p0De = d => { const v = num(d && d.p0); return v > 1 ? v / 100 : v; };` y usarlo en h0/h1, imprimiendo la escala explicita, p. ej. `nf(p0De(d) * 100, 'n2') + ' %'`.


## Severidad baja

### [Coherencia de la simulación] El diagrama de dispersion concluye "cerca de 2,6 dias" por dia adicional y la recta de la misma pantalla da 2,8090

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/87_demo.js` línea ~363
- Qué pasa: `medir.dispersion.conclusion` (lineas 363-364) afirma "cada dia adicional entre sesiones suma cerca de 2,6 dias de incapacidad". Los 24 pares se generan con y = 18 + 2.6x + ruido(-4,4) (lineas 365-366), y con el sorteo deterministico de la simulacion el ajuste real es Y = 2,8090 - X + 17,0063, que la hoja imprime en el campo ECUACION DE REGRESION justo encima de la conclusion. La herramienta hermana (analizar.correlacion_regresion, mismo par de variables) da pendiente 2,5170.
- Qué sufre el usuario: El usuario lee la ecuacion 2,8090 en el recuadro y, en el campo de conclusion inmediatamente debajo, "cerca de 2,6 dias". Es la pendiente con la que la simulacion cuantifica el impacto clinico del intervalo entre sesiones.
- Arreglo propuesto: En app-dmaic/src/87_demo.js linea 364 escribir "cerca de 2,8 dias" (el valor que la hoja calcula), o reducir el ruido del generador en la linea 366 de dec(-4, 4, 1) a dec(-2, 2, 1) para que la pendiente ajustada se acerque al 2,6 nominal.

### [Diagramas] Affinity: el nombre de la categoria se corta a ~22 caracteres aunque la cabecera tiene 46 px de alto

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/50_diagrams.js` línea ~1287
- Qué pasa: El campo de la cabecera no lleva `ml`, y con `HDR - 16 = 30` px de alto `textBox` calcula maxL=1, asi que solo entra una linea de ~22 caracteres pese a que la banda de color mide 46 px.
- Qué sufre el usuario: Cualquier categoria de mas de ~22 caracteres (p.ej. "Mano de obra y materiales") aparece cortada en la cabecera de su columna, en pantalla y en el export.
- Arreglo propuesto: L1286-1287: subir el campo y darle el alto completo de la banda, con dos lineas: `field(T, x + 12, Y0 + 5, CW - (g.del ? 66 : 46), HDR - 10, { v:g.nombre, bind:g.bind, ph:'Categoría', ml:true, fs:11, fw:800, color:'#FFFFFF', ls:.4 })`.

### [Diagramas] Ishikawa: el rotulo superior izquierdo queda tapado por la caja de la primera espina

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/50_diagrams.js` línea ~1114
- Qué pasa: El rotulo se pinta siempre en (26,26) con ancho libre, mientras que la caja del nombre de la primera espina superior se coloca en `lx = tipX - lw/2` (L1069), que con espinas cortas cae en x≈233. El rotulo del 4P mide 226 px (26 a 252) y se solapa con el texto de la espina.
- Qué sufre el usuario: En el Ishikawa 4P del demo el titulo del diagrama sale mordido por la primera espina, tanto en pantalla como en el PNG exportado.
- Arreglo propuesto: L1114: bajar el rotulo fuera de la banda de las espinas, p.ej. `label(26, 26, ...)` -> `label(26, 18, ...)` y subir 10 px el origen vertical (`const yS = 64 + lenT;` en L1046 y `H = yS + lenB + 54`), o alternativamente mover el rotulo al pie como en SIPOC/Affinity.

### [Formatos DEFINIR–CONTROLAR] En Plan MSA el pie de tabla pone el CONTEO de variables debajo de la columna TOLERANCIA, donde se lee como un total de tolerancias

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/66_specs_extra_medir.js` línea ~1284
- Qué pasa: El foot del grid 'rows' usa `{ k:'tolerancia', calc:(rows) => filled(rows,'variable').length }`: la clave es 'tolerancia', asi que el numero de variables planeadas se dibuja en la celda del pie que esta justo debajo de la columna numerica TOLERANCIA. El rotulo «VARIABLES PLANEADAS» queda en la primera columna, a seis columnas de distancia.
- Qué sufre el usuario: El usuario lee «8» alineado a la derecha bajo una columna de tolerancias cuyos valores son 3 y 10: parece el total (o el promedio) de la tolerancia y no lo es, son las 8 variables del plan. El resto de la app pone estos conteos bajo una columna de texto (ver el pie de controlar.plan_de_control o de analizar.diagramas_ishikawa).
- Arreglo propuesto: En app-dmaic/src/66_specs_extra_medir.js linea 1284 mover el conteo a una columna de texto: `{ k:'gage', calc:(rows) => filled(rows,'variable').length, fmt:'n0' }`, dejando intacto el `{ k:'__label', label:'VARIABLES PLANEADAS' }` de la linea 1285.

### [Formatos extra y guía] El promedio del pie de la grilla sale sin la etiqueta MEDIA en capacidad, histograma y resumen grafico

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/66_specs_extra_medir.js` línea ~602
- Qué pasa: En esas tres grillas el `foot` es `[{k:'valor', calc:avg, fmt:'n3'}, {k:'__label', label:'MEDIA'}]`, pero `valor` es la PRIMERA columna. En R.b_grid (30_render.js lineas 152-164) la rama `__label` solo se usa cuando la columna 0 no tiene entrada propia en el foot (`if (f) ... else if (ci === 0) ...`), asi que la etiqueta se descarta y queda un numero suelto. En medir.msa_grr el mismo patron si funciona porque alli la columna 0 es `parte`.
- Qué sufre el usuario: En tres herramientas el pie de la tabla de datos muestra un numero sin decir que es (6,475 / 6,914 / 7,010), mientras que en la cuarta si aparece "MEDIA GENERAL". El usuario no sabe si ese total es la media, la suma o el ultimo dato.
- Arreglo propuesto: Cambiar `{k:'__label', label:'MEDIA'}` por una entrada en una columna que no sea la 0, o mover el promedio: en 66_specs_extra_medir.js lineas 601-603 (capacidad), 817-819 (histograma) y 1108-1110 (resumen grafico), usar p. ej. `foot:[{ k:'valor', calc:(rows)=>avg(rows,'valor'), fmt:'n3', label:undefined }, { k:'<segunda columna>', value:'MEDIA' }]`, o la via minima: en 30_render.js linea 162 imprimir tambien el `__label` cuando la columna 0 ya trae calc.

### [Formatos extra y guía] En el capitulo 1 de la guia la barra "Capitulo 1 de 12" queda a mitad de pagina, antes del mapa de herramientas

- Estado: _sin verificar_
- Archivo: `app-dmaic/src/88_infografias.js` línea ~539
- Qué pasa: `montar()` inserta la infografia con `pos:-1` haciendo `t.blocks.push(blk)`, pero el ultimo bloque de todos los capitulos de 65_specs_guia.js es BLOQUE_NAV (la barra anterior/siguiente). Por eso en guia.inicio el mapa de herramientas se monta DESPUES de la barra de navegacion; en los otros 11 capitulos la barra si queda al final.
- Qué sufre el usuario: El boton "siguiente capitulo" del primer capitulo de la guia aparece a 1754 px del final, seguido de una infografia grande. Quien llegue al final del capitulo no encuentra la barra de navegacion donde la encuentra en los otros 11.
- Arreglo propuesto: 88_infografias.js linea 539: insertar antes del ultimo bloque en vez de empujar al final, `if (x.pos < 0) t.blocks.splice(Math.max(0, t.blocks.length - 1), 0, blk);`
