# Rediseño de santiagoagustinramirez.com para tráfico viral

Actuá como un equipo senior de producto, conversión (CRO), copy de respuesta directa y desarrollo full-stack. Trabajás dentro de este repo: es la web de Santiago Ramírez Mindel (santiagoagustinramirez.com), deploy en Vercel. Escribí todo el copy en español rioplatense, con voseo, directo, sin relleno.

## Objetivo

La red de YouTube de Santiago (40 canales de Shorts + su canal personal) va a mandar miles de visitas orgánicas por día, casi todas desde el celular. Hoy la web está hecha para cerrar a un dueño de pyme que ya lo conoce, no para tráfico frío. Rediseñala para que el visitante viral:

1. entienda en 3 segundos qué gana quedándose,
2. deje su contacto (mail o WhatsApp) a cambio de algo gratis y útil,
3. compre una oferta chica o pida la oferta grande.

Métrica principal: contactos capturados por cada 100 visitas. Métrica secundaria: ventas y diagnósticos pagados por cada 100 contactos.

## Antes de tocar nada

1. Leé el repo entero y armá un inventario: páginas en `public/`, funciones en `api/`, `lib/`, `db/schema.sql`, `vercel.json`, variables de `.env.example`. El README está desactualizado: dice Next.js, pero hoy es HTML estático + funciones de Vercel con Neon, Mercado Pago, Meta CAPI y Anthropic.
2. Listá qué está en producción y lo usan clientes o pagos: checkout y webhook de Mercado Pago, reservas, `/app` (cotizador), `/turnos`, `/panel`, `/portfolio`, el tracking. **Nada de eso se puede romper.** URLs, contratos de request/response y la URL del webhook quedan iguales.
3. Proponé la arquitectura y escribila en `docs/REDISENO_PLAN.md`. Mi recomendación es Next.js 15 (App Router, páginas estáticas, Tailwind) porque Santiago trabaja con ese stack, con las funciones de `/api` migradas una por una a route handlers con la misma URL y el mismo contrato. Si ves que mantener HTML estático + funciones sale más rápido y seguro para esta etapa, decidilo y justificalo en una línea.
4. Trabajá en una rama `rediseno` y deployá a preview. A producción va solo cuando Santiago lo apruebe.

## Bugs que hay que arreglar sí o sí

- «Continuar por WhatsApp» al final del asistente apunta a `#`: tiene que abrir WhatsApp con las respuestas precargadas.
- El resumen del asistente muestra los 4 campos vacíos: tiene que mostrar las respuestas y guardar el lead antes de mostrarlo.
- El selector ES/EN no tiene versión en inglés: se saca hasta que exista.
- El menú «Sobre mí» apunta a una sección que no existe.
- «USD $700» repite la moneda: el formato es «USD 700».
- Hay dos URLs para el mismo diagnóstico (`diagnostico.html` y `reservar.html`): queda una sola, y la vieja redirige con 301.
- El pop-up de salida vuelve a ofrecer el diagnóstico pago: ahora ofrece el regalo gratis.

## Estrategia: dos puertas

La mayoría de quienes llegan vienen de Shorts de mindset, humor y nostalgia: no son dueños de empresa. La home abre con dos puertas grandes:

- **«Tu cabeza»** (mindset): regalo = el test del Método SRM (hoy en metodo-srm.vercel.app; traelo al dominio o enlazalo con el contacto ya guardado) → resultado personal → desafío de 7 días (USD 19) → curso completo (USD 97) → comunidad (USD 19 por mes).
- **«Tu negocio»** (dueños y emprendedores): regalo = auditoría automática de 2 minutos (5-7 preguntas, el resultado lo arma la API de Anthropic con las 3 fugas del negocio y su costo estimado) → Diagnóstico Negocio Ordenado (USD 75, descontable) → sistema con abono por rubro → proyecto a medida.

El resultado de cada regalo se muestra en pantalla **después** de dejar mail o WhatsApp (con consentimiento claro y sin pedir más de 2 datos).

## Ofertas: menos y más claras

Todos los precios van en un solo archivo de configuración (`config/ofertas.ts` o JSON), para que Santiago los cambie sin tocar páginas. Los valores son propuestas iniciales: marcalos como provisorios.

1. **Sistema por rubro** (la oferta principal): turnos + agente IA de WhatsApp + panel. Escalera de tres opciones con la del medio destacada: instalación USD 690 / 1.290 / 2.490 + abono USD 79 / 149 / 249 por mes. Precio de fundador para los primeros 10 clientes. Rubros con landing propia: clínicas estéticas, clínicas dentales, gimnasios, cabañas y complejos, concesionarias, clubes de pádel. Cada landing muestra su demo.
2. **Método SRM digital**: desafío USD 19, curso USD 97, comunidad USD 19 por mes.
3. **Diagnóstico Negocio Ordenado**: USD 75, 90 minutos, plan escrito en 24 h, descontable si contrata en 72 h. Garantía concreta: «Si no te sirvió, te devuelvo los USD 75 dentro de los 7 días. Lo pedís por WhatsApp y listo». Mostrar una muestra del documento que se entrega (con datos tapados).
4. **Proyectos a medida** desde USD 2.500, solo después del diagnóstico.
5. **Mentoría grupal** USD 49 por mes.

Salen de la home (quedan en el cotizador y en el diagnóstico): rediseño, landing, web institucional, PWA, membresías, dashboard, SEO mensual, VIP.

## Mapa de páginas

| Ruta | Para qué |
| --- | --- |
| `/` | Hero que cambia según `utm_campaign`, dos puertas, video de 30 s de Santiago, prueba social, ofertas, sobre mí, FAQ, cierre |
| `/cabeza` | Puerta mindset: test → contacto → resultado → desafío |
| `/negocio` | Puerta negocio: auditoría de 2 min → contacto → resultado → diagnóstico o sistema |
| `/sistemas/[rubro]` | Una landing por rubro: problema del rubro, demo, escalera de 3 opciones, casos, FAQ |
| `/diagnostico` | La única página del diagnóstico, con agenda y pago integrados |
| `/casos/[slug]` | Casos con antes y después y números (Acopio Saludable con agentes de IA, Azul Colchones, uno de turnos) |
| `/v/[tema]` | Landings de los Shorts: futuro, nicho, ideas, cambiar, comport, recreo, terapia, warren, inflacion, publicar, amigo, agentes. Cada una repite el gancho del video y ofrece el regalo de su puerta |
| `/gracias`, `/privacidad`, `/terminos` | Confirmación y legales |

Mantené funcionando: `/app` (cotizador), `/turnos`, `/panel`, `/portfolio`, `/centro`, `/cuestionario`, `/sesion`, `/pendiente`, `/error`.

**Coincidencia con el Short:** los links de la red llegan con `utm_source=youtube&utm_medium=short&utm_campaign=pieza_<ID>_<canal>` (ejemplos: `pieza_F1_mindset`, `pieza_N2a_ch05`). Leé el prefijo del ID (R recreo, T terapia, W warren, K cambiar, M amigo, I inflacion, P publicar, D ideas, N nicho, Q comport, F futuro, G agentes) y elegí titular y puerta. Guardá `utm_*` en cada lead.

## Home: orden y contenido

1. **Hero** (todo visible sin scroll en un celular de 360 px): titular de 8 palabras máximo, una línea de subtítulo, las dos puertas como botones grandes y una línea de prueba («+14 sistemas en producción · 9.188 seguidores»). Variante por tema del Short.
2. **Video de 30 s** de Santiago (poster liviano, sin autoplay con sonido).
3. **Prueba social**: testimonios en video y logos de clientes. Dejá placeholders marcados `TODO-SANTIAGO` donde falte material: nunca inventes testimonios, números ni logos.
4. **Ofertas**: tarjetas de las dos puertas con su escalera.
5. **Casos**: 3 tarjetas con número de resultado (placeholder hasta tener el dato real).
6. **Sobre mí**: los tres oficios (desarrollador, licenciado en marketing digital, coach certificado) en 3 líneas, con foto.
7. **FAQ**: 6 objeciones reales (precio, tiempos, «ya probé y no funcionó», qué pasa después de pagar, factura, cancelación).
8. **Cierre**: las dos puertas de nuevo.

Botón flotante de WhatsApp en el celular, que abre el agente IA con un mensaje precargado según la página.

## Captura y seguimiento

- Extendé la tabla de leads (o creala en `db/schema.sql`): id, fecha, puerta, nombre, mail, whatsapp, respuestas (JSON), resultado, utm_source, utm_medium, utm_campaign, canal, pieza, página de entrada, consentimiento, estado.
- Endpoint `POST /api/lead` con validación, límite de envíos por IP, protección anti-bots sin captcha molesto (honeypot + tiempo mínimo) y respuesta en menos de 300 ms.
- Mails con un proveedor transaccional (Resend; la clave va en una variable de entorno). Secuencia de 5 mails por puerta en `content/emails/` (bienvenida + regalo, historia, caso, objeción, oferta). Escribilos.
- El lead se manda también al evento `Lead` de Meta CAPI (ya existe `lib/meta.js`), con deduplicación contra el píxel.

## Medición

- Plausible o GA4 + Microsoft Clarity, detrás de una variable de entorno cada uno.
- Eventos: `entrada`, `puerta_elegida`, `regalo_iniciado`, `contacto_dejado`, `oferta_vista`, `checkout_iniciado`, `pago_aprobado`, `whatsapp_click`. Todos con la UTM.
- A/B del hero y del regalo con un flag simple (cookie + variante en el evento). Documentá cómo ver los resultados.
- Panel interno simple en `/panel` (protegido): leads por día, por puerta, por `utm_campaign` y conversión por paso.

## Diseño

- Primero el celular. Tipografía grande, mucho aire, un color de acento, botones de 48 px de alto mínimo.
- Una sola acción principal por pantalla.
- Mantené la identidad de Santiago; si no hay una guía de marca en el repo, proponé una paleta y dos fuentes y documentalas en `docs/MARCA.md`.
- Accesibilidad AA: contraste, foco visible, textos alternativos, formularios con label.

## Rendimiento, SEO y escala

- LCP menor a 1,5 s en 4G en el celular, CLS menor a 0,05, JS mínimo en la home. Imágenes AVIF o WebP con tamaños responsivos. Fuentes con `display: swap` y subset.
- Metadatos, Open Graph por página, `sitemap.xml`, `robots.txt`, datos estructurados (Person, Organization, Service, FAQPage, Course).
- Las páginas se sirven estáticas desde la CDN. Webhook de Mercado Pago idempotente. Redirecciones 301 de todas las URLs viejas.
- Correr Lighthouse en celular y pegar los resultados en `docs/REDISENO_PLAN.md`.

## Forma de trabajo

1. Inventario + plan + arquitectura en `docs/REDISENO_PLAN.md`. Mostrá el plan y seguí sin esperar, salvo que una decisión rompa pagos o reservas.
2. Implementá por fases, con un commit por fase y mensajes claros:
   1. bugs,
   2. base y diseño,
   3. home y dos puertas,
   4. captura, mails y medición,
   5. rubros, casos y landings de Shorts,
   6. rendimiento, SEO y QA.
3. Tests mínimos de los endpoints (lead, checkout, webhook) y una prueba de punta a punta de cada embudo en preview.
4. Al final: deploy a preview, link, checklist de lo que falta que ponga Santiago (todos los `TODO-SANTIAGO`) y lista de variables de entorno nuevas.

Reglas: no inventes testimonios, casos, números ni logos; no cambies precios fuera del archivo de configuración; no subas secretos al repo; no deployes a producción sin el OK de Santiago.
