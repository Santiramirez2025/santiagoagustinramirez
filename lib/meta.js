// lib/meta.js — Conversions API (server-side) de Meta.
// Deduplica con el Pixel usando el MISMO event_name + event_id.
const crypto = require('crypto');

const API_VERSION = 'v21.0';

function sha256(v) {
  if (!v) return undefined;
  return crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');
}

// Normaliza teléfono a solo dígitos antes de hashear (requisito de Meta).
function hashPhone(p) {
  if (!p) return undefined;
  return sha256(String(p).replace(/[^0-9]/g, ''));
}

/*
 * Envía un evento a la Conversions API.
 * ev = {
 *   name, eventId, eventSourceUrl, actionSource='website',
 *   value, currency,
 *   user: { email, phone, ip, userAgent, fbp, fbc },
 *   customData: {...}, testCode
 * }
 */
async function sendEvent(ev) {
  const pixelId = process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    console.warn('[meta] Falta META_PIXEL_ID o META_CAPI_ACCESS_TOKEN; se omite el evento', ev.name);
    return { skipped: true };
  }

  const u = ev.user || {};
  const userData = {};
  if (u.email) userData.em = [sha256(u.email)];
  if (u.phone) userData.ph = [hashPhone(u.phone)];
  if (u.ip) userData.client_ip_address = u.ip;
  if (u.userAgent) userData.client_user_agent = u.userAgent;
  if (u.fbp) userData.fbp = u.fbp;
  if (u.fbc) userData.fbc = u.fbc;

  const customData = Object.assign({}, ev.customData);
  if (ev.value != null) customData.value = ev.value;
  if (ev.currency) customData.currency = ev.currency;

  const body = {
    data: [{
      event_name: ev.name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: ev.eventId,
      action_source: ev.actionSource || 'website',
      event_source_url: ev.eventSourceUrl,
      user_data: userData,
      custom_data: customData
    }]
  };
  if (ev.testCode) body.test_event_code = ev.testCode;

  const url = `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) console.error('[meta] CAPI error', res.status, json);
    return json;
  } catch (e) {
    console.error('[meta] CAPI fetch falló', e.message);
    return { error: e.message };
  }
}

module.exports = { sendEvent, sha256, hashPhone };
