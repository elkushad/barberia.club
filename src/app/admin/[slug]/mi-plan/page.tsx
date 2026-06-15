import { prisma } from "@/lib/prisma";
import UpgradeToPro from "@/components/UpgradeToPro";
import MercadoPagoButton from "@/components/MercadoPagoButton";
import { getReferralSummary, applyCredit, welcomeDiscountPEN } from "@/lib/referrals";

const PRO_PEN = 29.9;

export default async function MiPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({ where: { slug } });
  if (!barbershop) return null;

  const isPro = barbershop.plan === "PRO";

  // Beneficios de referidos aplicables al checkout (en PEN, referencia visual).
  const summary = await getReferralSummary(barbershop.id);
  const hasWelcomeDiscount = barbershop.discountEligible && !barbershop.discountUsed && !isPro;
  const discount = hasWelcomeDiscount ? welcomeDiscountPEN() : 0;
  const priceAfterDiscount = Math.max(0, PRO_PEN - discount);
  const credit = applyCredit(priceAfterDiscount, summary.availableBalance);

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

          {(hasWelcomeDiscount || summary.availableBalance > 0) && (
            <div
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid var(--accent-success, #22c55e)",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span>Plan Pro (Perú)</span>
                <span>S/ {PRO_PEN.toFixed(2)}</span>
              </div>
              {hasWelcomeDiscount && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", color: "var(--accent-success, #22c55e)" }}>
                  <span>Descuento referido (20%)</span>
                  <span>− S/ {discount.toFixed(2)}</span>
                </div>
              )}
              {credit.applied > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", color: "var(--accent-success, #22c55e)" }}>
                  <span>Saldo de referidos</span>
                  <span>− S/ {credit.applied.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid var(--border-color)", paddingTop: "0.4rem", marginTop: "0.4rem" }}>
                <span>Total a pagar</span>
                <span>S/ {credit.total.toFixed(2)}</span>
              </div>
              {credit.remainingCredit > 0 && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginTop: "0.5rem" }}>
                  Te quedarán S/ {credit.remainingCredit.toFixed(2)} de saldo para próximas renovaciones.
                </p>
              )}
              <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", marginTop: "0.5rem" }}>
                El descuento y el saldo se aplican a tu cuenta al confirmar el pago.
              </p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                🇵🇪 Perú — Mercado Pago (S/ 29.90)
              </p>
              <MercadoPagoButton slug={barbershop.slug} />
            </div>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                🌎 Otros países — PayPal ($10 USD)
              </p>
              <UpgradeToPro slug={barbershop.slug} />
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
