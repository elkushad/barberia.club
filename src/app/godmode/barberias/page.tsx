import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Eye, Power } from "lucide-react";
import DeleteBarbershopButton from "./DeleteBarbershopButton";
import FilterPill from "./FilterPill";
import PlanPill from "./PlanPill";
import type { Prisma } from "@prisma/client";

export default async function GodmodeBarberiasPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  await requireAdmin();
  const { filtro } = await searchParams;

  const where: Prisma.BarbershopWhereInput =
    filtro === "free" ? { plan: "FREE" }
    : filtro === "pro" ? { plan: "PRO" }
    : filtro === "activas" ? { status: "ACTIVE" }
    : filtro === "inactivas" ? { status: "SUSPENDED" }
    : {};

  const barbershops = await prisma.barbershop.findMany({
    where,
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

  // Server Component: la hora actual se evalúa por petición.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

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

  async function changePlan(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = formData.get("id") as string;
    const newPlan = formData.get("plan") === "PRO" ? "PRO" : "FREE";
    await prisma.barbershop.update({
      where: { id },
      data: {
        plan: newPlan,
        expiresAt: newPlan === "PRO" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });
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

      <div style={{ marginBottom: '1rem' }}>
        <FilterPill currentFiltro={filtro || 'recientes'} />
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
              const msLeft = b.expiresAt ? b.expiresAt.getTime() - now : null;
              const expiringSoon = b.plan === "PRO" && msLeft !== null && msLeft > 0 && msLeft <= THREE_DAYS_MS;
              const daysLeft = msLeft !== null ? Math.ceil(msLeft / (24 * 60 * 60 * 1000)) : null;
              
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
                        <Link href={`/godmode/barberias/${b.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <p style={{ fontWeight: 'bold', color: expiringSoon ? '#eab308' : undefined }}>{b.name}</p>
                        </Link>
                        <p style={{ fontSize: '0.75rem', color: expiringSoon ? '#eab308' : 'var(--text-secondary)' }}>
                          {b.slug}{expiringSoon ? ` · vence en ${daysLeft}d` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <PlanPill id={b.id} plan={b.plan} action={changePlan} />
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

                      <DeleteBarbershopButton id={b.id} action={deleteBarbershop} />
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
