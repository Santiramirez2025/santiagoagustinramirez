// lib/db.js — acceso a Neon Postgres (serverless).
const { neon } = require('@neondatabase/serverless');

// Cliente lazy: se crea en el primer uso (no al importar), así el módulo se puede
// cargar aunque falte DATABASE_URL (p. ej. en build o import estático).
let _sql;
function sql(strings, ...values) {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql(strings, ...values);
}

// --- Analytics propio (tabla `events`) ---
let _eventsReady;
function ensureEventsTable() {
  if (!process.env.DATABASE_URL) return Promise.resolve(false);
  if (!_eventsReady) {
    _eventsReady = sql`
      CREATE TABLE IF NOT EXISTS events (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        visitor_id text, session_id text, event text NOT NULL,
        path text, referrer text,
        utm_source text, utm_medium text, utm_campaign text,
        utm_content text, utm_term text,
        device text, meta jsonb, ua text,
        created_at timestamptz NOT NULL DEFAULT now()
      )`
      // Tablas creadas antes de agregar la atribución por ángulo de anuncio.
      .then(function () { return sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS utm_content text`; })
      .then(function () { return sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS utm_term text`; })
      .then(function () { return sql`CREATE INDEX IF NOT EXISTS events_utm_content_idx ON events (utm_content)`; })
      .then(function () { return sql`CREATE INDEX IF NOT EXISTS events_created_idx ON events (created_at)`; })
      .then(function () { return sql`CREATE INDEX IF NOT EXISTS events_event_idx ON events (event)`; })
      .then(function () { return sql`CREATE INDEX IF NOT EXISTS events_session_idx ON events (session_id)`; })
      .then(function () { return true; })
      .catch(function (e) { console.error('[db] ensureEventsTable', e.message); _eventsReady = null; return false; });
  }
  return _eventsReady;
}

async function insertEvent(e) {
  const m = e.meta && typeof e.meta === 'object' ? e.meta : {};
  await sql`
    INSERT INTO events (visitor_id, session_id, event, path, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, device, meta, ua)
    VALUES (${e.visitorId || null}, ${e.sessionId || null}, ${e.event}, ${e.path || null}, ${e.referrer || null},
            ${e.utm_source || null}, ${e.utm_medium || null}, ${e.utm_campaign || null},
            ${e.utm_content || null}, ${e.utm_term || null}, ${e.device || null},
            ${JSON.stringify(m)}, ${e.ua || null})
  `;
}

// --- Cuestionario previo al Diagnóstico ---
let _qReady;
function ensureQuestionnaireTable() {
  if (!process.env.DATABASE_URL) return Promise.resolve(false);
  if (!_qReady) {
    _qReady = sql`
      CREATE TABLE IF NOT EXISTS questionnaires (
        id text PRIMARY KEY,
        order_id text,
        email text,
        answers jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`
      .then(function () { return sql`CREATE INDEX IF NOT EXISTS questionnaires_order_idx ON questionnaires (order_id)`; })
      .then(function () { return true; })
      .catch(function (e) { console.error('[db] ensureQuestionnaireTable', e.message); _qReady = null; return false; });
  }
  return _qReady;
}

async function saveQuestionnaire(q) {
  await sql`
    INSERT INTO questionnaires (id, order_id, email, answers, updated_at)
    VALUES (${q.id}, ${q.order_id || null}, ${q.email || null}, ${JSON.stringify(q.answers || {})}, now())
    ON CONFLICT (id) DO UPDATE
      SET answers = EXCLUDED.answers,
          email = COALESCE(EXCLUDED.email, questionnaires.email),
          updated_at = now()
  `;
}

async function getQuestionnaire(id) {
  const rows = await sql`SELECT * FROM questionnaires WHERE id = ${id} OR order_id = ${id} LIMIT 1`;
  return rows[0] || null;
}

async function createOrder(o) {
  await sql`
    INSERT INTO orders (id, event_id, kind, service_id, service_name, config,
                        quote_usd, deposit_usd, amount, currency, status,
                        buyer_email, buyer_phone, buyer_name, mp_preference_id)
    VALUES (${o.id}, ${o.event_id}, ${o.kind || 'project'}, ${o.service_id}, ${o.service_name},
            ${JSON.stringify(o.config || {})}, ${o.quote_usd}, ${o.deposit_usd}, ${o.amount},
            ${o.currency}, 'pending', ${o.buyer_email || null}, ${o.buyer_phone || null},
            ${o.buyer_name || null}, ${o.mp_preference_id || null})
  `;
}

async function getOrder(id) {
  const rows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
  return rows[0] || null;
}

// Marca la order como pagada de forma IDEMPOTENTE.
// Devuelve la order si esta llamada fue la que la marcó (primera vez), o null si ya estaba pagada.
async function markPaidOnce(orderId, paymentId, amount) {
  const rows = await sql`
    UPDATE orders
       SET status = 'approved', mp_payment_id = ${paymentId}, amount = ${amount}, paid_at = now()
     WHERE id = ${orderId}
       AND status <> 'approved'
       AND (mp_payment_id IS NULL OR mp_payment_id = ${paymentId})
    RETURNING *
  `;
  return rows[0] || null;
}

// --- Bookings ---
async function createBookingHold(b) {
  const rows = await sql`
    INSERT INTO bookings (id, order_id, service_id, slot_start, slot_end, status)
    VALUES (${b.id}, ${b.order_id}, ${b.service_id}, ${b.slot_start}, ${b.slot_end}, 'hold')
    ON CONFLICT (slot_start, service_id) DO NOTHING
    RETURNING *
  `;
  return rows[0] || null; // null => el slot ya estaba tomado
}

async function confirmBooking(orderId, gcalEventId) {
  const rows = await sql`
    UPDATE bookings SET status = 'confirmed', gcal_event_id = ${gcalEventId || null}
     WHERE order_id = ${orderId} RETURNING *
  `;
  return rows[0] || null;
}

async function takenSlots(serviceId, fromIso, toIso) {
  return await sql`
    SELECT slot_start FROM bookings
     WHERE service_id = ${serviceId} AND status <> 'cancelled'
       AND slot_start >= ${fromIso} AND slot_start < ${toIso}
  `;
}

module.exports = { sql, ensureEventsTable, insertEvent, createOrder, getOrder, markPaidOnce, createBookingHold, confirmBooking, takenSlots, ensureQuestionnaireTable, saveQuestionnaire, getQuestionnaire };
