// api/lead.js — guarda a quien calculó su costo del desorden y dejó contacto.
// Devuelve SOLO el número, nunca el plan ni la recomendación: eso es el producto pago.
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
    horas_semana: horas,
    horas_anio: horasAnio,
    semanas_enteras: semanasEnteras,
    facturacion_mensual: facturacionMensual,
    valor_hora: Math.round(valorHora),
    costo_anual: costoAnual,
    ventas_equivalentes: ventasEquivalentes
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  try {
    const b = req.body || {};
    const email = String(b.email || '').trim();
    if (!email || email.indexOf('@') < 0) { res.status(400).json({ error: 'email_invalido' }); return; }

    const ventas = num(b.ventas);
    const ticket = num(b.ticket);
    const horas = num(b.horas);
    if (!ventas || !ticket || !horas) { res.status(400).json({ error: 'faltan_datos' }); return; }

    const resultado = calcular(ventas, ticket, horas);
    const id = crypto.randomUUID();
    const utm = (b.utm && typeof b.utm === 'object') ? b.utm : {};

    await db.ensureLeadsTable();
    await db.saveLead({
      id, email,
      phone: String(b.phone || '').trim() || null,
      name: String(b.name || '').trim() || null,
      inputs: { ventas, ticket, horas }, resultado, utm
    });

    const url = baseUrl(req);
    meta.sendEvent({
      name: 'Lead', eventId: id, eventSourceUrl: `${url}/reservar.html`,
      user: { email, phone: b.phone, ip: clientIp(req), userAgent: req.headers['user-agent'], fbp: b.fbp, fbc: b.fbc },
      customData: { content_name: 'Costo del desorden', utm_content: utm.utm_content, utm_campaign: utm.utm_campaign },
      testCode: process.env.META_TEST_EVENT_CODE
    }).catch(() => {});

    res.status(200).json({ ok: true, id, event_id: id, resultado });
  } catch (e) {
    console.error('[lead] error', e);
    res.status(500).json({ error: 'server_error' });
  }
};
