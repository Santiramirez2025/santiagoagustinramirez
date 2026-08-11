// lib/slots.js — genera horarios candidatos para bookings (hora de Argentina, UTC-03:00).
const TZ = '-03:00';
const SLOT_STARTS = (process.env.BOOKING_STARTS || '10:00,12:00,15:00,17:00').split(',');
const WORK_DAYS = [1, 2, 3, 4, 5]; // Lun-Vie
const HORIZON_DAYS = Number(process.env.BOOKING_HORIZON_DAYS || '21');

function iso(dateStr, time) { return `${dateStr}T${time}:00${TZ}`; }
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function ymd(d) { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; }

// Día de la semana en hora AR para una fecha dada (mediodía AR).
function weekdayAR(dateStr) { return new Date(iso(dateStr, '12:00')).getUTCDay(); }

// Lista de fechas (YYYY-MM-DD) hábiles dentro del horizonte, desde mañana.
function workDates() {
  const out = [];
  const base = new Date(); // ahora
  for (let i = 1; i <= HORIZON_DAYS; i++) {
    const d = new Date(base.getTime() + i * 86400000);
    const ds = ymd(d);
    if (WORK_DAYS.indexOf(weekdayAR(ds)) !== -1) out.push(ds);
  }
  return out;
}

// Genera todos los starts candidatos (ISO con offset) en el horizonte.
function candidateStarts() {
  const out = [];
  workDates().forEach(function (ds) {
    SLOT_STARTS.forEach(function (t) { out.push(iso(ds, t)); });
  });
  return out;
}

function endFor(startIso, durationMin) {
  return new Date(new Date(startIso).getTime() + durationMin * 60000).toISOString();
}

module.exports = { candidateStarts, endFor, SLOT_STARTS, WORK_DAYS };
