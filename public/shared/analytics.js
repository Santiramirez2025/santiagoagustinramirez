/* analytics.js — Analytics propio (comportamiento) + conversiones a Meta (Pixel + CAPI).
 *
 * Qué mide desde el minuto 0, por visitante y sesión (IDs anónimos de primera parte, sin PII):
 *   page_view · scroll (25/50/75/100%) · engaged · click (CTAs) · rage_click · page_time
 *   wa_click → InitiateCheckout (Pixel + CAPI con mismo event_id = la conversión de la campaña)
 *
 * Todo se manda a /api/track con sendBeacon (sobrevive la navegación, no frena la página).
 * Además inicializa Microsoft Clarity (grabaciones/mapas de calor) y Vercel Web Analytics.
 */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────────
  // CONFIG — completá cuando tengas las cuentas (gratis). Sin esto igual funciona el analytics propio.
  var CLARITY_ID = 'y1cylb48d2';  // Microsoft Clarity (grabaciones + mapas de calor)
  var VERCEL_ANALYTICS = true;    // activá "Web Analytics" en el panel de Vercel (gratis)
  // ─────────────────────────────────────────────────────────────────────────

  var ENDPOINT = '/api/track';
  var OPT_EVENT = 'InitiateCheckout'; // evento que optimiza la campaña (contacto WhatsApp = conversión)

  function uuid() { try { return crypto.randomUUID(); } catch (e) { return 'x-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); } }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); return v; } catch (e) { return null; } }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); return v; } catch (e) { return null; } }

  var visitorId = ls('_srm_vid') || ls('_srm_vid', uuid());
  var sessionId = ss('_srm_sid') || ss('_srm_sid', uuid());

  // A/B simple: variante persistente por visitante, viaja en el meta de cada evento.
  // Leer resultados: SELECT meta->>'ab' AS variante, event, count(*) FROM events GROUP BY 1,2;
  function abVariant() {
    var v = ls('_srm_ab');
    if (v === 'a' || v === 'b') return v;
    v = (Math.random() < 0.5) ? 'a' : 'b';
    ls('_srm_ab', v);
    return v;
  }
  var ab = abVariant();
  window.__srmAB = ab;

  var q = new URLSearchParams(location.search);
  var device = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    ? (/(iPad|Tablet)/i.test(navigator.userAgent) ? 'tablet' : 'mobile') : 'desktop';

  // Atribución. Los UTM llegan sólo en la landing del anuncio, pero la compra ocurre
  // en /reservar.html: sin persistirlos, el pedido queda huérfano y no se puede saber
  // qué ángulo lo trajo. Guardamos el primer toque del visitante y el de la sesión.
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  function readUtm() {
    var fromUrl = {}, has = false;
    UTM_KEYS.forEach(function (k) { var v = q.get(k); if (v) { fromUrl[k] = v; has = true; } });
    if (has) {
      fromUrl.landing = location.pathname;
      fromUrl.at = new Date().toISOString();
      ss('_srm_utm', JSON.stringify(fromUrl));
      if (!ls('_srm_utm_first')) ls('_srm_utm_first', JSON.stringify(fromUrl));
      return fromUrl;
    }
    var stored = ss('_srm_utm') || ls('_srm_utm_first');
    if (stored) { try { return JSON.parse(stored); } catch (e) {} }
    return {};
  }
  var utm = readUtm();
  window.__srmUtm = utm; // lo lee reservar.html para atribuir el pedido

  var base = {
    visitorId: visitorId, sessionId: sessionId, path: location.pathname,
    utm_source: utm.utm_source || undefined,
    utm_medium: utm.utm_medium || undefined,
    utm_campaign: utm.utm_campaign || undefined,
    utm_content: utm.utm_content || undefined,
    utm_term: utm.utm_term || undefined,
    device: device
  };

  function send(event, meta, extra) {
    var payload = Object.assign({}, base, { event: event, url: location.href, meta: Object.assign({ ab: ab }, meta || {}) }, extra || {});
    var str = JSON.stringify(payload);
    try { if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([str], { type: 'application/json' }))) return; } catch (e) {}
    try { fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: str, keepalive: true }).catch(function () {}); } catch (e) {}
  }

  function throttle(fn, ms) {
    var last = 0, t;
    return function () { var now = Date.now(); if (now - last >= ms) { last = now; fn(); } else { clearTimeout(t); t = setTimeout(function () { last = Date.now(); fn(); }, ms); } };
  }

  // 1) Page view
  send('page_view', { referrer: document.referrer || null, vw: window.innerWidth, vh: window.innerHeight, lang: navigator.language || null });

  // 2) Scroll depth (hitos)
  var marks = { 25: 0, 50: 0, 75: 0, 100: 0 }, maxScroll = 0;
  function onScroll() {
    var h = document.documentElement;
    var sc = h.scrollTop || document.body.scrollTop || 0;
    var sh = (h.scrollHeight - h.clientHeight);
    var pct = sh > 0 ? Math.min(100, Math.round((sc / sh) * 100)) : 0;
    if (pct > maxScroll) maxScroll = pct;
    [25, 50, 75, 100].forEach(function (m) { if (pct >= m && !marks[m]) { marks[m] = 1; send('scroll', { depth: m }); } });
  }
  window.addEventListener('scroll', throttle(onScroll, 400), { passive: true });

  // 3) Engagement (señal de calidad): 15s + (scroll>25% o 2 clicks)
  var clicks = 0, engaged = false;
  function checkEngaged() { if (!engaged && (maxScroll >= 25 || clicks >= 2)) { engaged = true; send('engaged', { maxScroll: maxScroll, clicks: clicks }); } }
  setTimeout(checkEngaged, 15000);

  // 4) Clicks en CTAs + WhatsApp (conversión)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a,button,[data-track]') : null;
    if (!a) return;
    clicks++;
    // Etiqueta legible: data-track → id → aria-label → texto visible → tipo (último recurso)
    var name = a.getAttribute('data-track') || a.id || a.getAttribute('aria-label')
      || ((a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)) || (a.tagName || '').toLowerCase();
    var href = (a.getAttribute && a.getAttribute('href')) || '';
    var isWa = href.indexOf('wa.me') > -1 || href.indexOf('api.whatsapp') > -1 || href.indexOf('whatsapp://') > -1;

    if (isWa) {
      var eid = uuid();
      if (typeof window.fbq === 'function') { try { window.fbq('track', OPT_EVENT, { content_name: name, contact_method: 'whatsapp' }, { eventID: eid }); } catch (e2) {} }
      send(OPT_EVENT, { source: name, contact_method: 'whatsapp' }, { eventId: eid, contentName: name, contactMethod: 'whatsapp' });
      send('wa_click', { source: name });
    } else {
      send('click', { name: name, ctaEvent: a.getAttribute('data-event') || null, href: href || null });
    }
    checkEngaged();
  }, true);

  // 5) Rage clicks (frustración): 3+ clicks en <800ms cerca del mismo punto
  var rageBuf = [];
  document.addEventListener('click', function (e) {
    var now = Date.now();
    rageBuf = rageBuf.filter(function (p) { return now - p.t < 800; });
    rageBuf.push({ t: now, x: e.clientX, y: e.clientY });
    if (rageBuf.length >= 3) {
      var near = rageBuf.every(function (p) { return Math.abs(p.x - e.clientX) < 40 && Math.abs(p.y - e.clientY) < 40; });
      if (near) { send('rage_click', { x: e.clientX, y: e.clientY }); rageBuf = []; }
    }
  }, true);

  // 6) Tiempo en página al salir
  var start = Date.now(), sentTime = false;
  function sendTime() { if (sentTime) return; sentTime = true; send('page_time', { seconds: Math.round((Date.now() - start) / 1000), maxScroll: maxScroll, engaged: engaged }); }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') sendTime(); });
  window.addEventListener('pagehide', sendTime);

  // 7) Microsoft Clarity (grabaciones + mapas de calor) — opcional
  if (CLARITY_ID) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  // 8) Vercel Web Analytics — se activa al habilitarlo en el panel de Vercel
  if (VERCEL_ANALYTICS) {
    try {
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
      var s = document.createElement('script'); s.defer = true; s.src = '/_vercel/insights/script.js'; document.head.appendChild(s);
      var si = document.createElement('script'); si.defer = true; si.src = '/_vercel/speed-insights/script.js'; document.head.appendChild(si);
    } catch (e) {}
  }

  // 9) API pública para las páginas del rediseño (dos puertas + captura).
  //    Reusa el mismo transporte, visitorId/sessionId y UTM que el resto.
  function parseCampaign(c) {
    // Formato del Short: pieza_<ID>_<canal>  (ej: pieza_F1_mindset, pieza_N2a_ch05)
    var out = { pieza: null, canal: null, tema: null, puerta: null };
    if (!c) return out;
    var m = String(c).match(/^pieza_([A-Za-z0-9]+)_(.+)$/);
    if (m) { out.pieza = m[1]; out.canal = m[2]; }
    var id = out.pieza || String(c);
    var prefix = id.charAt(0).toUpperCase();
    // Prefijo del ID → tema (según el brief).
    var TEMA = { R:'recreo', T:'terapia', W:'warren', K:'cambiar', M:'amigo', I:'inflacion', P:'publicar', D:'ideas', N:'nicho', Q:'comport', F:'futuro', G:'agentes' };
    out.tema = TEMA[prefix] || null;
    // Tema → puerta (provisorio): mindset/humor/nostalgia → cabeza; negocio → negocio.
    var NEGOCIO = { inflacion:1, publicar:1, ideas:1, nicho:1, comport:1, agentes:1 };
    out.puerta = out.tema ? (NEGOCIO[out.tema] ? 'negocio' : 'cabeza') : null;
    return out;
  }
  var campaign = parseCampaign(utm.utm_campaign);
  window.__srmCampaign = campaign;      // { pieza, canal, tema, puerta }
  window.__srmUtmFull = Object.assign({}, utm, { canal: campaign.canal, pieza: campaign.pieza, tema: campaign.tema });
  // srmTrack(event, meta, extra): emite un evento del embudo con la UTM ya incluida.
  window.srmTrack = function (event, meta, extra) { try { send(event, meta || {}, extra || {}); } catch (e) {} };

  // --- Links a la academia metodosrm.com (otro sitio) con atribución, SIN PII. ---
  // Campaña = la del Short con la que entró el visitante, o 'cabeza_directo'.
  var metodoCamp = (utm && utm.utm_campaign) ? utm.utm_campaign : 'cabeza_directo';
  window.srmMetodoUrl = function (path, boton) {
    var base = 'https://www.metodosrm.com' + (path || '/');
    var sep = base.indexOf('?') > -1 ? '&' : '?';
    return base + sep + 'utm_source=santiagoagustinramirez&utm_medium=web' +
      '&utm_campaign=' + encodeURIComponent(metodoCamp) +
      '&utm_content=' + encodeURIComponent(boton || 'cabeza');
  };
  // Reescribe los <a data-metodo="boton" [data-metodo-path="/comprar?p=mentoria"]>:
  // arma la URL con UTM, abre en la misma pestaña y dispara el evento al click.
  try {
    var links = document.querySelectorAll('a[data-metodo]');
    Array.prototype.forEach.call(links, function (a) {
      var boton = a.getAttribute('data-metodo') || 'cabeza';
      var path = a.getAttribute('data-metodo-path') || '/';
      a.setAttribute('href', window.srmMetodoUrl(path, boton));
      a.addEventListener('click', function () {
        var ev = a.getAttribute('data-metodo-event') || 'metodosrm_click';
        send(ev, { boton: boton, page: location.pathname });
      });
    });
  } catch (e) {}
})();
