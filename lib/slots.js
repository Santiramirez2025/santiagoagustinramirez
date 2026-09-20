// lib/slots.js — genera horarios candidatos para bookings (hora de Argentina, UTC-03:00).
const TZ = '-03:00';
const HORIZON_DAYS = Number(process.env.BOOKING_HORIZON_DAYS || '14');

// Agenda por día de semana (1=Lun … 5=Vie). Horarios distintos por día en vez de
// la misma grilla todos los días: refleja una agenda de trabajo real y deja lugar
// al trabajo de implementación. Para abrir o cerrar disponibilidad, editar
// BOOKING_SCHEDULE en Vercel — formato "1:10:00,15:00|2:12:00|3:10:00,17:00".
const DEFAULT_SCHEDULE = {
  1: ['10:00', '15:00'],
  2: ['12:00', '17:00'],
  3: ['10:00'],
  4: ['12:00', '16:00'],
  5: ['10:00']
};

function parseSchedule(raw) {
  if (!raw) return null;
  const out = {};
  String(raw).split('|').forEach(function (chunk) {
    const parts = chunk.split(':');
    if (parts.length < 2) return;
    const day = Number(parts.shift());
    if (!(day >= 0 && day <= 6)) return;
    const times = parts.join(':').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    if (times.length) out[day] = times;
  });
  return Object.keys(out).length ? out : null;
}

// Compatibilidad: si existe BOOKING_STARTS, se aplica a todos los días hábiles.
function legacySchedule() {
  if (!process.env.BOOKING_STARTS) return null;
  const times = process.env.BOOKING_STARTS.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  if (!times.length) return null;
  return { 1: times, 2: times, 3: times, 4: times, 5: times };
}

const SCHEDULE = parseSchedule(process.env.BOOKING_SCHEDULE) || legacySchedule() || DEFAULT_SCHEDULE;
const WORK_DAYS = Object.keys(SCHEDULE).map(Number);
// Se mantiene exportado para código que lo consuma; es la unión de todos los horarios.
const SLOT_STARTS = WORK_DAYS.reduce(function (acc, d) {
  SCHEDULE[d].forEach(function (t) { if (acc.indexOf(t) === -1) acc.push(t); });
  return acc;
}, []).sort();

function iso(dateStr, time) { return `${dateStr}T${time}:00${TZ}`; }
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function ymd(d) { return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; }

// Día de la semana en hora AR para una fecha dada (mediodía AR).
function weekdayAR(dateStr) { return new Date(iso(dateStr, '12:00')).getUTCDay(); }

// Lista de fechas (YYYY-MM-DD) con agenda dentro del horizonte, desde mañana.
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
    (SCHEDULE[weekdayAR(ds)] || []).forEach(function (t) { out.push(iso(ds, t)); });
  });
  return out;
}

function endFor(startIso, durationMin) {
  return new Date(new Date(startIso).getTime() + durationMin * 60000).toISOString();
}

module.exports = { candidateStarts, endFor, SLOT_STARTS, WORK_DAYS, SCHEDULE };
