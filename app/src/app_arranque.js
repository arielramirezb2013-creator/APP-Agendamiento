/* ============================================================
   ARRANQUE · montaje de secciones, impresión y enrutado
   ============================================================ */

const RENDER = {
  portada: secPortada,
  formacion: secFormacion,
  evaluacion: secEvaluacion,
  operacion: secOperacion,
  especificacion: secEspecificacion,
  laboratorio: secLaboratorio,
  motor: secMotor,
  comofunciona: secComoFunciona,
  documento: secDocumento,
  fuentes: secFuentes,
  descargas: secDescargas
};

/* Tamaño de papel: @page no admite variables CSS, así que se reescribe la regla. */
function fijarPapel(tam) {
  let st = document.getElementById('regla-papel');
  if (!st) { st = document.createElement('style'); st.id = 'regla-papel'; document.head.appendChild(st); }
  st.textContent = `@page { size: ${tam}; margin: 18mm 16mm 16mm; }`;
  localStorage.setItem(CLAVE + '_papel', tam);
  document.querySelectorAll('[data-papel]').forEach(b =>
    b.classList.toggle('activo', b.dataset.papel === tam));
}

function imprimir(todo) {
  document.body.classList.toggle('imprimir-todo', !!todo);
  const pie = document.getElementById('pie-impresion');
  if (pie) {
    const s = SECCIONES.find(x => 'sec-' + x.id === (document.querySelector('.seccion.activa') || {}).id);
    pie.textContent = `Rehavid S.A.S. · App de modulación financiera · ${todo ? 'documento completo' : (s ? s.t : '')} · impreso el ` +
      new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' });
  }
  window.print();
}
window.addEventListener('afterprint', () => document.body.classList.remove('imprimir-todo'));

function arrancar() {
  cargar();
  construirNav();

  const cont = document.getElementById('contenido');
  cont.innerHTML = SECCIONES.map(s =>
    `<section class="seccion" id="sec-${s.id}">${RENDER[s.id]()}</section>`).join('') +
    `<div class="pie-impresion" id="pie-impresion"></div>`;

  document.getElementById('nav').addEventListener('click', ev => {
    const a = ev.target.closest('a[data-ir]');
    if (!a) return;
    ev.preventDefault();
    ir(a.dataset.ir);
  });

  fijarPapel(localStorage.getItem(CLAVE + '_papel') || 'Letter');

  // peso del libro Excel embebido
  const peso = document.getElementById('peso-xlsm');
  if (peso) peso.textContent = (XLSM_B64.length * 3 / 4 / 1024).toFixed(0) + ' KB';

  verUnidad(0);
  correrLab();
  pintarExamen();

  const inicial = (location.hash || '#portada').slice(1);
  ir(SECCIONES.some(s => s.id === inicial) ? inicial : 'portada');
}

document.addEventListener('DOMContentLoaded', arrancar);
