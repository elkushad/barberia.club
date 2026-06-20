"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SlidePart {
  text: string;
  accent: boolean;
}

interface Slide {
  headingParts: SlidePart[];
  subtext: string;
  cta: string;
  href: string;
}

const slides: Slide[] = [
  {
    headingParts: [
      { text: "Haz que tus clientes ", accent: false },
      { text: "regresen más seguido", accent: true },
    ],
    subtext: "Recompensa cada visita y convierte clientes ocasionales en clientes frecuentes.",
    cta: "Registrar mi barbería gratis →",
    href: "/register",
  },
  {
    headingParts: [
      { text: "Tú decides ", accent: false },
      { text: "cuándo y cómo", accent: true },
    ],
    subtext: "Personaliza tus recompensas, cuántas visitas o invitados necesitan para ganar.",
    cta: "Crear recompensas →",
    href: "/recompensas",
  },
  {
    headingParts: [
      { text: "Elige el estilo de tu ", accent: false },
      { text: "flyer", accent: true },
      { text: " y empieza hoy mismo", accent: false },
    ],
    subtext: "Obtén un QR único para tu barbería y comienza a fidelizar clientes desde el primer día.",
    cta: "Generar mi QR →",
    href: "/qr",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const router = useRouter();

  const goTo = useCallback(
    (index: number) => {
      if (animating || index === current) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 220);
    },
    [animating, current]
  );

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
          {slide.headingParts.map((part, i) =>
            part.accent ? (
              <i key={i} style={{ color: "var(--saas-red)", fontStyle: "italic" }}>
                {part.text}
              </i>
            ) : (
              <span key={i}>{part.text}</span>
            )
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
            onClick={() => router.push(slide.href)}
            className="saas-btn-primary"
            style={{
              padding: "1rem 2rem",
              fontSize: "1.05rem",
              width: "100%",
              maxWidth: "350px",
              cursor: "pointer",
              border: "none",
            }}
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
