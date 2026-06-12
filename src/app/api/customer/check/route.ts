import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, barbershopId } = await req.json();
    
    if (!phone || !barbershopId) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { phone, barbershopId }
    });

    if (customer) {
      return NextResponse.json({ exists: true, customer });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
