import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, name, barbershopId } = await req.json();
    
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

    if (barbershop.plan === "FREE" && barbershop._count.customers >= 3) {
      return NextResponse.json({ error: "La barbería no acepta más clientes en este momento." }, { status: 403 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        barbershopId,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, customer });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
