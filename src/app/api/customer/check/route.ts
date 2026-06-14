import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const CheckSchema = z.object({
  phone: z.string().trim().min(3).max(30),
  barbershopId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`check:${clientIp(req)}`, 20, 60_000)) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }

    const parsed = CheckSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const { phone, barbershopId } = parsed.data;
    
    if (!phone || !barbershopId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { phone, barbershopId }
    });

    if (customer) {
      const activeAppointment = await prisma.appointment.findFirst({
        where: { customerId: customer.id, status: { in: ["PENDING", "APPROVED"] } },
      });
      return NextResponse.json({
        exists: true,
        customer: {
          id: customer.id,
          name: customer.name,
          status: customer.status,
          uniqueCode: customer.uniqueCode,
          hasActiveAppointment: !!activeAppointment,
        },
      });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
