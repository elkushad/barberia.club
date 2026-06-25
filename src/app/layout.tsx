import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://barberia.club";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Barberia.club | Haz que cada corte cuente!",
    template: "%s · Barberia.club",
  },
  description:
    "Convierte cada corte en una oportunidad para fidelizar. Sistema de recompensas, QR personalizado y herramientas diseñadas para barberías.",
  applicationName: "barberia.club",
  keywords: ["barbería", "fidelización", "recompensas", "código QR", "clientes", "barber"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: appUrl,
    siteName: "barberia.club",
    title: "Barberia.club | Haz que cada corte cuente!",
    description:
      "Convierte cada corte en una oportunidad para fidelizar. Sistema de recompensas, QR personalizado y herramientas diseñadas para barberías.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barberia.club | Haz que cada corte cuente!",
    description:
      "Convierte cada corte en una oportunidad para fidelizar. Sistema de recompensas, QR personalizado y herramientas diseñadas para barberías.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-50KZN1XZB9";
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2085967502318437";
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "D8NCPU3C77UAV4NU4ANG";

  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <CookieConsent gaId={gaId} metaPixelId={metaPixelId} tiktokPixelId={tiktokPixelId} />
      </body>
    </html>
  );
}
