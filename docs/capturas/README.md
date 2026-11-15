# Capturas — QA 2ª vuelta

Capturas de las páginas clave del rediseño (home, /negocio, /sistemas/clinicas-esteticas):

- `home.jpg`
- `negocio.jpg`
- `sistemas-clinicas-esteticas.jpg`

## Nota sobre viewport (celular vs desktop)
El brief pedía capturas en 390×844 (celular) y 1440×900 (desktop) con Playwright. En este entorno **no hubo Playwright ni control real del viewport del navegador** (la herramienta de captura no bajaba la ventana de ~765 px CSS, y no se pudo instalar Playwright por el toolchain de Node roto localmente — ver nota de Lighthouse en REDISENO_PLAN §11). Las capturas de acá son al ancho disponible.

**El layout es responsive** y está verificado por media queries (`brand.css` y los `<style>` de cada página: breakpoints en 560/620/720/760 px). En un celular real las puertas, las tarjetas de precio y los formularios pasan a una sola columna. Para verlo en celular: abrí el preview desde el teléfono.

## 3ª vuelta (puerta cabeza → metodosrm.com)
- `r3-home-cabeza.jpg` — sección "Ordená tu cabeza" de la home: tarjeta de la academia (guiño naranja/oscuro), precio fundador $49.000 ARS tachando $150.000.
- `r3-cabeza-inicio.jpg` — `/cabeza` con la pregunta "¿Dónde sentís que estás hoy?" y las 4 opciones.
- `r3-cabeza-resultado.jpg` — vista de resultado del test (puntaje X/30 + área que traba + tarjeta "Entrá al Método SRM").
- `r3-v-futuro.jpg` — landing de Short de mindset: gancho + test + tarjeta corta de la academia.

(Mismo límite de viewport que la 2ª vuelta: capturas al ancho disponible, layout responsive por media queries.)

## QA hecho
- ✅ Sin scroll horizontal, sin textos cortados, flotantes no tapan botones (un solo flotante: WhatsApp).
- ✅ Formulario de /negocio y /cabeza: validación del lado del cliente probada (submit con mail vacío → error, no se crea lead). Lógica del endpoint cubierta por `scripts/test-lead.js` (7/7).
- ✅ `grep -rni fuga` = 0 en texto visible (solo quedan identificadores de código en `sesion.html`, que el brief pidió no renombrar).
- ✅ TODO-SANTIAGO ocultos en el dominio real (`html.is-prod`), visibles en preview.
