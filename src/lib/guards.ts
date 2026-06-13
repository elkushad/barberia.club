import { randomInt } from "crypto";
import { getSession } from "./auth";
import { prisma } from "./prisma";

/**
 * Guards de autorización para usar dentro de server actions y route handlers.
 * Una verificación a nivel de página NO protege las server actions: cada acción
 * es un endpoint POST independiente y debe revalidar identidad y propiedad.
 */

async function currentUser() {
  const session = await getSession();
  if (!session) return null;
  return {
    role: (session.user as { role?: string })?.role,
    id: (session.user as { id?: string })?.id,
  };
}

/** Exige que el usuario sea dueño de la barbería (o ADMIN). Devuelve la barbería. */
export async function assertBarbershopAccessBySlug(slug: string) {
  const me = await currentUser();
  const shop = await prisma.barbershop.findUnique({ where: { slug } });
  if (!me || !shop) throw new Error("No autorizado");
  if (me.role !== "ADMIN" && shop.ownerId !== me.id) throw new Error("No autorizado");
  return shop;
}

/** Exige que el cliente pertenezca a una barbería del usuario (o ADMIN). */
export async function assertCustomerAccess(customerId: string) {
  const me = await currentUser();
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { barbershop: { select: { ownerId: true } } },
  });
  if (!me || !customer) throw new Error("No autorizado");
  if (me.role !== "ADMIN" && customer.barbershop.ownerId !== me.id) {
    throw new Error("No autorizado");
  }
  return customer;
}

/** Exige que la recompensa pertenezca a una barbería del usuario (o ADMIN). */
export async function assertRewardAccess(rewardId: string) {
  const me = await currentUser();
  const reward = await prisma.reward.findUnique({
    where: { id: rewardId },
    include: { barbershop: { select: { ownerId: true } } },
  });
  if (!me || !reward) throw new Error("No autorizado");
  if (me.role !== "ADMIN" && reward.barbershop.ownerId !== me.id) {
    throw new Error("No autorizado");
  }
  return reward;
}

// Alfabeto sin caracteres ambiguos (0/O, 1/I/L) para códigos legibles.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Genera un código aleatorio criptográficamente seguro (por defecto 8 chars). */
export function generateUniqueCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}
