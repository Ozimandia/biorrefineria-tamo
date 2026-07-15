import React, { useMemo, useState } from 'react';
import { calcular, numero, PRECIO_SILICE, usd } from './calculos.js';
import { ETAPAS } from './etapas.js';
import UnitToggle from './UnitToggle.jsx';

const productos = [
  ['💎', 'Sílice amorfa', 'silice', '#caf492'], ['🪵', 'Biochar', 'biochar', '#FAEEDA'],
  ['🧵', 'Celulosa', 'celulosa', '#EEEDFE'], ['💨', 'Gases pirólisis', 'gases', '#E6F1FB']
];
const procesos = { pirolisis: ['🔥 Pirólisis', 'Mayor rendimiento de biochar. Ideal para carbono.'], combustion: ['⚡ Combustión', 'Mayor ceniza y sílice. Proceso más directo.'], mixto: ['⚖️ Mixto', 'Balance entre sílice y biochar. Recomendado.'] };

function Tarjeta({ etiqueta, valor, destacada = false }) {
  return <article className={`tarjeta ${destacada ? 'destacada' : ''}`}><p>{etiqueta}</p><strong>{valor}</strong></article>;
}

function Graficas({ datos, unidad }) {
  const cantidades = productos.map(([, , llave]) => datos[llave] * (unidad === 'kg' ? 1000 : 1));
  const valores = [datos.valSilice, datos.valBiochar, datos.valCelulosa, datos.valGases];
  const maximo = Math.max(...cantidades, 1);
  const total = valores.reduce((a, b) => a + b, 0);
  const colores = ['#1D9E75', '#BA7517', '#534AB7', '#185FA5'];
  const gradiente = total ? `conic-gradient(${colores.map((color, i) => `${color} ${valores.slice(0, i).reduce((a, b) => a + b, 0) / total * 100}% ${valores.slice(0, i + 1).reduce((a, b) => a + b, 0) / total * 100}%`).join(',')})` : '#e5e7eb';
  return <section className="graficas">
    <article className="panel"><h3>Distribución de subproductos</h3><div className="barras">{productos.map(([,, llave], i) => <div className="barra-grupo" key={llave}><div className="barra" style={{ height: `${cantidades[i] / maximo * 150}px`, background: colores[i] }} /><span>{productos[i][1]}</span><b>{numero(cantidades[i])} {unidad}</b></div>)}</div></article>
    <article className="panel"><h3>Participación en ingresos</h3><div className="dona" style={{ background: gradiente }}><span>{usd(total)}</span></div><div className="leyenda">{productos.map(([,, llave], i) => <span key={llave}><i style={{ background: colores[i] }} />{productos[i][1]} {total ? Math.round(valores[i] / total * 100) : 0}%</span>)}</div></article>
  </section>;
}

function Proceso() {
  const [activa, setActiva] = useState(null);
  const etapa = activa === null ? null : ETAPAS[activa];
  return <section className="seccion"><h2>🏭 Proceso específico de biorrefinería modular</h2><p className="ayuda">Seleccione una etapa para ver sus operaciones detalladas.</p>
    <div className="progreso"><div style={{ width: activa === null ? '0%' : `${(activa + 1) / ETAPAS.length * 100}%` }} /></div>
    <div className="etapas">{ETAPAS.map((item, i) => <button key={item.titulo} onClick={() => setActiva(i)} className={activa === i ? 'etapa activa' : 'etapa'} style={{ '--color': item.color, '--fondo': item.fondo }}><span>{item.icono}</span><b>Etapa {i + 1}</b><small>{item.titulo}</small></button>)}</div>
    <div className="detalle" style={etapa ? { borderColor: etapa.color, background: etapa.fondo } : {}}>{etapa ? <><span className="numero-etapa" style={{ background: etapa.color }}>Etapa {activa + 1}</span><h3 style={{ color: etapa.color }}>{etapa.icono} {etapa.titulo}</h3><p>{etapa.resumen}</p><b>Operaciones</b><ul>{etapa.operaciones.map(op => <li key={op}>{op}</li>)}</ul><p className="resultado"><b>Resultado:</b> {etapa.resultado}</p>{activa < ETAPAS.length - 1 && <button className="siguiente" onClick={() => setActiva(activa + 1)} style={{ background: etapa.color }}>Siguiente etapa →</button>}</> : '👉 Seleccione una etapa para ver el detalle.'}</div>
  </section>;
}

export default function App() {
  const [cantidad, setCantidad] = useState(10); const [unidad, setUnidad] = useState('kg'); const [humedad, setHumedad] = useState(15); const [proceso, setProceso] = useState('pirolisis');
  const datos = useMemo(() => calcular({ cantidad, unidad, humedad, proceso }), [cantidad, unidad, humedad, proceso]);
  const peso = valor => `${numero(valor * (unidad === 'kg' ? 1000 : 1))} ${unidad}`;
  return <><header><div><p>Asociación de Arroceros · Proyecto Biorrefinería</p><h1>Calculadora de Valorización del Tamo de Arroz</h1><p>Ingrese los datos de su cosecha y vea el potencial económico y ambiental.</p></div></header><main>
    <section className="precio"><div><p>Precio de referencia · Sílice amorfa de cascarilla de arroz</p><strong>{usd(PRECIO_SILICE.precio_usd_ton)}/t</strong><span>Rango: USD {PRECIO_SILICE.rango_min.toLocaleString('es-CO')}–{PRECIO_SILICE.rango_max.toLocaleString('es-CO')}/t</span><small>Fuente: {PRECIO_SILICE.fuente} · {PRECIO_SILICE.fecha} · {PRECIO_SILICE.tipo}</small></div></section>
    <section className="seccion"><h2>📋 Ingrese sus datos</h2><div className="cantidad-row"><label>Cantidad de tamo disponible<input type="number" min="0" step="any" value={cantidad} onChange={e => setCantidad(e.target.value)} /></label><UnitToggle unidad={unidad} onChange={setUnidad} /></div><p className="ayuda">= {unidad === 'kg' ? `${numero(datos.tamo, 3)} toneladas` : `${Math.round(datos.tamo * 1000).toLocaleString('es-CO')} kg`}</p>
      <label>Humedad estimada del tamo <b>{humedad}%</b><input type="range" min="5" max="40" value={humedad} onChange={e => setHumedad(e.target.value)} /><span className="ayuda">Recién trillado: 20–30% · Secado al sol: 10–15%</span></label>
      <div className="procesos">{Object.entries(procesos).map(([llave, [titulo, descripcion]]) => <button key={llave} onClick={() => setProceso(llave)} className={proceso === llave ? 'seleccionado' : ''}><b>{titulo}</b><span>{descripcion}</span></button>)}</div>
    </section>
    <h2>📦 Producción estimada de subproductos</h2><div className="tarjetas">{productos.map(([emoji, nombre, llave, fondo]) => <Tarjeta key={llave} etiqueta={`${emoji} ${nombre}`} valor={peso(datos[llave])} />)}</div>
    <h2>💰 Valor económico proyectado</h2><div className="tarjetas"><Tarjeta destacada etiqueta="Ingresos totales" valor={usd(datos.totalUSD)} /><Tarjeta etiqueta="Por sílice amorfa" valor={usd(datos.valSilice)} /><Tarjeta etiqueta="Por biochar" valor={usd(datos.valBiochar)} /><Tarjeta etiqueta="Valor por ton. de tamo" valor={usd(datos.valorPorTon)} /></div>
    <Graficas datos={datos} unidad={unidad} />
    <h2>🌿 Beneficios ambientales estimados</h2><div className="tarjetas"><Tarjeta etiqueta="☁️ CO₂ evitado" valor={`${peso(datos.co2Evitado)} CO₂`} /><Tarjeta etiqueta="🔥 Biomasa no quemada" valor={peso(datos.tamo)} /><Tarjeta etiqueta="🌱 Carbono en suelo" valor={`${peso(datos.carbonoCapturado)} C`} /><Tarjeta etiqueta="♻️ Tasa valorización" valor={`${datos.tasaVal}%`} /></div>
    <Proceso />
   <section className="seccion manual">
  <h2>📄 Manual del proceso</h2>
  <p className="ayuda">Guía técnica completa de la biorrefinería modular de tamo de arroz.</p>
  
  <div className="contenedor-pdf" style={{ width: '100%', height: '600px', marginTop: '20px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <object
      data="/manual-biorefineria.pdf"
      type="application/pdf"
      width="100%"
      height="100%"
    >
      {/* Mensaje alternativo si el navegador no puede renderizar el PDF directamente (ej. navegadores móviles) */}
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', border: '1px dashed #ccc' }}>
        <p>Tu navegador no admite la visualización directa de PDFs.</p>
        <a 
          href="/manual-biorefineria.pdf" 
          className="boton-descarga" 
          target="_blank" 
          rel="noreferrer"
          style={{ display: 'inline-block', marginTop: '10px', padding: '10px 20px', backgroundColor: '#3f6212', color: '#fff', borderRadius: '5px', textDecoration: 'none' }}
        >
          Ver o descargar manual (PDF)
        </a>
      </div>
    </object>
  </div>
</section>
  </main></>;
}
