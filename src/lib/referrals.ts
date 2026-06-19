import { prisma } from "@/lib/prisma";

// Recompensa fija para el referente por cada barbería referida válida.
// Centralizado aquí para permitir cambios futuros de monto sin tocar la lógica.
export const REFERRAL_REWARD = 10; // S/10
// Descuento para la barbería invitada en su primer mes Pro.
export const REFERRAL_DISCOUNT_RATE = 0.3; // 30%
// Porcentaje del descuento de bienvenida, para mostrar en la UI sin hardcodear.
export const REFERRAL_DISCOUNT_PERCENT = Math.round(REFERRAL_DISCOUNT_RATE * 100); // 30
// Días que la referida debe mantenerse Pro para liberar la recompensa.
export const UNLOCK_DAYS = 30;
// Saldo mínimo para poder solicitar un retiro a cuenta bancaria.
export const MIN_WITHDRAWAL = 50; // S/50

// WhatsApp oficial de barberia.club para tramitar retiros (override por env).
const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "51997237775";

/** Link de WhatsApp para solicitar un retiro (mensaje prellenado). Null si no hay número. */
export function withdrawalWhatsAppLink(shopName: string, amount: number): string | null {
  if (!SUPPORT_WHATSAPP) return null;
  const phone = SUPPORT_WHATSAPP.replace(/\D/g, "");
  const msg =
    `Hola, soy ${shopName}. Quiero solicitar el retiro de mi saldo de referidos ` +
    `(S/${amount.toFixed(2)}) a mi cuenta bancaria.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Código de referido
// ---------------------------------------------------------------------------

// Sin caracteres ambiguos (0/O, 1/I) para que sea fácil de dictar.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** Genera un código de referido único (reintenta ante colisión). */
export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const exists = await prisma.barbershop.findUnique({ where: { referralCode: code } });
    if (!exists) return code;
  }
  // Fallback prácticamente imposible de chocar.
  return randomCode(10);
}

/** Devuelve el código de referido de la barbería, creándolo si aún no tiene. */
export async function ensureReferralCode(barbershopId: string): Promise<string> {
  const shop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
    select: { referralCode: true },
  });
  if (shop?.referralCode) return shop.referralCode;
  const code = await generateUniqueReferralCode();
  await prisma.barbershop.update({ where: { id: barbershopId }, data: { referralCode: code } });
  return code;
}

export function referralLink(code: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://www.barberia.club";
  return `${base}/register?ref=${code}`;
}

// ---------------------------------------------------------------------------
// Auditoría
// ---------------------------------------------------------------------------

export type AuditType =
  | "REFERRAL_CREATED"
  | "REFERRAL_SIGNUP"
  | "REFERRAL_PRO_PAYMENT"
  | "REFERRAL_REWARD_PENDING"
  | "REFERRAL_REWARD_AVAILABLE"
  | "REFERRAL_REWARD_CANCELLED"
  | "REFERRAL_CREDIT_USED";

export async function audit(type: AuditType, barbershopId?: string | null, meta?: unknown) {
  try {
    await prisma.auditEvent.create({
      data: {
        type,
        barbershopId: barbershopId ?? null,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });
  } catch {
    // La auditoría nunca debe romper el flujo principal.
  }
}

// ---------------------------------------------------------------------------
// Antifraude: ¿puede esta barbería ser referida por este código?
// ---------------------------------------------------------------------------

export interface ReferralLinkResult {
  ok: boolean;
  referrerId?: string;
  discountEligible?: boolean;
  reason?: string;
}

/**
 * Valida y, si procede, asocia permanentemente una barbería recién creada a su
 * referente. Aplica todas las reglas antifraude. Idempotente: si ya está
 * asociada no la cambia.
 */
export async function linkReferral(params: {
  referredId: string;
  referredOwnerId: string;
  referredEmail?: string | null;
  referredWhatsapp?: string | null;
  code?: string | null;
}): Promise<ReferralLinkResult> {
  const { referredId, referredOwnerId, referredEmail, referredWhatsapp, code } = params;
  if (!code) return { ok: false, reason: "NO_CODE" };

  const referred = await prisma.barbershop.findUnique({ where: { id: referredId } });
  if (!referred) return { ok: false, reason: "REFERRED_NOT_FOUND" };

  // La asociación es permanente: si ya tiene referente, no se cambia (anti multi-link).
  if (referred.referredById) return { ok: false, reason: "ALREADY_REFERRED" };

  const referrer = await prisma.barbershop.findUnique({
    where: { referralCode: code },
    include: { owner: true },
  });
  if (!referrer) return { ok: false, reason: "INVALID_CODE" };

  // Autorreferido: misma barbería o mismo dueño.
  if (referrer.id === referredId) return { ok: false, reason: "SELF_REFERRAL" };
  if (referrer.ownerId === referredOwnerId) return { ok: false, reason: "SELF_REFERRAL_OWNER" };

  // Antifraude: mismo email o mismo WhatsApp que el referente → sospechoso.
  if (referredEmail && referrer.owner?.email && referredEmail.toLowerCase() === referrer.owner.email.toLowerCase()) {
    return { ok: false, reason: "SAME_EMAIL" };
  }
  const normPhone = (p?: string | null) => (p ? p.replace(/\D/g, "") : "");
  if (referredWhatsapp && referrer.whatsapp && normPhone(referredWhatsapp) === normPhone(referrer.whatsapp)) {
    return { ok: false, reason: "SAME_PHONE" };
  }

  await prisma.barbershop.update({
    where: { id: referredId },
    data: { referredById: referrer.id, discountEligible: true },
  });

  await audit("REFERRAL_SIGNUP", referredId, { referrerId: referrer.id, code });
  return { ok: true, referrerId: referrer.id, discountEligible: true };
}

// ---------------------------------------------------------------------------
// Creación de la recompensa cuando la referida paga Pro
// ---------------------------------------------------------------------------

/**
 * Llamar desde el webhook cuando una barbería referida confirma el pago Pro.
 * Crea la recompensa PENDING para el referente (idempotente por referredId).
 */
export async function onReferredProPayment(referredId: string) {
  const referred = await prisma.barbershop.findUnique({ where: { id: referredId } });
  if (!referred?.referredById) return; // no vino por referido

  const existing = await prisma.referral.findUnique({ where: { referredId } });
  if (existing) return; // ya existe recompensa (1 sola por barbería referida)

  const now = new Date();
  await prisma.referral.create({
    data: {
      referrerId: referred.referredById,
      referredId,
      status: "PENDING",
      rewardAmount: REFERRAL_REWARD,
      proPaidAt: now,
      unlockAt: new Date(now.getTime() + UNLOCK_DAYS * DAY_MS),
    },
  });

  await audit("REFERRAL_PRO_PAYMENT", referredId, { referrerId: referred.referredById });
  await audit("REFERRAL_REWARD_PENDING", referred.referredById, { referredId, amount: REFERRAL_REWARD });
}

/**
 * Llamar cuando una barbería referida cancela / reembolsa / es suspendida.
 * Si su recompensa aún no se liberó, se cancela definitivamente.
 */
export async function onReferredCancelled(referredId: string, reason = "CANCELLED") {
  const referral = await prisma.referral.findUnique({ where: { referredId } });
  if (!referral) return;
  if (referral.status !== "PENDING") return; // ya liberada o ya cancelada → no tocar

  await prisma.referral.update({ where: { id: referral.id }, data: { status: "CANCELLED" } });
  await audit("REFERRAL_REWARD_CANCELLED", referral.referrerId, { referredId, reason });
}

// ---------------------------------------------------------------------------
// Reconciliación: liberar recompensas cumplidos los 30 días
// ---------------------------------------------------------------------------

/**
 * Libera (PENDING → AVAILABLE) las recompensas cuyo plazo venció y cuya
 * barbería referida sigue Pro/activa; cancela las de referidas que ya no
 * cumplen. Idempotente y barato. Se ejecuta por cron y de forma perezosa al
 * abrir el panel.
 */
export async function reconcileReferrals(referrerId?: string): Promise<void> {
  const now = new Date();
  const pending = await prisma.referral.findMany({
    where: {
      status: "PENDING",
      ...(referrerId ? { referrerId } : {}),
    },
    include: { referred: true },
  });

  for (const r of pending) {
    const stillPro = r.referred.plan === "PRO" && r.referred.status === "ACTIVE";

    // Antes de cumplir el plazo: si dejó de ser Pro/activa, se cancela.
    if (!stillPro) {
      await prisma.referral.update({ where: { id: r.id }, data: { status: "CANCELLED" } });
      await audit("REFERRAL_REWARD_CANCELLED", r.referrerId, { referredId: r.referredId, reason: "NOT_PRO" });
      continue;
    }

    // Cumplido el plazo y sigue Pro: liberar.
    if (r.unlockAt && r.unlockAt <= now) {
      await prisma.$transaction([
        prisma.referral.update({ where: { id: r.id }, data: { status: "AVAILABLE" } }),
        prisma.creditMovement.create({
          data: {
            barbershopId: r.referrerId,
            amount: r.rewardAmount,
            reason: "REWARD_RELEASED",
            referralId: r.id,
          },
        }),
      ]);
      await audit("REFERRAL_REWARD_AVAILABLE", r.referrerId, { referredId: r.referredId, amount: r.rewardAmount });
    }
  }
}

// ---------------------------------------------------------------------------
// Saldos y resumen para el panel
// ---------------------------------------------------------------------------

export interface ReferralSummary {
  availableBalance: number; // saldo utilizable
  pendingBalance: number; // recompensas aún bloqueadas
  totalEarned: number; // total liberado históricamente
  referralCount: number; // cantidad de referidos (con recompensa creada)
  code: string;
  link: string;
}

export async function getReferralSummary(barbershopId: string): Promise<ReferralSummary> {
  const code = await ensureReferralCode(barbershopId);

  const [movements, pending, totalEarnedAgg, count] = await Promise.all([
    // Saldo disponible = Σ de todos los movimientos (créditos liberados positivos,
    // retiros pagados negativos).
    prisma.creditMovement.aggregate({
      where: { barbershopId },
      _sum: { amount: true },
    }),
    prisma.referral.aggregate({
      where: { referrerId: barbershopId, status: "PENDING" },
      _sum: { rewardAmount: true },
    }),
    prisma.referral.aggregate({
      where: { referrerId: barbershopId, status: "AVAILABLE" },
      _sum: { rewardAmount: true },
    }),
    prisma.referral.count({ where: { referrerId: barbershopId } }),
  ]);

  const availableBalance = Math.max(0, movements._sum.amount ?? 0);

  return {
    availableBalance,
    pendingBalance: pending._sum.rewardAmount ?? 0,
    totalEarned: totalEarnedAgg._sum.rewardAmount ?? 0,
    referralCount: count,
    code,
    link: referralLink(code),
  };
}

/** Filas de la tabla de referidos del panel. */
export async function getReferralRows(barbershopId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: barbershopId },
    include: { referred: { select: { name: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();
  return referrals.map((r) => {
    let daysLeft: number | null = null;
    if (r.status === "PENDING" && r.unlockAt) {
      daysLeft = Math.max(0, Math.ceil((r.unlockAt.getTime() - now) / DAY_MS));
    } else if (r.status === "AVAILABLE") {
      daysLeft = 0;
    }
    return {
      name: r.referred.name,
      registeredAt: r.referred.createdAt,
      status: r.status as "PENDING" | "AVAILABLE" | "CANCELLED",
      daysLeft,
      reward: r.rewardAmount,
    };
  });
}

/** Precio Pro en USD (PayPal). */
export const PRO_PRICE_USD = 10;

/** Monto del descuento de bienvenida del invitado (30% del primer mes en USD/PayPal). */
export function welcomeDiscountUSD(): number {
  return Math.round(PRO_PRICE_USD * REFERRAL_DISCOUNT_RATE * 100) / 100; // 3.00
}

/** Precio del primer mes con el 30% de descuento (USD/PayPal). */
export function firstMonthUSD(): number {
  return Math.round((PRO_PRICE_USD - welcomeDiscountUSD()) * 100) / 100; // 7.00
}
