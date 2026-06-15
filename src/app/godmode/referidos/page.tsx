import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { reconcileReferrals, audit, MIN_WITHDRAWAL } from "@/lib/referrals";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "#9ca3af" },
  AVAILABLE: { label: "Liberado", color: "#22c55e" },
  CANCELLED: { label: "Cancelado", color: "#ef4444" },
};

function money(n: number) {
  return `S/${n.toFixed(2)}`;
}

// Registra un retiro pagado: descuenta del saldo del referente (movimiento negativo).
async function registerPayout(formData: FormData) {
  "use server";
  await requireAdmin();
  const barbershopId = formData.get("barbershopId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  if (!barbershopId || !Number.isFinite(amount) || amount <= 0) return;

  // No permitir retirar más que el saldo disponible actual.
  const agg = await prisma.creditMovement.aggregate({ where: { barbershopId }, _sum: { amount: true } });
  const available = Math.max(0, agg._sum.amount ?? 0);
  if (amount > available + 1e-9) return;

  await prisma.creditMovement.create({
    data: { barbershopId, amount: -Math.abs(amount), reason: "PAID_OUT" },
  });
  await audit("REFERRAL_CREDIT_USED", barbershopId, { reason: "PAYOUT", amount });
  revalidatePath("/godmode/referidos");
}

export default async function GodmodeReferidosPage() {
  await requireAdmin();

  // Mantener saldos al día antes de listar.
  await reconcileReferrals();

  const referrers = await prisma.barbershop.findMany({
    where: { referralsMade: { some: {} } },
    include: {
      referralsMade: {
        include: { referred: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      creditMovements: true,
    },
    orderBy: { name: "asc" },
  });

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const rows = referrers.map((shop) => {
    const available = Math.max(0, shop.creditMovements.reduce((a, m) => a + m.amount, 0));
    const pending = shop.referralsMade.filter((r) => r.status === "PENDING").reduce((a, r) => a + r.rewardAmount, 0);
    const totalEarned = shop.referralsMade.filter((r) => r.status === "AVAILABLE").reduce((a, r) => a + r.rewardAmount, 0);
    return { shop, available, pending, totalEarned };
  });

  const totalToPay = rows.reduce((a, r) => a + (r.available >= MIN_WITHDRAWAL ? r.available : 0), 0);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Referidos</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Verifica las recompensas liberadas y registra los retiros que pagaste por transferencia.
          El saldo se libera solo cuando la barbería referida cumple 30 días en Pro. Retiro mínimo:{" "}
          {money(MIN_WITHDRAWAL)}.
        </p>
      </div>

      <div className="premium-card" style={{ marginBottom: "1.5rem", textAlign: "center", maxWidth: "280px" }}>
        <h3 style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Por pagar (saldo ≥ {money(MIN_WITHDRAWAL)})</h3>
        <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--accent-primary)" }}>{money(totalToPay)}</p>
      </div>

      {rows.length === 0 ? (
        <div className="premium-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
          Aún no hay barberías con referidos.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {rows.map(({ shop, available, pending, totalEarned }) => {
            const eligible = available >= MIN_WITHDRAWAL;
            return (
              <div key={shop.id} className="premium-card">
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "0.75rem" }}>
                  <div>
                    <p style={{ fontWeight: "bold" }}>{shop.name}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{shop.whatsapp || "Sin WhatsApp"}</p>
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem", textAlign: "right", fontSize: "0.85rem" }}>
                    <div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>Disponible</p>
                      <p style={{ fontWeight: "bold", color: "#22c55e" }}>{money(available)}</p>
                    </div>
                    <div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>Pendiente</p>
                      <p style={{ fontWeight: "bold", color: "#9ca3af" }}>{money(pending)}</p>
                    </div>
                    <div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>Ganado</p>
                      <p style={{ fontWeight: "bold" }}>{money(totalEarned)}</p>
                    </div>
                  </div>
                </div>

                {/* Detalle de referidos para verificar los 30 días */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  {shop.referralsMade.map((r) => {
                    const s = STATUS_LABEL[r.status];
                    const daysLeft = r.status === "PENDING" && r.unlockAt ? Math.max(0, Math.ceil((r.unlockAt.getTime() - now) / DAY)) : null;
                    return (
                      <span key={r.id} style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: "6px", background: "var(--bg-tertiary)", color: s.color }}>
                        {r.referred.name} · {s.label}
                        {daysLeft !== null ? ` (${daysLeft}d)` : ""}
                      </span>
                    );
                  })}
                </div>

                {/* Registrar retiro pagado */}
                {eligible ? (
                  <form action={registerPayout} style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <input type="hidden" name="barbershopId" value={shop.id} />
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Registrar retiro pagado:</span>
                    <input
                      type="number"
                      name="amount"
                      defaultValue={available.toFixed(2)}
                      step="0.01"
                      min="0.01"
                      max={available.toFixed(2)}
                      className="premium-input"
                      style={{ width: "110px" }}
                    />
                    <button type="submit" className="premium-btn">Marcar pagado</button>
                  </form>
                ) : (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Saldo por debajo del mínimo de retiro ({money(MIN_WITHDRAWAL)}).
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
