const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const raiz = path.resolve(__dirname, '..');

test('calculos.js usa la humedad del control accesible y muestra la referencia manual', () => {
  const elementos = {
    'tamo-input': { value: '1000' },
    humedad: { value: '15' },
    'precio-display': { textContent: '' },
    'precio-rango': { textContent: '' },
    'precio-fuente': { textContent: '' }
  };
  const contexto = {
    document: {
      getElementById: id => elementos[id],
      addEventListener: () => {}
    }
  };

  vm.createContext(contexto);
  vm.runInContext(fs.readFileSync(path.join(raiz, 'calculos.js'), 'utf8'), contexto);

  const resultado = contexto.calcular();
  contexto.mostrarPrecioReferencia();

  assert.equal(resultado.tamo, 1);
  assert.equal(resultado.tamoSeco, 0.85);
  assert.ok(Number.isFinite(resultado.totalUSD));
  assert.equal(elementos['precio-display'].textContent, 'USD 1.820/t');
  assert.match(elementos['precio-rango'].textContent, /1\.400.*2\.200/);
  assert.match(elementos['precio-fuente'].textContent, /Intel Market Research.*enero 2026/);
});

test('graficas.js no muestra NaN cuando todos los ingresos son cero', () => {
  const leyenda = { innerHTML: '' };
  const contexto = {
    document: { getElementById: () => leyenda },
    unidadActual: 'kg'
  };

  vm.createContext(contexto);
  vm.runInContext(fs.readFileSync(path.join(raiz, 'graficas.js'), 'utf8'), contexto);
  contexto.renderLeyendas({ valSilice: 0, valBiochar: 0, valCelulosa: 0, valGases: 0 });

  assert.doesNotMatch(leyenda.innerHTML, /NaN/);
  assert.match(leyenda.innerHTML, /0%/);
});
