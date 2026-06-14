import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRO_PRICE_PEN } from "@/lib/pricing";

const Schema = z.object({ slug: z.string().min(1) });
const MP_API = "https://api.mercadopago.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.barberia.club";

export async function POST(req: Request) {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ error: "Mercado Pago no está configurado" }, { status: 500 });

    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    const { slug } = parsed.data;

    const role = (session.user as { role?: string })?.role;
    const userId = (session.user as { id?: string })?.id;

    const barbershop = await prisma.barbershop.findUnique({ where: { slug } });
    if (!barbershop) return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    if (role !== "ADMIN" && barbershop.ownerId !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const res = await fetch(`${MP_API}/preapproval`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: "barberia.club Pro",
        external_reference: barbershop.id,
        back_url: `${APP_URL}/admin/${slug}/mi-plan?mp=ok`,
        notification_url: `${APP_URL}/api/mercadopago/webhook`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: Number(PRO_PRICE_PEN),
          currency_id: "PEN",
        },
        status: "pending",
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "No se pudo crear la suscripción" }, { status: 400 });
    }
    const data = await res.json();
    if (!data.init_point) {
      return NextResponse.json({ error: "Respuesta inválida de Mercado Pago" }, { status: 400 });
    }
    return NextResponse.json({ init_point: data.init_point });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
