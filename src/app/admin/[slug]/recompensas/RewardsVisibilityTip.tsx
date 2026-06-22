"use client";

import { useState } from "react";
import Link from "next/link";

// Aviso sutil (amarillo) con cierre. El estado vive solo en memoria, así que
// vuelve a mostrarse cada vez que el dueño entra de nuevo a /recompensas.
export default function RewardsVisibilityTip({ discoverHref }: { discoverHref: string }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        padding: "0.6rem 1.8rem 0.6rem 0.9rem",
        borderRadius: "10px",
        border: "1px solid rgba(212, 175, 55, 0.35)",
        backgroundColor: "rgba(212, 175, 55, 0.08)",
        color: "var(--accent-primary)",
        fontSize: "0.8rem",
        lineHeight: 1.35,
      }}
    >
      <span style={{ flex: 1 }}>
        💡 Tus recompensas son visibles para otros clientes. Considera ofrecer beneficios atractivos
      </span>
      <Link
        href={discoverHref}
        style={{
          flexShrink: 0,
          fontSize: "0.62rem",
          color: "var(--accent-primary)",
          textDecoration: "underline",
          textUnderlineOffset: "2px",
          whiteSpace: "nowrap",
        }}
      >
        Ver barberías
      </Link>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Cerrar"
        style={{
          position: "absolute",
          top: "2px",
          right: "6px",
          background: "none",
          border: "none",
          color: "var(--accent-primary)",
          cursor: "pointer",
          fontSize: "0.8rem",
          lineHeight: 1,
          padding: "2px",
        }}
      >
        ✕
      </button>
    </div>
  );
}
