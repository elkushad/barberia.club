import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { FLYER_TEMPLATES } from "@/lib/flyer-templates";
import PublicFlyerCard from "./PublicFlyerCard";

export default function QRPublicPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--saas-bg, #0a0d11)",
        color: "white",
      }}
    >
      <PublicNavbar />

      <main
        style={{
          flexGrow: 1,
          paddingTop: "80px",
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          padding: "5rem 1.5rem 3rem",
        }}
      >
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "2.6rem",
              fontFamily: "var(--font-serif, serif)",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Elige tu{" "}
            <i style={{ color: "var(--saas-red, #ff3366)", fontStyle: "italic" }}>diseño de flyer</i>
          </h1>
          <p
            style={{
              color: "var(--saas-text-muted, #94a3b8)",
              fontSize: "1rem",
              maxWidth: "540px",
              lineHeight: 1.6,
            }}
          >
            Elige el estilo que más te guste. Al registrar tu barbería, tu QR único se incrustará
            automáticamente en el diseño elegido — listo para imprimir.
          </p>
        </div>

        {/* Flyer grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "2.5rem",
            justifyItems: "center",
          }}
        >
          {FLYER_TEMPLATES.map((tpl) => (
            <PublicFlyerCard key={tpl.id} template={tpl} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            marginTop: "4rem",
            padding: "3rem 2rem",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            ¿Listo para tener tu QR?
          </h3>
          <p
            style={{
              color: "var(--saas-text-muted, #94a3b8)",
              marginBottom: "1.75rem",
              fontSize: "0.95rem",
            }}
          >
            Regístrate gratis y en segundos tendrás tu flyer con QR único para tu barbería.
          </p>
          <a
            href="/register"
            className="saas-btn-primary"
            style={{
              display: "inline-block",
              padding: "1rem 2.5rem",
              fontSize: "1.05rem",
              textDecoration: "none",
            }}
          >
            Registrar mi barbería GRATIS →
          </a>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
