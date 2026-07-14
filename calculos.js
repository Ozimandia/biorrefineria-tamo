// ============================================================
//  calculos.js  –  Lógica central + referencia manual de sílice
// ============================================================

let procesoActual = 'pirolisis';
let unidadActual  = 'kg';

// Referencia manual: Intel Market Research, enero 2026.
const PRECIO_SILICE = {
  precio_usd_ton: 1820,
  rango_min: 1400,
  rango_max: 2200,
  fuente: 'Intel Market Research',
  fecha: 'enero 2026',
  tipo: 'precipitated silica RHA'
};
let precioSilicePorTon = PRECIO_SILICE.precio_usd_ton;

const PRECIOS_OTROS = { biochar: 120, celulosa: 200, gases: 50 };

const RENDIMIENTOS = {
  pirolisis:  { ceniza: 0.10, biochar: 0.35, gases: 0.55 },
  combustion: { ceniza: 0.12, biochar: 0.00, gases: 0.88 },
  mixto:      { ceniza: 0.08, biochar: 0.15, celulosa: 0.40, gases: 0.37 }
};
const FRACCION_SILICE = 0.90;

// ---------------------------------------------------------------
// Mostrar referencia manual de precio de sílice
// ---------------------------------------------------------------
function mostrarPrecioReferencia() {
  const disp = document.getElementById('precio-display');
  const rango = document.getElementById('precio-rango');
  const fuente = document.getElementById('precio-fuente');
  disp.textContent = `USD ${PRECIO_SILICE.precio_usd_ton.toLocaleString('es-CO')}/t`;
  rango.textContent = `Rango: USD ${PRECIO_SILICE.rango_min.toLocaleString('es-CO')}–${PRECIO_SILICE.rango_max.toLocaleString('es-CO')}/t`;
  fuente.textContent = `Fuente: ${PRECIO_SILICE.fuente} · ${PRECIO_SILICE.fecha} · ${PRECIO_SILICE.tipo}`;
}

// ---------------------------------------------------------------
// Unidad kg / t
// ---------------------------------------------------------------
function toggleUnidad() {
  const nuevaUnidad = unidadActual === 'kg' ? 't' : 'kg';
  aplicarUnidad(nuevaUnidad);
}

function aplicarUnidad(u) {
  unidadActual = u;
  const thumb  = document.getElementById('toggle-thumb');
  const toggle = document.getElementById('toggle-unidad');
  const label  = document.getElementById('label-unidad');

  if (u === 't') {
    thumb.style.transform  = 'translateX(20px)';
    toggle.style.background = '#639922';
    toggle.setAttribute('aria-checked', 'true');
    label.textContent = 't';
  } else {
    thumb.style.transform  = 'translateX(0)';
    toggle.style.background = '#1D9E75';
    toggle.setAttribute('aria-checked', 'false');
    label.textContent = 'kg';
  }
  actualizar();
}

// ---------------------------------------------------------------
// Calcular (siempre en toneladas internamente)
// ---------------------------------------------------------------
function obtenerTamoEnToneladas() {
  const val = parseFloat(document.getElementById('tamo-input').value) || 0;
  return unidadActual === 'kg' ? val / 1000 : val;
}

function calcular() {
  const tamo    = obtenerTamoEnToneladas();
  const humedad = parseFloat(document.getElementById('humedad').value) / 100;
  const rend    = RENDIMIENTOS[procesoActual];

  const tamoSeco  = tamo * (1 - humedad);
  const ceniza    = tamoSeco * rend.ceniza;
  const silice    = ceniza * FRACCION_SILICE;

  const biochar   = tamoSeco * (rend.biochar || 0);
  const celulosa  = tamoSeco * (rend.celulosa || 0);
  const gases     = tamoSeco * (rend.gases || 0);

  const valSilice   = silice   * precioSilicePorTon;
  const valBiochar  = biochar  * PRECIOS_OTROS.biochar;
  const valCelulosa = celulosa * PRECIOS_OTROS.celulosa;
  const valGases    = gases    * PRECIOS_OTROS.gases;
  const totalUSD    = valSilice + valBiochar + valCelulosa + valGases;
  const valorPorTon = tamo > 0 ? totalUSD / tamo : 0;

  const co2Evitado       = tamo * 1.4;
  const carbonoCapturado = biochar * 0.8;
  const tasaVal          = tamoSeco > 0 ? Math.round((silice + biochar + celulosa) / tamoSeco * 100) : 0;

  return { tamo, tamoSeco, ceniza, silice, biochar, celulosa, gases,
    valSilice, valBiochar, valCelulosa, valGases, totalUSD, valorPorTon,
    co2Evitado, carbonoCapturado, tasaVal };
}

// ---------------------------------------------------------------
// Formateo
// ---------------------------------------------------------------
function fmt(n, dec = 1) {
  return Number(n).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function fmtPeso(toneladas) {
  if (unidadActual === 'kg') {
    return fmt(toneladas * 1000, 1) + ' <span style="font-size:12px;font-weight:400;">kg</span>';
  }
  return fmt(toneladas) + ' <span style="font-size:12px;font-weight:400;">t</span>';
}
function fmtUSD(n) {
  return 'USD ' + Math.round(n).toLocaleString('es-CO');
}

// ---------------------------------------------------------------
// Render tarjetas de producción
// ---------------------------------------------------------------
function renderProduccion(d) {
  const items = [
    { emoji:'💎', nombre:'Sílice amorfa',  qty:d.silice,   bg:'#caf492', color:'#1d9e4f', txt:'#27500A' },
    { emoji:'🪵', nombre:'Biochar',         qty:d.biochar,  bg:'#FAEEDA', color:'#BA7517', txt:'#633806' },
    { emoji:'🧵', nombre:'Celulosa',        qty:d.celulosa, bg:'#EEEDFE', color:'#534AB7', txt:'#3C3489' },
    { emoji:'💨', nombre:'Gases pirólisis', qty:d.gases,    bg:'#E6F1FB', color:'#185FA5', txt:'#0C447C' },
  ];
  document.getElementById('cards-produccion').innerHTML = items.map(it => `
    <div style="background:${it.bg};border-radius:12px;padding:14px 12px;">
      <div style="font-size:22px;margin-bottom:6px;">${it.emoji}</div>
      <p style="font-size:12px;color:${it.color};margin:0 0 2px;">${it.nombre}</p>
      <p style="font-size:20px;font-weight:600;color:${it.txt};margin:0;">
         ${fmtPeso(it.qty)}
      </p>
    </div>`).join('');
}

// ---------------------------------------------------------------
// Render tarjetas económicas
// ---------------------------------------------------------------
function renderEconomico(d) {
  const items = [
    { label:'Ingresos totales',       value:fmtUSD(d.totalUSD),    dest:true  },
    { label:'Por sílice amorfa',      value:fmtUSD(d.valSilice),   dest:false },
    { label:'Por biochar',            value:fmtUSD(d.valBiochar),  dest:false },
    { label:'Valor por ton. de tamo', value:fmtUSD(d.valorPorTon), dest:false },
  ];
  document.getElementById('cards-economico').innerHTML = items.map(it => `
    <div style="background:${it.dest?'#1D9E75':'#fff'};border:1px solid ${it.dest?'#1D9E75':'#e5e7eb'};
      border-radius:12px;padding:14px 12px;">
      <p style="font-size:12px;color:${it.dest?'#EAF3DE':'#6b7280'};margin:0 0 4px;">${it.label}</p>
      <p style="font-size:15px;font-weight:600;color:${it.dest?'#fff':'#27500A'};margin:0;">${it.value}</p>
    </div>`).join('');
}

// ---------------------------------------------------------------
// Render tarjetas ambientales
// ---------------------------------------------------------------
function renderAmbiental(d) {
  const unidad = unidadActual === 'kg' ? 'kg' : 't';
  const conv   = unidadActual === 'kg' ? 1000 : 1;
  const items = [
    { emoji:'☁️', label:'CO₂ evitado',        value: fmt(d.co2Evitado * conv) + ' ' + unidad + ' CO₂' },
    { emoji:'🔥', label:'Biomasa no quemada',  value: fmt(d.tamo * conv) + ' ' + unidad               },
    { emoji:'🌱', label:'Carbono en suelo',    value: fmt(d.carbonoCapturado * conv) + ' ' + unidad + ' C' },
    { emoji:'♻️', label:'Tasa valorización',   value: d.tasaVal + '%'                                  },
  ];
  document.getElementById('cards-ambiental').innerHTML = items.map(it => `
    <div style="background:#EAF3DE;border-radius:12px;padding:14px 12px;">
      <div style="font-size:22px;margin-bottom:6px;">${it.emoji}</div>
      <p style="font-size:12px;color:#3B6D11;margin:0 0 2px;">${it.label}</p>
      <p style="font-size:16px;font-weight:600;color:#27500A;margin:0;">${it.value}</p>
    </div>`).join('');
}

// ---------------------------------------------------------------
// Selección de proceso
// ---------------------------------------------------------------
function seleccionarProceso(proceso, btn) {
  procesoActual = proceso;
  document.querySelectorAll('.proceso-btn').forEach(b => {
    b.classList.remove('border-teal-400','bg-teal-50');
    b.classList.add('border-gray-200','bg-gray-50');
    b.querySelector('p').classList.replace('text-teal-600','text-gray-700');
  });
  btn.classList.remove('border-gray-200','bg-gray-50');
  btn.classList.add('border-teal-400','bg-teal-50');
  btn.querySelector('p').classList.replace('text-gray-700','text-teal-600');
  actualizar();
}

// ---------------------------------------------------------------
// Actualización principal
// ---------------------------------------------------------------
function actualizar() {
  const tamo = obtenerTamoEnToneladas();
  const humedad = document.getElementById('humedad').value;
  document.getElementById('hum-val').textContent = humedad + '%';

  // Mostrar equivalencia de unidad
  const eq = document.getElementById('tamo-equivalencia');
  if(eq){
    if (unidadActual === 'kg') {
      eq.textContent = `= ${fmt(tamo, 3)} toneladas`;
    } else {
      eq.textContent = `= ${Math.round(tamo * 1000).toLocaleString()} kg`;
    }
  }

  const d = calcular();
  renderProduccion(d);
  renderEconomico(d);
  renderAmbiental(d);
  if(typeof actualizarGraficas === 'function') {
    actualizarGraficas(d);
  }
}

// ---------------------------------------------------------------
// Init
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  mostrarPrecioReferencia();
  actualizar();
});
