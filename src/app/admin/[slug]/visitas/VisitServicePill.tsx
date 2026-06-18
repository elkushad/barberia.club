"use client";

import { useRef, useState, useTransition, useEffect } from "react";

interface SvcOption {
  id: string;
  name: string;
  price: number;
}

export default function VisitServicePill({
  visitId,
  services,
  currentServiceId,
  onSelect,
}: {
  visitId: string;
  services: SvcOption[];
  currentServiceId: string | null;
  onSelect: (visitId: string, serviceId: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = services.find((s) => s.id === currentServiceId);
  const label = current ? `${current.name} · S/ ${current.price}` : "Sin servicio";

  if (services.length === 0) {
    return <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Configura tus servicios</span>;
  }

  function choose(id: string) {
    setOpen(false);
    if (id === currentServiceId) return;
    startTransition(async () => {
      await onSelect(visitId, id);
    });
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 12px",
          borderRadius: "999px",
          border: "1px solid var(--border-color)",
          backgroundColor: "rgba(255,255,255,0.06)",
          color: "var(--text-primary)",
          fontSize: "0.78rem",
          fontWeight: 600,
          cursor: "pointer",
          opacity: pending ? 0.6 : 1,
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
      >
        {pending ? "Guardando…" : label}
        <span aria-hidden style={{ fontSize: "0.6rem", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 50,
            minWidth: "180px",
            maxHeight: "240px",
            overflowY: "auto",
            backgroundColor: "var(--bg-tertiary, #1f1f1f)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            padding: "4px",
          }}
        >
          {services.map((s) => {
            const active = s.id === currentServiceId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => choose(s.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  background: active ? "rgba(230,57,70,0.15)" : "transparent",
                  color: active ? "#E63946" : "var(--text-primary)",
                  fontSize: "0.82rem",
                  fontWeight: active ? 700 : 500,
                  textAlign: "left",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span>{s.name}</span>
                <span style={{ color: "var(--text-secondary)" }}>S/ {s.price}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
