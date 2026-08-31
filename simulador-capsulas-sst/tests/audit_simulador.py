"""
Auditoría funcional del Simulador Cápsulas SST (Rehavid S.A.S.)
Uso: python3 audit_simulador.py simulador_capsulas_sst_v9.html [carpeta_salida]

Requiere: pip install playwright && playwright install chromium
Verifica: errores de consola, integridad de grafos de cápsulas y datos GTC 45,
flujo completo de la matriz (modo estándar y modo con NE declarado), exportes PDF/XLSX/CSV,
accesibilidad básica del diálogo, reinicio en móvil y respuesta sin conexión.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

HTML = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist", "simulador_capsulas_sst_v20.html"))
OUT = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else "audit_out")
os.makedirs(OUT, exist_ok=True)
URL = "file://" + HTML
errors, console, results = [], [], []

def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (" — " + str(detail) if detail else ""))

def click_opt(page, text=None, index=None):
    btns = page.locator(".wa-actions .wa-action")
    btns.first.wait_for(timeout=8000)
    (page.locator(".wa-actions .wa-action", has_text=text).first if text is not None else btns.nth(index)).click()
    page.wait_for_timeout(80)

def walk_matrix(page, sector, personas, answers, freq=None):
    click_opt(page, "matriz"); click_opt(page, sector); click_opt(page, personas)
    for i, a in enumerate(answers):
        click_opt(page, index=a)
        if freq is not None:
            page.wait_for_timeout(60)
            if page.locator(".wa-actions .wa-action", has_text="jornada").count():
                click_opt(page, index=freq[i])
    page.locator(".wa-doc").wait_for(timeout=8000)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1380, "height": 900}, accept_downloads=True, locale="es-CO")
    page = ctx.new_page(); page.emulate_media(reduced_motion="reduce")
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: console.append(f"{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    page.goto(URL); page.wait_for_timeout(700)

    # 1. Integridad de contenido
    issues = page.evaluate("""() => {
      const out=[];
      for(const [cid,c] of Object.entries(CAPSULAS)){
        const ids=new Set(Object.keys(c.nodes));
        if(!ids.has(c.inicio)) out.push(cid+': inicio inexistente');
        for(const [nid,n] of Object.entries(c.nodes)){
          if(!n.msgs||!n.msgs.length) out.push(cid+'/'+nid+': sin mensajes');
          if(n.next&&!ids.has(n.next)) out.push(cid+'/'+nid+': next inexistente');
          if(n.opciones) n.opciones.forEach(o=>{ if(!ids.has(o.next)) out.push(cid+'/'+nid+': opción a nodo inexistente'); });
          if(nid==='quiz'&&!(n.opciones||[]).some(o=>o.correcta)) out.push(cid+'/quiz: sin respuesta correcta');
        }
        const seen=new Set(), st=[c.inicio];
        while(st.length){const x=st.pop(); if(seen.has(x))continue; seen.add(x); const n=c.nodes[x]; if(!n)continue; if(n.next)st.push(n.next); if(n.opciones)n.opciones.forEach(o=>st.push(o.next));}
        Object.keys(c.nodes).forEach(nid=>{ if(!seen.has(nid)) out.push(cid+'/'+nid+': inalcanzable'); });
      }
      const ids=new Set();
      for(const [sid,s] of Object.entries(SECTORES)) s.peligros.forEach((p,i)=>{
        if(ids.has(p.id)) out.push('ID duplicado '+p.id); ids.add(p.id);
        if(![10,25,60,100].includes(p.nc)) out.push(p.id+': NC inválido');
        ['pr','zo','ac','ta','ru','cl','de','ef','pe','rl','e1','e2','e3','e4','e5','q'].forEach(k=>{ if(!p[k]) out.push(p.id+': falta '+k); });
        if(!p.ops||p.ops.length<3) out.push(p.id+': menos de 3 opciones');
        (p.ops||[]).forEach(o=>{ if(!o.na && (!([10,6,2].includes(o.nd)||o.nd==='B') || ![4,3,2,1].includes(o.ne) || !o.c)) out.push(p.id+': opción inválida '+JSON.stringify(o)); });
      });
      return out; }""")
    check("Integridad de cápsulas y datos GTC 45", not issues, issues or f"{page.evaluate('Object.values(SECTORES).reduce((a,s)=>a+s.peligros.length,0)')} peligros verificados")

    # 2. Tabla de valoración GTC 45 (Tabla 8): NR -> nivel
    tabla = page.evaluate("""() => { const c=[]; for(const np of [40,30,24,20,18,12,10,8,6,4,2]) for(const nc of [100,60,25,10]) c.push([np,nc,np*nc,GTC45.nivel(np*nc)]); return c; }""")
    esperado = lambda nr: "I" if nr >= 600 else "II" if nr >= 150 else "III" if nr >= 40 else "IV"
    check("Niveles GTC 45 (44 combinaciones NP×NC)", all(niv == esperado(nr) for _, _, nr, niv in tabla))
    check("ND Bajo → nivel IV sin NR", page.evaluate("JSON.stringify(GTC45.valorar('B',4,100))") == '{"nd":"B","ne":4,"np":"—","npI":"Bajo (controlado)","nc":100,"nr":"—","nrNum":0,"niv":"IV","acc":"Aceptable"}')

    # 3. Clasificación de controles existentes (todas las opciones)
    clas = page.evaluate("""() => { const rows=[]; for(const s of Object.values(SECTORES)) for(const p of s.peligros) for(const o of p.ops){ if(o.na) continue; const c=clasificarControl(o.c,o.nd); rows.push([p.id,o.nd,o.c,c.f,c.m,c.i]); } return rows; }""")
    open(f"{OUT}/clasificacion_controles.csv", "w", encoding="utf-8").write("\ufeffID;ND;Control declarado;Fuente;Medio;Individuo\r\n" + "\r\n".join(";".join(str(x) for x in r) for r in clas))
    check("Clasificación de controles calculada", len(clas) == 117, f"{len(clas)} opciones → clasificacion_controles.csv")

    # 4. Flujo matriz (modo estándar)
    page.evaluate("S.speed=0")
    walk_matrix(page, "Panadería", "6 a 10", [0, 1, 2, 0, 1, 2, 0, 1, 0])
    last = page.locator(".wa-bubble.in .txt").all_inner_texts()
    resumen = [t for t in last if "Identifiqué" in t]
    check("Mensaje de resultado por niveles", resumen and "nivel I" in resumen[-1], resumen[-1] if resumen else "")
    rows = page.evaluate("S.rows.map(r=>({id:r.id,nd:r.nd,ne:r.ne,np:r.np,nc:r.nc,nr:r.nr,niv:r.niv,cf:r.cf,cm:r.cm,ci:r.ci}))")
    check("Filas ordenadas por NR descendente", all(rows[i]["nr"] >= rows[i+1]["nr"] for i in range(len(rows)-1)), f"{len(rows)} filas")
    check("NR = ND×NE×NC en todas las filas", all(r["nr"] == r["nd"]*r["ne"]*r["nc"] for r in rows))
    check("Controles tipo máquina/ayuda mecánica van a Fuente (p. ej. amasadora)", any(r[0] == "PAN-01" and r[1] == 2 and "Amasadora" in r[3] and "Amasadora" not in r[5] for r in clas))
    check("Botón 'Volver al inicio' tras el documento", page.locator(".wa-actions .wa-action", has_text="Volver al inicio").count() == 1)
    page.screenshot(path=f"{OUT}/desktop_chat.png")

    # 5. Diálogo: foco, cierre con Esc, restauración de foco
    page.locator(".wa-doc").click(); page.wait_for_timeout(200)
    check("Diálogo con role=dialog y foco en Cerrar", page.evaluate("document.activeElement.id") == "mtxClose" and page.evaluate("document.getElementById('mtxDialog').getAttribute('role')") == "dialog")
    page.keyboard.press("Shift+Tab"); page.wait_for_timeout(50)
    check("Trampa de foco (Shift+Tab desde Cerrar va al último control)", page.evaluate("document.activeElement.className") in ("matriz-scroll",) or page.evaluate("document.activeElement.id") in ("btnPrint",) or page.evaluate("$('mtxDialog').contains(document.activeElement)"))
    page.screenshot(path=f"{OUT}/modal.png")
    with page.expect_download(timeout=15000) as d: page.click("#btnCsv")
    d.value.save_as(f"{OUT}/matriz.csv"); csv = open(f"{OUT}/matriz.csv", encoding="utf-8-sig").read().splitlines()
    check("CSV: encabezado de 28 columnas y filas", csv[0].count(";") == 27 and len(csv) == len(rows) + 1, d.value.suggested_filename)
    with page.expect_download(timeout=30000) as d: page.click("#btnXlsx")
    d.value.save_as(f"{OUT}/matriz.xlsx"); check("XLSX descargado", os.path.getsize(f"{OUT}/matriz.xlsx") > 5000, d.value.suggested_filename)
    with page.expect_download(timeout=30000) as d: page.click("#btnPdf")
    d.value.save_as(f"{OUT}/matriz.pdf"); check("PDF descargado", os.path.getsize(f"{OUT}/matriz.pdf") > 20000, d.value.suggested_filename)
    page.keyboard.press("Escape"); page.wait_for_timeout(150)
    check("Esc cierra y devuelve el foco al documento del chat", page.evaluate("document.getElementById('mtxModal').hidden") and page.evaluate("document.activeElement.className") == "wa-doc")
    click_opt(page, "Volver al inicio")
    check("Volver al inicio reinicia el chat", page.locator(".wa-actions .wa-action", has_text="cápsula").count() == 1)

    # 6. Modo NE declarado (CONFIG.preguntarFrecuencia = true)
    page.evaluate("CONFIG.preguntarFrecuencia=true")
    walk_matrix(page, "Oficina", "1 a 5", [1, 1, 1, 1, 1, 1], freq=[0, 1, 2, 3, 0, 0])
    r2 = page.evaluate("S.rows.map(r=>({id:r.id,ne:r.ne,d:r.neDeclarado}))")
    check("NE declarado por peligro (sismo con NE fijo = 1)", all(r["d"] for r in r2 if r["id"] != "OFI-06") and any(r["id"] == "OFI-06" and r["ne"] == 1 and not r["d"] for r in r2), r2)
    page.evaluate("CONFIG.preguntarFrecuencia=false")
    click_opt(page, "Volver al inicio")

    # 7. Cápsulas: todas las ramas, todas terminan con "Volver al inicio"
    for cid in page.evaluate("Object.keys(CAPSULAS)"):
        name = page.evaluate(f"CAPSULAS['{cid}'].nombre")
        page.click("#btnRestart"); page.wait_for_timeout(120)
        click_opt(page, "cápsula"); click_opt(page, name)
        for _ in range(12):
            try:
                page.locator(".wa-actions .wa-action").first.wait_for(timeout=1500)
                if page.locator(".wa-actions .wa-action", has_text="Volver al inicio").count(): break
                click_opt(page, index=0)
            except Exception: break
        check(f"Cápsula '{name}' termina con botón de inicio", page.locator(".wa-actions .wa-action", has_text="Volver al inicio").count() == 1, f"{page.locator('.wa-bubble.in').count()} mensajes")

    # 8. Sin conexión: librerías y fuente incrustadas → la app no pide red y los tres exportes funcionan
    off = ctx.new_page(); off.emulate_media(reduced_motion="reduce")
    off.on("pageerror", lambda e: errors.append("offline: " + str(e)))
    reqs = []
    off.on("request", lambda r: reqs.append(r.url) if not r.url.startswith(("file://", "data:")) else None)
    ctx.set_offline(True)
    off.goto(URL); off.wait_for_timeout(500); off.evaluate("S.speed=0")
    walk_matrix(off, "Restaurante", "1 a 5", [0, 0, 0, 0, 0, 0, 0, 0])
    off.locator(".wa-doc").click(); off.wait_for_timeout(150)
    with off.expect_download(timeout=30000) as d: off.click("#btnPdf")
    okpdf = d.value.suggested_filename.endswith(".pdf")
    with off.expect_download(timeout=30000) as d: off.click("#btnXlsx")
    okx = d.value.suggested_filename.endswith(".xlsx")
    with off.expect_download(timeout=15000) as d: off.click("#btnCsv")
    okcsv = d.value.suggested_filename.endswith(".csv")
    ctx.set_offline(False)
    check("Sin red: cero peticiones externas y PDF, Excel y CSV se generan igual", okpdf and okx and okcsv and reqs == [], reqs or "0 peticiones")

    # 9. Móvil: reinicio accesible
    m = ctx.new_page(); m.emulate_media(reduced_motion="reduce"); m.set_viewport_size({"width": 390, "height": 844}); m.goto(URL); m.wait_for_timeout(500)
    m.screenshot(path=f"{OUT}/mobile.png")
    check("Móvil: botón de retroceso (‹) visible para reiniciar", m.locator("#waBack").is_visible())
    m.evaluate("S.speed=0"); click_opt(m, "cápsula"); m.click("#waBack"); m.wait_for_timeout(200)
    check("Móvil: ‹ reinicia la conversación", m.locator(".wa-actions .wa-action", has_text="cápsula").count() == 1)
    b.close()

check("Sin errores de página ni de consola", not errors and not console, (errors + console) or "0 errores")
fails = [r for r in results if not r[1]]
print(f"\n{len(results)-len(fails)}/{len(results)} verificaciones superadas · salida en {OUT}")
sys.exit(1 if fails else 0)
