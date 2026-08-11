-- Esquema de la tienda / bookings / tracking
-- Ejecutar una vez contra Neon Postgres (psql "$DATABASE_URL" -f db/schema.sql)

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY,              -- uuid generado en el server (external_reference de MP)
  event_id       TEXT NOT NULL,                -- compartido Pixel <-> CAPI para deduplicar
  kind           TEXT NOT NULL DEFAULT 'project', -- 'project' | 'booking'
  service_id     TEXT NOT NULL,
  service_name   TEXT NOT NULL,
  config         JSONB NOT NULL DEFAULT '{}',  -- modules, design, urgency, integration
  quote_usd      INTEGER NOT NULL,             -- precio fijo estimado del proyecto (USD)
  deposit_usd    INTEGER NOT NULL,             -- seña en USD
  amount         NUMERIC(14,2) NOT NULL,       -- monto realmente cobrado
  currency       TEXT NOT NULL DEFAULT 'ARS',  -- ARS | USD
  status         TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | refunded
  buyer_email    TEXT,
  buyer_phone    TEXT,
  buyer_name     TEXT,
  mp_preference_id TEXT,
  mp_payment_id  TEXT UNIQUE,                  -- UNIQUE => idempotencia del webhook
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);

CREATE TABLE IF NOT EXISTS bookings (
  id            TEXT PRIMARY KEY,
  order_id      TEXT REFERENCES orders(id) ON DELETE CASCADE,
  service_id    TEXT NOT NULL,
  slot_start    TIMESTAMPTZ NOT NULL,
  slot_end      TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'hold',  -- hold | confirmed | cancelled
  gcal_event_id TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- evita doble reserva del mismo horario confirmado
  UNIQUE (slot_start, service_id)
);

CREATE INDEX IF NOT EXISTS bookings_slot_idx ON bookings (slot_start);
