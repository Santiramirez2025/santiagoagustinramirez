# TODO-SANTIAGO — qué falta que pongas vos

> Rama `rediseno` (7 commits). **Nada tocó producción** (`main` intacto).
> Preview: **https://santiagoagustinramirez-git-rediseno-santiagos-projects-d0dc89d2.vercel.app**
> (Alias estable de la rama: siempre apunta al último commit. Está detrás del login de Vercel: abrilo logueado con tu cuenta.)

---

## 1. Contenido real que falta cargar (no inventé nada)

- [ ] **Testimonios en video y logos de clientes** para la prueba social. Hoy hay placeholders marcados en la home.
- [ ] **Casos con números reales** (3): Acopio Saludable (agentes IA), Azul Colchones, FerGym (turnos). Las páginas `/casos/[slug]` existen con antes/después; falta el **número de resultado** real de cada uno (horas recuperadas, % de mejora, etc.).
- [ ] **Demo de cada rubro** (6): clínicas estéticas, dentales, gimnasios, cabañas, concesionarias, pádel. Cada `/sistemas/[rubro]` tiene su landing; falta el **video o enlace de la demo**. Cargalo en `public/config/ofertas.json` (campo `demo` de cada rubro) y re-generá con `node scripts/gen-pages.js`.
- [ ] **Muestra del documento del Diagnóstico** (con datos del cliente tapados) para mostrar en `/diagnostico` y `/negocio`.
- [ ] **Video de 30 s** tuyo para la home (poster liviano, sin autoplay con sonido).
- [ ] **Foto** para la sección "Sobre mí".
- [ ] **Casos en los mails**: `content/emails/negocio/03-caso.md` y `cabeza/03-caso.md` tienen el lugar del caso real marcado.

## 2. Decisiones tuyas

- [ ] **Precios**: todos los del rediseño están marcados *provisorios* en `public/config/ofertas.json`. Confirmá o ajustá (instalación 690/1.290/2.490 + abono 79/149/249; Método SRM 19/97/19; mentoría 49). El Diagnóstico (USD 75) y el cotizador `/app` usan los precios que ya cobrás hoy, no se tocaron.
- [ ] **Test del Método SRM**: hoy `/cabeza` enlaza a `metodo-srm.vercel.app`. Decidí si lo traés al dominio o lo dejás enlazado con el contacto ya guardado.
- [ ] **Mapeo tema→puerta de los Shorts** (provisorio): mindset/nostalgia → `cabeza`; negocio → `negocio`. Está en `public/shared/analytics.js` (`parseCampaign`) y en el script del hero de `public/index.html`. Si querés cambiar qué prefijo va a qué puerta, se edita ahí.
- [ ] **Selector ES/EN**: lo dejé **funcionando** (tiene traducción real en todo el sitio). El brief pedía sacarlo "hasta que exista", pero ya existe. Si igual lo querés sacar, avisá.

## 3. Variables de entorno nuevas (cargar en Vercel · Production/Preview)

| Variable | Para qué | Estado |
| --- | --- | --- |
| `RESEND_API_KEY` | Envío de los 5 mails por puerta (el contenido ya está en `content/emails/`; falta cablear el envío) | **Falta** |
| `STATS_TOKEN` | Ya lo usan `/api/stats` y `/api/orders` (panel y centro) | Verificá que esté seteada |
| `META_TEST_EVENT_CODE` | Pruebas de Meta CAPI | Opcional |

El A/B no necesita variable: la variante se asigna sola por visitante (cookie `_srm_ab`) y viaja en `meta.ab` de cada evento.

## 4. Pendiente de fases siguientes (no bloquea el preview)

- [ ] **Cablear el envío de mails** (Resend) desde `api/lead.js` tras guardar el lead, con la cadencia de `content/emails/`.
- [ ] **Auditoría de negocio con IA**: hoy `/negocio` devuelve el **costo anual real** (aritmética, no inventado) + las 3 fugas como teaser del Diagnóstico. El brief pedía que la API de Anthropic redacte las 3 fugas en pantalla: queda como mejora (ya existe `ANTHROPIC_API_KEY` y `lib/assistant.js`).
- [ ] **Fundir el pitch viejo** de `diagnostico.html` (quedó en el historial de git) dentro del `/diagnostico` canónico, si querés más copy de venta arriba del motor de reserva.
- [ ] **Panel `/panel`**: extenderlo para mostrar leads por día, por puerta y por `utm_campaign`, y conversión por paso (los datos ya se guardan).
- [ ] **Lighthouse móvil** del preview: no pude correrlo acá (faltan `node_modules`/CLI en tu entorno local). Corré en el preview y pegá los números en `docs/REDISENO_PLAN.md` §11. Objetivo: LCP < 1,5 s, CLS < 0,05.
- [ ] **Reordenar la home** completa al orden del brief (video → prueba social → ofertas → sobre mí → FAQ → cierre): hoy el hero de dos puertas ya abre arriba; debajo quedó el sitio actual funcionando.

## 4b. Pendientes de la 2ª vuelta (copy, concepto y diseño)

- [ ] **Lighthouse móvil**: no se pudo correr (en tu máquina el toolchain de Node/npm está roto: `nvm` sin módulos globales, y no hay Playwright). Corré `npx lighthouse` contra el preview con un Protection Bypass, o `nvm install 20 && nvm use 20` y `npm i -g lighthouse`. Objetivo: Performance ≥ 90, LCP < 1,5 s. Pegalo en `REDISENO_PLAN.md` §11.
- [ ] **Capturas 390×844 reales**: entregué 3 (home, /negocio, /sistemas/clinicas-esteticas) en `docs/capturas/` al ancho que permitía el entorno (no había control de viewport ni Playwright). El layout es responsive (media queries); verificá en tu celular desde el preview.
- [ ] **Concepto "Radiografía"**: implementado en todo el sitio. Dos alternativas por si querés cambiarlo: *Rayos X de tu negocio* / *Chequeo de tu negocio* (ver `REDISENO_PLAN.md` §2b).
- [ ] **sesion.html**: la consola interna sigue con los identificadores de código `.fuga`/`FUGAS` (el brief pidió tocar solo textos ahí). Los textos visibles ya dicen "Radiografía / Punto N". Si querés, en otra pasada se renombran los identificadores internos.
- [ ] **Confirmar** el nuevo H1, los titulares por tema del Short y los 10 mails reescritos (`content/emails/`).

## 5. Para ir a producción

Cuando lo apruebes: merge de `rediseno` a `main` (o promover el deployment en Vercel). Antes de eso, cargá las variables de entorno nuevas y revisá los precios provisorios.

---

### Cómo probar el embudo en el preview (logueado en Vercel)
1. Entrá con una UTM de Short, ej. `…/?utm_campaign=pieza_N2a_ch05` → el hero cambia el titular y resalta la puerta Negocio.
2. `/negocio` → completá la auditoría → ves tu costo anual real y las ofertas.
3. `/cabeza` → mini-test → tu etapa + el Método SRM.
4. `/reservar.html` y `/diagnostico.html` redirigen 301 a `/diagnostico` (motor de reserva intacto).
5. Pagos y reservas: no se tocaron. El cotizador `/app`, `/turnos`, `/panel`, `/centro` siguen igual.
