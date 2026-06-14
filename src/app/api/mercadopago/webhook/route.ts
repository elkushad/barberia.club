import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MP_API = "https://api.mercadopago.com";

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

    if ((type === "subscription_preapproval" || type === "preapproval") && id) {
      const res = await fetch(`${MP_API}/preapproval/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const sub = await res.json();
        const barbershopId: string | undefined = sub.external_reference;
        const status: string | undefined = sub.status;

        if (barbershopId) {
          if (status === "authorized") {
            await prisma.barbershop.update({
              where: { id: barbershopId },
              data: { plan: "PRO", expiresAt: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000) },
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
                data: {
                  amount: Number(sub.auto_recurring?.transaction_amount) || 29.9,
                  currency: "PEN",
                  status: "PAID",
                  method: "MERCADOPAGO",
                  barbershopId,
                },
              });
            }
          } else if (status === "cancelled") {
            await prisma.barbershop.update({ where: { id: barbershopId }, data: { plan: "FREE" } });
          }
        }
      }
    }
  } catch {
    // No fallar con 500 (evita reintentos infinitos).
  }

  return NextResponse.json({ received: true });
}
