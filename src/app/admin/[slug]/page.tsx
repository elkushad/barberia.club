import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UpgradeToPro from "@/components/UpgradeToPro";

export default async function OwnerDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          customers: true,
          rewards: true,
        }
      }
    }
  });

  if (!barbershop) return null;

  const pendingCustomers = await prisma.customer.count({
    where: { barbershopId: barbershop.id, status: "PENDING" }
  });

  const pendingVisits = await prisma.visit.count({
    where: { customer: { barbershopId: barbershop.id }, status: "PENDING" }
  });

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Resumen General</h2>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="premium-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Clientes Totales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{barbershop._count.customers}</p>
        </div>
        
        <div className="premium-card" style={{ textAlign: 'center', borderColor: pendingCustomers > 0 ? 'var(--accent-primary)' : 'var(--border-color)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Nuevos Clientes (Pendientes)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: pendingCustomers > 0 ? 'var(--accent-primary)' : 'inherit' }}>{pendingCustomers}</p>
        </div>

        {pendingVisits > 0 ? (
          <Link href={`/admin/${barbershop.slug}/visitas#pendientes`} style={{ textDecoration: 'none' }}>
            <div className="premium-card pulse-neon-success" style={{ textAlign: 'center', cursor: 'pointer' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Visitas por Confirmar</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-success)' }}>{pendingVisits}</p>
            </div>
          </Link>
        ) : (
          <div className="premium-card" style={{ textAlign: 'center', borderColor: 'var(--border-color)' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Visitas por Confirmar</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'inherit' }}>{pendingVisits}</p>
          </div>
        )}

        <div className="premium-card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Recompensas Configuradas</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{barbershop._count.rewards}</p>
        </div>
      </div>

      {barbershop.plan === "FREE" && (
        <div className="premium-card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Sube al plan Pro 💈</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Clientes ilimitados, hasta 10 recompensas, WhatsApp integrado y más. <strong>$10 USD/mes</strong> (≈ S/ 38).
          </p>
          <UpgradeToPro slug={barbershop.slug} />
        </div>
      )}
    </div>
  );
}
