import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const Schema = z.object({
  visitId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
});

// Valoración del cliente para su visita recién registrada. Se guarda en la
// visita PENDING; se publica (cuenta en el promedio) cuando la barbería la
// confirma. Solo se permite valorar una vez.
export async function POST(req: Request) {
  try {
    if (!rateLimit(`rating:${clientIp(req)}`, 15, 60_000)) {
      return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
    }

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const { visitId, rating } = parsed.data;

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: { id: true, rating: true },
    });
    if (!visit) {
      return NextResponse.json({ error: "Visita no encontrada" }, { status: 404 });
    }
    if (visit.rating != null) {
      return NextResponse.json({ error: "Esta visita ya fue valorada" }, { status: 400 });
    }

    await prisma.visit.update({ where: { id: visitId }, data: { rating } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
