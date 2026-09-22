// api/orders.js — lista de pedidos para el centro de operaciones (centro.html).
// Protegido con el mismo STATS_TOKEN que el panel de analytics.
const crypto = require('crypto');
const db = require('../lib/db');

function safeEqual(a, b) {
  if (!a || !b) return false;
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  if (A.length !== B.length) return false;
  try { return crypto.timingSafeEqual(A, B); } catch (e) { return false; }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  const secret = process.env.STATS_TOKEN;
  if (!secret) { res.status(503).json({ error: 'no_token', message: 'Configurá STATS_TOKEN en Vercel.' }); return; }
  if (!safeEqual(req.headers['x-stats-token'] || '', secret)) { res.status(401).json({ error: 'unauthorized' }); return; }
  if (!process.env.DATABASE_URL) { res.status(503).json({ error: 'no_db' }); return; }

  try {
    await db.ensureQuestionnaireTable();
    const rows = await db.listOrders((req.query && req.query.limit) || 40);

    const orders = rows.map(function (o) {
      const cfg = (o.config && typeof o.config === 'object') ? o.config : {};
      const utm = (cfg.utm && typeof cfg.utm === 'object') ? cfg.utm : {};
      return {
        id: o.id,
        kind: o.kind,
        status: o.status,
        service: o.service_name,
        amount: o.amount == null ? null : Number(o.amount),
        currency: o.currency,
        usd: o.quote_usd == null ? null : Number(o.quote_usd),
        name: o.buyer_name || null,
        email: o.buyer_email || null,
        phone: o.buyer_phone || null,
        slot: o.slot_start || cfg.slot || null,
        created_at: o.created_at,
        angle: utm.utm_content || null,
        campaign: utm.utm_campaign || null,
        source: utm.utm_source || null,
        // Con la preferencia se reconstruye el link de pago para recuperar abandonos.
        preference: o.mp_preference_id || null,
        questionnaire: !!o.has_questionnaire,
        questionnaire_at: o.questionnaire_at || null
      };
    });

    const paid = orders.filter(function (o) { return o.status === 'approved' || o.status === 'paid'; });
    const pending = orders.filter(function (o) { return o.status === 'pending'; });

    // Leads del calculador de costo del desorden: gente con contacto que todavía no compró.
    let leads = [];
    try { await db.ensureLeadsTable(); leads = await db.listLeads(100); }
    catch (e) { console.error('[orders] leads', e && e.message); }

    res.status(200).json({
      ok: true,
      orders: orders,
      leads: leads,
      resumen: {
        total: orders.length,
        pagados: paid.length,
        pendientes: pending.length,
        sin_cuestionario: paid.filter(function (o) { return !o.questionnaire; }).length,
        leads: leads.length,
        leads_sin_comprar: leads.filter(function (l) { return !l.compro; }).length
      }
    });
  } catch (e) {
    console.error('[orders] error', e && e.message);
    res.status(500).json({ error: 'query_failed', message: e.message });
  }
};
