"use client";

import { useState } from "react";
import type { ReferralProgress } from "@/lib/client-referrals";

const REWARD_EMOJI: Record<string, string> = {
  CORTE_GRATIS: "✂️",
  DESCUENTO: "🏷️",
  PRODUCTO: "📦",
  TEXT: "🎁",
};

export default function ReferralProgressCard({
  progress,
  referralUrl,
}: {
  progress: ReferralProgress;
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

  const emoji = REWARD_EMOJI[progress.reward?.rewardType ?? "TEXT"] ?? "🎁";
  const { validCount, pendingCount, required, percent, isUnlocked, reward } = progress;

  if (isUnlocked) {
    return (
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--accent-success)",
          borderRadius: "16px",
          padding: "1.5rem",
          textAlign: "center",
          boxShadow: "0 0 20px rgba(34,197,94,0.15)",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎉</div>
        <h3 style={{ marginBottom: "0.4rem", color: "var(--accent-success)" }}>
          ¡Has desbloqueado tu recompensa!
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Ya puedes reclamar:
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(34,197,94,0.1)",
            padding: "0.5rem 1.25rem",
            borderRadius: "999px",
            marginBottom: "1.25rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>{emoji}</span>
          <span style={{ fontWeight: 700, color: "var(--accent-success)" }}>{reward?.name}</span>
        </div>
        {reward?.description && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "1rem" }}>
            {reward.description}
          </p>
        )}
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "1rem" }}>
          Muestra esta pantalla en tu próxima visita para canjearla.
        </p>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
          Sigue invitando amigos para seguir ganando →
        </p>
        <button
          onClick={copy}
          className="premium-btn-secondary"
          style={{ marginTop: "0.75rem", fontSize: "0.85rem", padding: "8px 16px" }}
        >
          {copied ? "✓ Enlace copiado" : "Copiar enlace de invitación"}
        </button>
      </div>
    );
  }

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
            Gana {reward?.name ?? "una recompensa"} invitando amigos
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem" }}>
            Invita amigos a registrarse y confirmar su primera visita.
          </p>
          {reward?.description && (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
              {reward.description}
            </p>
          )}
        </div>
      </div>

      {/* Progreso */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
            marginBottom: "0.4rem",
          }}
        >
          <span>
            {validCount}/{required} amigos confirmados
          </span>
          <span>{percent}%</span>
        </div>
        <div
          style={{
            height: "10px",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${percent}%`,
              background: "linear-gradient(90deg, rgba(34,197,94,0.5), var(--accent-success))",
              borderRadius: "999px",
              transition: "width 0.6s ease",
              boxShadow: percent > 0 ? "0 0 8px rgba(34,197,94,0.4)" : "none",
            }}
          />
        </div>
        {pendingCount > 0 && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.4rem" }}>
            {pendingCount} amigo{pendingCount !== 1 ? "s" : ""} registrado{pendingCount !== 1 ? "s" : ""},
            esperando primera visita
          </p>
        )}
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
