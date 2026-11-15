// scripts/test-lead.js — test mínimo de api/lead.js (anti-bot, formatos, rate-limit)
// Mockea lib/db y lib/meta para no tocar Neon ni Meta. Correr: node scripts/test-lead.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');

// --- Mocks via require.cache (antes de requerir api/lead) ---
const saved = [];
require.cache[require.resolve(path.join(ROOT, 'lib', 'db.js'))] = {
  id: 'db', filename: 'db', loaded: true,
  exports: { ensureLeadsTable: async () => true, saveLead: async (l) => { saved.push(l); } }
};
require.cache[require.resolve(path.join(ROOT, 'lib', 'meta.js'))] = {
  id: 'meta', filename: 'meta', loaded: true,
  exports: { sendEvent: async () => ({ ok: true }) }
};

const lead = require(path.join(ROOT, 'api', 'lead.js'));

function mockRes() {
  const r = { _code: 0, _json: null };
  r.status = (c) => { r._code = c; return r; };
  r.json = (o) => { r._json = o; return r; };
  return r;
}
async function call(body, headers) {
  const req = { method: 'POST', headers: Object.assign({ 'user-agent': 'test' }, headers || {}), body };
  const res = mockRes();
  await lead(req, res);
  return res;
}

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name); } }

(async () => {
  console.log('api/lead.js');

  // 1) honeypot -> 200 ok sin guardar
  let before = saved.length;
  let r = await call({ email: 'a@b.com', puerta: 'negocio', hp: 'soy-un-bot' }, { 'x-forwarded-for': '1.1.1.1' });
  ok('honeypot: 200 y no guarda', r._code === 200 && saved.length === before);

  // 2) tiempo mínimo -> 200 ok sin guardar
  before = saved.length;
  r = await call({ email: 'a@b.com', puerta: 'negocio', t: 300 }, { 'x-forwarded-for': '2.2.2.2' });
  ok('tiempo<1200ms: 200 y no guarda', r._code === 200 && saved.length === before);

  // 3) email inválido -> 400
  r = await call({ puerta: 'negocio', email: 'sinarroba' }, { 'x-forwarded-for': '3.3.3.3' });
  ok('email inválido: 400', r._code === 400);

  // 4) formato viejo (calculador) -> 200 con resultado
  r = await call({ email: 'viejo@b.com', ventas: 100, ticket: 40, horas: 10 }, { 'x-forwarded-for': '4.4.4.4' });
  ok('formato viejo: 200 con resultado', r._code === 200 && r._json && r._json.resultado && r._json.resultado.costo_anual > 0);

  // 5) formato puerta (sin cálculo) -> 200 guardado con puerta
  before = saved.length;
  r = await call({ email: 'puerta@b.com', puerta: 'cabeza', consent: true, t: 5000 }, { 'x-forwarded-for': '5.5.5.5' });
  ok('formato puerta: 200 y guarda con puerta=cabeza', r._code === 200 && saved.length === before + 1 && saved[saved.length - 1].puerta === 'cabeza');

  // 6) sin puerta y sin cálculo -> 400
  r = await call({ email: 'x@b.com' }, { 'x-forwarded-for': '6.6.6.6' });
  ok('sin puerta ni cálculo: 400', r._code === 400);

  // 7) rate-limit: >8 envíos desde la misma IP -> 429
  let got429 = false;
  for (let i = 0; i < 12; i++) {
    r = await call({ email: 'rl@b.com', puerta: 'negocio', t: 5000, consent: true }, { 'x-forwarded-for': '9.9.9.9' });
    if (r._code === 429) { got429 = true; break; }
  }
  ok('rate-limit por IP: 429', got429);

  console.log('\n' + pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
})();
