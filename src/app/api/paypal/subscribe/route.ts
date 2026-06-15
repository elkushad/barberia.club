import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayPalSubscription } from "@/lib/paypal";
import { onReferredProPayment } from "@/lib/referrals";

const Schema = z.object({
  subscriptionID: z.string().min(1),
  slug: z.string().min(1),
});

const PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "P-34R99602CN3659501NIXNLOI";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    const { subscriptionID, slug } = parsed.data;

    // El usuario debe ser dueño de la barbería (o ADMIN).
    const role = (session.user as { role?: string })?.role;
    const userId = (session.user as { id?: string })?.id;
    const barbershop = await prisma.barbershop.findUnique({ where: { slug } });
    if (!barbershop) return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    if (role !== "ADMIN" && barbershop.ownerId !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Verificar la suscripción directamente con PayPal (no confiar en el cliente).
    const subscription = await getPayPalSubscription(subscriptionID);
    if (!subscription) {
      return NextResponse.json({ error: "No se pudo verificar la suscripción" }, { status: 400 });
    }

    const okStatus = subscription.status === "ACTIVE" || subscription.status === "APPROVED";
    const okPlan = subscription.plan_id === PLAN_ID;
    if (!okStatus || !okPlan) {
      return NextResponse.json({ error: "Suscripción no válida" }, { status: 400 });
    }

    const nextBilling = subscription.billing_info?.next_billing_time;
    const expiresAt = nextBilling ? new Date(nextBilling) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.barbershop.update({
      where: { id: barbershop.id },
      data: { plan: "PRO", expiresAt, paypalSubscriptionId: subscriptionID },
    });

    await prisma.payment.create({
      data: { amount: 10, currency: "USD", status: "PAID", method: "PAYPAL", barbershopId: barbershop.id },
    });

    // Referidos: si vino por un enlace, crea la recompensa PENDING (idempotente).
    await onReferredProPayment(barbershop.id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
