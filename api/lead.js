// api/lead.js — captura de leads de las DOS PUERTAS + el calculador "costo del desorden".
//
// Acepta dos formatos, sin romper el contrato viejo:
//   A) Calculador (reservar.html):  { email, ventas, ticket, horas, phone?, name?, utm? }
//      → devuelve { ok, id, event_id, resultado }  (SOLO el número, nunca el plan: eso es el producto pago).
//   B) Puerta (cabeza/negocio):     { puerta, email, phone?, name?, respuestas?, consent, hp?, t?, utm?, path? }
//      → guarda el lead; para la puerta "negocio" con datos de facturación, también devuelve el resultado.
//
// Anti-bot sin captcha: honeypot (hp) + tiempo mínimo (t). Rate-limit por IP. Respuesta < 300 ms
// (el envío a Meta CAPI es fire-and-forget).
const crypto = require('crypto');
const db = require('../lib/db.js');
const meta = require('../lib/meta.js');

function baseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}
function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  return xff ? String(xff).split(',')[0].trim() : undefined;
}
function num(v) {
  const n = Number(String(v == null ? '' : v).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.'));
  return isFinite(n) && n > 0 ? n : 0;
}

// Aritmética, no estimación: cuántas horas al año se van en tareas repetitivas,
// y cuánto vale una hora de su negocio según su propia facturación.
const HORAS_LABORALES_ANIO = 40 * 52;
function calcular(ventas, ticket, horas) {
  const horasAnio = Math.round(horas * 52);
  const facturacionMensual = Math.round(ventas * ticket);
  const facturacionAnual = facturacionMensual * 12;
  const valorHora = facturacionAnual > 0 ? facturacionAnual / HORAS_LABORALES_ANIO : 0;
  const costoAnual = Math.round(horasAnio * valorHora);
  const ventasEquivalentes = ticket > 0 ? Math.round(costoAnual / ticket) : 0;
  const semanasEnteras = Math.round((horasAnio / 40) * 10) / 10;
  return {
    horas_semana: horas, horas_anio: horasAnio, semanas_enteras: semanasEnteras,
    facturacion_mensual: facturacionMensual, valor_hora: Math.round(valorHora),
    costo_anual: costoAnual, ventas_equivalentes: ventasEquivalentes
  };
}

// Rate-limit por IP en memoria del runtime (best-effort; se reinicia con el lambda).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map();
function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) { // poda defensiva
    for (const [k, v] of hits) { if (!v.length || now - v[v.length - 1] > WINDOW_MS) hits.delete(k); }
  }
  return arr.length > MAX_PER_WINDOW;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  try {
    const b = req.body || {};

    // --- Anti-bot: honeypot + tiempo mínimo. Respondemos ok para no darle pistas al bot. ---
    if (b.hp) { res.status(200).json({ ok: true }); return; }
    if (b.t != null && Number(b.t) < 1200) { res.status(200).json({ ok: true }); return; }

    const ip = clientIp(req);
    if (rateLimited(ip)) { res.status(429).json({ error: 'rate_limited' }); return; }

    const email = String(b.email || '').trim();
    if (!email || email.indexOf('@') < 0) { res.status(400).json({ error: 'email_invalido' }); return; }

    const puerta = (b.puerta === 'cabeza' || b.puerta === 'negocio') ? b.puerta : null;
    const utm = (b.utm && typeof b.utm === 'object') ? b.utm : {};
    const id = crypto.randomUUID();
    const entryPath = String(b.path || req.headers['referer'] || '').slice(0, 300) || null;

    // ¿Vienen números de facturación? (calculador clásico o auditoría de negocio)
    const ventas = num(b.ventas), ticket = num(b.ticket), horas = num(b.horas);
    const tieneCalculo = ventas && ticket && horas;

    // Compatibilidad: el formato viejo (sin puerta) EXIGÍA los tres números.
    if (!puerta && !tieneCalculo) { res.status(400).json({ error: 'faltan_datos' }); return; }

    const resultado = tieneCalculo ? calcular(ventas, ticket, horas) : {};
    const inputs = tieneCalculo ? { ventas, ticket, horas } : (b.respuestas && typeof b.respuestas === 'object' ? b.respuestas : {});

    await db.ensureLeadsTable();
    await db.saveLead({
      id, email,
      phone: String(b.phone || '').trim() || null,
      name: String(b.name || '').trim() || null,
      inputs, resultado, utm,
      puerta,
      consent: b.consent === true || b.consent === 'true' || b.consent === 1,
      estado: 'nuevo',
      entry_path: entryPath
    });

    const url = baseUrl(req);
    meta.sendEvent({
      name: 'Lead', eventId: id,
      eventSourceUrl: entryPath && entryPath.indexOf('http') === 0 ? entryPath : `${url}/`,
      user: { email, phone: b.phone, ip, userAgent: req.headers['user-agent'], fbp: b.fbp, fbc: b.fbc },
      customData: { content_name: puerta ? ('Puerta ' + puerta) : 'Costo del desorden', utm_content: utm.utm_content, utm_campaign: utm.utm_campaign },
      testCode: process.env.META_TEST_EVENT_CODE
    }).catch(() => {});

    res.status(200).json({ ok: true, id, event_id: id, puerta, resultado });
  } catch (e) {
    console.error('[lead] error', e);
    res.status(500).json({ error: 'server_error' });
  }
};
