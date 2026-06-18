import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const Schema = z.object({
  phone: z.string().trim().min(3).max(30),
});

// Modo cliente: dado un número de WhatsApp, devuelve todas las barberías donde
// esa persona está registrada como cliente. Identificación por teléfono (no por
// el flujo del barbero). La comparación normaliza los dígitos para tolerar
// diferencias de formato (espacios, "+", guiones) entre registros.
export async function POST(req: Request) {
  try {
    if (!rateLimit(`cust-shops:${clientIp(req)}`, 20, 60_000)) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Número inválido" }, { status: 400 });
    }

    const digits = parsed.data.phone.replace(/\D/g, "");
    if (digits.length < 6) {
      return NextResponse.json({ error: "Ingresa un número válido" }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        uniqueCode: string | null;
        status: string;
        name: string;
        shopName: string;
        slug: string;
        logo: string | null;
      }>
    >`
      SELECT c.id            AS "id",
             c."uniqueCode"  AS "uniqueCode",
             c.status        AS "status",
             c.name          AS "name",
             b.name          AS "shopName",
             b.slug          AS "slug",
             b.logo          AS "logo"
      FROM "Customer" c
      JOIN "Barbershop" b ON b.id = c."barbershopId"
      WHERE regexp_replace(c.phone, '[^0-9]', '', 'g') = ${digits}
      ORDER BY b.name ASC
    `;

    return NextResponse.json({
      count: rows.length,
      name: rows[0]?.name ?? null,
      barbershops: rows.map((r) => ({
        shopName: r.shopName,
        slug: r.slug,
        logo: r.logo,
        status: r.status,
        uniqueCode: r.uniqueCode,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
