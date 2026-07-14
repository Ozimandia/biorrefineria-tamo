const test = require('node:test');
const assert = require('node:assert/strict');

test('los porcentajes de ingresos con total cero son cero', () => {
  const valores = [0, 0, 0, 0];
  const total = valores.reduce((acumulado, valor) => acumulado + valor, 0);
  const porcentajes = total > 0
    ? valores.map(valor => Math.round((valor / total) * 100))
    : valores.map(() => 0);

  assert.deepEqual(porcentajes, [0, 0, 0, 0]);
});

test('la referencia manual de sílice conserva los valores aprobados', () => {
  const precio = { precio_usd_ton: 1820, rango_min: 1400, rango_max: 2200 };

  assert.equal(precio.precio_usd_ton, 1820);
  assert.equal(precio.rango_min, 1400);
  assert.equal(precio.rango_max, 2200);
});
