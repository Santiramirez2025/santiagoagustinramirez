// lib/assistant.js — Asistente IA de ventas (Claude + tool use sobre pricing.js).
// No inventa precios: usa la herramienta `cotizar` que llama al catálogo real.
const PRICING = require('../public/shared/pricing.js');

const AnthropicPkg = (() => { try { return require('@anthropic-ai/sdk'); } catch (e) { return null; } })();
const Anthropic = AnthropicPkg ? (AnthropicPkg.default || AnthropicPkg) : null;

const MODEL = process.env.ASSISTANT_MODEL || 'claude-opus-4-8';

function hasKey() { return !!process.env.ANTHROPIC_API_KEY; }
function isProd() { return process.env.VERCEL_ENV === 'production'; }

// ---- Catálogo para el system prompt (fuente única: pricing.js) ----
function catalogText() {
  const svc = Object.entries(PRICING.SERVICES).map(function ([id, s]) {
    const mods = s.modules.map(function (m) { return m.id + '(+USD ' + m.price + ')'; }).join(', ');
    return '- ' + id + ': "' + s.name + '" — base USD ' + s.basePrice + ', ~' + s.baseDays + ' días. Módulos: ' + mods;
  }).join('\n');
  const ses = Object.entries(PRICING.SESSIONS).map(function ([id, s]) {
    return '- ' + id + ': "' + s.name + '" — USD ' + s.priceUsd + ' (' + s.durationMin + ' min), se reserva en /reservar.html';
  }).join('\n');
  return svc + '\n\nSesiones/bookings:\n' + ses;
}

const SYSTEM = `Sos el asistente de IA del sitio de Santiago Ramírez — desarrollador full-stack, licenciado en marketing y coach, de Villa María (Córdoba, Argentina) que trabaja con toda Argentina y el exterior. Su propuesta: "quien te construye la herramienta también te ayuda a venderla".

Tu trabajo: conversar con el visitante, entender su negocio y objetivo, recomendarle el servicio correcto, y —cuando corresponda— calcular el presupuesto y la seña, e invitarlo a dar el siguiente paso (reservar con seña o coordinar por WhatsApp). Sos cálido, claro y concreto. Hablás como argentino (vos), sin ser informal de más.

Reglas:
- Respondé en el idioma del usuario (español por defecto; inglés si te escribe en inglés).
- Sé breve: 2 a 5 frases. Nada de textos largos. Una idea por mensaje.
- NUNCA inventes precios ni plazos. Para dar cualquier monto, usá la herramienta "cotizar". Presentá el rango y destacá la SEÑA como primer paso accesible ("empezás hoy con USD X").
- El cobro es con seña: se reserva el proyecto con una seña (≈30%, mínimo USD 150) y el saldo se acuerda en la llamada.
- Para turnos/sesión estratégica (USD 75), derivá a /reservar.html.
- Después de cotizar, ofrecé: reservar con la seña, o coordinar una llamada/demo gratis por WhatsApp.
- Si no estás seguro de qué necesita, hacé 1 pregunta corta para orientarte.
- Si el visitante quiere hablar con Santiago, decile que puede seguir por WhatsApp. No prometas cosas que no están en el catálogo. No des asesoramiento legal/financiero.
- Mantené el foco en el negocio de Santiago; si te preguntan algo ajeno, redirigí con amabilidad.

Catálogo real (usá estos ids en la herramienta cotizar):
${catalogText()}`;

const TOOLS = [{
  name: 'cotizar',
  description: 'Calcula el precio fijo estimado (rango) y la seña de reserva de un proyecto, usando el catálogo real. Usalo SIEMPRE que vayas a mencionar un precio. Nunca estimes montos por tu cuenta.',
  input_schema: {
    type: 'object',
    properties: {
      service: { type: 'string', description: 'id del servicio (ej. landing, ecommerce, sistema, chatbot)' },
      modules: { type: 'array', items: { type: 'string' }, description: 'ids de módulos extra del servicio elegido' },
      design: { type: 'string', enum: ['template', 'custom'], description: 'template (sin costo) o custom (+25%)' },
      urgency: { type: 'string', enum: ['standard', 'express'], description: 'standard o express (+20%)' },
      integration: { type: 'boolean', description: 'true si hay que integrar con un sistema existente (+USD 400)' }
    },
    required: ['service']
  }
}];

function runCotizar(input) {
  const sel = {
    service: input.service,
    modules: Array.isArray(input.modules) ? input.modules : [],
    design: input.design === 'custom' ? 'custom' : 'template',
    urgency: input.urgency === 'express' ? 'express' : 'standard',
    integration: !!input.integration
  };
  if (!PRICING.SERVICES[sel.service]) {
    return { error: 'servicio_invalido', validos: Object.keys(PRICING.SERVICES) };
  }
  const q = PRICING.calc(sel);
  const depositUsd = PRICING.deposit(q.quoteUsd, {
    depositPct: process.env.DEPOSIT_PCT ? Number(process.env.DEPOSIT_PCT) : undefined,
    depositMinUsd: process.env.DEPOSIT_MIN_USD ? Number(process.env.DEPOSIT_MIN_USD) : undefined
  });
  return {
    service: sel.service, serviceName: q.serviceName, config: sel,
    quote_usd: q.quoteUsd, min_usd: q.min, max_usd: q.max, deposit_usd: depositUsd, currency: 'USD'
  };
}

// ---- Loop principal ----
async function chat(history) {
  const msgs = (history || [])
    .filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim(); })
    .map(function (m) { return { role: m.role, content: m.content.slice(0, 4000) }; })
    .slice(-16);
  if (!msgs.length || msgs[0].role !== 'user') {
    // El primer turno debe ser del usuario.
    return { reply: '¿En qué te puedo ayudar con tu negocio?', quote: null };
  }

  if (!Anthropic || !hasKey()) {
    if (isProd()) {
      return { reply: 'Ahora mismo no puedo responder por acá. Escribime por WhatsApp y lo vemos al toque 👉', quote: null, fallback: true };
    }
    return mockChat(msgs);
  }

  const client = new Anthropic();
  let lastQuote = null;
  let convo = msgs.slice();

  for (let step = 0; step < 5; step++) {
    let resp;
    try {
      resp = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'low' },
        tools: TOOLS,
        messages: convo
      });
    } catch (e) {
      console.error('[assistant] API error', e && e.message);
      return { reply: 'Uf, tuve un problema técnico. ¿Probamos de nuevo, o preferís seguir por WhatsApp?', quote: lastQuote, error: true };
    }

    if (resp.stop_reason === 'refusal') {
      return { reply: 'Prefiero no responder eso. ¿Te ayudo con tu proyecto o negocio?', quote: lastQuote };
    }

    if (resp.stop_reason === 'tool_use') {
      convo.push({ role: 'assistant', content: resp.content });
      const results = [];
      for (const b of resp.content) {
        if (b.type === 'tool_use' && b.name === 'cotizar') {
          const out = runCotizar(b.input || {});
          if (!out.error) lastQuote = out;
          results.push({ type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(out) });
        }
      }
      convo.push({ role: 'user', content: results });
      continue;
    }

    const text = (resp.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('').trim();
    return { reply: text || 'Contame un poco más de tu negocio y te oriento.', quote: lastQuote };
  }
  return { reply: 'Sigamos: ¿querés que te arme un presupuesto o coordinamos una llamada?', quote: lastQuote };
}

// ---- Mock (dev sin API key) ----
function mockChat(msgs) {
  const last = msgs[msgs.length - 1].content.toLowerCase();
  const map = { tienda: 'ecommerce', ecommerce: 'ecommerce', 'e-commerce': 'ecommerce', vender: 'ecommerce', landing: 'landing', web: 'web', app: 'app', turno: 'reservas', reserva: 'reservas', sistema: 'sistema', chatbot: 'chatbot', bot: 'agentewa', whatsapp: 'agentewa', ia: 'chatbot', automat: 'automatizacion' };
  let svc = null;
  for (const k in map) { if (last.indexOf(k) !== -1) { svc = map[k]; break; } }
  if (svc) {
    const q = runCotizar({ service: svc });
    return {
      reply: '(demo) Para eso te sirve una ' + q.serviceName + '. Ronda los USD ' + q.min_usd + '–' + q.max_usd + ', y la reservás hoy con una seña de USD ' + q.deposit_usd + '. ¿La reservamos o coordinamos una llamada?',
      quote: q, mock: true
    };
  }
  return { reply: '(demo) Contame qué querés lograr — vender online, ordenar y automatizar, o tener presencia digital — y te recomiendo el camino y el presupuesto.', quote: null, mock: true };
}

module.exports = { chat, runCotizar, MODEL };
