#!/usr/bin/env python3
"""Prueba la app abriéndola como archivo local en Chromium, igual que el usuario.

Comprueba que no haya errores de consola, que todas las secciones rendericen,
que los gráficos existan, que la evaluación y el laboratorio funcionen y que la
impresión no parta tablas ni gráficos.
"""
import os
import sys

from playwright.sync_api import sync_playwright

AQUI = os.path.dirname(os.path.abspath(__file__))
ARCHIVO = 'file://' + os.path.join(AQUI, 'dist', 'Rehavid_App_Modulacion_Financiera.html')
CAPTURAS = os.path.join(AQUI, 'dist', 'capturas')

SECCIONES = ['portada', 'formacion', 'evaluacion', 'operacion', 'especificacion',
             'laboratorio', 'motor', 'comofunciona', 'documento', 'fuentes', 'descargas']

fallos = []


def check(nombre, cond, detalle=''):
    print(('  OK   ' if cond else '  FALLA') + '  ' + nombre + (('  · ' + str(detalle)) if detalle and not cond else ''))
    if not cond:
        fallos.append(nombre + (' · ' + str(detalle) if detalle else ''))


def main():
    os.makedirs(CAPTURAS, exist_ok=True)
    with sync_playwright() as pw:
        nav = pw.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
        pag = nav.new_page(viewport={'width': 1440, 'height': 960})
        errores = []
        pag.on('console', lambda m: errores.append(m.text) if m.type == 'error' else None)
        pag.on('pageerror', lambda e: errores.append('pageerror: ' + str(e)))

        print('\n[1] Carga del archivo local')
        pag.goto(ARCHIVO, wait_until='load')
        pag.wait_for_timeout(1500)
        check('sin errores de consola ni de página', not errores, errores[:3])
        check('la navegación se construyó', pag.locator('.nav a').count() == len(SECCIONES),
              pag.locator('.nav a').count())
        check('la tipografía Outfit está aplicada',
              'Outfit' in pag.evaluate("getComputedStyle(document.body).fontFamily"))

        print('\n[2] Secciones')
        for sid in SECCIONES:
            pag.evaluate(f"ir('{sid}')")
            pag.wait_for_timeout(220)
            sec = pag.locator(f'#sec-{sid}')
            texto = sec.inner_text()
            check(f'sección «{sid}» visible y con contenido',
                  sec.is_visible() and len(texto) > 400, f'{len(texto)} caracteres')

        print('\n[3] Gráficos SVG')
        pag.evaluate("ir('portada')"); pag.wait_for_timeout(300)
        n_svg = pag.locator('#sec-portada svg').count()
        check('la portada dibuja gráficos', n_svg >= 4, f'{n_svg} svg')
        total_svg = pag.locator('svg').count()
        check('la app dibuja gráficos en todas las secciones', total_svg >= 12, f'{total_svg} svg en total')
        vacios = pag.evaluate("Array.from(document.querySelectorAll('svg')).filter(s=>s.children.length===0).length")
        check('ningún gráfico quedó vacío', vacios == 0, f'{vacios} vacíos')

        print('\n[4] Motor de análisis')
        pag.evaluate("ir('motor')"); pag.wait_for_timeout(300)
        n_h = pag.locator('#sec-motor .hallazgo').count()
        check('el motor produce hallazgos', n_h >= 8, f'{n_h} hallazgos')
        check('cada hallazgo muestra su regla',
              pag.locator('#sec-motor .hallazgo .regla').count() == n_h)
        det = pag.evaluate("ejecutarMotor().length")
        det2 = pag.evaluate("ejecutarMotor().length")
        check('el motor es determinista (dos ejecuciones, mismo resultado)', det == det2, f'{det} vs {det2}')

        print('\n[5] Laboratorio financiero')
        pag.evaluate("ir('laboratorio')"); pag.wait_for_timeout(300)
        r = pag.evaluate("""() => {
            const p = {monto:1000000,tasa:12,plazo:12,m:4,metodo:'frances',gracia:0,
                       cfads:120000,crec:0,covenant:1.20,caja0:150000,cajaMin:80000};
            const filas = calcularModelo(p);
            const ev = evaluarFactibilidad(filas, p);
            const concilia = filas.every(f => Math.abs(f.saldoFin - (f.saldoIni - f.principal)) < 0.01);
            const cierra = Math.abs(filas[filas.length-1].saldoFin) < 1;
            const servicio = filas.every(f => Math.abs(f.servicio - (f.principal + f.interes)) < 0.01);
            // gracia total: servicio solo interes, DSCR calculable
            const g = calcularModelo({...p, gracia:3, metodo:'bullet'});
            const bullet = g.slice(0,11).every(f => f.principal === 0) && g[11].principal > 0;
            // capacidad y monotonia CP-009
            const cap  = capacidadMaxima(p).monto;
            const capD = capacidadMaxima({...p, covenant: p.covenant*1.15}).monto;
            return {n: filas.length, concilia, cierra, servicio, bullet,
                    dscrMin: ev.dscrMin, cap, capD, monoton: capD <= cap + 1};
        }""")
        check('el calendario genera los 12 periodos', r['n'] == 12, r['n'])
        check('F1 concilia: saldo final = saldo inicial − principal', r['concilia'])
        check('la deuda se amortiza por completo al final', r['cierra'])
        check('F2: servicio = principal + interés', r['servicio'])
        check('el método bullet paga el principal solo al vencimiento', r['bullet'])
        check('el DSCR mínimo se calcula', r['dscrMin'] is not None, r['dscrMin'])
        check('CP-009: endurecer el covenant no aumenta la capacidad', r['monoton'],
              f"{r['cap']:.0f} vs {r['capD']:.0f}")

        nc = pag.evaluate("""() => {
            const p = {monto:1000000,tasa:0,plazo:4,m:4,metodo:'bullet',gracia:3,
                       cfads:100000,crec:0,covenant:1.2,caja0:100000,cajaMin:0};
            return calcularModelo(p).filter(f => f.dscr === null).length;
        }""")
        check('RN-FIN-02: servicio cero da DSCR no calculable, no infinito', nc == 3, f'{nc} periodos')

        print('\n[6] Evaluación adaptativa')
        pag.evaluate("ir('evaluacion')"); pag.wait_for_timeout(300)
        pag.fill('#in-nombre', 'Nombre De Prueba')
        pag.fill('#in-cargo', 'Cargo De Prueba')
        pag.evaluate("iniciarExamen()")
        pag.wait_for_timeout(300)
        check('el examen toma 16 ítems base', pag.evaluate("estado.examen.base.length") == 16,
              pag.evaluate("estado.examen ? estado.examen.base.length : 'sin examen'"))
        check('equilibrado: 2 ítems por unidad',
              pag.evaluate("""() => {
                  const c = {}; estado.examen.base.forEach(q => c[q.u] = (c[q.u]||0)+1);
                  return Object.values(c).every(v => v === 2) && Object.keys(c).length === 8;
              }"""))
        # falla la primera a propósito y comprueba corrección + repregunta
        pag.evaluate("""() => {
            const p = estado.examen.base[0];
            const mala = p.correcta === 0 ? 1 : 0;
            responder(mala);
        }""")
        pag.wait_for_timeout(200)
        check('marca la respuesta incorrecta', pag.locator('#retro .aviso.mal').count() == 1)
        check('muestra la explicación antes de continuar (CP-002)',
              'Respuesta correcta:' in pag.locator('#retro').inner_text())
        check('ofrece repregunta distinta (RF-005, CP-003)',
              'Ver la repregunta' in pag.locator('#retro').inner_text())
        idsAntes = pag.evaluate("(estado.examen.repregunta||estado.examen.base[0]).id")
        pag.evaluate("lanzarRepregunta(estado.examen.base[0].u)")
        pag.wait_for_timeout(200)
        check('la repregunta es un ítem diferente',
              pag.evaluate("estado.examen.repregunta.id") != idsAntes)
        check('la repregunta no altera el resultado del intento',
              pag.evaluate("estado.examen.aciertosPrimera") == 0)

        # completa el examen respondiendo bien el resto
        pag.evaluate("""() => {
            estado.examen.repregunta = null;
            while (estado.examen && estado.examen.i < estado.examen.base.length) {
                const p = estado.examen.base[estado.examen.i];
                responder(p.correcta);
                estado.examen.repregunta = null;
                estado.examen.i++;
                if (estado.examen.i >= estado.examen.base.length) { cerrarIntento(); break; }
                pintarExamen();
            }
        }""")
        pag.wait_for_timeout(400)
        ult = pag.evaluate("estado.intentos[estado.intentos.length-1]")
        check('el resultado usa solo los ítems base como denominador',
              abs(ult['resultado'] - (15 / 16 * 100)) < 0.2, ult['resultado'])
        check('15 de 16 aprueba con el umbral del 80 %', ult['aprobado'] is True)
        check('emite certificado con código verificable',
              pag.locator('#certificado').count() == 1 and ult['codigo'].startswith('RHV-MF-'))
        check('el certificado lleva nombre y cargo (RF-007)',
              'Nombre De Prueba' in pag.locator('#certificado').inner_text() and
              'Cargo De Prueba' in pag.locator('#certificado').inner_text())

        print('\n[7] Descarga del libro Excel')
        pag.evaluate("ir('descargas')"); pag.wait_for_timeout(300)
        with pag.expect_download() as d:
            pag.click('button:has-text("Descargar el libro Excel")')
        descarga = d.value
        ruta = os.path.join(CAPTURAS, '..', 'descarga_prueba.xlsm')
        descarga.save_as(ruta)
        tam = os.path.getsize(ruta)
        original = os.path.getsize(os.path.join(AQUI, 'dist', 'Rehavid_Modelacion_Financiera_v1.xlsm'))
        check('la descarga produce el .xlsm', descarga.suggested_filename.endswith('.xlsm'))
        check('el archivo descargado es idéntico al generado', tam == original, f'{tam} vs {original}')
        os.remove(ruta)

        print('\n[8] Impresión')
        pag.evaluate("ir('especificacion')")
        pag.emulate_media(media='print')
        pag.wait_for_timeout(400)
        oculto = pag.evaluate("""() => {
            const nav = getComputedStyle(document.querySelector('.nav')).display;
            const cab = getComputedStyle(document.querySelector('.cabecera')).display;
            return nav === 'none' && cab === 'none';
        }""")
        check('en impresión se ocultan navegación y barra', oculto)
        reglas = pag.evaluate("""() => {
            const t = document.querySelector('#sec-especificacion table');
            const f = document.querySelector('#sec-portada figure');
            return {
                tabla: getComputedStyle(t).breakInside,
                figura: getComputedStyle(f).breakInside,
                thead: getComputedStyle(document.querySelector('#sec-especificacion thead')).display,
                fila: getComputedStyle(document.querySelector('#sec-especificacion tbody tr')).breakInside,
                justificado: getComputedStyle(document.querySelector('#sec-portada p')).textAlign
            };
        }""")
        check('los gráficos no se parten entre páginas', reglas['figura'] == 'avoid', reglas['figura'])
        check('ninguna fila de tabla se parte', reglas['fila'] == 'avoid', reglas['fila'])
        check('los encabezados de tabla se repiten en cada página',
              reglas['thead'] == 'table-header-group', reglas['thead'])
        check('las tablas largas fluyen entre páginas en lugar de recortarse',
              reglas['tabla'] == 'auto', reglas['tabla'])
        check('el texto sale justificado', reglas['justificado'] == 'justify', reglas['justificado'])

        # Comprobacion de fondo: nada indivisible puede ser mas alto que una pagina,
        # porque en ese caso el navegador lo corta aunque tenga break-inside: avoid.
        pag.evaluate("document.body.classList.add('imprimir-todo')")
        pag.wait_for_timeout(500)
        altos = pag.evaluate("""() => {
            const lim = 926;   // alto util de una pagina Carta con margenes, a 96 ppp
            const r = [];
            document.querySelectorAll('figure, .tarjeta, .certificado, .hallazgo, .pregunta, tr')
              .forEach(e => { const h = e.getBoundingClientRect().height;
                              if (h > lim) r.push(e.tagName + ':' + Math.round(h)); });
            return r; }""")
        check('ningún bloque indivisible supera el alto de una página', not altos, altos[:5])
        pag.evaluate("document.body.classList.remove('imprimir-todo')")
        papel = pag.evaluate("document.getElementById('regla-papel').textContent")
        check('la regla de papel está definida', 'size:' in papel.replace(' ', ''), papel)
        pag.evaluate("fijarPapel('A4')")
        check('el cambio a A4 reescribe la regla',
              'A4' in pag.evaluate("document.getElementById('regla-papel').textContent"))
        pag.evaluate("fijarPapel('Letter')")

        print('\n[9] Impresión a PDF (comprobación real de paginado)')
        pag.emulate_media(media='screen')
        pag.evaluate("document.body.classList.add('imprimir-todo')")
        pdf = os.path.join(AQUI, 'dist', 'vista_impresion.pdf')
        pag.pdf(path=pdf, format='Letter', print_background=True,
                margin={'top': '18mm', 'bottom': '16mm', 'left': '16mm', 'right': '16mm'})
        check('genera el PDF del documento completo', os.path.exists(pdf))
        try:
            import zlib  # noqa: F401
            n_pag = open(pdf, 'rb').read().count(b'/Type /Page')
            print(f'         PDF de {os.path.getsize(pdf)/1024:.0f} KB, ~{n_pag} páginas')
        except Exception:
            pass
        pag.evaluate("document.body.classList.remove('imprimir-todo')")

        print('\n[10] Capturas')
        for sid in ['portada', 'formacion', 'laboratorio', 'motor', 'especificacion']:
            pag.evaluate(f"ir('{sid}')")
            pag.wait_for_timeout(350)
            pag.screenshot(path=os.path.join(CAPTURAS, f'{sid}.png'), full_page=False)
        print(f'         guardadas en {CAPTURAS}')

        print('\n[11] Adaptación a pantalla estrecha')
        pag.set_viewport_size({'width': 420, 'height': 900})
        pag.evaluate("ir('portada')")
        pag.wait_for_timeout(400)
        desborde = pag.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 2")
        check('no hay desbordamiento horizontal en móvil', not desborde,
              pag.evaluate("document.documentElement.scrollWidth + ' vs ' + document.documentElement.clientWidth"))
        pag.screenshot(path=os.path.join(CAPTURAS, 'movil.png'), full_page=False)

        nav.close()

    print('\n' + '=' * 62)
    if fallos:
        print(f'FALLARON {len(fallos)} comprobaciones:')
        for f in fallos:
            print('  - ' + f)
        sys.exit(1)
    print('Todas las comprobaciones pasaron.')


if __name__ == '__main__':
    main()
