"use client";

import { useState } from "react";

export default function CopyReferralLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: seleccionar el texto del input.
      const input = document.getElementById("referral-link-input") as HTMLInputElement | null;
      input?.select();
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <input
        id="referral-link-input"
        readOnly
        value={link}
        onFocus={(e) => e.currentTarget.select()}
        className="premium-input"
        style={{ flex: 1, minWidth: "220px", fontSize: "0.85rem" }}
      />
      <button onClick={copy} className="premium-btn" style={{ whiteSpace: "nowrap" }}>
        {copied ? "✓ Copiado" : "Copiar enlace"}
      </button>
    </div>
  );
}
