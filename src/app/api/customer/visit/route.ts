import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const VisitSchema = z.object({
  customerId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`visit:${clientIp(req)}`, 10, 60_000)) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }

    const parsed = VisitSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const { customerId } = parsed.data;
    
    if (!customerId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    // Servicio principal de la barbería (default de la visita; el precio se guarda como snapshot).
    const primaryService = await prisma.service.findFirst({
      where: { barbershopId: customer.barbershopId, isPrimary: true },
      select: { id: true, price: true },
    });

    // Check if there's already a pending visit recently to avoid spam
    const recentPending = await prisma.visit.findFirst({
      where: { 
        customerId, 
        status: "PENDING",
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        }
      }
    });

    if (recentPending) {
      return NextResponse.json({ error: "Ya tienes una visita pendiente de confirmar hoy" }, { status: 400 });
    }

    await prisma.visit.create({
      data: {
        customerId,
        status: "PENDING",
        serviceId: primaryService?.id ?? null,
        servicePrice: primaryService?.price ?? null,
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
