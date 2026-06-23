import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

/**
 * Maquetación común para las páginas legales (privacidad, términos,
 * eliminación de cuenta). Usa el navbar/footer públicos y la tipografía
 * "prose" definida abajo, coherente con el resto del sitio (variables --saas-*).
 */
export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--saas-bg)", color: "white" }}>
      <PublicNavbar />

      <main style={{ flexGrow: 1, paddingTop: "88px", paddingBottom: "5rem" }}>
        <article className="legal-prose" style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1.25rem 0" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>{title}</h1>
          <p style={{ color: "var(--saas-text-muted)", fontSize: "0.9rem", marginBottom: "2.5rem" }}>
            Última actualización: {lastUpdated}
          </p>
          {children}
        </article>
      </main>

      <PublicFooter />

      <style>{`
        .legal-prose { color: var(--saas-text-muted); line-height: 1.7; }
        .legal-prose h2 {
          color: white; font-size: 1.3rem; font-weight: 600;
          margin: 2.5rem 0 1rem; padding-top: 0.5rem;
        }
        .legal-prose h3 {
          color: var(--text-primary); font-size: 1.05rem; font-weight: 600;
          margin: 1.75rem 0 0.75rem;
        }
        .legal-prose p { margin: 0 0 1rem; }
        .legal-prose ul, .legal-prose ol { margin: 0 0 1rem; padding-left: 1.4rem; }
        .legal-prose li { margin-bottom: 0.5rem; }
        .legal-prose a { color: var(--saas-red); text-decoration: underline; text-underline-offset: 2px; }
        .legal-prose strong { color: var(--text-primary); }
        .legal-prose table {
          width: 100%; border-collapse: collapse; margin: 1rem 0 1.5rem; font-size: 0.9rem;
        }
        .legal-prose th, .legal-prose td {
          border: 1px solid var(--saas-border); padding: 0.6rem 0.75rem; text-align: left; vertical-align: top;
        }
        .legal-prose th { color: white; background: rgba(255,255,255,0.03); font-weight: 600; }
        .legal-prose hr { border: none; border-top: 1px solid var(--saas-border); margin: 2.5rem 0; }
        .legal-note {
          background: rgba(230,57,70,0.08); border: 1px solid rgba(230,57,70,0.35);
          border-radius: 8px; padding: 0.9rem 1.1rem; margin: 0 0 1.5rem; font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
