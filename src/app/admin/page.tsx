import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string })?.role;
  const userId = (session.user as { id?: string })?.id;

  if (role === "OWNER") {
    // Redirect owner to their barbershop panel
    const barbershop = await prisma.barbershop.findFirst({
      where: { ownerId: userId },
    });
    
    if (barbershop) {
      redirect(`/admin/${barbershop.slug}`);
    } else {
      return (
        <div>
          <h1>Panel de Dueño</h1>
          <p>Aún no tienes una barbería asignada. Contacta al administrador general.</p>
        </div>
      );
    }
  }

  if (role !== "ADMIN") {
    return <div>Acceso denegado</div>;
  }

  // Admin Dashboard
  const barbershops = await prisma.barbershop.findMany({
    include: {
      owner: true,
      _count: {
        select: { customers: true }
      }
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Gestión de Barberías</h2>
        <Link href="/admin/barberias/nueva" className="premium-btn">
          + Nueva Barbería
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {barbershops.map((shop) => (
          <div key={shop.id} className="premium-card">
            <h3>{shop.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              /{shop.slug}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dueño</span>
                <p style={{ fontSize: '0.875rem' }}>{shop.owner.name}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clientes</span>
                <p style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{shop._count.customers}</p>
              </div>
            </div>
            <Link href={`/admin/${shop.slug}`} className="premium-btn-secondary" style={{ display: 'block', textAlign: 'center', padding: '8px', borderRadius: '6px' }}>
              Ver Panel
            </Link>
          </div>
        ))}
        {barbershops.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>No hay barberías registradas.</p>
        )}
      </div>
    </div>
  );
}
