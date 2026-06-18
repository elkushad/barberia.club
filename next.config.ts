import type { NextConfig } from "next";

// next-auth lee `process.env.NEXTAUTH_URL` al importarse (next-auth/react) y hace
// `new URL(url ?? default)`. El "??" NO cubre el string vacío, así que un
// NEXTAUTH_URL="" provoca `new URL("")` y rompe TODO el build al prerenderizar las
// páginas estáticas (/_not-found, /admin/barberias/nueva, /godmode/barberias…).
// Los workers de prerender recargan el .env, por lo que mutar process.env aquí no
// basta. Forzamos un valor válido en tiempo de compilación con `env` (Next inlinea
// process.env.NEXTAUTH_URL en todo el bundle, incluido next-auth). Respeta el valor
// real si existe; sólo aplica el fallback cuando está vacío/ausente.
const SITE_URL = "https://barberia.club";
const nextAuthUrl = (process.env.NEXTAUTH_URL || "").trim() || SITE_URL;
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").trim() || SITE_URL;

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL: nextAuthUrl,
    NEXT_PUBLIC_APP_URL: appUrl,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
