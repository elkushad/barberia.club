# Migración a PostgreSQL

La app usaba SQLite (`dev.db`), que no funciona en entornos serverless
(Vercel) porque el sistema de archivos es efímero/solo-lectura. En esta rama el
proveedor de Prisma es **PostgreSQL** (`prisma/schema.prisma`).

El esquema es portable: solo cambió la línea `provider`. No hubo que tocar tipos
ni columnas (todos los `String` mapean a `text` en Postgres).

## Pasos

1. **Crea una base PostgreSQL** en [Neon](https://neon.tech) o
   [Supabase](https://supabase.com) (ambas tienen plan gratis).

2. **Copia la connection string** a `DATABASE_URL` en tu `.env` (incluye
   `sslmode=require` en proveedores gestionados):

   ```bash
   DATABASE_URL="postgresql://usuario:password@host:5432/barberia?sslmode=require"
   ```

3. **Genera el cliente y aplica el esquema:**

   ```bash
   pnpm prisma generate
   pnpm prisma db push        # crea las tablas a partir del schema
   ```

   > Para producción con historial de cambios, usa migraciones en lugar de
   > `db push`:
   >
   > ```bash
   > pnpm prisma migrate dev --name init
   > ```

4. **Siembra datos de prueba** (define antes `SEED_ADMIN_PASSWORD` y
   `SEED_OWNER_PASSWORD` en `.env`):

   ```bash
   node scripts/seed.mjs
   ```

## Datos existentes en `dev.db`

No se migran automáticamente. Al ser un MVP, lo normal es re-sembrar. Si
necesitas conservar datos reales de SQLite, expórtalos y reimpórtalos
manualmente (p. ej. con un script que lea el `dev.db` y escriba vía Prisma
contra Postgres) antes de descartar el archivo.

## Despliegue en Vercel

En **Project Settings → Environment Variables** define:

- `DATABASE_URL` (la base Postgres de producción)
- `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- `NEXTAUTH_URL` (la URL pública, p. ej. `https://barberia.club`)
- `NEXT_PUBLIC_APP_URL` (misma URL pública; se usa para el QR y el SEO)
- `BLOB_READ_WRITE_TOKEN` (almacenamiento de imágenes; ver PERF-1)

El `build` ya ejecuta `prisma generate`, así que el cliente se regenera en cada
despliegue.
