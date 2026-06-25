"use client";

import { OPEN_COOKIE_EVENT } from "@/components/CookieConsent";

// Enlace para reabrir el aviso de cookies y cambiar la elección. Se usa en el
// footer; despacha el evento que escucha <CookieConsent />.
export default function CookiePrefsLink({ style }: { style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_EVENT))}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        font: "inherit",
        color: "inherit",
        textAlign: "left",
        ...style,
      }}
    >
      Cookies
    </button>
  );
}
