// api/track.js — ingesta de eventos de comportamiento (analytics propio, first-party)
// + reenvío de conversiones a Meta Conversions API (dedup con el Pixel por event_id).
//
// Recibe vía sendBeacon/fetch un evento { event, ... } o un lote { events: [...] }.
// - Conversiones (InitiateCheckout, Contact, Lead, ViewContent, Purchase) → Meta CAPI.
// - TODOS los eventos → tabla `events` en Neon (tu propio analytics, independiente de bloqueadores).
// Privacidad: guardamos IDs anónimos de primera parte, NO guardamos IP cruda en nuestra DB
// (la IP solo se usa, en el momento, para el match de Meta).

const { sendEvent } = require('../lib/meta');
const { sql } = require('../lib/db');

const CAPI_EVENTS = { InitiateCheckout: 1, Contact: 1, Lead: 1, ViewContent: 1, Purchase: 1 };

// Crea la tabla una sola vez por instancia (sin migración manual).
let _ensured;
function ensureTable() {
  if (!process.env.DATABASE_URL) return Promise.resolve(false);
  if (!_ensured) {
    _ensured = sql`
      CREATE TABLE IF NOT EXISTS events (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        visitor_id text, session_id text, event text NOT NULL,
        path text, referrer text,
        utm_source text, utm_medium text, utm_campaign text,
        device text, meta jsonb, ua text,
        created_at timestamptz NOT NULL DEFAULT now()
      )`
      .then(function () { return sql`CREATE INDEX IF NOT EXISTS events_created_idx ON events (created_at)`; })
      .then(function () { return sql`CREATE INDEX IF NOT EXISTS events_event_idx ON events (event)`; })
      .then(function () { return sql`CREATE INDEX IF NOT EXISTS events_session_idx ON events (session_id)`; })
      .then(function () { return true; })
      .catch(function (e) { console.error('[track] ensureTable', e.message); _ensured = null; return false; });
  }
  return _ensured;
}

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body != null) { resolve(req.body); return; }
    var d = '';
    req.on('data', function (c) { d += c; });
    req.on('end', function () { resolve(d); });
    req.on('error', function () { resolve(''); });
  });
}
function cookie(req, name) {
  var c = req.headers.cookie || '';
  var m = c.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : undefined;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  res.setHeader('Cache-Control', 'no-store');

  let body = await readBody(req);
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  const batch = Array.isArray(body.events) ? body.events : [body];
  const ua = req.headers['user-agent'];
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || undefined;
  const fbp = cookie(req, '_fbp');
  const fbc = cookie(req, '_fbc');

  try {
    await ensureTable();
    const tasks = [];
    for (const ev of batch) {
      if (!ev || !ev.event) continue;

      // 1) Meta CAPI para conversiones (mismo event_id que el Pixel → deduplicado)
      if (CAPI_EVENTS[ev.event] && ev.eventId) {
        tasks.push(sendEvent({
          name: ev.event, eventId: ev.eventId, eventSourceUrl: ev.url, actionSource: 'website',
          user: { ip: ip, userAgent: ua, fbp: fbp, fbc: fbc },
          customData: { content_name: ev.contentName, contact_method: ev.contactMethod }
        }).catch(function () {}));
      }

      // 2) Analytics propio (Neon)
      if (process.env.DATABASE_URL) {
        const m = ev.meta && typeof ev.meta === 'object' ? ev.meta : {};
        tasks.push(sql`
          INSERT INTO events (visitor_id, session_id, event, path, referrer, utm_source, utm_medium, utm_campaign, device, meta, ua)
          VALUES (${ev.visitorId || null}, ${ev.sessionId || null}, ${ev.event}, ${ev.path || null}, ${ev.referrer || null},
                  ${ev.utm_source || null}, ${ev.utm_medium || null}, ${ev.utm_campaign || null}, ${ev.device || null},
                  ${JSON.stringify(m)}, ${ua || null})
        `.catch(function (e) { console.error('[track] insert', e.message); }));
      }
    }
    await Promise.all(tasks);
  } catch (e) {
    console.error('[track] error', e && e.message);
  }
  res.status(204).end();
};
