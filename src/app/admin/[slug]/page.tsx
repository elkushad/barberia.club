import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { hasProAccess, isOnTrial } from "@/lib/plans";
import { getReferralSummary } from "@/lib/referrals";
import DashboardActivityChart, { type ActivityPoint } from "./DashboardActivityChart";

function isVideoUrl(u: string) {
  return /\.(mp4|webm|mov|m4v|ogg)$/i.test(u) || u.startsWith("data:video/");
}

function timeAgo(date: Date): string {
  const min = Math.floor((Date.now() - date.getTime()) / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "hace 1 día" : `hace ${d} días`;
}

const RED = "#E63946";

export default async function OwnerDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: { _count: { select: { customers: true, rewards: true } } },
  });
  if (!barbershop) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const shopVisitWhere = { customer: { barbershopId: barbershop.id }, status: "CONFIRMED" as const };

  const [
    customersThisMonth,
    visitsConfirmed,
    visitsThisMonth,
    referralsThisMonth,
    newThisWeek,
    referral,
    earningsTotalAgg,
    earningsMonthAgg,
    recentVisits,
    recentCustomers,
    recentRewards,
    visitRows,
    customerRows,
  ] = await Promise.all([
    prisma.customer.count({ where: { barbershopId: barbershop.id, createdAt: { gte: startOfMonth } } }),
    prisma.visit.count({ where: shopVisitWhere }),
    prisma.visit.count({ where: { ...shopVisitWhere, createdAt: { gte: startOfMonth } } }),
    prisma.referral.count({ where: { referrerId: barbershop.id, createdAt: { gte: startOfMonth } } }),
    prisma.customer.count({ where: { barbershopId: barbershop.id, createdAt: { gte: startOfWeek } } }),
    getReferralSummary(barbershop.id),
    // Ganancias = suma del precio (snapshot) de las visitas confirmadas.
    prisma.visit.aggregate({ where: shopVisitWhere, _sum: { servicePrice: true } }),
    prisma.visit.aggregate({ where: { ...shopVisitWhere, createdAt: { gte: startOfMonth } }, _sum: { servicePrice: true } }),
    prisma.visit.findMany({ where: shopVisitWhere, include: { customer: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.customer.findMany({ where: { barbershopId: barbershop.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.reward.findMany({ where: { barbershopId: barbershop.id }, orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.visit.findMany({ where: { ...shopVisitWhere, createdAt: { gte: last30 } }, select: { createdAt: true } }),
    prisma.customer.findMany({ where: { barbershopId: barbershop.id, createdAt: { gte: last30 } }, select: { createdAt: true } }),
  ]);

  const earningsTotal = Math.round(earningsTotalAgg._sum.servicePrice ?? 0);
  const earningsMonth = Math.round(earningsMonthAgg._sum.servicePrice ?? 0);

  const customersTotal = barbershop._count.customers;
  const isPro = hasProAccess(barbershop);
  const onTrial = isOnTrial(barbershop);

  // --- Serie del gráfico: últimos 30 días, por día ---
  const dayKey = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const buckets = new Map<string, ActivityPoint>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    buckets.set(dayKey(d), { label: dayKey(d), visitas: 0, clientes: 0 });
  }
  for (const v of visitRows) {
    const p = buckets.get(dayKey(v.createdAt));
    if (p) p.visitas += 1;
  }
  for (const c of customerRows) {
    const p = buckets.get(dayKey(c.createdAt));
    if (p) p.clientes += 1;
  }
  const chartData = [...buckets.values()];

  // --- Checklist "Estado de tu barbería" ---
  let banners: string[] = [];
  try {
    const parsed = JSON.parse(barbershop.banner || "[]");
    banners = Array.isArray(parsed) ? parsed : barbershop.banner ? [barbershop.banner] : [];
  } catch {
    if (barbershop.banner) banners = [barbershop.banner];
  }
  const hasVideo = banners.some(isVideoUrl);
  const hasImage = banners.some((u) => !isVideoUrl(u));

  const checklist = [
    { label: "Crear tu primera recompensa", done: barbershop._count.rewards > 0 },
    { label: "Subir logo a tu landing", done: !!barbershop.logo },
    { label: "Recibir tu primer cliente", done: customersTotal > 0 },
    { label: "Registrar tu primera visita", done: visitsConfirmed > 0 },
    { label: "Subir 1 foto y video", done: hasImage && hasVideo },
    { label: "Referir una barbería", done: referral.referralCount > 0 },
  ];
  const completed = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((completed / checklist.length) * 100);

  // --- Actividad reciente (merge de visitas, clientes y recompensas) ---
  type Activity = { text: string; date: Date };
  const activity: Activity[] = [
    ...recentVisits.map((v) => ({ text: `${v.customer?.name ?? "Un cliente"} registró una visita`, date: v.createdAt })),
    ...recentCustomers.map((c) => ({ text: `${c.name} se registró`, date: c.createdAt })),
    ...recentRewards.map((r) => ({ text: `Nueva recompensa creada: ${r.name}`, date: r.createdAt })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const actions = [
    { label: "Crear Recompensa", href: `/admin/${slug}/recompensas`, icon: "＋", primary: true },
    { label: "Descargar QR", href: `/admin/${slug}/qr`, icon: "▢" },
    { label: "Compartir Landing", href: `/${slug}`, icon: "🔗", external: true },
    { label: "Ver clientes", href: `/admin/${slug}/clientes`, icon: "👥" },
  ];

  const card: React.CSSProperties = {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    padding: "1.25rem",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "640px", margin: "0 auto" }}>
      {/* HEADER */}
      <div
        style={{
          ...card,
          background: `linear-gradient(135deg, ${RED}26, rgba(20,20,20,0.6))`,
          border: `1px solid ${RED}55`,
          padding: "1.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Bienvenido, {barbershop.name}</h2>
            <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              Aquí tienes el resumen de tu negocio.
            </p>
          </div>
          {(isPro || onTrial) && (
            <span style={{ flexShrink: 0, backgroundColor: onTrial ? "rgba(46,204,113,0.15)" : `${RED}33`, color: onTrial ? "var(--accent-success)" : RED, border: `1px solid ${onTrial ? "var(--accent-success)" : RED}`, fontSize: "0.7rem", fontWeight: 800, padding: "4px 10px", borderRadius: "999px", letterSpacing: "0.05em" }}>
              {onTrial ? "PRUEBA PRO" : "PLAN PRO"}
            </span>
          )}
        </div>
        <div style={{ marginTop: "1.25rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.7rem", letterSpacing: "0.1em", margin: 0 }}>CLIENTES</p>
          <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0, lineHeight: 1 }}>
            {customersTotal}
            {customersThisMonth > 0 && <span style={{ fontSize: "1rem", color: "var(--accent-success)", marginLeft: "8px", fontWeight: 700 }}>+{customersThisMonth} este mes</span>}
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
        <Stat label="CLIENTES" value={String(customersTotal)} delta={customersThisMonth > 0 ? `+${customersThisMonth}` : null} />
        <Stat label="VISITAS REGISTRADAS" value={String(visitsConfirmed)} delta={visitsThisMonth > 0 ? `+${visitsThisMonth}` : null} />
        <Stat label="GANANCIAS" value={`S/ ${earningsTotal}`} delta={earningsMonth > 0 ? `+S/ ${earningsMonth}` : null} />
        <Stat label="REFERIDOS" value={String(referral.referralCount)} delta={referralsThisMonth > 0 ? `+${referralsThisMonth}` : null} />
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            target={a.external ? "_blank" : undefined}
            style={{
              ...card,
              padding: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              textDecoration: "none",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              borderColor: a.primary ? RED : "var(--border-color)",
              textAlign: "center",
            }}
          >
            <span aria-hidden style={{ color: a.primary ? RED : "var(--text-secondary)" }}>{a.icon}</span>
            {a.label}
          </Link>
        ))}
      </div>

      {/* CHECKLIST */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Estado de tu barbería</h3>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{progressPct}% completado</span>
        </div>
        <div style={{ height: "8px", borderRadius: "999px", backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: "1rem" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: RED, borderRadius: "999px", transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.6rem 1rem" }}>
          {checklist.map((c) => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: c.done ? "var(--text-primary)" : "var(--text-secondary)" }}>
              <span style={{ flexShrink: 0, width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: c.done ? "white" : "transparent", backgroundColor: c.done ? "var(--accent-success)" : "transparent", border: c.done ? "none" : "1.5px solid var(--border-color)" }}>✓</span>
              {c.label}
            </div>
          ))}
        </div>
      </div>

      {/* CHART */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Actividad últimos 30 días</h3>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: RED }} />Visitas registradas</span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#3b82f6" }} />Nuevos clientes</span>
          </div>
        </div>
        <DashboardActivityChart data={chartData} />
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <div style={card}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>Actividad reciente</h3>
        {activity.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>Aún no hay actividad. Comparte tu QR para empezar.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {activity.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, marginTop: "5px", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: i === 0 ? RED : "var(--border-color)" }} />
                <div>
                  <p style={{ margin: 0, fontSize: "0.88rem" }}>{a.text}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>{timeAgo(a.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECOMENDACIÓN */}
      <div style={{ ...card, border: `1px solid ${RED}66`, boxShadow: `0 0 20px ${RED}1a` }}>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span aria-hidden>💡</span> Recomendación
        </h3>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5 }}>
          {newThisWeek > 0 ? (
            <>Tu landing recibió <strong style={{ color: "var(--text-primary)" }}>{newThisWeek} {newThisWeek === 1 ? "nuevo registro" : "nuevos registros"}</strong> esta semana. Comparte nuevamente tu QR para aumentar tus clientes.</>
          ) : (
            <>Comparte tu QR en el local y por WhatsApp para empezar a recibir clientes y registrar visitas.</>
          )}
        </p>
      </div>

      {!isPro && (
        <div style={{ ...card }}>
          <h3 style={{ marginBottom: "0.5rem" }}>Sube al plan Pro 💈</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Clientes ilimitados, hasta 10 recompensas, WhatsApp integrado y más. Desde <strong>S/ 29.90/mes</strong>.
          </p>
          <Link href={`/admin/${slug}/mi-plan`} className="premium-btn" style={{ display: "inline-block", textDecoration: "none" }}>
            Ver planes y pagar
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta: string | null }) {
  return (
    <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "1rem" }}>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.68rem", letterSpacing: "0.08em", margin: 0 }}>{label}</p>
      <p style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0.25rem 0 0", lineHeight: 1 }}>
        {value}
        {delta && <span style={{ fontSize: "0.8rem", color: "var(--accent-success)", marginLeft: "6px", fontWeight: 700 }}>{delta}</span>}
      </p>
    </div>
  );
}
