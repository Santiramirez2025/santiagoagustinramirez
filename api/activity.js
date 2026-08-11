// api/activity.js — prueba social viva: proyectos entregados + última reserva (desde Postgres).
const db = require('../lib/db.js');
const mode = require('../lib/mode.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  try {
    if (mode.isMock()) {
      res.status(200).json({ delivered: 27, last_reserved_hours: 3, recent: [{ service: 'E-commerce' }, { service: 'Landing Page' }], mock: true });
      return;
    }
    const paid = await db.sql`SELECT service_name, paid_at FROM orders WHERE status = 'approved' ORDER BY paid_at DESC NULLS LAST LIMIT 5`;
    const cnt = await db.sql`SELECT count(*)::int AS n FROM orders WHERE status = 'approved'`;
    let lastHours = null;
    if (paid[0] && paid[0].paid_at) {
      lastHours = Math.max(0, Math.round((Date.now() - new Date(paid[0].paid_at).getTime()) / 3600000));
    }
    res.status(200).json({
      delivered: cnt[0] ? cnt[0].n : 0,
      last_reserved_hours: lastHours,
      recent: paid.map(function (r) { return { service: r.service_name }; })
    });
  } catch (e) {
    console.error('[activity] error', e);
    res.status(200).json({ delivered: null, last_reserved_hours: null, recent: [] });
  }
};
