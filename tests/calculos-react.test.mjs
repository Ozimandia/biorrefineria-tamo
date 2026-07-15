import test from 'node:test';
import assert from 'node:assert/strict';
import { calcular, PRECIO_SILICE } from '../src/calculos.js';

test('la lógica React calcula resultados para 1 tonelada de tamo seco al 15%', () => {
  const resultado = calcular({ cantidad: 1000, unidad: 'kg', humedad: 15, proceso: 'pirolisis' });

  assert.equal(resultado.tamo, 1);
  assert.ok(Math.abs(resultado.silice - 0.0765) < Number.EPSILON);
  assert.ok(resultado.totalUSD > 0);
});

test('la referencia manual de sílice conserva los valores aprobados', () => {
  assert.deepEqual(PRECIO_SILICE, {
    precio_usd_ton: 1820,
    rango_min: 1400,
    rango_max: 2200,
    fuente: 'Intel Market Research',
    fecha: 'enero 2026',
    tipo: 'precipitated silica RHA'
  });
});
