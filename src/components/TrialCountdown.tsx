"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    ms,
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
  };
}

export default function TrialCountdown({ endsAt }: { endsAt: string }) {
  const target = new Date(endsAt).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const expired = t.ms <= 0;
  const accent = "var(--accent-success, #22c55e)";

  const units: { label: string; value: number }[] = [
    { label: "días", value: t.days },
    { label: "hrs", value: t.hours },
    { label: "min", value: t.minutes },
    { label: "seg", value: t.seconds },
  ];

  if (expired) {
    return (
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
        Tu prueba gratuita terminó. Suscríbete para recuperar los beneficios Pro.
      </p>
    );
  }

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p style={{ color: accent, fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        🎁 Prueba gratuita Pro — termina en:
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {units.map((u) => (
          <div
            key={u.label}
            style={{
              flex: "0 0 auto",
              minWidth: "54px",
              textAlign: "center",
              padding: "0.5rem 0.4rem",
              borderRadius: "10px",
              border: `1px solid ${accent}`,
              background: "rgba(34,197,94,0.08)",
            }}
          >
            <span style={{ display: "block", fontSize: "1.4rem", fontWeight: 800, lineHeight: 1, color: accent, fontVariantNumeric: "tabular-nums" }}>
              {String(u.value).padStart(2, "0")}
            </span>
            <span style={{ display: "block", fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {u.label}
            </span>
          </div>
        ))}
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginTop: "0.5rem" }}>
        Suscríbete antes de que termine para no perder los beneficios Pro.
      </p>
    </div>
  );
}
