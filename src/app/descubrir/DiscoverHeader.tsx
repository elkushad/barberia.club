"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COUNTRIES } from "./countries";

export default function DiscoverHeader({
  fromSlug,
  defaultCity,
  defaultCountry,
}: {
  fromSlug: string | null;
  defaultCity: string | null;
  defaultCountry: string;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"ciudad" | "pais" | null>(null);
  const [city, setCity] = useState<string>(defaultCity || "Ciudad");
  const [country, setCountry] = useState<string>(defaultCountry);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const backHref = fromSlug ? `/${fromSlug}` : "/";

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const toggleSearch = () => {
    setOpenMenu(null);
    setSearchOpen((o) => !o);
  };

  const toggleMenu = (menu: "ciudad" | "pais") => {
    setSearchOpen(false);
    setQuery("");
    setOpenMenu((m) => (m === menu ? null : menu));
  };

  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtered = COUNTRIES.filter((c) => normalize(c).includes(normalize(query)));

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
    maxWidth: "130px",
    transition: "all 0.2s ease",
    border: active ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
    backgroundColor: active ? "rgba(212,175,55,0.14)" : "rgba(255,255,255,0.04)",
    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
  });

  return (
    <>
      {/* ── Navbar: Regresar (izq) + título centrado ───────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          padding: "0.7rem 1rem",
          backgroundColor: "rgba(5,5,5,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Link
          href={backHref}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            minWidth: "82px",
            fontSize: "0.72rem",
            fontWeight: 500,
            color: "var(--text-secondary)",
            textDecoration: "none",
            padding: "0.28rem 0.5rem",
            borderRadius: "9999px",
            border: "1px solid var(--border-color)",
            backgroundColor: "rgba(255,255,255,0.03)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          ⬅ Regresar
        </Link>

        <h1
          style={{
            flex: 1,
            margin: 0,
            textAlign: "center",
            fontSize: "clamp(1rem, 4vw, 1.4rem)",
            fontFamily: "var(--font-heading)",
            color: "var(--text-primary)",
            lineHeight: 1.1,
            minWidth: 0,
          }}
        >
          🌐 Descubrir barberías
        </h1>

        {/* Espaciador para centrar el título */}
        <div style={{ minWidth: "82px", flexShrink: 0 }} aria-hidden="true" />
      </header>

      {/* ── Barra de controles (fuera del navbar): lupa + filtros ──────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          maxWidth: "680px",
          margin: "0 auto",
          padding: "0.9rem 1rem 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Buscador con lupa expandible */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
              backgroundColor: searchOpen ? "var(--bg-secondary)" : "transparent",
              border: searchOpen ? "1px solid var(--border-color)" : "1px solid transparent",
              borderRadius: "9999px",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}
          >
            <button
              type="button"
              onClick={toggleSearch}
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
                backgroundColor: searchOpen ? "transparent" : "rgba(255,255,255,0.04)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              🔎
            </button>
            <div
              style={{
                flex: searchOpen ? 1 : "0 0 0px",
                maxWidth: searchOpen ? "640px" : "0px",
                overflow: "hidden",
                transition: "max-width 0.4s cubic-bezier(0.4,0,0.2,1), flex 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar barberías cercanas…"
                style={{
                  width: "100%",
                  padding: "0.5rem 0.85rem 0.5rem 0.2rem",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          {/* Filtros Ciudad / País (colapsan al abrir la búsqueda) */}
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexShrink: 0,
              maxWidth: searchOpen ? "0px" : "280px",
              opacity: searchOpen ? 0 : 1,
              overflow: "hidden",
              pointerEvents: searchOpen ? "none" : "auto",
              transition: "max-width 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
            }}
          >
            <button type="button" onClick={() => toggleMenu("ciudad")} style={pillStyle(openMenu === "ciudad")}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>📍 {city}</span>
              <span style={{ fontSize: "0.6rem" }}>▾</span>
            </button>
            <button type="button" onClick={() => toggleMenu("pais")} style={pillStyle(openMenu === "pais")}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>🌎 {country}</span>
              <span style={{ fontSize: "0.6rem" }}>▾</span>
            </button>
          </div>
        </div>

        {/* Panel desplegable con la lista de países del mundo */}
        {openMenu && (
          <>
            {/* Backdrop para cerrar al hacer clic fuera */}
            <div
              onClick={() => setOpenMenu(null)}
              style={{ position: "fixed", inset: 0, zIndex: 25 }}
              aria-hidden="true"
            />
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: "1rem",
                zIndex: 26,
                width: "min(280px, calc(100vw - 2rem))",
                maxHeight: "320px",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "0.6rem", borderBottom: "1px solid var(--border-color)" }}>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={openMenu === "ciudad" ? "Buscar ciudad / país…" : "Buscar país…"}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "9999px",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <p style={{ padding: "1rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.82rem" }}>
                    Sin resultados
                  </p>
                ) : (
                  filtered.map((c) => {
                    const selected = openMenu === "ciudad" ? city === c : country === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          if (openMenu === "ciudad") setCity(c);
                          else setCountry(c);
                          setOpenMenu(null);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
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
                        {c}
                        {selected && <span>✓</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
