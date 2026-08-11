# Setup — Tienda + Bookings + Mercado Pago + Meta CAPI

Guía para dejar todo operativo antes de lanzar la campaña de Meta Ads (Conversión).

## Arquitectura

- **Frontend estático** en `public/` (se conserva la UI hecha a mano).
- **Vercel Functions** en `api/` (Node) para checkout, webhook, bookings y CAPI.
- **Neon Postgres** para órdenes y reservas.
- **Fuente única de precios** en `public/shared/pricing.js` (la usan el navegador y el server).

```
Cotizador → "Reservar con seña" → /api/checkout → Checkout Pro (MP)
   → pago → /api/mp-webhook (valida firma, consulta pago, si approved) → Purchase (CAPI)
   → back_url /gracias.html → Purchase (Pixel, mismo event_id) → deduplicado
```

## 1. Instalar dependencias

```bash
npm install
```

## 2. Base de datos (Neon Postgres)

1. Provisionar Neon desde el Vercel Marketplace (queda `DATABASE_URL` en el proyecto).
2. Crear las tablas:
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```

## 3. Variables de entorno

Copiar `.env.example` como referencia y cargar cada variable en Vercel (Production/Preview/Development):

```bash
vercel env add MP_ACCESS_TOKEN
vercel env add MP_WEBHOOK_SECRET
# ... (ver .env.example para la lista completa)
```

Para probar en local: `vercel env pull .env.local` y luego `vercel dev`.

## 4. Mercado Pago

1. Credenciales en el panel de desarrolladores → `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`.
2. Configurar **Webhooks** apuntando a: `https://TU-DOMINIO/api/mp-webhook` (evento: *Pagos*).
3. Copiar la **clave secreta** del webhook → `MP_WEBHOOK_SECRET`.
4. Definir moneda: `MP_CURRENCY=ARS` + `USD_ARS_RATE` (o `USD`).
5. Probar con **credenciales de TEST** y tarjetas de prueba antes de pasar a producción.

## 5. Meta (Pixel + Conversions API)

1. Elegir **un** dataset canónico. Hoy el sitio inicializa 2 pixels
   (`1419051696174763` y `521139968588985`) — decidir cuál queda y usar ese id en
   `META_PIXEL_ID`. El CAPI y el Pixel del navegador deben apuntar al mismo dataset
   para que la deduplicación funcione.
2. Generar el **token de Conversions API** → `META_CAPI_ACCESS_TOKEN`.
3. **Verificar el dominio** en Meta Business.
4. Configurar **priorización de eventos web** (AEM) con `Purchase` como evento #1.
5. Para testear: usar el **Test Events code** en `META_TEST_EVENT_CODE`.

## 6. Google Calendar (bookings)

1. Crear una **service account** en Google Cloud con la API de Calendar habilitada.
2. Compartir tu calendario con el `client_email` de la service account (permiso "hacer cambios en eventos").
3. Cargar `GOOGLE_SERVICE_ACCOUNT_JSON` (el JSON completo) y `GOOGLE_CALENDAR_ID`.

## 7. Deploy

```bash
vercel --prod
```

## 8. Verificación end-to-end

- **Pago**: configurar un proyecto en `/app/` → "Reservar con seña" → pagar con tarjeta de test →
  llegar a `/gracias.html`. En la DB, la `order` queda `status=approved` (una sola vez).
- **Webhook**: revisar logs de `/api/mp-webhook` — firma válida, `approved`, Purchase enviado.
- **Dedup**: en **Meta Events Manager**, `Purchase` aparece por *Browser* y *Server* con el mismo
  `event_id` y estado **Deduplicado**.
- **Booking**: reservar en `/reservar.html` → pagar → evento creado en Google Calendar; el slot
  no se puede reservar dos veces.

## Checklist de lanzamiento de campaña

- [ ] Dominio verificado en Meta.
- [ ] `Purchase` como evento prioritario en AEM.
- [ ] CAPI enviando `Purchase` + `InitiateCheckout` (verificado en Test Events).
- [ ] Credenciales de MP en **producción**.
- [ ] Objetivo de la campaña: **Conversión / Purchase**.
- [ ] Creatividades + público + presupuesto definidos.

## Eventos de tracking

| Evento            | Dónde se dispara                         | Pixel | CAPI |
|-------------------|------------------------------------------|:-----:|:----:|
| PageView          | todas las páginas                        | ✔     |      |
| ViewContent       | elegir servicio en `/app/`, `/reservar`  | ✔     |      |
| InitiateCheckout  | click en "Reservar" / "Reservar y pagar" | ✔     | ✔    |
| Purchase          | `/gracias.html` + webhook aprobado       | ✔     | ✔    |
| Lead / Contact    | CTAs a WhatsApp en la landing            | ✔     |      |
