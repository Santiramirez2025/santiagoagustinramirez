/* enhance.js — mejoras de la landing: personalización por rubro/UTM + prueba social viva. */
(function () {
  'use strict';
  var lang = (function () { try { return (localStorage.getItem('lang') || 'es').indexOf('en') === 0 ? 'en' : 'es'; } catch (e) { return 'es'; } })();

  var st = document.createElement('style');
  st.textContent =
    '.srm-rubro{display:inline-flex;align-items:center;gap:8px;margin-bottom:14px;padding:7px 14px;border-radius:999px;' +
    'background:color-mix(in srgb,var(--signal,#0E9E64) 14%,transparent);color:var(--signal-ink,#0B6B45);' +
    'font-size:12.5px;font-weight:600;text-decoration:none;border:1px solid color-mix(in srgb,var(--signal,#0E9E64) 30%,transparent);' +
    'animation:srm-fade .5s ease both}' +
    '.srm-rubro:hover{background:color-mix(in srgb,var(--signal,#0E9E64) 20%,transparent)}' +
    '.srm-live{display:inline-flex;align-items:center;gap:9px;margin-top:18px;font-size:12.5px;color:var(--muted,#6E685A);' +
    'font-family:var(--mono,ui-monospace,monospace);letter-spacing:.01em;animation:srm-fade .6s ease both}' +
    '.srm-live .dot{width:8px;height:8px;border-radius:50%;background:var(--signal,#0E9E64);box-shadow:0 0 0 0 rgba(14,158,100,.5);animation:srm-pulse 2s infinite}' +
    '@keyframes srm-pulse{0%{box-shadow:0 0 0 0 rgba(14,158,100,.45)}70%{box-shadow:0 0 0 7px rgba(14,158,100,0)}100%{box-shadow:0 0 0 0 rgba(14,158,100,0)}}' +
    '@keyframes srm-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}' +
    '@media(prefers-reduced-motion:reduce){.srm-live .dot{animation:none}.srm-rubro,.srm-live{animation:none}}';
  document.head.appendChild(st);

  var VMAP = {
    // Rubros de agenda → landing dedicada de turnos (convierte mejor)
    clinica: { es: 'clínicas y estética', en: 'clinics & aesthetics', url: '/turnos.html' },
    estetica: { es: 'centros de estética', en: 'aesthetic centers', url: '/turnos.html' },
    gimnasio: { es: 'gimnasios y boxes', en: 'gyms & boxes', url: '/turnos.html' },
    consultorio: { es: 'consultorios', en: 'medical practices', url: '/turnos.html' },
    spa: { es: 'spa y bienestar', en: 'spa & wellness', url: '/turnos.html' },
    nutricion: { es: 'nutrición', en: 'nutrition', url: '/turnos.html' },
    // Otros rubros → cotizador preseteado
    inmobiliaria: { es: 'inmobiliarias', en: 'real estate', service: 'web' },
    restaurante: { es: 'restaurantes y delivery', en: 'restaurants & delivery', service: 'ecommerce' },
    distribuidora: { es: 'distribuidoras B2B', en: 'B2B distributors', service: 'sistema' },
    profesional: { es: 'profesionales', en: 'professionals', service: 'web' },
    abogado: { es: 'estudios jurídicos', en: 'law firms', service: 'web' },
    contador: { es: 'estudios contables', en: 'accounting firms', service: 'sistema' }
  };

  function rubro() {
    var q = new URLSearchParams(location.search);
    var raw = (q.get('rubro') || q.get('utm_term') || q.get('utm_content') || '').toLowerCase();
    if (!raw) return;
    var key = null; for (var k in VMAP) { if (raw.indexOf(k) !== -1) { key = k; break; } }
    if (!key) return;
    var v = VMAP[key];
    var intro = document.querySelector('.stage .intro'); if (!intro) return;
    var a = document.createElement('a');
    a.className = 'srm-rubro';
    a.href = v.url ? v.url : ('/app/?service=' + v.service + (v.service === 'sistema' ? '&vertical=' + key : ''));
    a.setAttribute('data-track', 'rubro_' + key); a.setAttribute('data-event', 'ViewContent');
    a.innerHTML = '<span>◆</span><span>' + (lang === 'en' ? 'Solution for ' : 'Solución para ') + esc(v[lang] || v.es) + ' →</span>';
    intro.insertBefore(a, intro.firstChild);
  }

  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  function social() {
    var roles = document.querySelector('.stage .intro-roles') || document.querySelector('.stage .intro');
    if (!roles) return;
    fetch('/api/activity').then(function (r) { return r.json(); }).then(function (d) {
      if (!d || d.delivered == null || d.delivered <= 0) return;
      var parts = [];
      parts.push((lang === 'en' ? d.delivered + ' projects delivered' : d.delivered + ' proyectos entregados'));
      if (d.last_reserved_hours != null) {
        parts.push(lang === 'en' ? ('last booking ' + d.last_reserved_hours + 'h ago') : ('última reserva hace ' + d.last_reserved_hours + 'h'));
      }
      var el = document.createElement('div');
      el.className = 'srm-live';
      el.innerHTML = '<span class="dot"></span><span>' + esc(parts.join(' · ')) + '</span>';
      roles.parentNode.insertBefore(el, roles.nextSibling);
    }).catch(function () {});
  }

  function animateCount(el, to) {
    var t0 = null, dur = 900;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString('es-AR');
      if (p < 1) requestAnimationFrame(step); else el.textContent = to.toLocaleString('es-AR');
    }
    requestAnimationFrame(step);
  }

  function instagram() {
    var fEl = document.getElementById('ig-followers');
    if (!fEl) return;
    fetch('/api/instagram').then(function (r) { return r.json(); }).then(function (d) {
      if (!d) return;
      if (d.followers) animateCount(fEl, d.followers);
      var pEl = document.getElementById('ig-posts'); if (pEl && d.posts) pEl.textContent = Number(d.posts).toLocaleString('es-AR');
      if (d.media && d.media.length) {
        var grid = document.getElementById('ig-grid'), empty = document.getElementById('ig-empty');
        var ov = '<span class="ig-ov"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg></span>';
        grid.innerHTML = d.media.slice(0, 6).map(function (m) {
          var badge = m.type === 'VIDEO' ? '<span class="ig-badge">▶</span>' : (m.type === 'CAROUSEL_ALBUM' ? '<span class="ig-badge">▧</span>' : '');
          return '<a class="ig-tile" href="' + m.permalink + '" target="_blank" rel="noopener"><img src="' + m.img + '" alt="" loading="lazy">' + badge + ov + '</a>';
        }).join('');
        grid.hidden = false;
        if (empty) {
          empty.innerHTML = '<span class="ig-live-tag"><span class="p"></span>En vivo desde Instagram</span> · <a href="https://instagram.com/santiagoramirezmindel" target="_blank" rel="noopener" data-track="ig_verpubs" data-event="Lead">Ver todo →</a>';
        }
      }
    }).catch(function () {});
  }

  function run() { try { rubro(); } catch (e) {} try { social(); } catch (e) {} try { instagram(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
