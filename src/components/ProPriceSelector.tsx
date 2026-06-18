"use client";

import { useState } from "react";

type Currency = "PEN" | "USD";

const PRICES: Record<Currency, { amount: string; suffix: string }> = {
  PEN: { amount: "S/ 29.90", suffix: "/mes" },
  USD: { amount: "$10", suffix: "USD/mes" },
};

const OPTIONS: Currency[] = ["PEN", "USD"];

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
  const activeIndex = OPTIONS.indexOf(cur);

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      {/* Keyframe para el fade del precio al cambiar de moneda */}
      <style>{`@keyframes ppPriceFade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}`}</style>

      {/* Segmented control con thumb deslizante */}
      <div
        role="group"
        aria-label="Moneda"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          width: "180px",
          padding: "4px",
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid var(--saas-border)",
          borderRadius: "999px",
          marginBottom: "1rem",
        }}
      >
        {/* Thumb animado */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: "4px",
            bottom: "4px",
            left: "4px",
            width: "calc(50% - 4px)",
            backgroundColor: "var(--saas-red)",
            borderRadius: "999px",
            transform: activeIndex === 0 ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 0,
          }}
        />
        {OPTIONS.map((opt) => {
          const active = cur === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setCur(opt)}
              aria-pressed={active}
              style={{
                position: "relative",
                zIndex: 1,
                appearance: "none",
                WebkitAppearance: "none",
                border: "none",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
                userSelect: "none",
                cursor: "pointer",
                background: "transparent",
                padding: "0.45rem 0",
                borderRadius: "999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: active ? "white" : "var(--saas-text-muted)",
                transition: "color 0.25s ease",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Precio (con fade al cambiar) */}
      <div key={cur} style={{ display: "flex", alignItems: "baseline", gap: "4px", animation: "ppPriceFade 0.3s ease" }}>
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
