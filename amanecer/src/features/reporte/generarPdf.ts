// Reporte de Control (§6.8): PDF de 2 páginas, generado offline con jsPDF,
// legible por el equipo en 90 segundos. Aquí SÍ se usan términos clínicos.
// Marcado siempre como autorreporte — no es un documento clínico.

import { jsPDF } from 'jspdf';
import { db, hoyLocal } from '@/db/dexie';
import { enVentana, sumarDias } from '@/rules/recurrence';
import { evaluarPeso } from '@/rules/weight';
import { interpolar, reporte as copy } from '@/content/es-CO';
import type { Perfil } from '@/types/models';

const SEMANAS = 12;

// Paleta sobria del reporte (tokens §10.1 en RGB).
const TINTA: [number, number, number] = [41, 32, 25];
const SUAVE: [number, number, number] = [92, 82, 72];
const PRIMARIO: [number, number, number] = [11, 107, 93];
const AMBAR: [number, number, number] = [138, 90, 0];

export async function generarReporte(perfil: Perfil): Promise<void> {
  const hoy = hoyLocal();
  const desde = sumarDias(hoy, -7 * SEMANAS);
  const dias = 7 * SEMANAS;

  const [checkins, episodios, comidas, pesos, medicinas, eventos] = await Promise.all([
    db.checkins.where('fecha').aboveOrEqual(desde).sortBy('fecha'),
    db.episodios.toArray(),
    db.comidas.where('fecha').aboveOrEqual(desde).toArray(),
    db.pesos.orderBy('fecha').toArray(),
    db.medicinas.toArray(),
    db.eventosBandera.toArray(),
  ]);
  const episodiosPeriodo = episodios
    .filter((e) => enVentana(e.cuando, hoy, dias))
    .sort((a, b) => a.cuando.localeCompare(b.cuando));
  const pesosPeriodo = pesos.filter((p) => enVentana(p.fecha, hoy, dias));
  const eventosPeriodo = eventos.filter((e) => enVentana(e.fechaHora, hoy, dias));

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margen = 18;
  const anchoUtil = 210 - margen * 2;
  let y = 0;

  const texto = (
    s: string,
    tam = 10,
    color: [number, number, number] = TINTA,
    negrita = false,
  ) => {
    doc.setFont('helvetica', negrita ? 'bold' : 'normal');
    doc.setFontSize(tam);
    doc.setTextColor(...color);
    const lineas = doc.splitTextToSize(s, anchoUtil);
    doc.text(lineas, margen, y);
    y += lineas.length * (tam * 0.45) + 2;
  };

  const tituloSeccion = (s: string) => {
    y += 3;
    texto(s, 12, PRIMARIO, true);
  };

  // ——— Página 1 ———
  y = margen;
  texto(interpolar(copy.titulo, { app: perfil.appName }), 16, TINTA, true);
  texto(
    interpolar(copy.encabezado, { nombre: perfil.nombre, desde, hasta: hoy }),
    11,
    SUAVE,
  );
  texto(interpolar(copy.advertencia, { app: perfil.appName }), 9, AMBAR);

  // Peso: tendencia + estado
  tituloSeccion(copy.peso);
  if (pesosPeriodo.length === 0) {
    texto(copy.sinDatos, 10, SUAVE);
  } else {
    const serie = pesosPeriodo
      .map((p) => `${p.fecha.slice(5)}: ${p.kg} kg`)
      .join('   ·   ');
    texto(serie, 10);
    const resultado = evaluarPeso(pesos, hoy);
    if (resultado.nivel === 'ambar') {
      texto(
        `⚠ Pérdida de peso que cruza el umbral configurado (${
          resultado.motivo === 'kg_4_semanas' ? '≥2 kg en 4 semanas' : '≥5% en 8 semanas'
        }).`,
        10,
        AMBAR,
        true,
      );
    }
    // Mini-gráfica de línea
    if (pesosPeriodo.length >= 2) {
      const kgs = pesosPeriodo.map((p) => p.kg);
      const min = Math.min(...kgs);
      const max = Math.max(...kgs);
      const rango = Math.max(max - min, 1);
      const gx = margen;
      const gy = y + 2;
      const gw = anchoUtil;
      const gh = 22;
      doc.setDrawColor(...SUAVE);
      doc.rect(gx, gy, gw, gh);
      doc.setDrawColor(...PRIMARIO);
      doc.setLineWidth(0.7);
      for (let i = 1; i < pesosPeriodo.length; i++) {
        const x1 = gx + ((i - 1) / (pesosPeriodo.length - 1)) * gw;
        const x2 = gx + (i / (pesosPeriodo.length - 1)) * gw;
        const y1 = gy + gh - ((kgs[i - 1] - min) / rango) * (gh - 4) - 2;
        const y2 = gy + gh - ((kgs[i] - min) / rango) * (gh - 4) - 2;
        doc.line(x1, y1, x2, y2);
      }
      y = gy + gh + 6;
    }
  }

  // Ánimo: mini-mapa de calor textual por semana
  tituloSeccion(copy.animo);
  const conAnimo = checkins.filter((c) => c.animo !== undefined);
  if (conAnimo.length === 0) {
    texto(copy.sinDatos, 10, SUAVE);
  } else {
    const promedio = (
      conAnimo.reduce((acc, c) => acc + (c.animo ?? 0), 0) / conAnimo.length
    ).toFixed(1);
    const bajos = conAnimo.filter((c) => (c.animo ?? 5) <= 2).length;
    texto(
      `Días registrados: ${conAnimo.length} · promedio ${promedio}/5 · días con ánimo bajo (≤2): ${bajos}`,
      10,
    );
  }

  // Medicación (el término "adherencia" solo aparece aquí, §13)
  tituloSeccion(copy.medicacion);
  if (medicinas.length === 0) {
    texto(copy.sinDatos, 10, SUAVE);
  } else {
    for (const m of medicinas) {
      const tomasPeriodo = m.tomas.filter((toma) => enVentana(toma.fechaHora, hoy, dias));
      const tomadas = tomasPeriodo.filter((toma) => toma.estado === 'tomada').length;
      const esperadas = m.horarios.length * dias;
      const pct = esperadas > 0 ? Math.min(100, Math.round((tomadas / esperadas) * 100)) : 0;
      texto(
        `${m.nombre} (${m.horarios.join(', ')}): ${tomadas} tomas confirmadas (${pct}% de las programadas)`,
        10,
      );
    }
  }

  // ——— Página 2 ———
  doc.addPage();
  y = margen;

  tituloSeccion(copy.episodios);
  if (episodiosPeriodo.length === 0) {
    texto(copy.sinDatos, 10, SUAVE);
  } else {
    texto(copy.episodiosCols.join('  |  '), 9, SUAVE, true);
    for (const e of episodiosPeriodo.slice(-25)) {
      texto(
        `${e.cuando.slice(0, 10)}  |  ${copy.tiposEpisodio[e.tipo]}  |  ${e.severidad}  |  ${
          e.queHicieron ?? '—'
        }`,
        9,
      );
    }
  }

  tituloSeccion(copy.senalesRespiratorias);
  const diasCon = (pred: (c: (typeof checkins)[number]) => boolean) =>
    checkins.filter(pred).length;
  texto(
    interpolar(copy.diasOrtopnea, {
      n: String(diasCon((c) => (c.sueno?.senales ?? []).includes('ortopnea'))),
    }),
    10,
  );
  texto(
    interpolar(copy.diasCefalea, {
      n: String(diasCon((c) => (c.sueno?.senales ?? []).includes('cefalea_matutina'))),
    }),
    10,
  );
  texto(
    interpolar(copy.diasSuenoMalo, {
      n: String(diasCon((c) => c.sueno?.calidad === 'mal')),
    }),
    10,
  );

  tituloSeccion(copy.deglucion);
  texto(
    interpolar(copy.comidasEsfuerzo, {
      n: String(comidas.filter((m) => m.tragando === 'esfuerzo').length),
    }),
    10,
  );
  texto(
    interpolar(copy.comidasAtoro, {
      n: String(comidas.filter((m) => m.tragando === 'atoro').length),
    }),
    10,
  );
  texto(
    interpolar(copy.diasDisfagia, {
      n: String(diasCon((c) => c.tragar === 'algo' || c.tragar === 'bastante')),
    }),
    10,
  );

  tituloSeccion(copy.saliva);
  texto(
    interpolar(copy.salivaFina, {
      n: String(diasCon((c) => c.saliva === 'fina_abundante')),
    }),
    10,
  );
  texto(
    interpolar(copy.salivaEspesa, { n: String(diasCon((c) => c.saliva === 'espesa')) }),
    10,
  );

  tituloSeccion(copy.dolorTitulo);
  texto(
    interpolar(copy.diasDolor, {
      n: String(diasCon((c) => (c.dolor?.nivel ?? 0) >= 2)),
    }),
    10,
  );

  tituloSeccion(copy.banderasTitulo);
  if (eventosPeriodo.length === 0) {
    texto(copy.sinDatos, 10, SUAVE);
  } else {
    const porRegla = new Map<string, number>();
    for (const e of eventosPeriodo) {
      porRegla.set(
        `${e.nivel === 'roja' ? '🔴' : '🟡'} ${e.reglaId}`,
        (porRegla.get(`${e.nivel === 'roja' ? '🔴' : '🟡'} ${e.reglaId}`) ?? 0) + 1,
      );
    }
    texto(
      [...porRegla.entries()].map(([k, n]) => `${k} ×${n}`).join('   ·   '),
      10,
    );
  }

  // Notas destacadas: texto libre del check-in (solo transcripciones/textos).
  tituloSeccion(copy.notas);
  const notas = checkins
    .filter((c) => c.nota?.texto)
    .slice(-6)
    .map((c) => `${c.fecha}: "${c.nota?.texto}"`);
  if (notas.length === 0) texto(copy.sinDatos, 10, SUAVE);
  else for (const n of notas) texto(n, 9, SUAVE);

  y = 285;
  texto(copy.pie, 8, SUAVE);

  doc.save(`reporte-control-${hoy}.pdf`);
}
