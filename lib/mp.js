// lib/mp.js — Mercado Pago Checkout Pro (SDK oficial v2) + validación de webhook.
const crypto = require('crypto');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

// Moneda de cobro. MP Argentina liquida en ARS.
const CURRENCY = process.env.MP_CURRENCY || 'ARS';
// USD_ARS_RATE: un número fijo, o 'auto' (default) para tomar el dólar EN VIVO.
const RATE_ENV = process.env.USD_ARS_RATE || 'auto';
const RATE_TYPE = process.env.USD_ARS_TYPE || 'blue'; // blue | oficial | tarjeta | mayorista | cripto
const RATE_FALLBACK = Number(process.env.USD_ARS_FALLBACK || '1300');
let _rate = { at: 0, val: 0 };

// Cotización actual USD→ARS (cacheada 1h). Fija si USD_ARS_RATE es un número; en vivo si es 'auto'.
async function currentRate() {
  if (RATE_ENV !== 'auto') { const n = Number(RATE_ENV); return n > 0 ? n : RATE_FALLBACK; }
  const now = Date.now();
  if (_rate.val && now - _rate.at < 3600000) return _rate.val;
  try {
    const j = await fetch('https://dolarapi.com/v1/dolares/' + RATE_TYPE).then((r) => r.json());
    const v = Number(j && j.venta);
    if (v > 0) { _rate = { at: now, val: v }; return v; }
  } catch (e) { console.error('[mp] no se pudo traer el dólar en vivo:', e && e.message); }
  return _rate.val || RATE_FALLBACK;
}

// Convierte un monto USD al monto a cobrar en la moneda configurada.
async function toChargeAmount(usd) {
  if (CURRENCY === 'USD') return Math.round(usd);
  const rate = await currentRate();
  return Math.round(usd * rate);
}

/*
 * Crea una preferencia y devuelve { id, init_point }.
 * opts = { orderId, title, unitPriceUsd, quantity=1, backUrls:{success,pending,failure}, notificationUrl, payer:{email,name} }
 */
async function createPreference(opts) {
  const pref = new Preference(client);
  const amount = await toChargeAmount(opts.unitPriceUsd);
  const res = await pref.create({
    body: {
      items: [{
        id: opts.orderId,
        title: opts.title,
        quantity: opts.quantity || 1,
        unit_price: amount,
        currency_id: CURRENCY
      }],
      external_reference: opts.orderId,
      back_urls: opts.backUrls,
      auto_return: 'approved',
      notification_url: opts.notificationUrl,
      payer: opts.payer && (opts.payer.email || opts.payer.name)
        ? { email: opts.payer.email, name: opts.payer.name }
        : undefined,
      statement_descriptor: 'SRAMIREZ'
    }
  });
  return { id: res.id, init_point: res.init_point, amount, currency: CURRENCY };
}

async function getPayment(id) {
  const payment = new Payment(client);
  return await payment.get({ id });
}

/*
 * Valida la firma del webhook de MP.
 * Header x-signature: "ts=<ts>,v1=<hmac>". x-request-id: <id>. query.data.id (o body).
 * Manifest: "id:<dataId>;request-id:<requestId>;ts:<ts>;" firmado con HMAC-SHA256(MP_WEBHOOK_SECRET).
 */
function validateSignature({ xSignature, xRequestId, dataId }) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) { console.warn('[mp] Falta MP_WEBHOOK_SECRET; no se puede validar firma'); return false; }
  if (!xSignature || !dataId) return false;

  const parts = {};
  xSignature.split(',').forEach(function (kv) {
    const i = kv.indexOf('=');
    if (i > 0) parts[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
  });
  const ts = parts.ts, v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${xRequestId || ''};ts:${ts};`;
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
  } catch (e) {
    return false;
  }
}

module.exports = { createPreference, getPayment, validateSignature, toChargeAmount, currentRate, CURRENCY };
