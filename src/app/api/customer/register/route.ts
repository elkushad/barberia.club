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

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        barbershopId,
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
