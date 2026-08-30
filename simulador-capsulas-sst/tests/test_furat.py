"""
Prueba del módulo FURAT por voz (simulador v17) con un SpeechRecognition simulado en sesión continua.
Sirve el HTML en http://localhost (como iniciar_demo.py) para verificar el modo manos libres.
Uso: python3 test_furat.py simulador_capsulas_sst_v11.html [carpeta_salida]
"""
import json, os, sys
from playwright.sync_api import sync_playwright

HTML = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist", "simulador_capsulas_sst_v19.html"))
OUT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else "furat_out"); os.makedirs(OUT, exist_ok=True)
MOCK_SR = """
window.__srStarts = 0; window.__srActive = null;
window.SpeechRecognition = class {
  constructor(){ this.lang=""; this.interimResults=false; this.continuous=false; this._on=false; }
  start(){ if(this._on) throw new Error("already started"); this._on=true; window.__srStarts++; window.__srActive=this; setTimeout(()=>{ if(this.onstart) this.onstart(); },2); }
  stop(){ if(this._on){ this._on=false; setTimeout(()=>{ if(this.onend) this.onend(); },3); } }
  abort(){ this.stop(); }
};
window.__srSay = (t) => { const r=window.__srActive; if(!r||!r._on) return false; const res=[{transcript:t}]; res.isFinal=true; r.onresult({resultIndex:0, results:[res]}); if(!r.continuous){ r._on=false; setTimeout(()=>r.onend(),3); } return true; };
window.__srInterim = (t) => { const r=window.__srActive; if(!r||!r._on) return false; const res=[{transcript:t}]; res.isFinal=false; r.onresult({resultIndex:0, results:[res]}); return true; };
window.__srEnd = () => { const r=window.__srActive; if(r&&r._on){ r._on=false; r.onend(); } };
navigator.mediaDevices = navigator.mediaDevices || {};
navigator.mediaDevices.getUserMedia = () => Promise.resolve({ getTracks: () => [{ stop(){} }] });
"""
URL = "http://localhost:8765/" + os.path.basename(HTML)
def servir(page):
    page.route("http://localhost:8765/**", lambda route: route.fulfill(status=200, content_type="text/html; charset=utf-8", body=open(HTML, encoding="utf-8").read()))

errors, console, results = [], [], []
def check(name, ok, detail=""):
    results.append((name, bool(ok))); print(("PASS " if ok else "FAIL ") + name + (" — " + str(detail) if detail else ""))

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1380, "height": 900}, accept_downloads=True, locale="es-CO")
    page = ctx.new_page(); page.emulate_media(reduced_motion="reduce"); page.add_init_script(MOCK_SR)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: console.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    servir(page); page.goto(URL); page.wait_for_timeout(600); page.evaluate("S.speed=0")

    # Analizadores (unitario, en la página)
    tests = page.evaluate("""() => {
      const t=[];
      t.push(["wordsToNumbers digitos", wordsToNumbers("nueve cero cero siete cero tres siete seis dos")==="900703762"]);
      t.push(["wordsToNumbers cifra", wordsToNumbers("un millon seiscientos mil pesos")==="1600000 pesos"]);
      t.push(["wordsToNumbers 2026", wordsToNumbers("quince de agosto de dos mil veintiseis")==="15 de agosto de 2026"]);
      t.push(["fecha palabras", parseDate("quince de marzo de mil novecientos noventa",{past:true}).text==="15/03/1990"]);
      t.push(["fecha numerica", parseDate("01/02/2024",{past:true}).text==="01/02/2024"]);
      t.push(["fecha inexistente", parseDate("31 de febrero de 2024",{}).ok===false]);
      t.push(["hora tarde", parseTime("a las tres y media de la tarde").text==="15:30"]);
      t.push(["hora 24h", parseTime("14:30").text==="14:30"]);
      t.push(["hora am 12", parseTime("12 de la madrugada").text==="00:00"]);
      t.push(["duracion meses", JSON.stringify(parseDur("dos años y tres meses","MD").value)==='{"meses":27,"dias":0}']);
      t.push(["duracion horas", JSON.stringify(parseDur("cuatro horas y media","HM").value)==='{"horas":4,"minutos":30}']);
      t.push(["dinero", parseMoney("un millon seiscientos mil").value===1600000]);
      t.push(["bool no", parseBool("no, no fue así").value===false]);
      t.push(["email", parseEmail("contacto arroba la espiga punto com").value==="contacto@laespiga.com"]);
      t.push(["enum ambiguo pide precision", parseEnum("dentro y fuera",{opts:"lugar"}).ok===false]);
      t.push(["mecanismo caida de objetos > caida persona", parseEnum("se le cayó una caja encima",{opts:"mecanismo"}).value==="2"]);
      t.push(["sin falso positivo por prefijo (cargando ≠ carga)", !matchEnum("estaba cargando","agente").some(x=>x.o.c==="4")]);
      t.push(["plural reconocido (escaleras)", matchEnum("cayó por las escaleras","agente")[0].o.c==="5"]);
      t.push(["año de dos dígitos (del 90 → 1990)", parseDate("15 de marzo del 90",{past:true}).text==="15/03/1990"]);
      t.push(["apóstrofo de miles (1'600.000)", parseMoney("1'600.000").value===1600000]);
      t.push(["sigla con puntos (N.I.T.)", parseEnum("N.I.T.",{opts:"tipoIdEmpresa"}).value==="NI"]);
      t.push(["«doble cero» y «triple uno» al dictar", parseDigits("77 doble cero siete 29",{min:5}).value==="7700729" && parseDigits("triple uno cuatro",{min:3}).value==="1114"]);
      t.push(["guía leída en voz alta se descarta", stripGuide(FIELD_BY_ID.centroNombre, "nombre del centro de trabajo es sede principal")==="sede principal"]);
      t.push(["ancla de una palabra no engaña al inicio de un fragmento", (() => { const a = alignReading("es Calle 17 número 717 con teléfono 3073997 y correo electrónico juan arroba x punto com, en el municipio de Soacha, departamento de Cundinamarca, en zona urbana", GUIONES[0]); return a.slots.direccionEmpresa === undefined || a.slots.direccionEmpresa.includes("Calle"); })()]);
      t.push(["ninguna plantilla usa un ancla de una sola palabra entre datos", GUIONES.every(g => g.parts.every((p,i,a) => !(p.t==='a' && p.toks.length===1 && i>0 && i<a.length-1)))]);
      t.push(["multi lesion", JSON.stringify(parseMulti("tuvo una fractura y una herida",{opts:"tipoLesion"}).value)==='["10","41"]']);
      t.push(["direccion", parseText("calle doce número cinco guion veinte",{type:"address"}).value==="Calle 12 No. 5-20"]);
      t.push(["nombre", parseText("rodriguez de la rosa",{type:"name"}).value==="Rodriguez de la Rosa"]);
      t.push(["hora coloquial con minutos (dos y veinte de la tarde)", parseTime("a las dos y veinte de la tarde").text==="14:20"]);
      t.push(["hora doce de la noche", parseTime("a las doce de la noche").text==="00:00"]);
      t.push(["hora doce de la mañana", parseTime("a las doce de la mañana").text==="00:00"]);
      t.push(["hora menos veinte", parseTime("tres menos veinte de la tarde").text==="14:40"]);
      t.push(["hora y cuarenta y cinco", parseTime("dos y cuarenta y cinco de la tarde").text==="14:45"]);
      t.push(["dinero mixto (1 millón 600 mil)", parseMoney("1 millón 600 mil").value===1600000]);
      t.push(["dinero mixto (2 millones 300 mil)", parseMoney("2 millones 300 mil").value===2300000]);
      t.push(["duración con minutos sueltos (tres horas y veinte)", JSON.stringify(parseDur("tres horas y veinte","HM").value)==='{"horas":3,"minutos":20}']);
      t.push(["duración y cuarto", JSON.stringify(parseDur("tres horas y cuarto","HM").value)==='{"horas":3,"minutos":15}']);
      t.push(["duración reagrupada (mes y medio y veinte días)", JSON.stringify(parseDur("un mes y medio y veinte días","MD").value)==='{"meses":2,"dias":5}']);
      t.push(["fecha con ordinal (primero de mayo de 2024)", parseDate("primero de mayo de 2024",{past:true}).text==="01/05/2024"]);
      t.push(["cédulas intactas con cifras mixtas", wordsToNumbers("carrera 8 numero 15 30")==="carrera 8 numero 15 30"]);
      t.push(["dictado por grupos («siete veintinueve» = 7 29, no 36)", wordsToNumbers("setenta y siete doble cero siete veintinueve")==="77 00 7 29" && parseDigits("setenta y siete doble cero siete veintinueve",{min:5}).value==="7700729"]);
      t.push(["compuestos legítimos intactos (ciento veinte)", wordsToNumbers("ciento veinte")==="120" && wordsToNumbers("treinta y cinco mil")==="35000"]);
      return t; }""")
    for n, ok in tests: check("parser: " + n, ok)

    def last_in(): return page.locator(".wa-bubble.in .txt").last.inner_text()
    def speak(text):
        n0 = page.locator(".wa-bubble.in").count()
        ok = False
        for _ in range(8):
            page.wait_for_function("() => Voice.on && window.__srActive && window.__srActive._on", timeout=5000)
            ok = page.evaluate("t => window.__srSay(t)", text)
            if ok: break
            page.wait_for_timeout(300)
        assert ok, "el reconocimiento no está activo"
        page.wait_for_function("n => document.querySelectorAll('.wa-bubble.in').length > n", arg=n0, timeout=8000); page.wait_for_timeout(15)

    page.locator(".wa-actions .wa-action", has_text="FURAT").click(); page.wait_for_timeout(200)
    page.locator(".wa-actions .wa-action", has_text="Pregunta a pregunta").click(); page.wait_for_timeout(150)
    check("Activación única del micrófono ofrecida, sin avisos técnicos", "Activar micrófono" in page.locator(".wa-actions .wa-action").last.inner_text() and "desde el disco" not in " ".join(page.locator(".wa-bubble.in .txt").all_inner_texts()))
    page.locator(".wa-actions .wa-action", has_text="Activar micrófono").click(); page.wait_for_timeout(250)
    check("Permiso pedido una sola vez y sesión de voz abierta", page.evaluate("Voice.primed && Voice.on && Voice.handsFree"))
    page.evaluate("window.__srSay('probando uno dos tres')"); page.wait_for_timeout(400)
    check("Prueba rápida del micrófono confirmada en el chat", "Te escuché" in " ".join(page.locator(".wa-bubble.in .txt").all_inner_texts()[-4:]))
    check("Modo voz activo: micrófono en rojo, entrada visible, sin botones", page.locator("#micBtn").is_visible() and "listening" in page.locator("#micBtn").get_attribute("class") and page.locator("#txtIn").is_visible() and page.locator(".wa-actions").count() == 0 and "escuchando" in page.locator("#waStatus").inner_text())
    n1 = page.evaluate("window.__srStarts"); page.evaluate("window.__srEnd()"); page.wait_for_timeout(400)
    check("Si Chrome cierra la sesión por silencio, se reanuda sola sin nuevo permiso", page.evaluate("window.__srStarts") == n1 + 1 and page.evaluate("Voice.on"))
    # Tope de reinicios: al alcanzarlo la sesión no se reencadena, pero tocar el micrófono lo restablece
    page.evaluate("Voice.restarts = 400")
    n2 = page.evaluate("window.__srStarts"); page.evaluate("window.__srEnd()"); page.wait_for_timeout(400)
    check("Tope de reinicios: la sesión no se reencadena sola", page.evaluate("window.__srStarts") == n2 and not page.evaluate("Voice.on"))
    page.locator("#micBtn").click(); page.wait_for_timeout(400)
    check("Tocar el micrófono restablece el contador y el manos libres", page.evaluate("Voice.restarts") == 0 and page.evaluate("Voice.on"))
    speak("probando uno dos tres")
    check("Frase de prueba tardía no se registra como dato", page.evaluate("F.ans.eps === undefined") and "Sigamos" in last_in(), last_in()[:60])
    speak("omitir")  # sin base ARL: diligenciamiento completo por voz (flujo clásico)
    check("«Omitir» en la identificación pasa al diligenciamiento completo por voz", "EPS" in last_in(), last_in()[:80])
    guion = [
      "Sanitas", "Sura", "Porvenir",
      "empleador", "panadería", "Panadería La Espiga", "nit", "nueve cero cero siete cero tres siete seis dos", "calle doce número cinco guion veinte",
      "seis cero uno cuatro cero cinco cinco nueve uno uno", "contacto arroba laespiga punto com", "Cundinamarca", "Soacha", "urbana", "sede principal", "sí",
      "planta", "rodríguez pérez", "juan carlos", "cédula", "1023456789", "quince de marzo de mil novecientos noventa", "masculino",
      "carrera ocho número quince guion treinta", "omitir", "sí", "urbana", "panadero", "panadero", "dos años y tres meses", "1 de febrero de 2024",
      "un millón seiscientos mil", "diurna",
      "ayer", "a las tres y media de la tarde", "normal", "sí", "cuatro horas y media", "propios del trabajo", "no", "sí", "urbana", "dentro de la empresa", "en el área de producción",
      "El trabajador estaba cargando un bulto de harina de cincuenta kilos desde la bodega, al bajar la escalera resbaló con harina en el piso, se cayó y se golpeó la rodilla derecha, presentando un esguince y una herida en la mano",
      "sí",
      "sí", "gómez ana maría", "cédula", "52123456", "auxiliar de producción", "no",
      "villarraga danna", "cédula", "39456789", "gerente general",
    ]
    for k, t in enumerate(guion):
        try: speak(t)
        except Exception as ex: print('FALLO en paso', k, repr(t), '| último bot:', last_in()[:120], '| voz:', page.evaluate("({on:Voice.on, wanted:Voice.wanted, tries:Voice.tries, fatal:Voice.fatal, mockOn: window.__srActive && window.__srActive._on, starts: window.__srStarts, log: Voice.log.slice(-8)})")); raise
    check("Al omitir el teléfono, lo repregunta al final", "faltan 1 dato" in last_in() or "teléfono" in last_in().lower(), last_in()[:90])
    speak("tres uno cero cuatro cinco seis siete ocho nueve cero")
    check("Resumen listo tras completar el dato pendiente", "Todo correcto" in last_in(), last_in()[:60])
    inferido = page.evaluate("({l:F.ans.tipoLesion, p:F.ans.parteCuerpo, a:F.ans.agente, m:F.ans.mecanismo, src:F.meta.mecanismo.src})")
    check("Inferencia desde la descripción confirmada por voz", inferido["m"] == "1" and inferido["p"] == "5" and "25" in inferido["l"] and "41" in inferido["l"] and inferido["src"].startswith("inferido"), inferido)
    speak("corregir hora")
    check("Corrección por voz reabre el campo", "hora" in last_in().lower())
    speak("dos y cuarto de la tarde")
    check("Nuevo valor de hora y resumen regenerado", page.evaluate("F.meta.horaAccidente.text") == "14:15" and "Todo correcto" in last_in())
    speak("sí")
    page.locator(".wa-doc").wait_for(timeout=5000)
    a = page.evaluate("({d:F.ans.diaSemana, tel:F.ans.telefonoTrabajador, dep:F.ans.departamentoTrabajador, mun:F.ans.municipioAccidente, sal:F.ans.salario, nit:F.ans.numIdEmpresa, ss:F.ans.seguroSocial, ap:[F.ans.primerApellido,F.ans.segundoApellido]})")
    check("Derivados: día de la semana, copia de municipio, apellidos separados", a["d"] in ("LU","MA","MI","JU","VI","SA","DO") and a["dep"] == "Cundinamarca" and a["mun"] == "Soacha" and a["ap"] == ["Rodríguez", "Pérez"], a)
    check("Valores clave", a["tel"] == "3104567890" and a["sal"] == 1600000 and a["nit"] == "900703762" and a["ss"] is False, a)
    faltan = page.evaluate("FURAT_FIELDS.filter(f=>furatApplicable(f)&&!f.opt&&F.ans[f.id]===undefined).map(f=>f.id)")
    check("FURAT completo: 0 campos obligatorios sin dato", faltan == [], faltan)
    check("Tarjeta del documento marcada como completa", "Completo" in page.locator(".wa-doc-sub").last.inner_text())
    check("Modo voz desactivado al terminar", page.locator("#micBtn").is_hidden() and page.locator(".wa-actions .wa-action", has_text="Volver al inicio").count() == 1)
    page.screenshot(path=f"{OUT}/furat_chat.png")
    page.locator(".wa-doc").click(); page.wait_for_timeout(200); page.screenshot(path=f"{OUT}/furat_modal.png")
    check("Vista del formato con secciones y casillas marcadas", page.locator(".fu-sec").count() >= 6 and page.locator(".fu-chk-grid .on").count() >= 5)
    with page.expect_download(timeout=30000) as d: page.click("#btnFuPdf")
    d.value.save_as(f"{OUT}/furat.pdf"); check("PDF FURAT descargado", os.path.getsize(f"{OUT}/furat.pdf") > 15000, d.value.suggested_filename)
    with page.expect_download(timeout=30000) as d: page.click("#btnFuXlsx")
    d.value.save_as(f"{OUT}/furat.xlsx"); check("XLSX FURAT descargado", os.path.getsize(f"{OUT}/furat.xlsx") > 5000)
    with page.expect_download(timeout=15000) as d: page.click("#btnFuJson")
    d.value.save_as(f"{OUT}/furat.json"); js = json.load(open(f"{OUT}/furat.json", encoding="utf-8"))
    check("JSON con campos, etiquetas y origen (voz/inferido/calculado)", js["campos"]["mecanismo"]["origen"].startswith("inferido") and js["campos"]["descripcion"]["origen"] == "voice" and js["campos"]["diaSemana"]["valor"] == a["d"])
    page.keyboard.press("Escape")


    # ================= MODO GUION (párrafos con espacios en blanco) =================
    page.click("#btnRestart"); page.wait_for_timeout(150)
    page.locator(".wa-actions .wa-action", has_text="FURAT").click(); page.wait_for_timeout(150)
    page.locator(".wa-actions .wa-action", has_text="guiones").click(); page.wait_for_timeout(150)
    page.locator(".wa-actions .wa-action", has_text="Activar micrófono").click(); page.wait_for_timeout(300)
    page.evaluate("window.__srSay('probando uno dos tres')"); page.wait_for_timeout(400)
    page.wait_for_function("() => Voice.on"); page.evaluate("window.__srSay('omitir')"); page.wait_for_timeout(500)
    cobertura = page.evaluate("FURAT_FIELDS.filter(f => !GUION_DE[f.id] && !f.opt).map(f => f.id)")
    check("Todos los campos del FURAT están cubiertos por algún guion", cobertura == [], cobertura)
    adj = page.evaluate("GUIONES.filter(g => g.parts.some((p,i,a) => p.t==='s' && a[i+1] && a[i+1].t==='a' && !a[i+1].toks.length && a[i+2] && a[i+2].t==='s')).map(g=>g.id)")
    check("Ningún guion tiene dos espacios sin ancla entre ellos", adj == [], adj)
    check("Guion 1 visible con 16 espacios y guía en color en cada uno (sin numeración ni leyenda)", page.locator("#guion-g0 .g-b").count() == 16 and page.locator("#guion-g0 .g-g").count() == 16 and page.locator("#guion-g0 .g-h").count() == 0 and page.locator("#guion-g0 .g-b i").count() == 0 and "(EPS)" in page.locator("#guion-g0 .g-b").first.inner_text())
    check("Sin aviso file:// en el chat", "desde el disco" not in " ".join(page.locator(".wa-bubble.in .txt").all_inner_texts()))
    def guion_lee(text):
        n0 = page.locator(".wa-bubble.out").count()
        ok = False
        for _ in range(8):
            page.wait_for_function("() => Voice.on && window.__srActive && window.__srActive._on", timeout=5000)
            ok = page.evaluate("t => window.__srSay(t)", text)
            if ok: break
            page.wait_for_timeout(300)
        assert ok, "reconocimiento inactivo"
        try: page.wait_for_function("n => document.querySelectorAll('.wa-bubble.out').length > n", arg=n0, timeout=8000); page.wait_for_timeout(120)
        except Exception: print("SIN RESPUESTA a", repr(text[:60]), "| cur:", page.evaluate("F.cur && (F.cur.type||F.cur.id)"), "| voice:", page.evaluate("({on:Voice.on,wanted:Voice.wanted,final:Voice.final,flush:F.flushMs})"), "| últ:", last_in()[:80]); raise
        page.wait_for_timeout(15)
    guion_lee("el trabajador está afiliado a la eps Sanitas, a la arl Sura y al fondo de pensiones Porvenir. el reporte lo presenta el empleador. la empresa se llama Panadería La Espiga, su actividad económica es panadería y se identifica con nit, con el número 900703762. la sede principal queda en la dirección calle 12 número 5-20, con teléfono 6014055911 y correo electrónico contacto arroba laespiga punto com, en el municipio de Soacha, departamento de Cundinamarca, en zona urbana. el trabajador labora en el centro de trabajo sede principal, cuyos datos sí son los mismos de la sede principal")
    g0 = page.evaluate("({eps:F.ans.eps, afp:F.ans.afp, tv:F.ans.tipoVinculador, rs:F.ans.razonSocial, tid:F.ans.tipoIdEmpresa, nit:F.ans.numIdEmpresa, dir:F.ans.direccionEmpresa, tel:F.ans.telefonoEmpresa, mail:F.ans.correo, mun:F.ans.municipioEmpresa, dep:F.ans.departamentoEmpresa, z:F.ans.zonaEmpresa, cn:F.ans.centroNombre, cm:F.ans.centroMismo, done:!!F.gdone.g0})")
    check("Mensaje de lectura acumulado (Llevo 16 de 16)", "Llevo 16 de 16" in " ".join(page.locator(".wa-bubble.in .txt").all_inner_texts()[-3:]))
    check("Lectura del guion 1: 16 datos extraídos por anclas y guion cerrado", g0["eps"] == "Sanitas" and g0["afp"] == "Porvenir" and g0["tv"] == "1" and g0["rs"] == "Panadería La Espiga" and g0["tid"] == "NI" and g0["nit"] == "900703762" and g0["dir"] == "Calle 12 No. 5-20" and g0["tel"] == "6014055911" and g0["mail"] == "contacto@laespiga.com" and g0["mun"] == "Soacha" and g0["dep"] == "Cundinamarca" and g0["z"] == "U" and g0["cn"] == "Sede principal" and g0["cm"] is True and g0["done"], g0)
    check("Guion 2 abierto automáticamente (sin complemento del centro)", page.locator("#guion-g2").count() == 1 and page.locator("#guion-g0c").count() == 0)
    # Guion 2 por dictado, con un dato inválido, uno dirigido («dato 14: …») y uno omitido
    guion_lee("planta")
    check("Cada dato dictado recibe acuse con el valor y la guía del siguiente", last_in().startswith("✅") and "Planta" in last_in() and "Ahora (primer y segundo apellido)" in last_in(), last_in())
    guion_lee("qué pasó?")
    check("«¿Qué pasó?» responde con el estado del guion (llevo x de y, faltan…) sin congelarse", "Llevo" in last_in() and "Dime ahora" in last_in(), last_in()[:120])
    guion_lee("repetir")
    check("«Repetir» en guion responde con el estado y NO se registra como dato", "Llevo" in last_in() and page.evaluate("F.ans.apellidos === undefined"), last_in()[:90])
    for v in ["rodríguez pérez", "juan carlos", "cédula", "1023456789", "31 de febrero de 1990"]: guion_lee(v)
    check("Dictado: fecha inexistente rechazada y espacio sigue vacío", "no existe" in last_in().lower() and page.evaluate("F.ans.fechaNacimiento === undefined"))
    for v in ["15 de marzo de 1990", "masculino", "carrera ocho número quince guion treinta", "omitir", "sí", "urbana", "ocupación: panadero", "panadero de horno", "dos años y tres meses", "1 de febrero de 2024", "un millón seiscientos mil", "diurna"]: guion_lee(v)
    g2 = page.evaluate("({tv:F.ans.tipoVinculacion, ap:F.ans.apellidos, fn:F.meta.fechaNacimiento.text, dir:F.ans.direccionTrabajador, tel:F.ans.telefonoTrabajador, pend:F.pending, cargo:F.ans.cargo, ocu:F.ans.ocupacionHabitual, dep:F.ans.departamentoTrabajador, done:!!F.gdone.g2, g3:document.querySelectorAll('#guion-g3').length})")
    check("Dictado: dato dirigido, omisión pendiente y avance en orden", g2["tv"] == "1" and g2["ap"] == "Rodríguez Pérez" and g2["fn"] == "15/03/1990" and g2["dir"] == "Carrera 8 No. 15-30" and g2["tel"] is None and "telefonoTrabajador" in g2["pend"] and g2["cargo"] == "Panadero de horno" and g2["ocu"] == "Panadero" and g2["dep"] == "Cundinamarca" and g2["done"] and g2["g3"] == 1, g2)
    guion_lee("el accidente ocurrió el día ayer, a las tres y media de la tarde, en jornada normal, cuando el trabajador sí estaba realizando su labor habitual y llevaba cuatro horas y media de trabajo ese día. fue un accidente de tipo propios del trabajo. el accidente no causó la muerte del trabajador. ocurrió sí en el mismo municipio de la sede principal, en zona urbana; el lugar fue dentro de la empresa, en el sitio área de producción")
    g3 = page.evaluate("({h:F.meta.horaAccidente.text, j:F.ans.jornadaSucede, lh:F.ans.laborHabitual, tl:F.meta.tiempoLaborado.text, ta:F.ans.tipoAccidente, m:F.ans.causoMuerte, am:F.ans.accMismo, z:F.ans.zonaAccidente, l:F.ans.lugar, s:F.ans.sitio, done:!!F.gdone.g3, g4:document.querySelectorAll('#guion-g4').length})")
    check("Lectura del guion 3 con sí/no incrustados y hora en palabras", g3["h"] == "15:30" and g3["j"] == "1" and g3["lh"] is True and g3["tl"] == "4 h 30 min" and g3["ta"] == "5" and g3["m"] is False and g3["am"] is True and g3["z"] == "U" and g3["l"] == "1" and g3["s"] == "2" and g3["done"] and g3["g4"] == 1, g3)
    page.wait_for_function("() => Voice.on"); page.evaluate("window.__srSay('El trabajador estaba cargando un bulto de harina de cincuenta kilos desde la bodega,')"); page.wait_for_timeout(250)
    page.wait_for_function("() => Voice.on"); page.evaluate("window.__srSay('al bajar la escalera resbaló con harina en el piso, se cayó y se golpeó la rodilla derecha, presentando un esguince y una herida en la mano')"); page.wait_for_timeout(250)
    check("Descripción larga: los fragmentos se acumulan sin cerrar el espacio", page.evaluate("F.ans.descripcion === undefined && F.longBuf.length > 100"))
    guion_lee("listo")
    check("«Listo» cierra la descripción con el texto completo", page.evaluate("(F.ans.descripcion||'').startsWith('El trabajador estaba cargando') && (F.ans.descripcion||'').includes('herida en la mano')"))
    pre = page.evaluate("({g:document.querySelectorAll('#guion-g3l .g-b.ok').length, m:F.ans.mecanismo, src:F.meta.mecanismo.src})")
    check("Clasificación pre-llenada desde la descripción (4 espacios)", pre["g"] == 4 and pre["m"] == "1" and pre["src"] == "inferido", pre)
    guion_lee("mecanismo: caída de objetos"); guion_lee("correcto")
    cls = page.evaluate("({m:F.ans.mecanismo, src:F.meta.mecanismo.src, l:F.meta.tipoLesion.src, g5:document.querySelectorAll('#guion-g5').length})")
    check("Corrección dirigida y confirmación de la clasificación", cls["m"] == "2" and cls["src"] == "voice" and cls["l"] == "inferido y confirmado" and cls["g5"] == 1, cls)
    # intermedio estable sin resultado final → se toma como respuesta; el final repetido no duplica
    page.wait_for_function("() => Voice.on"); n0 = page.locator(".wa-bubble.out").count(); page.evaluate("window.__srInterim('sí hubo personas que')"); page.wait_for_timeout(300)
    check("Un resultado intermedio solo se muestra en la barra, no se toma como respuesta", page.locator(".wa-bubble.out").count() == n0 and page.evaluate("document.getElementById('txtIn').value") == "sí hubo personas que")
    guion_lee("sí hubo personas que presenciaron el accidente")
    check("El resultado final de esa sesión se toma como respuesta", page.locator(".wa-bubble.out").count() == n0 + 1 and page.evaluate("F.ans.hayTestigos === true"))
    check("Guion de testigos leído → complemento del primer testigo", page.evaluate("F.ans.hayTestigos === true") and page.locator("#guion-g5a").count() == 1)
    # lo dicho mientras el asesor todavía escribe se retiene y se aplica al siguiente espacio
    page.wait_for_function("() => Voice.on"); page.evaluate("(() => { F.__cur = F.cur; F.cur = null; window.__srSay('gómez ana maría'); })()"); page.wait_for_timeout(60)
    check("Voz recibida sin pregunta activa queda retenida", page.evaluate("Voice.held && Voice.held.t") == "gómez ana maría")
    page.evaluate("(() => { F.cur = F.__cur; guionFocus(F.cur.g); })()"); page.wait_for_timeout(150)
    check("…y se aplica al reanudar", page.evaluate("F.ans.testigo1Nombre") == "Gómez Ana María")
    for v in ["cédula", "52123456", "auxiliar de producción", "no"]: guion_lee(v)
    guion_lee("diligencia este informe Villarraga Danna, identificado con cédula, con el número 39456789, con el cargo de gerente general")
    check("Al cerrar los guiones repregunta el dato omitido (teléfono)", "teléfono" in last_in().lower() and "faltan 1 dato" in " ".join(page.locator(".wa-bubble.in .txt").all_inner_texts()[-3:]), last_in()[:100])
    guion_lee("tres uno cero cuatro cinco seis siete ocho nueve cero")
    check("Resumen final listo", "Todo correcto" in last_in() and page.evaluate("F.ans.telefonoTrabajador") == "3104567890")
    guion_lee("sí"); page.locator(".wa-doc").wait_for(timeout=5000)
    faltan = page.evaluate("FURAT_FIELDS.filter(f=>furatApplicable(f)&&!f.opt&&F.ans[f.id]===undefined).map(f=>f.id)")
    check("FURAT completo por guiones: 0 obligatorios sin dato, 11 turnos de lectura/dictado menos", faltan == [] and page.evaluate("Object.keys(F.gdone).length") >= 7, faltan)
    txts = " ".join(page.locator(".wa-bubble.in .txt").all_inner_texts()[-4:])
    check("Recomendación final: investigar en 15 días (Res. 1401/2007) con los canales de ARL SURA", "1401" in txts and "15 días" in txts and "sura.co/arl" in txts, txts[:120])
    page.screenshot(path=f"{OUT}/furat_guion_chat.png")

    # ================= CONEXIÓN CON LA BASE DE LA ARL (simulada) =================
    page.click("#btnRestart"); page.wait_for_timeout(150)
    page.locator(".wa-actions .wa-action", has_text="FURAT").click(); page.wait_for_timeout(150)
    page.locator(".wa-actions .wa-action", has_text="guiones").click(); page.wait_for_timeout(150)
    page.locator(".wa-actions .wa-action", has_text="Activar micrófono").click(); page.wait_for_timeout(300)
    page.evaluate("window.__srSay('probando uno dos tres')"); page.wait_for_timeout(400)
    check("Identificación ofrecida antes de la entrevista", "NIT" in last_in() and "cédula" in last_in(), last_in()[:90])
    speak("setenta y siete doble cero siete veintinueve")
    page.wait_for_function("() => document.body.innerText.includes('Bienvenido')", timeout=8000); page.wait_for_timeout(150)
    ult = " ".join(page.locator(".wa-bubble.in .txt").all_inner_texts()[-4:])
    check("Cédula 7.700.729 → bienvenida con el nombre del empleador", "Bienvenido" in ult and "Ariel Javier Ramírez" in ult, ult[:120])
    check("Empresa encontrada en la base con NIT y trabajadores", "La Espiga" in ult and "900703762" in ult and "3 personas" in ult)
    page.locator(".wa-actions .wa-action").first.wait_for(timeout=5000)
    check("Selector del accidentado con nombre y cédula (tú o tus trabajadores)", page.locator(".wa-actions .wa-action").count() == 3 and "accidente mío" in page.locator(".wa-actions .wa-action").first.inner_text())
    speak("el accidente es de Juan Carlos")
    page.wait_for_function("() => F.cur && F.cur.id === '__centro'", timeout=8000)
    g = page.evaluate("({nit:F.ans.numIdEmpresa, eps:F.ans.eps, fn:F.meta.fechaNacimiento.text, dir:F.ans.direccionTrabajador, tel:F.ans.telefonoTrabajador, sal:F.ans.salario, resp:F.ans.responsableNombre, rnum:F.ans.responsableNumId, src:F.meta.numIdTrabajador.src})")
    check("Secciones AF, I, II y V descargadas de la base de la ARL", g["nit"] == "900703762" and g["eps"] == "Sanitas" and g["fn"] == "15/03/1990" and g["dir"] == "Carrera 8 No. 15-30" and g["tel"] == "3115557788" and g["sal"] == 1600000 and "Ramírez" in g["resp"] and g["rnum"] == "7700729" and g["src"].startswith("base ARL"), g)
    speak("sede principal")
    page.wait_for_function("() => F.cur && F.cur.id === '__revisarBase'", timeout=8000)
    check("Centro de trabajo: sede principal descargada", page.evaluate("F.ans.centroNombre") == "Sede principal" and page.evaluate("F.ans.centroMismo === true"))
    speak("continuar")
    page.wait_for_selector("#guion-g3", timeout=8000)
    solo34 = page.evaluate("FURAT_FIELDS.filter(f=>furatApplicable(f)&&!f.opt&&F.ans[f.id]===undefined).every(f=>['III','IV'].includes(f.sec))")
    check("Solo queda por preguntar el accidente (secciones III y IV)", solo34 and page.locator("#guion-g3").count() == 1)
    # pausa por voz y reanudación con contexto
    speak("parar")
    check("«Parar» por voz pausa el micrófono con confirmación", not page.evaluate("Voice.wanted") and "pausa" in last_in().lower(), last_in()[:80])
    page.click("#micBtn"); page.wait_for_function("() => Voice.on"); page.wait_for_timeout(300)
    check("Al reanudar retoma donde iba el dictado del párrafo", "Seguimos" in last_in() and "Dime ahora" in last_in(), last_in()[:110])
    guion_lee("el accidente ocurrió el día ayer, a las dos y veinte de la tarde, en jornada normal, cuando el trabajador sí estaba realizando su labor habitual y llevaba tres horas y veinte de trabajo ese día. fue un accidente de tipo propios del trabajo. el accidente no causó la muerte del trabajador. ocurrió sí en el mismo municipio de la sede principal, en zona urbana; el lugar fue dentro de la empresa, en el sitio área de producción")
    check("Guion del accidente con las formas coloquiales nuevas (14:20 y 3 h 20 min)", page.evaluate("F.meta.horaAccidente.text") == "14:20" and page.evaluate("F.meta.tiempoLaborado.text") == "3 h 20 min", page.evaluate("({h:F.meta.horaAccidente&&F.meta.horaAccidente.text, t:F.meta.tiempoLaborado&&F.meta.tiempoLaborado.text})"))
    guion_lee("El trabajador estaba sacando bandejas del horno")
    guion_lee("para")
    check("«Para» de hesitación durante la descripción NO pausa: se acumula al relato", page.evaluate("Voice.wanted") and page.evaluate("F.longBuf").endswith("para"), page.evaluate("F.longBuf")[-40:])
    guion_lee("cambiar la lata, se resbaló con harina en el piso y se golpeó la rodilla derecha presentando un esguince")
    guion_lee("listo")
    check("La descripción conserva el «para» narrativo", "horno para cambiar la lata" in page.evaluate("F.ans.descripcion || ''"), page.evaluate("(F.ans.descripcion||'').slice(0,80)"))
    guion_lee("correcto")
    guion_lee("no hubo personas que presenciaron el accidente")
    check("Testigos: no, y resumen final directo (responsable ya venía de la base)", "Todo correcto" in last_in(), last_in()[:80])
    speak("sí")
    page.locator(".wa-doc").last.wait_for(timeout=5000)
    check("FURAT generado desde la base ARL: completo", "Completo" in page.locator(".wa-doc-sub").last.inner_text())
    jj = page.evaluate("({resp:F.ans.responsableNombre, srcE:F.meta.eps.src, dia:F.ans.diaSemana})")
    check("Responsable del informe pre-diligenciado con el empleador identificado", "Ramírez" in jj["resp"] and jj["srcE"].startswith("base ARL"), jj)
    page.screenshot(path=f"{OUT}/furat_base_arl.png")

    # Campos pendientes tras tres rondas → PENDIENTE en rojo
    page.click("#btnRestart"); page.wait_for_timeout(150)
    page.locator(".wa-actions .wa-action", has_text="FURAT").click(); page.wait_for_timeout(150)
    page.locator(".wa-actions .wa-action", has_text="Pregunta a pregunta").click(); page.wait_for_timeout(150)
    page.locator(".wa-actions .wa-action", has_text="Activar micrófono").click(); page.wait_for_timeout(250)
    page.evaluate("window.__srSay('probando uno dos tres')"); page.wait_for_timeout(400)
    speak("omitir")  # sin base ARL
    page.evaluate("""() => { FURAT_FIELDS.forEach(f => { if (f.id !== 'eps') { F.ans[f.id] = f.type==='bool' ? false : f.type==='date' ? {d:1,m:1,y:2024} : f.type==='multi' ? ['10'] : f.type==='enum' ? OPT[f.opts][0].c : 'x'; F.meta[f.id] = {text:'x', src:'text'}; } }); }""")
    for _ in range(3): speak("omitir")
    page.wait_for_timeout(100)
    check("Tres omisiones → campo marcado PENDIENTE y aviso", page.evaluate("F.ans.eps") == "PENDIENTE" and any("PENDIENTE" in x for x in page.locator(".wa-bubble.in .txt").all_inner_texts()), page.evaluate("({eps:F.ans.eps, ronda:F.ronda, phase:F.phase})"))
    pd = page.evaluate("(() => { const fa = F.ans.fechaAccidente, dm = F.meta.diaSemana; F.ans.fechaAccidente = 'PENDIENTE'; furatDerivar(); const r = { file: furatFileBase(), dia: F.ans.diaSemana === undefined }; F.ans.fechaAccidente = fa; F.meta.diaSemana = dm; furatDerivar(); return r; })()")
    check("Fecha PENDIENTE no produce «undefined» en derivados ni en el nombre de archivo", "undefined" not in pd["file"] and pd["dia"], pd)
    page.click("#btnRestart"); page.wait_for_timeout(200)
    check("Reiniciar con un FURAT en curso pide confirmación", page.locator(".wa-actions .wa-action", has_text="borrar y reiniciar").count() == 1)
    page.locator(".wa-actions .wa-action", has_text="Seguir con el FURAT").click(); page.wait_for_timeout(200)
    check("«Seguir con el FURAT» conserva los datos", page.evaluate("F.phase") == "confirm" and page.evaluate("Object.keys(F.ans).length") > 10)
    page.click("#btnRestart"); page.wait_for_timeout(200)
    page.locator(".wa-actions .wa-action", has_text="borrar y reiniciar").click(); page.wait_for_timeout(250)
    check("Al confirmar el reinicio se libera el micrófono y el vigilante", page.evaluate("!Voice.wanted && !Voice.on && !Voice.stream && Voice.guard === null"))

    # Abierto desde el disco (file://): aviso explícito y sin manos libres
    fp = ctx.new_page(); fp.emulate_media(reduced_motion="reduce"); fp.add_init_script(MOCK_SR); fp.goto("file://" + HTML); fp.wait_for_timeout(500); fp.evaluate("S.speed=0")
    fp.locator(".wa-actions .wa-action", has_text="FURAT").click(); fp.wait_for_timeout(150)
    fp.locator(".wa-actions .wa-action", has_text="Pregunta a pregunta").click(); fp.wait_for_timeout(150)
    fp.locator(".wa-actions .wa-action", has_text="Activar micrófono").click(); fp.wait_for_timeout(300)
    check("file:// (archivo abierto directamente): manos libres activo con el micrófono autorizado", fp.evaluate("Voice.handsFree && Voice.on && Voice.primed") and "Prueba rápida" in " ".join(fp.locator(".wa-bubble.in .txt").all_inner_texts()[-2:]))
    n1 = fp.evaluate("window.__srStarts"); fp.evaluate("window.__srEnd()"); fp.wait_for_timeout(400)
    check("file://: si Chrome cierra la sesión por silencio, se reenciende sola", fp.evaluate("window.__srStarts") == n1 + 1 and fp.evaluate("Voice.on"))
    fp.evaluate("window.__srSay('probando uno dos tres')"); fp.wait_for_timeout(400); fp.wait_for_function("() => Voice.on")
    fp.evaluate("(() => { const r = window.__srActive; r.onerror({error:'not-allowed'}); window.__srEnd(); })()"); fp.wait_for_timeout(400)
    n2 = fp.evaluate("window.__srStarts")
    check("Permiso denegado: no reintenta en bucle y avisa cómo seguir", fp.evaluate("!Voice.on && Voice.fatal") and "acceso al micrófono" in " ".join(fp.locator(".wa-bubble.in .txt").all_inner_texts()[-2:]))
    fp.fill("#txtIn", "diagnóstico"); fp.press("#txtIn", "Enter"); fp.wait_for_timeout(300)
    check("«diagnóstico» muestra navegador, estado, último error y eventos", "Diagnóstico de voz" in fp.locator(".wa-bubble.in .txt").last.inner_text() and "not-allowed" in fp.locator(".wa-bubble.in .txt").last.inner_text())
    fp.click("#micBtn"); fp.wait_for_timeout(500)
    check("Tras permiso denegado, un toque re-pide el permiso y reactiva la voz", fp.evaluate("Voice.primed && Voice.on && !Voice.fatal"))

    # Sin soporte de voz: respaldo por teclado
    nv = ctx.new_page(); nv.emulate_media(reduced_motion="reduce"); nv.add_init_script("delete window.SpeechRecognition; delete window.webkitSpeechRecognition;"); servir(nv); nv.goto(URL); nv.wait_for_timeout(500); nv.evaluate("S.speed=0")
    nv.locator(".wa-actions .wa-action", has_text="FURAT").click(); nv.wait_for_timeout(150)
    nv.locator(".wa-actions .wa-action", has_text="Pregunta a pregunta").click(); nv.wait_for_timeout(150)
    check("Sin SpeechRecognition: aviso y entrada por teclado", "no soporta" in " ".join(nv.locator(".wa-bubble.in .txt").all_inner_texts()))
    nv.fill("#txtIn", "omitir"); nv.press("#txtIn", "Enter"); nv.wait_for_timeout(150)
    nv.fill("#txtIn", "Compensar"); nv.press("#txtIn", "Enter"); nv.wait_for_timeout(100)
    check("Respuesta escrita registrada", nv.evaluate("F.ans.eps") == "Compensar")
    b.close()

check("Sin errores de página ni de consola", not errors and not console, (errors + console) or "0")
fails = [r for r in results if not r[1]]
print(f"\n{len(results)-len(fails)}/{len(results)} verificaciones superadas · salida en {OUT}")
sys.exit(1 if fails else 0)
