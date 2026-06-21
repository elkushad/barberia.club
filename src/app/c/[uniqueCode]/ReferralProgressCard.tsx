"use client";

import { useState } from "react";

const REWARD_EMOJI: Record<string, string> = {
  CORTE_GRATIS: "✂️",
  DESCUENTO: "🏷️",
  PRODUCTO: "📦",
  TEXT: "🎁",
};

// El progreso de referidos se muestra arriba con la barra celeste; aquí solo
// el encabezado/descripción de la recompensa y el botón para copiar el enlace.
export default function ReferralProgressCard({
  reward,
  referralUrl,
}: {
  reward: { name: string; rewardType: string; description: string | null };
  referralUrl: string;
}) {
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

  const emoji = REWARD_EMOJI[reward.rewardType] ?? "🎁";

  return (
    <div
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        padding: "1.5rem",
      }}
    >
      {/* Encabezado */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem" }}>
        <span style={{ fontSize: "1.75rem" }}>{emoji}</span>
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>
            Gana {reward.name} invitando amigos
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Invita amigos a registrarse y confirmar su primera visita.
          </p>
          {reward.description && (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
              {reward.description}
            </p>
          )}
        </div>
      </div>

      {/* CTA: copiar enlace */}
      <button
        onClick={copy}
        className="premium-btn"
        style={{ width: "100%", padding: "10px", fontSize: "0.9rem" }}
      >
        {copied ? "✓ ¡Enlace copiado!" : "Copiar enlace de invitación"}
      </button>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem", textAlign: "center", marginTop: "0.5rem" }}>
        Comparte este enlace con tus amigos para que se registren
      </p>
    </div>
  );
}
