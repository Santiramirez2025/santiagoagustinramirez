// api/order-status.js — datos autoritativos de una orden para la página de gracias (Pixel Purchase).
const db = require('../lib/db.js');
const mode = require('../lib/mode.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  try {
    const id = req.query && req.query.order;
    if (!id) { res.status(400).json({ error: 'missing_order' }); return; }

    // --- DEV MOCK ---
    if (mode.isMock() && String(id).indexOf('MOCK') === 0) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ status: 'approved', event_id: 'mock', value: 0, currency: 'USD', service_name: 'Demo (mock)', kind: id === 'MOCKB' ? 'booking' : 'project' });
      return;
    }
    const o = await db.getOrder(id);
    if (!o) { res.status(404).json({ error: 'not_found' }); return; }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      status: o.status,
      event_id: o.event_id,
      value: Number(o.amount),
      currency: o.currency,
      service_name: o.service_name,
      kind: o.kind
    });
  } catch (e) {
    console.error('[order-status] error', e);
    res.status(500).json({ error: 'failed' });
  }
};
