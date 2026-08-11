// api/assistant.js — endpoint del Asistente IA de ventas.
const assistant = require('../lib/assistant.js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  try {
    const b = req.body || {};
    const history = Array.isArray(b.messages) ? b.messages : [];
    if (history.length > 40) { res.status(400).json({ error: 'too_many_messages' }); return; }
    const out = await assistant.chat(history);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(out);
  } catch (e) {
    console.error('[assistant] error', e);
    res.status(500).json({ error: 'assistant_failed', reply: 'Tuve un problema. Probá de nuevo o escribime por WhatsApp.' });
  }
};
