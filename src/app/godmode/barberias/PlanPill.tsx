"use client";

import { useState, useRef, useEffect } from "react";

export default function PlanPill({
  id,
  plan,
  action,
}: {
  id: string;
  plan: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isPro = plan === "PRO";
  const target = isPro ? "FREE" : "PRO";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Cambiar plan"
        style={{ padding: "4px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer", border: "none", display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: isPro ? "rgba(59, 130, 246, 0.15)" : "rgba(156, 163, 175, 0.15)", color: isPro ? "#3b82f6" : "var(--text-secondary)" }}
      >
        {plan} <span style={{ fontSize: "0.65rem" }}>▾</span>
      </button>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "4px", backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "0.5rem", zIndex: 50, minWidth: "150px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: "0 0 0.5rem 0" }}>Cambiar plan a:</p>
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="plan" value={target} />
            <button
              type="submit"
              onClick={() => setOpen(false)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold", backgroundColor: target === "PRO" ? "#3b82f6" : "var(--bg-secondary)", color: target === "PRO" ? "white" : "var(--text-primary)" }}
            >
              {target}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
