// api/questionnaire.js — cuestionario previo al Diagnóstico Negocio Ordenado.
//
// GET  /api/questionnaire?order=<id>  → devuelve el contexto del pedido + respuestas ya guardadas.
// POST /api/questionnaire             → guarda/actualiza respuestas { order, email, answers }.
//
// El id de pedido es un UUID: funciona como token de acceso. Sin pedido igual se
// puede completar (Santiago manda el link suelto), y queda guardado por email.
const crypto = require('crypto');
const db = require('../lib/db.js');

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body != null) { resolve(req.body); return; }
    var d = '';
    req.on('data', function (c) { d += c; });
    req.on('end', function () { resolve(d); });
    req.on('error', function () { resolve(''); });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.DATABASE_URL) { res.status(503).json({ error: 'no_db' }); return; }

  try {
    await db.ensureQuestionnaireTable();

    if (req.method === 'GET') {
      const orderId = (req.query && req.query.order) || '';
      if (!orderId) { res.status(200).json({ ok: true, order: null, answers: {} }); return; }
      const q = await db.getQuestionnaire(orderId);
      const order = await db.getOrder(orderId).catch(function () { return null; });
      res.status(200).json({
        ok: true,
        order: order ? {
          id: order.id,
          name: order.buyer_name || null,
          service: order.service_name || null,
          slot: (order.config && order.config.slot) || null,
          status: order.status || null
        } : null,
        answers: (q && q.answers) || {},
        submitted_at: (q && q.updated_at) || null
      });
      return;
    }

    if (req.method === 'POST') {
      let body = await readBody(req);
      if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
      const answers = (body && body.answers && typeof body.answers === 'object') ? body.answers : null;
      if (!answers) { res.status(400).json({ error: 'missing_answers' }); return; }

      const orderId = body.order || null;
      const email = body.email || null;
      if (!orderId && !email) { res.status(400).json({ error: 'missing_identity' }); return; }

      const id = orderId || ('free-' + crypto.randomUUID());
      await db.saveQuestionnaire({ id: id, order_id: orderId, email: email, answers: answers });
      res.status(200).json({ ok: true, id: id });
      return;
    }

    res.status(405).json({ error: 'method_not_allowed' });
  } catch (e) {
    console.error('[questionnaire] error', e && e.message);
    res.status(500).json({ error: 'failed' });
  }
};
