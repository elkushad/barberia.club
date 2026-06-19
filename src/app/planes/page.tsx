import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import ProLock from "@/components/ProLock";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { detectCountryCode, currencyForCode, usdToLocal, defaultCurrency } from "@/lib/pricing";
import ProPriceSelector from "@/components/ProPriceSelector";

const GREEN = "#22c55e";
const RED   = "#E63946";

/* ── Beneficios definitivos ── */
const PRO_BENEFITS = [
  "Clientes ilimitados",
  "Hasta 10 recompensas",
  "Historial completo (últimas 50 visitas)",
  "Landing: hasta 5 imágenes + 2 videos de fondo",
  "WhatsApp integrado",
  "Programa de referidos (gana S/10 por barbería)",
  "Servicios con precios ilimitados",
] as const;

const FREE_BENEFITS = [
  "Hasta 3 clientes",
  "1 recompensa",
  "Últimas 5 visitas en historial",
  "QR personalizado",
  "Landing básica: 1 foto o 1 video (máx. 5 seg)",
  "Plantillas de flyer: oscura y clásica",
  "1 servicio con precio configurado",
] as const;

function GreenCheck() {
  return (
    <span style={{
      width: "22px", height: "22px", borderRadius: "50%",
      backgroundColor: GREEN, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </span>
  );
}

function RedCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function Pronto() {
  return (
    <span style={{ backgroundColor: RED, color: "white", fontSize: "0.62rem", fontWeight: 800, padding: "2px 7px", borderRadius: "4px", letterSpacing: "0.06em", flexShrink: 0 }}>
      PRONTO
    </span>
  );
}

export default async function PlanesPage() {
  const session = await getSession();
  let countryCode: string | null = null;
  let slug: string | null = null;
  if (session) {
    const userId = (session.user as { id?: string })?.id;
    if (userId) {
      const shop = await prisma.barbershop.findFirst({ where: { ownerId: userId } });
      if (shop) {
        countryCode = detectCountryCode(shop.whatsapp);
        slug = shop.slug;
      }
    }
  }
  const peru = countryCode === "+51";
  const cur = currencyForCode(countryCode);
  const localApprox = !peru && cur && cur.currency !== "USD" ? await usdToLocal(cur.currency) : null;
  const freeHref = session ? "/admin" : "/register";
  const proHref  = slug ? `/admin/${slug}/mi-plan` : "/register";

  const geoCountry  = (await headers()).get("x-vercel-ip-country");
  const defaultCur  = defaultCurrency({ callingCode: countryCode, iso: geoCountry });
  const approxLabel =
    localApprox !== null && cur
      ? `≈ ${cur.symbol} ${localApprox.toLocaleString("es", { maximumFractionDigits: 0 })} en tu moneda (aprox.)`
      : null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--saas-bg)", color: "white" }}>
      <PublicNavbar />

      <main style={{ flexGrow: 1, paddingTop: "88px", paddingBottom: "5rem" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "0 1.25rem" }}>

          {/* ── Banner 7 días gratis ── */}
          <div style={{
            backgroundColor: "rgba(34,197,94,0.07)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "14px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.875rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, margin: "0 0 4px", fontSize: "0.95rem", color: "white", lineHeight: 1.4 }}>
                Todos los nuevos usuarios reciben 7 días de Pro gratis.
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--saas-text-muted)", margin: 0 }}>
                Sin tarjeta de crédito • Cancela cuando quieras
              </p>
            </div>
          </div>

          {/* ── Tres pills ── */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {["Sin contratos", "Cancela cuando quieras", "Soporte humano"].map((label) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", padding: "5px 12px", fontSize: "0.82rem", color: "#e2e8f0" }}>
                <span style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${RED}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                {label}
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════
              CARD 1 — 7 días de prueba Pro
          ══════════════════════════════════ */}
          <div style={{
            backgroundColor: "#0b1410",
            borderRadius: "20px",
            border: `2px solid ${GREEN}`,
            padding: "2rem 1.75rem 1.75rem",
            marginBottom: "1.5rem",
            position: "relative",
            boxShadow: "0 0 32px rgba(34,197,94,0.09)",
          }}>
            {/* Badge */}
            <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", backgroundColor: GREEN, color: "white", fontSize: "0.68rem", fontWeight: 800, padding: "5px 18px", borderRadius: "999px", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
              PRUÉBALO SIN RIESGO
            </div>

            <p style={{ color: "var(--saas-text-muted)", fontSize: "0.875rem", margin: "0 0 2px" }}>Prueba gratis</p>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0 0 0.75rem", color: "white" }}>7 días de prueba Pro</h2>

            <div style={{ marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "3rem", fontWeight: 800, fontFamily: "var(--font-serif)", lineHeight: 1 }}>S/. 0</span>
            </div>

            <p style={{ color: "var(--saas-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.55 }}>
              Prueba todas las funciones de Pro durante 7 días.<br/>
              Después de la prueba, tu cuenta continúa gratis.
            </p>

            {/* Beneficios durante la prueba (Pro, desbloqueados) */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {PRO_BENEFITS.map((item) => (
                <li key={item} style={{ display: "flex", gap: "10px", alignItems: "center", color: "white", fontSize: "0.9rem" }}>
                  <GreenCheck /> {item}
                </li>
              ))}
            </ul>

            {/* Separator */}
            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)", margin: "0 0 1.25rem" }} />

            {/* Plan Gratis después de la prueba */}
            <p style={{ fontSize: "0.8rem", color: "var(--saas-text-muted)", marginBottom: "0.75rem" }}>
              Al finalizar la prueba, tu plan será Gratis:
            </p>

            {/* Beneficios gratis (desbloqueados) */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0.5rem", display: "flex", flexDirection: "column", gap: "5px" }}>
              {FREE_BENEFITS.map((item) => (
                <li key={item} style={{ display: "flex", gap: "8px", alignItems: "center", color: "var(--saas-text-muted)", fontSize: "0.835rem", padding: "4px 8px" }}>
                  <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>•</span> {item}
                </li>
              ))}
            </ul>

            {/* Beneficios PRO bloqueados */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "5px" }}>
              {PRO_BENEFITS.map((item) => (
                <li key={item}>
                  <ProLock locked={true} href={proHref} radius={6}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "var(--saas-text-muted)", fontSize: "0.835rem", padding: "4px 8px" }}>
                      <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>•</span> {item}
                    </div>
                  </ProLock>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link href={freeHref} style={{
              display: "block", textAlign: "center", width: "100%",
              backgroundColor: GREEN, color: "white",
              padding: "1rem", borderRadius: "10px",
              fontWeight: 700, fontSize: "1rem", textDecoration: "none",
            }}>
              Empezar prueba gratis
            </Link>
            <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--saas-text-muted)", marginTop: "0.75rem", marginBottom: 0 }}>
              Sin tarjeta de crédito • Cancela cuando quieras
            </p>
          </div>

          {/* ══════════════════════════════════
              CARD 2 — Pro
          ══════════════════════════════════ */}
          <div style={{
            backgroundColor: "#11151c",
            borderRadius: "20px",
            border: `2px solid ${RED}`,
            padding: "2rem 1.75rem 1.75rem",
            marginBottom: "1.5rem",
            position: "relative",
            boxShadow: `0 0 32px rgba(230,57,70,0.1)`,
          }}>
            {/* Badge */}
            <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", backgroundColor: RED, color: "white", fontSize: "0.68rem", fontWeight: 800, padding: "5px 18px", borderRadius: "999px", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
              MÁS POPULAR
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.75rem", color: "white" }}>Pro</h2>

            <ProPriceSelector defaultCurrency={defaultCur} approxLabel={approxLabel} />

            <p style={{ color: "var(--saas-text-muted)", fontSize: "0.8rem", margin: "0.5rem 0 0.25rem" }}>
              Se renueva automáticamente • Cancela cuando quieras
            </p>
            <p style={{ color: "var(--saas-text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Todo lo que necesitas para hacer crecer tu negocio.
            </p>

            {/* Beneficios Pro (desbloqueados) */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.75rem", color: "#e2e8f0" }}>
              {PRO_BENEFITS.map((item) => (
                <li key={item} style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "0.9rem" }}>
                  <RedCheck /> {item}
                </li>
              ))}
              <li style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "0.9rem", color: "var(--saas-text-muted)" }}>
                <Pronto /> Automatizaciones de fidelización
              </li>
              <li style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "0.9rem", color: "var(--saas-text-muted)" }}>
                <Pronto /> Reportes avanzados
              </li>
            </ul>

            <Link href={proHref} style={{
              display: "block", textAlign: "center", width: "100%",
              backgroundColor: RED, color: "white",
              padding: "1rem", borderRadius: "10px",
              fontWeight: 700, fontSize: "1rem", textDecoration: "none",
            }}>
              Elegir Pro
            </Link>
          </div>

          {/* ── ¿Necesitas algo más? ── */}
          <div style={{
            backgroundColor: "#0d1117",
            borderRadius: "16px",
            border: "1px solid var(--saas-border)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `1px solid ${RED}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 600, color: "white", margin: "0 0 2px" }}>¿Necesitas algo más?</h4>
                <p style={{ color: "var(--saas-text-muted)", fontSize: "0.875rem", margin: 0 }}>Planes personalizados para cadenas de barberías.</p>
              </div>
            </div>
            <a href="mailto:contacto@barberia.club?subject=Consulta%20de%20ventas" style={{
              border: `1px solid rgba(255,255,255,0.2)`, backgroundColor: "transparent",
              color: "white", padding: "0.6rem 1.25rem", borderRadius: "8px",
              fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              Hablar con ventas
            </a>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
