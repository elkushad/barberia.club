# Auditoría técnica de cumplimiento — Google Play Store

**Proyecto:** barberia.club
**Fecha:** 2026-06-22
**Alcance:** Análisis exhaustivo del código y configuración actuales para preparar la publicación en Google Play. **Este documento NO contiene textos legales**: describe cómo funciona realmente el sistema y qué falta para cumplir con las políticas de Google Play (Privacy Policy, Data Safety, eliminación de cuentas, consentimientos, etc.).

> Fuente: revisión del repositorio (Next.js 16, Prisma/PostgreSQL, NextAuth, Vercel Blob). Producción corre en Supabase. No existe todavía empaquetado Android (TWA/Capacitor/Bubblewrap) — ver §13.

---

## 1. Resumen ejecutivo

barberia.club es una plataforma web (PWA candidata a TWA) de fidelización para barberías. Hay **dos tipos de usuario** con flujos y datos muy distintos:

1. **Dueños de barbería (OWNER / ADMIN)** — se registran con email + contraseña, gestionan su negocio, pagan suscripción PRO y participan en un programa de referidos con recompensas en dinero (S/).
2. **Clientes finales** — NO crean cuenta con contraseña; se "registran" en la landing de una barbería dejando **nombre + número de teléfono**. Se identifican por teléfono.

El sistema **recopila datos personales de terceros** (los clientes finales de cada barbería) además de los datos de los dueños. Esto es relevante para Google Play: la app maneja datos personales y de contacto, hay seguimiento publicitario activo (GA4 + Meta Pixel + TikTok Pixel) y pagos.

**Conclusión de cumplimiento:** el proyecto **NO está listo** para publicarse. Faltan, como mínimo: páginas legales reales (hoy enlazan a `#`), mecanismo de eliminación de cuenta self-service, gestión de consentimiento para los pixeles de tracking, y la ficha de Data Safety. Detalle en §11–§12.

---

## 2. Datos personales recopilados

### 2.1 Dueños de barbería (`User` + `Barbershop`)
| Dato | Dónde | Obligatorio | Notas |
|------|-------|-------------|-------|
| Nombre del barbero | `User.name`, `Barbershop.name` | Sí | También se usa para generar el `slug` público |
| Email | `User.email` (único) | Sí | Credencial de login |
| Contraseña | `User.password` | Sí | Hasheada con **bcrypt** (cost 10) — ✅ nunca en texto plano |
| WhatsApp | `Barbershop.whatsapp` | Sí | Teléfono de contacto del negocio |
| Dirección | `Barbershop.address` | No | Texto libre; se expone públicamente y se enlaza a Google Maps (§6) |
| Redes sociales | `instagram`, `tiktok`, `facebook` | No | Públicas en la landing |
| Logo / banner / descripción | `logo`, `banner`, `description` | No | Imágenes subidas a Vercel Blob (público) |
| Datos de plan/pago | `plan`, `expiresAt`, `paypalSubscriptionId`, `Payment[]` | — | Ver §5 |

### 2.2 Clientes finales (`Customer`)
| Dato | Dónde | Obligatorio | Notas |
|------|-------|-------------|-------|
| Nombre | `Customer.name` | Sí | |
| Teléfono | `Customer.phone` | Sí | **Identificador principal del cliente.** Único por barbería (`@@unique([phone, barbershopId])`) |
| Código único | `Customer.uniqueCode` | Generado | Para QR de referidos del cliente |
| Estado | `Customer.status` | — | PENDING / ACTIVE (aprobación del dueño) |
| Historial de visitas | `Visit[]` | — | Incluye `rating` (1–5), servicio y precio snapshot |
| Citas | `Appointment[]` | — | Fecha/hora elegida |
| Canjes | `Redemption[]` | — | Recompensas reclamadas |
| Referidos | `ClientReferral[]` | — | Quién invitó a quién dentro de la barbería |

**Punto crítico de Play:** el cliente final **no consiente directamente** en la app — es la barbería quien introduce/recoge sus datos. La política de privacidad debe explicar este rol (barberia.club como encargado/responsable conjunto) y cómo el cliente puede ejercer sus derechos.

### 2.3 Datos técnicos / inferidos
- **Dirección IP**: se lee de `x-forwarded-for` / `x-real-ip` para rate-limiting (`src/lib/rate-limit.ts`). Es en memoria, no se persiste en BD, pero **sí se procesa**.
- **localStorage**: se guarda el teléfono del cliente por barbería (`barberia_customer_<id>`) y el timestamp de notificaciones leídas. Es almacenamiento en el dispositivo → declarable en Data Safety.

---

## 3. Autenticación y registro

- **Librería:** NextAuth v4 (`src/lib/auth.ts`), estrategia **JWT** (cookie de sesión firmada con `NEXTAUTH_SECRET`).
- **Único proveedor:** `CredentialsProvider` (email + contraseña). **No hay login social** (Google/Apple/Facebook) actualmente.
- **Roles:** `ADMIN` (panel godmode) y `OWNER` (dueño de barbería).
- **Registro de dueño:** `POST /api/auth/register` — valida con Zod, hashea password, crea `User` + `Barbershop`, asigna código de referido y trial PRO de 7 días. Rate-limit 5/min por IP.
- **Clientes finales:** NO usan NextAuth ni contraseña. Se identifican solo por teléfono (`POST /api/customer/check` y `/register`). Cualquiera con el teléfono podría "ser" ese cliente — **sin verificación (OTP/SMS)**.

**Implicación Play:** si se añade login con Google se activan políticas adicionales de OAuth. Hoy no aplica. La ausencia de verificación del teléfono del cliente es un riesgo de privacidad a documentar, no un bloqueante de Play.

---

## 4. Cookies y tecnologías de seguimiento

| Tecnología | Tipo | Consentimiento actual |
|------------|------|------------------------|
| Cookie de sesión NextAuth | Funcional (necesaria) | No requiere consentimiento |
| **Google Analytics 4** (`G-50KZN1XZB9`) | Analítica/publicidad | ❌ **Ninguno** |
| **Meta Pixel** (`2085967502318437`) | Publicidad/seguimiento | ❌ **Ninguno** |
| **TikTok Pixel** (`D8NCPU3C77UAV4NU4ANG`) | Publicidad/seguimiento | ❌ **Ninguno** |
| localStorage (teléfono cliente, notif.) | Funcional | — |

**Hallazgo crítico (`src/app/layout.tsx:53-65`):** los tres pixeles se cargan **en todas las páginas, para todos los usuarios, sin banner de consentimiento ni opción de rechazo**. Los IDs están **hardcodeados como fallback** en el código (no solo en variables de entorno). Meta Pixel además dispara `PageView` y TikTok `ttq.page()` automáticamente.

Esto choca con:
- La política de **Datos de usuario de Google Play** (transparencia y consentimiento para compartir datos con terceros con fines publicitarios).
- Requisitos de consentimiento tipo GDPR/ePrivacy si hay usuarios en la UE; y buenas prácticas en Perú/LATAM.
- La ficha de **Data Safety** tendría que declarar que se comparten datos con Google/Meta/TikTok para publicidad y analítica.

---

## 5. Pagos e integraciones de pago

- **PayPal Subscriptions** (`/api/paypal/subscribe`, `/api/paypal/webhook`) — suscripción PRO de la barbería. Webhook con verificación de firma. El código trae `PAYPAL_WEBHOOK_ID` de Sandbox hardcodeado como fallback.
- **Mercado Pago** (`/api/mercadopago/subscribe`, `/webhook`) — checkout de preapproval. IDs de plan hardcodeados como fallback.
- **Datos de tarjeta:** **NO** pasan por la app ni se almacenan. El pago se delega 100% al checkout de PayPal/Mercado Pago. Solo se guarda `Payment` (monto, moneda, estado, método) y `paypalSubscriptionId`.
- **`@paypal/react-paypal-js`** en cliente carga el SDK de PayPal (terceros).

**Implicación Play:** Google Play exige que las **suscripciones digitales de la app Android** usen **Google Play Billing**, no PayPal/Mercado Pago, salvo excepciones (servicios consumidos fuera de la app / bienes físicos). Como la suscripción PRO es un servicio SaaS, **muy probablemente Google obligará a Play Billing** dentro de la app Android. **Esto es un bloqueante mayor que hay que resolver antes de publicar** (o limitar el pago al sitio web fuera del flujo de la app).

### 5.1 Programa de referidos con dinero real
- Recompensas en soles (S/) que se acumulan como saldo (`CreditMovement`, `Referral`).
- Retiros a cuenta bancaria: se tramitan **manualmente vía WhatsApp** (`withdrawalWhatsAppLink` en `src/lib/referrals.ts`). Los datos bancarios **NO se almacenan en la BD** (se envían por WhatsApp al soporte).

**Implicación Play:** programas de recompensas/dinero pueden activar políticas de "incentivos" y, según implementación en Android, restricciones. Documentar términos del programa.

---

## 6. Integraciones externas (terceros)

| Servicio | Uso | Datos enviados |
|----------|-----|----------------|
| Google Analytics 4 | Analítica | Comportamiento de navegación, identificadores |
| Meta (Facebook) Pixel | Tracking publicitario | Eventos de página, IP, cookies |
| TikTok Pixel | Tracking publicitario | Eventos de página, IP, cookies |
| PayPal | Pagos de suscripción | Datos de pago del dueño (en el dominio de PayPal) |
| Mercado Pago | Pagos de suscripción | Íd. |
| Vercel Blob | Almacenamiento de imágenes (logos, banners, **backups cifrados**) | Imágenes; URLs públicas |
| **Google Maps** | Enlace a ubicación de barbería (`AddressMapLink.tsx`) | Abre maps con la dirección (texto) |
| WhatsApp (`wa.me`) | Deep links de contacto/confirmación/retiros | Teléfono + mensaje prellenado (no es API, abre la app) |
| exchangerate-api.com | Tipo de cambio para mostrar precios | Ninguno personal |
| Google Fonts (Inter, Outfit) | Tipografías vía `next/font` | Self-hosted por Next (no llama a Google en runtime) |

**No hay** integraciones de IA (OpenAI/Anthropic/Gemini), ni envío de email transaccional (nodemailer/Resend/SendGrid), ni SMS (Twilio), ni push notifications (FCM/OneSignal). Las "notificaciones" (§9) son in-app, no push.

---

## 7. URLs públicas y landing pages

| Ruta | Contenido / datos expuestos |
|------|------------------------------|
| `/` | Home/marketing |
| `/planes` | Precios |
| `/login`, `/register` | Auth de dueños |
| `/[slug]` | **Landing pública de cada barbería** — nombre, logo, banner, dirección, redes, servicios, recompensas. Formulario de registro de cliente |
| `/descubrir` | Directorio público de **todas las barberías activas** con rating promedio |
| `/c/[uniqueCode]` | Página del cliente (progreso de referidos) accesible por código |
| `/recompensas`, `/qr` | Páginas públicas de soporte al flujo |
| `/admin/[slug]/*` | Panel del dueño (protegido) |
| `/godmode/*` | Panel super-admin (protegido, rol ADMIN): barberías, clientes, finanzas, referidos, revendedores, sistema |
| `/success` | Post-pago |

**Indexación:** `robots: { index: true, follow: true }` global → todas las landings de barberías y el directorio `/descubrir` son **indexables por buscadores**, exponiendo públicamente nombres de negocios, direcciones y ratings. Conviene revisar si los datos de cliente alguna vez quedan en páginas indexables (en `/c/[uniqueCode]` aparece info de cliente accesible por código — revisar exposición).

---

## 8. Sistema de QR y referidos

- **QR de barbería** (`/admin/[slug]/qr`): genera con la librería `qrcode` un QR que apunta a `NEXT_PUBLIC_APP_URL/[slug]`. Es la puerta de entrada del cliente para registrarse y sumar visitas. No contiene datos personales (solo URL).
- **Referidos de cliente:** cada cliente tiene `uniqueCode`; al compartir su enlace, invita a otros. Se registra en `ClientReferral` (referrer → referred). Antifraude: un cliente solo puede ser referido una vez por barbería.
- **Referidos de barbería:** `referralCode` por barbería; recompensa en S/ al referente cuando la referida paga PRO y se mantiene 30 días.

---

## 9. Notificaciones y comunicaciones automáticas

- **In-app únicamente** (`/api/admin/notifications` + `NotificationBell.tsx`): el dueño ve nuevos clientes, visitas, citas y referidos. El estado leído/no leído vive en **localStorage**, no en BD. No hay push.
- **WhatsApp manual:** mensajes prellenados que el dueño/cliente envía manualmente (confirmación de cita, contacto, retiros). No es comunicación automatizada del servidor.
- **No hay** emails ni SMS automáticos.

**Implicación Play:** sin push notifications no se requiere permiso `POST_NOTIFICATIONS`. Si en el futuro se añade FCM, habrá que declararlo.

---

## 10. Flujo de creación y eliminación de cuentas

### Creación
- **Dueño:** `/register` → crea `User` + `Barbershop`. ✅
- **Cliente:** la barbería/cliente crea el `Customer` desde la landing. ✅

### Eliminación — ⚠️ HALLAZGO CRÍTICO PARA PLAY
- **NO existe eliminación de cuenta self-service para el dueño** (el titular de la cuenta Google Play). No hay endpoint ni botón "Eliminar mi cuenta" en `/admin`.
- El dueño **puede** eliminar clientes individuales (`/admin/[slug]/clientes` → `prisma.customer.delete`).
- Solo el **super-admin (godmode)** puede borrar una barbería completa y, en cascada manual, todos sus datos (`src/app/godmode/barberias/page.tsx:105-123`: borra referrals, visits, redemptions, appointments, customers, services, rewards, creditMovements, payments y la barbershop). El `User` dueño **no se borra** en esa cascada.
- **No hay borrado de datos del cliente final a petición** (más allá de que el dueño lo elimine).

**Google Play exige (política de eliminación de datos / cuenta):** toda app que permita crear cuenta debe ofrecer (a) eliminar la cuenta **desde dentro de la app** y (b) una **URL web pública** para solicitar la eliminación, accesible sin instalar la app. **Esto NO existe hoy y es bloqueante.**

---

## 11. Lo que Google Play considerará "datos de usuario" (Data Safety)

Para la ficha **Data Safety** habrá que declarar, como mínimo:

- **Información personal:** nombre, email, números de teléfono (dueño y clientes), dirección aproximada (negocio).
- **Identificadores:** ID de usuario, cookies/IDs publicitarios (vía GA/Meta/TikTok).
- **Actividad de la app:** visitas, citas, ratings, interacciones.
- **Info financiera:** historial de compras/suscripción (no datos de tarjeta — los maneja el procesador).
- **Ubicación aproximada:** dirección del negocio (no GPS del dispositivo).
- **Logs/diagnóstico:** IP (rate-limiting).

Por cada uno hay que indicar: si se **recopila**, si se **comparte** (GA/Meta/TikTok = sí, con fines publicitarios), si está **cifrado en tránsito** (HTTPS sí), y si el usuario **puede solicitar su eliminación** (hoy parcial/no).

---

## 12. Requisitos faltantes / problemas para publicar

### Bloqueantes (impiden o arriesgan el rechazo)
1. **Páginas legales inexistentes.** El footer (`PublicFooter.tsx:38-39`) enlaza "Términos de servicio" y "Política de privacidad" a `#`. **No existen rutas** `/privacidad` ni `/terminos`. Google exige una **URL de Política de Privacidad** válida y públicamente accesible para la ficha de Play.
2. **Eliminación de cuenta ausente** (§10). Falta flujo in-app + URL pública de solicitud.
3. **Pixeles de tracking sin consentimiento** (§4). GA4 + Meta + TikTok activos sin opción de rechazo → riesgo de política de Datos de usuario y de declaración incorrecta en Data Safety.
4. **Pagos de suscripción fuera de Google Play Billing** (§5). Probable exigencia de Play Billing dentro de la app Android.
5. **Ficha de Data Safety** sin completar (§11).

### Requisitos legales/documentales a redactar (FASE SIGUIENTE — aún no redactados)
- Privacy Policy (cubriendo dueños **y** clientes finales, terceros, pixeles, pagos, IP, retención, derechos).
- Terms & Conditions (incluye programa de referidos con dinero, suscripción PRO, trial).
- Account Deletion Policy + página/endpoint de eliminación.
- Cookie/Tracking consent notice.
- Aviso del rol de barberia.club frente a datos de clientes de terceros.

### Mejoras recomendadas (no bloqueantes)
- Verificación del teléfono del cliente (OTP) — hoy sin verificar.
- Revisar exposición pública de `/c/[uniqueCode]` y `/descubrir` (datos indexables).
- Mover IDs de pixeles/IDs de Sandbox fuera del código (solo env).
- Borrar el `User` dueño en la cascada de eliminación de barbería en godmode.
- Política de retención de los **backups cifrados** (30 copias en Vercel Blob, `/api/cron/backup`) y del derecho de eliminación frente a esos backups.

---

## 13. Empaquetado Android (estado actual)

- **No hay** carpeta `android/`, ni Capacitor, ni configuración de TWA/Bubblewrap, ni `assetlinks.json` en `public/`.
- La app es Next.js desplegada en Vercel. Para Play se necesitará envolverla (TWA con Bubblewrap, o Capacitor/WebView). Esto define qué políticas adicionales aplican (p. ej. Play Billing, permisos del manifiesto, Digital Asset Links para verificar el dominio).

---

## 14. Aspectos correctos (a favor del cumplimiento)

- Contraseñas hasheadas con bcrypt; nunca en texto plano.
- Validación de entrada con Zod en todos los endpoints públicos.
- Rate-limiting en endpoints sensibles.
- Webhooks de pago con verificación de firma.
- Backups de BD **cifrados AES-256-GCM** antes de subir.
- Datos de tarjeta nunca tocan el servidor (delegados al procesador).
- HTTPS en producción (dominio barberia.club).
- Control de acceso por rol (guards en panel admin/godmode).

---

## 15. Inventario de archivos clave (para fases posteriores)

| Área | Archivo |
|------|---------|
| Modelo de datos | `prisma/schema.prisma` |
| Auth | `src/lib/auth.ts` |
| Tracking / pixeles | `src/app/layout.tsx`, `src/components/MetaPixel.tsx`, `src/components/TikTokPixel.tsx` |
| Registro dueño | `src/app/api/auth/register/route.ts` |
| Registro/datos cliente | `src/app/api/customer/{register,check,visit,appointment}/route.ts`, `src/app/api/customer/barbershops/route.ts` |
| Pagos | `src/app/api/{paypal,mercadopago}/**` |
| Backups | `src/app/api/cron/backup/route.ts` |
| Eliminación (parcial) | `src/app/godmode/barberias/page.tsx`, `src/app/admin/[slug]/clientes/page.tsx` |
| Footer legal (roto) | `src/components/PublicFooter.tsx` |
| Rate-limit / IP | `src/lib/rate-limit.ts` |

---

*Fin del informe técnico. Próximo paso (cuando lo indiques): redacción de los documentos legales y diseño del flujo de eliminación de cuenta y consentimiento.*
