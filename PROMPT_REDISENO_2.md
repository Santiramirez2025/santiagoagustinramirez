# Rediseño · segunda vuelta: copy, concepto y diseño

Revisé el preview de punta a punta (home, /negocio, /cabeza, /sistemas/clinicas-esteticas, /v/futuro, /diagnostico). La base técnica está bien: no hay errores de consola, el hero cambia según `utm_campaign` y pagos y reservas siguen intactos. Esta vuelta es de **copy, concepto y diseño**. Seguí en la rama `rediseno`, hacé un commit por bloque y deployá solo a preview.

## 1. Fuera «las 3 fugas», en todo el sitio

A Santiago no le gusta. El concepto nuevo es **«la Radiografía de tu negocio»**: en 2 minutos ves dónde se te va el tiempo y la plata y qué conviene arreglar primero. Es positivo, da curiosidad y no supone que el negocio está roto.

- Auditoría gratis → **Radiografía gratis de tu negocio**. Botón: «Quiero mi radiografía →». Resultado: «Tu radiografía» con 3 bloques: dónde se te va el tiempo, cuánto te cuesta por año y por dónde empezar.
- Diagnóstico de USD 75 → **Plan Negocio Ordenado**: sesión 1:1 de 90 minutos + plan escrito de 90 días, con precio y plazo para cada paso.
- Reemplazá «fuga/fugas» en todos los archivos. Hoy aparece en: `public/sesion.html` (10), `public/negocio/index.html` (8), `public/diagnostico/index.html` (5), `public/index.html` (3), `public/shared/assistant.js` (2), las 6 páginas de `public/v/*`, `public/cuestionario.html`, 4 mails de `content/emails/negocio/` y `api/mp-webhook.js`. En `mp-webhook.js` y `sesion.html` cambiá **solo textos**: ni lógica, ni nombres de campos, ni contratos.
- Si encontrás un nombre mejor que «Radiografía», proponelo en `docs/REDISENO_PLAN.md` con 2 alternativas, pero implementá Radiografía.

## 2. La home es dos webs pegadas: unificarla

Hoy el bloque nuevo de dos puertas quedó **arriba de la home vieja entera**. Hay dos H1 («Ordená tu cabeza o tu negocio» y «Ordeno, digitalizo y hago crecer tu negocio»), dos heroes, el asistente de 4 pasos, el menú viejo de 17 servicios y el bloque de Instagram. Lo nuevo (sistema por rubro con abono y Método SRM digital) no aparece en la home.

Rearmala con **un solo H1** y este orden:

1. **Hero:** titular fuerte + subtítulo + las dos puertas como tarjetas grandes y clicables (toda la tarjeta es el link), con una línea de prueba.
2. **Cómo funciona,** en 3 pasos: elegís puerta → recibís tu resultado gratis → si querés, te ayudo a implementarlo.
3. **Puerta Tu negocio:** el sistema por rubro (escalera de 3 opciones resumida y los 6 rubros como chips).
4. **Puerta Tu cabeza:** Método SRM (desafío, curso y comunidad).
5. **Trabajos reales:** los 6 actuales, como prueba.
6. **Sobre mí,** corto: los tres oficios y foto.
7. **Testimonios:** placeholder `TODO-SANTIAGO` visible solo en preview.
8. **Preguntas frecuentes:** 6, con respuesta.
9. **Cierre** con las dos puertas.

Fuera de la home: el asistente de 4 pasos (su lógica queda en /negocio si suma; si no, en /cotizador), el menú de 17 servicios (pasa a una página `/servicios`, enlazada desde el footer y desde el cotizador) y el bloque de Instagram (queda como link en el footer). Variantes por `utm_campaign`: que cada titular sea específico del tema del Short, no genérico («Tu rubro, resuelto» es débil).

## 3. Copy: mucho mejor

Reescribí **todos** los textos del sitio y de los 10 mails con estas reglas:

- Español rioplatense con voseo, como habla Santiago: directo, cálido, con humor cuando entra. Nada de frases de agencia.
- **Beneficio antes que función.** Concreto: números, tiempos, ejemplos del día a día del rubro («la clienta que te escribe a las 23 para un turno»).
- **Titulares** de 4 a 9 palabras, con tensión o curiosidad. Subtítulos de 1 o 2 líneas.
- **Botones en primera persona** que dicen qué recibe: «Quiero mi radiografía», «Hacer el test (2 min)», «Ver precios de mi rubro».
- Sacá etiquetas sin sentido («Mindset», «Negocio» como títulos de tarjeta). Reemplazalas por la promesa: «Ordená tu cabeza» y «Ordená tu negocio», cada una con su resultado.
- Cada página tiene que responder: qué es, para quién, qué gano, cuánto cuesta, por qué confiar y qué hago ahora.
- Garantía del Plan Negocio Ordenado concreta: «Si no te sirvió, te devuelvo los USD 75 dentro de los 7 días. Me escribís por WhatsApp y listo».
- Ubicación: «Córdoba, Argentina» (no «Villa María»).
- Moneda consistente: si un formulario pide montos, que pida en la misma moneda en la que muestra el resultado y que lo aclare. Hoy /negocio pide USD y /diagnostico pide pesos.
- /cabeza: 3 preguntas es poco para prometer «en qué etapa estás». Subilo a 6 o 7 (una por módulo del Método SRM: mindset, nicho, especialista, oferta, ejecución y entorno) con un resultado que valga la pena compartir.
- /v/[tema]: cada landing de Short tiene que continuar el video. Una línea que retome la frase del Short, el regalo y una prueba social que sirva a ese público (en las de mindset no va «+14 sistemas en producción»).
- Escribí el copy final en `docs/COPY.md` (página por página) antes de implementarlo, y después pasalo al HTML.

## 4. Diseño y colores: más contraste, más jerarquía

Hoy todo es beige sobre beige: las tarjetas tienen casi el mismo color que el fondo, sobra espacio vacío arriba de los formularios de /negocio y /cabeza, y nada destaca.

Paleta: mantené la identidad (Instrument Serif + Instrument Sans, verde bosque, papel crema) pero subí el contraste.

- **Fondo base:** papel más claro (`#F6F2EA`). **Tarjetas:** blancas o `#FFFDF8`, con borde sutil y sombra suave (por ejemplo `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`).
- **Secciones alternadas:** papel, blanco y una banda oscura en verde bosque `#0F2C20` con texto claro, para el hero o para «Cómo funciona». Una sección oscura por página como ancla visual.
- **CTA principal:** verde señal `#0E9E64` con texto blanco y hover más oscuro. Un solo color de CTA en todo el sitio. Para destacar precios o «recomendado», usá un acento cálido (ámbar `#E8A33D` o ember `#E8552B`) con mucha mesura.
- **Tipografía:** escala más grande y con más contraste de tamaños: H1 `clamp(40px, 7vw, 76px)`, H2 `clamp(28px, 4vw, 44px)`, cuerpo 18 px en desktop y 17 px en celular, interlineado 1,5. Cursiva de Instrument Serif solo en la palabra clave de cada titular.
- **Puertas del hero:** tarjetas grandes (mínimo 180 px de alto en el celular), con ícono o ilustración simple, título grande, resultado en una línea y flecha. Hover con elevación.
- **Precios:** tarjetas con la del medio destacada (borde de color + etiqueta «Recomendado»), precio grande y lista con checks.
- **Espaciado:** ritmo de 8 px, secciones con 96-120 px en desktop y 64 px en celular. Sin bloques vacíos arriba de los formularios: el formulario empieza en la primera pantalla.
- **Flotantes:** hoy hay tres a la vez (asistente, WhatsApp y «Instalar app») y en el celular tapan contenido. Dejá solo WhatsApp, y el aviso de instalar app recién en la segunda visita.
- Modo oscuro: que siga andando con la paleta nueva.
- Actualizá `docs/MARCA.md` con la paleta y las reglas nuevas.

## 5. Control de calidad antes de avisarme

- Recorré con Playwright cada página en 390×844 y en 1440×900 y guardá capturas en `docs/capturas/` (antes y después). Revisá que no haya scroll horizontal, textos cortados ni flotantes encima de botones.
- Probá los formularios de /negocio, /cabeza y el checkout en modo prueba, **sin crear leads reales**: usá un mail de prueba y marcá el lead como test, o mockeá el endpoint.
- Lighthouse: arreglá node con `nvm install 20 && nvm use 20` y corré `npx lighthouse` contra el preview usando un bypass de protección de Vercel (Protection Bypass for Automation) o contra `vercel dev` local. Pegá los resultados de celular en el plan. Objetivo: Performance 90 o más, LCP menor a 1,5 s.
- Confirmá que no quede ninguna «fuga» con `grep -rni "fuga" public api lib content`.
- `TODO-SANTIAGO` visibles solo en preview, nunca en producción (que se oculten si el host es el dominio real).

Al terminar: link de preview, 6 capturas clave (home, /negocio y /sistemas/clinicas-esteticas, en celular y en desktop), resumen de 10 líneas de qué cambió y la lista de pendientes míos. No deployes a producción.
