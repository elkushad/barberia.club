import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import MetaPixel from "@/components/MetaPixel";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://barberia.club";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "barberia.club — Fideliza a los clientes de tu barbería",
    template: "%s · barberia.club",
  },
  description:
    "Crea tu cuenta gratis, obtén tu flyer con código QR y premia la fidelidad de tus clientes con un sistema de recompensas pensado para barberías.",
  applicationName: "barberia.club",
  keywords: ["barbería", "fidelización", "recompensas", "código QR", "clientes", "barber"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: appUrl,
    siteName: "barberia.club",
    title: "barberia.club — Fideliza a los clientes de tu barbería",
    description:
      "Crea tu cuenta gratis, obtén tu flyer con código QR y premia la fidelidad de tus clientes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "barberia.club",
    description:
      "Fideliza a los clientes de tu barbería con recompensas y un flyer con código QR.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-50KZN1XZB9";
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2085967502318437";

  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        {metaPixelId ? <MetaPixel pixelId={metaPixelId} /> : null}
      </body>
    </html>
  );
}
