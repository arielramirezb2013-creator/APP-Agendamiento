/* ============ Escenario predeterminado y reglas por paso ============ */
const ESC = {
  id:"mp_sura", n:"Caso M.P. · controversia de origen · SURA como organización ancla", dia0:120,
  nota:"Escenario sintético; ninguna persona identificable. Los plazos en días son supuestos de simulación tomados de la matriz de contratos del documento del proyecto; no son términos legales.",
  rondas:[{ id:"R1", modo:"actual", n:"Ronda 1 · funcionamiento actual" },{ id:"R2", modo:"propuesto", n:"Ronda 2 · funcionamiento propuesto con el módulo" }],
  requeridos:["tra","eps","arl","jr","afp"],
  finalidades:[
    { id:"seguir_caso", n:"Seguir mi caso", actores:["tra"] },
    { id:"reubicacion", n:"Reubicación laboral", actores:["emp"] },
    { id:"rehabilitacion", n:"Plan de rehabilitación", actores:["ips"] },
    { id:"calificacion", n:"Calificación de origen en primera oportunidad", actores:["eps"] },
    { id:"investigacion", n:"Investigación de origen y prestaciones", actores:["arl"] },
    { id:"prestaciones", n:"Estudio de prestaciones y competencia", actores:["afp"] },
    { id:"dictamen", n:"Dictamen de primera instancia", actores:["jr"] },
    { id:"apelacion", n:"Resolución de la apelación", actores:["jn"] },
    { id:"inspeccion", n:"Inspección", actores:["mintrabajo"] },
    { id:"regulacion", n:"Regulación", actores:["minsalud"] },
    { id:"queja", n:"Queja", actores:["supersalud"] },
    { id:"control_judicial", n:"Control judicial", actores:["jueces"] },
    { id:"antecedentes", n:"Verificación de antecedentes disciplinarios", actores:[] },
    { id:"estadistica", n:"Estudio estadístico interno", actores:[] },
    { id:"comercial", n:"Oferta de servicios", actores:[] }
  ],
  decisiones:{
    A1:{ a:"ips", ops:[["expedir","Expedir la incapacidad y entregar el certificado"],["remitir","Remitir a especialista antes de expedir"]] },
    A2:{ a:"eps", ops:[["reconocer","Reconocer la prórroga y pagar el subsidio"],["pedir","Pedir soportes adicionales antes de pagar"]] },
    A3:{ a:"emp", ops:[["entregar","Entregar la matriz de exposición con versión y fecha"],["entregar_sin","Entregar una copia sin versión ni fecha"],["negar","No entregar hasta una orden expresa"]] },
    E1:{ a:"eps", ops:[["comun","Calificar origen común"],["laboral","Calificar origen laboral"],["mas_info","Pedir más información antes de calificar"]] },
    E2:{ a:"arl", ops:[["aceptar","Aceptar la calificación"],["controvertir","Controvertir ante la Junta Regional"],["mas_info","Pedir evidencia adicional"]] },
    E3:{ a:"jr", ops:[["dictaminar","Dictaminar origen y pérdida de capacidad laboral"],["suspender","Suspender hasta completar el expediente"],["devolver","Devolver el expediente a M.P."]] },
    E4:{ a:"jn", ops:[["valida","El paquete permite decidir con motivación trazable"],["incompleto","El paquete está incompleto"]], extra:{ a:"arl", ops:[["apelar","Apelar el dictamen"],["no_apelar","No apelar"]] } },
    E5:{ a:"afp", ops:[["subsidio","Asumir el subsidio desde el día 181"],["remitir","Remitir a la ARL por origen laboral"],["esperar","Esperar la firmeza antes de decidir"]] },
    D1:{ a:"emp", ops:[["reintegrar","Reintegrar con restricciones"],["reubicar","Reubicar en otro cargo"],["esperar","Esperar el concepto de rehabilitación"]] },
    D2:{ a:"afp", ops:[["resolver","Resolver la prestación"],["pedir","Pedir historia laboral actualizada"],["remitir","Remitir a la ARL"]] },
    D3:{ a:"supersalud", ops:[["enrutar","Enrutar la queja con responsable y plazo"],["pedir","Pedir informes a la EPS"],["archivar","Archivar por falta de competencia"]] }
  },
  entradas:{ A1:[], A2:["inc"], A3:[], E1:["hc","apt"], E2:["hc","apt","inc"], E3:["hc","apt","inc","hl"], E4:["dic","hc","apt","inc"], E5:["dic","inc"], D1:["hc"], D2:["dic","hl"], D3:[] },
  salidas:{ A1:["Certificado de incapacidad"], A2:["Prórroga registrada · subsidio"], A3:["Matriz de exposición (APT) disponible"], E1:["Calificación de origen notificada"], E2:["Aceptación o controversia radicada"], E3:["Dictamen de primera instancia"], E4:["Validación del paquete de apelación"], E5:["Decisión de pago desde el día 181"], D1:["Reintegro o reubicación registrada"], D2:["Prestación resuelta"], D3:["Queja enrutada u orden con plazo"] },
  excepciones:"El facilitador puede avanzar sin que todas las actividades requeridas estén completas; la excepción exige una justificación y queda registrada como intervención del facilitador.",
  respCustodia:[["completa","Entregar todos los campos solicitados"],["parcial","Entregar solo los campos pertinentes a la finalidad"],["denegar","Denegar: finalidad no autorizada"]],
  focal:{ sabe:[["si","Sé qué pasa y quién me responde"],["parcial","Sé que algo pasa, no quién responde"],["no","No sé nada"]], hizo:[["llevar","Llevar documentos"],["ventanilla","Ir a una ventanilla"],["llamar","Llamar o escribir"],["nada","Nada"]] },
  soporte:{ ve:[["si","Veo etapa, responsable y plazo"],["parcial","Veo algo, sin plazos"],["no","No veo nada del caso"]], accion:[["ninguna","Ninguna"],["requerir","Requerir información"],["ordenar","Ordenar con plazo"]] },
  suficiencia:[["suficiente","Suficiente para actuar"],["parcial","Parcial: actúo con vacíos"],["insuficiente","Insuficiente: no puedo actuar"]],
  preguntas:[
    { id:"P1", t:"¿Están representados los actores, contactos y documentos necesarios?", ops:[["si","Sí, todos"],["parcial","Faltan algunos"],["no","Faltan varios"]], cual:"¿Cuáles faltan?", sub:"caracterizacion" },
    { id:"P2", t:"¿Se comprenden las responsabilidades y los intercambios de este actor?", ops:[["si","Sí"],["parcial","En parte"],["no","No"]], cual:"¿Qué no queda claro?", sub:"diseno" },
    { id:"P3", t:"¿Qué dificultades aparecieron al recorrer el escenario?", tipo:"multi", ops:[["informacion","Información incompleta o tardía"],["responsable","No estaba claro quién responde"],["plazo","No estaba claro el plazo"],["permiso","Dudas sobre qué podía consultar"],["coordinacion","Coordinación entre entidades"],["datos","Calidad de los datos"],["tecnologia","Falta de tecnología"],["ninguna","Ninguna"]], cual:"Describa la principal", sub:"caracterizacion" },
    { id:"P4", t:"¿Qué requisitos deben trasladarse al siguiente prototipo?", tipo:"texto", sub:"diseno" }
  ],
  valoracion:{ semaforo:[["aceptar","Aceptar el contrato"],["ajustar","Aceptar con ajustes"],["rechazar","Rechazar"]], mejora:[["mejor","Mejor que hoy"],["igual","Igual"],["peor","Peor"]] },
  subpreguntas:{ caracterizacion:"Caracterización: qué actores, contactos, documentos y dificultades definen la ruta.", diseno:"Diseño: qué responsabilidades, intercambios y requisitos debe cumplir el módulo.", evaluacion:"Evaluación: qué se observa al recorrer el escenario y qué queda por probar con el módulo." },
  hipotesis:[["H1","Formulación aprobada pendiente de confirmar con el investigador (metodología definible con casos de uso, contratos de datos, vistas por rol y reglas de acceso, según la presentación)."],["H2","Formulación aprobada pendiente de confirmar (instanciación técnico-funcional del módulo, según la presentación)."],["H3","Formulación aprobada pendiente de confirmar (mejora observable en SURA frente al flujo fragmentado, según la presentación)."],["H4","Formulación aprobada pendiente de confirmar (barreras dominantes, según la presentación)."]],
  riesgos:[{ id:"reidentificacion", t:"Reidentificación de M.P." },{ id:"fuera_finalidad", t:"Uso fuera de finalidad" },{ id:"retencion", t:"Retención excesiva de campos" },{ id:"sesgo", t:"Sesgo en la decisión de origen" },{ id:"carga", t:"Carga sobre el trabajador" }]
};

