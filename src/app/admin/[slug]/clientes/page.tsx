import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertCustomerAccess, generateUniqueCode } from "@/lib/guards";
import { hasProAccess } from "@/lib/plans";
import { processCustomerApprovalReferral } from "@/lib/client-referrals";
import ProLock from "@/components/ProLock";
import PendingApproveButton from "./PendingApproveButton";
import styles from "../../admin.module.css";
import FilterDropdown from "./FilterDropdown";
import SearchInput from "./SearchInput";
import ReferrerLink from "./ReferrerLink";

const FREE_CUSTOMER_LIMIT = 3;

export default async function ClientesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "recientes";
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search.toLowerCase() : "";

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: { rewards: { orderBy: { visitsRequired: "asc" } } },
  });

  if (!barbershop) return null;
  const shop = barbershop; // narrowed to non-null for use inside helper functions

  const isPro = hasProAccess(shop);

  const pendingCustomers = await prisma.customer.findMany({
    where: { barbershopId: barbershop.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      // Si fue invitado por un enlace de referido, traemos a quien lo invitó.
      referralReceived: { include: { referrer: { select: { id: true, name: true } } } },
    },
  });

  let activeCustomers = await prisma.customer.findMany({
    where: { barbershopId: barbershop.id, status: "ACTIVE" },
    include: {
      _count: { select: { visits: { where: { status: "CONFIRMED" } } } },
      visits: {
        where: { status: "CONFIRMED" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (search) {
    activeCustomers = activeCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (c.uniqueCode && c.uniqueCode.toLowerCase().includes(search)) ||
        (c.phone && c.phone.includes(search))
    );
  }

  activeCustomers.sort((a, b) => {
    if (sort === "mas-visitas") return b._count.visits - a._count.visits;
    if (sort === "menos-visitas") return a._count.visits - b._count.visits;
    if (sort === "antiguos") return a.createdAt.getTime() - b.createdAt.getTime();
    const aDate = a.visits[0]?.createdAt.getTime() || a.createdAt.getTime();
    const bDate = b.visits[0]?.createdAt.getTime() || b.createdAt.getTime();
    return bDate - aDate;
  });

  async function approveCustomer(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await assertCustomerAccess(id);

    let uniqueCode = generateUniqueCode();
    while (await prisma.customer.findUnique({ where: { uniqueCode } })) {
      uniqueCode = generateUniqueCode();
    }

    const result = await prisma.customer.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "ACTIVE", uniqueCode },
    });

    if (result.count > 0) {
      await prisma.visit.create({ data: { customerId: id, status: "CONFIRMED" } });
      // Si este cliente fue referido, marcar el referral como visita aprobada
      await processCustomerApprovalReferral(id);
    }

    revalidatePath(`/admin/${slug}/clientes`);
  }

  async function rejectCustomer(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await assertCustomerAccess(id);
    await prisma.customer.delete({ where: { id } });
    revalidatePath(`/admin/${slug}/clientes`);
  }

  const maxVisits = shop.rewards.length > 0
    ? shop.rewards[shop.rewards.length - 1].visitsRequired
    : 10;

  // Siempre aplica filtro/orden primero, luego parte visible vs bloqueada
  const visibleCustomers = isPro ? activeCustomers : activeCustomers.slice(0, FREE_CUSTOMER_LIMIT);
  const lockedCustomers  = isPro ? []              : activeCustomers.slice(FREE_CUSTOMER_LIMIT);

  // ── Render de card de cliente (idéntica para visible y bloqueada) ──────────
  function renderCustomerCard(customer: (typeof activeCustomers)[number]) {
    const lastVisitDate = customer.visits[0]?.createdAt;
    let lastVisitText = "Sin visitas aún";
    if (lastVisitDate) {
      const diffDays = Math.floor(Math.abs(Date.now() - lastVisitDate.getTime()) / 86400000);
      if (diffDays === 0) lastVisitText = "Última visita: Hoy";
      else if (diffDays === 1) lastVisitText = "Última visita: Ayer";
      else lastVisitText = `Última visita: hace ${diffDays} días`;
    }

    const totalVisits = customer._count.visits;
    let effectiveVisits = maxVisits > 0 ? totalVisits % maxVisits : 0;
    if (effectiveVisits === 0 && totalVisits > 0) effectiveVisits = maxVisits;

    const nextReward = shop.rewards.find((r) => r.visitsRequired > effectiveVisits);
    let whatsappMessage = `Hola ${customer.name}. Bienvenido a ${shop.name}. Consulta tus recompensas aquí: https://barberia.club/c/${customer.uniqueCode}`;
    if (nextReward) {
      const faltantes = nextReward.visitsRequired - effectiveVisits;
      whatsappMessage = `Hola ${customer.name} recuerda que te faltan ${faltantes} cortes para obtener un ${nextReward.name} de recompensa por tu fidelidad. Mira tu progreso en: https://barberia.club/c/${customer.uniqueCode}`;
    } else if (totalVisits > 0 && effectiveVisits === maxVisits) {
      whatsappMessage = `¡Hola ${customer.name}! Has completado todas tus metas y tienes recompensas listas para canjear en ${shop.name}. Mira tu progreso en: https://barberia.club/c/${customer.uniqueCode}`;
    }

    return (
      <div key={customer.id} id={`cliente-${customer.id}`} className={styles.customerCard}>
        {/* Info */}
        <div className={styles.customerInfo}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{customer.name}</p>
            <span style={{ fontSize: "0.75rem", backgroundColor: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "12px", color: "var(--text-secondary)" }}>
              {customer.uniqueCode}
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{customer.phone}</p>
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", color: "var(--text-secondary)", alignSelf: "flex-start" }}>
            {lastVisitText}
          </div>
        </div>

        {/* Barra de progreso */}
        <div className={styles.customerRewards}>
          <div style={{ position: "relative", width: "100%", height: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "9999px", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${Math.min((effectiveVisits / maxVisits) * 100, 100)}%`, background: "linear-gradient(90deg, rgba(34,197,94,0.4), var(--accent-success))", borderRadius: "9999px", transition: "width 0.5s ease-in-out", boxShadow: "0 0 12px rgba(34,197,94,0.4)" }} />
            {shop.rewards.map((reward) => {
              const leftPercent = (reward.visitsRequired / maxVisits) * 100;
              const isReached = effectiveVisits >= reward.visitsRequired;
              return (
                <div key={`reward-${reward.id}`} style={{ position: "absolute", left: `${leftPercent}%`, top: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
                  <div style={{ position: "absolute", bottom: "24px", textAlign: "center", whiteSpace: "nowrap", color: isReached ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isReached ? "bold" : "normal", fontSize: "0.75rem" }}>
                    {reward.visitsRequired} cortes
                  </div>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: isReached ? "var(--accent-success)" : "var(--bg-tertiary)", border: "3px solid var(--bg-primary)", boxShadow: isReached ? "0 0 8px var(--accent-success)" : "0 2px 4px rgba(0,0,0,0.5)", transition: "all 0.3s ease" }} />
                </div>
              );
            })}
          </div>
          {shop.rewards.length === 0 && (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "1rem" }}>No hay recompensas configuradas.</p>
          )}
        </div>

        {/* Acciones */}
        <div className={styles.customerActions}>
          <p style={{ fontSize: "0.875rem" }}>Visitas Totales: <strong>{totalVisits}</strong></p>
          <a
            href={`https://wa.me/${customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="premium-btn-secondary"
            style={{ padding: "6px 12px", fontSize: "0.75rem", borderRadius: "6px" }}
          >
            Enviar WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem" }}>Gestión de Clientes</h2>

      {/* ── Solicitudes pendientes ── */}
      {pendingCustomers.length > 0 && (
        <div style={{ marginBottom: "3rem" }}>
          <h3 style={{ color: "var(--accent-primary)", marginBottom: "1rem" }}>
            Solicitudes Pendientes ({pendingCustomers.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pendingCustomers.map((customer) => {
              const referrer = customer.referralReceived?.referrer ?? null;
              return (
              <div
                key={customer.id}
                id={`cliente-${customer.id}`}
                className="premium-card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "relative",
                  ...(referrer
                    ? { border: "1.5px solid var(--accent-success)", marginTop: "0.6rem" }
                    : {}),
                }}
              >
                {/* Etiqueta sobre el borde verde: "Invitado por <nombre>" */}
                {referrer && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-0.7rem",
                      right: "1rem",
                      padding: "0 0.5rem",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--accent-success)",
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Invitado por <ReferrerLink targetId={referrer.id} name={referrer.name} />
                  </span>
                )}
                <div>
                  <p style={{ fontWeight: "bold" }}>{customer.name}</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{customer.phone}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {/* Aprobar: en FREE muestra popup sin aprobar; en PRO aprueba normalmente */}
                  <PendingApproveButton
                    isPro={isPro}
                    customerId={customer.id}
                    approveAction={approveCustomer}
                  />
                  {/* Rechazar siempre disponible (libera el slot pendiente) */}
                  <form action={rejectCustomer}>
                    <input type="hidden" name="id" value={customer.id} />
                    <button
                      type="submit"
                      className="premium-btn-secondary"
                      style={{ padding: "8px 16px", color: "var(--accent-danger)" }}
                    >
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Lista de clientes activos ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>
              Clientes Activos ({activeCustomers.length})
              {!isPro && activeCustomers.length > FREE_CUSTOMER_LIMIT && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 400, marginLeft: "0.5rem" }}>
                  (Free: {FREE_CUSTOMER_LIMIT} · PRO: ilimitados)
                </span>
              )}
            </h3>
            <FilterDropdown currentSort={sort} />
          </div>
          <SearchInput />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Primeros FREE_CUSTOMER_LIMIT (o todos si PRO) — totalmente interactuables */}
          {visibleCustomers.map(renderCustomerCard)}

          {/* Resto — misma card pero detrás de ProLock */}
          {lockedCustomers.length > 0 && (
            <ProLock locked slug={slug} radius={16}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {lockedCustomers.map(renderCustomerCard)}
              </div>
            </ProLock>
          )}

          {activeCustomers.length === 0 && (
            <p style={{ color: "var(--text-secondary)" }}>No hay clientes activos aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}
