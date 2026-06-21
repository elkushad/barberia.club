import { prisma } from "./prisma";

export type ReferralProgress = {
  validCount: number;      // referidos con visita aprobada
  pendingCount: number;    // referidos registrados pero sin visita aún
  required: number;        // meta
  percent: number;
  isUnlocked: boolean;
  reward: { id: string; name: string; rewardType: string; description: string | null } | null;
};

/** Progreso de referidos de un cliente en una barbería. */
export async function getReferralProgress(
  customerId: string,
  barbershopId: string
): Promise<ReferralProgress | null> {
  // Recompensa de referidos activa de la barbería (la más antigua si hubiera varias).
  const activeReward = await prisma.clientReferralReward.findFirst({
    where: { barbershopId, isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, rewardType: true, description: true, referralsRequired: true },
  });

  if (!activeReward) return null;

  const referrals = await prisma.clientReferral.findMany({
    where: { referrerId: customerId, barbershopId },
    select: { status: true },
  });

  const validCount = referrals.filter((r) => r.status === "VISITA_APROBADA").length;
  const pendingCount = referrals.filter((r) => r.status === "REGISTRADO").length;
  const required = activeReward.referralsRequired;
  const percent = Math.min(100, Math.round((validCount / required) * 100));

  return {
    validCount,
    pendingCount,
    required,
    percent,
    isUnlocked: validCount >= required,
    reward: {
      id: activeReward.id,
      name: activeReward.name,
      rewardType: activeReward.rewardType,
      description: activeReward.description,
    },
  };
}

/**
 * Llamar cuando se confirma la PRIMERA visita de un cliente.
 * Si el cliente fue referido, actualiza su referral a VISITA_APROBADA.
 * Devuelve true si se actualizó algo.
 */
export async function processFirstVisitReferral(
  customerId: string
): Promise<boolean> {
  // Solo contar si es la primera visita confirmada
  const confirmedCount = await prisma.visit.count({
    where: { customerId, status: "CONFIRMED" },
  });
  if (confirmedCount !== 1) return false;

  const referral = await prisma.clientReferral.findUnique({
    where: { referredId: customerId },
    select: { id: true, status: true },
  });

  if (!referral || referral.status !== "REGISTRADO") return false;

  await prisma.clientReferral.update({
    where: { id: referral.id },
    data: { status: "VISITA_APROBADA", updatedAt: new Date() },
  });

  return true;
}

/**
 * Igual que processFirstVisitReferral pero se llama cuando el cliente pasa
 * de PENDING → ACTIVE (aprobación en el panel de clientes), donde la primera
 * visita se crea directamente como CONFIRMED.
 */
export async function processCustomerApprovalReferral(
  customerId: string
): Promise<boolean> {
  const referral = await prisma.clientReferral.findUnique({
    where: { referredId: customerId },
    select: { id: true, status: true },
  });

  if (!referral || referral.status !== "REGISTRADO") return false;

  await prisma.clientReferral.update({
    where: { id: referral.id },
    data: { status: "VISITA_APROBADA", updatedAt: new Date() },
  });

  return true;
}

/** Métricas de referidos para el dashboard de la barbería. */
export async function getReferralMetrics(barbershopId: string) {
  const [total, valid, pending] = await Promise.all([
    prisma.clientReferral.count({ where: { barbershopId } }),
    prisma.clientReferral.count({ where: { barbershopId, status: "VISITA_APROBADA" } }),
    prisma.clientReferral.count({ where: { barbershopId, status: "REGISTRADO" } }),
  ]);

  // Top referrers
  const topReferrers = await prisma.clientReferral.groupBy({
    by: ["referrerId"],
    where: { barbershopId, status: "VISITA_APROBADA" },
    _count: { referrerId: true },
    orderBy: { _count: { referrerId: "desc" } },
    take: 5,
  });

  const referrerIds = topReferrers.map((r) => r.referrerId);
  const referrerDetails = referrerIds.length
    ? await prisma.customer.findMany({
        where: { id: { in: referrerIds } },
        select: { id: true, name: true },
      })
    : [];

  const top = topReferrers.map((r) => ({
    name: referrerDetails.find((d) => d.id === r.referrerId)?.name ?? "—",
    count: r._count.referrerId,
  }));

  // Unlocked rewards: customers who have >= required valid referrals
  const rewards = await prisma.clientReferralReward.findMany({
    where: { barbershopId, isActive: true },
    select: { referralsRequired: true },
  });
  const minRequired = rewards.length ? Math.min(...rewards.map((r) => r.referralsRequired)) : Infinity;

  const unlockedCount = topReferrers.filter((r) => r._count.referrerId >= minRequired).length;

  return { total, valid, pending, unlockedCount, top };
}
