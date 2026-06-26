# Plan de integración — Google Play Billing (PRO en Android)

**Fecha:** 26 de junio de 2026
**Decisión tomada:** cobrar el plan PRO **dentro de la app Android con Google Play Billing**. PayPal/Mercado Pago siguen válidos **solo en la web** (fuera de la app).

> Regla de Google: las suscripciones digitales compradas *dentro* de la app deben usar Play Billing. No se permite PayPal/MP ni enlaces a pago externo dentro de la app Android.

---

## 1. Dependencia de orden (importante)

Play Billing **no puede funcionar ni probarse** sin la app empaquetada (#10): la compra usa la **Digital Goods API + PaymentRequest** con el método `https://play.google.com/billing`, que solo existe dentro de una **TWA instalada desde Google Play**. En el navegador web normal esa API no está disponible (el código debe detectarlo y no mostrar el botón).

**Orden recomendado:**
1. **#10 — Empaquetar la TWA** (Bubblewrap) con Play Billing habilitado + `assetlinks.json`.
2. **Play Console** — crear la app y el/los producto(s) de suscripción.
3. **Credenciales** — Service Account de Google Cloud con acceso a la Play Developer API.
4. **Código de billing** (frontend + backend) — lo implemento yo, leyendo todo de variables de entorno.

---

## 2. Qué debes proveer tú (no está ni puede estar en el código)

- **Cuenta de Google Play Console** (pago único de USD 25) y la app creada.
- **Producto(s) de suscripción** en Play Console. Propuesta:
  - Product ID: `pro` · Base plan: `pro-mensual` (renovación mensual) · precio en tu moneda.
- **Proyecto de Google Cloud** + **Service Account** con permiso sobre la *Google Play Android Publisher API*, y su **clave JSON** (secreto). Irá en variables de entorno (NUNCA en el repo):
  - `GOOGLE_PLAY_PACKAGE_NAME` (ej. `club.barberia.app`)
  - `GOOGLE_PLAY_SA_EMAIL`
  - `GOOGLE_PLAY_SA_PRIVATE_KEY`
- **Pub/Sub** para *Real-time Developer Notifications* (RTDN): un topic + suscripción "push" apuntando a `/api/play/rtdn` (equivalente a los webhooks actuales de PayPal/MP, para renovaciones y cancelaciones).
- La **TWA firmada** subida a Play (de #10): la Digital Goods API solo funciona en la app instalada desde Play.

---

## 3. Qué implemento yo (inerte hasta que esté configurado)

Todo el código queda **desactivado por defecto**: en web no aparece el botón (feature-detection) y el backend responde "no configurado" si faltan las variables de entorno. Así no rompe producción mientras preparas Play Console.

1. **`src/lib/play-billing.ts`** — verificación de un `purchaseToken` contra la Play Developer API (lee las env de arriba). Si faltan, lanza "no configurado".
2. **`src/app/api/play/verify/route.ts`** — POST `{ purchaseToken, productId, slug }`: valida que la barbería sea del usuario, verifica la compra con Google y, si es válida, pone la barbería en **PRO** + crea `Payment` (método `GOOGLE_PLAY`). Espeja la lógica del webhook de PayPal.
3. **`src/app/api/play/rtdn/route.ts`** — webhook RTDN (Pub/Sub push): renovaciones → extiende `expiresAt`; cancelación/expiración → vuelve a FREE. Reutiliza `onReferredProPayment` / `onReferredCancelled`.
4. **Frontend (cliente):** módulo que detecta la Digital Goods API; si está disponible (solo en la TWA), muestra el botón "Suscribirme con Google Play" en `/planes` y `/mi-plan`; lanza el `PaymentRequest` y envía el token a `/api/play/verify`. En web no se renderiza.
5. **Mapeo de modelo:** se reutiliza el esquema actual (`plan`, `expiresAt`, `Payment`); se añade el método `GOOGLE_PLAY`. No requiere migración.

---

## 4. Lo que NO cambia

- La web sigue cobrando con PayPal/Mercado Pago como hoy.
- El esquema de Prisma no necesita migración (se reutilizan `plan`/`expiresAt`/`Payment`).
- Los webhooks actuales de PayPal/MP quedan intactos.

---

## 5. Estado

- [ ] #10 TWA (prerequisito) — pendiente
- [ ] Producto de suscripción en Play Console — tú
- [ ] Service Account + env — tú
- [ ] Pub/Sub RTDN — tú
- [ ] Código frontend + backend de billing — yo (inerte hasta configurar)
