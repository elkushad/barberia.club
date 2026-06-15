import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Devuelve las notificaciones recientes (clientes nuevos, visitas y citas)
// de la barbería del dueño autenticado. El estado "leído/no leído" se maneja
// en el cliente con la marca de tiempo de la última revisión (localStorage),
// así no requerimos cambios en la base de datos.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    const role = (session.user as { role?: string })?.role;

    if (role !== "OWNER" || !userId) {
      // Solo dueños tienen barbería propia con notificaciones.
      return NextResponse.json({ items: [], slug: null });
    }

    const barbershop = await prisma.barbershop.findFirst({
      where: { ownerId: userId },
      select: { id: true, slug: true },
    });
    if (!barbershop) {
      return NextResponse.json({ items: [], slug: null });
    }

    const [customers, visits, appointments] = await Promise.all([
      prisma.customer.findMany({
        where: { barbershopId: barbershop.id },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.visit.findMany({
        where: { customer: { barbershopId: barbershop.id } },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: { id: true, createdAt: true, customer: { select: { name: true } } },
      }),
      prisma.appointment.findMany({
        where: { barbershopId: barbershop.id },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          createdAt: true,
          date: true,
          time: true,
          customer: { select: { name: true } },
        },
      }),
    ]);

    const base = `/admin/${barbershop.slug}`;

    type Item = {
      id: string;
      type: "customer" | "visit" | "appointment";
      title: string;
      subtitle: string;
      createdAt: string;
      href: string;
    };

    const items: Item[] = [
      ...customers.map((c) => ({
        id: `customer-${c.id}`,
        type: "customer" as const,
        title: "Nuevo cliente",
        subtitle: c.name,
        createdAt: c.createdAt.toISOString(),
        href: `${base}/clientes`,
      })),
      ...visits.map((v) => ({
        id: `visit-${v.id}`,
        type: "visit" as const,
        title: "Nueva visita",
        subtitle: v.customer?.name ?? "Cliente",
        createdAt: v.createdAt.toISOString(),
        href: `${base}/visitas`,
      })),
      ...appointments.map((a) => ({
        id: `appointment-${a.id}`,
        type: "appointment" as const,
        title: "Nueva cita",
        subtitle: `${a.customer?.name ?? "Cliente"} · ${a.date} ${a.time}`,
        createdAt: a.createdAt.toISOString(),
        href: `${base}/citas`,
      })),
    ]
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, 20);

    return NextResponse.json({ items, slug: barbershop.slug });
  } catch {
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
