// ============================================================
//  graficas.js  –  Gráficas con Chart.js
// ============================================================

const COLORES = ['#1D9E75', '#BA7517', '#534AB7', '#185FA5'];
const ETIQUETAS = ['Sílice amorfa', 'Biochar', 'Celulosa', 'Gases'];

let graficaBarras = null;
let graficaDona   = null;

// ---------------------------------------------------------------
// Primera inicialización
// ---------------------------------------------------------------
function inicializarGraficas(d) {
  const unidadEje = unidadActual === 'kg' ? 'Kilogramos' : 'Toneladas';
  const optsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  // Gráfica de barras
  graficaBarras = new Chart(document.getElementById('grafica-barras'), {
    type: 'bar',
    data: {
      labels: ETIQUETAS,
      datasets: [{
        data: datosQty(d),
        backgroundColor: COLORES,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      ...optsBase,
      scales: {
        x: { ticks: { font: { size: 11 }, autoSkip: false }, grid: { display: false } },
        y: { ticks: { font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' },
             title: { display: true, text: unidadEje, font: { size: 11 } } }
      }
    }
  });

  // Gráfica de dona
  graficaDona = new Chart(document.getElementById('grafica-dona'), {
    type: 'doughnut',
    data: {
      labels: ETIQUETAS,
      datasets: [{
        data: datosVal(d),
        backgroundColor: COLORES,
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6
      }]
    },
    options: { ...optsBase, cutout: '65%' }
  });

  renderLeyendas(d);
}

// ---------------------------------------------------------------
// Actualización de gráficas (llamada cada vez que cambian sliders)
// ---------------------------------------------------------------
function actualizarGraficas(d) {
  if (!graficaBarras) {
    inicializarGraficas(d);
    return;
  }
  graficaBarras.data.datasets[0].data = datosQty(d);
  const unidadEje = (typeof unidadActual !== 'undefined' && unidadActual === 'kg') ? 'Kilogramos' : 'Toneladas';
  graficaBarras.options.scales.y.title.text = unidadEje;
  graficaBarras.update();

  graficaDona.data.datasets[0].data = datosVal(d);
  graficaDona.update();

  renderLeyendas(d);
}

// ---------------------------------------------------------------
// Helpers de datos
// ---------------------------------------------------------------
function datosQty(d) {
  const conv = (typeof unidadActual !== 'undefined' && unidadActual === 'kg') ? 1000 : 1;
  return [d.silice, d.biochar, d.celulosa, d.gases].map(v => parseFloat((v * conv).toFixed(1)));
}

function datosVal(d) {
  return [d.valSilice, d.valBiochar, d.valCelulosa, d.valGases].map(v => Math.round(v));
}

// ---------------------------------------------------------------
// Leyendas personalizadas
// ---------------------------------------------------------------
function renderLeyendas(d) {
  const vals = datosVal(d);
  const total = vals.reduce((a, b) => a + b, 0);
  const pcts  = total > 0 ? vals.map(v => Math.round(v / total * 100)) : vals.map(() => 0);

  const unidad = (typeof unidadActual !== 'undefined' && unidadActual === 'kg') ? 'kg' : 't';
  document.getElementById('leyenda-bar').innerHTML = ETIQUETAS.map((l, i) => `
    <span style="display:flex;align-items:center;gap:4px;">
      <span style="width:10px;height:10px;border-radius:2px;background:${COLORES[i]};display:inline-block;"></span>
      ${l}
    </span>
  `).join('');

  document.getElementById('leyenda-dona').innerHTML = ETIQUETAS.map((l, i) => `
    <span style="display:flex;align-items:center;gap:4px;">
      <span style="width:10px;height:10px;border-radius:2px;background:${COLORES[i]};display:inline-block;"></span>
      ${l} ${pcts[i]}%
    </span>
  `).join('');
}
