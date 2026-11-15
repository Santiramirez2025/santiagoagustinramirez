# Marca — Santiago Ramírez

> Identidad: Instrument Serif + Instrument Sans, verde bosque y papel crema. En la 2ª vuelta **se subió el contraste**: papel más claro, tarjetas casi blancas con sombra, una banda oscura por página y un solo color de CTA. El sistema vive en `public/shared/brand.css`.

## Paleta

### Tema claro (por defecto)
| Rol | Variable | Valor |
| --- | --- | --- |
| Fondo base (papel) | `--paper` | `#F6F2EA` |
| Papel 2 (bandas suaves) | `--paper-2` | `#EFE9DC` |
| **Tarjetas** | `--card` | `#FFFDF8` |
| Verde bosque (banda oscura) | `--forest` | `#0F2C20` |
| Texto sobre bosque | `--on-forest` | `#F3EFE5` |
| Tinta (texto) | `--ink` | `#17140E` |
| Tinta suave | `--ink-soft` | `#3A352B` |
| Apagado | `--muted` | `#6E685A` |
| **CTA (verde señal)** | `--signal` | `#0E9E64` |
| CTA hover | `--signal-dark` | `#0A7B4E` |
| Tinta señal | `--signal-ink` | `#0B6B45` |
| Acento cálido (precios/recomendado) | `--amber` | `#E8A33D` |
| Acento ember (uso mínimo) | `--ember` | `#E8552B` |
| Líneas | `--line` / `--line-2` | `rgba(23,20,14,.10)` / `.18` |
| Sombra | `--shadow` | `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)` |

### Tema oscuro
Papel `#12100D`, tarjetas `#1E1A15`, bosque `#163A2B`, tinta `#F1ECE0`, señal `#25B87C`. Funciona con la paleta nueva (se mantuvo el toggle y `prefers-color-scheme`).

## Reglas de color
- **Un solo color de CTA en todo el sitio:** verde señal (`--signal`), texto oscuro/blanco, hover más oscuro (`--signal-dark`).
- **Ámbar** (`--amber`) **con mesura**, solo para destacar precios o la tarjeta "Recomendado".
- **Secciones alternadas:** papel → blanco (`.section--white`) → una banda oscura verde bosque (`.section--dark`) por página como ancla visual (hero o "Cómo funciona").

## Tipografía
- Títulos/display: `--serif` (Instrument Serif). **Cursiva solo en la palabra clave** de cada titular.
- Cuerpo/UI: `--sans` (Instrument Sans). 18 px desktop, 17 px celular, interlineado 1,5.
- Escala con contraste: **H1** `clamp(40px,7vw,76px)` · **H2** `clamp(28px,4vw,44px)` · **H3** `clamp(21px,2.4vw,27px)`.
- Fuentes como archivo (`/fonts/*.woff2`, `display:swap`, cache 1 año).

## Componentes (en `brand.css`)
- `.door`: tarjeta de puerta grande (≥200 px alto), ícono, título grande, resultado 1 línea, flecha, hover con elevación. `.emph` la resalta (variante por Short).
- `.tiers` / `.tier.pop`: tarjetas de precio, la del medio con borde ámbar + etiqueta "Recomendado", precio grande y lista con checks.
- `.card`: superficie blanca con sombra suave.
- `.btn.btn-cta`: el único CTA. `.btn-ghost`: secundario.
- `.chip`: rubros.
- `.faq details`: acordeón con +/−.

## Espaciado y layout
- Ritmo de 8 px. Secciones: **64 px** en celular, **112 px** en desktop.
- Sin bloques vacíos arriba de los formularios: el formulario arranca en la primera pantalla.
- `max-width` de contenido: 1100 px.

## Flotantes
- **Solo WhatsApp** (`.wa-dock`). Se sacaron el chat-asistente y el chip "Instalar app" como flotantes siempre visibles; el aviso de instalar app aparece recién en la 2ª visita.

## Placeholders
- `.todo-santi`: visible solo en preview. En el dominio real (`santiagoagustinramirez.com`) se agrega `html.is-prod` por un inline temprano y se ocultan (`.is-prod .todo-santi{display:none}`).

## Voz y logo
- Marca denominativa **Santiago Ramírez** + punto verde.
- Voz: rioplatense, voseo, directo y cálido, con humor cuando entra. Beneficio antes que función.
- Ubicación: **Córdoba, Argentina**. WhatsApp: +54 9 3536 561265.
