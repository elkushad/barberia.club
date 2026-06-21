"use client";

// Dirección del negocio (editable por la barbería en /configuracion).
// Subrayada y clickeable: abre la ubicación en la app de mapas del dispositivo.
// Se usa <span> (no <a>) porque va dentro del <Link> de la card; detiene la
// propagación/navegación para abrir el mapa en lugar de ir a la barbería.
export default function AddressMapLink({ address }: { address: string }) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, "_blank", "noopener,noreferrer");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          window.open(url, "_blank", "noopener,noreferrer");
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "3px",
        marginTop: "0.25rem",
        fontSize: "0.82rem",
        color: "var(--text-secondary)",
        textDecoration: "underline",
        textUnderlineOffset: "2px",
        textDecorationColor: "rgba(255,255,255,0.35)",
        cursor: "pointer",
      }}
    >
      📍 {address}
    </span>
  );
}
