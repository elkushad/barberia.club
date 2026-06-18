import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { hasProAccess } from "@/lib/plans";

const RegisterCustomerSchema = z.object({
  phone: z.string().trim().min(3).max(30),
  name: z.string().trim().min(1).max(80),
  barbershopId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    if (!rateLimit(`customer-register:${clientIp(req)}`, 5, 60_000)) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }

    const parsed = RegisterCustomerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const { phone, name, barbershopId } = parsed.data;
    
    if (!phone || !name || !barbershopId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Double check it doesn't exist
    const existing = await prisma.customer.findFirst({
      where: { phone, barbershopId }
    });

    if (existing) {
      return NextResponse.json({ error: "Ya existe" }, { status: 400 });
    }

    // Check limits
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      include: { _count: { select: { customers: true } } }
    });

    if (!barbershop) {
      return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    }

    if (!hasProAccess(barbershop) && barbershop._count.customers >= 3) {
      return NextResponse.json({ error: "La barbería no acepta más clientes en este momento." }, { status: 403 });
    }

    await prisma.customer.create({
      data: {
        name,
        phone,
        barbershopId,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
