import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();
    
    if (!customerId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

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

    const visit = await prisma.visit.create({
      data: {
        customerId,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, visit });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
