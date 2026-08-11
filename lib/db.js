// lib/db.js — acceso a Neon Postgres (serverless).
const { neon } = require('@neondatabase/serverless');

// Cliente lazy: se crea en el primer uso (no al importar), así el módulo se puede
// cargar aunque falte DATABASE_URL (p. ej. en build o import estático).
let _sql;
function sql(strings, ...values) {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql(strings, ...values);
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

module.exports = { sql, createOrder, getOrder, markPaidOnce, createBookingHold, confirmBooking, takenSlots };
