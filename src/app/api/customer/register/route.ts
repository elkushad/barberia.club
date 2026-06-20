import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const RegisterCustomerSchema = z.object({
  phone: z.string().trim().min(3).max(30),
  name: z.string().trim().min(1).max(80),
  barbershopId: z.string().min(1),
  refCode: z.string().optional(), // uniqueCode del cliente que refirió
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
    const { phone, name, barbershopId, refCode } = parsed.data;

    // Verificar que no exista ya
    const existing = await prisma.customer.findFirst({ where: { phone, barbershopId } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe" }, { status: 400 });
    }

    const barbershop = await prisma.barbershop.findUnique({ where: { id: barbershopId } });
    if (!barbershop) {
      return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    }

    // Crear el cliente
    const newCustomer = await prisma.customer.create({
      data: { name, phone, barbershopId, status: "PENDING" },
    });

    // Crear referral si hay refCode válido
    if (refCode) {
      const referrer = await prisma.customer.findFirst({
        where: { uniqueCode: refCode, barbershopId, status: "ACTIVE" },
        select: { id: true },
      });

      // Anti-fraude: referrer existe, es diferente al nuevo cliente, y el nuevo no fue referido ya
      if (referrer && referrer.id !== newCustomer.id) {
        const alreadyReferred = await prisma.clientReferral.findUnique({
          where: { referredId: newCustomer.id },
        });

        if (!alreadyReferred) {
          // Vincular con la recompensa activa principal si existe
          const activeReward = await prisma.clientReferralReward.findFirst({
            where: { barbershopId, isActive: true, isPrimary: true },
            select: { id: true },
          }) ?? await prisma.clientReferralReward.findFirst({
            where: { barbershopId, isActive: true },
            select: { id: true },
          });

          await prisma.clientReferral.create({
            data: {
              barbershopId,
              referrerId: referrer.id,
              referredId: newCustomer.id,
              rewardId: activeReward?.id ?? null,
              status: "REGISTRADO",
              updatedAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
