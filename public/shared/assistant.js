/* assistant.js — widget del Asistente IA de Santiago Ramírez.
   Autónomo: inyecta estilos + UI, conversa con /api/assistant, y ofrece reservar seña. */
(function () {
  'use strict';
  if (window.__srmAssistant) return; window.__srmAssistant = true;

  var PHONE = '5493536561265';
  var lang = (function () { try { return (localStorage.getItem('lang') || 'es').indexOf('en') === 0 ? 'en' : 'es'; } catch (e) { return 'es'; } })();
  var T = {
    es: { title: 'Asistente IA', sub: 'Te ayudo en 1 minuto', greet: '¡Hola! Soy el asistente de Santiago. Contame qué querés lograr con tu negocio y te recomiendo el camino (y el presupuesto).', ph: 'Escribí tu mensaje…', send: 'Enviar', reserve: 'Reservar con seña', wa: 'WhatsApp', today: 'Empezás hoy con', typing: 'Escribiendo…', err: 'No se pudo enviar. Probá de nuevo.' },
    en: { title: 'AI Assistant', sub: 'I help in 1 minute', greet: "Hi! I'm Santiago's assistant. Tell me what you want to achieve and I'll recommend the path (and the price).", ph: 'Type your message…', send: 'Send', reserve: 'Reserve with deposit', wa: 'WhatsApp', today: 'Start today with', typing: 'Typing…', err: 'Could not send. Try again.' }
  }[lang];

  var CSS = `
  .srm-ai-launch{position:fixed;left:22px;bottom:22px;z-index:140;width:60px;height:60px;border-radius:50%;
    border:none;cursor:pointer;background:var(--forest,#163A2B);color:var(--on-forest,#E9E4D6);
    box-shadow:0 10px 30px rgba(10,8,5,.28);display:grid;place-items:center;transition:transform .25s cubic-bezier(.22,.61,.36,1),box-shadow .25s;}
  .srm-ai-launch:hover{transform:translateY(-3px) scale(1.04);box-shadow:0 16px 40px rgba(10,8,5,.34);}
  .srm-ai-launch .sp{position:absolute;inset:0;border-radius:50%;background:var(--signal,#0E9E64);opacity:.55;animation:srm-ping 2.6s cubic-bezier(0,0,.2,1) infinite;}
  @keyframes srm-ping{0%{transform:scale(1);opacity:.5}70%,100%{transform:scale(1.7);opacity:0}}
  @media(prefers-reduced-motion:reduce){.srm-ai-launch .sp{animation:none;display:none}}
  .srm-ai-launch svg{position:relative;width:26px;height:26px}
  .srm-ai-panel{position:fixed;left:22px;bottom:22px;z-index:141;width:min(390px,calc(100vw - 32px));height:min(560px,calc(100vh - 40px));
    background:var(--paper,#ECE7DA);color:var(--ink,#17140E);border:1px solid var(--line-2,rgba(23,20,14,.26));border-radius:22px;
    display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 70px rgba(10,8,5,.34);
    opacity:0;transform:translateY(16px) scale(.98);pointer-events:none;transition:opacity .3s cubic-bezier(.22,.61,.36,1),transform .3s cubic-bezier(.22,.61,.36,1);}
  .srm-ai-panel.open{opacity:1;transform:none;pointer-events:auto;}
  .srm-ai-head{display:flex;align-items:center;gap:11px;padding:15px 16px;background:var(--forest,#163A2B);color:var(--on-forest,#E9E4D6);}
  .srm-ai-head .av{width:34px;height:34px;border-radius:50%;background:rgba(233,228,214,.16);display:grid;place-items:center;flex:none}
  .srm-ai-head .t{font-family:var(--serif,Georgia,serif);font-size:16px;line-height:1.1}
  .srm-ai-head .s{font-size:11px;opacity:.75}
  .srm-ai-head .x{margin-left:auto;background:none;border:none;color:inherit;cursor:pointer;font-size:22px;line-height:1;opacity:.8;width:30px;height:30px;border-radius:50%}
  .srm-ai-head .x:hover{opacity:1;background:rgba(233,228,214,.12)}
  .srm-ai-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
  .srm-ai-msg{max-width:85%;padding:10px 13px;border-radius:15px;font-size:14px;line-height:1.5;animation:srm-in .32s cubic-bezier(.22,.61,.36,1) both}
  @media(prefers-reduced-motion:reduce){.srm-ai-msg{animation:none}}
  @keyframes srm-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .srm-ai-msg.bot{align-self:flex-start;background:color-mix(in srgb,var(--ink,#17140E) 6%,transparent);border-bottom-left-radius:5px}
  .srm-ai-msg.me{align-self:flex-end;background:var(--forest,#163A2B);color:var(--on-forest,#E9E4D6);border-bottom-right-radius:5px}
  .srm-ai-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:12px 14px;background:color-mix(in srgb,var(--ink,#17140E) 6%,transparent);border-radius:15px;border-bottom-left-radius:5px}
  .srm-ai-typing i{width:6px;height:6px;border-radius:50%;background:var(--muted,#6E685A);animation:srm-bounce 1.2s infinite}
  .srm-ai-typing i:nth-child(2){animation-delay:.15s}.srm-ai-typing i:nth-child(3){animation-delay:.3s}
  @keyframes srm-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
  .srm-ai-quote{align-self:flex-start;max-width:92%;border:1px solid var(--line,rgba(23,20,14,.14));border-radius:15px;padding:13px 14px;background:color-mix(in srgb,var(--signal,#0E9E64) 8%,transparent);animation:srm-in .32s cubic-bezier(.22,.61,.36,1) both}
  .srm-ai-quote .qh{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--signal-ink,#0B6B45);margin-bottom:2px}
  .srm-ai-quote .qa{font-family:var(--serif,Georgia,serif);font-size:24px;color:var(--forest,#163A2B);line-height:1.05}
  .srm-ai-quote .qn{font-size:12px;color:var(--muted,#6E685A);margin:2px 0 12px}
  .srm-ai-quote .qb{display:flex;gap:8px;flex-wrap:wrap}
  .srm-ai-quote button,.srm-ai-quote a{font:inherit;font-size:13px;font-weight:600;border-radius:999px;padding:9px 15px;cursor:pointer;text-decoration:none;border:1px solid var(--line-2,rgba(23,20,14,.26));}
  .srm-ai-quote .primary{background:var(--forest,#163A2B);color:var(--on-forest,#E9E4D6);border-color:var(--forest,#163A2B)}
  .srm-ai-quote .ghost{background:transparent;color:var(--ink,#17140E)}
  .srm-ai-foot{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line,rgba(23,20,14,.14))}
  .srm-ai-foot input{flex:1;border:1px solid var(--line-2,rgba(23,20,14,.26));border-radius:999px;padding:11px 15px;font:inherit;font-size:14px;background:transparent;color:var(--ink,#17140E)}
  .srm-ai-foot input::placeholder{color:var(--muted,#6E685A)}
  .srm-ai-foot button{border:none;background:var(--forest,#163A2B);color:var(--on-forest,#E9E4D6);border-radius:50%;width:42px;height:42px;cursor:pointer;flex:none;display:grid;place-items:center;transition:transform .2s}
  .srm-ai-foot button:hover{transform:scale(1.06)}
  .srm-ai-foot button[disabled]{opacity:.5;pointer-events:none}
  `;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function getCookie(n) { var m = document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)'); return m ? m.pop() : undefined; }

  var style = el('style'); style.textContent = CSS; document.head.appendChild(style);

  var launch = el('button', 'srm-ai-launch');
  launch.setAttribute('aria-label', T.title);
  launch.innerHTML = '<span class="sp"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 1.3 4.6L3 21l4.6-1.3A9 9 0 1 0 12 3Z"/><path d="M8 11h8M8 14h5"/></svg>';
  document.body.appendChild(launch);

  var panel = el('div', 'srm-ai-panel');
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', T.title);
  panel.innerHTML =
    '<div class="srm-ai-head"><span class="av"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 1.3 4.6L3 21l4.6-1.3A9 9 0 1 0 12 3Z"/></svg></span>'
    + '<div><div class="t">' + esc(T.title) + '</div><div class="s">' + esc(T.sub) + '</div></div>'
    + '<button class="x" aria-label="Cerrar">×</button></div>'
    + '<div class="srm-ai-body" id="srm-ai-body"></div>'
    + '<form class="srm-ai-foot" id="srm-ai-form"><input id="srm-ai-input" type="text" placeholder="' + esc(T.ph) + '" autocomplete="off" maxlength="500">'
    + '<button type="submit" aria-label="' + esc(T.send) + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z"/></svg></button></form>';
  document.body.appendChild(panel);

  var body = panel.querySelector('#srm-ai-body');
  var form = panel.querySelector('#srm-ai-form');
  var input = panel.querySelector('#srm-ai-input');
  var sendBtn = form.querySelector('button');
  var history = [];
  var opened = false, firstMsg = true;

  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function addMsg(role, text) {
    var m = el('div', 'srm-ai-msg ' + (role === 'user' ? 'me' : 'bot'), esc(text).replace(/\n/g, '<br>'));
    body.appendChild(m); scrollDown();
  }
  function addQuote(q) {
    var wa = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent('Hola Santiago, vengo del asistente. Me interesa: ' + q.serviceName + ' (aprox USD ' + q.min_usd + '–' + q.max_usd + ', seña USD ' + q.deposit_usd + '). ¿Coordinamos?');
    var card = el('div', 'srm-ai-quote');
    card.innerHTML = '<div class="qh">' + esc(T.today) + '</div><div class="qa">USD $' + Number(q.deposit_usd).toLocaleString('en-US') + '</div>'
      + '<div class="qn">' + esc(q.serviceName) + ' · USD ' + q.min_usd + '–' + q.max_usd + '</div>'
      + '<div class="qb"><button class="primary" type="button">' + esc(T.reserve) + ' →</button>'
      + '<a class="ghost" href="' + wa + '" target="_blank" rel="noopener">' + esc(T.wa) + '</a></div>';
    card.querySelector('.primary').addEventListener('click', function () { reserve(q, this); });
    body.appendChild(card); scrollDown();
  }
  function typing(on) {
    var ex = body.querySelector('.srm-ai-typing');
    if (on && !ex) { var t = el('div', 'srm-ai-typing', '<i></i><i></i><i></i>'); t.setAttribute('aria-label', T.typing); body.appendChild(t); scrollDown(); }
    if (!on && ex) ex.remove();
  }
  function reserve(q, btn) {
    btn.disabled = true; btn.textContent = lang === 'en' ? 'Redirecting…' : 'Redirigiendo…';
    if (typeof window.fbq === 'function') window.fbq('track', 'InitiateCheckout', { content_name: q.serviceName });
    fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({}, q.config, { fbp: getCookie('_fbp'), fbc: getCookie('_fbc') })) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.init_point) { location.href = d.init_point; } else { throw new Error('x'); } })
      .catch(function () { btn.disabled = false; btn.textContent = T.reserve + ' →'; });
  }

  function open() {
    if (!opened) { opened = true; addMsg('bot', T.greet); }
    panel.classList.add('open'); launch.style.display = 'none';
    setTimeout(function () { input.focus(); }, 250);
  }
  function close() { panel.classList.remove('open'); launch.style.display = 'grid'; }

  launch.addEventListener('click', open);
  panel.querySelector('.x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim(); if (!text) return;
    input.value = ''; addMsg('user', text); history.push({ role: 'user', content: text });
    if (firstMsg) { firstMsg = false; if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'ai_assistant' }); }
    sendBtn.disabled = true; typing(true);
    fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        typing(false); sendBtn.disabled = false;
        var reply = (d && d.reply) || T.err;
        addMsg('bot', reply); history.push({ role: 'assistant', content: reply });
        if (d && d.quote) addQuote(d.quote);
        input.focus();
      })
      .catch(function () { typing(false); sendBtn.disabled = false; addMsg('bot', T.err); });
  });
})();
