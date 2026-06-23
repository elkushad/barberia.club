# Diseño de flujos mínimos: eliminación de cuenta y consentimiento

**Fecha:** 22 de junio de 2026
**Objetivo:** cumplir los requisitos de Google Play (eliminación de cuenta + consentimiento de tracking) con el **mínimo cambio posible**, reutilizando lo que el sistema ya hace. No se proponen funciones nuevas más allá de lo exigido por las políticas.

> Este documento es de diseño. No incluye la implementación; describe el flujo, las pantallas y los puntos exactos del código a tocar (basados en el informe técnico).

---

## PARTE 1 — Eliminación de cuenta

### 1.1 Requisito de Google Play
Toda app con creación de cuenta debe ofrecer: (a) eliminar la cuenta **desde dentro de la app**, y (b) una **URL pública** para solicitarlo sin instalar la app. Hoy **no existe** ninguna de las dos (solo el super-admin puede borrar barberías desde godmode).

### 1.2 Lo que ya existe (reutilizable)
La cascada de borrado ya implementada en `src/app/godmode/barberias/page.tsx:105-123` elimina, en orden: `referral` → `visit` → `redemption` → `appointment` → `customer` → `service` → `reward` → `creditMovement` → `payment` → `barbershop`. **Falta** borrar también `clientReferral` / `clientReferralReward` y el registro `User` del dueño.

### 1.3 Flujo propuesto (dueño autenticado, dentro de la app)

```
Configuración de la barbería (/admin/[slug]/configuracion)
        │
        ▼
[ Zona de peligro ] → botón "Eliminar mi cuenta"
        │
        ▼
Modal de confirmación
  - Advertencia: acción permanente e irreversible
  - Aviso: "Si tienes PRO activo, cancélalo primero en PayPal/Mercado Pago"
  - El usuario escribe su correo o la palabra "ELIMINAR" para confirmar
        │
        ▼
Server Action / endpoint protegido
  - Verifica sesión y que el usuario sea OWNER dueño de la barbería
  - Ejecuta la cascada (transacción) sobre TODAS las tablas relacionadas
    incluyendo clientReferral, clientReferralReward y el User dueño
        │
        ▼
Cierre de sesión + redirección a página de confirmación pública
```

**Pantallas / piezas necesarias (mínimo):**
1. **Sección "Eliminar cuenta"** en `src/app/admin/[slug]/configuracion/page.tsx` (reutiliza el estilo existente).
2. **Componente de confirmación** (cliente), similar a `DeleteBarbershopButton.tsx` que ya existe en godmode — se puede adaptar.
3. **Server Action de borrado** con guard `assertBarbershopAccessBySlug` (ya existe en `src/lib/guards.ts`) para garantizar que solo el dueño borre lo suyo. Reutiliza y **extiende** la cascada de godmode.

### 1.4 Flujo público (sin app) — requisito (b) de Google

```
https://barberia.club/eliminar-cuenta  (página estática nueva, pública)
   - Explica qué se elimina y los plazos (enlaza la Política de Eliminación)
   - Opción 1: "Inicia sesión y elimínala tú mismo" → /login → configuración
   - Opción 2: formulario / mailto a contacto@barberia.club indicando el correo
   - Opción 3: botón WhatsApp a +51 997 237 775 (reutiliza el patrón wa.me existente)
```

Esta página **no requiere autenticación** y debe ser accesible e indexable, porque Google la revisa.

### 1.5 Puntos a resolver en el borrado
- Hacerlo en **transacción** (`prisma.$transaction`) para evitar estados a medias.
- Incluir las tablas que la cascada de godmode **omite hoy**: `ClientReferral`, `ClientReferralReward` y `User`.
- Considerar el caso de un `User` con **varias** barberías (el schema lo permite: `barbershops Barbershop[]`): borrar el `User` solo cuando no le queden barberías, o eliminar todas.
- Las copias de seguridad cifradas se purgan solas (~30 días); documentado en la política.

### 1.6 Enlace en el footer
Corregir `src/components/PublicFooter.tsx:38-39`: hoy "Términos" y "Política de privacidad" apuntan a `#`. Deben enlazar a `/terminos`, `/privacidad` y añadir `/eliminar-cuenta`.

---

## PARTE 2 — Consentimiento de cookies / tracking

### 2.1 Requisito
GA4, Meta Pixel y TikTok Pixel se cargan **siempre y sin consentimiento** en `src/app/layout.tsx:53-65`. Para cumplir con las políticas de datos de usuario y declarar correctamente Data Safety, deben **cargarse solo tras el consentimiento** y permitir rechazo.

### 2.2 Comportamiento actual (a modificar)
En `layout.tsx`, los tres componentes (`GoogleAnalytics`, `MetaPixel`, `TikTokPixel`) se renderizan incondicionalmente. Hay que envolverlos en una decisión de consentimiento.

### 2.3 Flujo propuesto (mínimo, sin librerías externas)

```
Primera visita (no hay preferencia guardada)
        │
        ▼
Banner de cookies (abajo, no bloqueante)
  Texto: "Usamos cookies de analítica y publicidad (Google, Meta, TikTok).
          ¿Aceptas?"  + enlace a /privacidad
  Botones: [ Aceptar ]   [ Rechazar ]
        │
        ├── Aceptar  → guarda preferencia → monta GA/Meta/TikTok
        └── Rechazar → guarda preferencia → NO monta ningún pixel
```

- **Persistencia:** `localStorage` (el sistema ya usa localStorage para teléfono y notificaciones; mantener el mismo patrón). Clave p. ej. `barberia_cookie_consent = "granted" | "denied"`.
- **Cookie de sesión y localStorage funcional:** no entran en el banner (son necesarios).
- **Cambiar de opinión:** un enlace "Cookies" en el footer reabre el banner para re-elegir.

### 2.4 Piezas necesarias (mínimo)
1. **Componente cliente `CookieConsent.tsx`** (nuevo): muestra el banner, lee/escribe la preferencia y expone el estado.
2. **Gating en `layout.tsx`:** mover el renderizado de `GoogleAnalytics` / `MetaPixel` / `TikTokPixel` a un componente cliente que solo los monte si la preferencia es `"granted"`. Como son scripts `afterInteractive`, basta con renderizarlos condicionalmente tras leer la preferencia en cliente.
3. **Enlace "Cookies"** en `PublicFooter.tsx` para reabrir la elección.

### 2.5 Notas de implementación (coherentes con el sistema)
- No se requiere backend: el consentimiento vive en el dispositivo (igual que el resto del estado de cliente).
- Los IDs de los pixeles hoy están **hardcodeados** como fallback en `layout.tsx`. Aprovechar este cambio para moverlos a variables de entorno y no embeberlos.
- Mantener el idioma y estilo existentes (es-PE, mismo sistema de variables CSS).

---

## PARTE 3 — Checklist de cierre para publicar en Play

| # | Acción | Archivo / ruta | Estado |
|---|--------|----------------|--------|
| 1 | Página pública `/privacidad` con la Política de Privacidad | nueva ruta | ⬜ |
| 2 | Página pública `/terminos` con los Términos | nueva ruta | ⬜ |
| 3 | Página pública `/eliminar-cuenta` | nueva ruta | ⬜ |
| 4 | Botón "Eliminar mi cuenta" in-app + server action | `admin/[slug]/configuracion` | ⬜ |
| 5 | Extender cascada de borrado (clientReferral, clientReferralReward, User) en transacción | nueva action / reutiliza godmode | ⬜ |
| 6 | Banner de consentimiento que gatea GA/Meta/TikTok | `CookieConsent.tsx` + `layout.tsx` | ⬜ |
| 7 | Footer: enlaces legales reales (no `#`) + "Cookies" | `PublicFooter.tsx` | ⬜ |
| 8 | Completar ficha Data Safety con el documento correspondiente | Play Console | ⬜ |
| 9 | Resolver pago de suscripción vs. Google Play Billing | decisión de producto | ⬜ |
| 10 | Empaquetado Android (TWA/Bubblewrap) + assetlinks.json | nuevo | ⬜ |

> Los puntos 9 y 10 exceden los flujos de este documento pero son condición para publicar (ver informe técnico §5 y §13).
