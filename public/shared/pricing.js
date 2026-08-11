/*
 * pricing.js — Fuente única de verdad de catálogo + precios + seña.
 * Se usa en el navegador (window.PRICING) y en las Vercel Functions (require).
 * NO confiar en precios enviados por el cliente: el server SIEMPRE recalcula con este módulo.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PRICING = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Catálogo (precios base en USD, módulos con precio USD y días).
  var SERVICES = {
    rediseno:  { name: 'Rediseño + optimización', basePrice: 700, baseDays: 7, modules: [
      { id: 'speed', price: 250 }, { id: 'seo', price: 200 }, { id: 'responsive', price: 200 }, { id: 'content', price: 200 }, { id: 'cms', price: 350 } ] },
    landing:   { name: 'Landing Page', basePrice: 900, baseDays: 7, modules: [
      { id: 'form', price: 150 }, { id: 'multilang', price: 300 }, { id: 'blog', price: 400 }, { id: 'animations', price: 250 }, { id: 'crm', price: 300 } ] },
    web:       { name: 'Web institucional', basePrice: 1400, baseDays: 10, modules: [
      { id: 'form', price: 150 }, { id: 'blog', price: 400 }, { id: 'multilang', price: 300 }, { id: 'booking', price: 400 }, { id: 'portfolio', price: 250 }, { id: 'crm', price: 300 } ] },
    reservas:  { name: 'Turnos / Reservas online', basePrice: 1500, baseDays: 10, modules: [
      { id: 'pay', price: 400 }, { id: 'reminders', price: 300 }, { id: 'staff', price: 350 }, { id: 'packs', price: 350 }, { id: 'calendar', price: 250 }, { id: 'panel', price: 400 } ] },
    app:       { name: 'App Móvil PWA', basePrice: 1800, baseDays: 12, modules: [
      { id: 'push', price: 350 }, { id: 'auth', price: 400 }, { id: 'pay', price: 450 }, { id: 'offline', price: 350 }, { id: 'geo', price: 300 }, { id: 'admin', price: 500 } ] },
    membresias:{ name: 'Membresías / Suscripciones', basePrice: 2200, baseDays: 14, modules: [
      { id: 'payments', price: 450 }, { id: 'courses', price: 500 }, { id: 'community', price: 400 }, { id: 'gated', price: 350 }, { id: 'app', price: 600 }, { id: 'email', price: 300 } ] },
    ecommerce: { name: 'E-commerce', basePrice: 2800, baseDays: 15, modules: [
      { id: 'shipping', price: 350 }, { id: 'multistore', price: 500 }, { id: 'coupons', price: 200 }, { id: 'blog', price: 300 }, { id: 'multilang', price: 400 }, { id: 'pwa', price: 600 } ] },
    sistema:   { name: 'Sistema a medida', basePrice: 3500, baseDays: 18, modules: [
      { id: 'turnos', price: 400 }, { id: 'stock', price: 500 }, { id: 'crm', price: 450 }, { id: 'afip', price: 600 }, { id: 'roles', price: 350 }, { id: 'reports', price: 400 }, { id: 'wa', price: 300 } ] },
    automatizacion: { name: 'Automatización con IA', basePrice: 900, baseDays: 6, modules: [
      { id: 'docs', price: 400 }, { id: 'email', price: 350 }, { id: 'content', price: 300 }, { id: 'reports', price: 250 }, { id: 'sync', price: 350 }, { id: 'afip', price: 500 } ] },
    agentewa:  { name: 'Agente IA de WhatsApp', basePrice: 1200, baseDays: 5, modules: [
      { id: 'reservas', price: 400 }, { id: 'sdr', price: 400 }, { id: 'cobranza', price: 350 }, { id: 'catalogo', price: 400 }, { id: 'handoff', price: 300 }, { id: 'multilang', price: 250 }, { id: 'crm', price: 400 } ] },
    dashboard: { name: 'Dashboard / BI a medida', basePrice: 1500, baseDays: 9, modules: [
      { id: 'connect', price: 350 }, { id: 'realtime', price: 400 }, { id: 'alerts', price: 250 }, { id: 'roles', price: 350 }, { id: 'export', price: 200 }, { id: 'ai', price: 400 } ] },
    chatbot:   { name: 'Chatbot / Agente IA a medida', basePrice: 1600, baseDays: 7, modules: [
      { id: 'rag', price: 500 }, { id: 'web', price: 300 }, { id: 'multichannel', price: 400 }, { id: 'handoff', price: 300 }, { id: 'internal', price: 400 }, { id: 'crm', price: 400 } ] }
  };

  // Sesiones / bookings de precio fijo (se cobran 100%, no seña).
  var SESSIONS = {
    sesion:   { name: 'Sesión estratégica', priceUsd: 75, durationMin: 90 }
  };

  var CONFIG = {
    depositPct: 0.30,   // seña por defecto (override server: DEPOSIT_PCT)
    depositMinUsd: 150, // seña mínima (override server: DEPOSIT_MIN_USD)
    integrationPrice: 400,
    integrationDays: 3,
    customMult: 1.25,
    expressMult: 1.20
  };

  function round100(n) { return Math.round(n / 100) * 100; }

  // Calcula precio fijo (min) y rango, en USD, a partir de una config validada.
  // sel = { service, modules:[ids], design:'template'|'custom', urgency:'standard'|'express', integration:bool }
  function calc(sel) {
    var s = SERVICES[sel.service];
    if (!s) throw new Error('Servicio inválido: ' + sel.service);
    var validIds = {};
    s.modules.forEach(function (m) { validIds[m.id] = m.price; });
    var mods = Array.isArray(sel.modules) ? sel.modules : [];
    var p = s.basePrice;
    mods.forEach(function (id) { if (validIds[id] != null) p += validIds[id]; });
    if (sel.integration) p += CONFIG.integrationPrice;
    if (sel.design === 'custom') p = p * CONFIG.customMult;
    if (sel.urgency === 'express') p = p * CONFIG.expressMult;
    var min = round100(p);
    return { min: min, max: round100(p * 1.18), quoteUsd: min, serviceName: s.name };
  }

  // Seña en USD para un precio de proyecto dado. cfg opcional para overrides del server.
  function deposit(quoteUsd, cfg) {
    var pct = (cfg && cfg.depositPct) || CONFIG.depositPct;
    var min = (cfg && cfg.depositMinUsd) || CONFIG.depositMinUsd;
    return Math.max(min, round100(quoteUsd * pct));
  }

  return {
    SERVICES: SERVICES,
    SESSIONS: SESSIONS,
    CONFIG: CONFIG,
    calc: calc,
    deposit: deposit
  };
});
