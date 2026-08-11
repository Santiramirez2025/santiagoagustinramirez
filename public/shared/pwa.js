/* pwa.js — registra el service worker y ofrece instalar la app (chip discreto). */
(function () {
  'use strict';
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    showChip();
  });

  function showChip() {
    if (document.getElementById('srm-install')) return;
    var lang = (function () { try { return (localStorage.getItem('lang') || 'es').indexOf('en') === 0 ? 'en' : 'es'; } catch (e) { return 'es'; } })();
    var label = lang === 'en' ? 'Install app' : 'Instalar app';
    var st = document.createElement('style');
    st.textContent =
      '#srm-install{position:fixed;left:50%;transform:translateX(-50%);bottom:20px;z-index:130;display:inline-flex;align-items:center;gap:9px;' +
      'background:var(--forest,#163A2B);color:var(--on-forest,#E9E4D6);border:none;border-radius:999px;padding:11px 18px;font:inherit;font-size:13px;font-weight:600;' +
      'cursor:pointer;box-shadow:0 10px 30px rgba(10,8,5,.3);animation:srm-pop .4s cubic-bezier(.22,.61,.36,1) both}' +
      '#srm-install .c{background:none;border:none;color:inherit;opacity:.7;cursor:pointer;font-size:16px;line-height:1;padding:0 0 0 4px}' +
      '@keyframes srm-pop{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}' +
      '@media(prefers-reduced-motion:reduce){#srm-install{animation:none}}';
    document.head.appendChild(st);
    var chip = document.createElement('div');
    chip.id = 'srm-install';
    chip.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/></svg><span>' + label + '</span><button class="c" aria-label="Cerrar" type="button">×</button>';
    document.body.appendChild(chip);
    chip.addEventListener('click', function (e) {
      if (e.target.classList.contains('c')) { chip.remove(); return; }
      if (deferred) { deferred.prompt(); deferred = null; chip.remove(); }
    });
  }

  window.addEventListener('appinstalled', function () {
    var c = document.getElementById('srm-install'); if (c) c.remove();
  });
})();
