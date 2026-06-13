import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import styles from "../../admin.module.css";
import FilterDropdown from "./FilterDropdown";
import SearchInput from "./SearchInput";

export default async function ClientesPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'recientes';
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search.toLowerCase() : '';

  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
    include: { rewards: { orderBy: { visitsRequired: 'asc' } } }
  });

  if (!barbershop) return null;

  const pendingCustomers = await prisma.customer.findMany({
    where: { barbershopId: barbershop.id, status: "PENDING" },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch all active customers with their last visit
  let activeCustomers = await prisma.customer.findMany({
    where: { barbershopId: barbershop.id, status: "ACTIVE" },
    include: {
      _count: { select: { visits: { where: { status: "CONFIRMED" } } } },
      visits: { 
        where: { status: "CONFIRMED" }, 
        orderBy: { createdAt: 'desc' }, 
        take: 1 
      }
    }
  });

  if (search) {
    activeCustomers = activeCustomers.filter(c => 
      c.name.toLowerCase().includes(search) || 
      (c.uniqueCode && c.uniqueCode.toLowerCase().includes(search)) || 
      (c.phone && c.phone.includes(search))
    );
  }

  // Sort in memory
  activeCustomers.sort((a, b) => {
    if (sort === 'mas-visitas') {
      return b._count.visits - a._count.visits;
    }
    if (sort === 'menos-visitas') {
      return a._count.visits - b._count.visits;
    }
    if (sort === 'antiguos') {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    // Default: recientes (por última visita o creación)
    const aDate = a.visits[0]?.createdAt.getTime() || a.createdAt.getTime();
    const bDate = b.visits[0]?.createdAt.getTime() || b.createdAt.getTime();
    return bDate - aDate;
  });

  async function approveCustomer(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await prisma.customer.update({
      where: { id },
      data: { status: "ACTIVE", uniqueCode }
    });
    revalidatePath(`/admin/${slug}/clientes`);
  }

  async function rejectCustomer(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.customer.delete({ where: { id } });
    revalidatePath(`/admin/${slug}/clientes`);
  }

  const maxVisits = barbershop.rewards.length > 0 
    ? barbershop.rewards[barbershop.rewards.length - 1].visitsRequired 
    : 10;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Gestión de Clientes</h2>

      {pendingCustomers.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Solicitudes Pendientes ({pendingCustomers.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingCustomers.map(customer => (
              <div key={customer.id} className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>{customer.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{customer.phone}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <form action={approveCustomer}>
                    <input type="hidden" name="id" value={customer.id} />
                    <button type="submit" className="premium-btn" style={{ padding: '8px 16px', backgroundColor: 'var(--accent-success)' }}>Aprobar</button>
                  </form>
                  <form action={rejectCustomer}>
                    <input type="hidden" name="id" value={customer.id} />
                    <button type="submit" className="premium-btn-secondary" style={{ padding: '8px 16px', color: 'var(--accent-danger)' }}>Rechazar</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0 }}>Clientes Activos ({activeCustomers.length})</h3>
            <FilterDropdown currentSort={sort} />
          </div>
          <SearchInput />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {activeCustomers.map(customer => {
            const lastVisitDate = customer.visits[0]?.createdAt;
            let lastVisitText = "Sin visitas aún";
            if (lastVisitDate) {
              const diffTime = Math.abs(Date.now() - lastVisitDate.getTime());
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays === 0) lastVisitText = "Última visita: Hoy";
              else if (diffDays === 1) lastVisitText = "Última visita: Ayer";
              else lastVisitText = `Última visita: hace ${diffDays} días`;
            }

            const totalVisits = customer._count.visits;
            let effectiveVisits = totalVisits % maxVisits;
            if (effectiveVisits === 0 && totalVisits > 0) {
              effectiveVisits = maxVisits;
            }

            // Calculate next reward for Whatsapp message using effectiveVisits
            const nextReward = barbershop.rewards.find(r => r.visitsRequired > effectiveVisits);
            let whatsappMessage = `Hola ${customer.name}. Bienvenido a ${barbershop.name}. Consulta tus recompensas aquí: https://barberia.club/c/${customer.uniqueCode}`;
            if (nextReward) {
              const faltantes = nextReward.visitsRequired - effectiveVisits;
              whatsappMessage = `Hola ${customer.name} recuerda que te faltan ${faltantes} cortes para obtener un ${nextReward.name} de recompensa por tu fidelidad. Mira tu progreso en: https://barberia.club/c/${customer.uniqueCode}`;
            } else if (totalVisits > 0 && effectiveVisits === maxVisits) {
               // They just finished a cycle
               whatsappMessage = `¡Hola ${customer.name}! Has completado todas tus metas y tienes recompensas listas para canjear en ${barbershop.name}. Mira tu progreso en: https://barberia.club/c/${customer.uniqueCode}`;
            }

            return (
              <div key={customer.id} className={styles.customerCard}>
                
                {/* Bloque 1: Info del Cliente */}
                <div className={styles.customerInfo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{customer.name}</p>
                    <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                      {customer.uniqueCode}
                    </span>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{customer.phone}</p>
                  
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>
                    {lastVisitText}
                  </div>
                </div>

                {/* Bloque 2: Línea de Tiempo de Recompensas */}
                <div className={styles.customerRewards}>
                  
                  {/* Contenedor principal de la barra */}
                  <div style={{ position: 'relative', width: '100%', height: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '9999px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
                    
                    {/* Relleno de progreso */}
                    <div style={{ 
                      position: 'absolute',
                      top: 0, left: 0, bottom: 0,
                      width: `${Math.min((effectiveVisits / maxVisits) * 100, 100)}%`, 
                      background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.4), var(--accent-success))',
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease-in-out',
                      boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)'
                    }} />
                    
                    {/* Hitos / Recompensas */}
                    {barbershop.rewards.map(reward => {
                      const leftPercent = (reward.visitsRequired / maxVisits) * 100;
                      const isReached = effectiveVisits >= reward.visitsRequired;
                      return (
                        <div key={`reward-${reward.id}`} style={{ 
                          position: 'absolute', 
                          left: `${leftPercent}%`, 
                          top: '50%',
                          transform: 'translate(-50%, -50%)', 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          zIndex: 10
                        }}>
                          {/* Texto de la recompensa flotando arriba */}
                          <div style={{ 
                            position: 'absolute',
                            bottom: '24px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            color: isReached ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: isReached ? 'bold' : 'normal',
                            fontSize: '0.75rem',
                          }}>
                            {reward.visitsRequired} cortes
                          </div>
                          
                          {/* El "punto" en la línea de tiempo */}
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: isReached ? 'var(--accent-success)' : 'var(--bg-tertiary)',
                            border: `3px solid var(--bg-primary)`,
                            boxShadow: isReached ? '0 0 8px var(--accent-success)' : '0 2px 4px rgba(0,0,0,0.5)',
                            transition: 'all 0.3s ease'
                          }} />
                        </div>
                      );
                    })}
                  </div>

                  {barbershop.rewards.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1rem' }}>No hay recompensas configuradas.</p>
                  )}

                </div>

                {/* Bloque 3: Acciones (Visitas totales y WhatsApp) */}
                <div className={styles.customerActions}>
                  <p style={{ fontSize: '0.875rem' }}>Visitas Totales: <strong>{totalVisits}</strong></p>
                  <a 
                    href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    className="premium-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                  >
                    Enviar WhatsApp
                  </a>
                </div>

              </div>
            );
          })}
          {activeCustomers.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay clientes activos aún.</p>}
        </div>
      </div>
    </div>
  );
}
