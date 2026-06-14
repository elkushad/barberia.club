# Publicar barberia.club en producción (Vercel)

Tu sitio ya vive en **Vercel**, pero la app necesita una **base de datos en la
nube** y **almacenamiento de imágenes** para funcionar (login, registro de
clientes, panel). Esta guía lo deja operativo. Todo es **gratis** y toma
~15–20 min. Hazlo una sola vez.

Lo que vas a configurar:

| Qué | Para qué | Variable |
|---|---|---|
| PostgreSQL (Neon) | Guardar barberías, clientes, visitas | `DATABASE_URL` |
| Vercel Blob | Guardar logos, fondos e imágenes | `BLOB_READ_WRITE_TOKEN` |
| Claves de la app | Seguridad de sesiones y URLs | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` |

---

## Paso 1 — Base de datos (Neon)

1. Entra a **https://neon.tech** y crea una cuenta gratis (puedes usar tu GitHub).
2. **Create project** → nombre `barberia` → región la más cercana → **Create**.
3. Neon te muestra una **Connection string** que empieza con `postgresql://...`.
   Cópiala **completa** (incluye la contraseña). Asegúrate de que termine en
   `?sslmode=require`.
4. Abre el archivo **`.env`** de tu proyecto (si no existe, copia `.env.example`
   y renómbralo a `.env`) y pega la cadena en:

   ```
   DATABASE_URL="postgresql://...la de Neon..."
   ```

5. Avísame: yo creo las tablas y los datos iniciales (Paso 6).

> Tu `.env` nunca se sube al repo (está protegido en `.gitignore`).

## Paso 2 — Almacenamiento de imágenes (Vercel Blob)

1. En **vercel.com**, abre el proyecto de barberia.club → pestaña **Storage**.
2. **Create Database** → elige **Blob** → **Create**.
3. Al crearlo en el proyecto, Vercel **agrega solo** la variable
   `BLOB_READ_WRITE_TOKEN`. (Si no, cópiala y guárdala para el Paso 4.)

## Paso 3 — Clave de seguridad

Genera una clave para firmar las sesiones. En una terminal, dentro del proyecto:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el texto que imprime: lo usarás como `NEXTAUTH_SECRET`.

## Paso 4 — Variables en Vercel

En el proyecto de Vercel → **Settings → Environment Variables**, agrega (entorno
**Production**):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la cadena de Neon (Paso 1) |
| `NEXTAUTH_SECRET` | la clave del Paso 3 |
| `NEXTAUTH_URL` | `https://www.barberia.club` |
| `NEXT_PUBLIC_APP_URL` | `https://www.barberia.club` |
| `BLOB_READ_WRITE_TOKEN` | la del Paso 2 (si no se agregó sola) |

Guarda los cambios.

## Paso 5 — Publicar el código nuevo

Avísame y **fusiono la rama `produccion-infra` a `main`**; Vercel desplegará
automáticamente. (Alternativa: en Vercel → Settings → Git, cambia la
**Production Branch** a `produccion-infra`.)

## Paso 6 — Crear tablas y datos iniciales

Con `DATABASE_URL` ya en tu `.env` local, elige tu contraseña de administrador
añadiendo a `.env`:

```
SEED_ADMIN_PASSWORD="tu-contraseña-segura"
SEED_OWNER_PASSWORD="otra-contraseña"
```

Luego yo ejecuto por ti:

```bash
pnpm prisma db push     # crea las tablas en Neon
node scripts/seed.mjs   # crea el usuario admin y una barbería demo
```

## Paso 7 — Verificar

Entra a **https://www.barberia.club/login** con `admin@barberia.club` y la
`SEED_ADMIN_PASSWORD` que definiste. Deberías ver el panel God Mode.

---

**Orden recomendado:** Paso 1 → me avisas → Pasos 2, 3, 4 → me avisas → Paso 5
(fusiono y despliega) → Paso 6 (creo tablas/datos) → Paso 7 (verificas).
