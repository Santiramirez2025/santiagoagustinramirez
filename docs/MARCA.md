# Marca — Santiago Ramírez

> Esta guía **documenta** la identidad que ya vive en el sitio (`public/index.html`). No se inventó marca nueva; se extrajeron los valores reales del CSS en producción para poder reusarlos de forma consistente en las páginas nuevas del rediseño.

## Paleta

El sitio es *theme-aware* (claro/oscuro). El tema se guarda en `localStorage('srm-theme')` y por defecto sigue `prefers-color-scheme`.

### Tema claro (por defecto)
| Rol | Variable | Valor |
| --- | --- | --- |
| Fondo papel | `--paper` | `#ECE7DA` |
| Papel 2 / 3 | `--paper-2` / `--paper-3` | `#E3DCCB` / `#D9D1BD` |
| Tinta (texto) | `--ink` | `#17140E` |
| Tinta suave | `--ink-soft` | `#3A352B` |
| Apagado (secundario) | `--muted` | `#6E685A` |
| Verde bosque (primario) | `--forest` | `#0F2C20` |
| Bosque 2 | `--forest-2` | `#17402F` |
| Verde señal (acento) | `--signal` | `#0E9E64` |
| Tinta señal | `--signal-ink` | `#0B6B45` |
| Sobre bosque | `--on-forest` | `#E9E4D6` |
| Líneas | `--line` / `--line-2` | `rgba(23,20,14,.14)` / `rgba(23,20,14,.26)` |

### Tema oscuro
| Rol | Valor |
| --- | --- |
| `--paper` | `#141210` |
| `--paper-2` / `--paper-3` | `#1D1915` / `#26211B` |
| `--ink` | `#EDE8DC` |
| `--ink-soft` | `#CFC8B8` |
| `--muted` | `#9A9182` |
| `--forest` | `#163A2B` |
| `--forest-2` | `#1E4A37` |
| `--signal` | `#25B87C` |
| `--signal-ink` | `#8CDCB8` |
| `--on-forest` | `#E9E4D6` |

**Color de acento único:** el verde señal (`--signal`). Se usa para el CTA principal y marcadores. El verde bosque es el color de superficie "fuerte" (botones primarios, secciones destacadas). El papel crema es la base cálida de todo el sitio.

## Tipografía

Dos familias, ambas embebidas como woff2 base64 con `font-display: swap`:

- **Títulos / display:** `--serif: "Instrument Serif", Georgia, "Times New Roman", serif` — peso 400, se usa en cursiva para énfasis (ej. *crecer*, *construye*).
- **Cuerpo / UI:** `--sans: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.

> Las páginas nuevas reusan estas mismas `@font-face` (o un partial compartido) para no re-descargar fuentes ni romper el look.

## Reglas de UI (rediseño mobile-first)

- Una sola acción principal por pantalla.
- Botones de alto mínimo **48 px**, radios redondeados (`999px` en píldoras), foco visible.
- Tipografía grande y mucho aire; `clamp()` para escalar en móvil.
- Contraste AA: verde bosque sobre papel y `--on-forest` sobre bosque cumplen; verificar cada combinación nueva.
- Formato de precio: **`USD 690`** (sin símbolo `$`, para no duplicar la moneda).
- Textos alternativos en imágenes, `label` en todos los campos de formulario.

## Logo y voz

- Marca denominativa: **Santiago Ramírez** + punto de acento (`.`).
- Voz: español rioplatense, voseo, directo, sin relleno. (Ej.: "Ordeno, digitalizo y hago *crecer* tu negocio.")
- Teléfono/WhatsApp de marca: `+54 9 3536 561265`.
