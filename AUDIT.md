# Auditoría técnica — barberia.club

- **Producto:** SaaS de fidelización para barberías (registro, flyer con QR, puntos/recompensas, base de clientes).
- **Fecha:** 2026-06-13
- **Alcance:** Revisión de solo lectura del repositorio (FASE 0–1). Sin cambios en el código.
- **Método:** Lectura de código, configuración, modelo de datos y rutas. Clasificación: 🔴 CRÍTICO / 🟡 IMPORTANTE / 🟢 MEJORA.

---

## Estado de las mejoras (rama `auditoria-mejoras`)

**Resueltos** (build verde): SEC-1 (God Mode con rol ADMIN), SEC-2 (bcrypt),
SEC-3 (NEXTAUTH_SECRET sin fallback), SEC-4 (seed por env), SEC-9 (log Prisma),
LINK-1/3/4 (enlaces de navbar, landing y planes), UX-1/2 (redirects),
SEO-1 (metadata), CLAIM-1/2 (copy y badges), ARCH-4 (código muerto),
A11Y-3 (rel noopener) y A11Y-1 parcial (aria-labels en God Mode),
ARCH-6/7 (README + `.env.example`), SEC-5/6/7/8 (DTO en `check`, IDOR en
server actions, `uniqueCode` con crypto, validación zod + rate-limit) y
limpieza de lint (de 61 a 20 problemas).

**Parcial:** LINK-2 — se arreglaron "Precios" y "Centro de ayuda" del footer;
los enlaces legales y de redes sociales quedan pendientes (ver LEGAL-1 y URLs reales).

**Pendiente (requiere tu OK / decisión):** CFG-1 (migrar a Postgres — en curso),
PERF-1 (imágenes base64 → almacenamiento de objetos — en curso), LEGAL-1/2,
LINK-5 (`/success`), SEO-2/3, PERF-2/3, ARCH-1/2/3, A11Y-2, UX-3/4, CLAIM-3/4, CFG-4.
Lint residual (5 errores): hooks de `LandingForm` y `Date.now` en `clientes`
(Server Component, falso positivo) — pendientes del refactor de comportamiento.

> ⚠️ Tras el cambio a bcrypt, las cuentas sembradas en texto plano dejan de
> poder iniciar sesión hasta volver a ejecutar `node scripts/seed.mjs`.

---

## Resumen ejecutivo

Tres problemas **bloquean un despliegue seguro a producción** y deben resolverse antes que nada:

1. **🔴 El panel God Mode (`/godmode`) no tiene autenticación ni autorización.** Cualquier visitante anónimo puede ver todas las barberías, todos los clientes (nombre + teléfono + código) y las finanzas/ingresos de la plataforma.
2. **🔴 Las contraseñas se guardan y comparan en texto plano** (sin hashing), y el secreto de NextAuth tiene un *fallback* hardcodeado en el repo. El seed crea cuentas con `password123`.
3. **🔴 La base de datos es SQLite** (archivo local). En Vercel/serverless el sistema de archivos es efímero/solo-lectura, por lo que la app no funcionará en producción tal cual.

Además hay enlaces rotos en toda la UI pública (`href="#"`, anclas inexistentes, rutas 404 en `/success`), páginas legales inexistentes (se recopilan datos personales), claims sin respaldo y deuda de calidad (estilos inline masivos, componentes muertos, imágenes en base64 dentro de la BD).

La base es razonable: App Router con Server Components para fetching, verificación de propiedad en el panel del dueño, límites de plan aplicados en servidor y generación de QR funcional. El problema no es la idea ni la estructura, sino seguridad, configuración de producción y pulido de la capa pública.

---

## FASE 0 — Mapa del proyecto

### Stack y versiones
| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | `16.2.9` |
| UI | React / React DOM | `19.2.4` |
| Auth | next-auth (Credentials, JWT) | `^4.24.14` |
| ORM | Prisma + `@prisma/client` | `^5.22.0` |
| Base de datos | **SQLite** (`dev.db`) | — |
| Iconos | lucide-react | `^1.18.0` |
| Gráficos | recharts | `^3.8.1` |
| QR | qrcode | `^1.5.4` |
| Lenguaje | TypeScript (`strict: true`) | `^5` |

> Nota: `AGENTS.md` advierte que esta versión de Next.js tiene cambios de ruptura respecto a lo habitual; cualquier cambio de código debe consultar primero `node_modules/next/dist/docs/`.

### Scripts (`package.json`)
- `dev`: `next dev`
- `build`: `prisma generate && next build`
- `start`: `next start`
- `lint`: `eslint`
- **No existe** script de `seed` (se corre a mano `node scripts/seed.mjs`) ni `db:push`/`migrate`.

### Estructura de rutas (App Router, `src/app`)
- **Pública / marketing:** `/` (landing), `/planes`, `/login`, `/register`, `/success`.
- **Landing de barbería (cliente final):** `/[slug]` + `LandingForm`, `CarouselBackground`.
- **Tarjeta del cliente:** `/c/[uniqueCode]`.
- **Panel del dueño:** `/admin`, `/admin/[slug]` (+ `clientes`, `visitas`, `recompensas`, `configuracion`, `qr`), `/admin/barberias/nueva`.
- **Super-admin:** `/godmode` (+ `barberias`, `barberias/[slug]`, `clientes`, `finanzas`, `revendedores`, `sistema`).
- **APIs:** `/api/auth/[...nextauth]`, `/api/auth/register`, `/api/customer/check`, `/api/customer/register`, `/api/customer/visit`.

### Rendering, build y deploy
- **Rendering:** SSR con Server Components para el fetching (landing, admin, godmode). Islas cliente para formularios, animaciones y navbars. El HTML inicial **sí** se renderiza en servidor (bien para SEO base), pero el contenido de la landing arranca con `opacity:0` por la animación de scroll.
- **Build:** `prisma generate && next build`. Indicios de despliegue en **Vercel** (`README`, `.vercel` en `.gitignore`).
- **Almacenamiento de imágenes:** se guardan como **data URI base64 dentro de la columna de SQLite** (`logo`, `banner`); de ahí el `bodySizeLimit: '10mb'` en `next.config.ts`. (`/public/uploads/` está en `.gitignore` y tiene archivos antiguos, pero el código actual ya no lo usa.)

### Variables de entorno esperadas (no documentadas — falta `.env.example`)
- `DATABASE_URL` (Prisma/SQLite)
- `NEXTAUTH_SECRET` (hoy con fallback hardcodeado)
- `NEXTAUTH_URL` (requerido por NextAuth v4 en producción)
- `NEXT_PUBLIC_APP_URL` (para construir la URL del QR; hoy cae a `localhost:3000`)

### Modelo de datos (Prisma → SQLite)
`User (OWNER/ADMIN)` 1—N `Barbershop` 1—N `Customer` 1—N `Visit`; `Barbershop` 1—N `Reward` y `Payment`; `Redemption` enlaza `Customer`↔`Reward`. Campos como `services`, `hours` y `banner` se almacenan como **strings JSON** (no relaciones). `Barbershop.plan` = `FREE|PRO`, `status` = `ACTIVE|SUSPENDED`.

---

## FASE 1 — Hallazgos

### 1. Seguridad

#### 🔴 SEC-1 — God Mode sin autenticación ni autorización
- **Dónde:** `src/app/godmode/layout.tsx` (es `"use client"`, no valida sesión) y todas las páginas `src/app/godmode/**/page.tsx` (Server Components que consultan datos globales **sin** `getServerSession` ni verificación de rol). No existe `middleware.ts`.
- **Qué pasa:** `/godmode`, `/godmode/clientes`, `/godmode/finanzas`, `/godmode/barberias`, etc. son accesibles por cualquier visitante anónimo. `godmode/clientes/page.tsx` lista nombre + **teléfono** + código de **todos** los clientes; `godmode/finanzas/page.tsx` expone pagos e ingresos.
- **Por qué importa:** Fuga total de datos del negocio y PII de clientes de todas las barberías. Es el riesgo más grave del proyecto.
- **Fix:** Proteger toda la sección. Recomendado: convertir `godmode/layout.tsx` en Server Component que haga `getServerSession` + `redirect` si el rol no es `ADMIN` (más un `middleware.ts` como segunda capa). Mantener las islas cliente (sidebar) como subcomponente.
- **Esfuerzo:** M

#### 🔴 SEC-2 — Contraseñas en texto plano
- **Dónde:** `src/lib/auth.ts:28` (`user.password !== credentials.password`), `src/app/api/auth/register/route.ts:49`, `scripts/seed.mjs`.
- **Qué pasa:** No hay hashing; se guarda y compara la contraseña tal cual.
- **Por qué importa:** Una filtración de la BD expone todas las contraseñas en claro; incumple cualquier estándar mínimo.
- **Fix:** `bcryptjs` (hash en registro y en seed, `compare` en `authorize`). Migrar las contraseñas existentes.
- **Esfuerzo:** S–M

#### 🔴 SEC-3 — Secreto de NextAuth hardcodeado como fallback
- **Dónde:** `src/lib/auth.ts:63` → `secret: process.env.NEXTAUTH_SECRET || "super-secret-barberia-club-key"`.
- **Qué pasa:** Si falta la env, se usa un secreto público (está en el repo). Con él se pueden **forjar tokens de sesión**.
- **Fix:** Exigir `NEXTAUTH_SECRET` y eliminar el fallback (fallar el arranque si no existe).
- **Esfuerzo:** S

#### 🟡 SEC-4 — Credenciales por defecto en el seed
- **Dónde:** `scripts/seed.mjs` → `admin@barberia.club / password123` (rol ADMIN/God Mode) y `owner@demo.com / password123`.
- **Por qué importa:** Si se ejecuta el seed en producción, queda una puerta trasera con credenciales conocidas y débiles.
- **Fix:** Tomar credenciales de variables de entorno, forzar cambio en primer login, nunca fijar contraseñas en el repo.
- **Esfuerzo:** S

#### 🟡 SEC-5 — `/api/customer/check` expone PII sin auth
- **Dónde:** `src/app/api/customer/check/route.ts` (devuelve el objeto `Customer` completo, incluido `id` y `uniqueCode`).
- **Qué pasa:** Cualquiera que conozca un `barbershopId` (es público en la landing) puede enumerar por teléfono y recuperar `uniqueCode`, que es lo único que protege `/c/[uniqueCode]`.
- **Fix:** Devolver solo lo imprescindible (`{ exists, status, name }`), nunca `uniqueCode`/`id`; añadir rate limiting.
- **Esfuerzo:** S–M

#### 🟡 SEC-6 — IDOR en server actions del dueño
- **Dónde:** `approveCustomer`/`rejectCustomer` en `src/app/admin/[slug]/clientes/page.tsx:70-87`; `updateConfig`/`deleteBanner` en `src/app/admin/[slug]/configuracion/page.tsx`.
- **Qué pasa:** Operan por `id`/`slug` sin reconfirmar que el recurso pertenece al usuario autenticado. La página está protegida por el layout, pero las server actions son endpoints POST invocables; un dueño podría manipular datos de otra barbería con un `id` ajeno.
- **Fix:** Revalidar sesión + propiedad dentro de cada action.
- **Esfuerzo:** M

#### 🟡 SEC-7 — `uniqueCode` débil (`Math.random`)
- **Dónde:** `src/app/admin/[slug]/clientes/page.tsx:73` → `Math.random().toString(36).substring(2, 8).toUpperCase()`.
- **Qué pasa:** 6 caracteres, no criptográfico, adivinable/colisionable; sin reintento ante colisión (el `@unique` lanzaría error 500 al aprobar).
- **Fix:** `crypto`/`nanoid`, mayor longitud y reintento ante colisión.
- **Esfuerzo:** S

#### 🟡 SEC-8 — Sin validación ni rate limiting en endpoints públicos
- **Dónde:** `api/auth/register`, `api/customer/register`, `api/customer/visit` (solo comprueban presencia de campos).
- **Por qué importa:** Permite spam/abuso, formatos inválidos y datos basura.
- **Fix:** Validación con `zod`, límites de longitud y rate limiting básico.
- **Esfuerzo:** M

#### 🟢 SEC-9 — Prisma loguea todas las queries
- **Dónde:** `src/lib/prisma.ts:8` → `log: ['query']`.
- **Fix:** Condicionar por `NODE_ENV` (no loguear queries en producción).
- **Esfuerzo:** S

### 2. SEO y rendering

#### 🟡 SEO-1 — Metadata mínima
- **Dónde:** `src/app/layout.tsx:9-12` (solo `title` y `description`).
- **Fix:** Añadir `metadataBase`, OpenGraph, Twitter Card, canonical y `robots`. Metadata propia en `/planes`, `/login`, `/register`.
- **Esfuerzo:** S

#### 🟡 SEO-2 — La landing arranca invisible (`opacity:0`)
- **Dónde:** `src/components/ScrollAnimation.tsx` + `.animate-on-scroll { opacity: 0 }` en `globals.css`; toda la landing está envuelta en `ScrollAnimation`.
- **Qué pasa:** El HTML SSR contiene el texto (los crawlers que ejecutan JS lo ven), pero sin JS la página queda en blanco y el H1 (elemento LCP) empieza invisible, penalizando el LCP.
- **Fix:** Que el estado por defecto sea visible y la animación se aplique como progresiva (o respetar `prefers-reduced-motion` y dar fallback visible).
- **Esfuerzo:** S–M

#### 🟢 SEO-3 — Faltan `sitemap`, `robots` y manifest
- **Fix:** Añadir `app/sitemap.ts`, `app/robots.ts` y `manifest`.
- **Esfuerzo:** S

### 3. Rutas y enlaces rotos

#### 🟡 LINK-1 — Anclas inexistentes en la navbar
- **Dónde:** `src/components/PublicNavbar.tsx:25,28` → `#precios` y `#soporte`. La landing solo tiene `#inicio`, `#como-funciona`, `#beneficios`.
- **Fix:** "Precios" → `/planes` (o añadir sección `#precios`). Crear sección/destino para "Soporte" o quitarlo.
- **Esfuerzo:** S

#### 🟡 LINK-2 — Footer: legales, redes y anclas rotas
- **Dónde:** `src/components/PublicFooter.tsx` → "Términos de servicio" y "Política de privacidad" en `href="#"`; X/Instagram/Facebook en `href="#"`; "Precios"/"Centro de ayuda" a anclas inexistentes.
- **Fix:** Crear `/terminos` y `/privacidad`; poner URLs reales de redes o quitarlas.
- **Esfuerzo:** S–M

#### 🟡 LINK-3 — CTAs de la landing sin acción
- **Dónde:** `src/app/page.tsx:35` ("Ver demo") y `:221` ("Conocer más"), ambos `href="#"`.
- **Fix:** "Ver demo" → barbería demo (`/demo`) o video; "Conocer más" → `#como-funciona`/`/planes`. Si no, quitarlos.
- **Esfuerzo:** S

#### 🟡 LINK-4 — `/planes` con CTAs rotos
- **Dónde:** `src/app/planes/page.tsx:104,167,210` → "Elegir plan Gratis" va a `/admin` (debería ser `/register`); "Contactar para subir a PRO" y "Hablar con ventas" en `href="#"`.
- **Fix:** Conectar a `/register`, a WhatsApp/`mailto` de ventas o a un formulario.
- **Esfuerzo:** S

#### 🟡 LINK-5 — `/success` con enlaces a rutas 404 y datos falsos
- **Dónde:** `src/app/success/page.tsx` → enlaza a `/admin/perfil`, `/admin/landing`, `/admin/recompensas`, `/admin/clientes` (las reales son `/admin/[slug]/...`) → **404**; "Contactar soporte" `href="#"`; botón hamburguesa sin `onClick`; fechas hardcodeadas ("25 de mayo de 2024", "25 de junio de 2024"); muestra "PAGO APROBADO" sin pasarela. La página está **sin enlazar** desde el registro (huérfana).
- **Fix:** Corregir destinos (necesitan el `slug`), quitar datos falsos, o despriorizar la página hasta que haya pagos reales.
- **Esfuerzo:** M

### 4. Arquitectura y calidad de código

#### 🟡 ARCH-1 — Código y assets muertos
- **Dónde:** `src/components/Hero.tsx`, `Navbar.tsx`, `Footer.tsx`, `ServiceCard.tsx` (sin imports en ningún lado); assets default de create-next-app en `/public` (`next.svg`, `vercel.svg`, `window.svg`, `globe.svg`, `file.svg`); `a5049f9f-...png` suelto en la raíz del repo.
- **Fix:** Eliminar (previa confirmación).
- **Esfuerzo:** S

#### 🟡 ARCH-2 — Estilos inline masivos
- **Dónde:** Casi todos los componentes/páginas usan objetos `style={{...}}` extensos en el JSX.
- **Por qué importa:** Duplicación, difícil mantenimiento, sin sistema de theming coherente, JSX ilegible.
- **Fix:** Migrar gradualmente a CSS Modules / clases utilitarias (ya existen `globals.css` y `*.module.css`).
- **Esfuerzo:** L

#### 🟡 ARCH-3 — Parseo de JSON-en-string duplicado
- **Dónde:** El mismo bloque `try/catch` para parsear `banner` está repetido en `configuracion/page.tsx`, `[slug]/page.tsx` y la galería.
- **Fix:** Helper compartido (`parseBanners`) o modelar como relación/columna real.
- **Esfuerzo:** M

#### 🟢 ARCH-4 — Dead code en `admin/[slug]/layout.tsx`
- **Dónde:** `src/app/admin/[slug]/layout.tsx:36-43` construye `navLinks` que nunca se usa; `import Link` sin uso.
- **Esfuerzo:** S

#### 🟢 ARCH-5 — `as any` para `role`/`id` de sesión
- **Fix:** Tipar el módulo `next-auth` (`next-auth.d.ts`).
- **Esfuerzo:** S

#### 🟢 ARCH-6 / ARCH-7 — README boilerplate y sin `.env.example`
- **Fix:** README con setup real + crear `.env.example` documentando las 4 variables.
- **Esfuerzo:** S

### 5. Performance

#### 🟡 PERF-1 — Imágenes/videos en base64 dentro de la BD
- **Dónde:** `src/app/admin/[slug]/configuracion/page.tsx:55-74` (logo y banners como data URI en columnas SQLite).
- **Por qué importa:** Infla cada fila/consulta, obliga a `bodySizeLimit: 10mb`, y guardar **videos** en base64 es inviable a escala.
- **Fix:** Almacenamiento de objetos (Vercel Blob / S3 / R2 / UploadThing) guardando solo URLs.
- **Esfuerzo:** L

#### 🟡 PERF-2 — `<img>` crudo en lugar de `next/image`
- **Dónde:** Hero en `src/app/page.tsx:72`; logos públicos y QR en varias páginas.
- **Fix:** `next/image` al menos en el hero (LCP).
- **Esfuerzo:** S

#### 🟡 PERF-3 — Tres familias tipográficas y `@import` render-blocking
- **Dónde:** `layout.tsx` carga Inter + Outfit por `next/font`; `globals.css:1` carga Playfair por `@import` (render-blocking). Además `--font-heading: 'Outfit'` referencia el **nombre literal**, no la variable de `next/font` → probable fallback (Outfit cargada pero sin aplicarse a los headings).
- **Fix:** Unificar a `next/font`, eliminar el `@import`, y referenciar las variables (`var(--font-outfit)`).
- **Esfuerzo:** S

### 6. Accesibilidad

#### 🟡 A11Y-1 — Botones-icono sin nombre accesible
- **Dónde:** Hamburguesa sin `onClick`/label en `success/page.tsx:29`; botón "X" de borrar banner (`configuracion`); botón de menú en `godmode/layout.tsx`.
- **Fix:** `aria-label` descriptivos.
- **Esfuerzo:** S

#### 🟡 A11Y-2 — `alt` genéricos y contraste de texto tenue
- **Dónde:** `alt="Logo"` en imágenes de barbería; textos de 0.7–0.85rem en gris (`--saas-text-muted`) sobre fondos oscuros en footers/cards podrían no cumplir AA.
- **Fix:** `alt` descriptivos; verificar contraste y subir el gris donde no pase AA.
- **Esfuerzo:** S

#### 🟢 A11Y-3 — `target="_blank"` sin `rel="noopener"`
- **Dónde:** WhatsApp en `admin/[slug]/clientes/page.tsx:251`.
- **Fix:** Añadir `rel="noopener noreferrer"`.
- **Esfuerzo:** S

### 7. UX del funnel de registro/login

#### 🟡 UX-1 — Tras registrarse, redirige a `/planes`
- **Dónde:** `src/app/register/page.tsx:48`.
- **Por qué importa:** El usuario recién registrado espera entrar a su panel, no a una página de precios. Y en `/planes`, "Elegir plan Gratis" lo manda a `/admin` (no a onboarding).
- **Fix:** Registrar → `/admin` (o un `/success` real corregido).
- **Esfuerzo:** S

#### 🟡 UX-2 — Login no enruta por rol
- **Dónde:** `src/app/login/page.tsx:30` (siempre `/admin`).
- **Fix:** Si el rol es `ADMIN`, redirigir a `/godmode`.
- **Esfuerzo:** S

#### 🟡 UX-3 — Sin recuperación de contraseña / verificación de email / confirmación
- **Fix:** Roadmap (reset por email, verificación, confirmar contraseña en registro).
- **Esfuerzo:** M–L

#### 🟢 UX-4 — Sin validación de formato de teléfono
- **Fix:** Validar en cliente y servidor.
- **Esfuerzo:** S

### 8. Legal / compliance

#### 🔴 LEGAL-1 — No existen Términos ni Privacidad
- **Dónde:** Solo enlaces rotos en el footer; no hay páginas `/terminos` ni `/privacidad`.
- **Por qué importa:** Se recopilan datos personales (nombres y teléfonos de clientes). Una política de privacidad es legalmente exigible y un requisito de tiendas/pasarelas.
- **Fix:** Crear `/terminos` y `/privacidad` con contenido real y enlazarlos.
- **Esfuerzo:** M

#### 🟡 LEGAL-2 — Sin aviso de consentimiento al recopilar teléfonos
- **Dónde:** Formulario público `src/app/[slug]/LandingForm.tsx`.
- **Fix:** Nota/checkbox de consentimiento + enlace a privacidad.
- **Esfuerzo:** S

### 9. Claims sin respaldo en el copy

#### 🟡 CLAIM-1 — "Únete a cientos de barberías"
- **Dónde:** `src/app/page.tsx:213`.
- **Fix:** Suavizar ("Empieza hoy", "Únete a las barberías que ya fidelizan...") hasta tener cifras reales.
- **Esfuerzo:** S

#### 🟡 CLAIM-2 — Badges "NUEVO" de features inexistentes
- **Dónde:** `src/app/planes/page.tsx` → "Recordatorios de citas", "Panel de estadísticas básico", "Automatizaciones de fidelización", "Reportes avanzados". No existen en el modelo ni en el código.
- **Fix:** Quitar o marcar "Próximamente".
- **Esfuerzo:** S

#### 🟡 CLAIM-3 — "Flyer con QR listo para imprimir"
- **Dónde:** Landing y `qr/page.tsx`.
- **Qué pasa:** El producto entrega un PNG de QR + instrucciones de texto, no un flyer diseñado/imprimible.
- **Fix:** Ajustar el copy o generar un flyer real (plantilla imprimible/PDF).
- **Esfuerzo:** S–M

#### 🟡 CLAIM-4 — "¡Pago aprobado!" sin pasarela
- **Dónde:** `src/app/success/page.tsx`.
- **Fix:** No afirmar cobros hasta integrar pagos.
- **Esfuerzo:** S (ligado a LINK-5)

### 10. Despliegue / configuración

#### 🔴 CFG-1 — SQLite como base de datos de producción
- **Dónde:** `prisma/schema.prisma:6-8` (`provider = "sqlite"`).
- **Por qué importa:** En Vercel/serverless el FS es efímero y de solo lectura → escrituras se pierden o fallan. La app **no funciona** en ese entorno tal cual.
- **Fix:** Migrar a Postgres (Neon/Supabase) o Turso/libSQL. **Decisión del usuario** (afecta hosting y costos).
- **Esfuerzo:** L

#### 🟡 CFG-2 — URL del QR cae a `localhost`
- **Dónde:** `src/app/admin/[slug]/qr/page.tsx:13` → `process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"`.
- **Fix:** Exigir `NEXT_PUBLIC_APP_URL` en producción.
- **Esfuerzo:** S

#### 🟡 CFG-3 — Faltan envs de NextAuth documentadas
- **Fix:** Documentar/exigir `NEXTAUTH_URL` y `NEXTAUTH_SECRET`.
- **Esfuerzo:** S

#### 🟢 CFG-4 — `dev.db` duplicado y `dotenv` posiblemente sin uso
- **Dónde:** `dev.db` en raíz y en `prisma/`; `dotenv` en devDependencies sin import aparente.
- **Esfuerzo:** S

---

## Tabla resumen priorizada

| ID | Sev. | Hallazgo | Categoría | Esfuerzo |
|---|---|---|---|---|
| SEC-1 | 🔴 | God Mode sin auth/rol | Seguridad | M |
| SEC-2 | 🔴 | Contraseñas en texto plano | Seguridad | S–M |
| SEC-3 | 🔴 | Secreto NextAuth hardcodeado | Seguridad | S |
| CFG-1 | 🔴 | SQLite en producción (serverless) | Deploy | L |
| LEGAL-1 | 🔴 | Sin Términos ni Privacidad (se capta PII) | Legal | M |
| SEC-4 | 🟡 | Credenciales por defecto en seed | Seguridad | S |
| SEC-5 | 🟡 | `customer/check` filtra PII/`uniqueCode` | Seguridad | S–M |
| SEC-6 | 🟡 | IDOR en server actions del dueño | Seguridad | M |
| SEC-7 | 🟡 | `uniqueCode` con `Math.random` | Seguridad | S |
| SEC-8 | 🟡 | Sin validación/rate-limit en APIs | Seguridad | M |
| LINK-5 | 🟡 | `/success` con rutas 404 y datos falsos | Enlaces | M |
| LINK-1 | 🟡 | Navbar: `#precios`/`#soporte` inexistentes | Enlaces | S |
| LINK-2 | 🟡 | Footer: legales/redes/anclas rotas | Enlaces | S–M |
| LINK-3 | 🟡 | "Ver demo"/"Conocer más" `href="#"` | Enlaces | S |
| LINK-4 | 🟡 | CTAs de `/planes` rotos | Enlaces | S |
| SEO-1 | 🟡 | Metadata mínima | SEO | S |
| SEO-2 | 🟡 | Landing invisible sin JS (opacity:0) | SEO/Perf | S–M |
| PERF-1 | 🟡 | Imágenes/videos base64 en BD | Performance | L |
| PERF-2 | 🟡 | `<img>` crudo (hero) | Performance | S |
| PERF-3 | 🟡 | 3 fuentes + `@import` bloqueante | Performance | S |
| ARCH-2 | 🟡 | Estilos inline masivos | Calidad | L |
| ARCH-3 | 🟡 | Parseo JSON duplicado | Calidad | M |
| UX-1 | 🟡 | Registro redirige a `/planes` | UX | S |
| UX-2 | 🟡 | Login no enruta por rol | UX | S |
| LEGAL-2 | 🟡 | Sin consentimiento al captar teléfonos | Legal | S |
| CLAIM-1 | 🟡 | "Cientos de barberías" | Copy | S |
| CLAIM-2 | 🟡 | Badges "NUEVO" de features inexistentes | Copy | S |
| CLAIM-3 | 🟡 | "Flyer imprimible" sobrevende | Copy | S–M |
| CFG-2 | 🟡 | QR cae a localhost sin env | Deploy | S |
| CFG-3 | 🟡 | Envs de NextAuth no documentadas | Deploy | S |
| ARCH-1 | 🟡 | Código/assets muertos | Calidad | S |
| A11Y-1 | 🟡 | Botones-icono sin label | A11y | S |
| A11Y-2 | 🟡 | `alt` genéricos / contraste | A11y | S |
| SEC-9 | 🟢 | Prisma loguea queries en prod | Seguridad | S |
| SEO-3 | 🟢 | Sin sitemap/robots/manifest | SEO | S |
| ARCH-4 | 🟢 | Dead code en layout `[slug]` | Calidad | S |
| ARCH-5 | 🟢 | `as any` en sesión | Calidad | S |
| ARCH-6/7 | 🟢 | README boilerplate / sin `.env.example` | Calidad | S |
| A11Y-3 | 🟢 | `target="_blank"` sin `rel` | A11y | S |
| UX-4 | 🟢 | Sin validación de teléfono | UX | S |
| CFG-4 | 🟢 | `dev.db` duplicado / `dotenv` sin uso | Deploy | S |

---

## Lo que ya está bien (no tocar)
- Verificación de **propiedad** en `admin/[slug]/layout.tsx` (un dueño solo ve su barbería; ADMIN ve todas).
- **Límites de plan** aplicados en servidor (FREE ≤ 3 clientes) en `customer/register` y en la landing pública.
- Generación de **QR** server-side funcional.
- Uso de **Server Components** para el data-fetching y `notFound()` correcto en rutas dinámicas.
