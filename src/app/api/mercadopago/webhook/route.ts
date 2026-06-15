import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { onReferredProPayment, onReferredCancelled } from "@/lib/referrals";

const MP_API = "https://api.mercadopago.com";
const PRO_MS = 32 * 24 * 60 * 60 * 1000;

async function mpGet(path: string, token: string) {
  const res = await fetch(`${MP_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return res.ok ? res.json() : null;
}

// Activa/extiende el Pro y registra el pago real. La recompensa de referido se
// crea SOLO aquí (cobro real), no en la autorización: con 7 días de prueba la
// autorización ocurre sin que haya dinero de por medio.
async function applyRealPayment(barbershopId: string, amount: number) {
  await prisma.barbershop.update({
    where: { id: barbershopId },
    data: { plan: "PRO", expiresAt: new Date(Date.now() + PRO_MS) },
  });
  const recent = await prisma.payment.findFirst({
    where: {
      barbershopId,
      method: "MERCADOPAGO",
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });
  if (!recent) {
    await prisma.payment.create({
      data: { amount: amount || 29.9, currency: "PEN", status: "PAID", method: "MERCADOPAGO", barbershopId },
    });
  }
  // Referidos: crea la recompensa PENDING si vino por un enlace (idempotente).
  await onReferredProPayment(barbershopId);
}

// Webhook de Mercado Pago para suscripciones (preapproval).
// Verificamos consultando el recurso real a MP con nuestro token (no confiamos en el body).
export async function POST(req: Request) {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ received: true });

    let type: string | null = null;
    let id: string | null = null;
    try {
      const body = await req.json();
      type = body.type || body.topic || null;
      id = body.data?.id || body.id || null;
    } catch {
      const url = new URL(req.url);
      type = url.searchParams.get("type") || url.searchParams.get("topic");
      id = url.searchParams.get("data.id") || url.searchParams.get("id");
    }
    if (!id) return NextResponse.json({ received: true });

    // 1) Cambios de estado de la suscripción (autorización, cancelación).
    if (type === "subscription_preapproval" || type === "preapproval") {
      const sub = await mpGet(`/preapproval/${id}`, token);
      const barbershopId: string | undefined = sub?.external_reference;
      const status: string | undefined = sub?.status;

      if (barbershopId) {
        if (status === "authorized") {
          // Da acceso Pro (incluye el periodo de prueba). El cobro real y la
          // recompensa se procesan en el evento de pago recurrente.
          await prisma.barbershop.update({
            where: { id: barbershopId },
            data: { plan: "PRO", expiresAt: new Date(Date.now() + PRO_MS) },
          });
          // Si la suscripción ya tuvo al menos un cobro efectivo, procesarlo
          // (cubre planes sin prueba gratis).
          if ((sub.summarized?.charged_quantity ?? 0) >= 1) {
            await applyRealPayment(barbershopId, Number(sub.auto_recurring?.transaction_amount));
          }
        } else if (status === "cancelled") {
          await prisma.barbershop.update({ where: { id: barbershopId }, data: { plan: "FREE" } });
          await onReferredCancelled(barbershopId, "MP_CANCELLED");
        }
      }
    }

    // 2) Pago recurrente efectivo (primer cobro tras la prueba y renovaciones).
    if (type === "subscription_authorized_payment" || type === "authorized_payment") {
      const ap = await mpGet(`/authorized_payments/${id}`, token);
      const approved = ap?.status === "processed" || ap?.payment?.status === "approved";
      const preapprovalId: string | undefined = ap?.preapproval_id;
      if (approved && preapprovalId) {
        const sub = await mpGet(`/preapproval/${preapprovalId}`, token);
        const barbershopId: string | undefined = sub?.external_reference;
        if (barbershopId) {
          await applyRealPayment(barbershopId, Number(ap?.transaction_amount));
        }
      }
    }
  } catch {
    // No fallar con 500 (evita reintentos infinitos).
  }

  return NextResponse.json({ received: true });
}
