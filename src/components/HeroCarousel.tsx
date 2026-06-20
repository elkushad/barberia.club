"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    heading: "Haz que tus clientes regresen más seguido",
    subtext: "Recompensa cada visita y convierte clientes ocasionales en clientes frecuentes.",
    cta: "Registrar mi barbería gratis →",
  },
  {
    heading: "Personaliza tus recompensas",
    subtext: "Tú decides qué regalar, cuántas visitas necesitan y cómo premiar a tus mejores clientes.",
    cta: "Crear recompensas →",
  },
  {
    heading: "Elige el estilo de tu flyer y empieza hoy mismo",
    subtext: "Obtén un QR único para tu barbería y comienza a fidelizar clientes desde el primer día.",
    cta: "Generar mi QR →",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (animating || index === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 220);
  }, [animating, current]);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const slide = slides[current];

  return (
    <div style={{ flex: "1 1 500px" }}>
      <div
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}
      >
        <h1
          style={{
            fontSize: "3.8rem",
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            fontFamily: "var(--font-serif)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            minHeight: "8rem",
          }}
        >
          {slide.heading.includes("flyer") ? (
            <>
              {slide.heading.split("flyer")[0]}
              <i style={{ color: "var(--saas-red)", fontStyle: "italic" }}>flyer</i>
              {slide.heading.split("flyer")[1]}
            </>
          ) : slide.heading.includes("regresen") ? (
            <>
              Haz que tus clientes{" "}
              <i style={{ color: "var(--saas-red)", fontStyle: "italic" }}>regresen más seguido</i>
            </>
          ) : (
            <>
              <i style={{ color: "var(--saas-red)", fontStyle: "italic" }}>Personaliza</i> tus recompensas
            </>
          )}
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--saas-text-muted)",
            marginBottom: "2.5rem",
            maxWidth: "500px",
            lineHeight: 1.6,
            minHeight: "3.5rem",
          }}
        >
          {slide.subtext}
        </p>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <button
            onClick={() => {}}
            className="saas-btn-primary"
            style={{ padding: "1rem 2rem", fontSize: "1.05rem", width: "100%", maxWidth: "350px", cursor: "pointer", border: "none" }}
          >
            {slide.cta}
          </button>
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? "24px" : "8px",
              height: "8px",
              borderRadius: "999px",
              background: i === current ? "var(--saas-red)" : "rgba(255,255,255,0.2)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
