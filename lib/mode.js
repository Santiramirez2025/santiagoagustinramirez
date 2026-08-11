// lib/mode.js — modo mock para previsualizar el flujo en dev SIN credenciales reales.
// Se activa si DEV_MOCK=1, o automáticamente en dev/preview cuando falta MP_ACCESS_TOKEN.
// NUNCA se activa en producción (VERCEL_ENV === 'production').
function isMock() {
  if (process.env.VERCEL_ENV === 'production') return false;
  if (process.env.DEV_MOCK === '1') return true;
  return !process.env.MP_ACCESS_TOKEN;
}
module.exports = { isMock };
