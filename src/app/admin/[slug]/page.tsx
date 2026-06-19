import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { hasProAccess, isOnTrial, trialDaysLeft } from "@/lib/plans";
import { getReferralSummary } from "@/lib/referrals";
import DashboardActivityChart, { type ActivityPoint } from "./DashboardActivityChart";
import MonthFilterPill from "./MonthFilterPill";
import ShareLandingButton from "./ShareLandingButton";
import DashboardPromos from "./DashboardPromos";

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

function calcPct(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - prev) / prev) * 100);
}

const RED = "#E63946";

export default async function OwnerDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mes?: string }>;
}) {
  const { slug } = await params;
  const { mes } = await searchParams;

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: { _count: { select: { customers: true, rewards: true } } },
  });
  if (!barbershop) return null;

  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const parsedMes = parseInt(mes ?? "", 10);
  const selectedMes = parsedMes >= 1 && parsedMes <= 12 ? parsedMes : currentMonth;
  const monthStart = new Date(year, selectedMes - 1, 1);
  const monthEnd = new Date(year, selectedMes, 1);
  const monthRange = { gte: monthStart, lt: monthEnd };

  // Previous month for % change
  const prevMonthNum = selectedMes === 1 ? 12 : selectedMes - 1;
  const prevYear = selectedMes === 1 ? year - 1 : year;
  const prevMonthRange = { gte: new Date(prevYear, prevMonthNum - 1, 1), lt: monthStart };

  const currentMonthStart = new Date(year, now.getMonth(), 1);
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const shopVisitWhere = { customer: { barbershopId: barbershop.id }, status: "CONFIRMED" as const };

  const [
    customersThisMonth,
    visitsConfirmedTotal,
    servicesCount,
    customersMonth,
    visitsMonth,
    referralsMonth,
    earningsMonthAgg,
    newThisWeek,
    referral,
    recentVisits,
    recentCustomers,
    recentAppointments,
    recentRedemptions,
    visitRows,
    customerRows,
    prevCustomersMonth,
    prevVisitsMonth,
    prevReferralsMonth,
    prevEarningsMonthAgg,
  ] = await Promise.all([
    prisma.customer.count({ where: { barbershopId: barbershop.id, createdAt: { gte: currentMonthStart } } }),
    prisma.visit.count({ where: shopVisitWhere }),
    prisma.service.count({ where: { barbershopId: barbershop.id } }),
    prisma.customer.count({ where: { barbershopId: barbershop.id, createdAt: monthRange } }),
    prisma.visit.count({ where: { ...shopVisitWhere, createdAt: monthRange } }),
    prisma.referral.count({ where: { referrerId: barbershop.id, createdAt: monthRange } }),
    prisma.visit.aggregate({ where: { ...shopVisitWhere, createdAt: monthRange }, _sum: { servicePrice: true } }),
    prisma.customer.count({ where: { barbershopId: barbershop.id, createdAt: { gte: startOfWeek } } }),
    getReferralSummary(barbershop.id),
    prisma.visit.findMany({ where: shopVisitWhere, include: { customer: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.customer.findMany({ where: { barbershopId: barbershop.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.appointment.findMany({ where: { barbershopId: barbershop.id }, include: { customer: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.redemption.findMany({ where: { customer: { barbershopId: barbershop.id } }, include: { customer: { select: { name: true } }, reward: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.visit.findMany({ where: { ...shopVisitWhere, createdAt: { gte: last30 } }, select: { createdAt: true } }),
    prisma.customer.findMany({ where: { barbershopId: barbershop.id, createdAt: { gte: last30 } }, select: { createdAt: true } }),
    // Previous month
    prisma.customer.count({ where: { barbershopId: barbershop.id, createdAt: prevMonthRange } }),
    prisma.visit.count({ where: { ...shopVisitWhere, createdAt: prevMonthRange } }),
    prisma.referral.count({ where: { referrerId: barbershop.id, createdAt: prevMonthRange } }),
    prisma.visit.aggregate({ where: { ...shopVisitWhere, createdAt: prevMonthRange }, _sum: { servicePrice: true } }),
  ]);

  const earningsMonth = Math.round(earningsMonthAgg._sum.servicePrice ?? 0);
  const prevEarnings = Math.round(prevEarningsMonthAgg._sum.servicePrice ?? 0);
  const customersTotal = barbershop._count.customers;
  const isPro = hasProAccess(barbershop);
  const onTrial = isOnTrial(barbershop);
  const daysLeft = trialDaysLeft(barbershop);

  const customersPct = calcPct(customersMonth, prevCustomersMonth);
  const visitsPct    = calcPct(visitsMonth, prevVisitsMonth);
  const earningsPct  = calcPct(earningsMonth, prevEarnings);
  const referralsPct = calcPct(referralsMonth, prevReferralsMonth);

  const session = await getSession();
  const promoPreview = (session?.user?.email ?? "").toLowerCase() === "barberia@dos.com";

  // Chart data — últimos 30 días
  const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const dayKey = (d: Date) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  const buckets = new Map<string, ActivityPoint>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    buckets.set(dayKey(d), { label: dayKey(d), visitas: 0, clientes: 0 });
  }
  for (const v of visitRows) { const p = buckets.get(dayKey(v.createdAt)); if (p) p.visitas++; }
  for (const c of customerRows) { const p = buckets.get(dayKey(c.createdAt)); if (p) p.clientes++; }
  const chartData = [...buckets.values()];

  // Checklist
  let banners: string[] = [];
  try {
    const parsed = JSON.parse(barbershop.banner || "[]");
    banners = Array.isArray(parsed) ? parsed : barbershop.banner ? [barbershop.banner] : [];
  } catch { if (barbershop.banner) banners = [barbershop.banner]; }
  const hasVideo = banners.some(isVideoUrl);
  const hasImage = banners.some((u) => !isVideoUrl(u));

  const checklist = [
    { label: "Crear tu primera recompensa",  done: barbershop._count.rewards > 0,    href: `/admin/${slug}/recompensas` },
    { label: "Subir logo a tu landing",       done: !!barbershop.logo,               href: `/admin/${slug}/configuracion` },
    { label: "Agrega un servicio a tu lista", done: servicesCount > 0,               href: `/admin/${slug}/servicios` },
    { label: "Registrar tu primera visita",   done: visitsConfirmedTotal > 0,        href: `/admin/${slug}/qr` },
    { label: "Subir 1 foto y video",          done: hasImage && hasVideo,            href: `/admin/${slug}/configuracion` },
    { label: "Referir una barbería",          done: referral.referralCount > 0,      href: `/admin/${slug}/referidos` },
  ];
  const completed = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((completed / checklist.length) * 100);

  type Activity = { text: string; date: Date };
  const activity: Activity[] = [
    ...recentVisits.map((v) => ({ text: `${v.customer?.name ?? "Un cliente"} registró una visita`, date: v.createdAt })),
    ...recentCustomers.map((c) => ({ text: `${c.name} se registró`, date: c.createdAt })),
    ...recentAppointments.map((a) => ({ text: `${a.customer?.name ?? "Un cliente"} agendó una cita`, date: a.createdAt })),
    ...recentRedemptions.map((r) => ({ text: `${r.customer?.name ?? "Un cliente"} canjeó: ${r.reward?.name ?? "recompensa"}`, date: r.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const card: React.CSSProperties = {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "16px",
    padding: "1.25rem",
  };

  const actionStyle = (primary?: boolean): React.CSSProperties => ({
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
    borderColor: primary ? RED : "var(--border-color)",
    textAlign: "center",
    WebkitTapHighlightColor: "transparent",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  return (
    <div>
      {/* Responsive styles for desktop layout */}
      <style>{`
        .dash-root { display: flex; flex-direction: column; gap: 1rem; }
        .dash-stat-grid  { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.75rem; }
        .dash-action-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.75rem; }
        .dash-bottom { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .dash-side-stats { display: flex; flex-direction: column; gap: 0.75rem; }
        .dash-action-btn:hover { border-color: rgba(230,57,70,0.6) !important; box-shadow: 0 0 18px rgba(230,57,70,0.12) !important; }
        .dash-stat-card:hover { border-color: rgba(230,57,70,0.25) !important; box-shadow: 0 0 16px rgba(230,57,70,0.07) !important; }
        @keyframes dashFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .dash-animate { animation: dashFadeIn 0.35s ease both; }
        @media (min-width: 900px) {
          .dash-stat-grid   { grid-template-columns: repeat(4,1fr); }
          .dash-action-grid { grid-template-columns: repeat(4,1fr); }
          .dash-bottom      { grid-template-columns: 1fr 210px; align-items: start; }
        }
      `}</style>

      <DashboardPromos isPro={isPro} slug={slug} preview={promoPreview} />

      <div className="dash-root">

        {/* HERO */}
        <div
          className="dash-animate"
          style={{
            ...card,
            background: `linear-gradient(135deg, ${RED}22 0%, rgba(15,15,20,0.85) 60%)`,
            border: `1px solid ${RED}44`,
            padding: "1.5rem",
            boxShadow: `0 0 40px ${RED}0e`,
            animationDelay: "0ms",
          }}
        >
          <h2 style={{ fontSize: "1.4rem", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Bienvenido, {barbershop.name}
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            Aquí tienes el resumen de tu negocio.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", marginTop: "1.25rem" }}>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.68rem", letterSpacing: "0.12em", margin: 0 }}>CLIENTES</p>
              <p style={{ fontSize: "2.6rem", fontWeight: 800, margin: 0, lineHeight: 1 }}>
                {customersTotal}
                {customersThisMonth > 0 && (
                  <span style={{ fontSize: "0.95rem", color: "var(--accent-success)", marginLeft: "10px", fontWeight: 700 }}>
                    +{customersThisMonth} este mes
                  </span>
                )}
              </p>
            </div>
            {(isPro || onTrial) && (
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <span style={{ backgroundColor: "rgba(46,204,113,0.12)", color: "var(--accent-success)", border: "1.5px solid var(--accent-success)", fontSize: "0.72rem", fontWeight: 800, padding: "4px 14px", borderRadius: "999px", letterSpacing: "0.08em" }}>
                  PRO
                </span>
                {onTrial && (
                  <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.7rem", whiteSpace: "nowrap" }}>
                    Te {daysLeft === 1 ? "queda 1 día" : `quedan ${daysLeft} días`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MES */}
        <div style={{ display: "flex", justifyContent: "flex-start" }} className="dash-animate">
          <MonthFilterPill selected={selectedMes} max={currentMonth} />
        </div>

        {/* STAT CARDS */}
        <div className="dash-stat-grid dash-animate" style={{ animationDelay: "80ms" }}>
          <Stat label="CLIENTES"           value={String(customersMonth)}          change={customersPct} />
          <Stat label="VISITAS REGISTRADAS" value={String(visitsMonth)}            change={visitsPct} />
          <Stat label="GANANCIAS"           value={`S/ ${earningsMonth.toLocaleString("es")}`} change={earningsPct} />
          <Stat label="REFERIDOS"           value={String(referralsMonth)}         change={referralsPct} />
        </div>

        {/* QUICK ACTIONS */}
        <div className="dash-action-grid dash-animate" style={{ animationDelay: "120ms" }}>
          <Link href={`/admin/${slug}/recompensas`} className="dash-action-btn" style={{ ...actionStyle(true) }}>
            <span aria-hidden style={{ color: RED }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </span>
            Crear Recompensa
          </Link>
          <Link href={`/admin/${slug}/qr`} className="dash-action-btn" style={actionStyle()}>
            <span aria-hidden style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill="currentColor"/><rect x="16" y="5" width="3" height="3" fill="currentColor"/><rect x="5" y="16" width="3" height="3" fill="currentColor"/></svg>
            </span>
            Descargar QR
          </Link>
          <ShareLandingButton slug={slug} shopName={barbershop.name} />
          <Link href={`/admin/${slug}/clientes`} className="dash-action-btn" style={actionStyle()}>
            <span aria-hidden style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            Ver clientes
          </Link>
        </div>

        {/* CHECKLIST */}
        {progressPct < 100 && (
          <div style={{ ...card, animationDelay: "160ms" }} className="dash-animate">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ margin: 0, fontSize: "1rem" }}>Estado de tu barbería</h3>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{progressPct}% completado</span>
            </div>
            <div style={{ height: "6px", borderRadius: "999px", backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: "1rem" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${RED}, #ff6b6b)`, borderRadius: "999px", transition: "width 0.6s ease", boxShadow: `0 0 8px ${RED}66` }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.6rem 1rem" }}>
              {checklist.map((c) => (
                <Link key={c.label} href={c.href} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", textDecoration: "none", color: c.done ? "var(--text-primary)" : "var(--text-secondary)" }}>
                  <span style={{ flexShrink: 0, width: "18px", height: "18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: c.done ? "white" : "transparent", backgroundColor: c.done ? "var(--accent-success)" : "transparent", border: c.done ? "none" : "1.5px solid var(--border-color)" }}>✓</span>
                  <span>{c.label}</span>
                  {!c.done && <span aria-hidden style={{ color: RED, fontSize: "0.7rem", marginLeft: "auto" }}>→</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CHART + SIDE STATS */}
        <div className="dash-bottom dash-animate" style={{ animationDelay: "200ms" }}>
          {/* Chart */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1rem" }}>Actividad últimos 30 días</h3>
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: RED, display: "inline-block" }} />
                  Visitas registradas
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "inline-block" }} />
                  Nuevos clientes
                </span>
              </div>
            </div>
            <DashboardActivityChart data={chartData} />
          </div>

          {/* Side stats */}
          <div className="dash-side-stats">
            <SideStat label="Total visitas"    value={visitsMonth}    change={visitsPct} />
            <SideStat label="Nuevos clientes"  value={customersMonth} change={customersPct} />
            {earningsMonth > 0 && (
              <SideStat label="Ganancias mes" value={`S/ ${earningsMonth}`} change={earningsPct} isCurrency />
            )}
          </div>
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div style={{ ...card, animationDelay: "240ms" }} className="dash-animate">
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>Actividad reciente</h3>
          {activity.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>Aún no hay actividad. Comparte tu QR para empezar.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {activity.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, marginTop: "6px", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: i === 0 ? RED : "var(--border-color)" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "0.875rem" }}>{a.text}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>{timeAgo(a.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECOMENDACIÓN */}
        <div style={{ ...card, border: `1px solid ${RED}55`, boxShadow: `0 0 24px ${RED}0d` }}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span aria-hidden>💡</span> Recomendación
          </h3>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.55 }}>
            {newThisWeek > 0 ? (
              <>Tu landing recibió <strong style={{ color: "var(--text-primary)" }}>{newThisWeek} {newThisWeek === 1 ? "nuevo registro" : "nuevos registros"}</strong> esta semana. Comparte nuevamente tu QR para aumentar tus clientes.</>
            ) : (
              <>Comparte tu QR en el local y por WhatsApp para empezar a recibir clientes y registrar visitas.</>
            )}
          </p>
        </div>

        {!isPro && (
          <div style={card}>
            <h3 style={{ marginBottom: "0.5rem" }}>Sube al plan Pro 💈</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Clientes ilimitados, hasta 10 recompensas, historial completo y más. Desde <strong>S/ 29.90/mes</strong>.
            </p>
            <Link href={`/admin/${slug}/mi-plan`} className="premium-btn" style={{ display: "inline-block", textDecoration: "none" }}>
              Ver planes y pagar
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Stat card (mes seleccionado) ──────────────────────────────────────── */
function Stat({ label, value, change }: { label: string; value: string; change?: number | null }) {
  return (
    <div
      className="dash-stat-card"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "16px",
        padding: "1.1rem 1.25rem",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <p style={{ color: "var(--text-secondary)", fontSize: "0.65rem", letterSpacing: "0.1em", margin: 0, fontWeight: 600 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", marginTop: "0.3rem" }}>
        <p style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, lineHeight: 1 }}>{value}</p>
        {change !== null && change !== undefined && (
          <span style={{
            color: change >= 0 ? "var(--accent-success)" : "#ef4444",
            fontSize: "0.78rem",
            fontWeight: 700,
            marginBottom: "3px",
          }}>
            {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Side stat (junto al chart) ────────────────────────────────────────── */
function SideStat({ label, value, change, isCurrency }: { label: string; value: number | string; change?: number | null; isCurrency?: boolean }) {
  const display = isCurrency ? String(value) : String(value);
  return (
    <div style={{
      backgroundColor: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "14px",
      padding: "1rem 1.25rem",
    }}>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", margin: "0 0 0.3rem", fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, lineHeight: 1 }}>{display}</p>
      {change !== null && change !== undefined && (
        <span style={{ color: change >= 0 ? "var(--accent-success)" : "#ef4444", fontSize: "0.78rem", fontWeight: 700, marginTop: "4px", display: "block" }}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
        </span>
      )}
    </div>
  );
}
