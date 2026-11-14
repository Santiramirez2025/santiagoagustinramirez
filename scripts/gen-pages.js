// scripts/gen-pages.js — genera landings estáticas consistentes del rediseño:
//   /sistemas/[rubro] (6)   desde public/config/ofertas.json
//   /v/[tema] (12)          landings de Shorts, repiten el gancho y mandan a su puerta
//   /casos/[slug] (3)       antes/después con número = placeholder (no se inventan datos)
// Correr:  node scripts/gen-pages.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const cfg = JSON.parse(fs.readFileSync(path.join(PUB, 'config', 'ofertas.json'), 'utf8'));

const PIXEL = `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1419051696174763');fbq('track','PageView');</script>`;
const THEME = `<script>(function(){try{var s=localStorage.getItem('srm-theme');if(s)document.documentElement.setAttribute('data-theme',s);var h=location.hostname;if(h==='santiagoagustinramirez.com'||h==='www.santiagoagustinramirez.com')document.documentElement.classList.add('is-prod');}catch(e){}})();</script>`;
const HEADCSS = `<link rel="stylesheet" href="/shared/fonts.css"><link rel="stylesheet" href="/shared/brand.css">`;
const WA = (txt) => `https://wa.me/5493536561265?text=${encodeURIComponent(txt)}`;
const WADOCK = (txt) => `<a class="wa-dock" href="${WA(txt)}" target="_blank" rel="noopener" data-track="dock_wa" data-event="Contact" aria-label="WhatsApp"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24z"/></svg></a>`;
const TOPBAR = `<div class="wrap" style="display:flex;align-items:center;justify-content:space-between;padding:14px 0"><a href="/" style="font-family:var(--serif);font-size:20px;text-decoration:none;color:inherit">Santiago Ramírez<span style="color:var(--signal)">.</span></a><a class="btn btn-ghost" style="min-height:40px;padding:8px 16px" href="/negocio">Radiografía gratis →</a></div>`;
const ANALYTICS = `<script src="/shared/analytics.js" defer></script>`;

function page({ title, desc, url, body, extraHead = '' }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://santiagoagustinramirez.com${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://santiagoagustinramirez.com${url}">
<meta property="og:image" content="https://santiagoagustinramirez.com/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${THEME}
${PIXEL}
${HEADCSS}
${extraHead}
</head>
<body>
${body}
${ANALYTICS}
</body>
</html>
`;
}

function escaleraHtml() {
  const s = cfg.sistema_rubro;
  const tiers = s.escalera.map((t) => `
      <div class="tier${t.destacado ? ' pop' : ''}">${t.destacado ? '<span class="tag">Recomendado</span>' : ''}
        <div class="tname">${t.nombre}</div>
        <div class="tprice">USD ${t.instalacion_usd.toLocaleString('es-AR')}</div>
        <div class="tper">instalación + USD ${t.abono_mes_usd}/mes</div>
        <ul>${t.incluye.map((i) => `<li>${i}</li>`).join('')}</ul>
      </div>`).join('');
  const fund = (s.precio_fundador && s.precio_fundador.activo) ? `<p class="muted" style="margin-top:14px;font-size:14px">Precio de fundador para los primeros ${s.precio_fundador.cupos} clientes.</p>` : '';
  return `<div class="tiers">${tiers}</div>${fund}`;
}

// Estilos propios de las landings generadas (los de tiers/faq ya vienen de brand.css).
const LADDER_CSS = `<style>
.casos{display:grid;gap:14px;grid-template-columns:1fr}@media(min-width:720px){.casos{grid-template-columns:repeat(3,1fr)}}
</style>`;

// ---------- RUBROS ----------
const RUBRO_COPY = {
  'clinicas-esteticas': { problema: 'La clienta que te escribe a las 23 para un turno y, si no contestás, se va a otra.', demo: 'Reserva de sesiones con seña, recordatorios y un agente que responde precios y disponibilidad al instante.' },
  'clinicas-dentales': { problema: 'Las ausencias que te dejan la agenda con huecos y la recepción respondiendo lo mismo todo el día.', demo: 'Turnos online con confirmación automática, recordatorios y agente de WhatsApp para primeras consultas.' },
  'gimnasios': { problema: 'Las altas, las bajas y los cobros que perseguís uno por uno mientras tendrías que estar dando clase.', demo: 'Reserva de clases con cupo, cobro de cuotas y panel de asistencia, con agente que atiende 24/7.' },
  'cabanas': { problema: '"¿Tenés para el finde?" veinte veces por día, y dos que reservaron el mismo fin de semana.', demo: 'Calendario de disponibilidad real, reserva con seña y agente que responde consultas al toque.' },
  'concesionarias': { problema: 'La consulta por un auto que entra a las 2 de la mañana y se enfría antes de que alguien conteste.', demo: 'Agente de WhatsApp que califica la consulta, agenda el test drive y te pasa el lead caliente al panel.' },
  'padel': { problema: 'Las canchas que quedan libres porque reservar es un quilombo de llamados y planillas.', demo: 'Reserva de canchas por horario con seña, cancelaciones con reglas y panel de ocupación.' }
};

function rubroPage(r) {
  const c = RUBRO_COPY[r.slug] || { problema: 'TODO-SANTIAGO: problema del rubro.', demo: 'TODO-SANTIAGO: demo del rubro.' };
  const body = `${TOPBAR}
<main>
  <section class="wrap">
    <p class="eyebrow"><span class="dot"></span>Sistema para ${r.nombre.toLowerCase()}</p>
    <h1>${r.nombre}, sin el desorden.</h1>
    <p class="lead">${c.problema}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">
      <a class="btn btn-cta" href="/negocio" data-track="rubro_radiografia_${r.slug}" data-event="Lead">Quiero mi radiografía →</a>
      <a class="btn btn-ghost" href="${WA('Hola Santiago, tengo un/a ' + r.nombre.toLowerCase() + ' y quiero ver el sistema')}" target="_blank" rel="noopener" data-track="rubro_wa_${r.slug}" data-event="Lead">Consultar por WhatsApp</a>
    </div>
  </section>

  <section class="wrap">
    <p class="eyebrow"><span class="dot"></span>La demo</p>
    <h2>Qué hace el sistema</h2>
    <p class="muted">${c.demo}</p>
    <div class="todo-santi" style="margin-top:12px">Falta el video o enlace de la demo real para ${r.nombre.toLowerCase()}.</div>
  </section>

  <section class="wrap">
    <p class="eyebrow"><span class="dot"></span>Precios</p>
    <h2>Tres formas de arrancar</h2>
    <p class="muted"><span class="badge-prov">precios provisorios</span></p>
    ${escaleraHtml()}
  </section>

  <section class="wrap">
    <p class="eyebrow"><span class="dot"></span>Casos</p>
    <h2>Resultados reales</h2>
    <div class="todo-santi">Cargar 1-2 casos del rubro con el número de resultado real (no inventar).</div>
  </section>

  <section class="wrap faq">
    <h2>Preguntas</h2>
    <details><summary>¿Cuánto tarda en estar andando?</summary><p class="muted">Depende del plan y de los materiales que pases. Lo definimos en el Plan Negocio Ordenado, con plazo escrito.</p></details>
    <details><summary>¿El abono mensual qué incluye?</summary><p class="muted">Hosting, mantenimiento, el agente de IA funcionando y soporte. El detalle según el plan.</p></details>
    <details><summary>¿Puedo empezar por lo mínimo?</summary><p class="muted">Sí. Arrancás con el plan Base y escalás cuando lo necesites.</p></details>
  </section>

  <section class="wrap">
    <h2>El primer paso es gratis</h2>
    <p class="muted">Hacé tu Radiografía de 2 minutos y mirá dónde se te va el tiempo y la plata.</p>
    <a class="btn btn-cta btn-block" href="/negocio" data-track="rubro_cierre_${r.slug}" data-event="Lead" style="margin-top:12px">Quiero mi radiografía →</a>
  </section>
</main>
${WADOCK('Hola Santiago, quiero el sistema para mi ' + r.nombre.toLowerCase())}`;
  return page({
    title: `${r.nombre}: turnos + agente IA + panel | Santiago Ramírez`,
    desc: c.problema,
    url: `/sistemas/${r.slug}`,
    body, extraHead: LADDER_CSS
  });
}

// ---------- SHORTS /v/[tema] ----------
const PUERTA_URL = { cabeza: '/cabeza', negocio: '/negocio' };
const TEMAS = {
  futuro:   { puerta: 'cabeza',  h1: 'El vos de dentro de un año lo decidís hoy.', sub: 'Lo que hagas esta semana es lo que vas a ser. Empecemos por un paso.' },
  cambiar:  { puerta: 'cabeza',  h1: 'Cambiar se puede. Con método, no con ganas.', sub: 'La fuerza de voluntad se agota. El sistema no.' },
  terapia:  { puerta: 'cabeza',  h1: 'Tu cabeza también se ordena.', sub: 'Empezá por adentro: el resto sale de ahí.' },
  recreo:   { puerta: 'cabeza',  h1: 'Frená un segundo. Mirá para adentro.', sub: 'El recreo que te cambia la semana entera.' },
  warren:   { puerta: 'cabeza',  h1: 'Pensá como los que la ven venir.', sub: 'Mentalidad primero. Lo demás es consecuencia.' },
  amigo:    { puerta: 'cabeza',  h1: 'Lo que un amigo te diría sin vueltas.', sub: 'Por dónde empezar, de verdad.' },
  inflacion:{ puerta: 'negocio', h1: 'Que la plata no se te escape por las grietas.', sub: 'Mirá cuánto te cuesta por año el desorden de tu operación.' },
  publicar: { puerta: 'negocio', h1: 'Publicá menos. Vendé más.', sub: 'Que tu contenido trabaje para tu negocio, no al revés.' },
  ideas:    { puerta: 'negocio', h1: 'De la idea a un sistema que funciona.', sub: 'Bajá la idea a algo que ande solo.' },
  nicho:    { puerta: 'negocio', h1: 'Tu rubro, resuelto.', sub: 'El sistema hecho para lo tuyo: turnos, agente IA y panel.' },
  comport:  { puerta: 'negocio', h1: 'Entendé por qué te compran.', sub: 'Comportamiento que se vuelve ventas.' },
  agentes:  { puerta: 'negocio', h1: 'Un agente de IA que no duerme.', sub: 'Atiende, agenda y vende 24/7 por WhatsApp.' }
};

// Línea que retoma la frase del Short (continúa el video).
const RETOMA = {
  futuro: 'Si el video te pegó, esto es lo que sigue: tu primer paso concreto.',
  cambiar: 'Ya sabés que querés cambiar. Te doy el método para que aguante.',
  terapia: 'Ordenaste la cabeza dos minutos en el video; seguí con el test.',
  recreo: 'El recreo siguió: mirá qué te está frenando en 2 minutos.',
  warren: 'Pensar como los que la ven empieza acá.',
  amigo: 'Lo que te diría un amigo, pero con un paso para hoy.',
  inflacion: 'La plata se escapa en desorden. Mirá cuánto, en 2 minutos.',
  publicar: 'Publicar por publicar no vende. Esto sí.',
  ideas: 'Esa idea del video, bajada a un sistema que funciona.',
  nicho: 'El sistema hecho para tu rubro, como en el video.',
  comport: 'Entendé por qué te compran y vendé más.',
  agentes: 'El empleado de IA del video, andando en tu WhatsApp.'
};

function temaPage(key, t) {
  const door = PUERTA_URL[t.puerta];
  const esCabeza = t.puerta === 'cabeza';
  const cta = esCabeza ? 'Hacer el test (2 min) →' : 'Quiero mi radiografía →';
  const regalo = esCabeza
    ? 'El test del Método SRM: en qué área estás fuerte y cuál te está trabando. Gratis.'
    : 'La Radiografía de 2 min: dónde se te va el tiempo y la plata, y por dónde empezar. Gratis.';
  const prueba = esCabeza ? 'Miles ya hicieron el test del Método SRM' : '+14 sistemas funcionando · Córdoba, Argentina';
  const body = `${TOPBAR}
<main>
  <section class="wrap" style="padding-top:18px">
    <p class="eyebrow"><span class="dot"></span>${esCabeza ? 'Tu cabeza' : 'Tu negocio'}</p>
    <h1>${t.h1}</h1>
    <p class="lead">${RETOMA[key] || t.sub}</p>
    <div class="card" style="margin-top:22px">
      <h3 style="margin-bottom:6px">Tu regalo, gratis</h3>
      <p class="muted">${regalo}</p>
      <a class="btn btn-cta btn-block" href="${door}" data-track="v_${key}_regalo" data-event="Lead" style="margin-top:10px">${cta}</a>
    </div>
    <p class="muted" style="font-size:14px;margin-top:16px">${prueba}</p>
  </section>
</main>
${WADOCK('Hola Santiago, vengo del video de ' + key)}`;
  return page({
    title: `${t.h1} | Santiago Ramírez`,
    desc: t.sub,
    url: `/v/${key}`,
    body
  });
}

// ---------- CASOS ----------
const CASOS = {
  'acopio-saludable': { nombre: 'Acopio Saludable', tipo: 'Agentes de IA', antes: 'Consultas y pedidos por WhatsApp atendidos a mano, uno por uno.', despues: 'Agentes de IA que atienden, ordenan el pedido y liberan horas del equipo.', img: null },
  'azul-colchones':   { nombre: 'Azul Colchones', tipo: 'Tienda / catálogo', antes: 'Catálogo disperso y consultas que se perdían.', despues: 'Presencia digital ordenada con el catálogo y el contacto en un solo lugar.', img: '/portfolio/shots/azul-colchones.jpg' },
  'fergym':           { nombre: 'FerGym', tipo: 'Turnos / reservas', antes: 'Reservas de clases y cobros a pura planilla y WhatsApp.', despues: 'Sistema de turnos con cupo y cobros, menos trabajo manual.', img: '/portfolio/shots/fergym.jpg' }
};

function casoPage(slug, c) {
  const img = c.img ? `<img src="${c.img}" alt="${c.nombre}" style="border-radius:14px;margin-top:16px">` : '';
  const body = `${TOPBAR}
<main>
  <section class="wrap">
    <p class="eyebrow"><span class="dot"></span>${c.tipo}</p>
    <h1>${c.nombre}</h1>
    ${img}
    <div class="casos" style="margin-top:20px;grid-template-columns:1fr">
      <div class="card"><strong>Antes</strong><p class="muted" style="margin:6px 0 0">${c.antes}</p></div>
      <div class="card"><strong>Después</strong><p class="muted" style="margin:6px 0 0">${c.despues}</p></div>
    </div>
    <div class="todo-santi" style="margin-top:16px">Falta el número de resultado real de este caso (ej. horas recuperadas, % de mejora). No inventar.</div>
    <div style="margin-top:20px"><a class="btn btn-cta" href="/negocio" data-track="caso_${slug}_cta" data-event="Lead">Quiero algo así para mi negocio →</a></div>
  </section>
</main>
${WADOCK('Hola Santiago, vi el caso de ' + c.nombre + ' y quiero algo parecido')}`;
  return page({ title: `${c.nombre} — caso | Santiago Ramírez`, desc: `${c.antes} ${c.despues}`.slice(0, 150), url: `/casos/${slug}`, body, extraHead: LADDER_CSS });
}

// ---------- WRITE ----------
function write(rel, html) {
  const dir = path.join(PUB, rel);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  return rel;
}

const written = [];
cfg.sistema_rubro.rubros.forEach((r) => written.push(write(`sistemas/${r.slug}`, rubroPage(r))));
Object.keys(TEMAS).forEach((k) => written.push(write(`v/${k}`, temaPage(k, TEMAS[k]))));
Object.keys(CASOS).forEach((s) => written.push(write(`casos/${s}`, casoPage(s, CASOS[s]))));

console.log('Generadas ' + written.length + ' páginas:');
written.forEach((w) => console.log('  /' + w));

// ---------- SITEMAP ----------
const BASE = 'https://santiagoagustinramirez.com';
const TODAY = new Date().toISOString().slice(0, 10);
const staticUrls = [
  { loc: '', pr: '1.0', cf: 'weekly' },
  { loc: '/cabeza', pr: '0.9', cf: 'weekly' },
  { loc: '/negocio', pr: '0.9', cf: 'weekly' },
  { loc: '/diagnostico', pr: '0.9', cf: 'monthly' },
  { loc: '/turnos.html', pr: '0.8', cf: 'monthly' },
  { loc: '/portfolio.html', pr: '0.7', cf: 'monthly' },
  { loc: '/privacidad', pr: '0.3', cf: 'yearly' },
  { loc: '/terminos', pr: '0.3', cf: 'yearly' }
];
const genUrls = written.map((w) => ({ loc: '/' + w, pr: w.startsWith('v/') ? '0.6' : '0.7', cf: 'monthly' }));
const all = staticUrls.concat(genUrls);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map((u) => `  <url>
    <loc>${BASE}${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.cf}</changefreq>
    <priority>${u.pr}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(PUB, 'sitemap.xml'), sitemap);
console.log('sitemap.xml actualizado con ' + all.length + ' URLs.');
