#!/usr/bin/env python3
"""Prueba la app abriéndola como archivo local en Chromium, igual que el usuario.

Tres módulos: Formación, Manual de operación y Herramienta financiera.
"""
import os
import sys

from playwright.sync_api import sync_playwright

AQUI = os.path.dirname(os.path.abspath(__file__))
ARCHIVO = 'file://' + os.path.join(AQUI, 'dist', 'Rehavid_App_Modulacion_Financiera.html')
CAPTURAS = os.path.join(AQUI, 'dist', 'capturas')
CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

SECCIONES = {
    'formacion':   ['f-ruta', 'f-unidad', 'f-actividades', 'f-rs', 'f-glosario', 'f-evaluacion', 'f-certificado'],
    'manual':      ['m-uso', 'm-roles', 'm-rutas', 'm-estados', 'm-errores', 'm-rs', 'm-calidad', 'm-doc'],
    'herramienta': ['h-panel', 'h-proyecto', 'h-supuestos', 'h-deuda', 'h-flujo', 'h-covenants', 'h-liquidez',
                    'h-capacidad', 'h-escenarios', 'h-simulacion', 'h-auditoria', 'h-backtest',
                    'h-decision', 'h-reportes'],
}
fallos = []


def check(nombre, cond, detalle=''):
    print(('  OK   ' if cond else '  FALLA') + '  ' + nombre +
          (('  · ' + str(detalle)) if detalle and not cond else ''))
    if not cond:
        fallos.append(nombre + (' · ' + str(detalle) if detalle else ''))


def main():
    os.makedirs(CAPTURAS, exist_ok=True)
    with sync_playwright() as pw:
        nav = pw.chromium.launch(executable_path=CHROME)
        pag = nav.new_page(viewport={'width': 1500, 'height': 980})
        errores = []
        pag.on('console', lambda msg: errores.append(msg.text) if msg.type == 'error' else None)
        pag.on('pageerror', lambda e: errores.append('pageerror: ' + str(e)))

        print('\n[1] Carga')
        pag.goto(ARCHIVO, wait_until='load')
        pag.wait_for_timeout(1400)
        check('sin errores de consola ni de página', not errores, errores[:3])
        check('la barra tiene los 3 módulos', pag.locator('#pestanas button').count() == 3,
              pag.locator('#pestanas button').count())
        check('la tipografía Outfit está aplicada',
              'Outfit' in pag.evaluate("getComputedStyle(document.body).fontFamily"))
        check('hay iconos SVG en la barra y el lateral',
              pag.locator('svg.ico').count() > 8, pag.locator('svg.ico').count())

        print('\n[2] Secciones de los tres módulos')
        for mod, secs in SECCIONES.items():
            pag.evaluate(f"irModulo('{mod}')")
            pag.wait_for_timeout(220)
            check(f'módulo «{mod}» tiene {len(secs)} secciones en el lateral',
                  pag.locator('#lateral a').count() == len(secs), pag.locator('#lateral a').count())
            for sid in secs:
                pag.evaluate(f"irSeccion('{sid}')")
                pag.wait_for_timeout(140)
                txt = pag.locator('#vista').inner_text()
                check(f'  {sid} renderiza con contenido', len(txt) > 300, f'{len(txt)} car.')

        print('\n[3] El Excel no lleva material de formación')
        import zipfile, re
        z = zipfile.ZipFile(os.path.join(AQUI, 'dist', 'Rehavid_Herramienta_Financiera.xlsm'))
        hojas = re.findall(r'<sheet name="([^"]+)"', z.read('xl/workbook.xml').decode())
        check('hojas del libro son solo financieras',
              hojas == ['Panel', 'Modelo', 'Escenarios', 'Flujos', 'Supuestos', 'Covenants'], hojas)
        cadenas = z.read('xl/sharedStrings.xml').decode()
        prohibidas = [p for p in ['unidad formativa', 'banco de preguntas', 'certificado', 'evaluación',
                                  'Risk Simulator: unidad', 'U1', 'U2', 'aprendizaje'] if p in cadenas]
        check('sin contenido de formación en el libro', not prohibidas, prohibidas)
        check('conserva las macros', 'xl/vbaProject.bin' in z.namelist())
        check('conserva los gráficos nativos',
              len([n for n in z.namelist() if 'charts/chart' in n]) == 3)

        print('\n[4] Formación · cobertura del documento')
        pag.evaluate("irSeccion('f-ruta')"); pag.wait_for_timeout(250)
        d = pag.evaluate("({u: UNIDADES.length, act: ACTIVIDADES.length, rs: RS_FORMATIVO.length,"
                         " glo: GLOSARIO.length, ref: REFERENTES.length, preg: PREGUNTAS.length,"
                         " cert: CERT_CONTROL.length})")
        check('8 unidades', d['u'] == 8, d['u'])
        check('8 actividades formativas (§4.4)', d['act'] == 8, d['act'])
        check('10 puntos obligatorios de Risk Simulator (§9.1)', d['rs'] == 10, d['rs'])
        check('glosario con al menos 25 términos', d['glo'] >= 25, d['glo'])
        check('referentes de §4.3 presentes', d['ref'] >= 6, d['ref'])
        check('banco con al menos 25 preguntas', d['preg'] >= 25, d['preg'])
        check('control de expedición del certificado (§5.6)', d['cert'] == 6, d['cert'])

        pag.evaluate("estado.unidad=2;irSeccion('f-unidad')"); pag.wait_for_timeout(300)
        t = pag.locator('#vista').inner_text()
        # el CSS aplica text-transform en varios rótulos, así que se compara sin distinguir mayúsculas
        tl = t.lower()
        for etq in ['Nivel básico', 'Nivel intermedio', 'Fórmulas de esta unidad',
                    'Reglas de negocio', 'Términos clave', 'Errores frecuentes']:
            check(f'  la unidad muestra «{etq}»', etq.lower() in tl)
        check('  la unidad es más extensa que antes', len(t) > 3500, f'{len(t)} car.')

        print('\n[5] Herramienta · motor financiero')
        pag.evaluate("irSeccion('h-panel')"); pag.wait_for_timeout(300)
        r = pag.evaluate("""() => {
            const m = estado.m;
            const r = calcular(m), s = resumen(r, m);
            const concilia = r.porTramo[0].filter(f=>f.vivo)
                .every(f => Math.abs(f.saldoFin - (f.saldoIni - f.principal)) < 0.01);
            const servicio = r.filas.every(f => Math.abs(f.servicio - (f.principal + f.interes)) < 0.01);
            // CFADS: solo líneas elegibles
            const conNoEleg = cfadsPeriodo(m.flujo, 1);
            const todasEleg = cfadsPeriodo(m.flujo.map(l => ({...l, elegible:true})), 1);
            // capacidad y monotonía CP-009
            const cap = capacidad(m);
            const dura = JSON.parse(JSON.stringify(m));
            dura.covenants.forEach(c => c.umbral *= 1.15);
            const capD = capacidad(dura);
            // RN-FIN-02
            const sinServicio = calcular({...m, tramos:[{...m.tramos[0], gracia:3, metodo:'bullet', tasa:0}]})
                                .filas.filter(f => f.dscr === null).length;
            return { n:r.filas.length, concilia, servicio, dscrMin:s.dscrMin,
                     cfadsFiltra: Math.abs(conNoEleg - todasEleg) > 1,
                     cap: cap.monto, capD: capD.monto, vinc: cap.vinculante,
                     monoton: capD.monto <= cap.monto + 1, sinServicio };
        }""")
        check('calendario con 12 periodos', r['n'] == 12, r['n'])
        check('F1 concilia: saldo final = saldo inicial − principal', r['concilia'])
        check('F2: servicio = principal + interés', r['servicio'])
        check('F3: el CFADS excluye las líneas no elegibles', r['cfadsFiltra'])
        check('F5: la capacidad identifica la restricción vinculante', bool(r['vinc']), r['vinc'])
        check('CP-009: endurecer el covenant no aumenta la capacidad', r['monoton'],
              f"{r['cap']:.0f} vs {r['capD']:.0f}")
        check('RN-FIN-02: servicio cero da DSCR no calculable', r['sinServicio'] == 11, r['sinServicio'])

        print('\n[6] Herramienta · validaciones y bloqueos')
        v = pag.evaluate("""() => {
            const antes = validar(estado.m).length;
            // quitar la fuente del covenant debe producir un hallazgo crítico
            const copia = JSON.parse(JSON.stringify(estado.m));
            copia.covenants[0].fuente = '';
            const sinFuente = validar(copia).filter(h => h.cod === 'VAL-04').length;
            copia.covenants[0].fuente = 'Contrato';
            const conFuente = validar(copia).filter(h => h.cod === 'VAL-04').length;
            // caja mínima muy alta debe disparar CP-010
            const liq = JSON.parse(JSON.stringify(estado.m));
            liq.liquidez.cajaMin = 99999999;
            const cp010 = validar(liq).filter(h => h.cod === 'VAL-09').length;
            return { antes, sinFuente, conFuente, cp010, reglas: REGLAS_VALIDACION.length,
                     aprobable: puedeAprobar(estado.m) };
        }""")
        check('el motor de validación tiene al menos 14 reglas', v['reglas'] >= 14, v['reglas'])
        check('VAL-04 salta si el covenant no tiene fuente (CP-008)', v['sinFuente'] == 1)
        check('VAL-04 desaparece al poner la fuente', v['conFuente'] == 0)
        check('VAL-09 detecta el caso CP-010 de liquidez', v['cp010'] == 1)

        pag.evaluate("irSeccion('h-auditoria')"); pag.wait_for_timeout(250)
        check('la auditoría muestra la regla de cada hallazgo',
              pag.locator('#vista .hallazgo').count() == pag.locator('#vista .hallazgo .regla').count())
        a1 = pag.evaluate("validar(estado.m).length"); a2 = pag.evaluate("validar(estado.m).length")
        check('la auditoría es determinista', a1 == a2, f'{a1} vs {a2}')

        print('\n[7] Herramienta · operaciones de la app')
        pag.evaluate("irSeccion('h-supuestos')"); pag.wait_for_timeout(200)
        n0 = pag.evaluate("estado.m.supuestos.length")
        pag.evaluate("addSupuesto()"); pag.wait_for_timeout(150)
        check('se puede añadir un supuesto', pag.evaluate("estado.m.supuestos.length") == n0 + 1)
        pag.evaluate("borrar('supuestos', estado.m.supuestos.length-1)"); pag.wait_for_timeout(150)
        check('se puede borrar un supuesto', pag.evaluate("estado.m.supuestos.length") == n0)

        pag.evaluate("irSeccion('h-deuda')"); pag.wait_for_timeout(200)
        pag.evaluate("addTramo()"); pag.wait_for_timeout(200)
        check('se puede añadir un segundo tramo y el modelo lo agrega',
              pag.evaluate("calcular(estado.m).porTramo.length") == 2)
        pag.evaluate("borrar('tramos',1)"); pag.wait_for_timeout(150)

        pag.evaluate("irSeccion('h-capacidad')"); pag.wait_for_timeout(200)
        pag.evaluate("correrCapacidad()"); pag.wait_for_timeout(400)
        check('la capacidad se calcula y se muestra',
              'monto máximo factible' in pag.locator('#vista').inner_text().lower())
        check('se comprueba CP-009 en pantalla', 'CP-009' in pag.locator('#vista').inner_text())

        pag.evaluate("irSeccion('h-escenarios')"); pag.wait_for_timeout(200)
        pag.evaluate("""() => {
            const r = resumen(calcular(estado.m), estado.m);
            estado.m.escenarios.push({nombre:'Prueba', fecha:'hoy',
              copia: JSON.parse(JSON.stringify({tramos:estado.m.tramos, flujo:estado.m.flujo,
                covenants:estado.m.covenants, liquidez:estado.m.liquidez, proyecto:estado.m.proyecto})),
              r:{deudaTotal:r.deudaTotal, dscrMin:r.dscrMin, brechaMin:r.brechaMin,
                 servicioTotal:r.servicioTotal, factible:r.factible}});
        }"""); pag.evaluate("pintar()"); pag.wait_for_timeout(250)
        check('el escenario guardado aparece en la tabla', 'Prueba' in pag.locator('#vista').inner_text())

        print('\n[8] Simulación · exportar e importar con validación de huella')
        pag.evaluate("irSeccion('h-simulacion')"); pag.wait_for_timeout(250)
        with pag.expect_download() as dl:
            pag.click('button:has-text("Exportar especificación")')
        spec = dl.value
        ruta = os.path.join(CAPTURAS, '..', 'spec_prueba.csv')
        spec.save_as(ruta)
        contenido = open(ruta, encoding='utf-8').read()
        check('la especificación exporta con huella del modelo', 'huella,' in contenido)
        check('incluye bloque de resultados a rellenar', '---RESULTADOS---' in contenido)

        # importación con huella incorrecta → debe rechazarse (CP-011)
        malo = contenido.replace('huella,', 'huella,XX')
        p_malo = os.path.join(CAPTURAS, '..', 'malo.csv')
        open(p_malo, 'w', encoding='utf-8').write(malo)
        pag.set_input_files('#imp-sim', p_malo)
        pag.wait_for_timeout(500)
        check('CP-011: rechaza el archivo con huella distinta',
              pag.evaluate("estado.m.simulacion === null"))

        # importación válida con resultados rellenados
        bueno = contenido.replace('DSCR minimo,,,,,,', 'DSCR minimo,1.31,1.30,0.12,1.10,1.30,1.55')
        p_bueno = os.path.join(CAPTURAS, '..', 'bueno.csv')
        open(p_bueno, 'w', encoding='utf-8').write(bueno)
        pag.set_input_files('#imp-sim', p_bueno)
        pag.wait_for_timeout(600)
        check('importa los resultados cuando la huella coincide',
              pag.evaluate("estado.m.simulacion !== null"))
        check('los marca como ejecución externa importada',
              'externa importada' in pag.locator('#vista').inner_text().lower() or
              'Ejecución externa importada' in pag.locator('#vista').inner_text())
        check('no calcula probabilidad de ruptura sin definición',
              'no calcula el indicador' in pag.locator('#vista').inner_text().lower())
        for f in (ruta, p_malo, p_bueno):
            os.remove(f)

        print('\n[9] Evaluación adaptativa')
        pag.evaluate("irSeccion('f-evaluacion')"); pag.wait_for_timeout(300)
        pag.fill('#in-nombre', 'Nombre De Prueba')
        pag.dispatch_event('#in-nombre', 'change')
        pag.fill('#in-cargo', 'Cargo De Prueba')
        pag.dispatch_event('#in-cargo', 'change')
        pag.evaluate("iniciarExamen()"); pag.wait_for_timeout(300)
        check('examen de 16 ítems base', pag.evaluate("estado.examen.base.length") == 16)
        check('equilibrado a 2 por unidad', pag.evaluate("""() => {
            const c = {}; estado.examen.base.forEach(q => c[q.u] = (c[q.u]||0)+1);
            return Object.keys(c).length === 8 && Object.values(c).every(v => v === 2); }"""))
        pag.evaluate("responder(estado.examen.base[0].correcta === 0 ? 1 : 0)")
        pag.wait_for_timeout(200)
        txt = pag.locator('#retro').inner_text()
        check('CP-002: corrige y explica antes de continuar', 'Respuesta correcta:' in txt)
        check('RF-005: ofrece repregunta distinta', 'Ver la repregunta' in txt)
        antes = pag.evaluate("estado.examen.base[0].id")
        pag.evaluate("lanzarRepregunta(estado.examen.base[0].u)"); pag.wait_for_timeout(200)
        check('la repregunta es otro ítem', pag.evaluate("estado.examen.repregunta.id") != antes)
        check('la repregunta no puntúa', pag.evaluate("estado.examen.aciertosPrimera") == 0)
        pag.evaluate("""() => {
            estado.examen.repregunta = null;
            while (estado.examen && estado.examen.i < estado.examen.base.length) {
                responder(estado.examen.base[estado.examen.i].correcta);
                estado.examen.repregunta = null; estado.examen.i++;
                if (estado.examen.i >= estado.examen.base.length) { cerrarIntento(); break; }
                pintarExamen();
            }
        }""")
        pag.wait_for_timeout(400)
        ult = pag.evaluate("estado.intentos[estado.intentos.length-1]")
        check('denominador = solo ítems base (15/16 = 93,8 %)',
              abs(ult['resultado'] - 93.75) < 0.2, ult['resultado'])
        check('aprueba con el umbral del 80 %', ult['aprobado'] is True)
        pag.evaluate("irSeccion('f-certificado')"); pag.wait_for_timeout(300)
        check('emite el certificado', pag.locator('#certificado').count() == 1)
        check('el certificado lleva nombre y cargo',
              'Nombre De Prueba' in pag.locator('#certificado').inner_text() and
              'Cargo De Prueba' in pag.locator('#certificado').inner_text())

        print('\n[10] Descarga del libro Excel')
        pag.evaluate("irSeccion('h-reportes')"); pag.wait_for_timeout(300)
        with pag.expect_download() as d2:
            pag.click('button:has-text("Libro Excel")')
        des = d2.value
        r2 = os.path.join(CAPTURAS, '..', 'descarga.xlsm')
        des.save_as(r2)
        orig = os.path.getsize(os.path.join(AQUI, 'dist', 'Rehavid_Herramienta_Financiera.xlsm'))
        check('descarga el .xlsm', des.suggested_filename.endswith('.xlsm'))
        check('idéntico al generado', os.path.getsize(r2) == orig)
        os.remove(r2)

        print('\n[11] Impresión')
        pag.evaluate("irSeccion('h-panel')")
        pag.emulate_media(media='print')
        pag.wait_for_timeout(400)
        est = pag.evaluate("""() => ({
            barra: getComputedStyle(document.querySelector('.barra')).display,
            lateral: getComputedStyle(document.querySelector('.lateral')).display,
            fila: getComputedStyle(document.querySelector('#vista tbody tr')).breakInside,
            thead: getComputedStyle(document.querySelector('#vista thead')).display,
            tabla: getComputedStyle(document.querySelector('#vista table')).breakInside,
            justificado: getComputedStyle(document.querySelector('#vista .aviso p')).textAlign
        })""")
        check('oculta barra y lateral', est['barra'] == 'none' and est['lateral'] == 'none')
        check('ninguna fila se parte', est['fila'] == 'avoid', est['fila'])
        check('encabezados de tabla se repiten', est['thead'] == 'table-header-group')
        check('las tablas largas fluyen', est['tabla'] == 'auto', est['tabla'])
        check('texto justificado', est['justificado'] == 'justify', est['justificado'])

        pag.evaluate("""() => {
            const todas = MODULOS.flatMap(m => m.secciones.map(s => s.id));
            document.getElementById('vista').innerHTML = todas.map(sid =>
              `<div class="panel" id="p-${sid}">${VISTAS[sid] ? VISTAS[sid]() : ''}</div>`).join('');
            document.body.classList.add('imprimir-todo');
        }""")
        pag.wait_for_timeout(700)
        vis = pag.evaluate("Array.from(document.querySelectorAll('.panel'))"
                           ".filter(p => getComputedStyle(p).display === 'block').length")
        check('«Imprimir todo» muestra las 29 secciones', vis == 29, vis)
        altos = pag.evaluate("""() => {
            const lim = 926, r = [];
            document.querySelectorAll('figure, .tarjeta, .tile, .certificado, .hallazgo, .pregunta, tr')
              .forEach(e => { const h = e.getBoundingClientRect().height;
                              if (h > lim) r.push(e.tagName + ':' + Math.round(h)); });
            return r; }""")
        check('ningún bloque indivisible supera una página', not altos, altos[:5])
        pag.evaluate("document.body.classList.remove('imprimir-todo')")
        pag.emulate_media(media='screen')

        print('\n[12] Capturas y pantalla estrecha')
        for sid in ['f-ruta', 'f-unidad', 'h-panel', 'h-deuda', 'h-auditoria', 'm-uso']:
            pag.evaluate(f"irSeccion('{sid}')")
            pag.wait_for_timeout(350)
            pag.screenshot(path=os.path.join(CAPTURAS, sid + '.png'))
        pag.set_viewport_size({'width': 420, 'height': 900})
        pag.evaluate("irSeccion('h-panel')"); pag.wait_for_timeout(500)
        desborde = pag.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth + 2")
        check('sin desbordamiento horizontal en móvil', not desborde,
              pag.evaluate("document.documentElement.scrollWidth"))
        pag.screenshot(path=os.path.join(CAPTURAS, 'movil.png'))

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
