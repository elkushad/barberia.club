import { prisma } from "@/lib/prisma";
import UpgradeToPro from "@/components/UpgradeToPro";
import MercadoPagoButton from "@/components/MercadoPagoButton";

export default async function MiPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({ where: { slug } });
  if (!barbershop) return null;

  const isPro = barbershop.plan === "PRO";

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
