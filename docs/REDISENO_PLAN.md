# Rediseño para tráfico viral — Plan e inventario

> Rama: `rediseno` · Deploy: preview de Vercel · A producción solo con OK de Santiago.
> Fecha: 2026-11-14 · Autor del plan: equipo de rediseño (sesión Claude Code).

Objetivo: convertir tráfico frío de Shorts (móvil) en **contactos capturados** y después en ventas.
Métrica 1: contactos por cada 100 visitas. Métrica 2: ventas/diagnósticos por cada 100 contactos.

---

## 0. Decisión de arquitectura

**Se mantiene HTML estático + Vercel Functions. NO se migra a Next.js en esta etapa.**

Justificación (una línea): el sitio ya está en producción con pagos (Mercado Pago), reservas (Neon + Google Calendar) y tracking (Meta Pixel/CAPI + analytics propio) funcionando sobre HTML estático + Functions; migrar a Next.js reescribiría 13 endpoints y 2 cotizadores con riesgo directo sobre dinero real, sin ninguna ganancia para un tráfico que es 100% contenido estático servido por CDN. Las páginas nuevas se agregan como HTML estático reusando los módulos `public/shared/*.js`.

Cuando el volumen y el equipo lo justifiquen, la migración a Next.js 15 (App Router) se puede hacer endpoint por endpoint manteniendo URL y contrato; queda documentada como trabajo futuro, no de este rediseño.

---

## 1. Inventario del repo

### Páginas (`public/`)
| Archivo | Rol | ¿Producción / dinero? |
| --- | --- | --- |
| `index.html` (177 KB) | Home: hero + wizard cotizador 5 pasos + servicios + casos + sobre mí + exit-intent | Sí (captación) |
| `app/index.html` (141 KB) | Cotizador de proyectos → `/api/checkout` | **Sí — pagos** |
| `reservar.html` | Motor real de reserva del Diagnóstico: calculadora + `/api/lead` + `/api/booking` | **Sí — pagos/reservas** |
| `diagnostico.html` | Landing de venta del Diagnóstico (solo persuade, CTAs → `reservar.html`) | Sí (embudo) |
| `turnos.html` | Landing vertical "turnos con seña" → `/app?service=reservas` | Sí |
| `cuestionario.html` | Cuestionario previo a la sesión → `/api/questionnaire` | **Sí — operación** |
| `sesion.html` | Consola interna 1:1 (respuestas + plan) | Interno (token) |
| `centro.html` | Centro de operaciones → `/api/orders` | Interno (token) |
| `panel.html` | Dashboard de comportamiento → `/api/stats` | Interno (token) |
| `portfolio.html` | Portfolio de trabajos | Sí |
| `gracias.html` / `pendiente.html` / `error.html` | Resultado de pago → `/api/order-status` | **Sí — pagos** |

### Funciones (`api/`) y contratos (NO cambian URL ni request/response)
- `POST /api/checkout` — crea preferencia MP para la **seña** de un proyecto. Recalcula precio server-side con `pricing.js`. **Intocable.**
- `POST /api/booking` — reserva una sesión (pago 100%), hold con `UNIQUE(slot_start, service_id)`. **Intocable.**
- `POST /api/mp-webhook` — valida pago contra la API de MP, `markPaidOnce` idempotente (`mp_payment_id UNIQUE`), Purchase CAPI, confirma booking + Google Calendar. **Intocable. La URL del webhook queda igual.**
- `GET /api/availability` — huecos libres.
- `POST /api/lead` — **hoy es solo el calculador "costo del desorden"** (requiere `ventas/ticket/horas`, devuelve `resultado`). Se **extiende** de forma aditiva para captar leads de las dos puertas sin romper `reservar.html` (ver §5).
- `POST /api/track` — ingesta de analytics propio + reenvío de conversiones a Meta CAPI.
- `GET /api/order-status`, `GET /api/orders`, `GET /api/stats`, `POST/GET /api/questionnaire`, `/api/activity`, `/api/instagram`, `/api/assistant`.

### Librerías (`lib/`)
`db.js` (Neon; tablas `orders`, `bookings`, `events`, `leads`, `questionnaires`), `mp.js` (Checkout Pro + firma webhook + dólar en vivo), `meta.js` (CAPI con hash SHA-256 y dedup por `event_id`), `calendar.js` (Google Calendar), `slots.js`, `assistant.js`, `mode.js` (mock sin credenciales en dev/preview).

### Config / infra
- `vercel.json`: `outputDirectory: public`, rewrite SPA-fallback `/((?!api/).*) → /index.html`, headers de seguridad. **Clave:** hoy TODA ruta que no sea `/api/` cae en `index.html`. Las páginas `.html` reales existen como archivos, así que `/diagnostico.html` sirve su archivo; pero rutas limpias tipo `/cabeza` caerían en `index.html`. El rediseño agrega rewrites/archivos explícitos por cada ruta nueva.
- `.env.example`: DATABASE_URL, MP_*, ANTHROPIC_API_KEY, META_*, GOOGLE_*, BOOKING_*.
- Tabla `leads` existente: `id, email, phone, name, inputs(jsonb), resultado(jsonb), utm(jsonb), order_id, created_at`.

### Módulos compartidos (`public/shared/`)
`analytics.js` (tracking + Pixel/CAPI + Clarity + Vercel Analytics; guarda UTM del primer toque), `stars.js` (fondo), `assistant.js` (chat heurístico → WhatsApp), `enhance.js` (personalización por rubro/UTM, solo en index), `pwa.js`, `pricing.js` (catálogo del cotizador).

---

## 2. Auditoría honesta de los 7 bugs

El listado del prompt está **parcialmente desactualizado**. Verificado contra el código actual:

| # | Bug reportado | Estado real | Acción |
| --- | --- | --- | --- |
| 1 | "Continuar por WhatsApp" apunta a `#` | **Parcial.** El `href="#"` es el valor inicial; `buildSummary()` lo reemplaza por `wa.me/...` con las respuestas precargadas al llegar al paso 5 (`index.html:1180`). Solo falla si se fuerza el click sin completar el wizard. | Endurecer: botón deshabilitado hasta tener URL. Bajo riesgo. El wizard se reemplaza en el rediseño. |
| 2 | Resumen muestra 4 campos vacíos | **Parcial.** Nacen con "—" y se llenan en `buildSummary()` (`index.html:1167-1170`). Vacíos solo si se renderiza el paso 5 sin respuestas. | Guard defensivo + se reemplaza con el rediseño. |
| 3 | Selector ES/EN sin versión en inglés | **Falso.** Hay traducciones `data-en`/`data-en-href` **completas y reales** en todo el sitio, con motor `setLang`. | **No se borra** una función que anda. Se documenta. El rediseño de home nace en español; el toggle se conserva donde ya existe. |
| 4 | "Sobre mí" apunta a sección inexistente | **Falso.** `index.html:502` → `#sobre`, y la sección existe en `index.html:661` (`<section id="sobre">`). | Sin acción. |
| 5 | "USD $700" duplica la moneda | **Real.** 18 apariciones en `index.html` + 1 en `diagnostico.html` + varias en `turnos.html`/`app`. | **Fix:** `USD $N` → `USD N` en todo el sitio. |
| 6 | Dos URLs para el mismo diagnóstico | **Real** (comparten producto y copy, no código). | **Fix:** canónica = `/diagnostico`; `reservar.html` sigue siendo el motor pero se unifica y la URL vieja redirige 301. Ver §4. |
| 7 | Exit-intent ofrece el diagnóstico pago | **Real.** `index.html` exit-intent ofrece "sesión USD 75" → `/reservar.html`. | **Fix:** ofrecer el **regalo gratis** de la puerta (auditoría 2 min / test SRM). |

> Regla aplicada: no se "arregla" lo que no está roto ni se destruye una función que anda (bugs 3 y 4). Se reporta.

---

## 3. Estrategia: dos puertas

La home abre con **dos puertas grandes** (una sola acción visible, mobile-first):

- **Tu cabeza** (`/cabeza`): regalo = test del Método SRM → resultado personal (tras dejar contacto) → desafío USD 19 → curso USD 97 → comunidad USD 19/mes.
- **Tu negocio** (`/negocio`): regalo = auditoría automática de 2 min (5-7 preguntas, resultado por API de Anthropic con las 3 fugas + costo) → Diagnóstico USD 75 → sistema por rubro → proyecto a medida.

El resultado de cada regalo se muestra **después** de dejar mail o WhatsApp (consentimiento claro, máximo 2 datos).

**Coincidencia con el Short:** los links llegan con `utm_campaign=pieza_<ID>_<canal>`. Prefijo del ID → titular y puerta:
`R` recreo, `T` terapia, `W` warren, `K` cambiar, `M` amigo, `I` inflacion, `P` publicar, `D` ideas, `N` nicho, `Q` comport, `F` futuro, `G` agentes. Se guarda `utm_*` en cada lead.

---

## 4. Mapa de páginas (destino)

| Ruta | Estado | Notas |
| --- | --- | --- |
| `/` | Reestructurar | Hero con dos puertas (variante por `utm_campaign`), video 30s, prueba social, ofertas, sobre mí, FAQ, cierre. Se conserva el cotizador en `/app`. |
| `/cabeza` | **Nueva** | Puerta mindset: test → contacto → resultado → desafío. |
| `/negocio` | **Nueva** | Puerta negocio: auditoría 2 min → contacto → resultado → diagnóstico/sistema. |
| `/sistemas/[rubro]` | **Nueva** (6) | Una landing por rubro con escalera de 3 (config). Demos = TODO-SANTIAGO. |
| `/diagnostico` | Unificar | Única página del diagnóstico (agenda + pago). `reservar.html` → 301. |
| `/casos/[slug]` | **Nueva** | Casos con antes/después y números (placeholder hasta dato real). |
| `/v/[tema]` | **Nueva** (12) | Landings de Shorts; repiten el gancho y ofrecen el regalo de su puerta. |
| `/gracias`, `/privacidad`, `/terminos` | gracias existe; faltan legales | |
| `/app`, `/turnos`, `/panel`, `/portfolio`, `/centro`, `/cuestionario`, `/sesion`, `/pendiente`, `/error` | **Se mantienen** | |

Routing: cada ruta limpia nueva se sirve con un archivo físico (`public/cabeza/index.html`) o un rewrite explícito en `vercel.json` **antes** del fallback SPA, para no caer en `index.html`.

---

## 5. Captura y seguimiento

- **Tabla `leads`:** se extiende de forma aditiva (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) con `puerta`, `consent`, `estado`, `entry_path`. Los `utm_source/medium/campaign/content/term`, `canal` y `pieza` ya viajan dentro de `utm` (jsonb). No se rompe `reservar.html` (que sigue mandando `inputs/resultado`).
- **`POST /api/lead` extendido:** acepta además `{ puerta, name, email, phone, respuestas, utm, consent, hp (honeypot), t (ms desde carga) }`. Si llega el formato viejo (`ventas/ticket/horas`) se comporta igual que hoy. Validación de email, **honeypot + tiempo mínimo** (anti-bot sin captcha), **rate-limit por IP** (memoria del runtime), respuesta < 300 ms. Dispara `Lead` a Meta CAPI con dedup contra el píxel (ya implementado en `lib/meta.js`).
- **Mails transaccionales (Resend):** secuencia de 5 por puerta en `content/emails/` (bienvenida+regalo, historia, caso, objeción, oferta). La clave `RESEND_API_KEY` va por entorno. El envío se cablea en una fase posterior; el contenido se escribe ya.

---

## 6. Medición

- Eventos (todos con UTM): `entrada`, `puerta_elegida`, `regalo_iniciado`, `contacto_dejado`, `oferta_vista`, `checkout_iniciado`, `pago_aprobado`, `whatsapp_click`. Se montan sobre `analytics.js` (`/api/track`) que ya persiste en Neon y reenvía conversiones a CAPI.
- A/B del hero y del regalo: flag simple por cookie; la variante viaja en el evento. Documentado en §9.
- Panel interno `/panel`: se extiende para mostrar leads por día, por puerta y por `utm_campaign`, y conversión por paso.

---

## 7. Diseño y marca

Mobile-first, tipografía grande, mucho aire, un color de acento, botones ≥48 px, una sola acción por pantalla, accesibilidad AA. La identidad se documenta en [`docs/MARCA.md`](./MARCA.md) a partir de la paleta y las fuentes **ya presentes** en el sitio (Instrument Serif + Instrument Sans, verde bosque + verde señal sobre papel crema). No se inventó marca nueva.

---

## 8. Plan por fases (un commit por fase)

1. **Bugs** — `USD $` → `USD`, exit-intent al regalo gratis, 301 de la URL vieja del diagnóstico, guards del wizard. *(incluye config de ofertas y docs de marca/plan)*
2. **Base y diseño** — `public/config/ofertas.json`, `docs/MARCA.md`, parciales/estilos compartidos, legales (`/privacidad`, `/terminos`).
3. **Home y dos puertas** — hero de dos puertas + variante por UTM; páginas `/cabeza` y `/negocio` con captura.
4. **Captura, mails y medición** — `/api/lead` extendido + schema, eventos nuevos, 5 mails por puerta en `content/emails/`, A/B flag.
5. **Rubros, casos y Shorts** — `/sistemas/[rubro]` (6), `/casos/[slug]`, `/v/[tema]` (12).
6. **Rendimiento, SEO y QA** — OG por página, sitemap/robots, datos estructurados, imágenes AVIF/WebP, Lighthouse móvil, tests de endpoints y prueba de punta a punta de cada embudo en preview.

### Estado de esta sesión
Lo ejecutado queda marcado en el reporte final y en el checklist `TODO-SANTIAGO`. Lo no ejecutado queda como fase pendiente, sin romper nada en producción.

---

## 9. A/B testing — cómo leer resultados

1. `analytics.js` lee/asigna una cookie `srm_ab` con la variante (`a`/`b`) y la incluye en cada evento (`meta.ab`).
2. El hero y el regalo renderizan según esa variante.
3. En Neon: `SELECT meta->>'ab' AS variante, event, count(*) FROM events WHERE event IN ('entrada','contacto_dejado') GROUP BY 1,2;` → tasa de contacto por variante.
4. Se corta cuando una variante gana con volumen suficiente; se fija la ganadora quitando el flag.

---

## 10. Variables de entorno nuevas

| Variable | Para qué | Estado |
| --- | --- | --- |
| `RESEND_API_KEY` | Envío de los 5 mails por puerta | TODO-SANTIAGO |
| `STATS_TOKEN` | Ya usado por `/api/stats` y `/api/orders` (panel/centro) | Verificar que esté seteada |
| `META_TEST_EVENT_CODE` | Pruebas de CAPI | Opcional |
| `AB_DEFAULT` | Variante por defecto del A/B (`a`) | Opcional |

El detalle vivo de claves nuevas se mantiene en el reporte final de la sesión y en `.env.example`.

---

## 11. Lighthouse (móvil)

Pendiente de correr contra el deploy de preview una vez montada la home de dos puertas. Objetivos: **LCP < 1,5 s en 4G**, **CLS < 0,05**, JS mínimo en la home. Resultados se pegan acá:

```
TODO-SANTIAGO: pegar resultados de Lighthouse móvil del preview
Performance:  __
LCP:          __ s
CLS:          __
TBT:          __ ms
```
