// api/mp-webhook.js — recibe la notificación de Mercado Pago.
// Valida firma -> consulta el pago -> si approved e idempotente -> Purchase (CAPI) + confirma booking.
const PRICING = require('../public/shared/pricing.js');
const mp = require('../lib/mp.js');
const db = require('../lib/db.js');
const meta = require('../lib/meta.js');
const calendar = require('../lib/calendar.js');

function baseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = async (req, res) => {
  // Responder rápido; MP reintenta si no recibe 200.
  try {
    const q = req.query || {};
    const body = req.body || {};
    const type = q.type || q.topic || body.type || body.action;
    const dataId = (q['data.id'] || (body.data && body.data.id) || q.id);

    // Solo nos interesan pagos.
    if (!type || String(type).indexOf('payment') === -1) { res.status(200).json({ ok: true, ignored: true }); return; }

    const ok = mp.validateSignature({
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
      dataId
    });
    if (!ok) { console.warn('[webhook] firma inválida'); res.status(401).json({ error: 'invalid_signature' }); return; }

    const payment = await mp.getPayment(dataId);
    if (!payment || payment.status !== 'approved') { res.status(200).json({ ok: true, status: payment && payment.status }); return; }

    const orderId = payment.external_reference;
    if (!orderId) { res.status(200).json({ ok: true, note: 'sin external_reference' }); return; }

    const marked = await db.markPaidOnce(orderId, String(payment.id), payment.transaction_amount);
    if (!marked) { res.status(200).json({ ok: true, duplicate: true }); return; } // ya procesado

    const order = marked;
    const url = baseUrl(req);
    // Atribución guardada al crear el pedido: qué anuncio trajo esta venta.
    const cfg = (order.config && typeof order.config === 'object') ? order.config : {};
    const utm = (cfg.utm && typeof cfg.utm === 'object') ? cfg.utm : {};

    // Purchase server-side con el MISMO event_id que dispara el Pixel en /gracias.html
    await meta.sendEvent({
      name: 'Purchase',
      eventId: order.event_id,
      eventSourceUrl: `${url}/gracias.html`,
      value: Number(order.amount), currency: order.currency,
      actionSource: 'website',
      user: { email: order.buyer_email || (payment.payer && payment.payer.email), phone: order.buyer_phone },
      customData: { content_name: order.service_name, content_ids: [order.service_id], content_type: 'product', utm_content: utm.utm_content, utm_campaign: utm.utm_campaign },
      testCode: process.env.META_TEST_EVENT_CODE
    }).catch((e) => console.error('[webhook] CAPI Purchase falló', e && e.message));

    // Si era una reserva, confirmar y crear evento en Google Calendar.
    if (order.kind === 'booking') {
      try {
        const rows = await db.sql`SELECT * FROM bookings WHERE order_id = ${orderId} LIMIT 1`;
        const bk = rows[0];
        if (bk) {
          const gcalId = await calendar.createEvent({
            summary: `${order.service_name} — ${order.buyer_name || order.buyer_email || 'Cliente'}`,
            description: [
              `Antes de la sesión, completá el cuestionario previo (10 minutos):`,
              `${url}/cuestionario.html?order=${orderId}`,
              ``,
              `Son 14 preguntas sobre tu negocio. Con eso llego sabiendo dónde mirar y los 90 minutos se van enteros en encontrar las fugas.`,
              ``,
              `—`,
              `Reserva pagada vía Mercado Pago.`,
              `Orden: ${orderId}`,
              `Email: ${order.buyer_email || '-'}`,
              `Tel: ${order.buyer_phone || '-'}`
            ].join('\n'),
            startIso: new Date(bk.slot_start).toISOString(),
            endIso: new Date(bk.slot_end).toISOString(),
            attendeeEmail: order.buyer_email || undefined
          });
          await db.confirmBooking(orderId, gcalId);
        }
      } catch (e) { console.error('[webhook] booking/calendar falló', e && e.message); }
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[webhook] error', e);
    // 200 igual para evitar reintentos infinitos ante errores no recuperables; los recuperables se re-consultan.
    res.status(200).json({ ok: false });
  }
};
