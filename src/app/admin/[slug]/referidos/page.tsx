import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { hasProAccess } from "@/lib/plans";
import {
  getReferralSummary,
  getReferralRows,
  reconcileReferrals,
  withdrawalWhatsAppLink,
  REFERRAL_REWARD,
  MIN_WITHDRAWAL,
} from "@/lib/referrals";
import CopyReferralLink from "./CopyReferralLink";

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", label: "Pendiente de validación" },
  AVAILABLE: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "Crédito liberado" },
  CANCELLED: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Recompensa cancelada" },
};

function money(n: number) {
  return `S/${n.toFixed(2)}`;
}

export default async function ReferidosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({ where: { slug } });
  if (!barbershop) return null;

  // El programa de referidos es exclusivo del Plan Pro. Los usuarios Free solo
  // ven una promoción; no acceden al enlace, saldo, historial ni condiciones.
  if (!hasProAccess(barbershop)) {
    return (
      <div style={{ maxWidth: "640px" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Referidos</h2>
        <div
          className="premium-card"
          style={{ textAlign: "center", padding: "2.5rem 1.5rem", border: "1px solid var(--saas-red)", boxShadow: "0 0 24px rgba(230,57,70,0.12)" }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎁</div>
          <h3 style={{ marginBottom: "0.5rem" }}>Gana dinero invitando barberías</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Con el <strong>Plan Pro</strong> obtienes tu enlace de referido y ganas{" "}
            <strong>{money(REFERRAL_REWARD)}</strong> por cada barbería que invites. Retira tu saldo a tu
            cuenta bancaria desde <strong>{money(MIN_WITHDRAWAL)}</strong>.
          </p>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "var(--saas-red)",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 800,
              padding: "4px 12px",
              borderRadius: "999px",
              letterSpacing: "0.05em",
              marginBottom: "1.5rem",
            }}
          >
            FUNCIÓN EXCLUSIVA DEL PLAN PRO
          </span>
          <div>
            <Link href={`/admin/${slug}/mi-plan`} className="premium-btn" style={{ display: "inline-block", textDecoration: "none" }}>
              Activar Plan Pro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reconciliación perezosa: libera/cancela recompensas vencidas al abrir el panel.
  await reconcileReferrals(barbershop.id);

  const summary = await getReferralSummary(barbershop.id);
  const rows = await getReferralRows(barbershop.id);

  const canWithdraw = summary.availableBalance >= MIN_WITHDRAWAL;
  const waLink = withdrawalWhatsAppLink(barbershop.name, summary.availableBalance);

  return (
    <div style={{ maxWidth: "880px" }}>
      <h2 style={{ marginBottom: "0.5rem" }}>Referidos</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Invita a otras barberías y gana <strong>{money(REFERRAL_REWARD)}</strong> por cada una que se
        mantenga en el Plan Pro durante 30 días. Ellas obtienen <strong>30% de descuento</strong> en su
        primer mes.
      </p>

      {/* Resumen */}
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          marginBottom: "1.5rem",
        }}
      >
        <div className="premium-card" style={{ textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Saldo disponible</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--accent-success, #22c55e)" }}>
            {money(summary.availableBalance)}
          </p>
        </div>
        <div className="premium-card" style={{ textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Saldo pendiente</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#9ca3af" }}>
            {money(summary.pendingBalance)}
          </p>
        </div>
        <div className="premium-card" style={{ textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Total ganado</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{money(summary.totalEarned)}</p>
        </div>
        <div className="premium-card" style={{ textAlign: "center" }}>
          <h3 style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Referidos</h3>
          <p style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{summary.referralCount}</p>
        </div>
      </div>

      {/* Retiro de saldo */}
      <div className="premium-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.25rem" }}>Retirar saldo</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          Tu saldo disponible se transfiere a tu cuenta bancaria. El retiro se solicita por el
          WhatsApp oficial de barberia.club a partir de <strong>{money(MIN_WITHDRAWAL)}</strong>.
        </p>
        {canWithdraw && waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="premium-btn"
            style={{ display: "inline-block", textDecoration: "none", backgroundColor: "#25D366", color: "white" }}
          >
            Solicitar retiro por WhatsApp ({money(summary.availableBalance)})
          </a>
        ) : (
          <button
            disabled
            className="premium-btn"
            style={{ opacity: 0.5, cursor: "not-allowed" }}
            title={`Disponible desde ${money(MIN_WITHDRAWAL)}`}
          >
            {summary.availableBalance > 0
              ? `Te faltan ${money(MIN_WITHDRAWAL - summary.availableBalance)} para retirar`
              : `Disponible desde ${money(MIN_WITHDRAWAL)}`}
          </button>
        )}
      </div>

      {/* Link de referido */}
      <div className="premium-card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.25rem" }}>Tu enlace de referido</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          Compártelo con otras barberías. Tu código es <strong>{summary.code}</strong>.
        </p>
        <CopyReferralLink link={summary.link} />
      </div>

      {/* Tabla de referidos */}
      <div className="premium-card">
        <h3 style={{ marginBottom: "1rem" }}>Tus referidos</h3>
        {rows.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Aún no tienes referidos. Comparte tu enlace para empezar a ganar.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  <th style={{ padding: "0.5rem" }}>Barbería</th>
                  <th style={{ padding: "0.5rem" }}>Registro</th>
                  <th style={{ padding: "0.5rem" }}>Estado</th>
                  <th style={{ padding: "0.5rem" }}>Días restantes</th>
                  <th style={{ padding: "0.5rem", textAlign: "right" }}>Recompensa</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const s = STATUS_STYLES[r.status];
                  return (
                    <tr key={i} style={{ borderTop: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.6rem 0.5rem", fontWeight: 500 }}>{r.name}</td>
                      <td style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)" }}>
                        {r.registeredAt.toLocaleDateString()}
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem" }}>
                        <span
                          style={{
                            color: s.color,
                            background: s.bg,
                            padding: "3px 10px",
                            borderRadius: "999px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem", color: "var(--text-secondary)" }}>
                        {r.status === "PENDING" && r.daysLeft !== null
                          ? `${r.daysLeft} días`
                          : r.status === "AVAILABLE"
                            ? "0 días"
                            : "—"}
                      </td>
                      <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: 600 }}>
                        {money(r.reward)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
