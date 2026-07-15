export const PRECIO_SILICE = { precio_usd_ton: 1820, rango_min: 1400, rango_max: 2200, fuente: 'Intel Market Research', fecha: 'enero 2026', tipo: 'precipitated silica RHA' };

const PRECIOS_OTROS = { biochar: 120, celulosa: 200, gases: 50 };
const RENDIMIENTOS = {
  pirolisis: { ceniza: 0.10, biochar: 0.35, gases: 0.55 },
  combustion: { ceniza: 0.12, biochar: 0, gases: 0.88 },
  mixto: { ceniza: 0.08, biochar: 0.15, celulosa: 0.40, gases: 0.37 }
};

export function calcular({ cantidad, unidad, humedad, proceso }) {
  const valor = Math.max(0, Number(cantidad) || 0);
  const tamo = unidad === 'kg' ? valor / 1000 : valor;
  const tamoSeco = tamo * (1 - Number(humedad) / 100);
  const rend = RENDIMIENTOS[proceso];
  const silice = tamoSeco * rend.ceniza * 0.90;
  const biochar = tamoSeco * (rend.biochar || 0);
  const celulosa = tamoSeco * (rend.celulosa || 0);
  const gases = tamoSeco * (rend.gases || 0);
  const valSilice = silice * PRECIO_SILICE.precio_usd_ton;
  const valBiochar = biochar * PRECIOS_OTROS.biochar;
  const valCelulosa = celulosa * PRECIOS_OTROS.celulosa;
  const valGases = gases * PRECIOS_OTROS.gases;
  const totalUSD = valSilice + valBiochar + valCelulosa + valGases;
  return { tamo, silice, biochar, celulosa, gases, valSilice, valBiochar, valCelulosa, valGases, totalUSD,
    valorPorTon: tamo ? totalUSD / tamo : 0, co2Evitado: tamo * 1.4, carbonoCapturado: biochar * 0.8,
    tasaVal: tamoSeco ? Math.round(((silice + biochar + celulosa) / tamoSeco) * 100) : 0 };
}

export const numero = (valor, decimales = 1) => Number(valor).toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
export const usd = valor => `USD ${Math.round(valor).toLocaleString('es-CO')}`;
