"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import MetaPixel from "@/components/MetaPixel";
import TikTokPixel from "@/components/TikTokPixel";

// Consentimiento de cookies de analítica/publicidad. Sin librerías externas:
// la preferencia vive en localStorage (mismo patrón que el resto del estado de
// cliente). Las herramientas de Google/Meta/TikTok SOLO se montan si el usuario
// acepta. La cookie de sesión y el localStorage funcional no entran aquí (son
// necesarios y no requieren consentimiento).
const STORAGE_KEY = "barberia_cookie_consent";
// Evento para reabrir el aviso desde un enlace "Cookies" (footer, etc.).
export const OPEN_COOKIE_EVENT = "open-cookie-consent";

type Consent = "granted" | "denied";

export default function CookieConsent({
  gaId,
  metaPixelId,
  tiktokPixelId,
}: {
  gaId?: string;
  metaPixelId?: string;
  tiktokPixelId?: string;
}) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* localStorage no disponible: tratamos como sin elección */
    }
    if (stored === "granted" || stored === "denied") setConsent(stored);
    setReady(true);

    const reopen = () => setConsent(null);
    window.addEventListener(OPEN_COOKIE_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_EVENT, reopen);
  }, []);

  function choose(value: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignorar: aun así respetamos la elección en esta sesión */
    }
    setConsent(value);
  }

  return (
    <>
      {/* Solo se cargan tras aceptar. Al rechazar (o reabrir) se desmontan. */}
      {consent === "granted" && (
        <>
          {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
          {metaPixelId ? <MetaPixel pixelId={metaPixelId} /> : null}
          {tiktokPixelId ? <TikTokPixel pixelId={tiktokPixelId} /> : null}
        </>
      )}

      {ready && consent === null && (
        <div
          role="dialog"
          aria-label="Aviso de cookies"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "1rem",
            transform: "translateX(-50%)",
            zIndex: 500,
            width: "min(92vw, 560px)",
            background: "rgba(15,15,15,0.98)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "14px",
            padding: "1.1rem 1.25rem",
            boxShadow: "0 12px 48px rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.55, color: "#e8e8e8" }}>
            Usamos cookies de analítica y publicidad (Google, Meta y TikTok) para mejorar la
            plataforma. ¿Las aceptas? Puedes cambiar tu elección cuando quieras.{" "}
            <a
              href="/privacidad"
              style={{ color: "#E63946", textDecoration: "underline", textUnderlineOffset: "2px" }}
            >
              Más información
            </a>
            .
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => choose("granted")}
              style={{
                flex: "1 1 auto",
                padding: "10px 18px",
                borderRadius: "9px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.9rem",
                background: "#E63946",
                color: "white",
              }}
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={() => choose("denied")}
              style={{
                flex: "1 1 auto",
                padding: "10px 18px",
                borderRadius: "9px",
                border: "1px solid rgba(255,255,255,0.18)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                background: "transparent",
                color: "#e8e8e8",
              }}
            >
              Rechazar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
