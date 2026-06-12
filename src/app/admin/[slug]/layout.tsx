import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OwnerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any)?.id;
  const role = (session.user as any)?.role;

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug }
  });

  if (!barbershop) {
    return <div>Barbería no encontrada</div>;
  }

  if (role !== "ADMIN" && barbershop.ownerId !== userId) {
    return <div>Acceso denegado</div>;
  }

  const navLinks = [
    { label: "Dashboard", href: `/admin/${slug}` },
    { label: "Clientes", href: `/admin/${slug}/clientes` },
    { label: "Visitas", href: `/admin/${slug}/visitas` },
    { label: "Recompensas", href: `/admin/${slug}/recompensas` },
    { label: "Configuración", href: `/admin/${slug}/configuracion` },
    { label: "QR y Promoción", href: `/admin/${slug}/qr` },
  ];

  return (
    <div>
      <div>
        {children}
      </div>
    </div>
  );
}
