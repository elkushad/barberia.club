"use client";

import { useState } from "react";
import Link from "next/link";

export default function ReferralChecklistItem({
  href,
  done,
  rewardText,
}: {
  href: string;
  done: boolean;
  rewardText: string;
}) {
  const [showTip, setShowTip] = useState(false);
  const RED = "#E63946";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Link
        href={href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.85rem",
          textDecoration: "none",
          color: done ? "var(--text-primary)" : "var(--text-secondary)",
          flex: 1,
          minWidth: 0,
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            color: done ? "white" : "transparent",
            backgroundColor: done ? "var(--accent-success)" : "transparent",
            border: done ? "none" : "1.5px solid var(--border-color)",
          }}
        >
          ✓
        </span>
        <span>Invita a una barbería</span>
        {!done && (
          <span aria-hidden style={{ color: RED, fontSize: "0.7rem", marginLeft: "auto" }}>
            →
          </span>
        )}
      </Link>

      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTip((t) => !t);
          }}
          aria-label="Ver recompensa por referido"
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.72rem",
            color: "white",
            fontWeight: 800,
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          $
        </button>
        {showTip && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              right: 0,
              backgroundColor: "#22c55e",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: "999px",
              whiteSpace: "nowrap",
              zIndex: 20,
              boxShadow: "0 4px 12px rgba(34,197,94,0.35)",
            }}
          >
            {rewardText}
          </div>
        )}
      </div>
    </div>
  );
}
