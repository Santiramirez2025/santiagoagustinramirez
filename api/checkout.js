// api/checkout.js — crea la preferencia de MP para la SEÑA de un proyecto.
// El precio SIEMPRE se recalcula acá; nunca se confía en el monto del cliente.
const crypto = require('crypto');
const PRICING = require('../public/shared/pricing.js');
const mp = require('../lib/mp.js');
const db = require('../lib/db.js');
const meta = require('../lib/meta.js');
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
    const sel = {
      service: b.service,
      modules: Array.isArray(b.modules) ? b.modules : [],
      design: b.design === 'custom' ? 'custom' : 'template',
      urgency: b.urgency === 'express' ? 'express' : 'standard',
      integration: !!b.integration
    };
    if (!PRICING.SERVICES[sel.service]) { res.status(400).json({ error: 'invalid_service' }); return; }

    const quote = PRICING.calc(sel);
    const depositCfg = {
      depositPct: process.env.DEPOSIT_PCT ? Number(process.env.DEPOSIT_PCT) : undefined,
      depositMinUsd: process.env.DEPOSIT_MIN_USD ? Number(process.env.DEPOSIT_MIN_USD) : undefined
    };
    const depositUsd = PRICING.deposit(quote.quoteUsd, depositCfg);

    // --- DEV MOCK: sin MP/DB/CAPI, redirige a una página de gracias de demo ---
    if (mode.isMock()) {
      res.status(200).json({
        init_point: `/gracias.html?order=MOCK&status=approved`,
        order: 'MOCK', event_id: 'mock', deposit_usd: depositUsd,
        amount: depositUsd, currency: 'USD', quote_usd: quote.quoteUsd, mock: true
      });
      return;
    }

    const orderId = crypto.randomUUID();
    const eventId = crypto.randomUUID(); // Purchase event_id (dedup Pixel <-> CAPI)
    const url = baseUrl(req);

    const pref = await mp.createPreference({
      orderId,
      title: `Seña — ${quote.serviceName}`,
      unitPriceUsd: depositUsd,
      backUrls: {
        success: `${url}/gracias.html?order=${orderId}`,
        pending: `${url}/pendiente.html?order=${orderId}`,
        failure: `${url}/error.html?order=${orderId}`
      },
      notificationUrl: `${url}/api/mp-webhook`,
      payer: { email: b.email, name: b.name }
    });

    await db.createOrder({
      id: orderId, event_id: eventId, kind: 'project',
      service_id: sel.service, service_name: quote.serviceName, config: sel,
      quote_usd: quote.quoteUsd, deposit_usd: depositUsd,
      amount: pref.amount, currency: pref.currency,
      buyer_email: b.email, buyer_phone: b.phone, buyer_name: b.name,
      mp_preference_id: pref.id
    });

    // InitiateCheckout server-side (robustez; el Pixel dispara el suyo en el click)
    meta.sendEvent({
      name: 'InitiateCheckout',
      eventId: crypto.randomUUID(),
      eventSourceUrl: `${url}/app/`,
      value: pref.amount, currency: pref.currency,
      user: { email: b.email, phone: b.phone, ip: clientIp(req), userAgent: req.headers['user-agent'], fbp: b.fbp, fbc: b.fbc },
      customData: { content_name: quote.serviceName, content_ids: [sel.service], content_type: 'product' },
      testCode: process.env.META_TEST_EVENT_CODE
    }).catch(() => {});

    res.status(200).json({
      init_point: pref.init_point,
      order: orderId,
      event_id: eventId,
      deposit_usd: depositUsd,
      amount: pref.amount,
      currency: pref.currency,
      quote_usd: quote.quoteUsd
    });
  } catch (e) {
    console.error('[checkout] error', e);
    res.status(500).json({ error: 'checkout_failed' });
  }
};
