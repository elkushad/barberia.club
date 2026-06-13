# barberia.club

SaaS de fidelización para barberías: registro de la barbería, generación de un
flyer con código QR imprimible, sistema de visitas y recompensas, y una base de
datos de clientes. Incluye un panel para el dueño (`/admin`) y un panel de
super‑administración (`/godmode`).

## Stack

- **Next.js 16** (App Router, Server Components) + **React 19**
- **NextAuth** (credenciales, sesión JWT)
- **Prisma** ORM — **PostgreSQL**
- **Vercel Blob** (almacenamiento de imágenes)
- **TypeScript**, **lucide-react**, **recharts**, **qrcode**

## Requisitos

- Node.js 18+ y **pnpm**

## Puesta en marcha

```bash
# 1. Instalar dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env   # y completa los valores (ver .env.example)

# 3. Aplicar el esquema a tu base de datos PostgreSQL
pnpm prisma db push

# 4. (Opcional) Datos de prueba: cuenta ADMIN, dueño demo y barbería "demo"
node scripts/seed.mjs

# 5. Arrancar en desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

> Tras cambiar el esquema de Prisma, ejecuta `pnpm prisma generate`.
> Si cambias de contraseñas (ahora se guardan con bcrypt), vuelve a correr el seed.

## Scripts

| Script | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | `prisma generate` + build de producción |
| `pnpm start` | Servir el build de producción |
| `pnpm lint` | ESLint |
| `node scripts/seed.mjs` | Sembrar datos de prueba |

## Variables de entorno

Todas se documentan en [`.env.example`](.env.example): `DATABASE_URL`,
`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `BLOB_READ_WRITE_TOKEN`
(imágenes) y las credenciales del seed (`SEED_*`).

## Estructura

```
src/
  app/
    page.tsx            Landing pública
    planes/             Precios
    login/ register/    Acceso y alta de barbería
    [slug]/             Landing pública de cada barbería (QR)
    c/[uniqueCode]/     Tarjeta de recompensas del cliente
    admin/[slug]/       Panel del dueño (clientes, visitas, recompensas, QR, config)
    godmode/            Panel de super-admin (solo rol ADMIN)
    api/                NextAuth, registro y endpoints de clientes
  components/           UI compartida
  lib/                  auth (NextAuth + guards) y cliente Prisma
prisma/schema.prisma    Modelo de datos
scripts/seed.mjs        Seed
```

## Despliegue

El proyecto usa **PostgreSQL** (compatible con Vercel/serverless). Provisiona una
base en Neon o Supabase, define `DATABASE_URL` y aplica el esquema. Guía paso a
paso en [docs/MIGRACION-POSTGRES.md](docs/MIGRACION-POSTGRES.md).

## Auditoría

Ver [`AUDIT.md`](AUDIT.md) para el informe técnico (seguridad, SEO, rendimiento,
accesibilidad, etc.) y el estado de las mejoras.
