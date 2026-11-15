# Secuencias de mail por puerta

5 mails por puerta, en orden. Se disparan desde `/api/lead` cuando alguien deja su contacto (campo `puerta`). El proveedor transaccional es **Resend** (clave en `RESEND_API_KEY`, por entorno). El envío todavía no está cableado: esto es el **contenido** listo para cargar.

- Cadencia sugerida: día 0 (inmediato, con el regalo), día 1, día 3, día 5, día 7.
- Voz: español rioplatense, voseo, directo, sin relleno.
- `{{nombre}}` es opcional (puede faltar); los mails funcionan igual sin él.
- No se inventan testimonios, números ni casos: donde haga falta un dato real va `TODO-SANTIAGO`.
- Todos cierran con el link de baja (lo agrega Resend) y el WhatsApp.

| Puerta | Archivos |
| --- | --- |
| negocio | `negocio/01-bienvenida.md` … `05-oferta.md` |
| cabeza  | `cabeza/01-bienvenida.md` … `05-oferta.md` |

## Cómo se cablea (pendiente, ver REDISENO_PLAN fase 4)
En `api/lead.js`, tras guardar el lead, encolar el mail 1 vía Resend y programar el resto (cron o Resend scheduling). Guardar en la tabla `leads.estado` el avance de la secuencia.
