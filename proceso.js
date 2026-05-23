// ============================================================
//  proceso.js  –  Proceso interactivo animado 7 etapas
// ============================================================

const ETAPAS = [
  {
    num: 1,
    color: '#1D9E75',
    bg: '#EAF3DE',
    titulo: 'Recepción y pretratamiento',
    icono: '🌾',
    resumen: 'Acondicionamiento físico del tamo',
    operaciones: ['Limpieza y eliminación de impurezas (piedras, metales, polvo)', 'Lavado con agua', 'Secado al sol o en secadores', 'Trituración y molienda inicial'],
    resultado: 'Tamo limpio y seco listo para proceso químico'
  },
  {
    num: 2,
    color: '#185FA5',
    bg: '#E6F1FB',
    titulo: 'Extracción de sílice (proceso químico)',
    icono: '⚗️',
    resumen: 'Digestión alcalina para disolver la sílice',
    operaciones: ['Digestión alcalina con NaOH (hidróxido de sodio)', 'Disolución de la sílice en solución líquida', 'Separación sólido-líquido mediante filtración'],
    resultado: 'Solución de silicato de sodio (vidrio líquido)'
  },
  {
    num: 3,
    color: '#BA7517',
    bg: '#FAEEDA',
    titulo: 'Precipitación y recuperación de sílice',
    icono: '🧪',
    resumen: 'Acidificación controlada para precipitar',
    operaciones: ['Acidificación controlada con HCl (ácido clorhídrico)', 'Precipitación de sílice amorfa en forma sólida', 'Filtración del sólido precipitado', 'Lavado del sólido para eliminar sales', 'Secado en horno o secador de spray'],
    resultado: 'Sílice amorfa húmeda en polvo grueso'
  },
  {
    num: 4,
    color: '#639922',
    bg: '#EAF3DE',
    titulo: 'Obtención de sílice de alta pureza',
    icono: '💎',
    resumen: 'Refinamiento y control de calidad',
    operaciones: ['Calcinación opcional para mejorar propiedades', 'Molienda fina hasta tamaño de partícula objetivo', 'Clasificación por tamaño (tamizado)', 'Control de calidad: pureza, superficie específica, pH'],
    resultado: '✅ Sílice amorfa de alta pureza lista para venta'
  },
  {
    num: 5,
    color: '#534AB7',
    bg: '#EEEDFE',
    titulo: 'Valorización de la fracción orgánica',
    icono: '🌿',
    resumen: 'Conversión del residuo orgánico en coproductos',
    operaciones: ['Pirólisis de la fracción sólida residual', 'Producción de biogás y bioetanol (bioenergía)', 'Producción de biochar (enmienda de suelo)', 'Extracción de compuestos fenólicos y químicos'],
    resultado: 'Bioenergía · Biochar · Compuestos químicos de valor'
  },
  {
    num: 6,
    color: '#993C1D',
    bg: '#FAECE7',
    titulo: 'Integración energética',
    icono: '⚡',
    resumen: 'Autosuficiencia energética del proceso',
    operaciones: ['Combustión de residuos sólidos para generar calor', 'Generación de vapor y/o electricidad interna', 'Recuperación de calor de gases de combustión', 'Logro de autosuficiencia energética del proceso'],
    resultado: 'Planta energéticamente autónoma y eficiente'
  },
  {
    num: 7,
    color: '#0F6E56',
    bg: '#E1F5EE',
    titulo: 'Gestión ambiental y cierre del ciclo',
    icono: '♻️',
    resumen: 'Economía circular y sostenibilidad',
    operaciones: ['Tratamiento y recirculación de aguas del proceso', 'Manejo adecuado de residuos sólidos finales', 'Monitoreo ambiental continuo (emisiones, vertidos)', 'Revaloración continua de subproductos residuales'],
    resultado: 'Proceso de economía circular con mínimo impacto'
  }
];

let etapaActiva = null;

function renderProceso() {
  const contenedor = document.getElementById('proceso-interactivo');

  // Barra de progreso animada
  const barraHTML = `
    <div style="position:relative;margin-bottom:24px;">
      <div style="height:4px;background:#e5e7eb;border-radius:99px;overflow:hidden;">
        <div id="barra-progreso" style="height:100%;width:0%;background:linear-gradient(90deg,#1D9E75,#639922);border-radius:99px;transition:width 0.5s ease;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;">
        ${ETAPAS.map(e => `
          <button onclick="activarEtapa(${e.num - 1})" id="dot-${e.num}"
            style="width:28px;height:28px;border-radius:50%;border:2px solid ${e.color};background:#fff;
            font-size:11px;font-weight:700;color:${e.color};cursor:pointer;transition:all 0.3s;flex-shrink:0;"
            title="Etapa ${e.num}: ${e.titulo}">
            ${e.num}
          </button>`).join('')}
      </div>
    </div>`;

  // Tarjetas de etapas (scroll horizontal en móvil)
  const tarjetasHTML = `
    <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:8px;scroll-snap-type:x mandatory;" id="tarjetas-container">
      ${ETAPAS.map((e, i) => `
        <div id="etapa-card-${i}" onclick="activarEtapa(${i})"
          style="min-width:100px;max-width:110px;flex-shrink:0;border-radius:14px;border:2px solid ${e.bg};
          background:${e.bg};padding:12px 10px;cursor:pointer;transition:all 0.3s;scroll-snap-align:start;
          display:flex;flex-direction:column;align-items:center;text-align:center;">
          <div style="font-size:26px;margin-bottom:6px;">${e.icono}</div>
          <div style="font-size:10px;font-weight:700;color:${e.color};margin-bottom:4px;">Etapa ${e.num}</div>
          <div style="font-size:10px;color:#555;line-height:1.3;">${e.titulo}</div>
        </div>`).join('')}
    </div>`;

  // Panel de detalle
  const detalleHTML = `
    <div id="panel-detalle" style="margin-top:16px;border-radius:16px;border:2px solid #e5e7eb;
      padding:20px;min-height:160px;transition:all 0.3s;background:#fafafa;">
      <div id="detalle-contenido" style="animation:fadeIn 0.3s ease;">
        <p style="color:#9ca3af;text-align:center;font-size:14px;margin:40px 0;">
          👆 Toque una etapa para ver sus operaciones detalladas
        </p>
      </div>
    </div>`;

  // Panel de resultado integral
  const resultadoHTML = `
    <div style="margin-top:20px;background:#EAF3DE;border-radius:14px;padding:16px;">
      <p style="font-size:12px;font-weight:700;color:#3B6D11;margin:0 0 10px;">🏆 Resultado integral del proceso</p>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
        <div style="background:#fff;border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:20px;">💎</div>
          <p style="font-size:11px;font-weight:600;color:#1D9E75;margin:4px 0 2px;">Producto principal</p>
          <p style="font-size:10px;color:#555;margin:0;">Sílice amorfa de alta pureza</p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:20px;">🌿</div>
          <p style="font-size:11px;font-weight:600;color:#534AB7;margin:4px 0 2px;">Coproductos</p>
          <p style="font-size:10px;color:#555;margin:0;">Biochar · Bioenergía · Compuestos</p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:20px;">♻️</div>
          <p style="font-size:11px;font-weight:600;color:#0F6E56;margin:4px 0 2px;">Beneficio</p>
          <p style="font-size:10px;color:#555;margin:0;">Economía circular sostenible</p>
        </div>
      </div>
    </div>`;

  contenedor.innerHTML = barraHTML + tarjetasHTML + detalleHTML + resultadoHTML;

  // Animación de entrada escalonada
  setTimeout(() => animarEntrada(), 100);
}

function animarEntrada() {
  ETAPAS.forEach((e, i) => {
    const card = document.getElementById(`etapa-card-${i}`);
    if (!card) return;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease, all 0.3s';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 80);
  });
}

function activarEtapa(idx) {
  const etapa = ETAPAS[idx];
  etapaActiva = idx;

  // Actualizar dots de progreso
  ETAPAS.forEach((e, i) => {
    const dot = document.getElementById(`dot-${i + 1}`);
    if (!dot) return;
    if (i <= idx) {
      dot.style.background = e.color;
      dot.style.color = '#fff';
      dot.style.borderColor = e.color;
    } else {
      dot.style.background = '#fff';
      dot.style.color = e.color;
      dot.style.borderColor = e.color;
    }
  });

  // Barra de progreso
  const barra = document.getElementById('barra-progreso');
  if (barra) barra.style.width = `${((idx + 1) / ETAPAS.length) * 100}%`;

  // Destacar tarjeta activa
  ETAPAS.forEach((e, i) => {
    const card = document.getElementById(`etapa-card-${i}`);
    if (!card) return;
    if (i === idx) {
      card.style.border = `2px solid ${etapa.color}`;
      card.style.background = etapa.color;
      card.querySelector('div:first-child').style.filter = 'brightness(1.2)';
      const textos = card.querySelectorAll('div:not(:first-child)');
      textos.forEach(t => t.style.color = '#fff');
    } else {
      card.style.border = `2px solid ${ETAPAS[i].bg}`;
      card.style.background = ETAPAS[i].bg;
      const textos = card.querySelectorAll('div:not(:first-child)');
      textos[0] && (textos[0].style.color = ETAPAS[i].color);
      textos[1] && (textos[1].style.color = '#555');
    }
  });

  // Actualizar panel de detalle
  const panel = document.getElementById('panel-detalle');
  const contenido = document.getElementById('detalle-contenido');
  if (!panel || !contenido) return;

  panel.style.borderColor = etapa.color;
  panel.style.background = etapa.bg;

  contenido.style.opacity = '0';
  setTimeout(() => {
    contenido.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap;">
        <div style="font-size:40px;flex-shrink:0;">${etapa.icono}</div>
        <div style="flex:1;min-width:200px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="background:${etapa.color};color:#fff;font-size:11px;font-weight:700;
              padding:2px 10px;border-radius:99px;">Etapa ${etapa.num}</span>
          </div>
          <h3 style="font-size:15px;font-weight:700;color:${etapa.color};margin:0 0 4px;">${etapa.titulo}</h3>
          <p style="font-size:13px;color:#555;margin:0 0 12px;">${etapa.resumen}</p>
          <p style="font-size:12px;font-weight:600;color:${etapa.color};margin:0 0 6px;">⚙️ Operaciones:</p>
          <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;">
            ${etapa.operaciones.map((op, oi) => `
              <li style="font-size:12px;color:#444;animation:slideIn 0.3s ease ${oi * 0.06}s both;">${op}</li>
            `).join('')}
          </ul>
          <div style="margin-top:12px;background:#fff;border-radius:10px;padding:10px 12px;
            border-left:4px solid ${etapa.color};">
            <p style="font-size:12px;font-weight:600;color:${etapa.color};margin:0 0 2px;">Resultado:</p>
            <p style="font-size:12px;color:#444;margin:0;">${etapa.resultado}</p>
          </div>
        </div>
      </div>
      ${idx < ETAPAS.length - 1 ? `
        <div style="margin-top:14px;text-align:right;">
          <button onclick="activarEtapa(${idx + 1})"
            style="background:${etapa.color};color:#fff;border:none;border-radius:10px;
            padding:8px 16px;font-size:12px;font-weight:600;cursor:pointer;">
            Siguiente etapa: ${ETAPAS[idx + 1].titulo} →
          </button>
        </div>` : `
        <div style="margin-top:14px;text-align:center;">
          <span style="background:${etapa.color};color:#fff;border-radius:10px;
            padding:8px 16px;font-size:12px;font-weight:600;">
            ✅ ¡Proceso completo! Ciclo de economía circular cerrado
          </span>
        </div>`}`;
    contenido.style.transition = 'opacity 0.3s ease';
    contenido.style.opacity = '1';
  }, 150);
}

// Estilos de animación globales
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
  @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; display:inline-block; }
`;
document.head.appendChild(styleEl);

document.addEventListener('DOMContentLoaded', () => {
  renderProceso();
});
