"use client";

import { useState } from "react";

// El progreso de referidos se muestra arriba con la barra celeste.
// Esta card solo ofrece copiar el enlace de invitación.
export default function ReferralProgressCard({ referralUrl }: { referralUrl: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: seleccionar el texto
      const el = document.createElement("input");
      el.value = referralUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={copy}
      className="premium-btn"
      style={{ width: "100%", padding: "12px", fontSize: "0.9rem" }}
    >
      {copied ? "✓ ¡Enlace copiado!" : "Copiar enlace de invitación"}
    </button>
  );
}
