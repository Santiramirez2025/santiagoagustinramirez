// api/availability.js — devuelve los horarios libres para una sesión/booking.
const PRICING = require('../public/shared/pricing.js');
const slots = require('../lib/slots.js');
const db = require('../lib/db.js');
const calendar = require('../lib/calendar.js');
const mode = require('../lib/mode.js');

module.exports = async (req, res) => {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  try {
    const serviceId = (req.query && req.query.service) || 'sesion';
    const session = PRICING.SESSIONS[serviceId];
    if (!session) { res.status(400).json({ error: 'invalid_service' }); return; }

    const candidates = slots.candidateStarts();
    if (candidates.length === 0) { res.status(200).json({ service: serviceId, slots: [] }); return; }

    const fromIso = new Date(candidates[0]).toISOString();
    const toIso = new Date(new Date(candidates[candidates.length - 1]).getTime() + session.durationMin * 60000).toISOString();

    // Ocupados en DB + Google Calendar (en mock: nada ocupado).
    const mock = mode.isMock();
    const taken = mock ? [] : await db.takenSlots(serviceId, fromIso, toIso);
    const takenSet = new Set(taken.map((r) => new Date(r.slot_start).getTime()));

    let busy = [];
    if (!mock) { try { busy = await calendar.busy(fromIso, toIso); } catch (e) { console.error('[availability] calendar', e && e.message); } }

    function overlapsBusy(startMs, endMs) {
      return busy.some((b) => {
        const bs = new Date(b.start).getTime(), be = new Date(b.end).getTime();
        return startMs < be && endMs > bs;
      });
    }

    const free = candidates.filter((c) => {
      const startMs = new Date(c).getTime();
      const endMs = startMs + session.durationMin * 60000;
      if (takenSet.has(startMs)) return false;
      if (overlapsBusy(startMs, endMs)) return false;
      return true;
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      service: serviceId,
      duration_min: session.durationMin,
      price_usd: session.priceUsd,
      slots: free
    });
  } catch (e) {
    console.error('[availability] error', e);
    res.status(500).json({ error: 'availability_failed' });
  }
};
