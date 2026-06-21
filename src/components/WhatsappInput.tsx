"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, DIAL_CODES, flagEmoji } from "@/app/descubrir/countries";

type Entry = { iso: string; name: string; dial: string };

export default function WhatsappInput({ defaultValue }: { defaultValue: string }) {
  // Países con código telefónico, ordenados por nombre.
  const entries = useMemo<Entry[]>(
    () =>
      COUNTRIES.filter((c) => DIAL_CODES[c.code]).map((c) => ({
        iso: c.code,
        name: c.name,
        dial: DIAL_CODES[c.code],
      })),
    []
  );

  // Separa el código de país del número a partir del valor guardado.
  const parsed = useMemo(() => {
    const compact = (defaultValue || "").replace(/\s+/g, "");
    if (compact.startsWith("+")) {
      // Busca el prefijo (dial) más largo que coincida.
      const match = [...entries]
        .sort((a, b) => b.dial.length - a.dial.length)
        .find((e) => compact.startsWith(e.dial));
      if (match) {
        return { iso: match.iso, number: compact.slice(match.dial.length) };
      }
    }
    return { iso: "PE", number: (defaultValue || "").replace(/^\+/, "").trim() };
  }, [defaultValue, entries]);

  const [iso, setIso] = useState(parsed.iso);
  const [number, setNumber] = useState(parsed.number);
  const [open, setOpen] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const dial = DIAL_CODES[iso] || "+51";
  const hiddenValue = number.trim() ? `${dial} ${number.trim()}` : "";

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const item = selectedRef.current;
    if (panel && item) panel.scrollTop = item.offsetTop - panel.clientHeight / 2 + item.offsetHeight / 2;

    const onScroll = (e: Event) => {
      if (panelRef.current && e.target instanceof Node && panelRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onDown = (e: Event) => {
      if (wrapRef.current && e.target instanceof Node && wrapRef.current.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input type="hidden" name="whatsapp" value={hiddenValue} />

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "stretch" }}>
        {/* Pill selector de código de país (bandera + código) */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="premium-input"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
            width: "auto",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "1.15rem" }}>{flagEmoji(iso)}</span>
          <span>{dial}</span>
          <span style={{ fontSize: "0.6rem", opacity: 0.7 }}>▾</span>
        </button>

        {/* Número */}
        <input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/[^\d\s]/g, ""))}
          className="premium-input"
          placeholder="999 000 000"
          style={{ flex: 1, minWidth: 0 }}
        />
      </div>

      {/* Desplegable con la lista de países */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 50,
            width: "min(320px, calc(100vw - 3rem))",
            maxHeight: "320px",
            overflowY: "auto",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          }}
        >
          {entries.map((e) => {
            const selected = e.iso === iso;
            return (
              <button
                key={e.iso}
                ref={selected ? selectedRef : undefined}
                type="button"
                onClick={() => {
                  setIso(e.iso);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  textAlign: "left",
                  padding: "0.6rem 0.85rem",
                  border: "none",
                  background: selected ? "rgba(212,175,55,0.12)" : "transparent",
                  color: selected ? "var(--accent-primary)" : "var(--text-primary)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{flagEmoji(e.iso)}</span>
                <span style={{ flex: 1 }}>{e.name}</span>
                <span style={{ color: "var(--text-secondary)" }}>{e.dial}</span>
                {selected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
