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
  var GREET = '¡Hola! 👋 Soy el asistente de Santiago. Él ordena, digitaliza y hace crecer negocios: desarrollo, marketing y seguimiento con un solo responsable. ¿Qué querés resolver?';
  var CHIPS_MAIN = ['🧩 Mi negocio es un quilombo', '🌐 Necesito web o sistema', '💰 ¿Cuánto sale?', '⚙️ ¿Cómo empiezo?'];
  var CHIPS_MORE = ['📋 ¿Qué es el Diagnóstico?', '💰 ¿Cuánto sale?', '📅 Quiero reservar'];

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
  .srm-ai-chips button{font:inherit;font-size:13.5px;font-weight:600;border-radius:999px;padding:9px 14px;cursor:pointer;background:color-mix(in srgb,var(--ink,#17140E) 7%,transparent);color:var(--ink,#17140E);border:1px solid color-mix(in srgb,var(--ink,#17140E) 30%,transparent);transition:background .15s,border-color .15s,transform .15s}
  .srm-ai-chips button:hover{background:color-mix(in srgb,var(--ink,#17140E) 15%,transparent);border-color:var(--signal,#0E9E64);transform:translateY(-1px)}
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
      ? ('Hola Santiago, vengo del asistente. ' + extra + 'quiero saber cuánto sale ordenar y digitalizar mi negocio.')
      : ('Hola Santiago, vengo del asistente. ' + extra + 'tengo una duda antes de reservar el Diagnóstico.');
    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
  }

  function addCTA(o) {
    o = o || {};
    var wa = waLink(o.price ? 'precio' : 'duda');
    var card = el('div', 'srm-ai-quote'), html = '';
    html += '<div class="qh">Diagnóstico Negocio Ordenado</div>'
      + '<div class="qa">USD 75</div>'
      + '<div class="qn">90 minutos 1 a 1 · plan escrito y cotizado en 24 hs · garantía de devolución</div>';
    html += '<div class="qb"><a class="primary" href="/reservar.html" data-track="assistant_reservar" data-event="ViewContent">📅 Reservar mi Diagnóstico</a>'
      + '<a class="ghost" href="' + wa + '" target="_blank" rel="noopener" data-track="assistant_wa" data-event="Lead">Tengo una duda</a></div>';
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

    if (/(gratis|sin cargo|no pago|regalado|prueba gratis|demo gratis)/.test(t))
      return { text: 'Acá lo gratis es esto: responderte dudas por chat o por WhatsApp, todo lo que quieras. 🙌\nLo que no hago son diagnósticos ni auditorías sin cargo. Justamente por eso el **Diagnóstico cuesta USD 75**: es la forma más barata de empezar, y **si no te sirve te devuelvo el 100%**.', cta: {} };

    if (/(precio|cuesta|sale|cuanto val|cuanto s|presupuesto|valor|vale|cobras|cobra|caro|barato|inversion)/.test(t))
      return { text: 'Depende de qué haya que construir, y para eso primero hay que ver tu negocio. 👀\nPor eso el primer paso tiene precio fijo: el **Diagnóstico Negocio Ordenado, USD 75**. Son 90 minutos 1 a 1 y salís con un **plan escrito y cotizado dentro de las 24 hs** — ahí vas a ver los números exactos de tu proyecto.\nSi después contratás la implementación dentro de las 72 hs, esos USD 75 **se te descuentan**.', cta: { price: true } };

    if (/(reservar|contratar|quiero el|lo quiero|quiero contratar|empezar ya|arrancar ya|turno|agendar|reservo)/.test(t))
      return { text: '¡Buenísimo! 🙌 Elegís día y hora, pagás los USD 75 y te llega el cuestionario previo para que la sesión arranque con todo sobre la mesa.', cta: {} };

    if (/(quilombo|desorden|desordenado|caos|a mano|manual|planilla|excel|cuaderno|papel|no se por donde|perdido|desprolijo|todo junto)/.test(t))
      return { text: 'Eso es lo más común que veo. 🧩 Casi siempre no es un problema, son **tres fugas** al mismo tiempo: laburo manual que se puede automatizar, plata que se escapa sin que la veas, y marketing que no trae a nadie.\nEl Diagnóstico existe para encontrar esas tres en tu negocio y dejarte el plan por escrito.', chips: CHIPS_MORE };

    if (/(web|pagina|sitio|landing|ecommerce|tienda|sistema|app|aplicacion|software|plataforma|automatiz)/.test(t))
      return { text: '¡Dale, eso lo construyo! 🛠️ Si ya tenés claro qué necesitás, te armo el presupuesto en el cotizador.\nY si todavía no estás seguro del alcance — que es lo más normal — conviene empezar por el **Diagnóstico**: salís con el proyecto definido y cotizado, y no gastás de más en algo que no era.', chips: CHIPS_MORE };

    if (/(whatsapp|mensaje|contestar|responder|todo el dia|me consume|no llego|pierdo tiempo|atender|seguimiento)/.test(t))
      return { text: 'Contestar todo el día a mano te come el negocio. 📱 Eso casi siempre se automatiza: reservas online, cobros, recordatorios y hasta un agente de IA que atiende solo.\nCuánto de eso te conviene depende de tus números, y eso sale del Diagnóstico.', chips: CHIPS_MORE };

    if (/(diagnostico|como funciona|funciona|que incluye|incluye|que hace|como es|que es|explicame|de que se trata|como empiezo|empezar)/.test(t))
      return { text: 'El **Diagnóstico Negocio Ordenado** es así:\n1️⃣ Reservás día y hora y pagás USD 75.\n2️⃣ Completás un cuestionario corto para que no perdamos tiempo.\n3️⃣ Nos vemos 90 minutos 1 a 1 y revisamos procesos, presencia digital y marketing.\n4️⃣ Dentro de las 24 hs te llega **un plan escrito y cotizado**, no un audio ni una charla.\nSi no te resulta accionable, te devuelvo el 100%.', cta: {} };

    if (/(cuanto tarda|tarda|demora|tiempo|cuando lo|plazo|listo en|entrega)/.test(t))
      return { text: 'El Diagnóstico lo hacés esta semana y el plan te llega **dentro de las 24 hs**. ⚡\nLos plazos de construcción dependen del proyecto, y van cotizados en ese mismo plan.', chips: CHIPS_MORE };

    if (/(hablar|contacto|persona|humano|asesor|llamada|reunion|coordinar|santiago|whatsapp ya|escribir)/.test(t))
      return { text: 'Dale, escribime por WhatsApp y te respondo yo. 💬 Si lo que querés es que miremos tu negocio en serio, eso es el Diagnóstico.', cta: {} };

    if (/^(hola|buenas|buen dia|buenas tardes|hey|holis)/.test(t))
      return { text: '¡Hola! 😊 Contame qué te gustaría resolver en tu negocio y te oriento.', chips: CHIPS_MAIN };

    if (/(gracias|genial|buenisimo|perfecto|dale|listo|ok|barbaro|de una|me interesa|me sirve)/.test(t))
      return { text: '¡Cuando quieras! 🙌 ¿Arrancamos por el Diagnóstico y te dejo el plan por escrito?', cta: {} };

    if (state.rubro)
      return { text: 'Para un **' + state.rubro + '** funciona igual: primero encontramos las fugas, después construimos. ¿Te cuento cómo es el Diagnóstico?', chips: CHIPS_MORE };

    return { text: 'Buena pregunta 🙌 Eso se responde bien mirando tu negocio, que es lo que hacemos en el Diagnóstico. O elegí una opción y te cuento:', chips: CHIPS_MAIN };
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
