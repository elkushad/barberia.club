import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Flame } from "lucide-react";
import {
  computeVisitStats,
  detectOpportunities,
  type CustomerSignal,
} from "@/lib/opportunities";

export default async function GodmodeOportunidadesPage() {
  await requireAdmin();

  const barbershops = await prisma.barbershop.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      rewards: { orderBy: { visitsRequired: "asc" }, select: { name: true, visitsRequired: true } },
      customers: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          phone: true,
          uniqueCode: true,
          visits: {
            where: { status: "CONFIRMED" },
            select: { createdAt: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  // Aplana: todas las oportunidades de todas las barberías, con su origen.
  type GlobalRow = { shop: string; name: string; situation: string; waHref: string; priority: number };
  const rows: GlobalRow[] = [];

  for (const shop of barbershops) {
    const signals: CustomerSignal[] = shop.customers.map((c) => {
      const stats = computeVisitStats(c.visits.map((v) => v.createdAt));
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        uniqueCode: c.uniqueCode,
        totalVisits: stats.totalVisits,
        lastVisitAt: stats.lastVisitAt,
        avgIntervalDays: stats.avgIntervalDays,
      };
    });

    for (const op of detectOpportunities(signals, shop.rewards)) {
      rows.push({
        shop: shop.name,
        name: op.customer.name,
        situation: op.situation,
        waHref: op.waHref,
        priority: op.priority,
      });
    }
  }

  rows.sort((a, b) => a.priority - b.priority || a.shop.localeCompare(b.shop));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Oportunidades Globales</h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: "62ch" }}>
            Todas las oportunidades detectadas en todas las barberías. Envía el mensaje desde tu
            WhatsApp Business con un toque.
          </p>
        </div>
        <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Flame size={16} color="var(--accent-primary)" />
          <span style={{ fontWeight: "bold" }}>{rows.length} Oportunidades</span>
        </div>
      </div>

      <div className="premium-card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="gopTable">
          <thead>
            <tr>
              <th>Barbería</th>
              <th>Cliente</th>
              <th>Situación</th>
              <th style={{ textAlign: "right" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.name}-${i}`}>
                <td data-label="Barbería" style={{ color: "var(--text-secondary)" }}>{row.shop}</td>
                <td data-label="Cliente" style={{ fontWeight: 600 }}>{row.name}</td>
                <td data-label="Situación">{row.situation}</td>
                <td data-label="Acción" className="gopActionCell">
                  <a
                    href={row.waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-btn-secondary gopSendBtn"
                  >
                    Enviar WhatsApp
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            No hay oportunidades detectadas en este momento.
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .gopTable { width: 100%; border-collapse: collapse; text-align: left; }
        .gopTable thead tr { background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); }
        .gopTable th {
          padding: 0.9rem 1rem; font-size: 0.75rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: .5px; color: var(--text-secondary);
        }
        .gopTable td { padding: 0.9rem 1rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
        .gopTable tbody tr:last-child td { border-bottom: none; }
        .gopActionCell { text-align: right; white-space: nowrap; }
        .gopSendBtn { padding: 8px 14px; font-size: 0.8rem; border-radius: 8px; }
        @media (max-width: 640px) {
          .gopTable thead { display: none; }
          .gopTable, .gopTable tbody, .gopTable tr, .gopTable td { display: block; width: 100%; }
          .gopTable tr {
            border: 1px solid var(--border-color); border-radius: 12px;
            background: var(--bg-secondary); margin: 0.75rem; padding: 0.35rem 0.25rem;
          }
          .gopTable td { border: none; padding: 0.55rem 0.9rem; }
          .gopTable td[data-label]::before {
            content: attr(data-label); display: block; font-size: 0.68rem;
            text-transform: uppercase; letter-spacing: .5px; color: var(--text-secondary);
            margin-bottom: 3px;
          }
          .gopActionCell { text-align: left; }
        }
      `,
        }}
      />
    </div>
  );
}
