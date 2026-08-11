// lib/calendar.js — Google Calendar (service account) para crear eventos de bookings.
const { google } = require('googleapis');

function getClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) { console.warn('[calendar] Falta GOOGLE_SERVICE_ACCOUNT_JSON'); return null; }
  let creds;
  try { creds = JSON.parse(raw); } catch (e) { console.error('[calendar] JSON de credenciales inválido'); return null; }
  const auth = new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    ['https://www.googleapis.com/auth/calendar']
  );
  return google.calendar({ version: 'v3', auth });
}

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// Devuelve eventos ocupados en un rango (para availability).
async function busy(fromIso, toIso) {
  const cal = getClient();
  if (!cal) return [];
  const res = await cal.freebusy.query({
    requestBody: { timeMin: fromIso, timeMax: toIso, items: [{ id: CALENDAR_ID }] }
  });
  const cals = res.data.calendars || {};
  return (cals[CALENDAR_ID] && cals[CALENDAR_ID].busy) || [];
}

// Crea un evento y devuelve su id.
async function createEvent({ summary, description, startIso, endIso, attendeeEmail }) {
  const cal = getClient();
  if (!cal) return null;
  const res = await cal.events.insert({
    calendarId: CALENDAR_ID,
    sendUpdates: 'all',
    requestBody: {
      summary,
      description,
      start: { dateTime: startIso },
      end: { dateTime: endIso },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : undefined
    }
  });
  return res.data.id;
}

module.exports = { busy, createEvent, CALENDAR_ID };
