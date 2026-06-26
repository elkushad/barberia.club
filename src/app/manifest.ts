import type { MetadataRoute } from "next";

// Web App Manifest → se sirve en /manifest.webmanifest. Necesario para que la
// app sea instalable y para empaquetarla como TWA (Android, Google Play).
// El icono debe ser PNG de al menos 512x512 (public/icon.png).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barbería Club",
    short_name: "Barbería",
    description:
      "Fideliza a tus clientes: visitas, recompensas, citas y referidos para tu barbería.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#0b0f14",
    lang: "es",
    orientation: "portrait",
    icons: [
      { src: "/icon.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
    ],
  };
}
