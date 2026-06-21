"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function DiscoverHeader({
  count,
  fromSlug,
  defaultCity,
  defaultCountry,
}: {
  count: number;
  fromSlug: string | null;
  defaultCity: string | null;
  defaultCountry: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scope, setScope] = useState<"ciudad" | "pais">("pais");
  const inputRef = useRef<HTMLInputElement>(null);

  const backHref = fromSlug ? `/${fromSlug}` : "/";

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const pillStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.78rem",
    fontWeight: 600,
    padding: "0.4rem 0.7rem",
    borderRadius: "9999px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
    border: active ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
    backgroundColor: active ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.03)",
    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        padding: "0.85rem 1.25rem",
        backgroundColor: "rgba(5,5,5,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      {/* Fila superior: Regresar (izq) + título centrado */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Link
          href={backHref}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            minWidth: "104px",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            textDecoration: "none",
            padding: "0.4rem 0.6rem",
            borderRadius: "9999px",
            border: "1px solid var(--border-color)",
            backgroundColor: "rgba(255,255,255,0.03)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          ⬅️ Regresar
        </Link>

        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1rem, 4vw, 1.4rem)",
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              lineHeight: 1.1,
            }}
          >
            🌐 Descubrir barberías
          </h1>
          <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            {count} {count === 1 ? "barbería disponible" : "barberías disponibles"}
          </p>
        </div>

        {/* Espaciador del mismo ancho que "Regresar" para centrar el título */}
        <div style={{ minWidth: "104px", flexShrink: 0 }} aria-hidden="true" />
      </div>

      {/* Fila de controles: lupa (izq) + búsqueda expandible + pills (der) */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.85rem" }}>
        {/* Buscador */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: searchOpen ? "1 1 auto" : "0 0 auto",
            minWidth: 0,
            backgroundColor: searchOpen ? "var(--bg-secondary)" : "transparent",
            border: searchOpen ? "1px solid var(--border-color)" : "1px solid transparent",
            borderRadius: "9999px",
            transition: "flex 0.3s ease, background-color 0.3s ease, border-color 0.3s ease",
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar barberías cercanas"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              flexShrink: 0,
              borderRadius: "50%",
              border: searchOpen ? "none" : "1px solid var(--border-color)",
              backgroundColor: searchOpen ? "transparent" : "rgba(255,255,255,0.03)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            🔎
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar barberías cercanas…"
            style={{
              flex: 1,
              minWidth: 0,
              width: searchOpen ? "100%" : "0px",
              opacity: searchOpen ? 1 : 0,
              padding: searchOpen ? "0.5rem 0.85rem 0.5rem 0.1rem" : "0",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              transition: "width 0.3s ease, opacity 0.25s ease, padding 0.3s ease",
            }}
          />
        </div>

        {/* Pills Ciudad / País (se ocultan al abrir la búsqueda) */}
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            marginLeft: "auto",
            flexShrink: 0,
            opacity: searchOpen ? 0 : 1,
            transform: searchOpen ? "translateX(8px)" : "translateX(0)",
            pointerEvents: searchOpen ? "none" : "auto",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          <button type="button" onClick={() => setScope("ciudad")} style={pillStyle(scope === "ciudad")}>
            📍 {defaultCity || "Ciudad"}
          </button>
          <button type="button" onClick={() => setScope("pais")} style={pillStyle(scope === "pais")}>
            🌎 {defaultCountry}
          </button>
        </div>
      </div>
    </header>
  );
}
