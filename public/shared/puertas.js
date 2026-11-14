/* puertas.js — captura de contacto de las dos puertas (cabeza / negocio).
 * Mobile-first, anti-bot (honeypot + tiempo mínimo), el resultado del regalo
 * se revela SOLO después de dejar el contacto. Reusa window.srmTrack/__srmUtmFull
 * de analytics.js. Se auto-inicializa sobre cualquier <form data-puerta>.
 *
 * Markup esperado:
 *   <form data-puerta="negocio" data-reveal="#resultado" data-gift="auditoria">
 *     <input type="email" name="email" required>
 *     <input type="text"  name="name">            (opcional)
 *     <input type="tel"   name="phone">           (opcional)
 *     <input class="hp" data-hp name="empresa_web" tabindex="-1" autocomplete="off"> (honeypot)
 *     <label class="consent"><input type="checkbox" name="consent" required> ...</label>
 *     <button type="submit">...</button>
 *   </form>
 * Campos extra con name (que no sean email/name/phone/consent/honeypot) viajan como `respuestas`.
 * La página puede definir window.onPuertaResult(lead, formEl) para renderizar el resultado.
 */
(function () {
  'use strict';
  var RESERVED = { email: 1, name: 1, phone: 1, consent: 1 };

  function track(ev, meta) { if (window.srmTrack) window.srmTrack(ev, meta || {}); }
  function okMail(s) { return /.+@.+\..+/.test(String(s || '')); }
  function cookie(n) { var m = (document.cookie || '').match(new RegExp('(?:^|; )' + n + '=([^;]+)')); return m ? decodeURIComponent(m[1]) : undefined; }

  function initForm(form) {
    var puerta = form.getAttribute('data-puerta');
    var loadedAt = Date.now();
    var hpEl = form.querySelector('[data-hp]');
    track('regalo_iniciado', { puerta: puerta, gift: form.getAttribute('data-gift') || null });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var emailEl = form.querySelector('[name="email"]');
      var consentEl = form.querySelector('[name="consent"]');
      var errEl = form.querySelector('[data-err]');

      function fail(msg) { if (errEl) { errEl.textContent = msg; errEl.hidden = false; } }
      if (errEl) errEl.hidden = true;

      if (!emailEl || !okMail(emailEl.value)) { fail('Dejá un mail válido para ver tu resultado.'); if (emailEl) emailEl.focus(); return; }
      if (consentEl && !consentEl.checked) { fail('Marcá la casilla para que te lo pueda mandar.'); return; }

      // respuestas = todos los campos con name no reservados
      var respuestas = {};
      Array.prototype.forEach.call(form.querySelectorAll('[name]'), function (el) {
        var n = el.getAttribute('name');
        if (!n || RESERVED[n] || el === hpEl) return;
        if (el.type === 'checkbox') { respuestas[n] = el.checked; }
        else if (el.type === 'radio') { if (el.checked) respuestas[n] = el.value; }
        else if (el.value !== '') { respuestas[n] = el.value; }
      });

      var payload = {
        puerta: puerta,
        email: emailEl.value.trim(),
        name: (form.querySelector('[name="name"]') || {}).value || undefined,
        phone: (form.querySelector('[name="phone"]') || {}).value || undefined,
        respuestas: respuestas,
        consent: consentEl ? consentEl.checked : true,
        hp: hpEl ? hpEl.value : undefined,
        t: Date.now() - loadedAt,
        utm: window.__srmUtmFull || window.__srmUtm || {},
        fbp: cookie('_fbp'), fbc: cookie('_fbc'),
        path: location.pathname
      };

      if (btn) { btn.setAttribute('aria-disabled', 'true'); btn.dataset._t = btn.textContent; btn.textContent = 'Un segundo…'; }
      track('contacto_dejado', { puerta: puerta });

      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j || j.error) throw new Error(j && j.error || 'error');
          // Dedup con CAPI: el Pixel dispara Lead con el MISMO event_id que ya mandó el server.
          if (typeof window.fbq === 'function' && j.event_id) {
            try { window.fbq('track', 'Lead', { content_name: 'Puerta ' + puerta }, { eventID: j.event_id }); } catch (e2) {}
          }
          var reveal = form.getAttribute('data-reveal');
          var target = reveal ? document.querySelector(reveal) : null;
          if (window.onPuertaResult) { try { window.onPuertaResult(j, form); } catch (e3) {} }
          if (target) { target.hidden = false; target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
          form.setAttribute('data-done', '1');
          track('oferta_vista', { puerta: puerta });
        })
        .catch(function () {
          fail('No se pudo guardar ahora. Probá de nuevo o escribime por WhatsApp.');
          if (btn) { btn.setAttribute('aria-disabled', 'false'); if (btn.dataset._t) btn.textContent = btn.dataset._t; }
        });
    });
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-puerta]'), initForm);
    // Evento de entrada con tema/puerta detectados desde la UTM del Short.
    track('entrada', { puerta: (window.__srmCampaign || {}).puerta || null, tema: (window.__srmCampaign || {}).tema || null });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
