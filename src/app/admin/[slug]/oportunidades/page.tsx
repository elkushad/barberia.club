import { prisma } from "@/lib/prisma";
import {
  computeVisitStats,
  detectOpportunities,
  type CustomerSignal,
} from "@/lib/opportunities";
import OportunidadesClient from "./OportunidadesClient";

export default async function OportunidadesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: {
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

  if (!barbershop) return null;

  const signals: CustomerSignal[] = barbershop.customers.map((c) => {
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

  const opportunities = detectOpportunities(signals, barbershop.rewards);

  // Solo lo serializable que la UI necesita (sin Date).
  const rows = opportunities.map((o) => ({
    id: o.customer.id,
    name: o.customer.name,
    situation: o.situation,
    waHref: o.waHref,
  }));

  const n = rows.length;

  return (
    <div>
      <h2 style={{ marginBottom: "0.5rem" }}>🔥 Oportunidades</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", maxWidth: "62ch" }}>
        Hoy detectamos <strong style={{ color: "var(--text-primary)" }}>{n}</strong>{" "}
        {n === 1 ? "oportunidad" : "oportunidades"} para ayudarte a recuperar clientes y
        fortalecer su fidelidad.
      </p>

      <OportunidadesClient slug={slug} rows={rows} />
    </div>
  );
}
