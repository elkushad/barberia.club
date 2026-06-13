import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Eye, Power, Trash2 } from "lucide-react";

export default async function GodmodeBarberiasPage() {
  await requireAdmin();

  const barbershops = await prisma.barbershop.findMany({
    include: {
      _count: {
        select: { customers: true }
      },
      customers: {
        include: { _count: { select: { visits: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  async function toggleStatus(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = formData.get("id") as string;
    const currentStatus = formData.get("currentStatus") as string;
    
    await prisma.barbershop.update({
      where: { id },
      data: { status: currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
    });
    revalidatePath("/godmode/barberias");
  }

  async function deleteBarbershop(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = formData.get("id") as string;
    await prisma.barbershop.delete({ where: { id } });
    revalidatePath("/godmode/barberias");
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Barberías</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gestiona todas las barberías registradas en la plataforma.</p>
        </div>
      </div>

      <div className="premium-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Barbería</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Plan</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Estado</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Registro</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Métricas</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {barbershops.map(b => {
              const totalVisits = b.customers.reduce((acc, c) => acc + c._count.visits, 0);
              
              return (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {b.logo ? (
                        <img src={b.logo} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)' }} />
                      )}
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{b.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      backgroundColor: b.plan === 'PRO' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                      color: b.plan === 'PRO' ? '#3b82f6' : 'var(--text-secondary)'
                    }}>
                      {b.plan}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      color: b.status === 'ACTIVE' ? 'var(--accent-success)' : 'var(--accent-danger)'
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      {b.status === 'ACTIVE' ? 'Activa' : 'Suspendida'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {b.createdAt.toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold' }}>{b._count.customers} C</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{totalVisits} V</p>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Link href={`/godmode/barberias/${b.slug}`} style={{ padding: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                        <Eye size={16} />
                      </Link>
                      
                      <form action={toggleStatus}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="currentStatus" value={b.status} />
                        <button type="submit" title={b.status === "ACTIVE" ? "Suspender" : "Activar"} style={{ padding: '6px', backgroundColor: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', color: b.status === "ACTIVE" ? 'var(--accent-danger)' : 'var(--accent-success)', cursor: 'pointer' }}>
                          <Power size={16} />
                        </button>
                      </form>

                      <form action={deleteBarbershop} onSubmit={(e) => {
                        if(!confirm("¿Estás seguro de eliminar esta barbería? Esta acción es irreversible.")) e.preventDefault();
                      }}>
                        <input type="hidden" name="id" value={b.id} />
                        <button type="submit" title="Eliminar" style={{ padding: '6px', backgroundColor: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {barbershops.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay barberías registradas aún.
          </div>
        )}
      </div>

    </div>
  );
}
