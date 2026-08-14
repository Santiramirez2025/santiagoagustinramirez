/* assistant.js — Asistente guiado de Santiago Ramírez.
   Especializado en negocios de agenda (estética, spa, salud). 100% del lado del cliente:
   sin LLM, sin costo, siempre responde. Califica el lead, cotiza con PRICING y deriva a
   WhatsApp con contexto (dispara la conversión vía analytics.js) o al checkout con seña. */
(function () {
  'use strict';
  if (window.__srmAssistant) return; window.__srmAssistant = true;

  var PHONE = '5493536561265';

  // Cotización real desde el motor de precios (servicio "reservas" = turnos con seña).
  var P = window.PRICING;
  var Q = P ? P.calc({ service: 'reservas' }) : { min: 1500, serviceName: 'Turnos / Reservas online' };
  var DEP = P ? P.deposit(Q.min) : 450;
  var PRICE = { min: Number(Q.min).toLocaleString('en-US'), dep: Number(DEP).toLocaleString('en-US') };
  // Programa Fundadores (promo de lanzamiento): precio y seña reducidos + cuotas, cupos limitados.
  var PROMO = { was: '1,500', price: '990', dep: '250', cuotas: '3', slots: 5 };

  var T = { title: 'Asistente', sub: 'Respuesta al instante', ph: 'Escribí tu mensaje…', typing: 'Escribiendo…' };
  var GREET = '¡Hola! 👋 Soy el asistente de Santiago. Ayudo a centros de estética, spa y consultorios a **llenar la agenda y dejar de perder turnos**. ¿Qué te gustaría resolver?';
  var CHIPS_MAIN = ['😩 Me faltan turnos (no-shows)', '📱 El WhatsApp me consume', '💰 ¿Cuánto sale?', '⚙️ ¿Cómo funciona?'];
  var CHIPS_MORE = ['💰 ¿Cuánto sale?', '⚙️ ¿Cómo funciona?', '💬 Quiero una demo'];

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
  .srm-ai-msg b{font-weight:700}
  .srm-ai-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:12px 14px;background:color-mix(in srgb,var(--ink,#17140E) 6%,transparent);border-radius:15px;border-bottom-left-radius:5px}
  .srm-ai-typing i{width:6px;height:6px;border-radius:50%;background:var(--muted,#6E685A);animation:srm-bounce 1.2s infinite}
  .srm-ai-typing i:nth-child(2){animation-delay:.15s}.srm-ai-typing i:nth-child(3){animation-delay:.3s}
  @keyframes srm-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}
  .srm-ai-chips{display:flex;flex-wrap:wrap;gap:7px;align-self:flex-start;max-width:94%}
  .srm-ai-chips button{font:inherit;font-size:12.5px;font-weight:600;border-radius:999px;padding:8px 13px;cursor:pointer;background:transparent;color:var(--forest,#163A2B);border:1px solid var(--line-2,rgba(23,20,14,.26));transition:background .15s,transform .15s}
  .srm-ai-chips button:hover{background:color-mix(in srgb,var(--forest,#163A2B) 9%,transparent);transform:translateY(-1px)}
  .srm-ai-quote{align-self:flex-start;max-width:92%;border:1px solid var(--line,rgba(23,20,14,.14));border-radius:15px;padding:13px 14px;background:color-mix(in srgb,var(--signal,#0E9E64) 8%,transparent);animation:srm-in .32s cubic-bezier(.22,.61,.36,1) both}
  .srm-ai-quote .qh{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--signal-ink,#0B6B45);margin-bottom:2px}
  .srm-ai-quote .qa{font-family:var(--serif,Georgia,serif);font-size:24px;color:var(--forest,#163A2B);line-height:1.05}
  .srm-ai-quote .qn{font-size:12px;color:var(--muted,#6E685A);margin:3px 0 12px}
  .srm-ai-quote .qb{display:flex;gap:8px;flex-wrap:wrap}
  .srm-ai-quote button,.srm-ai-quote a{font:inherit;font-size:13px;font-weight:600;border-radius:999px;padding:9px 15px;cursor:pointer;text-decoration:none;border:1px solid var(--line-2,rgba(23,20,14,.26));display:inline-block}
  .srm-ai-quote .primary{background:var(--forest,#163A2B);color:var(--on-forest,#E9E4D6);border-color:var(--forest,#163A2B)}
  .srm-ai-quote .ghost{background:transparent;color:var(--ink,#17140E)}
  .srm-ai-foot{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line,rgba(23,20,14,.14))}
  .srm-ai-foot input{flex:1;border:1px solid var(--line-2,rgba(23,20,14,.26));border-radius:999px;padding:11px 15px;font:inherit;font-size:14px;background:transparent;color:var(--ink,#17140E)}
  .srm-ai-foot input::placeholder{color:var(--muted,#6E685A)}
  .srm-ai-foot button{border:none;background:var(--forest,#163A2B);color:var(--on-forest,#E9E4D6);border-radius:50%;width:42px;height:42px;cursor:pointer;flex:none;display:grid;place-items:center;transition:transform .2s}
  .srm-ai-foot button:hover{transform:scale(1.06)}
  `;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function getCookie(n) { var m = document.cookie.match('(^|;)\\s*' + n + '\\s*=\\s*([^;]+)'); return m ? m.pop() : undefined; }

  var style = el('style'); style.textContent = CSS; document.head.appendChild(style);

  var launch = el('button', 'srm-ai-launch');
  launch.setAttribute('aria-label', 'Asistente IA');
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
    + '<button type="submit" aria-label="Enviar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z"/></svg></button></form>';
  document.body.appendChild(panel);

  var body = panel.querySelector('#srm-ai-body');
  var form = panel.querySelector('#srm-ai-form');
  var input = panel.querySelector('#srm-ai-input');
  var opened = false;
  var state = { rubro: null };

  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function addMsg(role, text) { body.appendChild(el('div', 'srm-ai-msg ' + (role === 'user' ? 'me' : 'bot'), role === 'user' ? esc(text) : fmt(text))); scrollDown(); }
  function typing(on) {
    var ex = body.querySelector('.srm-ai-typing');
    if (on && !ex) { var t = el('div', 'srm-ai-typing', '<i></i><i></i><i></i>'); t.setAttribute('aria-label', T.typing); body.appendChild(t); scrollDown(); }
    if (!on && ex) ex.remove();
  }
  function addChips(list) {
    if (!list || !list.length) return;
    var box = el('div', 'srm-ai-chips');
    list.forEach(function (label) {
      var b = el('button', null, esc(label)); b.type = 'button';
      b.addEventListener('click', function () { box.remove(); handleUser(label); });
      box.appendChild(b);
    });
    body.appendChild(box); scrollDown();
  }
  function waLink(kind) {
    var extra = state.rubro ? ('Tengo un ' + state.rubro + ' y ') : '';
    var msg = kind === 'precio'
      ? ('Hola Santiago, vengo del asistente. ' + extra + 'quiero el sistema de turnos con seña. ¿Me pasás el presupuesto?')
      : ('Hola Santiago, vengo del asistente. ' + extra + 'quiero una demo del sistema de turnos con seña. ¿Coordinamos?');
    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
  }
  function addCTA(o) {
    o = o || {};
    var wa = waLink(o.price ? 'precio' : 'demo');
    var card = el('div', 'srm-ai-quote'), html = '';
    if (o.price) {
      html += '<div class="qh">🏆 Programa Fundadores · ' + PROMO.slots + ' cupos</div>'
        + '<div class="qa"><s style="font-size:.5em;color:#9a9a9a;font-weight:600;margin-right:8px">USD ' + PROMO.was + '</s>USD ' + PROMO.price + '</div>'
        + '<div class="qn">o ' + PROMO.cuotas + ' cuotas · seña desde USD ' + PROMO.dep + ' · el resto lo acordamos en la llamada</div>';
    } else {
      html += '<div class="qh">Demo gratis</div><div class="qa" style="font-size:19px">15 min, sin compromiso</div>'
        + '<div class="qn">Te muestro cómo quedaría tu agenda trabajando sola</div>';
    }
    html += '<div class="qb"><a class="primary" href="' + wa + '" target="_blank" rel="noopener" data-track="assistant_wa" data-event="Lead">💬 Reservá tu demo gratis</a>'
      + '<a class="ghost" href="/app?service=reservas" data-track="assistant_cotizar" data-event="ViewContent">Armar presupuesto</a></div>';
    card.innerHTML = html;
    body.appendChild(card); scrollDown();
  }

  // ── Cerebro guiado (reglas por intención) ──────────────────────────────────
  var RUBROS = { estetica: 'centro de estética', 'centro de estetica': 'centro de estética', spa: 'spa', peluqueria: 'salón de belleza', 'salon': 'salón de belleza', unas: 'estudio de uñas', manicura: 'estudio de uñas', depilacion: 'centro de depilación', cosmetologia: 'centro de cosmetología', barberia: 'barbería', consultorio: 'consultorio', nutricion: 'consultorio de nutrición', gimnasio: 'gimnasio', gym: 'gimnasio', masajes: 'centro de masajes', cejas: 'estudio de cejas y pestañas', pestanas: 'estudio de cejas y pestañas' };

  function detectRubro(t) {
    for (var k in RUBROS) { if (t.indexOf(k) !== -1) { state.rubro = RUBROS[k]; return true; } }
    return false;
  }

  function brain(text) {
    var t = norm(text);
    detectRubro(t);

    if (/(precio|cuesta|sale|cuanto val|cuanto s|presupuesto|valor|vale|cobras|cobra|caro|barato|inversion)/.test(t))
      return { text: 'Te tiro números reales, sin vueltas. 👇\nEl **sistema de turnos online con seña** tiene precio de lista **USD ' + PROMO.was + '**, pero estoy con el **Programa Fundadores**: los primeros ' + PROMO.slots + ' negocios lo llevan a **USD ' + PROMO.price + '** (o en **' + PROMO.cuotas + ' cuotas**) a cambio de un testimonio cuando vean resultados.\nArrancás con una **seña desde USD ' + PROMO.dep + '** y el resto lo acordamos en una llamada. Te lo armo a medida en 1 minuto, o lo vemos por WhatsApp.', cta: { price: true } };

    if (/(reservar|contratar|quiero el sistema|lo quiero|quiero contratar|empezar ya|arrancar ya|pagar la se|dejar la se)/.test(t))
      return { text: '¡Buenísimo! 🙌 Para arrancar dejás una **seña de reserva** y coordinamos todo en una llamada. ¿Lo hablamos antes por WhatsApp o querés que te arme el presupuesto exacto?', cta: { price: true } };

    if (/(no.?show|ausencia|falta|faltan|no vienen|no viene|no vino|plantad|cancelan|se borran|dejan colgado)/.test(t))
      return { text: 'Los no-shows son plata que se va. 😕\nLa solución: tus clientas reservan online y **dejan una seña por Mercado Pago**. El que paga, viene — y si falta, ya cobraste. Además reciben **recordatorios automáticos**. La mayoría baja las ausencias más del **70%**.', chips: CHIPS_MORE };

    if (/(whatsapp|mensaje|contestar|responder|agenda manual|planilla|cuaderno|agenda de papel|todo el dia|me consume|no llego|pierdo tiempo)/.test(t))
      return { text: 'Te entiendo — contestar turnos todo el día agota y perdés ventas cuando no llegás a responder. 📱\nCon el sistema, un **agente de IA en WhatsApp** atiende, muestra horarios libres, agenda y cobra la seña **solo, 24/7**. Vos te dedicás a atender.', chips: CHIPS_MORE };

    if (/(como funciona|funciona|que incluye|incluye|que hace|como es|que es|explicame|de que se trata)/.test(t))
      return { text: 'Simple, en 3 pasos:\n1️⃣ Tu clienta entra a tu web y elige día y hora libres.\n2️⃣ Deja una **seña por Mercado Pago** → turno confirmado.\n3️⃣ Recibe **recordatorios automáticos** y vos ves todo en un panel.\n➕ Opcional: **agente de IA en WhatsApp** que agenda y cobra por vos. Todo con tu marca.', chips: CHIPS_MORE };

    if (/(cuanto tarda|tarda|demora|tiempo|cuando lo|plazo|listo en|entrega)/.test(t))
      return { text: 'Lo tengo funcionando en **~10 días hábiles**. Empezamos apenas confirmás la seña de reserva. ⚡', chips: ['💬 Quiero una demo', '💰 ¿Cuánto sale?'] };

    if (/(demo|hablar|contacto|persona|humano|asesor|llamada|reunion|coordinar|santiago|whatsapp ya|escribir)/.test(t))
      return { text: '¡Dale! Coordinemos una **demo gratis de 15 min** (sin compromiso). Te muestro cómo quedaría tu agenda 👇', cta: {} };

    if (/^(hola|buenas|buen dia|buenas tardes|hey|holis)/.test(t))
      return { text: '¡Hola! 😊 ¿Tenés un negocio de agenda (estética, spa, salud) y querés dejar de perder turnos? Contame qué te gustaría resolver.', chips: CHIPS_MAIN };

    if (/(gracias|genial|buenisimo|perfecto|dale|listo|ok|barbaro|de una|me interesa|me sirve)/.test(t))
      return { text: '¡Cuando quieras! 🙌 ¿Arrancamos con una demo gratis y te muestro todo?', cta: {} };

    if (state.rubro)
      return { text: '¡Genial, para un **' + state.rubro + '** funciona perfecto! Muchos ya lo usan para no perder turnos y llenar la agenda. ¿Querés que te muestre cómo quedaría?', chips: CHIPS_MORE };

    return { text: 'Buena pregunta 🙌 Eso lo vemos mejor en una **demo gratis** (sin compromiso). O si querés, elegí una opción y te cuento:', chips: CHIPS_MAIN };
  }

  function handleUser(text) {
    text = String(text).trim(); if (!text) return;
    addMsg('user', text);
    input.value = '';
    typing(true);
    setTimeout(function () {
      typing(false);
      var r = brain(text);
      addMsg('bot', r.text);
      if (r.cta) addCTA(r.cta);
      if (r.chips) addChips(r.chips);
    }, 480 + Math.random() * 420);
  }

  function open() {
    if (!opened) { opened = true; addMsg('bot', GREET); addChips(CHIPS_MAIN); }
    panel.classList.add('open'); launch.style.display = 'none';
    setTimeout(function () { input.focus(); }, 250);
  }
  function close() { panel.classList.remove('open'); launch.style.display = 'grid'; }

  launch.addEventListener('click', open);
  panel.querySelector('.x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); handleUser(input.value); });
})();
