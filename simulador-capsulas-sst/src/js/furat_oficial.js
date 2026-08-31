"use strict";
/* ===================== EXPORTE EN LA PLANTILLA OFICIAL DEL FURAT =====================
   Diligencia la plantilla original (F 2015 - PR versión 3, hoja «FORMATO FURAT») incrustada
   por build.py como FURAT_TPL_B64 (vendor/plantilla_furat.xlsx, reconstruida con
   tools/construir_plantilla.py a partir del furat.xls oficial). El llenado edita solo los
   valores de las celdas dentro del XML del libro: el formato original queda intacto.
   Las X van en la casilla junto a cada opción; las fechas y horas, dígito por dígito. */

const FURAT_TPL = {
  /* Celdas de texto libre (esquina superior izquierda de cada área combinada). */
  texto: {
    eps: "D6", arl: "AB6", afp: "D8", actividadEconomica: "P13", razonSocial: "D16", numIdEmpresa: "AL16",
    direccionEmpresa: "D19", telefonoEmpresa: "AI19", correo: "D22", departamentoEmpresa: "X22", municipioEmpresa: "AI22",
    centroActividad: "N25", centroDireccion: "D28", centroTelefono: "AI28", centroDepartamento: "D30", centroMunicipio: "W30",
    primerApellido: "D36", segundoApellido: "P36", primerNombre: "AB36", segundoNombre: "AL36",
    numIdTrabajador: "R39", direccionTrabajador: "D42", telefonoTrabajador: "AI42",
    departamentoTrabajador: "D45", municipioTrabajador: "P45", cargo: "AI45", ocupacionHabitual: "J47",
    cualLabor: "AC58", departamentoAccidente: "M67", municipioAccidente: "Z67",
    sitioOtro: "D84", lesionOtro: "AL84", mecanismoOtro: "AI102",
    testigo1Nombre: "X112", testigo1NumId: "AO113", testigo1Cargo: "X114",
    testigo2Nombre: "X116", testigo2NumId: "AO117", testigo2Cargo: "X118",
    responsableNombre: "X122", responsableNumId: "AO123", responsableCargo: "X124"
  },
  /* Casillas de opción: la X va en la celda vacía contigua a cada rótulo. */
  marcas: {
    seguroSocial: { "true": "R8", "false": "U8" },
    tipoVinculador: { "1": "T11", "2": "AB11", "3": "AQ11" },
    tipoIdEmpresa: { "NI": "Y16", "CC": "AB16", "CE": "AE16", "N.U": "AH16", "PA": "AK16" },
    zonaEmpresa: { "U": "AS22", "R": "AV22" },
    centroMismo: { "true": "Y24", "false": "AA24" },
    centroZona: { "U": "AQ30", "R": "AU30" },
    tipoVinculacion: { "1": "O33", "2": "T33", "3": "Y33", "4": "AH33", "5": "AO33" },
    tipoIdTrabajador: { "CC": "E39", "CE": "H39", "N.U": "K39", "TI": "N39", "PA": "Q39" },
    sexo: { "M": "AQ39", "F": "AU39" },
    zonaTrabajador: { "U": "AD45", "R": "AG45" },
    jornadaHabitual: { "1": "AC50", "2": "AI50", "3": "AN50", "4": "AT50" },
    diaSemana: { "LU": "AG55", "MA": "AI55", "MI": "AK55", "JU": "AM55", "VI": "AO55", "SA": "AQ55", "DO": "AS55" },
    jornadaSucede: { "1": "G59", "2": "K59" },
    laborHabitual: { "true": "O59", "false": "R59" },
    tipoAccidente: { "1": "U63", "2": "Y63", "3": "AD63", "4": "AM63", "5": "AU63" },
    causoMuerte: { "true": "G67", "false": "K67" },
    zonaAccidente: { "U": "AP67", "R": "AT67" },
    lugar: { "1": "W70", "2": "AG70", "3": "AP70" },
    sitio: { "1": "D75", "2": "D76", "3": "D77", "4": "D78", "5": "D79", "6": "D80", "7": "D81", "8": "D82", "9": "D83" },
    tipoLesion: { "10": "U75", "20": "U76", "25": "U77", "30": "U79", "40": "U80", "41": "U81", "50": "U82", "55": "U84", "60": "U85", "70": "AL75", "80": "AL77", "81": "AL79", "82": "AL80", "83": "AL81", "90": "AL82", "99": "AL83" },
    parteCuerpo: { "1": "D90", "1.12": "D91", "2": "D92", "3": "D93", "3.32": "D95", "3.33": "D96", "4": "D97", "4.46": "D98", "5": "D99", "5.56": "D100", "6": "D101", "7": "D102" },
    agente: { "1": "S92", "2": "S93", "3": "S94", "3.36": "S95", "4": "S96", "4.4": "S97", "5": "S98", "6": "S100", "6.61": "S101", "7": "S102" },
    mecanismo: { "1": "AI90", "2": "AI91", "3": "AI92", "4": "AI93", "5": "AI94", "6": "AI96", "7": "AI98", "8": "AI99", "9": "AI101" },
    hayTestigos: { "true": "AM108", "false": "AO108" },
    testigo1TipoId: { "CC": "AN112", "CE": "AP112", "N.U": "AR112", "TI": "AT112", "PA": "AV112" },
    testigo2TipoId: { "CC": "AN116", "CE": "AP116", "N.U": "AR116", "TI": "AT116", "PA": "AV116" },
    responsableTipoId: { "CC": "AN122", "CE": "AP122", "N.U": "AR122", "TI": "AT122", "PA": "AV122" }
  },
  /* Cajas por dígito: DD MM AAAA. */
  fechas: {
    fechaNacimiento: ["AD39", "AE39", "AG39", "AH39", "AJ39", "AK39", "AL39", "AM39"],
    fechaIngreso: ["F50", "G50", "I50", "J50", "L50", "M50", "N50", "O50"],
    fechaAccidente: ["E55", "F55", "H55", "I55", "K55", "L55", "M55", "N55"],
    fechaDiligenciamiento: ["AM127", "AN127", "AP127", "AQ127", "AS127", "AT127", "AU127", "AV127"]
  },
  hora: ["V55", "W55", "Y55", "Z55"],
  tiempoLaborado: ["K62", "L62", "N62", "O62"],
  tiempoOcupacion: { dias: ["AQ47", "AR47"], meses: ["AT47", "AU47"] },
  salario: "P50", cual: "Y8",
  descLineas: ["E111", "E112", "E113", "E114", "E115", "E116", "E117", "E118", "E119", "E120", "E121", "E122", "E123", "E124", "E125", "E126"],
  anchoDesc: 52
};

function furatOficialDisponible() { return typeof JSZip !== "undefined" && typeof FURAT_TPL_B64 !== "undefined"; }

async function furatOficialXlsx() {
  const zip = await JSZip.loadAsync(FURAT_TPL_B64, { base64: true });
  const xml = await zip.file("xl/worksheets/sheet1.xml").async("string");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const NS = doc.documentElement.namespaceURI;
  const porRef = {}, cs = doc.getElementsByTagName("c");
  for (let i = 0; i < cs.length; i++) porRef[cs[i].getAttribute("r")] = cs[i];
  const set = (ref, val) => {
    const c = porRef[ref];
    if (!c || val === undefined || val === null || val === "") return;
    while (c.firstChild) c.removeChild(c.firstChild);
    c.setAttribute("t", "inlineStr");
    const is = doc.createElementNS(NS, "is"), t = doc.createElementNS(NS, "t");
    t.textContent = String(val); is.appendChild(t); c.appendChild(is);
  };
  const setDigitos = (refs, s) => { s = String(s); for (let i = 0; i < refs.length && i < s.length; i++) set(refs[i], s[i]); };
  const dosDig = n => String(Math.max(0, Math.min(99, Math.round(n)))).padStart(2, "0");
  const a = F.ans;
  const vTxt = id => { const v = a[id]; if (v === undefined || v === null) return ""; if (v === "PENDIENTE") return "PENDIENTE"; return F.meta[id] && F.meta[id].text && typeof v !== "string" ? F.meta[id].text : String(v); };

  /* Texto libre (los números de documento y teléfonos se escriben tal cual). */
  Object.keys(FURAT_TPL.texto).forEach(id => set(FURAT_TPL.texto[id], vTxt(id)));
  /* Casillas con X. */
  Object.keys(FURAT_TPL.marcas).forEach(id => {
    const mapa = FURAT_TPL.marcas[id], v = a[id];
    if (v === undefined || v === null || v === "PENDIENTE") return;
    (Array.isArray(v) ? v : [v]).forEach(x => { const ref = mapa[String(x)]; if (ref) set(ref, "X"); });
  });
  /* Fechas, hora y duraciones, dígito a dígito. */
  Object.keys(FURAT_TPL.fechas).forEach(id => { const v = a[id]; if (v && v.d) setDigitos(FURAT_TPL.fechas[id], dosDig(v.d) + dosDig(v.m) + String(v.y).padStart(4, "0")); });
  if (a.horaAccidente && a.horaAccidente.h !== undefined) setDigitos(FURAT_TPL.hora, dosDig(a.horaAccidente.h) + dosDig(a.horaAccidente.m));
  if (a.tiempoLaborado && a.tiempoLaborado.horas !== undefined) setDigitos(FURAT_TPL.tiempoLaborado, dosDig(a.tiempoLaborado.horas) + dosDig(a.tiempoLaborado.minutos));
  if (a.tiempoOcupacion && a.tiempoOcupacion.meses !== undefined) { setDigitos(FURAT_TPL.tiempoOcupacion.dias, dosDig(a.tiempoOcupacion.dias)); setDigitos(FURAT_TPL.tiempoOcupacion.meses, dosDig(a.tiempoOcupacion.meses)); }
  if (typeof a.salario === "number") set(FURAT_TPL.salario, a.salario.toLocaleString("es-CO"));
  if (a.seguroSocial) set(FURAT_TPL.cual, a.afp || "");
  /* Descripción repartida en las líneas del formato. */
  if (a.descripcion && typeof a.descripcion === "string") {
    const lineas = [], palabras = a.descripcion.split(/\s+/); let lin = "";
    palabras.forEach(p => { if ((lin + " " + p).trim().length > FURAT_TPL.anchoDesc && lin && lineas.length < FURAT_TPL.descLineas.length - 1) { lineas.push(lin); lin = p; } else lin = (lin ? lin + " " : "") + p; });
    if (lin) lineas.push(lin);
    lineas.slice(0, FURAT_TPL.descLineas.length).forEach((l, i) => set(FURAT_TPL.descLineas[i], l));
  }

  zip.file("xl/worksheets/sheet1.xml", new XMLSerializer().serializeToString(doc));
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob), el = document.createElement("a");
  el.href = url; el.download = furatFileBase() + ".xlsx"; document.body.appendChild(el); el.click(); el.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
