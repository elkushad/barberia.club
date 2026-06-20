"use client";

import { useRouter } from "next/navigation";

/**
 * Envuelve contenido PRO. Para usuarios sin acceso lo muestra oscurecido
 * con un candado y texto permanente debajo. Al hacer click navega a /mi-plan.
 *
 * Si `locked` es false, renderiza los hijos tal cual.
 */
export default function ProLock({
  locked,
  slug,
  href,
  children,
  radius = 12,
  message = "Sube a PRO para seguir disfrutando los beneficios",
}: {
  locked: boolean;
  slug?: string;
  href?: string;
  children: React.ReactNode;
  radius?: number;
  message?: string;
}) {
  const router = useRouter();

  if (!locked) return <>{children}</>;

  const target = href ?? (slug ? `/admin/${slug}/mi-plan` : "/register");

  return (
    <div style={{ position: "relative", borderRadius: radius, overflow: "hidden" }}>
      {/* Contenido real, opacado y sin interacción */}
      <div
        style={{
          filter: "grayscale(0.4) brightness(0.5)",
          opacity: 0.5,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>

      {/* Capa oscura — candado + texto, clickeable */}
      <button
        type="button"
        onClick={() => router.push(target)}
        aria-label="Función exclusiva de PRO — sube a PRO para desbloquear"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.55rem",
          background: "rgba(0,0,0,0.55)",
          border: "none",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
          padding: "1rem",
        }}
      >
        {/* Candado */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>

        {/* Texto permanente */}
        <span
          style={{
            color: "rgba(255,255,255,0.92)",
            fontSize: "0.82rem",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.35,
            maxWidth: "220px",
          }}
        >
          {message}
        </span>
      </button>
    </div>
  );
}
