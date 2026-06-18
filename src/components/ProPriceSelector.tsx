"use client";

import { useState } from "react";

type Currency = "PEN" | "USD";

const PRICES: Record<Currency, { amount: string; suffix: string }> = {
  PEN: { amount: "S/ 29.90", suffix: "/mes" },
  USD: { amount: "$10", suffix: "USD/mes" },
};

// Segmented control PEN | USD para la card del plan Pro.
// El cobro real ya está resuelto (Mercado Pago para soles, PayPal para dólares);
// esto solo refleja el precio de forma clara según la moneda elegida.
export default function ProPriceSelector({
  defaultCurrency = "PEN",
  approxLabel = null,
}: {
  defaultCurrency?: Currency;
  approxLabel?: string | null;
}) {
  const [cur, setCur] = useState<Currency>(defaultCurrency);
  const options: Currency[] = ["PEN", "USD"];

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      {/* Segmented control */}
      <div
        role="group"
        aria-label="Moneda"
        style={{
          display: "inline-flex",
          padding: "3px",
          gap: "3px",
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid var(--saas-border)",
          borderRadius: "999px",
          marginBottom: "1rem",
        }}
      >
        {options.map((opt) => {
          const active = cur === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setCur(opt)}
              aria-pressed={active}
              style={{
                appearance: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.4rem 1.1rem",
                borderRadius: "999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: active ? "white" : "var(--saas-text-muted)",
                backgroundColor: active ? "var(--saas-red)" : "transparent",
                transition: "background-color 0.18s ease, color 0.18s ease",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Precio */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span style={{ fontSize: "3rem", fontWeight: 700, fontFamily: "var(--font-serif)", color: "white" }}>
          {PRICES[cur].amount}
        </span>
        <span style={{ color: "var(--saas-text-muted)" }}>{PRICES[cur].suffix}</span>
      </div>

      {/* Conversión aproximada (solo aplica al precio en USD para extranjeros) */}
      {cur === "USD" && approxLabel && (
        <p style={{ color: "var(--saas-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem", marginBottom: 0 }}>
          {approxLabel}
        </p>
      )}
    </div>
  );
}
