"use strict";
/* ===================== MÓDULO FURAT · entrevista por voz (Res. 156 de 2005 · F 2015 - PR versión 3) ===================== */
const FURAT_META = { formato: "Informe de accidente de trabajo del empleador o contratante (FURAT) · F 2015 - PR versión 3",
  norma: "Resolución 156 de 2005 · Decreto 1295 de 1994, art. 62 (reporte a la ARL y a la EPS dentro de los dos días hábiles siguientes)" };

/* Catálogos con sinónimos para reconocer respuestas habladas (normalizados sin acentos). */
const OPT = {
  tipoVinculador: [{ c: "1", l: "Empleador", s: ["empleador", "empresa", "patrono"] }, { c: "2", l: "Contratante", s: ["contratante", "contrato"] }, { c: "3", l: "Cooperativa de trabajo asociado", s: ["cooperativa"] }],
  tipoIdEmpresa: [{ c: "NI", l: "NIT", s: ["nit", "ni"] }, { c: "CC", l: "Cédula de ciudadanía", s: ["cedula de ciudadania", "cedula", "cc"] }, { c: "CE", l: "Cédula de extranjería", s: ["extranjeria"] }, { c: "N.U", l: "Número único", s: ["numero unico", "nuip"] }, { c: "PA", l: "Pasaporte", s: ["pasaporte"] }],
  tipoIdPersona: [{ c: "CC", l: "Cédula de ciudadanía", s: ["cedula de ciudadania", "cedula", "cc"] }, { c: "CE", l: "Cédula de extranjería", s: ["extranjeria"] }, { c: "N.U", l: "Número único", s: ["numero unico", "nuip"] }, { c: "TI", l: "Tarjeta de identidad", s: ["tarjeta de identidad", "tarjeta"] }, { c: "PA", l: "Pasaporte", s: ["pasaporte"] }],
  zona: [{ c: "U", l: "Urbana", s: ["urbana", "urbano", "ciudad", "casco urbano"] }, { c: "R", l: "Rural", s: ["rural", "campo", "vereda", "finca"] }],
  tipoVinculacion: [{ c: "1", l: "Planta", s: ["planta", "directo", "termino fijo", "indefinido", "nomina", "empleado"] }, { c: "2", l: "Misión", s: ["mision", "temporal"] }, { c: "3", l: "Cooperado", s: ["cooperado", "cooperativa"] }, { c: "4", l: "Estudiante o aprendiz", s: ["estudiante", "aprendiz", "practicante", "sena"] }, { c: "5", l: "Independiente", s: ["independiente", "contratista", "prestacion de servicios"] }],
  sexo: [{ c: "M", l: "Masculino", s: ["masculino", "hombre", "varon", "masculina"] }, { c: "F", l: "Femenino", s: ["femenino", "mujer", "femenina"] }],
  jornadaHabitual: [{ c: "1", l: "Diurna", s: ["diurna", "diurno", "de dia", "dia"] }, { c: "2", l: "Nocturna", s: ["nocturna", "nocturno", "noche"] }, { c: "3", l: "Mixto", s: ["mixta", "mixto"] }, { c: "4", l: "Turnos", s: ["turnos", "rotativo", "rotativa"] }],
  jornadaSucede: [{ c: "1", l: "Normal", s: ["normal", "ordinaria", "habitual"] }, { c: "2", l: "Extra", s: ["extra", "extras", "suplementaria"] }],
  tipoAccidente: [{ c: "1", l: "Violencia", s: ["violencia", "agresion", "atraco", "robo", "pelea"] }, { c: "2", l: "Tránsito", s: ["transito", "vial", "choque", "moto", "carro", "vehiculo"] }, { c: "3", l: "Deportivo", s: ["deportivo", "deporte", "futbol", "partido"] }, { c: "4", l: "Recreativo o cultural", s: ["recreativo", "cultural", "integracion", "fiesta"] }, { c: "5", l: "Propios del trabajo", s: ["propios del trabajo", "propio del trabajo", "trabajo", "laboral", "labor", "tarea"] }],
  lugar: [{ c: "1", l: "Dentro de la empresa", s: ["dentro", "adentro", "en la empresa", "instalaciones", "en el local"] }, { c: "2", l: "Fuera de la empresa", s: ["fuera", "afuera", "calle", "cliente", "via publica", "en la via"] }, { c: "3", l: "Trabajo en casa", s: ["casa", "teletrabajo", "remoto", "hogar"] }],
  sitio: [{ c: "1", l: "Almacenes o depósitos", s: ["almacen", "bodega", "deposito"] }, { c: "2", l: "Áreas de producción", s: ["produccion", "planta", "taller", "cocina", "linea", "horno"] }, { c: "3", l: "Áreas recreativas o deportivas", s: ["recreativa", "deportiva", "cancha", "gimnasio"] }, { c: "4", l: "Corredores o pasillos", s: ["pasillo", "corredor"] }, { c: "5", l: "Escaleras", s: ["escalera"] }, { c: "6", l: "Parqueaderos o áreas de circulación vehicular", s: ["parqueadero", "estacionamiento", "circulacion vehicular", "garaje"] }, { c: "7", l: "Oficinas", s: ["oficina"] }, { c: "8", l: "Otras áreas comunes", s: ["areas comunes", "area comun", "baño", "cafeteria", "comedor", "patio", "recepcion"] }, { c: "9", l: "Otro", s: ["otro", "otra"] }],
  tipoLesion: [{ c: "10", l: "Fractura", s: ["fractura", "fracturo", "fracture", "quebro", "quebre", "rompio el hueso", "rotura"] }, { c: "20", l: "Luxación", s: ["luxacion", "dislocacion", "disloco", "se salio"] }, { c: "25", l: "Torcedura, esguince, desgarro muscular, hernia o laceración de músculo o tendón", s: ["torcedura", "esguince", "desgarro", "hernia", "tendon", "torcio", "torci"] }, { c: "30", l: "Conmoción o trauma interno", s: ["conmocion", "trauma interno", "hemorragia interna", "interno"] }, { c: "40", l: "Amputación o enucleación", s: ["amputacion", "amputo", "amputaron", "perdio el dedo", "perdida del ojo"] }, { c: "41", l: "Herida", s: ["herida", "corte", "cortada", "cortadura", "laceracion", "se corto", "me corte"] }, { c: "50", l: "Trauma superficial", s: ["superficial", "rasguño", "raspon", "raspadura", "pinchazo", "puncion", "ampolla"] }, { c: "55", l: "Golpe, contusión o aplastamiento", s: ["golpe", "contusion", "aplastamiento", "machucon", "moreton", "hematoma", "se golpeo", "me golpee"] }, { c: "60", l: "Quemadura", s: ["quemadura", "quemo", "queme", "quemaduras"] }, { c: "70", l: "Envenenamiento o intoxicación aguda o alergia", s: ["envenenamiento", "intoxicacion", "alergia", "intoxico", "reaccion alergica"] }, { c: "80", l: "Efecto del tiempo, del clima u otro relacionado con el ambiente", s: ["clima", "insolacion", "golpe de calor", "hipotermia", "deshidratacion"] }, { c: "81", l: "Asfixia", s: ["asfixia", "ahogo", "ahogamiento", "sofocacion"] }, { c: "82", l: "Efecto de la electricidad", s: ["electricidad", "electrico", "electrocucion", "descarga", "corriente"] }, { c: "83", l: "Efecto nocivo de la radiación", s: ["radiacion", "radiaciones"] }, { c: "90", l: "Lesiones múltiples", s: ["lesiones multiples", "multiples", "varias lesiones", "politraumatismo"] }, { c: "99", l: "Otro", s: ["otro", "otra"] }],
  parteCuerpo: [{ c: "1", l: "Cabeza", s: ["cabeza", "craneo", "cara", "oreja", "boca", "diente", "nariz", "frente"] }, { c: "1.12", l: "Ojo", s: ["ojo", "ojos"] }, { c: "2", l: "Cuello", s: ["cuello", "cervical"] }, { c: "3", l: "Tronco (incluye espalda, columna vertebral, médula espinal, pelvis)", s: ["tronco", "espalda", "columna", "lumbar", "pelvis", "medula", "cintura"] }, { c: "3.32", l: "Tórax", s: ["torax", "pecho", "costilla", "costillas"] }, { c: "3.33", l: "Abdomen", s: ["abdomen", "estomago", "barriga", "vientre"] }, { c: "4", l: "Miembros superiores", s: ["hombro", "clavicula", "brazo", "codo", "antebrazo", "muñeca", "miembro superior", "miembros superiores"] }, { c: "4.46", l: "Manos", s: ["mano", "manos", "dedo de la mano", "dedos de la mano", "pulgar", "indice", "meñique"] }, { c: "5", l: "Miembros inferiores", s: ["cadera", "muslo", "rodilla", "pierna", "tobillo", "pantorrilla", "miembro inferior", "miembros inferiores"] }, { c: "5.56", l: "Pies", s: ["pie", "pies", "dedo del pie", "dedos del pie", "talon"] }, { c: "6", l: "Ubicaciones múltiples", s: ["ubicaciones multiples", "varias partes", "todo el cuerpo", "multiples"] }, { c: "7", l: "Lesiones generales u otras", s: ["general", "generales", "otras"] }],
  agente: [{ c: "1", l: "Máquinas y/o equipos", s: ["maquina", "maquinas", "equipo", "motor", "amasadora", "laminadora", "prensa", "sierra", "torno", "cortadora", "elevador"] }, { c: "2", l: "Medios de transporte", s: ["transporte", "vehiculo", "moto", "carro", "camion", "montacargas", "ascensor", "grua", "bicicleta", "bus"] }, { c: "3", l: "Aparatos", s: ["aparato", "caldera", "horno", "estufa", "freidora", "compresor", "cilindro", "tuberia"] }, { c: "3.36", l: "Herramientas, implementos o utensilios", s: ["herramienta", "martillo", "cuchillo", "tijeras", "destornillador", "pulidora", "taladro", "utensilio", "machete", "navaja", "bisturi", "pala"] }, { c: "4", l: "Materiales o sustancias", s: ["material", "sustancia", "quimico", "aceite", "agua caliente", "vapor", "polvo", "gas", "liquido", "harina", "bulto", "caja", "carga", "cemento", "vidrio", "lamina"] }, { c: "4.4", l: "Radiaciones", s: ["radiacion", "radiaciones", "rayos"] }, { c: "5", l: "Ambiente de trabajo (superficies de tránsito y de trabajo, muebles, etc.)", s: ["piso", "suelo", "superficie", "escalera", "escalon", "pared", "puerta", "ambiente", "mueble", "silla", "mesa", "anden", "hueco", "lluvia"] }, { c: "6", l: "Otros agentes no clasificados", s: ["otro agente", "otros agentes", "otro"] }, { c: "6.61", l: "Animales (vivos o productos animales)", s: ["animal", "perro", "vaca", "caballo", "abeja", "serpiente", "culebra", "mordio", "pico", "gato"] }, { c: "7", l: "Agentes no clasificados por falta de datos", s: ["no se sabe", "sin datos", "falta de datos", "no se"] }],
  mecanismo: [{ c: "2", l: "Caída de objetos", s: ["me cayo", "le cayo", "se le cayo", "cayo encima", "cayo un", "cayo una", "derrumbe", "desplome", "se vino abajo", "caida de objeto"] }, { c: "1", l: "Caída de personas", s: ["me cai", "se cayo", "caida", "cai", "resbale", "resbalo", "tropece", "tropezo", "caida de persona", "cayo al piso", "cayo de"] }, { c: "3", l: "Pisadas, choques o golpes", s: ["pise", "piso un", "choque", "choco", "golpe contra", "me golpee", "se golpeo", "golpeo", "se corto", "me corte", "corto con", "pisada"] }, { c: "4", l: "Atrapamientos", s: ["atrapado", "atrapo", "atrapamiento", "prensado", "machuco", "aplasto entre", "quedo entre", "aprisiono"] }, { c: "5", l: "Sobreesfuerzo, esfuerzo excesivo o falso movimiento", s: ["sobreesfuerzo", "esfuerzo", "levantar", "levanto", "alzar", "alzo", "cargar", "cargo", "mal movimiento", "falso movimiento", "se torcio", "torci", "agacho"] }, { c: "6", l: "Exposición o contacto con temperatura extrema", s: ["temperatura", "calor", "frio", "se quemo", "me queme", "quemadura", "agua caliente", "aceite caliente", "vapor caliente", "hielo"] }, { c: "7", l: "Exposición o contacto con la electricidad", s: ["electricidad", "electrico", "corriente", "descarga", "electrocuto"] }, { c: "8", l: "Exposición o contacto con sustancias nocivas, radiaciones o salpicaduras", s: ["sustancia", "quimico", "salpico", "salpicadura", "vapores", "gas", "radiacion", "intoxico", "inhalo", "acido"] }, { c: "9", l: "Otro", s: ["otro", "otra"] }]
};

/* Catálogo de campos del FURAT: sección, etiqueta del formulario, pregunta, tipo y condiciones. */
const FURAT_FIELDS = [
  { id: "eps", sec: "AF", label: "EPS a la que está afiliado", q: "¿A qué *EPS* está afiliado el trabajador?", type: "text" },
  { id: "arl", sec: "AF", label: "ARL a la que está afiliado", q: "¿A qué *ARL* está afiliada la empresa?", type: "text", def: "ARL SURA" },
  { id: "afp", sec: "AF", label: "AFP a la que está afiliado", q: "¿A qué *fondo de pensiones (AFP)* está afiliado el trabajador? (Por ejemplo: Colpensiones, Porvenir, Protección, Colfondos)", type: "text" },
  { id: "tipoVinculador", sec: "I", label: "Tipo de vinculador laboral", q: "¿Quién reporta el accidente? Opciones: *empleador*, *contratante* o *cooperativa de trabajo asociado*.", type: "enum", opts: "tipoVinculador" },
  { id: "actividadEconomica", sec: "I", label: "Nombre de la actividad económica", q: "¿Cuál es la *actividad económica* de la empresa? (Por ejemplo: panadería, taller de mecánica, restaurante)", type: "text" },
  { id: "razonSocial", sec: "I", label: "Nombre o razón social", q: "¿Cuál es el *nombre o razón social* de la empresa?", type: "text" },
  { id: "tipoIdEmpresa", sec: "I", label: "Tipo de identificación del empleador", q: "¿Qué tipo de identificación tiene la empresa? Opciones: *NIT*, *cédula*, *cédula de extranjería*, *número único* o *pasaporte*.", type: "enum", opts: "tipoIdEmpresa" },
  { id: "numIdEmpresa", sec: "I", label: "Número de identificación del empleador", q: "Dime el *número de identificación* de la empresa (sin dígito de verificación).", type: "digits", min: 5 },
  { id: "direccionEmpresa", sec: "I", label: "Dirección de la sede principal", q: "¿Cuál es la *dirección* de la sede principal?", type: "address" },
  { id: "telefonoEmpresa", sec: "I", label: "Teléfono de la sede principal", q: "¿Cuál es el *teléfono* de la sede principal?", type: "digits", min: 7 },
  { id: "correo", sec: "I", label: "Correo electrónico", q: "¿Cuál es el *correo electrónico* de contacto? Dilo letra por letra si hace falta, usando «arroba» y «punto».", type: "email", opt: true },
  { id: "departamentoEmpresa", sec: "I", label: "Departamento (sede principal)", q: "¿En qué *departamento* está la sede principal?", type: "name" },
  { id: "municipioEmpresa", sec: "I", label: "Municipio (sede principal)", q: "¿En qué *municipio*?", type: "name" },
  { id: "zonaEmpresa", sec: "I", label: "Zona (sede principal)", q: "¿La sede está en zona *urbana* o *rural*?", type: "enum", opts: "zona" },
  { id: "centroNombre", sec: "I", label: "Centro de trabajo donde labora el trabajador", q: "¿Cómo se llama el *centro de trabajo* donde labora el trabajador? (Por ejemplo: sede principal, planta norte, punto de venta)", type: "text" },
  { id: "centroMismo", sec: "I", label: "¿Los datos del centro de trabajo son los mismos de la sede principal?", q: "¿Los datos del centro de trabajo son *los mismos* de la sede principal? (sí / no)", type: "bool" },
  { id: "centroActividad", sec: "I", label: "Actividad económica del centro de trabajo", q: "¿Cuál es la *actividad económica* del centro de trabajo?", type: "text", askIf: a => a.centroMismo === false },
  { id: "centroDireccion", sec: "I", label: "Dirección del centro de trabajo", q: "¿Cuál es la *dirección* del centro de trabajo?", type: "address", askIf: a => a.centroMismo === false },
  { id: "centroTelefono", sec: "I", label: "Teléfono del centro de trabajo", q: "¿Cuál es el *teléfono* del centro de trabajo?", type: "digits", min: 7, askIf: a => a.centroMismo === false },
  { id: "centroDepartamento", sec: "I", label: "Departamento del centro de trabajo", q: "¿En qué *departamento* está el centro de trabajo?", type: "name", askIf: a => a.centroMismo === false },
  { id: "centroMunicipio", sec: "I", label: "Municipio del centro de trabajo", q: "¿En qué *municipio*?", type: "name", askIf: a => a.centroMismo === false },
  { id: "centroZona", sec: "I", label: "Zona del centro de trabajo", q: "¿Zona *urbana* o *rural*?", type: "enum", opts: "zona", askIf: a => a.centroMismo === false },
  { id: "tipoVinculacion", sec: "II", label: "Tipo de vinculación", q: "¿Qué *tipo de vinculación* tiene el trabajador? Opciones: *planta*, *misión*, *cooperado*, *estudiante o aprendiz*, *independiente*.", type: "enum", opts: "tipoVinculacion" },
  { id: "apellidos", sec: "II", label: "Apellidos", q: "Dime los *apellidos* del trabajador (primero y segundo).", type: "name" },
  { id: "nombres", sec: "II", label: "Nombres", q: "Ahora sus *nombres* (primero y segundo).", type: "name" },
  { id: "tipoIdTrabajador", sec: "II", label: "Tipo de identificación del trabajador", q: "¿Qué *documento* tiene? Opciones: *cédula*, *cédula de extranjería*, *número único*, *tarjeta de identidad* o *pasaporte*.", type: "enum", opts: "tipoIdPersona" },
  { id: "numIdTrabajador", sec: "II", label: "Número de identificación del trabajador", q: "¿Cuál es el *número* del documento?", type: "digits", min: 5 },
  { id: "fechaNacimiento", sec: "II", label: "Fecha de nacimiento", q: "¿Cuál es su *fecha de nacimiento*? (día, mes y año)", type: "date", past: true },
  { id: "sexo", sec: "II", label: "Sexo", q: "¿*Sexo* del trabajador: masculino o femenino?", type: "enum", opts: "sexo" },
  { id: "direccionTrabajador", sec: "II", label: "Dirección de residencia", q: "¿Cuál es la *dirección de residencia* del trabajador?", type: "address" },
  { id: "telefonoTrabajador", sec: "II", label: "Teléfono del trabajador", q: "¿Cuál es su *teléfono*?", type: "digits", min: 7 },
  { id: "viveMismo", sec: "II", label: "¿Vive en el mismo municipio de la sede?", q: "¿Vive en el *mismo municipio* de la sede principal? (sí / no)", type: "bool", meta: true },
  { id: "departamentoTrabajador", sec: "II", label: "Departamento de residencia", q: "¿En qué *departamento* vive?", type: "name", askIf: a => a.viveMismo === false, from: a => a.viveMismo ? a.departamentoEmpresa : undefined },
  { id: "municipioTrabajador", sec: "II", label: "Municipio de residencia", q: "¿En qué *municipio*?", type: "name", askIf: a => a.viveMismo === false, from: a => a.viveMismo ? a.municipioEmpresa : undefined },
  { id: "zonaTrabajador", sec: "II", label: "Zona de residencia", q: "¿Su residencia está en zona *urbana* o *rural*?", type: "enum", opts: "zona" },
  { id: "cargo", sec: "II", label: "Cargo", q: "¿Cuál es su *cargo* en la empresa?", type: "text" },
  { id: "ocupacionHabitual", sec: "II", label: "Ocupación habitual", q: "¿Cuál es su *ocupación habitual* (el oficio que realiza normalmente)?", type: "text" },
  { id: "tiempoOcupacion", sec: "II", label: "Tiempo de ocupación habitual al momento del accidente", q: "¿Cuánto *tiempo llevaba en esa ocupación* al momento del accidente? (en años, meses o días)", type: "durMD" },
  { id: "fechaIngreso", sec: "II", label: "Fecha de ingreso a la empresa", q: "¿Cuál es su *fecha de ingreso* a la empresa?", type: "date", past: true },
  { id: "salario", sec: "II", label: "Salario u honorarios (mensual)", q: "¿Cuál es su *salario u honorarios mensuales*, en pesos?", type: "money" },
  { id: "jornadaHabitual", sec: "II", label: "Jornada de trabajo habitual", q: "¿Cuál es su *jornada habitual*? Opciones: *diurna*, *nocturna*, *mixta* o *por turnos*.", type: "enum", opts: "jornadaHabitual" },
  { id: "fechaAccidente", sec: "III", label: "Fecha del accidente", q: "Vamos con el accidente. ¿*Qué día ocurrió*? (día, mes y año; también puedes decir «hoy» o «ayer»)", type: "date", past: true },
  { id: "horaAccidente", sec: "III", label: "Hora del accidente (0-23 h)", q: "¿A qué *hora* ocurrió? (por ejemplo: «a las tres y media de la tarde» o «14:30»)", type: "time" },
  { id: "jornadaSucede", sec: "III", label: "Jornada en que sucede", q: "¿Ocurrió en jornada *normal* o en jornada *extra*?", type: "enum", opts: "jornadaSucede" },
  { id: "laborHabitual", sec: "III", label: "¿Estaba realizando su labor habitual?", q: "¿Estaba realizando su *labor habitual*? (sí / no)", type: "bool" },
  { id: "cualLabor", sec: "III", label: "Cuál labor realizaba (si no era la habitual)", q: "¿*Qué labor* estaba realizando?", type: "text", askIf: a => a.laborHabitual === false },
  { id: "tiempoLaborado", sec: "III", label: "Total tiempo laborado previo al accidente", q: "¿Cuántas *horas y minutos llevaba trabajando* ese día cuando ocurrió el accidente?", type: "durHM" },
  { id: "tipoAccidente", sec: "III", label: "Tipo de accidente", q: "¿*Tipo de accidente*? Opciones: *violencia*, *tránsito*, *deportivo*, *recreativo o cultural* o *propios del trabajo*.", type: "enum", opts: "tipoAccidente" },
  { id: "causoMuerte", sec: "III", label: "¿Causó la muerte al trabajador?", q: "¿El accidente *causó la muerte* del trabajador? (sí / no)", type: "bool" },
  { id: "accMismo", sec: "III", label: "¿Ocurrió en el mismo municipio de la sede?", q: "¿Ocurrió en el *mismo municipio* de la sede principal? (sí / no)", type: "bool", meta: true },
  { id: "departamentoAccidente", sec: "III", label: "Departamento del accidente", q: "¿En qué *departamento* ocurrió?", type: "name", askIf: a => a.accMismo === false, from: a => a.accMismo ? a.departamentoEmpresa : undefined },
  { id: "municipioAccidente", sec: "III", label: "Municipio del accidente", q: "¿En qué *municipio*?", type: "name", askIf: a => a.accMismo === false, from: a => a.accMismo ? a.municipioEmpresa : undefined },
  { id: "zonaAccidente", sec: "III", label: "Zona donde ocurrió el accidente", q: "¿Fue en zona *urbana* o *rural*?", type: "enum", opts: "zona" },
  { id: "lugar", sec: "III", label: "Lugar donde ocurrió el accidente", q: "¿Ocurrió *dentro de la empresa*, *fuera de la empresa* o en *trabajo en casa*?", type: "enum", opts: "lugar" },
  { id: "sitio", sec: "III", label: "Sitio de ocurrencia", q: "¿En *qué sitio* exactamente? Opciones: almacén o depósito, área de producción, área recreativa o deportiva, corredor o pasillo, escaleras, parqueadero, oficinas, otras áreas comunes u otro.", type: "enum", opts: "sitio" },
  { id: "sitioOtro", sec: "III", label: "Otro sitio (especifique)", q: "Especifica *cuál sitio*.", type: "text", askIf: a => a.sitio === "9" },
  { id: "descripcion", sec: "IV", label: "Descripción detallada del accidente", q: "Ahora *describe detalladamente el accidente*: qué estaba haciendo la persona, qué lo originó o causó y qué lesión sufrió. Habla con calma y, cuando termines, haz una pausa de un par de segundos.", type: "long", cont: true },
  { id: "tipoLesion", sec: "III", label: "Tipo de lesión", q: "¿Qué *tipo de lesión* sufrió? Opciones: fractura, luxación, torcedura o esguince, trauma interno, amputación, herida, trauma superficial, golpe o contusión, quemadura, intoxicación o alergia, efecto del clima, asfixia, electricidad, radiación, lesiones múltiples u otro.", type: "multi", opts: "tipoLesion", infer: true },
  { id: "lesionOtro", sec: "III", label: "Otro tipo de lesión (especifique)", q: "Especifica *qué otra lesión*.", type: "text", askIf: a => Array.isArray(a.tipoLesion) && a.tipoLesion.includes("99") },
  { id: "parteCuerpo", sec: "III", label: "Parte del cuerpo aparentemente afectada", q: "¿Qué *parte del cuerpo* resultó afectada? Opciones: cabeza, ojo, cuello, tronco, tórax, abdomen, miembros superiores, manos, miembros inferiores, pies, ubicaciones múltiples o lesiones generales.", type: "enum", opts: "parteCuerpo", infer: true },
  { id: "agente", sec: "III", label: "Agente del accidente (con qué se lesionó)", q: "¿*Con qué se lesionó*? Opciones: máquinas o equipos, medios de transporte, aparatos, herramientas o utensilios, materiales o sustancias, radiaciones, ambiente de trabajo (piso, escaleras, muebles), animales u otros agentes.", type: "enum", opts: "agente", infer: true },
  { id: "mecanismo", sec: "III", label: "Mecanismo o forma del accidente", q: "¿*Cómo ocurrió*? Opciones: caída de personas, caída de objetos, pisadas, choques o golpes, atrapamiento, sobreesfuerzo o falso movimiento, temperatura extrema, electricidad, contacto con sustancias o salpicaduras, u otro.", type: "enum", opts: "mecanismo", infer: true },
  { id: "mecanismoOtro", sec: "III", label: "Otro mecanismo (especifique)", q: "Especifica *cómo ocurrió*.", type: "text", askIf: a => a.mecanismo === "9" },
  { id: "hayTestigos", sec: "IV", label: "¿Hubo personas que presenciaron el accidente?", q: "¿Hubo *personas que presenciaron* el accidente? (sí / no)", type: "bool" },
  { id: "testigo1Nombre", sec: "IV", label: "Testigo 1 · Apellidos y nombres", q: "Dime los *apellidos y nombres* del primer testigo.", type: "name", askIf: a => a.hayTestigos === true },
  { id: "testigo1TipoId", sec: "IV", label: "Testigo 1 · Tipo de documento", q: "¿Qué *documento* tiene el testigo? (cédula, cédula de extranjería, número único, tarjeta de identidad o pasaporte)", type: "enum", opts: "tipoIdPersona", askIf: a => a.hayTestigos === true },
  { id: "testigo1NumId", sec: "IV", label: "Testigo 1 · Número de documento", q: "¿*Número* del documento del testigo?", type: "digits", min: 5, askIf: a => a.hayTestigos === true },
  { id: "testigo1Cargo", sec: "IV", label: "Testigo 1 · Cargo", q: "¿Cuál es el *cargo* del testigo?", type: "text", askIf: a => a.hayTestigos === true },
  { id: "hayTestigo2", sec: "IV", label: "¿Hubo un segundo testigo?", q: "¿Hubo un *segundo testigo*? (sí / no)", type: "bool", meta: true, askIf: a => a.hayTestigos === true },
  { id: "testigo2Nombre", sec: "IV", label: "Testigo 2 · Apellidos y nombres", q: "*Apellidos y nombres* del segundo testigo.", type: "name", askIf: a => a.hayTestigo2 === true },
  { id: "testigo2TipoId", sec: "IV", label: "Testigo 2 · Tipo de documento", q: "¿Qué *documento* tiene?", type: "enum", opts: "tipoIdPersona", askIf: a => a.hayTestigo2 === true },
  { id: "testigo2NumId", sec: "IV", label: "Testigo 2 · Número de documento", q: "¿*Número* del documento?", type: "digits", min: 5, askIf: a => a.hayTestigo2 === true },
  { id: "testigo2Cargo", sec: "IV", label: "Testigo 2 · Cargo", q: "¿Cuál es su *cargo*?", type: "text", askIf: a => a.hayTestigo2 === true },
  { id: "responsableNombre", sec: "V", label: "Persona responsable del informe · Apellidos y nombres", q: "Para terminar: ¿*quién diligencia* este informe? Dime apellidos y nombres.", type: "name" },
  { id: "responsableTipoId", sec: "V", label: "Responsable · Tipo de documento", q: "¿Qué *documento* tiene el responsable? (cédula, cédula de extranjería, número único, tarjeta de identidad o pasaporte)", type: "enum", opts: "tipoIdPersona" },
  { id: "responsableNumId", sec: "V", label: "Responsable · Número de documento", q: "¿*Número* del documento?", type: "digits", min: 5 },
  { id: "responsableCargo", sec: "V", label: "Responsable · Cargo", q: "¿Cuál es el *cargo* del responsable del informe?", type: "text" }
];
const GUIA = { eps: "EPS", arl: "ARL", afp: "fondo de pensiones", tipoVinculador: "empleador / contratante / cooperativa", actividadEconomica: "actividad económica", razonSocial: "nombre o razón social", tipoIdEmpresa: "NIT / cédula / cédula de extranjería / pasaporte", numIdEmpresa: "número, sin dígito de verificación", direccionEmpresa: "dirección", telefonoEmpresa: "teléfono", correo: "correo, diciendo «arroba» y «punto»", departamentoEmpresa: "departamento", municipioEmpresa: "municipio", zonaEmpresa: "urbana / rural", centroNombre: "nombre del centro de trabajo", centroMismo: "sí / no",
  centroActividad: "actividad económica del centro", centroDireccion: "dirección", centroTelefono: "teléfono", centroDepartamento: "departamento", centroMunicipio: "municipio", centroZona: "urbana / rural",
  tipoVinculacion: "planta / misión / cooperado / estudiante o aprendiz / independiente", apellidos: "primer y segundo apellido", nombres: "primer y segundo nombre", tipoIdTrabajador: "cédula / cédula de extranjería / tarjeta de identidad / pasaporte", numIdTrabajador: "número de documento", fechaNacimiento: "día, mes y año de nacimiento", sexo: "masculino / femenino", direccionTrabajador: "dirección de residencia", telefonoTrabajador: "teléfono", viveMismo: "sí / no", departamentoTrabajador: "departamento", municipioTrabajador: "municipio", zonaTrabajador: "urbana / rural", cargo: "cargo", ocupacionHabitual: "ocupación habitual", tiempoOcupacion: "años, meses o días en la ocupación", fechaIngreso: "fecha de ingreso", salario: "salario mensual en pesos", jornadaHabitual: "diurna / nocturna / mixta / turnos",
  fechaAccidente: "fecha del accidente", horaAccidente: "hora", jornadaSucede: "normal / extra", laborHabitual: "sí / no", cualLabor: "labor que realizaba", tiempoLaborado: "horas y minutos trabajados", tipoAccidente: "violencia / tránsito / deportivo / recreativo / propios del trabajo", causoMuerte: "sí / no", accMismo: "sí / no", departamentoAccidente: "departamento", municipioAccidente: "municipio", zonaAccidente: "urbana / rural", lugar: "dentro de la empresa / fuera de la empresa / trabajo en casa", sitio: "almacén / producción / área recreativa / pasillo / escaleras / parqueadero / oficina / otras áreas comunes / otro", sitioOtro: "cuál sitio",
  descripcion: "qué hacía la persona, qué lo causó y qué lesión sufrió", tipoLesion: "fractura / luxación / esguince / trauma interno / amputación / herida / trauma superficial / golpe / quemadura / intoxicación / clima / asfixia / electricidad / radiación / múltiples / otro", lesionOtro: "cuál lesión", parteCuerpo: "cabeza / ojo / cuello / tronco / tórax / abdomen / miembros superiores / manos / miembros inferiores / pies / múltiples", agente: "máquina / transporte / aparato / herramienta / material o sustancia / radiación / ambiente de trabajo / animal / otro", mecanismo: "caída de persona / caída de objeto / golpe o choque / atrapamiento / sobreesfuerzo / temperatura extrema / electricidad / sustancias / otro", mecanismoOtro: "cómo ocurrió",
  hayTestigos: "sí / no", testigo1Nombre: "apellidos y nombres del testigo", testigo1TipoId: "cédula / cédula de extranjería / tarjeta de identidad / pasaporte", testigo1NumId: "número de documento", testigo1Cargo: "cargo", hayTestigo2: "sí / no", testigo2Nombre: "apellidos y nombres", testigo2TipoId: "cédula / cédula de extranjería / tarjeta de identidad / pasaporte", testigo2NumId: "número de documento", testigo2Cargo: "cargo", responsableNombre: "apellidos y nombres de quien diligencia", responsableTipoId: "cédula / cédula de extranjería / tarjeta de identidad / pasaporte", responsableNumId: "número de documento", responsableCargo: "cargo" };
const FURAT_SEC = { AF: "Afiliaciones", I: "I. Identificación general del empleador, contratante o cooperativa", II: "II. Información de la persona que se accidentó", III: "III. Información sobre el accidente", IV: "IV. Descripción del accidente y testigos", V: "V. Persona responsable del informe" };
const FURAT_ALIAS = { eps: ["eps"], arl: ["arl"], afp: ["afp", "pension", "pensiones", "fondo"], razonSocial: ["razon social", "empresa", "nombre de la empresa"], numIdEmpresa: ["nit", "numero de la empresa"], direccionEmpresa: ["direccion de la empresa", "direccion de la sede"], telefonoEmpresa: ["telefono de la empresa"], correo: ["correo", "email"], apellidos: ["apellidos", "apellido"], nombres: ["nombres", "nombre"], numIdTrabajador: ["cedula", "documento del trabajador", "numero de documento"], fechaNacimiento: ["nacimiento"], sexo: ["sexo"], direccionTrabajador: ["direccion del trabajador", "residencia"], telefonoTrabajador: ["telefono del trabajador", "celular"], cargo: ["cargo"], ocupacionHabitual: ["ocupacion"], tiempoOcupacion: ["tiempo de ocupacion", "antiguedad en la ocupacion"], fechaIngreso: ["ingreso"], salario: ["salario", "sueldo", "honorarios"], jornadaHabitual: ["jornada habitual"], fechaAccidente: ["fecha del accidente", "dia del accidente"], horaAccidente: ["hora"], jornadaSucede: ["jornada del accidente"], tiempoLaborado: ["tiempo laborado", "horas trabajadas"], tipoAccidente: ["tipo de accidente"], causoMuerte: ["muerte"], lugar: ["lugar"], sitio: ["sitio"], descripcion: ["descripcion", "relato"], tipoLesion: ["lesion", "tipo de lesion"], parteCuerpo: ["parte del cuerpo"], agente: ["agente"], mecanismo: ["mecanismo", "forma del accidente"], hayTestigos: ["testigos"], responsableNombre: ["responsable"], responsableCargo: ["cargo del responsable"] };


/* ---------- Modo guion: párrafos con espacios en blanco por capítulo ---------- */
/* {id} referencia un campo de FURAT_FIELDS. El texto fijo entre espacios sirve de ancla para extraer los datos cuando la persona lee el párrafo. */
const GUIONES = [
  { id: "g0", sec: "AF", titulo: "Afiliaciones y empresa", tpl: "El trabajador está afiliado a la EPS {eps}, a la ARL {arl} y al fondo de pensiones {afp}. El reporte lo presenta el {tipoVinculador}. La empresa se llama {razonSocial}, su actividad económica es {actividadEconomica} y se identifica con {tipoIdEmpresa}, con el número {numIdEmpresa}. La sede principal queda en la dirección {direccionEmpresa}, con teléfono {telefonoEmpresa} y correo electrónico {correo}, en el municipio de {municipioEmpresa}, departamento de {departamentoEmpresa}, en zona {zonaEmpresa}. El trabajador labora en el centro de trabajo {centroNombre}, cuyos datos {centroMismo} son los mismos de la sede principal." },
  { id: "g0c", sec: "I", titulo: "Centro de trabajo", comp: true, tpl: "El centro de trabajo tiene como actividad económica {centroActividad}; queda en la dirección {centroDireccion}, con teléfono {centroTelefono}, en el municipio de {centroMunicipio}, departamento de {centroDepartamento}, en zona {centroZona}." },
  { id: "g2", sec: "II", titulo: "La persona accidentada", tpl: "El trabajador tiene vinculación de {tipoVinculacion}. Sus apellidos son {apellidos} y sus nombres son {nombres}. Se identifica con {tipoIdTrabajador}, con el número {numIdTrabajador}; nació el {fechaNacimiento} y es de sexo {sexo}. Vive en la dirección {direccionTrabajador}, con teléfono {telefonoTrabajador}. La persona {viveMismo} vive en el mismo municipio de la sede principal, en zona {zonaTrabajador}. Su cargo es {cargo} y su ocupación habitual es {ocupacionHabitual}, en la que llevaba {tiempoOcupacion}. Ingresó a la empresa el {fechaIngreso}, con un salario mensual de {salario} y jornada {jornadaHabitual}." },
  { id: "g2c", sec: "II", titulo: "Residencia del trabajador", comp: true, tpl: "El trabajador vive en el municipio de {municipioTrabajador}, departamento de {departamentoTrabajador}." },
  { id: "g3", sec: "III", titulo: "El accidente", tpl: "El accidente ocurrió el día {fechaAccidente}, a las {horaAccidente}, en jornada {jornadaSucede}, cuando el trabajador {laborHabitual} estaba realizando su labor habitual y llevaba {tiempoLaborado} de trabajo ese día. Fue un accidente de tipo {tipoAccidente}. El accidente {causoMuerte} causó la muerte del trabajador. Ocurrió {accMismo} en el mismo municipio de la sede principal, en zona {zonaAccidente}; el lugar fue {lugar}, en el sitio {sitio}." },
  { id: "g3c", sec: "III", titulo: "Complemento del accidente", comp: true, tpl: "La labor que realizaba era {cualLabor}. El accidente ocurrió en el municipio de {municipioAccidente}, departamento de {departamentoAccidente}. El sitio fue {sitioOtro}." },
  { id: "g4", sec: "IV", titulo: "Descripción del accidente", long: true, tpl: "Descripción detallada del accidente: {descripcion}" },
  { id: "g3l", sec: "III", titulo: "Clasificación de la lesión", infer: true, tpl: "La lesión fue {tipoLesion}, en la parte del cuerpo {parteCuerpo}. El agente con el que se lesionó fue {agente} y el mecanismo del accidente fue {mecanismo}." },
  { id: "g3lc", sec: "III", titulo: "Otros (lesión / mecanismo)", comp: true, tpl: "La otra lesión fue {lesionOtro}. El otro mecanismo fue {mecanismoOtro}." },
  { id: "g5", sec: "IV", titulo: "Testigos", tpl: "{hayTestigos} hubo personas que presenciaron el accidente." },
  { id: "g5a", sec: "IV", titulo: "Primer testigo", comp: true, tpl: "El primer testigo es {testigo1Nombre}, identificado con {testigo1TipoId}, con el número {testigo1NumId}, con el cargo de {testigo1Cargo}. Aparte de esa persona, {hayTestigo2} hubo un segundo testigo." },
  { id: "g5b", sec: "IV", titulo: "Segundo testigo", comp: true, tpl: "El segundo testigo es {testigo2Nombre}, identificado con {testigo2TipoId}, con el número {testigo2NumId}, con el cargo de {testigo2Cargo}." },
  { id: "g6", sec: "V", titulo: "Responsable del informe", tpl: "Diligencia este informe {responsableNombre}, identificado con {responsableTipoId}, con el número {responsableNumId}, con el cargo de {responsableCargo}." }
];
const FIELD_BY_ID = {}; FURAT_FIELDS.forEach(f => { FIELD_BY_ID[f.id] = f; });
function parseTpl(tpl) {
  const parts = [], re = /\{(\w+)\}/g; let last = 0, m;
  while ((m = re.exec(tpl))) { if (m.index > last) parts.push({ t: "a", raw: tpl.slice(last, m.index) }); parts.push({ t: "s", id: m[1] }); last = re.lastIndex; }
  if (last < tpl.length) parts.push({ t: "a", raw: tpl.slice(last) });
  parts.forEach(p => { if (p.t === "a") p.toks = tokNorm(p.raw); });
  return parts;
}
GUIONES.forEach(g => { g.parts = parseTpl(g.tpl); g.slots = g.parts.filter(p => p.t === "s").map(p => p.id); });
const GUION_DE = {}; GUIONES.forEach(g => g.slots.forEach(id => { GUION_DE[id] = g; }));

/* Tokens crudos y normalizados con el mismo índice, para extraer valores conservando mayúsculas y acentos. */
function tokRaw(s) { return String(s).split(/\s+/).map(w => w.replace(/^[¿¡"'(«]+|[.,;:!?)"'»]+$/g, "")).filter(Boolean); }
function tokNorm(s) { return tokRaw(s).map(w => normTxt(w)); }
function lev1(a, b) { if (Math.abs(a.length - b.length) > 1) return false; let i = 0, j = 0, d = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++d > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return d + (a.length - i) + (b.length - j) <= 1; }
function tokEq(a, b) { return a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) || (a.length >= 5 && b.length >= 5 && lev1(a, b)); }
function matchAnchorAt(T, s, toks) {
  let k = 0, i = s, matched = 0, last = -1, miss = 0;
  while (i < T.length && k < toks.length) {
    if (tokEq(T[i], toks[k])) { matched++; last = i; i++; k++; miss = 0; }
    else if (k + 1 < toks.length && tokEq(T[i], toks[k + 1])) { k++; }
    else { i++; if (++miss > 2) break; }
  }
  return { matched, start: s, end: last + 1, ratio: matched / toks.length };
}
function findAnchor(T, toks, from) {
  if (!toks.length) return null;
  const need = toks.length === 1 ? 1 : 2; let best = null;
  for (let s = from; s < T.length; s++) {
    if (!tokEq(T[s], toks[0]) && !(toks.length > 1 && tokEq(T[s], toks[1]))) continue;
    const r = matchAnchorAt(T, s, toks);
    if (r.ratio >= 0.6 && r.matched >= need && (!best || r.matched > best.matched)) { best = r; if (r.ratio === 1) break; }
  }
  return best;
}
/* Alinea la lectura con el guion: devuelve los valores de los espacios delimitados por anclas encontradas. */
function guionTplActivo(g) { return g.tpl.split(/(?<=\.)\s+/).filter(fr => { const ids = (fr.match(/\{(\w+)\}/g) || []).map(x => x.slice(1, -1)); return !ids.length || ids.some(id => FIELD_BY_ID[id] && furatApplicable(FIELD_BY_ID[id])); }).join(" "); }
function guionParts(g) { return parseTpl(guionTplActivo(g)); }
function splitPair(aId, bId, R, from, to) {
  const fa = FIELD_BY_ID[aId], fb = FIELD_BY_ID[bId]; if (!fa || !fb) return null;
  const T = R.slice(from, to); if (T.length < 2) return null;
  if (fa.type === "enum" || fa.type === "bool") {
    const cand = fa.type === "bool" ? [["si"], ["no"]] : OPT[fa.opts].map(o => o.s.map(x => x.split(" ")));
    let best = 0;
    cand.forEach(list => list.forEach(sy => { const k = Array.isArray(sy) ? sy.length : 1; const seg = T.slice(0, k).map(w => normTxt(w)).join(" "); const syn = Array.isArray(sy) ? sy.join(" ") : sy; if (k <= T.length - 1 && seg === syn && k > best) best = k; }));
    if (best) return { a: T.slice(0, best).join(" "), b: T.slice(best).join(" ") };
  }
  if (fb.type === "digits" || fb.type === "money") { const k = T.findIndex(w => /\d/.test(normTxt(wordsToNumbers(w)))); if (k > 0) return { a: T.slice(0, k).join(" "), b: T.slice(k).join(" ") }; }
  return null;
}
function alignReading(text, g) {
  const R = tokRaw(text), T = R.map(w => normTxt(w)), slots = {}, out = { anchors: 0, strong: 0, slots, trailing: null };
  let cursor = 0, open = null, start = 0, pair = null, prevSlot = null;
  guionParts(g).forEach(p => {
    if (p.t === "s") { prevSlot = p.id; if (open && !pair) { pair = { a: open, start }; open = p.id; } else if (!open) { open = p.id; start = cursor; } return; }
    if (!p.toks.length) return;
    if (p.toks.length === 1 && !out.anchors) return;
    const r = findAnchor(T, p.toks, cursor); if (!r) return;
    const first = out.anchors === 0;
    out.anchors++; if (r.matched >= 4) out.strong++;
    if (first && r.start > 0 && r.start <= 10 && prevSlot && !(open === prevSlot && !pair && start === 0 && prevSlot === guionParts(g).find(x => x.t === "s").id)) { slots[prevSlot] = R.slice(0, r.start).join(" "); }
    else if (pair && open) { const sp = splitPair(pair.a, open, R, pair.start, r.start); if (sp) { slots[pair.a] = sp.a; slots[open] = sp.b; } }
    else if (open && r.start > start) slots[open] = R.slice(start, r.start).join(" ");
    pair = null; open = null; cursor = r.end;
  });
  if (open && cursor < R.length) { if (pair) { const sp = splitPair(pair.a, open, R, pair.start, R.length); if (sp) { slots[pair.a] = sp.a; out.trailing = { id: open, text: sp.b }; } else if (pair.start < R.length) out.trailing = { id: pair.a, text: R.slice(pair.start).join(" ") }; } else out.trailing = { id: open, text: R.slice(start).join(" ") }; }
  return out;
}

/* ---------- Analizadores de voz (español, Colombia) ---------- */
const NUMW = { cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiun: 21, veintiuno: 21, veintiuna: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200, doscientas: 200, trescientos: 300, trescientas: 300, cuatrocientos: 400, cuatrocientas: 400, quinientos: 500, quinientas: 500, seiscientos: 600, seiscientas: 600, setecientos: 700, setecientas: 700, ochocientos: 800, ochocientas: 800, novecientos: 900, novecientas: 900 };
const MULTW = { mil: 1000, millon: 1e6, millones: 1e6 };
function isNumW(t) { return NUMW[t] !== undefined || MULTW[t] !== undefined; }
/* Convierte números hablados a cifras. "uno cero dos tres" (dígito a dígito) se concatena; "treinta y cinco mil" se calcula. */
function expandDobles(toks) {
  const out = [], rep = { doble: 2, triple: 3 };
  for (let i = 0; i < toks.length; i++) { const k = rep[toks[i]], nx = toks[i + 1]; const d = nx === undefined ? null : (/^\d$/.test(nx) ? nx : (NUMW[nx] !== undefined && NUMW[nx] <= 9 ? String(NUMW[nx]) : null)); if (k && d !== null) { out.push(d.repeat(k)); i++; } else out.push(toks[i]); }
  return out;
}
function wordsToNumbers(text) {
  const toks = expandDobles(normTxt(text).replace(/(?<=\d)['’](?=\d{3}\b)/g, "").replace(/[.,](?=\d{3}\b)/g, "").split(/\s+/).filter(Boolean)), out = [];
  let i = 0;
  while (i < toks.length) {
    if (!isNumW(toks[i])) { out.push(toks[i]); i++; continue; }
    /* Una cifra en dígitos («600») se une a la corrida solo si le sigue un multiplicador («mil»).
       Dos palabras numéricas seguidas SIN «y» solo se suman tras una centena o un multiplicador
       («ciento veinte», «mil novecientos»); «siete veintinueve» es dictado y se separa en 7 29. */
    let j = i; const run = []; let viaY = false, prev = null;
    while (j < toks.length) {
      const tk = toks[j];
      if (tk === "y" && j + 1 < toks.length && NUMW[toks[j + 1]] !== undefined && run.length) { viaY = true; j++; continue; }
      const esDig = /^\d+$/.test(tk) && j + 1 < toks.length && MULTW[toks[j + 1]] !== undefined;
      if (!isNumW(tk) && !esDig) break;
      if (run.length && !viaY && prev !== null && NUMW[tk] !== undefined && NUMW[prev] !== undefined) {
        const a = NUMW[prev], b = NUMW[tk];
        if (!(a >= 100 || (a <= 9 && b <= 9))) break;
      }
      run.push(tk); prev = tk; viaY = false; j++;
    }
    if (run.length >= 3 && run.every(t => NUMW[t] !== undefined && NUMW[t] <= 9)) { out.push(run.map(t => String(NUMW[t])).join("")); i = j; continue; }
    let total = 0, cur = 0;
    if (MULTW[run[0]] && out.length && /^\d+$/.test(out[out.length - 1])) cur = Number(out.pop());
    run.forEach(t => { if (NUMW[t] !== undefined) cur += NUMW[t]; else if (/^\d+$/.test(t)) cur += Number(t); else { cur = (cur || 1) * MULTW[t]; total += cur; cur = 0; } });
    out.push(String(total + cur)); i = j;
  }
  return out.join(" ");
}
const MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
const DIAS = ["DO", "LU", "MA", "MI", "JU", "VI", "SA"], DIAS_L = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
function fmtDate(d) { return String(d.d).padStart(2, "0") + "/" + String(d.m).padStart(2, "0") + "/" + d.y; }
function parseDate(text, field) {
  const n = wordsToNumbers(text).replace(/\bprimero\b/g, "1"), hoy = new Date();
  const rel = { hoy: 0, ayer: 1, anteayer: 2, antier: 2 }; let d = null;
  for (const k in rel) if (new RegExp("\\b" + k + "\\b").test(n)) { const t = new Date(hoy); t.setDate(t.getDate() - rel[k]); d = { d: t.getDate(), m: t.getMonth() + 1, y: t.getFullYear() }; }
  if (!d) {
    let m = n.match(/\b(\d{1,2})\s*(?:de\s+|del\s+|\/|-)\s*([a-z]+|\d{1,2})\s*(?:de\s+|del\s+|\/|-)?\s*(\d{4}|\d{2})?\b/);
    if (m) { const mo = /^\d+$/.test(m[2]) ? Number(m[2]) : MESES[m[2]]; if (mo) { let y = m[3] ? Number(m[3]) : hoy.getFullYear(); if (y < 100) y += (y + 2000 > hoy.getFullYear() ? 1900 : 2000); d = { d: Number(m[1]), m: mo, y }; if (!m[3] && new Date(y, mo - 1, d.d) > hoy) d.y = y - 1; } }
  }
  if (!d) return { ok: false, msg: "No reconocí la fecha. Dímela como «15 de agosto de 2026»." };
  const dt = new Date(d.y, d.m - 1, d.d);
  if (dt.getMonth() !== d.m - 1 || dt.getDate() !== d.d || d.y < 1900) return { ok: false, msg: "Esa fecha no existe. ¿Puedes repetirla?" };
  if (field.past && dt > hoy) return { ok: false, msg: "Esa fecha está en el futuro. ¿Puedes confirmarla?" };
  return { ok: true, value: d, text: fmtDate(d) };
}
/* Para horas: convierte palabras numéricas a cifras token por token, SIN fusionar «dos y veinte» en 22.
   Solo une decenas + unidad («cuarenta y cinco» → 45), que es como se hablan los minutos. */
function timeDigits(text) {
  const toks = normTxt(text).split(/\s+/).filter(Boolean), out = [];
  for (let i = 0; i < toks.length; i++) {
    const v = NUMW[toks[i]];
    if (v === undefined) { out.push(toks[i]); continue; }
    const u = toks[i + 2] !== undefined ? NUMW[toks[i + 2]] : undefined;
    if (v >= 20 && v <= 50 && v % 10 === 0 && toks[i + 1] === "y" && u !== undefined && u >= 1 && u <= 9) { out.push(String(v + u)); i += 2; }
    else out.push(String(v));
  }
  return out.join(" ");
}
function parseTime(text) {
  const n = timeDigits(text);
  if (/\bmediodia\b/.test(n)) return { ok: true, value: { h: 12, m: 0 }, text: "12:00" };
  if (/\bmedianoche\b/.test(n)) return { ok: true, value: { h: 0, m: 0 }, text: "00:00" };
  const m = n.match(/\b(\d{1,2})(?:\s*[:h.]\s*(\d{1,2}))?\b/); if (!m) return { ok: false, msg: "No reconocí la hora. Dímela como «a las dos y media de la tarde» o «14:30»." };
  let h = Number(m[1]), mi = m[2] ? Number(m[2]) : 0;
  const rest = n.slice(m.index + m[0].length);
  if (!m[2]) { let mm;
    if (/\by media\b/.test(rest)) mi = 30;
    else if (/\by cuarto\b/.test(rest)) mi = 15;
    else if (/\bmenos cuarto\b/.test(rest)) { h -= 1; mi = 45; }
    else if ((mm = rest.match(/\bmenos\s+(\d{1,2})\b/))) { h -= 1; mi = 60 - Number(mm[1]); }
    else if ((mm = rest.match(/\by\s+(\d{1,2})\b/))) mi = Number(mm[1]); }
  if (/\b(pm|p m|tarde|noche)\b/.test(n)) { if (h < 12) h += 12; else if (h === 12 && /\bnoche\b/.test(n)) h = 0; }
  if (/\b(am|a m|madrugada|manana)\b/.test(n) && h === 12) h = 0;
  if (h > 23 || mi > 59 || mi < 0 || h < 0) return { ok: false, msg: "La hora debe estar entre 0 y 23 horas. ¿Puedes repetirla?" };
  return { ok: true, value: { h, m: mi }, text: String(h).padStart(2, "0") + ":" + String(mi).padStart(2, "0") };
}
function parseDur(text, mode) {
  const n = wordsToNumbers(text).replace(/\bmedia hora\b/, "30 minutos").replace(/\bun (ano|año|mes|dia|hora|minuto)\b/g, "1 $1");
  let a = 0, b = 0, hit = false, fin = 0;
  const re = /(\d+)\s*(anos?|años?|meses|mes|semanas?|dias?|horas?|minutos?|min)\b(\s*y\s*medi[oa])?/g; let m;
  while ((m = re.exec(n))) { hit = true; fin = re.lastIndex; const v = Number(m[1]), u = m[2], half = !!m[3];
    if (mode === "MD") { if (/^a[nñ]o/.test(u)) a += v * 12 + (half ? 6 : 0); else if (/^mes/.test(u)) a += v + (half ? 0.5 : 0); else if (/^semana/.test(u)) b += v * 7 + (half ? 3 : 0); else if (/^dia/.test(u)) b += v; }
    else { if (/^hora/.test(u)) { a += v; if (half) b += 30; } else if (/^min/.test(u)) b += v; } }
  if (hit) { /* Cola sin unidad tras el último tramo: «tres horas y veinte» → +20 min; «y cuarto» → +15. */
    const cola = n.slice(fin).match(/^\s*y\s+(\d{1,3})\b/);
    if (cola) b += Number(cola[1]);
    else if (mode !== "MD" && /^\s*y\s+cuarto\b/.test(n.slice(fin))) b += 15; }
  if (!hit) { const only = n.match(/\b(\d+)\b/); if (only) { hit = true; if (mode === "MD") a = Number(only[1]); else a = Number(only[1]); } }
  if (!hit) return { ok: false, msg: mode === "MD" ? "Dime el tiempo en años, meses o días (por ejemplo: «dos años y tres meses»)." : "Dime las horas y minutos (por ejemplo: «tres horas y media»)." };
  if (mode === "MD") { const td = Math.round(a * 30) + b, meses = Math.floor(td / 30), dias = td % 30; return { ok: true, value: { meses, dias }, text: meses + " mes" + (meses === 1 ? "" : "es") + (dias ? " y " + dias + " día" + (dias === 1 ? "" : "s") : "") }; }
  a += Math.floor(b / 60); b = b % 60; return { ok: true, value: { horas: a, minutos: b }, text: a + " h " + String(b).padStart(2, "0") + " min" };
}
function parseDigits(text, field) {
  const d = wordsToNumbers(text).replace(/\D/g, "");
  if (d.length < (field.min || 4)) return { ok: false, msg: "No alcancé a captar el número completo. Dímelo dígito por dígito." };
  return { ok: true, value: d, text: d };
}
function parseMoney(text) {
  const n = wordsToNumbers(text); const m = n.match(/\d[\d]*/g);
  if (!m) return { ok: false, msg: "Dime el valor en pesos (por ejemplo: «un millón seiscientos mil»)." };
  const v = Math.max(...m.map(Number)); if (v < 1000) return { ok: false, msg: "Ese valor parece muy bajo para un salario mensual. ¿Puedes repetirlo en pesos?" };
  return { ok: true, value: v, text: "$ " + v.toLocaleString("es-CO") };
}
function parseBool(text) {
  const n = " " + normTxt(text) + " ";
  if (/ (si|sí|afirmativo|claro|correcto|cierto|asi es|exacto|por supuesto|verdad) /.test(n) && !/ no /.test(n)) return { ok: true, value: true, text: "Sí" };
  if (/ (no|negativo|falso|para nada) /.test(n)) return { ok: true, value: false, text: "No" };
  return { ok: false, msg: "Respóndeme *sí* o *no*." };
}
function matchEnum(text, key) {
  const n = " " + normTxt(text).replace(/[.,;!?()]/g, " ").replace(/\s+/g, " ") + " ";
  const rx = s => new RegExp("(^|\\s)" + s.replace(/[.*+?^${}|[\]\\]/g, "\\$&") + "(s|es)?(?=\\s|$)");
  return OPT[key].map(o => {
    let sc = 0, w = n;
    o.s.slice().sort((a, b) => b.length - a.length).forEach(s => { const r = rx(s); if (r.test(w)) { sc += s.length + 2; w = w.replace(r, " # "); } });
    return { o, sc };
  }).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc);
}
function parseEnum(text, field) {
  const r = matchEnum(text, field.opts);
  if (!r.length) return { ok: false, msg: "No encontré esa opción. " + listOpts(field.opts) };
  if (r.length > 1 && r[0].o.c !== r[1].o.c && r[1].sc / r[0].sc >= 0.8) return { ok: false, msg: "Entendí dos opciones: *" + r[0].o.l + "* y *" + r[1].o.l + "*. ¿Cuál es?" };
  return { ok: true, value: r[0].o.c, text: r[0].o.l };
}
function parseMulti(text, field) {
  const n = normTxt(text); let r = matchEnum(text, field.opts);
  if (field.opts === "parteCuerpo" && /\bdedos?\b/.test(n) && !/\bpie/.test(n)) r = r.filter(x => x.o.c !== "5.56");
  if (!r.length) return { ok: false, msg: "No encontré esa opción. " + listOpts(field.opts) };
  const vals = r.map(x => x.o.c).filter((c, i, a) => a.indexOf(c) === i);
  return { ok: true, value: vals, text: vals.map(c => optLabel(field.opts, c)).join(" + ") };
}
function parseEmail(text) {
  const n = normTxt(text).replace(/\barroba\b/g, "@").replace(/\bpunto\b/g, ".").replace(/\bguion bajo\b/g, "_").replace(/\bguion\b/g, "-").replace(/\s+/g, "");
  if (/no (tiene|hay|tenemos|registra)|notiene|nohay/.test(n.replace(/\s/g, ""))) return { ok: true, value: "No registra", text: "No registra" };
  if (!/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(n)) return { ok: false, msg: "No reconocí el correo. Dilo como «juan punto perez arroba gmail punto com», o di «no tiene»." };
  return { ok: true, value: n, text: n };
}
function titleCase(s) { const low = ["de", "del", "la", "las", "los", "y", "e", "da", "do"]; return normSpaces(s).toLowerCase().split(" ").map((w, i) => (i && low.includes(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" "); }
function normSpaces(s) { return String(s).replace(/\s+/g, " ").trim(); }
function parseText(text, field) {
  const t = normSpaces(text); if (t.length < 2) return { ok: false, msg: "No alcancé a escuchar. ¿Puedes repetirlo?" };
  if (field.opt && /^(no (tiene|hay|aplica|registra)|ninguno|ninguna)$/.test(normTxt(t))) return { ok: true, value: "No registra", text: "No registra" };
  const v = field.type === "name" ? titleCase(t) : field.type === "address" ? normSpaces(wordsToNumbers(t)).replace(/\bnumero\b/g, "No.").replace(/\s*\bguion\b\s*/g, "-").replace(/\b(\w)/, c => c.toUpperCase()) : t.charAt(0).toUpperCase() + t.slice(1);
  return { ok: true, value: v, text: v };
}
function optLabel(key, c) { const o = OPT[key].find(x => x.c === c); return o ? o.l : c; }
function listOpts(key) { return "Opciones: " + OPT[key].map(o => "*" + o.l.split(" (")[0] + "*").join(", ") + "."; }
function parseAnswer(field, text) {
  switch (field.type) {
    case "date": return parseDate(text, field);
    case "time": return parseTime(text);
    case "durMD": return parseDur(text, "MD");
    case "durHM": return parseDur(text, "HM");
    case "digits": return parseDigits(text, field);
    case "money": return parseMoney(text);
    case "bool": return parseBool(text);
    case "enum": return parseEnum(text, field);
    case "multi": return parseMulti(text, field);
    case "email": return parseEmail(text);
    case "long": { const t = normSpaces(text); return t.length < 15 ? { ok: false, msg: "Necesito una descripción más completa: qué hacía, qué lo causó y qué lesión sufrió." } : { ok: true, value: t.charAt(0).toUpperCase() + t.slice(1), text: t }; }
    default: return parseText(text, field);
  }
}

/* ---------- Voz: Web Speech API (es-CO) ----------
   Sesiones cortas encadenadas: cada frase del usuario es una sesión no continua; al terminar, Chrome entrega el resultado
   final y el app abre la siguiente sesión de inmediato. Sin temporizadores ni resultados intermedios como respuesta.
   El permiso se pide una vez: la captura de audio de getUserMedia se mantiene abierta durante toda la entrevista. */
const Voice = {
  rec: null, on: false, wanted: false, handsFree: false, final: "", primed: false, stream: null, fatal: false, restarts: 0, tries: 0, onResult: null, onState: null, held: null, log: [], lastErr: "", guard: null,
  supported() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
  isFile() { return location.protocol === "file:"; },
  /* Los números largos (cédulas, teléfonos) se enmascaran en la bitácora: el diagnóstico se muestra en el chat. */
  note(ev, detail) { const h = new Date(); this.log.push(String(h.getHours()).padStart(2, "0") + ":" + String(h.getMinutes()).padStart(2, "0") + ":" + String(h.getSeconds()).padStart(2, "0") + " " + ev + (detail ? " · " + String(detail).replace(/\d{5,}/g, d => d.slice(0, 2) + "···").slice(0, 70) : "")); if (this.log.length > 80) this.log.shift(); },
  async prime() {
    if (this.primed) return true;
    try { if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) { this.stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } this.primed = true; this.note("mic", "permiso concedido"); return true; }
    catch (e) { this.primed = false; this.lastErr = e && e.name ? e.name : "getUserMedia"; this.note("mic-error", this.lastErr); if (this.onState) this.onState("error", e && e.name === "NotAllowedError" ? "not-allowed" : "no-mic"); return false; }
  },
  ensure() {
    if (this.rec) return this.rec;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return null;
    const rec = new SR(); rec.lang = "es-CO"; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    rec.onstart = () => { this.on = true; this.tries = 0; this.note("start"); if (this.onState) this.onState("start", ""); };
    rec.onresult = e => {
      let interim = "", finals = [];
      for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript.trim(); if (!t) continue; if (e.results[i].isFinal) finals.push(t); else interim += t; }
      if (finals.length) { this.final = (this.final ? this.final + " " : "") + finals.join(" "); this.note("final", this.final); }
      if (this.onState) this.onState("interim", (this.final + " " + interim).trim());
    };
    rec.onerror = e => { const err = e.error || "error"; this.lastErr = err; this.note("error", err);
      if (err === "no-speech" || err === "aborted") return;
      if (err === "not-allowed" || err === "service-not-allowed" || err === "audio-capture" || err === "network" || err === "language-not-supported") { this.fatal = true; this.wanted = false; }
      if (this.onState) this.onState("error", err); };
    rec.onend = () => {
      this.on = false; const t = this.final.trim(); this.final = ""; this.note("end", t ? "→ entrega" : "sin texto");
      if (t) this.deliver(t);
      if (this.wanted && !this.fatal && this.restarts < 400) { this.restarts++; if (this.onState) this.onState("restart", ""); setTimeout(() => this.tryStart(), 120); }
      else { const era = this.wanted; this.wanted = false; if (this.onState) this.onState(era ? "off" : "end", ""); }
    };
    this.rec = rec; return rec;
  },
  tryStart() {
    if (!this.wanted || this.on) return;
    try { this.rec.start(); this.tries = 0; }
    catch (e) { this.tries++; this.note("start-retry", e && e.name); if (this.tries <= 6) setTimeout(() => this.tryStart(), 350); else { this.wanted = false; if (this.onState) this.onState("off", ""); } }
  },
  start() { const rec = this.ensure(); if (!rec) return false; this.wanted = true; this.fatal = false; this.tries = 0; this.restarts = 0; this.tryStart();
    if (!this.guard) this.guard = setInterval(() => { if (this.wanted && !this.on && !this.fatal) { this.note("guard", "rearme"); this.tryStart(); } }, 1500);
    return true; },
  stop() { this.wanted = false; this.final = ""; if (this.rec && this.on) { try { this.rec.stop(); } catch (e) { /* ya detenido */ } } else if (this.onState) this.onState("end", ""); },
  release() { this.stop(); if (this.guard) { clearInterval(this.guard); this.guard = null; } this.held = null; if (this.stream) { try { this.stream.getTracks().forEach(t => t.stop()); } catch (e) { /* sin pistas */ } this.stream = null; this.primed = false; } },
  deliver(t) { if (!F.cur) { this.held = { t, at: Date.now() }; this.note("held", t); if (this.onState) this.onState("wait", ""); return; } if (this.onResult) this.onResult(t); },
  takeHeld() { const h = this.held; this.held = null; if (h && Date.now() - h.at < 8000 && F.cur && this.onResult) this.onResult(h.t); },
  diagnostico() {
    const sup = this.supported(), ua = navigator.userAgent, nav = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "otro";
    const pistas = [];
    if (!sup) pistas.push("Este navegador no tiene reconocimiento de voz: usa Chrome o Edge.");
    if (this.lastErr === "network") pistas.push("Error «network»: el reconocimiento de Chrome se procesa en Google y necesita internet; en Chromium/Brave sin claves de API falla siempre.");
    if (this.lastErr === "not-allowed" || this.lastErr === "NotAllowedError") pistas.push("Permiso de micrófono denegado: candado en la barra de dirección → Micrófono → Permitir, y recarga.");
    if (this.lastErr === "audio-capture" || this.lastErr === "NotFoundError") pistas.push("No se encontró micrófono o está en uso exclusivo por otra aplicación.");
    if (this.log.some(l => /\bstart\b/.test(l)) && !this.log.some(l => /\bfinal\b/.test(l))) pistas.push("La sesión arranca pero nunca llega texto: revisa que Chrome use el micrófono correcto (candado → Micrófono) y que el nivel de entrada del sistema no esté en cero.");
    return { nav, sup, origen: location.protocol.replace(":", ""), estado: this.on ? "escuchando" : (this.wanted ? "reconectando" : "apagado"), primed: this.primed, ultimoError: this.lastErr || "ninguno", eventos: this.log.slice(-14), pistas };
  }
};

/* ---------- Flujo del modo guion ---------- */
function guionBlanks(g) { return g.slots.map(id => FIELD_BY_ID[id]).filter(f => furatApplicable(f)); }
function guionHint(f) { if (f.type === "enum" || f.type === "multi") return OPT[f.opts].map(o => o.l.split(" (")[0]).join(" / "); if (f.type === "bool") return "sí / no"; if (f.type === "date") return "día, mes y año"; if (f.type === "time") return "hora (0–23)"; if (f.type === "durMD") return "años, meses o días"; if (f.type === "durHM") return "horas y minutos"; if (f.type === "money") return "pesos"; if (f.type === "digits") return "número"; if (f.type === "email") return "«arroba», «punto»"; return ""; }
function renderGuion(g) {
  const blanks = guionBlanks(g), num = {}; blanks.forEach((f, i) => { num[f.id] = i + 1; });
  let html = ""; guionParts(g).forEach(p => {
    if (p.t === "a") { html += esc(p.raw); return; }
    const f = FIELD_BY_ID[p.id]; if (!furatApplicable(f)) return;
    const v = F.ans[p.id] !== undefined ? (F.meta[p.id] ? F.meta[p.id].text : String(F.ans[p.id])) : "";
    html += '<span class="g-b' + (v ? " ok" : "") + '" data-id="' + p.id + '">' + (v ? esc(v) : '<em class="g-g">(' + esc(GUIA[p.id] || f.label.split(" (")[0].toLowerCase()) + ')</em>') + '</span>';
  });
  const principales = GUIONES.filter(x => !x.comp), k = principales.indexOf(g);
  const tit = (g.comp ? "Complemento · " : "Guion " + (k + 1) + " de " + principales.length + " · ") + g.titulo;
  const instr = g.infer ? "Lo pre-llené con tu descripción. Verifícalo y di <b>«correcto»</b>, o corrige un dato nombrándolo: «mecanismo: caída de objetos»." : g.long ? "Describe el accidente con calma: qué hacía la persona, qué lo causó y qué lesión sufrió. Cuando termines, haz una pausa." : "Léelo en voz alta diciendo el dato que va en cada espacio de color, o dicta solo los datos en orden con una pausa corta entre uno y otro. Para uno puntual nómbralo («teléfono: 310…»); si no lo tienes, di «omitir».";
  return '<div class="wa-bubble in guion" id="guion-' + g.id + '"><div class="g-t">📝 ' + esc(tit) + '</div><p class="g-p">' + html + '</p><div class="g-i">' + instr + '</div><span class="wa-meta">' + hora().full + '</span></div>';
}
async function furatGuion(g, run) {
  if (g.infer && F.infer) { Object.keys(F.infer).forEach(id => { if (F.ans[id] === undefined && furatApplicable(FIELD_BY_ID[id])) { F.ans[id] = F.infer[id].value; F.meta[id] = { text: F.infer[id].text, src: "inferido" }; } }); F.infer = null; }
  if (g.sec !== F.sec) { F.sec = g.sec; const pill = document.createElement("div"); pill.className = "day-pill sec"; pill.textContent = FURAT_SEC[g.sec]; ui.chat.appendChild(pill); }
  F.cur = { type: "guion", g, id: "__guion" }; F.tries = 0; F.cont = true; F.flushMs = g.long ? 2200 : 1500;
  const row = document.createElement("div"); row.className = "wa-row in"; row.innerHTML = renderGuion(g); ui.chat.appendChild(row); scrollChat();
  if (S.speed > 0) await sleep(300 * S.speed);
  guionFocus(g);
}
function guionNext(g) { return guionBlanks(g).find(f => F.ans[f.id] === undefined && !F.pending.includes(f.id)); }
function guionFocus(g) {
  const el = $("guion-" + g.id); if (!el) return;
  el.querySelectorAll(".g-b").forEach(b => b.classList.remove("cur"));
  const f = guionNext(g); if (f) { const b = el.querySelector('.g-b[data-id="' + f.id + '"]'); if (b) b.classList.add("cur"); $("txtIn").placeholder = "Ahora: " + (GUIA[f.id] || f.label.split(" (")[0]).split(" / ").slice(0, 3).join(" / ") + (Voice.wanted ? " (habla)" : ""); }
  else $("txtIn").placeholder = g.infer ? "Di «correcto» para continuar" : "Listo; continúo…";
  Voice.takeHeld();
}
function guionPaint(g, id) {
  const el = $("guion-" + g.id); if (!el) return; const b = el.querySelector('.g-b[data-id="' + id + '"]'); if (!b) return;
  const guia = '<em class="g-g">(' + esc(GUIA[id] || FIELD_BY_ID[id].label.split(" (")[0].toLowerCase()) + ')</em>';
  if (F.ans[id] !== undefined) { b.className = "g-b ok"; b.innerHTML = esc(F.meta[id] ? F.meta[id].text : String(F.ans[id])); }
  else if (F.pending.includes(id)) { b.className = "g-b skip"; b.innerHTML = "(pendiente)"; }
  else { b.className = "g-b bad"; b.innerHTML = guia; }
}
function stripGuide(f, text) {
  const gu = GUIA[f.id]; if (!gu || gu.includes("/")) return text;
  const n = normTxt(text).replace(/[,:]/g, " ").replace(/\s+/g, " ").trim(), gn = normTxt(gu).replace(/[«»,]/g, " ").replace(/\s+/g, " ").trim();
  if (n.startsWith(gn)) { let rest = text.trim().slice(gu.length).replace(/^[\s:,]*(es|son|fue|de)?[\s:,]*/i, ""); if (rest.length >= 2) return rest; }
  return text;
}
function guionFill(g, f, text, src) {
  text = stripGuide(f, String(text).replace(/^(es|son|fue|era)\s+/i, ""));
  const r = parseAnswer(f, text);
  if (r.ok) { F.ans[f.id] = r.value; F.meta[f.id] = { text: r.text, src: src === "voice-fin" ? "voice" : src }; if (f.id === "descripcion") { const inf = furatInfer(r.value); if (inf) F.infer = inf; } }
  else { delete F.ans[f.id]; }
  guionPaint(g, f.id); return r;
}
function guionGuia(f) { return "(" + (GUIA[f.id] || f.label.split(" (")[0].toLowerCase()) + ")"; }
function guionEstado(g) {
  const blanks = guionBlanks(g), llenos = blanks.filter(f => F.ans[f.id] !== undefined), faltan = blanks.filter(f => F.ans[f.id] === undefined && !F.pending.includes(f.id));
  const nx = guionNext(g);
  return { blanks, llenos, faltan, nx, msg: "Llevo *" + llenos.length + " de " + blanks.length + "* datos de este guion." + (faltan.length ? " Faltan: " + faltan.map(guionGuia).join(", ") + "." : "") + (nx ? " Dime ahora " + guionGuia(nx) + "." : (g.infer ? " Di *«correcto»* para continuar." : "")) };
}
async function furatGuionChunk(text, src) {
  const run = S.run, g = F.cur.g;
  bubble("out", (src === "voice" ? '<span class="mic-ic" aria-hidden="true">🎤</span> ' : "") + esc(text));
  try { await guionProcesar(g, text, src, run); }
  catch (e) { console.error(e); if (F.cur && F.cur.g === g && await say("Tuve un problema al procesar eso, pero seguimos. " + guionEstado(g).msg, run)) guionFocus(g); }
}
async function guionProcesar(g, text, src, run) {
  const n = normTxt(text).replace(/[.,;:!?¿¡]+$/, "").replace(/^[¿¡]+/, "").trim();
  if (F.phase === "confirm") { furatConfirmar(text, run); return; }
  const blanks = guionBlanks(g), cur = guionNext(g);
  if (/^(repetir|repite|repiteme|otra vez|que paso|que pasa|ayuda|que sigue|donde vamos|en que vamos|hola|no entiendo|\?)$/.test(n)) { if (await say(guionEstado(g).msg, run)) guionFocus(g); return; }
  if (g.long && cur) {
    const fin = /^(listo|termine|terminado|eso es todo|fin)$/.test(n);
    if (src === "voice" && !fin) { F.longBuf = (F.longBuf ? F.longBuf + " " : "") + text.trim(); clearTimeout(F.longTimer); F.longTimer = setTimeout(() => { if (F.cur && F.cur.g === g && F.longBuf) { const t = F.longBuf; F.longBuf = ""; guionProcesar(g, t, "voice-fin", run); } }, 3500); $("txtIn").placeholder = "Sigue describiendo; al terminar haz una pausa o di «listo»"; return; }
    if (F.longBuf) { text = F.longBuf + (fin ? "" : " " + text); F.longBuf = ""; clearTimeout(F.longTimer); }
    if (fin) { if (!text.trim()) { if (await say("Aún no tengo la descripción. Cuéntame qué pasó.", run)) guionFocus(g); return; } const rl = guionFill(g, cur, text, "voice"); if (!rl.ok) { if (await say(guionGuia(cur) + ": " + rl.msg, run)) guionFocus(g); return; } await guionAvanzar(g, run, "✅ Descripción registrada"); return; }
  }
  if (/^(correcto|todo correcto|esta bien|continuar|continua|siguiente|listo|es correcto)$/.test(n)) {
    blanks.forEach(f => { if (F.ans[f.id] === undefined && !F.pending.includes(f.id)) { F.pending.push(f.id); guionPaint(g, f.id); } });
    await guionTerminar(g, run); return;
  }
  if (cur && /^(omitir|omito|pasar|saltar|no se|no lo se|no lo tengo)\b/.test(n)) {
    if (cur.opt) { F.ans[cur.id] = "No registra"; F.meta[cur.id] = { text: "No registra", src }; } else F.pending.push(cur.id);
    guionPaint(g, cur.id); await guionAvanzar(g, run, "⏳ " + guionGuia(cur) + " queda pendiente; te lo pregunto al final."); return;
  }
  const tgt = n.match(/^(?:dato|espacio|numero|casilla|el dato|el espacio)\s+(\d+)[\s:,]+(.+)$/);
  if (tgt) { const f = blanks[Number(tgt[1]) - 1]; if (f) { const raw = text.trim().replace(/^[^\d]*\d+[\s:,]+/, ""); const r = guionFill(g, f, raw, src); if (!r.ok) { if (await say(guionGuia(f) + ": " + r.msg, run)) guionFocus(g); return; } await guionAvanzar(g, run, "✅ " + guionGuia(f) + " → *" + r.text + "*"); return; } }
  const alias = blanks.find(f => f !== cur && (FURAT_ALIAS[f.id] || []).some(a => n.startsWith(a + " ") || n.startsWith(a + ":")));
  if (alias && !g.long) { const a = (FURAT_ALIAS[alias.id] || []).filter(x => n.startsWith(x)).sort((x, y) => y.length - x.length)[0]; const raw = text.trim().slice(a.length).replace(/^[\s:,]+/, ""); if (raw && parseAnswer(alias, raw).ok) { const r = guionFill(g, alias, raw, src); await guionAvanzar(g, run, "✅ " + guionGuia(alias) + " → *" + r.text + "*"); return; } }
  if (!g.long) {
    const al = alignReading(text, g);
    if (al.anchors >= 2 || al.strong >= 1) {
      let ok = 0, malos = [];
      const intenta = (id, val) => { const f = FIELD_BY_ID[id]; if (!f || !furatApplicable(f) || (F.ans[id] !== undefined && F.meta[id] && F.meta[id].src !== "inferido")) return; const r = guionFill(g, f, val, src); if (r.ok) ok++; else malos.push(guionGuia(f)); };
      Object.keys(al.slots).forEach(id => intenta(id, al.slots[id]));
      if (al.trailing) intenta(al.trailing.id, al.trailing.text);
      const est = guionEstado(g);
      const msg = "Capté *" + ok + "* dato" + (ok === 1 ? "" : "s") + " de esa lectura." + (malos.length ? " No entendí: " + malos.join(", ") + "." : "") + " " + est.msg;
      if (await say(msg, run)) await guionAvanzar(g, run);
      return;
    }
  }
  if (!cur) { if (g.infer) { if (await say("Di *«correcto»* para continuar o corrige un dato nombrándolo.", run)) guionFocus(g); } else await guionTerminar(g, run); return; }
  if (["text", "name", "address", "long"].includes(cur.type) && tokRaw(text).length <= 2 && parseBool(text).ok) {
    const bools = blanks.filter(f => f !== cur && f.type === "bool" && F.ans[f.id] === undefined);
    if (bools.length === 1) { const rb = guionFill(g, bools[0], text, src); await guionAvanzar(g, run, "✅ Lo tomé como " + guionGuia(bools[0]) + " → *" + rb.text + "*"); return; }
  }
  const r = guionFill(g, cur, text, src);
  if (!r.ok) {
    const tipados = ["digits", "date", "time", "money", "email", "enum", "multi", "durMD", "durHM", "bool"];
    const cand = blanks.filter(f => f !== cur && F.ans[f.id] === undefined && tipados.includes(f.type) && parseAnswer(f, text).ok);
    if (cand.length === 1) { const r2 = guionFill(g, cand[0], text, src); await guionAvanzar(g, run, "✅ Lo tomé como " + guionGuia(cand[0]) + " → *" + r2.text + "*"); return; }
    F.tries++; if (await say(guionGuia(cur) + ": " + r.msg + (src === "text" || F.tries >= 2 ? " Estoy esperando " + guionGuia(cur) + "." : ""), run)) guionFocus(g); return;
  }
  await guionAvanzar(g, run, "✅ " + guionGuia(cur) + " → *" + r.text + "*");
}
async function guionAvanzar(g, run, ack) {
  if (run !== S.run) return;
  const nf = guionNext(g);
  if (nf) { if (ack) await say(ack + " · Ahora " + guionGuia(nf) + ".", run); guionFocus(g); return; }
  if (g.infer) { guionFocus(g); if (F.meta.tipoLesion && F.meta.tipoLesion.src === "inferido") await say((ack ? ack + " · " : "") + "Verifica la clasificación y di *«correcto»* para continuar.", run); else await guionTerminar(g, run, ack); return; }
  await guionTerminar(g, run, ack);
}
async function guionTerminar(g, run, ack) {
  F.gdone[g.id] = true; F.cur = null; F.cont = false; F.flushMs = 250; F.gbuf = ""; clearTimeout(F.gtimer);
  if (g.infer) Object.keys(F.meta).forEach(id => { if (F.meta[id].src === "inferido") F.meta[id].src = "inferido y confirmado"; });
  const llenos = guionBlanks(g).filter(f => F.ans[f.id] !== undefined).length, tot = guionBlanks(g).length;
  if (await say((ack ? ack + " · " : "") + "✅ " + g.titulo + ": " + llenos + " de " + tot + " dato" + (tot === 1 ? "" : "s") + ".", run)) furatAsk(run);
}

/* ---------- Estado y flujo de la entrevista ---------- */
const F = { ans: {}, meta: {}, pending: [], cur: null, tries: 0, phase: "idle", ronda: 0, sec: null, run: 0, cont: false, infer: null, modo: "guion", gdone: {}, gbuf: "", gtimer: null, flushMs: 250, identDone: false, emp: null, accidentado: null };
function furatMode(on) {
  const bar = $("inputbar"); bar.classList.toggle("voice", on);
  $("inputPh").hidden = on; $("txtIn").hidden = !on; $("micBtn").hidden = !on; $("sendBtn").hidden = on;
  if (!on) { Voice.release(); $("micBtn").classList.remove("listening"); $("txtIn").value = ""; }
}
function furatApplicable(f) { return !f.askIf || f.askIf(F.ans); }
function furatCopiar() { FURAT_FIELDS.forEach(f => { if (f.from && F.ans[f.id] === undefined) { const v = f.from(F.ans); if (v !== undefined) { F.ans[f.id] = v; F.meta[f.id] = { text: v, src: "copiado" }; } } }); }
function furatNext() { furatCopiar(); return FURAT_FIELDS.find(f => furatApplicable(f) && F.ans[f.id] === undefined && !F.pending.includes(f.id)); }
function furatProgress() { const ap = FURAT_FIELDS.filter(furatApplicable); const done = ap.filter(f => F.ans[f.id] !== undefined).length; return done + "/" + ap.length; }
async function furatStart(run) {
  F.ans = {}; F.meta = {}; F.pending = []; F.cur = null; F.tries = 0; F.phase = "ask"; F.ronda = 0; F.sec = null; F.run = run; F.infer = null; F.gdone = {}; F.gbuf = ""; F.flushMs = 250; clearTimeout(F.gtimer); F.longBuf = ""; clearTimeout(F.longTimer); clearTimeout(F.micTimer);
  F.identDone = false; F.emp = null; F.accidentado = null;
  $("sumPanel").hidden = true; $("hazCount").hidden = true; $("nivDist").hidden = true;
  const sup = Voice.supported(); Voice.handsFree = false;
  const intro = ["Vamos a diligenciar el *FURAT* (informe de accidente de trabajo). 🚑",
    "Yo te hago las preguntas por escrito y *tú respondes hablando*. Iré llenando cada casilla del formato con lo que digas.",
    "Si un dato no lo tienes a la mano, di *«omitir»* y te lo pregunto al final: el FURAT debe quedar *completo*. Di *«repetir»* para volver a leer una pregunta."];
  if (!sup) intro.push("⚠️ Este navegador no soporta reconocimiento de voz (usa Google Chrome o Microsoft Edge). Puedes escribir las respuestas.");
  else intro.push("Activa el micrófono una sola vez y permítelo cuando el navegador lo pida: quedará en *modo manos libres*. Habla solo cuando el botón del micrófono esté *en rojo*. 🎙️",
    "🔒 *Privacidad:* tu voz se convierte en texto con el servicio de reconocimiento del navegador (en Chrome y Edge el audio se procesa en servidores de Google). Si lo prefieres, puedes escribir cualquier respuesta.");
  if (!await say(intro, run)) return;
  if (!await say("¿Cómo prefieres diligenciarlo? Con *guiones* te muestro un párrafo por capítulo con espacios en blanco: lo lees en voz alta llenando los espacios (o dictas solo los datos) y yo extraigo la información. *Pregunta a pregunta* es más lento pero más guiado.", run)) return;
  options([{ t: "📝 Por guiones (más rápido)", v: "guion" }, { t: "❓ Pregunta a pregunta", v: "uno" }], run, op => {
    F.modo = op.v;
    if (!sup) { furatMode(true); furatAsk(run); return; }
    options([{ t: "🎙️ Activar micrófono" }], run, async () => {
      const okMic = await Voice.prime();
      if (run !== S.run) { Voice.release(); return; }
      Voice.handsFree = sup && okMic; furatMode(true); Voice.start();
      if (!okMic) { if (await say("No pude activar el micrófono. Revisa el permiso en el navegador (candado en la barra de dirección → Micrófono) o escribe las respuestas.", run)) furatAsk(run); return; }
      if (!await say("🎙️ Micrófono activo. Prueba rápida: di *«probando uno dos tres»* y espera mi respuesta.", run)) return;
      F.cur = { type: "mic", id: "__mic" }; F.micTimer = setTimeout(() => { if (F.cur && F.cur.id === "__mic") { F.cur = null; Voice.held = null; furatDiag("⚠️ En 12 segundos no me llegó ningún texto. Puedes escribir las respuestas mientras revisamos el micrófono.").then(() => furatAsk(run)); } }, 12000);
      furatListen("Di «probando uno dos tres»");
    });
  });
}
async function furatAsk(run) {
  if (run !== S.run) return;
  if (!F.identDone) { furatIdent(run); return; }
  const f = furatNext();
  if (!f) { furatRevisar(run); return; }
  if (f.from && f.from(F.ans) !== undefined) { F.ans[f.id] = f.from(F.ans); F.meta[f.id] = { text: f.from(F.ans), src: "copiado" }; furatAsk(run); return; }
  if (F.modo === "guion") { const g = GUION_DE[f.id]; if (g && !F.gdone[g.id]) { furatGuion(g, run); return; } }
  if (f.infer && F.infer && F.infer[f.id]) { furatProponer(run); return; }
  if (f.sec !== F.sec) { F.sec = f.sec; const pill = document.createElement("div"); pill.className = "day-pill sec"; pill.textContent = FURAT_SEC[f.sec]; ui.chat.appendChild(pill); }
  F.cur = f; F.tries = 0; F.cont = !!f.cont; F.flushMs = f.cont ? 2200 : 250;
  if (!await say(f.q + "  _(" + furatProgress() + ")_", run)) return;
  furatListen("Toca el micrófono y responde");
}
function furatListen(hint) { setTimeout(() => Voice.takeHeld(), 0); const hf = Voice.handsFree && Voice.wanted; $("txtIn").placeholder = hf ? (hint ? hint + " (habla)" : "Habla ahora…") : (hint || "Toca el micrófono y responde"); $("txtIn").value = ""; setHint(""); if (!hf) setStatus("en línea"); }
async function furatProponer(run) {
  const inf = F.infer, items = [];
  ["tipoLesion", "parteCuerpo", "agente", "mecanismo"].forEach(id => { if (inf[id] && F.ans[id] === undefined) items.push({ id, txt: inf[id].text }); });
  F.infer = null;
  if (!items.length) { furatAsk(run); return; }
  const f = { id: "__confirm", type: "bool", q: "Según tu descripción, entiendo:\n" + items.map(i => "• " + FURAT_FIELDS.find(x => x.id === i.id).label.split(" (")[0] + ": *" + i.txt + "*").join("\n") + "\n¿Es correcto? (sí / no)", items };
  F.cur = f; F.tries = 0; F.cont = false;
  if (!await say(f.q, run)) return;
  furatListen("Di «sí» o «no»");
}
function furatInfer(desc) {
  const out = {};
  FURAT_FIELDS.filter(f => f.infer).forEach(f => { const r = f.type === "multi" ? parseMulti(desc, f) : (() => { const m = matchEnum(desc, f.opts); return m.length ? { ok: true, value: m[0].o.c, text: m[0].o.l } : { ok: false }; })(); if (r.ok) out[f.id] = r; });
  return Object.keys(out).length ? out : null;
}
/* ---------- Conexión simulada con la base de datos de la ARL ---------- */
function clearActions() { ui.chat.querySelectorAll(".wa-actions").forEach(b => b.remove()); }
/* Registra un valor que viene de la base de la ARL, con el texto formateado según el tipo del campo. */
function furatSetDB(id, value) {
  const f = FIELD_BY_ID[id]; if (!f || value === undefined) return;
  let text;
  if (f.type === "date") text = fmtDate(value);
  else if (f.type === "money") text = "$ " + Number(value).toLocaleString("es-CO");
  else if (f.type === "enum") text = optLabel(f.opts, value);
  else if (f.type === "multi") text = value.map(c => optLabel(f.opts, c)).join(" + ");
  else if (f.type === "bool") text = value ? "Sí" : "No";
  else if (f.type === "durMD") text = value.meses + " mes" + (value.meses === 1 ? "" : "es") + (value.dias ? " y " + value.dias + " día" + (value.dias === 1 ? "" : "s") : "");
  else if (f.type === "durHM") text = value.horas + " h " + String(value.minutos).padStart(2, "0") + " min";
  else text = String(value);
  F.ans[id] = value; F.meta[id] = { text, src: "base ARL (simulada)" };
}
function furatBuscarCampo(q) {
  let best = null, sc = 0;
  FURAT_FIELDS.forEach(f => { if (!furatApplicable(f)) return; const names = (FURAT_ALIAS[f.id] || []).concat([normTxt(f.label)]); names.forEach(a => { if (q && (q.includes(a) || a.includes(q)) && a.length > sc) { sc = a.length; best = f; } }); });
  return best;
}
async function furatIdent(run) {
  F.cur = { id: "__ident", type: "ident" }; F.tries = 0;
  if (!await say(["Primero me conecto con la *base de datos de la ARL* para no preguntarte lo que ya está registrado. 🔎",
    "Dime el *NIT de la empresa* o la *cédula del empleador*, dígito por dígito. Si aún no estás en la base (demo), di *«omitir»* y diligenciamos todo el FURAT por voz."], run)) return;
  furatListen("NIT o cédula (o di «omitir»)");
}
async function furatIdentAnswer(n, text, run) {
  if (/^(omitir|omito|pasar|saltar|no estoy|no tengo|no aparezco|completo|manual)\b/.test(n)) { F.identDone = true; F.cur = null; if (await say("De acuerdo: diligenciamos todo el FURAT por voz. 📝", run)) furatAsk(run); return; }
  const d = wordsToNumbers(text).replace(/\D/g, "");
  if (d.length < 5) { if (await say("Necesito el *NIT* o la *cédula* completos, dígito por dígito (por ejemplo: «setenta y siete, doble cero, siete, veintinueve»). O di *«omitir»*.", run)) furatListen("NIT o cédula (o «omitir»)"); return; }
  if (!await say("Consultando la base de datos de la ARL… ⏳", run)) return;
  const e = arlBuscar(d);
  if (!e) { if (await say("No encontré el documento *" + d + "* en la base de la ARL (demo). Intenta con la cédula *7.700.729* o el NIT *900.703.762*, o di *«omitir»* para diligenciar todo por voz.", run)) furatListen("NIT o cédula (o «omitir»)"); return; }
  F.emp = e; F.identDone = true;
  const emp = e.empleador;
  if (!await say(["¡Bienvenido, *" + emp.nombres + " " + emp.apellidos + "*! 👋",
    "Encontré tu empresa: *" + e.empresa.razonSocial + "* (NIT " + e.empresa.numIdEmpresa + "), afiliada a *ARL SURA*, con *" + e.trabajadores.length + " personas* registradas.",
    "¿El accidente que vas a reportar es *tuyo* o de *uno de tus trabajadores*? Toca una opción, o dime el nombre o la cédula. 👇"], run)) return;
  F.cur = { id: "__quien", type: "quien" };
  options(e.trabajadores.map((t, i) => ({ t: t.icon + " " + (t.id === "empleador" ? "Es un accidente mío · " : "") + t.nombres + " " + t.apellidos + " · CC " + t.numIdTrabajador, i })), run,
    op => { if (F.cur && F.cur.id === "__quien") furatSeleccionar(e.trabajadores[op.i], run); });
  furatListen("Nombre o cédula del accidentado");
}
async function furatQuienAnswer(text, run) {
  const e = F.emp, n = normTxt(wordsToNumbers(text)), d = n.replace(/\D/g, ""), nw = new Set(n.split(/\s+/));
  let t = null;
  if (/\b(mio|mia|yo|propio)\b/.test(n)) t = e.trabajadores.find(x => x.id === "empleador");
  if (!t && d.length >= 5) t = e.trabajadores.find(x => x.numIdTrabajador === d) || null;
  if (!t) { const cand = e.trabajadores.filter(x => normTxt(x.nombres + " " + x.apellidos).split(" ").some(w => w.length >= 3 && nw.has(w))); if (cand.length === 1) t = cand[0]; }
  if (!t) { if (await say("No identifiqué a esa persona. Dime el *nombre* o la *cédula* de: " + e.trabajadores.map(x => "*" + x.nombres + " " + x.apellidos + "*").join(", ") + ".", run)) furatListen("Nombre o cédula"); return; }
  clearActions(); furatSeleccionar(t, run);
}
async function furatSeleccionar(t, run) {
  if (run !== S.run) return;
  F.cur = null; F.accidentado = t;
  const e = F.emp, emp = e.empleador;
  Object.keys(e.empresa).forEach(id => furatSetDB(id, e.empresa[id]));
  ["eps", "afp", "tipoVinculacion", "apellidos", "nombres", "tipoIdTrabajador", "numIdTrabajador", "fechaNacimiento", "sexo",
    "direccionTrabajador", "telefonoTrabajador", "viveMismo", "zonaTrabajador", "cargo", "ocupacionHabitual", "tiempoOcupacion",
    "fechaIngreso", "salario", "jornadaHabitual"].forEach(id => furatSetDB(id, t[id]));
  furatSetDB("arl", "ARL SURA");
  furatSetDB("responsableNombre", emp.apellidos + " " + emp.nombres); furatSetDB("responsableTipoId", emp.tipoId);
  furatSetDB("responsableNumId", emp.numId); furatSetDB("responsableCargo", emp.cargo);
  F.gdone.g0 = true; F.gdone.g2 = true; F.gdone.g6 = true;
  if (!await say(["Perfecto: el accidentado es *" + t.nombres + " " + t.apellidos + "* (CC " + t.numIdTrabajador + "). Descargué de la base de la ARL: 📥",
    "• *Empresa:* " + e.empresa.razonSocial + " · NIT " + e.empresa.numIdEmpresa + " · " + e.empresa.direccionEmpresa + ", " + e.empresa.municipioEmpresa +
    "\n• *Afiliaciones:* EPS " + t.eps + " · ARL SURA · AFP " + t.afp +
    "\n• *Persona:* nació el " + fmtDate(t.fechaNacimiento) + " · vive en " + t.direccionTrabajador + " · tel. " + t.telefonoTrabajador + " · cargo: " + t.cargo + " · salario " + F.meta.salario.text +
    "\n• *Responsable del informe:* " + emp.nombres + " " + emp.apellidos + " (quien reporta)"], run)) return;
  F.cur = { id: "__centro", type: "centro" };
  if (!await say("¿*" + t.nombres.split(" ")[0] + "* labora en la *sede principal* o en *otro centro de trabajo*?", run)) return;
  options([{ t: "🏢 Sede principal", v: "sede" }, { t: "📍 Otro centro de trabajo", v: "otro" }], run,
    op => { if (F.cur && F.cur.id === "__centro") furatCentroSet(op.v === "otro", run); });
  furatListen("«Sede principal» u «otro centro»");
}
async function furatCentroAnswer(n, run) {
  if (/(principal|sede|misma|unica|unico)/.test(n)) { clearActions(); furatCentroSet(false, run); return; }
  if (/(otro|otra|diferente|distinto)/.test(n)) { clearActions(); furatCentroSet(true, run); return; }
  if (await say("Dime *«sede principal»* u *«otro centro de trabajo»*.", run)) furatListen("«Sede principal» u «otro centro»");
}
async function furatCentroSet(otro, run) {
  if (run !== S.run) return;
  F.cur = null;
  if (!otro) { furatSetDB("centroNombre", F.emp.empresa.centroNombre); furatSetDB("centroMismo", true);
    if (!await say("Listo: centro de trabajo *" + F.emp.empresa.centroNombre + "*, con los datos de la sede descargados. ✅", run)) return; }
  else { delete F.ans.centroNombre; delete F.meta.centroNombre; furatSetDB("centroMismo", false);
    if (!await say("De acuerdo: en un momento te pregunto los datos de ese centro de trabajo. 📍", run)) return; }
  F.cur = { id: "__revisarBase", type: "revisar" };
  if (!await say("¿Los datos descargados están al día? Di *«continuar»*, o *«corregir»* y el dato (por ejemplo: «corregir salario»).", run)) return;
  furatListen("«Continuar» o «corregir …»");
}
async function furatRevisarBaseAnswer(n, text, run) {
  const mc = n.match(/corregir\s+(.+)/) || n.match(/^(?:cambiar|modificar)\s+(.+)/);
  if (mc) {
    const best = furatBuscarCampo(mc[1]);
    if (!best) { if (await say("¿Cuál dato quieres corregir? Di *«corregir»* y el nombre del campo (salario, dirección del trabajador, EPS…).", run)) furatListen("«Continuar» o «corregir …»"); return; }
    delete F.ans[best.id]; delete F.meta[best.id]; F.cur = null;
    if (await say("Corrijamos *" + best.label.split(" (")[0] + "*.", run)) furatAsk(run); return;
  }
  if (/^(continuar|continua|listo|correcto|todo correcto|si|ok|dale|seguir|sigue|adelante)\b/.test(n)) { F.cur = null; if (await say("Ahora sí: cuéntame del *accidente*. 🚑", run)) furatAsk(run); return; }
  if (await say("Di *«continuar»* para seguir, o *«corregir»* y el dato.", run)) furatListen("«Continuar» o «corregir …»");
}

async function furatDiag(pre) {
  const d = Voice.diagnostico();
  const cuerpo = (pre ? pre + "\n" : "") + "*Diagnóstico de voz* · " + d.nav + " · origen " + d.origen + " · estado: " + d.estado + " · último error: " + d.ultimoError + (d.pistas.length ? "\n" + d.pistas.map(x => "• " + x).join("\n") : "") + (d.eventos.length ? "\n_" + d.eventos.join(" · ") + "_" : "");
  return say(cuerpo, S.run);
}
async function furatAnswer(text, src) {
  const run = S.run; if (run !== F.run || !F.cur) return;
  const n0 = normTxt(text).replace(/[.,;:!?¿¡]+$/, "").trim();
  if (/^(diagnostico|diagnostico de voz|prueba de microfono)$/.test(n0)) { bubble("out", esc(text)); if (await furatDiag("")) { if (F.cur.type === "guion") guionFocus(F.cur.g); else furatListen(); } return; }
  if (F.cur.id === "__mic") { clearTimeout(F.micTimer); bubble("out", (src === "voice" ? '<span class="mic-ic" aria-hidden="true">🎤</span> ' : "") + esc(text)); F.cur = null; if (await say("✅ Te escuché: «" + text + "». Empecemos. Habla cuando el micrófono esté en rojo; si digo «reconectando», espera un segundo.", run)) furatAsk(run); return; }
  /* Frase de prueba que llega tarde (red lenta): se reconoce y se descarta, nunca se registra como dato. */
  if (/^probando( uno dos tres)?$/.test(n0)) { bubble("out", (src === "voice" ? '<span class="mic-ic" aria-hidden="true">🎤</span> ' : "") + esc(text)); if (await say("✅ Te escuché. Sigamos donde íbamos.", run)) { if (F.cur && F.cur.type === "guion") guionFocus(F.cur.g); else furatListen(); } return; }
  if (F.cur.type === "guion") { furatGuionChunk(text, src); return; }
  const f = F.cur, n = normTxt(text);
  bubble("out", (src === "voice" ? '<span class="mic-ic" aria-hidden="true">🎤</span> ' : "") + esc(text));
  if (f.id === "__ident") { furatIdentAnswer(n, text, run); return; }
  if (f.id === "__quien") { furatQuienAnswer(text, run); return; }
  if (f.id === "__centro") { furatCentroAnswer(n, run); return; }
  if (f.id === "__revisarBase") { furatRevisarBaseAnswer(n, text, run); return; }
  if (/^(repetir|repite|repiteme|otra vez|que paso|que pasa|ayuda|que sigue|no entiendo|\?)\b/.test(n)) { if (await say((f.q ? "Estoy esperando esta respuesta: " + f.q : "Di *sí* para generar el FURAT o *«corregir»* y el dato."), run)) furatListen(); return; }
  if (F.phase === "ask" && f.id !== "__confirm" && /^(omitir|omito|pasar|saltar|no se|no lo se|no lo tengo|despues)\b/.test(n)) {
    if (f.opt) { F.ans[f.id] = "No registra"; F.meta[f.id] = { text: "No registra", src }; if (await say("Lo dejo como *No registra*.", run)) furatAsk(run); return; }
    F.pending.push(f.id); F.cur = null;
    if (await say("Lo dejo *pendiente* y te lo pregunto al final. ⏳", run)) furatAsk(run); return;
  }
  if (F.phase === "confirm") { furatConfirmar(text, run); return; }
  if (f.id === "__confirm") {
    const r = parseBool(text);
    if (!r.ok) { if (await say(r.msg, run)) furatListen("Di «sí» o «no»"); return; }
    if (r.value) { f.items.forEach(i => { const inf = F.__inf[i.id]; F.ans[i.id] = inf.value; F.meta[i.id] = { text: inf.text, src: "inferido y confirmado" }; }); F.cur = null; if (await say("Perfecto, lo registro así. ✅", run)) furatAsk(run); }
    else { F.cur = null; if (await say("De acuerdo, te lo pregunto uno por uno.", run)) furatAsk(run); }
    return;
  }
  if (f.type === "long" && src === "voice" && !/^(listo|termine|terminado|eso es todo|fin)$/.test(n)) {
    F.longBuf = (F.longBuf ? F.longBuf + " " : "") + text.trim(); clearTimeout(F.longTimer);
    F.longTimer = setTimeout(() => { if (F.cur === f && F.longBuf) { const t = F.longBuf; F.longBuf = ""; furatAnswer(t, "voice-fin"); } }, 3500);
    furatListen("Sigue describiendo; al terminar haz una pausa o di «listo»"); return;
  }
  if (f.type === "long" && F.longBuf) { text = F.longBuf + (/^(listo|termine|terminado|eso es todo|fin)$/.test(n) ? "" : " " + text); F.longBuf = ""; clearTimeout(F.longTimer); }
  const r = parseAnswer(f, text);
  if (!r.ok) { F.tries++; const msg = F.tries >= 2 && f.type !== "long" ? r.msg + " También puedes escribir la respuesta." : r.msg; if (await say(msg, run)) furatListen(); return; }
  F.ans[f.id] = r.value; F.meta[f.id] = { text: r.text, src: src === "voice-fin" ? "voice" : src };
  if (f.id === "descripcion") { const inf = furatInfer(r.value); if (inf) { F.infer = inf; F.__inf = inf; } }
  F.cur = null;
  const ack = f.type === "long" ? "Gracias, quedó registrada la descripción. ✅" : "✅ " + r.text;
  if (await say(ack, run)) furatAsk(run);
}
function furatDerivar() {
  furatCopiar();
  const a = F.ans, hoy = new Date();
  if (a.fechaAccidente && a.fechaAccidente.d) { const d = new Date(a.fechaAccidente.y, a.fechaAccidente.m - 1, a.fechaAccidente.d).getDay(); a.diaSemana = DIAS[d]; F.meta.diaSemana = { text: DIAS_L[d], src: "calculado" }; }
  else { delete a.diaSemana; delete F.meta.diaSemana; }
  const afp = normTxt(a.afp || ""); a.seguroSocial = /colpensiones|seguro social|iss\b/.test(afp);
  a.fechaDiligenciamiento = { d: hoy.getDate(), m: hoy.getMonth() + 1, y: hoy.getFullYear() };
  if (a.apellidos) { const p = a.apellidos.split(" "); a.primerApellido = p[0]; a.segundoApellido = p.slice(1).join(" "); }
  if (a.nombres) { const p = a.nombres.split(" "); a.primerNombre = p[0]; a.segundoNombre = p.slice(1).join(" "); }
}
async function furatRevisar(run) {
  furatDerivar();
  const faltan = FURAT_FIELDS.filter(f => furatApplicable(f) && !f.opt && F.ans[f.id] === undefined);
  if (faltan.length) {
    F.pending = []; F.ronda++;
    const msg = F.ronda === 1 ? ["Revisé el formato y *faltan " + faltan.length + " dato" + (faltan.length === 1 ? "" : "s") + " obligatorio" + (faltan.length === 1 ? "" : "s") + "* para que el FURAT quede completo. Te los pregunto ahora. 🔍"] : ["El FURAT no puede radicarse incompleto: todavía faltan " + faltan.length + " dato" + (faltan.length === 1 ? "" : "s") + ". Intentémoslo una vez más."];
    if (!await say(msg, run)) return;
    if (F.ronda >= 3) { faltan.forEach(f => { F.ans[f.id] = "PENDIENTE"; F.meta[f.id] = { text: "PENDIENTE", src: "sin dato" }; }); if (!await say("Dejaré esos campos marcados como *PENDIENTE* en rojo; complétalos antes de radicar el informe. ⚠️", run)) return; furatRevisar(run); return; }
    furatAsk(run); return;
  }
  F.phase = "confirm"; F.cur = { id: "__review", type: "text", q: "¿Todo correcto? Di *sí* para generar el documento, o *«corregir»* y el nombre del dato." };
  const secs = ["AF", "I", "II", "III", "IV", "V"].map(s => { const fs = FURAT_FIELDS.filter(f => f.sec === s && !f.meta && F.ans[f.id] !== undefined); return "*" + FURAT_SEC[s] + "*\n" + fs.map(f => "• " + f.label.split(" (")[0] + ": " + (F.meta[f.id] ? F.meta[f.id].text : String(F.ans[f.id]))).join("\n"); });
  if (!await say(["Este es el resumen del FURAT: 📋"].concat(secs).concat(["¿Todo correcto? Di *sí* para generar el documento, o di *«corregir»* y el nombre del dato (por ejemplo: «corregir hora»)."]), run)) return;
  furatListen("Di «sí» o «corregir …»");
}
async function furatConfirmar(text, run) {
  const n = normTxt(text);
  const mc = n.match(/corregir\s+(.+)/) || n.match(/^(?:cambiar|modificar)\s+(.+)/);
  if (mc || /^no\b/.test(n)) {
    const best = furatBuscarCampo(mc ? mc[1] : "");
    if (!best) { if (await say("¿Cuál dato quieres corregir? Dime *«corregir»* y el nombre del campo (por ejemplo: salario, hora, dirección del trabajador, mecanismo).", run)) furatListen("Di «corregir …»"); return; }
    delete F.ans[best.id]; delete F.meta[best.id]; F.phase = "ask"; F.cur = null; if (GUION_DE[best.id]) F.gdone[GUION_DE[best.id].id] = true;
    if (await say("Corrijamos *" + best.label.split(" (")[0] + "*.", run)) furatAsk(run); return;
  }
  const r = parseBool(text);
  if (!r.ok || !r.value) { if (await say("Di *sí* para generar el FURAT o *«corregir»* y el dato.", run)) furatListen(); return; }
  F.phase = "done"; F.cur = null; furatMode(false);
  const pend = Object.keys(F.ans).filter(k => F.ans[k] === "PENDIENTE").length;
  buildFuratModal(); furatDocCard(pend);
  if (!await say(["¡Listo! 🎉 Diligencié el FURAT con tus respuestas" + (pend ? ", con *" + pend + " campo" + (pend === 1 ? "" : "s") + " pendiente" + (pend === 1 ? "" : "s") + "* marcados en rojo" : " y quedó *completo*") + ".", "Tócalo para verlo y descargarlo en *PDF*, *Excel* o *JSON*. Recuerda: el reporte oficial se radica ante la ARL y la EPS dentro de los *dos días hábiles* siguientes al accidente. 📲"], run)) return;
  if (!await say(["📌 *Siguiente paso obligatorio: la investigación del accidente.* La *Resolución 1401 de 2007* te exige investigarlo dentro de los *15 días* siguientes, con un equipo formado por el jefe inmediato, un representante del COPASST o el vigía de SST y el responsable del SG-SST." + (F.ans.causoMuerte === true ? " Como el accidente fue *mortal*, debe participar un profesional con licencia en SST y la investigación se *remite a la ARL* dentro de esos mismos 15 días." : " Si el accidente es *grave o mortal*, debe participar un profesional con licencia en SST y la investigación se remite a la ARL dentro de esos mismos 15 días."),
    "🧭 El *formato de investigación* y la asesoría para complementarla los encuentras con *ARL SURA*: sura.co/arl → Servicios en Línea, o en las líneas *01 8000 511 414* y *01 8000 941 414* con tu asesor asignado."], run)) return;
  finDeFlujo(run);
}
function furatFileBase() { return "FURAT_" + slug((F.ans.apellidos || "trabajador") + "_" + (F.ans.fechaAccidente && F.ans.fechaAccidente.d ? fmtDate(F.ans.fechaAccidente) : "")); }
function furatDocCard(pend) {
  const row = document.createElement("div"); row.className = "wa-row in";
  row.innerHTML = '<div class="wa-bubble in doc"><button class="wa-doc" type="button" aria-haspopup="dialog"><span class="wa-doc-ic" aria-hidden="true">🚑</span><span class="wa-doc-meta"><span class="wa-doc-name">' + esc(furatFileBase() + ".pdf") + '</span><span class="wa-doc-sub">' + (pend ? "⚠️ " + pend + " pendiente" + (pend === 1 ? "" : "s") + " · " : "Completo · ") + 'F 2015 - PR v3 · Res. 156/2005</span></span><span class="wa-doc-dl">VER</span></button><span class="wa-meta">' + hora().full + '</span></div>';
  ui.chat.appendChild(row); row.querySelector(".wa-doc").addEventListener("click", openModal); scrollChat();
}

/* ---------- Valores para el formato (texto plano) ---------- */
function fv(id) { const a = F.ans[id]; if (a === undefined || a === null || a === "") return ""; if (a === "PENDIENTE") return "PENDIENTE"; const f = FURAT_FIELDS.find(x => x.id === id);
  if (f && (f.type === "enum")) return "(" + a + ") " + optLabel(f.opts, a);
  if (f && f.type === "multi") return a.map(c => "(" + c + ") " + optLabel(f.opts, c)).join("; ");
  if (f && f.type === "bool") return a ? "Sí" : "No";
  if (F.meta[id] && F.meta[id].text) return F.meta[id].text; return String(a); }
function marks(key, sel) { const s = Array.isArray(sel) ? sel : [sel]; return OPT[key].map(o => ({ x: s.includes(o.c), t: "(" + o.c + ") " + o.l.toUpperCase() })); }
function furatFilas() {
  const a = F.ans, d = x => x && x.d ? fmtDate(x) : (x === "PENDIENTE" ? "PENDIENTE" : "");
  return [
    ["AF", "EPS a la que está afiliado", fv("eps")], ["AF", "ARL a la que está afiliado", fv("arl")], ["AF", "AFP a la que está afiliado", fv("afp")], ["AF", "Seguro Social (Colpensiones)", a.seguroSocial ? "Sí · " + fv("afp") : "No"],
    ["I", "Tipo de vinculador laboral", fv("tipoVinculador")], ["I", "Nombre de la actividad económica", fv("actividadEconomica")], ["I", "Nombre o razón social", fv("razonSocial")], ["I", "Tipo y número de identificación", fv("tipoIdEmpresa") + " · " + fv("numIdEmpresa")], ["I", "Dirección", fv("direccionEmpresa")], ["I", "Teléfono", fv("telefonoEmpresa")], ["I", "Correo electrónico", fv("correo")], ["I", "Departamento / Municipio / Zona", fv("departamentoEmpresa") + " / " + fv("municipioEmpresa") + " / " + fv("zonaEmpresa")], ["I", "Centro de trabajo donde labora el trabajador", fv("centroNombre")], ["I", "¿Datos del centro iguales a la sede principal?", fv("centroMismo")],
    ...(a.centroMismo === false ? [["I", "Actividad económica del centro de trabajo", fv("centroActividad")], ["I", "Dirección / teléfono del centro", fv("centroDireccion") + " · " + fv("centroTelefono")], ["I", "Departamento / Municipio / Zona del centro", fv("centroDepartamento") + " / " + fv("centroMunicipio") + " / " + fv("centroZona")]] : []),
    ["II", "Tipo de vinculación", fv("tipoVinculacion")], ["II", "Primer apellido / Segundo apellido", (a.primerApellido || "") + " / " + (a.segundoApellido || "")], ["II", "Primer nombre / Segundo nombre", (a.primerNombre || "") + " / " + (a.segundoNombre || "")], ["II", "Tipo y número de identificación", fv("tipoIdTrabajador") + " · " + fv("numIdTrabajador")], ["II", "Fecha de nacimiento", d(a.fechaNacimiento)], ["II", "Sexo", fv("sexo")], ["II", "Dirección / Teléfono", fv("direccionTrabajador") + " · " + fv("telefonoTrabajador")], ["II", "Departamento / Municipio / Zona", fv("departamentoTrabajador") + " / " + fv("municipioTrabajador") + " / " + fv("zonaTrabajador")], ["II", "Cargo", fv("cargo")], ["II", "Ocupación habitual", fv("ocupacionHabitual")], ["II", "Tiempo de ocupación habitual al momento del accidente", fv("tiempoOcupacion")], ["II", "Fecha de ingreso a la empresa", d(a.fechaIngreso)], ["II", "Salario u honorarios (mensual)", fv("salario")], ["II", "Jornada de trabajo habitual", fv("jornadaHabitual")],
    ["III", "Fecha del accidente", d(a.fechaAccidente)], ["III", "Hora del accidente (0-23 h)", fv("horaAccidente")], ["III", "Día de la semana", F.meta.diaSemana ? F.meta.diaSemana.text : ""], ["III", "Jornada en que sucede", fv("jornadaSucede")], ["III", "¿Estaba realizando su labor habitual?", fv("laborHabitual") + (a.laborHabitual === false ? " · Cuál: " + fv("cualLabor") : "")], ["III", "Total tiempo laborado previo al accidente", fv("tiempoLaborado")], ["III", "Tipo de accidente", fv("tipoAccidente")], ["III", "¿Causó la muerte al trabajador?", fv("causoMuerte")], ["III", "Departamento / Municipio / Zona del accidente", fv("departamentoAccidente") + " / " + fv("municipioAccidente") + " / " + fv("zonaAccidente")], ["III", "Lugar donde ocurrió el accidente", fv("lugar")], ["III", "Sitio de ocurrencia", fv("sitio") + (a.sitio === "9" ? " · " + fv("sitioOtro") : "")], ["III", "Tipo de lesión", fv("tipoLesion") + (Array.isArray(a.tipoLesion) && a.tipoLesion.includes("99") ? " · " + fv("lesionOtro") : "")], ["III", "Parte del cuerpo aparentemente afectada", fv("parteCuerpo")], ["III", "Agente del accidente", fv("agente")], ["III", "Mecanismo o forma del accidente", fv("mecanismo") + (a.mecanismo === "9" ? " · " + fv("mecanismoOtro") : "")],
    ["IV", "Descripción detallada del accidente", fv("descripcion")], ["IV", "¿Hubo personas que presenciaron el accidente?", fv("hayTestigos")],
    ...(a.hayTestigos ? [["IV", "Testigo 1", fv("testigo1Nombre") + " · " + fv("testigo1TipoId") + " " + fv("testigo1NumId") + " · Cargo: " + fv("testigo1Cargo")]] : []),
    ...(a.hayTestigo2 ? [["IV", "Testigo 2", fv("testigo2Nombre") + " · " + fv("testigo2TipoId") + " " + fv("testigo2NumId") + " · Cargo: " + fv("testigo2Cargo")]] : []),
    ["V", "Persona responsable del informe", fv("responsableNombre") + " · " + fv("responsableTipoId") + " " + fv("responsableNumId") + " · Cargo: " + fv("responsableCargo")], ["V", "Fecha de diligenciamiento del informe", d(a.fechaDiligenciamiento)], ["V", "Firma", "________________________"]
  ];
}

/* ---------- Vista en el modal ---------- */
function buildFuratModal() {
  const filas = furatFilas(), pend = filas.filter(r => /PENDIENTE/.test(r[2])).length;
  const cell = v => /PENDIENTE/.test(v) ? '<span class="pend">' + esc(v) + '</span>' : esc(v);
  const grupos = ["AF", "I", "II", "III", "IV", "V"].map(s => '<h4 class="fu-sec">' + esc(FURAT_SEC[s]) + '</h4><table class="fu-tbl">' + filas.filter(r => r[0] === s).map(r => '<tr><th>' + esc(r[1]) + '</th><td>' + cell(r[2]) + '</td></tr>').join("") + '</table>').join("");
  const checks = [["Sitio de ocurrencia", "sitio", F.ans.sitio], ["Tipo de lesión (marque cuál o cuáles)", "tipoLesion", F.ans.tipoLesion || []], ["Parte del cuerpo aparentemente afectada", "parteCuerpo", F.ans.parteCuerpo], ["Agente del accidente", "agente", F.ans.agente], ["Mecanismo o forma del accidente", "mecanismo", F.ans.mecanismo]]
    .map(c => '<div class="fu-chk"><b>' + esc(c[0]) + '</b><div class="fu-chk-grid">' + marks(c[1], c[2]).map(m => '<span class="' + (m.x ? "on" : "") + '">' + (m.x ? "☒" : "☐") + " " + esc(m.t) + '</span>').join("") + '</div></div>').join("");
  $("mtxBody").innerHTML = '<div class="matriz-meta"><span class="chip">Formato: <b>F 2015 - PR versión 3</b></span><span class="chip">Norma: <b>Res. 156/2005</b></span><span class="chip">Estado: <b>' + (pend ? pend + " pendiente" + (pend === 1 ? "" : "s") : "Completo") + '</b></span><span class="chip">Fecha: <b>' + fechaHoy() + '</b></span></div>' +
    '<div class="export-row"><button class="exp-btn primary" id="btnFuPdf" type="button">📄 Descargar PDF</button><button class="exp-btn" id="btnFuXlsx" type="button">📗 Excel (.xlsx)</button><button class="exp-btn" id="btnFuJson" type="button">{ } JSON</button><button class="exp-btn" id="btnPrint" type="button">🖨️ Imprimir</button></div>' +
    '<div class="fu-doc"><h3 class="fu-title">Informe de accidente de trabajo del empleador o contratante (FURAT)</h3>' + grupos + '<h4 class="fu-sec">Casillas de marcación (sección III)</h4>' + checks + '</div>' +
    '<p class="matriz-foot"><b>Fuente de los datos:</b> respuestas por voz del empleador, transcritas y clasificadas por el asistente; los códigos EPS/ARL/AFP, de actividad económica y de ocupación los diligencia la ARL. <b>Marco:</b> ' + esc(FURAT_META.norma) + '. Documento de práctica generado por ' + esc(CONFIG.autor) + '; el reporte oficial se radica en el formato de la ARL con la firma del responsable.</p>';
  document.querySelector(".mtx-doc-ic").textContent = "🚑";
  $("mtxName").textContent = furatFileBase() + ".pdf"; $("mtxSub").textContent = "FURAT · " + (F.ans.razonSocial || "") + " · " + (F.ans.apellidos || "");
  $("btnFuPdf").addEventListener("click", furatPdf); $("btnFuXlsx").addEventListener("click", furatXlsx); $("btnFuJson").addEventListener("click", furatJson); $("btnPrint").addEventListener("click", () => window.print());
  setPrintPage("portrait");
  document.body.classList.add("has-doc");
}

/* ---------- Exportes FURAT ---------- */
function furatPdf() {
  if (!(window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable)) { conLibs(() => window.jspdf && window.jspdf.jsPDF && window.jspdf.jsPDF.API.autoTable, furatPdf, "btnFuPdf"); return; }
  const doc = new window.jspdf.jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 30, filas = furatFilas();
  doc.setProperties({ title: "FURAT · " + (F.ans.razonSocial || ""), subject: FURAT_META.formato, author: CONFIG.autor, creator: CONFIG.autor + " · Simulador Cápsulas SST " + CONFIG.version });
  const logo = document.querySelector(".brand-logo");
  const drawn = new Set();
  const cab = () => { const pg = doc.internal.getCurrentPageInfo().pageNumber; if (drawn.has(pg)) return; drawn.add(pg); doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(35, 26, 77); doc.text("INFORME DE ACCIDENTE DE TRABAJO DEL EMPLEADOR O CONTRATANTE (FURAT)", M, 34);
    try { if (logo && /^data:/.test(logo.src)) doc.addImage(logo.src, "PNG", W - M - 78, 20, 78, 14.8); } catch (e) { /* sin logo */ }
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(90, 90, 90); doc.text("Estructura F 2015 - PR versión 3 · Resolución 156 de 2005 · No. de informe: asignado por la ARL · Fecha de diligenciamiento: " + fmtDate(F.ans.fechaDiligenciamiento), M, 48); };
  const pendStyle = d => { if (d.section === "body" && /PENDIENTE/.test(String(d.cell.raw))) { d.cell.styles.textColor = [192, 57, 43]; d.cell.styles.fontStyle = "bold"; } };
  cab(); let y = 58;
  ["AF", "I", "II", "III", "IV", "V"].forEach(s => {
    const body = filas.filter(r => r[0] === s).map(r => [r[1], r[2]]);
    doc.autoTable({ startY: y, head: [[{ content: FURAT_SEC[s].toUpperCase(), colSpan: 2 }]], body, theme: "grid", pageBreak: body.length <= 6 ? "avoid" : "auto", margin: { left: M, right: M, top: 58 }, styles: { fontSize: 7.6, cellPadding: 2.6, overflow: "linebreak", lineColor: [190, 190, 190], lineWidth: 0.3, textColor: [30, 30, 30] },
      headStyles: { fillColor: [35, 26, 77], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.8 }, columnStyles: { 0: { cellWidth: 190, fontStyle: "bold", fillColor: [245, 245, 250] } }, didParseCell: pendStyle, didDrawPage: cab });
    y = doc.lastAutoTable.finalY + 8;
  });
  const checks = [["SITIO DE OCURRENCIA", "sitio", F.ans.sitio], ["TIPO DE LESIÓN (MARQUE CUÁL O CUÁLES)", "tipoLesion", F.ans.tipoLesion || []], ["PARTE DEL CUERPO APARENTEMENTE AFECTADA", "parteCuerpo", F.ans.parteCuerpo], ["AGENTE DEL ACCIDENTE", "agente", F.ans.agente], ["MECANISMO O FORMA DEL ACCIDENTE", "mecanismo", F.ans.mecanismo]];
  checks.forEach(c => {
    const ms = marks(c[1], c[2]), cols = 2, rows = [];
    for (let i = 0; i < ms.length; i += cols) rows.push(ms.slice(i, i + cols).map(m => (m.x ? "[X] " : "[  ] ") + m.t).concat(Array(Math.max(0, cols - ms.slice(i, i + cols).length)).fill("")));
    doc.autoTable({ startY: y, head: [[{ content: c[0], colSpan: 2 }]], body: rows, theme: "grid", pageBreak: "avoid", margin: { left: M, right: M, top: 58 }, styles: { fontSize: 6.9, cellPadding: 2.2, overflow: "linebreak", lineColor: [200, 200, 200], lineWidth: 0.3 }, headStyles: { fillColor: [0, 168, 132], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.4 },
      didParseCell: d => { if (d.section === "body" && /^\[X\]/.test(String(d.cell.raw))) { d.cell.styles.fontStyle = "bold"; d.cell.styles.fillColor = [227, 247, 238]; } }, didDrawPage: cab });
    y = doc.lastAutoTable.finalY + 8;
  });
  if (y > H - 70) { doc.addPage(); cab(); y = 66; }
  doc.setDrawColor(120); doc.line(M, y + 26, M + 220, y + 26); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(60); doc.text("Firma de la persona responsable del informe: " + (F.ans.responsableNombre || ""), M, y + 38);
  const pc = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pc; i++) { doc.setPage(i); doc.setFontSize(6.8); doc.setTextColor(150); doc.text(CONFIG.autor + "  -  FURAT diligenciado por voz (simulador)  -  Documento de práctica; el reporte oficial se radica en el formato de la ARL", M, H - 14); doc.text("Página " + i + " de " + pc, W - M - 52, H - 14); }
  const fn = furatFileBase() + ".pdf", isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) { let w = null; try { w = window.open(doc.output("bloburl"), "_blank"); } catch (e) { w = null; } if (w) flash("btnFuPdf", "✅ Abierto"); else { doc.save(fn); flash("btnFuPdf", "✅ Descargado"); } } else { doc.save(fn); flash("btnFuPdf", "✅ Descargado"); }
}
function furatXlsx() {
  if (!(window.XLSX && window.XLSX.utils)) { conLibs(() => window.XLSX && window.XLSX.utils, furatXlsx, "btnFuXlsx"); return; }
  const X = window.XLSX, filas = furatFilas();
  const ws = X.utils.aoa_to_sheet([[FURAT_META.formato], [FURAT_META.norma], [], ["Sección", "Campo", "Valor"]].concat(filas.map(r => [FURAT_SEC[r[0]], r[1], r[2]])));
  ws["!cols"] = [{ wch: 34 }, { wch: 48 }, { wch: 80 }];
  const ws2 = X.utils.aoa_to_sheet([["Casilla", "Código", "Opción", "Marca"]].concat(["sitio", "tipoLesion", "parteCuerpo", "agente", "mecanismo"].flatMap(k => marks(k, F.ans[k] || []).map(m => [FURAT_FIELDS.find(f => f.id === k).label, m.t.match(/^\(([^)]+)\)/)[1], m.t.replace(/^\([^)]+\)\s*/, ""), m.x ? "X" : ""]))));
  ws2["!cols"] = [{ wch: 40 }, { wch: 8 }, { wch: 70 }, { wch: 6 }];
  const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, "FURAT"); X.utils.book_append_sheet(wb, ws2, "Casillas");
  wb.Props = { Title: "FURAT · " + (F.ans.razonSocial || ""), Subject: FURAT_META.formato, Author: CONFIG.autor, Company: CONFIG.autor, CreatedDate: new Date() };
  X.writeFile(wb, furatFileBase() + ".xlsx"); flash("btnFuXlsx", "✅ Descargado");
}
function furatJson() {
  const campos = {}; FURAT_FIELDS.forEach(f => { if (F.ans[f.id] !== undefined && !f.meta) campos[f.id] = { seccion: f.sec, etiqueta: f.label, valor: F.ans[f.id], texto: F.meta[f.id] ? F.meta[f.id].text : undefined, origen: F.meta[f.id] ? F.meta[f.id].src : undefined }; });
  ["diaSemana", "seguroSocial", "fechaDiligenciamiento", "primerApellido", "segundoApellido", "primerNombre", "segundoNombre"].forEach(k => { campos[k] = { seccion: "derivado", valor: F.ans[k] }; });
  const out = { formato: FURAT_META.formato, norma: FURAT_META.norma, generado: new Date().toISOString(), autor: CONFIG.autor, version: CONFIG.version, campos };
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = furatFileBase() + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); flash("btnFuJson", "✅ Descargado");
}

/* ---------- Red de seguridad: un error interno no congela ni la entrevista ni el chat ---------- */
window.addEventListener("unhandledrejection", e => {
  console.error(e.reason);
  if (F.phase === "ask" || F.phase === "confirm") { const g = F.cur && F.cur.g; say("Tuve un problema interno, pero seguimos. " + (g ? guionEstado(g).msg : (F.cur && F.cur.q ? "Estoy esperando: " + F.cur.q : "")), S.run).then(() => { if (g) guionFocus(g); }); }
  else if (!ui.chat.querySelector(".wa-actions")) { bubble("in", md("⚠️ Tuve un problema interno. Volvamos a empezar desde aquí. 👇")); finDeFlujo(S.run); }
});
/* Aviso antes de cerrar o recargar con un FURAT a medias (el chat no persiste datos). */
window.addEventListener("beforeunload", e => { if ((F.phase === "ask" || F.phase === "confirm") && Object.keys(F.ans).length >= 3) { e.preventDefault(); e.returnValue = ""; } });
/* ---------- Controles de voz en la barra de entrada ---------- */
Voice.onResult = t => { if (F.cur && (F.phase === "ask" || F.phase === "confirm")) furatAnswer(t, "voice"); };
Voice.onState = (st, t) => {
  const mic = $("micBtn"), inp = $("txtIn"), hf = Voice.handsFree;
  if (st === "start") { mic.classList.add("listening"); mic.setAttribute("aria-label", "Pausar micrófono"); setStatus("🔴 escuchando"); if (!/^(Sigue|Di |Ahora)/.test(inp.placeholder)) inp.placeholder = "Te escucho: habla ahora"; }
  else if (st === "restart") { setStatus("🎙️ reconectando…"); }
  else if (st === "off") { mic.classList.remove("listening"); mic.setAttribute("aria-label", "Hablar"); setStatus("en línea"); inp.value = ""; inp.placeholder = "🎙️ Micrófono apagado: tócalo para seguir"; if (F.cur && (F.phase === "ask" || F.phase === "confirm")) say("🎙️ El micrófono se apagó. *Tócalo* para seguir hablando, o escribe la respuesta.", S.run); }
  else if (st === "interim") { inp.value = t; }
  else if (st === "wait") { inp.value = ""; inp.placeholder = "Un momento… lo tengo en cuenta"; }
  else if (st === "end") { mic.classList.remove("listening"); mic.setAttribute("aria-label", "Hablar"); setStatus("en línea"); inp.value = ""; inp.placeholder = hf ? "Micrófono en pausa: tócalo para reanudar" : "Toca el micrófono y responde"; }
  else if (st === "error") { mic.classList.remove("listening"); setStatus("en línea"); inp.value = "";
    inp.placeholder = t === "not-allowed" || t === "service-not-allowed" ? "Permite el micrófono en el navegador o escribe aquí" : t === "network" ? "El reconocimiento de voz necesita conexión; escribe aquí" : t === "no-mic" || t === "audio-capture" ? "No encontré micrófono; escribe aquí" : "No pude escuchar; escribe aquí";
    if (Voice.fatal && F.cur && (F.phase === "ask" || F.phase === "confirm")) say(t === "network" ? "⚠️ El reconocimiento de voz de Chrome necesita conexión a internet. Mientras tanto escribe las respuestas." : "⚠️ No tengo acceso al micrófono (" + t + "). Permítelo en el navegador y toca el micrófono, o escribe las respuestas.", S.run); }
};
$("micBtn").addEventListener("click", () => {
  if (!F.cur && !Voice.wanted) return;
  if (Voice.wanted) { Voice.stop(); return; }
  if (!Voice.supported()) { $("txtIn").placeholder = "Sin reconocimiento de voz en este navegador: escribe aquí"; $("txtIn").focus(); return; }
  if (!Voice.primed) { Voice.prime().then(ok => { if (ok) Voice.start(); }); return; }
  Voice.start();
});
function furatSubmitTyped() { const inp = $("txtIn"), t = inp.value.trim(); if (!t || !F.cur) return; inp.value = ""; furatAnswer(t, "text"); }
$("txtIn").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); furatSubmitTyped(); } });
$("txtIn").addEventListener("input", () => { const has = $("txtIn").value.trim().length > 0 && !Voice.wanted; $("micBtn").hidden = has; $("sendBtn").hidden = !has; });
$("sendBtn").addEventListener("click", () => { if ($("inputbar").classList.contains("voice")) { furatSubmitTyped(); $("micBtn").hidden = false; $("sendBtn").hidden = true; } });
