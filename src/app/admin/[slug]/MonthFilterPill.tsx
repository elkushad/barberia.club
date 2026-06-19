"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function MonthFilterPill({ selected }: { selected: number }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(m: number) {
    setOpen(false);
    router.push(`${pathname}?mes=${m}`, { scroll: false });
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 14px",
          borderRadius: "999px",
          border: "1px solid var(--border-color)",
          backgroundColor: "rgba(255,255,255,0.06)",
          color: "var(--text-primary)",
          fontSize: "0.82rem",
          fontWeight: 700,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
      >
        {MONTHS[selected - 1]}
        <span aria-hidden style={{ fontSize: "0.6rem", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 50,
            width: "160px",
            maxHeight: "260px",
            overflowY: "auto",
            backgroundColor: "var(--bg-tertiary, #1f1f1f)",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            padding: "4px",
          }}
        >
          {MONTHS.map((name, i) => {
            const m = i + 1;
            const active = m === selected;
            return (
              <button
                key={m}
                type="button"
                onClick={() => choose(m)}
                style={{
                  display: "block",
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
                  outline: "none",
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
