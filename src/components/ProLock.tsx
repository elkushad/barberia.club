"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Envuelve un beneficio exclusivo de PRO. Para usuarios sin acceso PRO lo muestra
 * SIEMPRE visible pero oscurecido/sombreado con un candado gris. Al hacer click
 * aparece un popup pequeño dentro de la card por 2s (sin opción a cerrar):
 * "Sube a PRO para desbloquear" — al tocarlo redirige a /mi-plan.
 *
 * Si `locked` es false, renderiza los hijos tal cual (usuario PRO).
 */
export default function ProLock({
  locked,
  slug,
  children,
  radius = 12,
}: {
  locked: boolean;
  slug: string;
  children: React.ReactNode;
  radius?: number;
}) {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!locked) return <>{children}</>;

  function reveal() {
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 2000);
  }

  return (
    <div style={{ position: "relative", borderRadius: radius, overflow: "hidden" }}>
      <style>{"@keyframes proNeonBlink{0%,100%{color:#ff2d2d;text-shadow:0 0 6px rgba(230,57,70,.7),0 0 12px rgba(230,57,70,.5)}50%{color:#ff7a7a;text-shadow:0 0 12px rgba(230,57,70,1),0 0 22px rgba(230,57,70,.8)}}"}</style>

      {/* Contenido real, opacado y sin interacción */}
      <div style={{ filter: "grayscale(0.5) brightness(0.55)", opacity: 0.55, pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>

      {/* Capa oscura + candado, clickeable */}
      <button
        type="button"
        onClick={reveal}
        aria-label="Función exclusiva de PRO"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.45)",
          border: "none",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      {/* Popup dentro de la card (2s, sin cerrar) */}
      {show && (
        <div
          onClick={() => router.push(`/admin/${slug}/mi-plan`)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 5,
            cursor: "pointer",
            background: "rgba(10,10,12,0.95)",
            border: "1px solid var(--saas-red, #E63946)",
            borderRadius: "10px",
            padding: "0.6rem 0.9rem",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "white",
            whiteSpace: "nowrap",
            boxShadow: "0 0 18px rgba(230,57,70,0.4)",
            animation: "proPopIn .2s ease",
          }}
        >
          <style>{"@keyframes proPopIn{from{opacity:0;transform:translate(-50%,-46%) scale(.92)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}"}</style>
          Sube a <span style={{ animation: "proNeonBlink 1s ease-in-out infinite", fontWeight: 900 }}>PRO</span> para desbloquear
        </div>
      )}
    </div>
  );
}
