// ============================================================
//  calculos.js  –  Lógica central + precio sílice vía API
// ============================================================

let procesoActual = 'pirolisis';
let unidadActual  = 'kg';

// Precio base (se actualiza con la API)
let precioSilicePorTon = 1820;

const PRECIOS_OTROS = { biochar: 120, celulosa: 200, gases: 50 };

const RENDIMIENTOS = {
  pirolisis:  { ceniza: 0.20, biochar: 0.30, celulosa: 0.35, gases: 0.28 },
  combustion: { ceniza: 0.22, biochar: 0.25, celulosa: 0.30, gases: 0.20 },
  mixto:      { ceniza: 0.21, biochar: 0.28, celulosa: 0.33, gases: 0.24 }
};
const FRACCION_SILICE = 0.90;

// ---------------------------------------------------------------
// Obtener precio sílice desde Claude API con web search
// ---------------------------------------------------------------
async function consultarPrecio() {
  const btn = document.getElementById('btn-actualizar');
  const disp = document.getElementById('precio-display');
  const rango = document.getElementById('precio-rango');
  const fuente = document.getElementById('precio-fuente');
  const errDiv = document.getElementById('precio-error');

  btn.disabled = true;
  btn.innerHTML = '<svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg> Consultando...';
  disp.textContent = 'Consultando...';
  errDiv.classList.add('hidden');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `Busca el precio actual de mercado en USD por tonelada de sílice amorfa derivada de la paja de arroz (rice husk ash silica, RHA silica) en 2026. 
          Responde SOLO con un objeto JSON sin texto adicional ni backticks, con esta estructura exacta:
          {"precio_usd_ton": 1820, "rango_min": 800, "rango_max": 2500, "fuente": "nombre de la fuente", "fecha": "mes año", "tipo": "precipitated silica RHA"}`
        }]
      })
    });

    const data = await res.json();
    const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const jsonMatch = textBlocks.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error('Sin datos de precio');

    const precio = JSON.parse(jsonMatch[0]);
    precioSilicePorTon = precio.precio_usd_ton;

    disp.textContent = `USD ${precio.precio_usd_ton.toLocaleString('es-CO')}/t`;
    rango.textContent = `Rango: $${precio.rango_min.toLocaleString()}–$${precio.rango_max.toLocaleString()}/t`;
    fuente.textContent = `Fuente: ${precio.fuente} · ${precio.fecha} · ${precio.tipo}`;

    actualizar();
  } catch (e) {
    errDiv.textContent = 'No se pudo obtener el precio en línea. Usando referencia de mercado 2026: USD 1,820/t (sílice precipitada RHA).';
    errDiv.classList.remove('hidden');
    disp.textContent = 'USD 1,820/t';
    rango.textContent = 'Rango referencial: $800–$2,500/t';
    fuente.textContent = 'Fuente: Promedio mercado global RHA silica 2026';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg> Actualizar precio';
  }
}

// ---------------------------------------------------------------
// Unidad kg / t
// ---------------------------------------------------------------
function seleccionarUnidad(u) {
  unidadActual = u;
  document.getElementById('btn-kg').className = u === 'kg'
    ? 'unidad-btn px-4 py-3 text-sm font-semibold bg-verde-600 text-white transition-all'
    : 'unidad-btn px-4 py-3 text-sm font-semibold bg-white text-gray-500 transition-all';
  document.getElementById('btn-t').className = u === 't'
    ? 'unidad-btn px-4 py-3 text-sm font-semibold bg-verde-600 text-white transition-all'
    : 'unidad-btn px-4 py-3 text-sm font-semibold bg-white text-gray-500 transition-all';
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
  const biochar   = tamoSeco * rend.biochar;
  const celulosa  = tamoSeco * rend.celulosa;
  const gases     = tamoSeco * rend.gases;

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
        ${fmt(it.qty)} <span style="font-size:12px;font-weight:400;">t</span>
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
  const items = [
    { emoji:'☁️', label:'CO₂ evitado',        value:fmt(d.co2Evitado)+' t CO₂' },
    { emoji:'🔥', label:'Biomasa no quemada',  value:fmt(d.tamo)+' t'            },
    { emoji:'🌱', label:'Carbono en suelo',    value:fmt(d.carbonoCapturado)+' t C' },
    { emoji:'♻️', label:'Tasa valorización',   value:d.tasaVal+'%'               },
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
  if (unidadActual === 'kg') {
    eq.textContent = `= ${fmt(tamo, 3)} toneladas`;
  } else {
    eq.textContent = `= ${Math.round(tamo * 1000).toLocaleString()} kg`;
  }

  const d = calcular();
  renderProduccion(d);
  renderEconomico(d);
  renderAmbiental(d);
  actualizarGraficas(d);
}

// ---------------------------------------------------------------
// Init
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  consultarPrecio();
  actualizar();
});
