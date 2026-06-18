import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { hasProAccess } from "@/lib/plans";
import { assertBarbershopAccessBySlug } from "@/lib/guards";
import VisitServicePill from "./VisitServicePill";

export default async function VisitasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug }
  });

  if (!barbershop) return null;

  const services = await prisma.service.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, price: true },
  });

  const pendingVisits = await prisma.visit.findMany({
    where: { customer: { barbershopId: barbershop.id }, status: "PENDING" },
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  });

  const totalHistoryCount = await prisma.visit.count({
    where: { customer: { barbershopId: barbershop.id }, status: "CONFIRMED" }
  });

  const isFreePlan = !hasProAccess(barbershop);

  const historyVisits = await prisma.visit.findMany({
    where: { customer: { barbershopId: barbershop.id }, status: "CONFIRMED" },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: isFreePlan ? 5 : 50 // Limit to 5 for FREE, 50 for PRO MVP
  });

  // Cambia el servicio asociado a una visita y actualiza el precio (snapshot).
  async function setVisitService(visitId: string, serviceId: string) {
    "use server";
    const shop = await assertBarbershopAccessBySlug(slug);
    const service = await prisma.service.findFirst({ where: { id: serviceId, barbershopId: shop.id } });
    if (!service) return;
    await prisma.visit.updateMany({
      where: { id: visitId, customer: { barbershopId: shop.id } },
      data: { serviceId: service.id, servicePrice: service.price },
    });
    revalidatePath(`/admin/${slug}/visitas`);
  }

  async function approveVisit(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.visit.update({
      where: { id },
      data: { status: "CONFIRMED" }
    });
    revalidatePath(`/admin/${slug}/visitas`);
  }

  async function rejectVisit(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.visit.delete({ where: { id } });
    revalidatePath(`/admin/${slug}/visitas`);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Link 
          href={`/admin/${slug}`} 
          style={{ 
            color: 'var(--text-secondary)', 
            textDecoration: 'none', 
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <span>←</span> Volver
        </Link>
        <h2 style={{ margin: 0 }}>Registro de Visitas</h2>
      </div>

      {pendingVisits.length > 0 && (
        <div id="pendientes" style={{ marginBottom: '3rem', scrollMarginTop: '100px' }}>
          <h3 style={{ color: 'var(--accent-success)', marginBottom: '1rem' }}>Visitas por Confirmar ({pendingVisits.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingVisits.map(visit => (
              <div key={visit.id} className="premium-card pulse-neon-success" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>{visit.customer.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(visit.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <form action={approveVisit}>
                    <input type="hidden" name="id" value={visit.id} />
                    <button type="submit" className="premium-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--accent-success)' }}>Confirmar</button>
                  </form>
                  <form action={rejectVisit}>
                    <input type="hidden" name="id" value={visit.id} />
                    <button type="submit" className="premium-btn-secondary" style={{ padding: '8px 16px', color: 'var(--accent-danger)' }}>Rechazar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ marginBottom: '1rem' }}>
          Historial de Visitas {isFreePlan ? "(Últimas 5)" : "(Últimas 50)"}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {historyVisits.map(visit => (
            <div key={visit.id} className="premium-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{visit.customer.name}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Tel: {visit.customer.phone}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <VisitServicePill
                  visitId={visit.id}
                  services={services}
                  currentServiceId={visit.serviceId}
                  onSelect={setVisitService}
                />
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(visit.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)' }}>
                    Confirmada{visit.servicePrice != null ? ` · S/ ${visit.servicePrice}` : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {historyVisits.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay visitas registradas.</p>}
          {isFreePlan && totalHistoryCount > 5 && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(230,57,70,0.1)', border: '1px solid var(--saas-red)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: 'white', marginBottom: '0.5rem' }}>Tienes <strong>{totalHistoryCount - 5} visitas ocultas</strong> en tu historial.</p>
              <Link href="/planes" className="saas-btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'inline-block', animation: 'none' }}>
                Actualizar al plan PRO
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
