import Link from "next/link";

type Reward = { id: string; name: string; visitsRequired: number };

type Shop = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  address: string | null;
  brandColor: string | null;
  rewards: Reward[];
};

export default function BarbershopCard({ shop }: { shop: Shop }) {
  const accent = shop.brandColor && shop.brandColor !== "#000000" ? shop.brandColor : "var(--accent-primary)";
  const rewards = shop.rewards;
  // Posición horizontal del centro del primer/último hito (cells de ancho igual).
  const edge = rewards.length > 0 ? 50 / rewards.length : 50;

  return (
    <article
      style={{
        position: "relative",
        borderRadius: "20px",
        border: "1px solid var(--border-color)",
        background: "linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)",
        padding: "1.25rem 1.25rem 1.5rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        overflow: "hidden",
      }}
    >
      {/* Glow sutil con el color de marca */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background: accent,
          opacity: 0.12,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Encabezado: logo + nombre + ubicación + acceso */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", position: "relative" }}>
        {shop.logo ? (
          <img
            src={shop.logo}
            alt={shop.name}
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              objectFit: "cover",
              flexShrink: 0,
              border: "1px solid var(--border-color)",
            }}
          />
        ) : (
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-color)",
            }}
          >
            ✂️
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.2rem",
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {shop.name}
          </h2>
          {shop.address && (
            <p
              style={{
                margin: "0.2rem 0 0",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              📍 {shop.address}
            </p>
          )}
        </div>

        <Link
          href={`/${shop.slug}`}
          style={{
            flexShrink: 0,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            textDecoration: "none",
            padding: "0.4rem 0.7rem",
            borderRadius: "9999px",
            border: "1px solid var(--border-color)",
            backgroundColor: "rgba(255,255,255,0.04)",
            whiteSpace: "nowrap",
          }}
        >
          Ver barbería →
        </Link>
      </div>

      {/* Mapa de recompensas (hitos) */}
      {rewards.length > 0 ? (
        <div style={{ position: "relative", marginTop: "1.75rem" }}>
          {/* Etiquetas de recompensa sobre cada hito */}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            {rewards.map((r) => (
              <div key={r.id} style={{ flex: 1, padding: "0 2px", display: "flex", justifyContent: "center" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    textAlign: "center",
                    lineHeight: 1.15,
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.3rem 0.45rem",
                    maxWidth: "100%",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {r.name}
                </span>
              </div>
            ))}
          </div>

          {/* Línea + puntos de los hitos */}
          <div style={{ position: "relative", height: "26px", margin: "0.55rem 0 0.4rem" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${edge}%`,
                right: `${edge}%`,
                height: "3px",
                transform: "translateY(-50%)",
                background: `linear-gradient(90deg, ${accent}, var(--border-color))`,
                borderRadius: "9999px",
              }}
            />
            <div style={{ position: "relative", display: "flex", height: "100%" }}>
              {rewards.map((r) => (
                <div key={r.id} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: accent,
                      border: "3px solid var(--bg-primary)",
                      boxShadow: `0 0 10px ${accent}`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cortes necesarios bajo cada hito */}
          <div style={{ display: "flex" }}>
            {rewards.map((r) => (
              <div key={r.id} style={{ flex: 1, textAlign: "center", lineHeight: 1.1 }}>
                <span style={{ display: "block", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {r.visitsRequired}
                </span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                  {r.visitsRequired === 1 ? "corte" : "cortes"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ marginTop: "1.25rem", fontSize: "0.82rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Programa de recompensas próximamente.
        </p>
      )}
    </article>
  );
}
