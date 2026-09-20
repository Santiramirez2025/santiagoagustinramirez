// api/stats.js — agrega los eventos de comportamiento para el mini-dashboard (panel.html).
// Protegido: requiere el header `x-stats-token` que coincida con la env STATS_TOKEN.
// Si STATS_TOKEN no está seteada, deniega todo (seguro por defecto).
const crypto = require('crypto');
const { sql, ensureEventsTable } = require('../lib/db');

function safeEqual(a, b) {
  if (!a || !b) return false;
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  if (A.length !== B.length) return false;
  try { return crypto.timingSafeEqual(A, B); } catch (e) { return false; }
}
function num(v) { return v == null ? 0 : Number(v); }

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  const secret = process.env.STATS_TOKEN;
  if (!secret) { res.status(503).json({ error: 'no_token', message: 'Configurá la env STATS_TOKEN en Vercel para habilitar el panel.' }); return; }
  const token = req.headers['x-stats-token'] || '';
  if (!safeEqual(token, secret)) { res.status(401).json({ error: 'unauthorized' }); return; }

  if (!process.env.DATABASE_URL) { res.status(503).json({ error: 'no_db' }); return; }
  await ensureEventsTable();

  let days = parseInt((req.query && req.query.days) || '7', 10);
  if (!(days > 0) || days > 90) days = 7;
  const iv = `${days} days`;

  try {
    const [overview, timeline, devices, sources, angles, pages, scroll, ctas, recent] = await Promise.all([
      sql`SELECT
            COUNT(DISTINCT visitor_id) AS visitors,
            COUNT(DISTINCT session_id) AS sessions,
            COUNT(*) FILTER (WHERE event='page_view') AS pageviews,
            COUNT(*) FILTER (WHERE event='wa_click') AS wa_contacts,
            COUNT(DISTINCT session_id) FILTER (WHERE event='wa_click') AS wa_sessions,
            COUNT(DISTINCT session_id) FILTER (WHERE event='engaged') AS engaged_sessions,
            COUNT(*) FILTER (WHERE event='rage_click') AS rage_clicks,
            ROUND(AVG((meta->>'seconds')::numeric) FILTER (WHERE event='page_time')) AS avg_seconds
          FROM events WHERE created_at >= now() - ${iv}::interval`,
      sql`SELECT to_char(date_trunc('day', created_at),'YYYY-MM-DD') AS day,
            COUNT(*) FILTER (WHERE event='page_view') AS pageviews,
            COUNT(*) FILTER (WHERE event='wa_click') AS wa
          FROM events WHERE created_at >= now() - ${iv}::interval
          GROUP BY 1 ORDER BY 1`,
      sql`SELECT COALESCE(NULLIF(device,''),'?') AS device, COUNT(DISTINCT session_id) AS sessions
          FROM events WHERE created_at >= now() - ${iv}::interval GROUP BY 1 ORDER BY 2 DESC`,
      sql`SELECT COALESCE(NULLIF(utm_source,''),'directo/orgánico') AS source, COUNT(DISTINCT session_id) AS sessions
          FROM events WHERE created_at >= now() - ${iv}::interval AND event='page_view' GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
      // Rendimiento por ángulo de anuncio (utm_content): sesiones y cuántas llegan al checkout.
      sql`SELECT COALESCE(NULLIF(utm_content,''),'(sin ángulo)') AS angle,
                 COUNT(DISTINCT session_id) AS sessions,
                 COUNT(DISTINCT session_id) FILTER (WHERE event='InitiateCheckout') AS checkouts
          FROM events WHERE created_at >= now() - ${iv}::interval
          GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      sql`SELECT path, COUNT(*) AS views FROM events
          WHERE created_at >= now() - ${iv}::interval AND event='page_view' AND path IS NOT NULL
          GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
      sql`SELECT (meta->>'depth')::int AS depth, COUNT(DISTINCT session_id) AS sessions
          FROM events WHERE created_at >= now() - ${iv}::interval AND event='scroll' AND meta->>'depth' IS NOT NULL
          GROUP BY 1 ORDER BY 1`,
      sql`SELECT COALESCE(meta->>'name', meta->>'source') AS cta, COUNT(*) AS clicks
          FROM events WHERE created_at >= now() - ${iv}::interval AND event IN ('click','wa_click')
            AND COALESCE(meta->>'name', meta->>'source') IS NOT NULL
          GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      sql`SELECT event, path, device, to_char(created_at,'YYYY-MM-DD HH24:MI:SS') AS at
          FROM events WHERE created_at >= now() - ${iv}::interval
          ORDER BY created_at DESC LIMIT 30`
    ]);

    const o = overview[0] || {};
    const sessions = num(o.sessions);
    res.status(200).json({
      range_days: days,
      overview: {
        visitors: num(o.visitors), sessions: sessions, pageviews: num(o.pageviews),
        wa_contacts: num(o.wa_contacts), wa_sessions: num(o.wa_sessions),
        engaged_sessions: num(o.engaged_sessions), rage_clicks: num(o.rage_clicks),
        avg_seconds: num(o.avg_seconds),
        conv_rate: sessions ? num(o.wa_sessions) / sessions : 0,
        engaged_rate: sessions ? num(o.engaged_sessions) / sessions : 0
      },
      timeline: timeline.map((r) => ({ day: r.day, pageviews: num(r.pageviews), wa: num(r.wa) })),
      devices: devices.map((r) => ({ device: r.device, sessions: num(r.sessions) })),
      sources: sources.map((r) => ({ source: r.source, sessions: num(r.sessions) })),
      angles: angles.map((r) => ({
        angle: r.angle, sessions: num(r.sessions), checkouts: num(r.checkouts),
        rate: num(r.sessions) ? num(r.checkouts) / num(r.sessions) : 0
      })),
      pages: pages.map((r) => ({ path: r.path, views: num(r.views) })),
      scroll: scroll.map((r) => ({ depth: num(r.depth), sessions: num(r.sessions) })),
      ctas: ctas.map((r) => ({ cta: r.cta, clicks: num(r.clicks) })),
      recent: recent
    });
  } catch (e) {
    console.error('[stats] error', e && e.message);
    res.status(500).json({ error: 'query_failed', message: e.message });
  }
};
