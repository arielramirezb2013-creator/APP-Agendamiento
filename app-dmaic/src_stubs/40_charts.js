/* STUB temporal de CHART (se reemplaza por el módulo real) */
const CHART = {
  palette:['#12B3A6','#0B5D6B','#F5A623','#7C5CBF','#E5854D','#2FBF71'],
  draw(kind, data, opts){
    data = data || {};
    const n = (data.values||data.labels||data.series||data.tasks||data.points||[]).length;
    if(!n) return '<div class="empty">Sin datos suficientes</div>';
    return '<svg viewBox="0 0 400 200" width="100%" height="'+((opts&&opts.h)||200)+'"><text x="10" y="20" fill="currentColor" font-size="11">'+esc(kind)+' · '+n+' series</text></svg>';
  },
  async toPNG(){ return new Blob(['x'],{type:'image/png'}); }
};
