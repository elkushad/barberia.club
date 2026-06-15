import { prisma } from "@/lib/prisma";
import UpgradeToPro from "@/components/UpgradeToPro";
import MercadoPagoButton from "@/components/MercadoPagoButton";
import { welcomeDiscountUSD, firstMonthUSD, PRO_PRICE_USD } from "@/lib/referrals";

export default async function MiPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({ where: { slug } });
  if (!barbershop) return null;

  const isPro = barbershop.plan === "PRO";

  // Descuento de bienvenida del invitado: 20% del primer mes.
  // Solo es cobrable de forma nativa en PayPal (USD). En Mercado Pago el gancho
  // del invitado son los 7 días gratis del plan.
  const hasWelcomeDiscount = barbershop.discountEligible && !barbershop.discountUsed && !isPro;

  return (
    <div style={{ maxWidth: "640px" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Mi Plan</h2>

      <div className="premium-card" style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Plan actual</p>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: isPro ? "var(--accent-primary)" : "var(--text-primary)" }}>
          {isPro ? "Pro 💈" : "Gratis"}
        </p>
        {isPro && barbershop.expiresAt && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Activo hasta {barbershop.expiresAt.toLocaleDateString()}
          </p>
        )}
      </div>

      {!isPro ? (
        <div className="premium-card">
          <h3 style={{ marginBottom: "0.5rem" }}>Sube al plan Pro</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
            Clientes ilimitados, hasta 10 recompensas, WhatsApp integrado y más.
          </p>
          <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            <strong>S/ 29.90/mes</strong> (Perú) · <strong>$10 USD/mes</strong> (otros países) · se renueva automáticamente · cancela cuando quieras.
          </p>

          {hasWelcomeDiscount && (
            <div
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid var(--accent-success, #22c55e)",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                color: "var(--accent-success, #22c55e)",
              }}
            >
              🎁 Llegaste por una invitación. Tu beneficio de bienvenida:
              <strong> 20% de descuento</strong> en tu primer mes con PayPal (${firstMonthUSD().toFixed(2)} el
              primer mes, luego ${PRO_PRICE_USD}/mes) o <strong>7 días gratis</strong> con Mercado Pago.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                🇵🇪 Perú — Mercado Pago (S/ 29.90)
                {hasWelcomeDiscount && (
                  <> · <strong style={{ color: "var(--accent-success, #22c55e)" }}>7 días gratis</strong></>
                )}
              </p>
              <MercadoPagoButton slug={barbershop.slug} />
            </div>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                🌎 Otros países — PayPal{" "}
                {hasWelcomeDiscount ? (
                  <strong style={{ color: "var(--accent-success, #22c55e)" }}>
                    (primer mes ${firstMonthUSD().toFixed(2)}, 20% dcto · luego ${PRO_PRICE_USD})
                  </strong>
                ) : (
                  <>(${PRO_PRICE_USD} USD)</>
                )}
              </p>
              <UpgradeToPro slug={barbershop.slug} discountEligible={hasWelcomeDiscount} />
            </div>
          </div>
        </div>
      ) : (
        <div className="premium-card">
          <p style={{ color: "var(--accent-success)" }}>✓ Ya tienes el plan Pro activo. ¡Gracias por tu apoyo! 💈</p>
        </div>
      )}
    </div>
  );
}
