import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayPalAccessToken } from "@/lib/paypal";
import { onReferredProPayment, onReferredCancelled } from "@/lib/referrals";

const PAYPAL_API = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "9AF55025PS586635F";

// Verifica que el evento venga realmente de PayPal (firma).
async function isVerified(headers: Headers, rawBody: string): Promise<boolean> {
  try {
    const token = await getPayPalAccessToken();
    const res = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_algo: headers.get("paypal-auth-algo"),
        cert_url: headers.get("paypal-cert-url"),
        transmission_id: headers.get("paypal-transmission-id"),
        transmission_sig: headers.get("paypal-transmission-sig"),
        transmission_time: headers.get("paypal-transmission-time"),
        webhook_id: WEBHOOK_ID,
        webhook_event: JSON.parse(rawBody),
      }),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  if (!(await isVerified(req.headers, rawBody))) {
    return NextResponse.json({ error: "Firma no válida" }, { status: 400 });
  }

  let event: { event_type?: string; resource?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: true });
  }

  const type = event.event_type;
  const resource = (event.resource || {}) as {
    id?: string;
    billing_agreement_id?: string;
    amount?: { total?: string; currency?: string };
  };

  try {
    if (type === "PAYMENT.SALE.COMPLETED" && resource.billing_agreement_id) {
      // Cobro de la suscripción (inicial o renovación mensual).
      const shop = await prisma.barbershop.findFirst({
        where: { paypalSubscriptionId: resource.billing_agreement_id },
      });
      if (shop) {
        await prisma.barbershop.update({
          where: { id: shop.id },
          data: { plan: "PRO", expiresAt: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000) },
        });
        // Evitar duplicar el primer pago (ya registrado al suscribirse).
        const recent = await prisma.payment.findFirst({
          where: {
            barbershopId: shop.id,
            method: "PAYPAL",
            createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
          },
        });
        if (!recent) {
          await prisma.payment.create({
            data: {
              amount: resource.amount?.total ? parseFloat(resource.amount.total) : 10,
              currency: resource.amount?.currency || "USD",
              status: "PAID",
              method: "PAYPAL",
              barbershopId: shop.id,
            },
          });
        }
        // Referidos: crea la recompensa PENDING si vino por un enlace (idempotente).
        await onReferredProPayment(shop.id);
      }
    } else if (
      type === "BILLING.SUBSCRIPTION.CANCELLED" ||
      type === "BILLING.SUBSCRIPTION.EXPIRED" ||
      type === "BILLING.SUBSCRIPTION.SUSPENDED"
    ) {
      // Cancelación / impago: la barbería vuelve a Free.
      if (resource.id) {
        const shop = await prisma.barbershop.findFirst({
          where: { paypalSubscriptionId: resource.id },
        });
        if (shop) {
          await prisma.barbershop.update({ where: { id: shop.id }, data: { plan: "FREE" } });
          // Referidos: cancela la recompensa si aún no se había liberado.
          await onReferredCancelled(shop.id, "PAYPAL_" + (type ?? "CANCELLED"));
        }
      }
    }
  } catch {
    // No devolver 500 por errores internos (evita reintentos infinitos de PayPal).
  }

  return NextResponse.json({ received: true });
}
