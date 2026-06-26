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
    // NOTA: public/icon.png hoy es 489x979 (no cuadrado). Para la TWA hace falta
    // un PNG cuadrado de >=512x512; reemplázalo y declara aquí "512x512".
    // Mientras tanto usamos "any" para no declarar un tamaño falso.
    icons: [{ src: "/icon.png", sizes: "any", type: "image/png" }],
  };
}
