import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Store, Users, CalendarCheck, CircleDollarSign } from "lucide-react";

export default async function GodmodeBarbershopDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await requireAdmin();

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: {
      owner: true,
      _count: {
        select: { customers: true, rewards: true, payments: true }
      },
      customers: {
        include: { _count: { select: { visits: true } } }
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!barbershop) notFound();

  const totalVisits = barbershop.customers.reduce((acc, c) => acc + c._count.visits, 0);

  async function updatePlan(formData: FormData) {
    "use server";
    await requireAdmin();
    const newPlan = formData.get("plan") as string;
    await prisma.barbershop.update({
      where: { id: barbershop?.id },
      data: { plan: newPlan }
    });
    revalidatePath(`/godmode/barberias/${slug}`);
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/godmode/barberias" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Volver a Barberías
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {barbershop.logo ? (
              <img src={barbershop.logo} alt="" style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={32} color="var(--text-secondary)" />
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{barbershop.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>/{barbershop.slug} • Registrada el {barbershop.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 'bold', backgroundColor: barbershop.plan === 'PRO' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)', color: barbershop.plan === 'PRO' ? '#3b82f6' : 'var(--text-secondary)' }}>
              {barbershop.plan} Plan
            </span>
            <span style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 'bold', backgroundColor: barbershop.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: barbershop.status === 'ACTIVE' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {barbershop.status}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Info General */}
        <div className="premium-card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Información General</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Propietario</span>
              <strong>{barbershop.owner.name || "N/A"}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email Owner</span>
              <strong>{barbershop.owner.email}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>WhatsApp</span>
              <strong>{barbershop.whatsapp || "No configurado"}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Dirección</span>
              <strong>{barbershop.address || "No configurado"}</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Cambiar Plan</span>
              <form action={updatePlan} style={{ display: 'flex', gap: '0.5rem' }}>
                <select name="plan" defaultValue={barbershop.plan} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'white' }}>
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                </select>
                <button type="submit" className="premium-btn" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Guardar</button>
              </form>
            </li>
          </ul>
        </div>

        {/* Estadísticas */}
        <div className="premium-card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Estadísticas de Uso</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <Users size={24} color="#3b82f6" style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{barbershop._count.customers}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clientes</p>
            </div>
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <CalendarCheck size={24} color="#8b5cf6" style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalVisits}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Visitas</p>
            </div>
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', textAlign: 'center', gridColumn: 'span 2' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{barbershop._count.rewards}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recompensas Configuradas</p>
            </div>
          </div>
        </div>

        {/* Facturación */}
        <div className="premium-card">
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Facturación (Últimos 5 pagos)</h3>
          
          {barbershop.payments.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {barbershop.payments.map(p => (
                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{p.currency} {p.amount}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.createdAt.toLocaleDateString()}</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: p.status === 'PAID' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
              <CircleDollarSign size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
              <p>No hay historial de pagos.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
