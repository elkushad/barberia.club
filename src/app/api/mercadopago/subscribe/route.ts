import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const Schema = z.object({ slug: z.string().min(1) });
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.barberia.club";
// Plan de suscripción de Mercado Pago (público; sobreescribible por env).
const PLAN_ID = process.env.MERCADOPAGO_PLAN_ID || "05ca87e1eeb24969a9401242780b973e";

export async function POST(req: Request) {
  try {
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

    // Checkout del plan de suscripción de MP. external_reference identifica la
    // barbería (lo lee el webhook para activar el Pro). El comprador inicia
    // sesión con la cuenta que quiera (no fijamos payer_email).
    const backUrl = `${APP_URL}/admin/${slug}/mi-plan?mp=ok`;
    const initPoint =
      `https://www.mercadopago.com.pe/subscriptions/checkout?preapproval_plan_id=${PLAN_ID}` +
      `&external_reference=${encodeURIComponent(barbershop.id)}` +
      `&back_url=${encodeURIComponent(backUrl)}`;

    return NextResponse.json({ init_point: initPoint });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
