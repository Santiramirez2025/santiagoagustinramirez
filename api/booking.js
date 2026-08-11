// api/booking.js — reserva una sesión y crea la preferencia de MP (pago 100% de la sesión).
const crypto = require('crypto');
const PRICING = require('../public/shared/pricing.js');
const slots = require('../lib/slots.js');
const mp = require('../lib/mp.js');
const db = require('../lib/db.js');
const meta = require('../lib/meta.js');
const calendar = require('../lib/calendar.js');
const mode = require('../lib/mode.js');

function baseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}
function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  return xff ? String(xff).split(',')[0].trim() : undefined;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  try {
    const b = req.body || {};
    const serviceId = b.service || 'sesion';
    const session = PRICING.SESSIONS[serviceId];
    if (!session) { res.status(400).json({ error: 'invalid_service' }); return; }
    if (!b.slot) { res.status(400).json({ error: 'missing_slot' }); return; }
    if (!b.email) { res.status(400).json({ error: 'missing_email' }); return; }

    // El slot debe ser uno de los candidatos válidos y estar en el futuro.
    const valid = slots.candidateStarts();
    if (valid.indexOf(b.slot) === -1) { res.status(400).json({ error: 'invalid_slot' }); return; }
    const startMs = new Date(b.slot).getTime();
    if (startMs <= Date.now()) { res.status(400).json({ error: 'slot_in_past' }); return; }
    const endIso = slots.endFor(b.slot, session.durationMin);

    // --- DEV MOCK: sin MP/DB/Calendar ---
    if (mode.isMock()) {
      res.status(200).json({ init_point: `/gracias.html?order=MOCKB&status=approved`, order: 'MOCKB', event_id: 'mock', amount: session.priceUsd, currency: 'USD', mock: true });
      return;
    }

    // Chequeo rápido contra calendario (el guard real es el UNIQUE de la DB).
    try {
      const busy = await calendar.busy(new Date(b.slot).toISOString(), endIso);
      const conflict = busy.some((x) => startMs < new Date(x.end).getTime() && (startMs + session.durationMin * 60000) > new Date(x.start).getTime());
      if (conflict) { res.status(409).json({ error: 'slot_taken' }); return; }
    } catch (e) { /* si el calendario falla, seguimos: el UNIQUE protege */ }

    const orderId = crypto.randomUUID();
    const bookingId = crypto.randomUUID();
    const eventId = crypto.randomUUID();
    const url = baseUrl(req);

    const pref = await mp.createPreference({
      orderId,
      title: `${session.name} (${session.durationMin} min)`,
      unitPriceUsd: session.priceUsd,
      backUrls: {
        success: `${url}/gracias.html?order=${orderId}`,
        pending: `${url}/pendiente.html?order=${orderId}`,
        failure: `${url}/error.html?order=${orderId}`
      },
      notificationUrl: `${url}/api/mp-webhook`,
      payer: { email: b.email, name: b.name }
    });

    await db.createOrder({
      id: orderId, event_id: eventId, kind: 'booking',
      service_id: serviceId, service_name: session.name, config: { slot: b.slot },
      quote_usd: session.priceUsd, deposit_usd: session.priceUsd,
      amount: pref.amount, currency: pref.currency,
      buyer_email: b.email, buyer_phone: b.phone, buyer_name: b.name,
      mp_preference_id: pref.id
    });

    // Reserva el slot (UNIQUE (slot_start, service_id) evita doble reserva).
    const hold = await db.createBookingHold({
      id: bookingId, order_id: orderId, service_id: serviceId,
      slot_start: new Date(b.slot).toISOString(), slot_end: endIso
    });
    if (!hold) { res.status(409).json({ error: 'slot_taken' }); return; }

    meta.sendEvent({
      name: 'InitiateCheckout', eventId: crypto.randomUUID(), eventSourceUrl: `${url}/reservar.html`,
      value: pref.amount, currency: pref.currency,
      user: { email: b.email, phone: b.phone, ip: clientIp(req), userAgent: req.headers['user-agent'], fbp: b.fbp, fbc: b.fbc },
      customData: { content_name: session.name, content_ids: [serviceId], content_type: 'product' },
      testCode: process.env.META_TEST_EVENT_CODE
    }).catch(() => {});

    res.status(200).json({ init_point: pref.init_point, order: orderId, event_id: eventId, amount: pref.amount, currency: pref.currency });
  } catch (e) {
    console.error('[booking] error', e);
    res.status(500).json({ error: 'booking_failed' });
  }
};
