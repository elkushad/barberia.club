import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const AppointmentSchema = z.object({
  customerId: z.string().min(1),
  barbershopId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`appointment:${clientIp(req)}`, 10, 60_000)) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }

    const parsed = AppointmentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const { customerId, barbershopId, date, time } = parsed.data;

    // La fecha debe ser hoy o futura (tolerancia de 1 día para zonas horarias).
    const when = new Date(`${date}T00:00:00Z`);
    const minDate = new Date();
    minDate.setUTCHours(0, 0, 0, 0);
    minDate.setUTCDate(minDate.getUTCDate() - 1);
    if (isNaN(when.getTime()) || when < minDate) {
      return NextResponse.json({ error: "La fecha debe ser hoy o futura." }, { status: 400 });
    }

    // El cliente debe existir y pertenecer a esta barbería.
    const customer = await prisma.customer.findFirst({ where: { id: customerId, barbershopId } });
    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Regla: solo 1 cita activa (pendiente o aprobada) por cliente.
    const active = await prisma.appointment.findFirst({
      where: { customerId, status: { in: ["PENDING", "APPROVED"] } },
    });
    if (active) {
      return NextResponse.json(
        { error: "Ya tienes una cita agendada. Cancela o espera a que se complete para crear otra." },
        { status: 409 }
      );
    }

    await prisma.appointment.create({
      data: { customerId, barbershopId, date, time, status: "PENDING" },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
