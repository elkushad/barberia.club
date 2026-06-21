import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getReferralProgress } from "@/lib/client-referrals";
import ReferralProgressCard from "./ReferralProgressCard";
import ReferralProgressBar from "@/components/ReferralProgressBar";

export default async function CustomerDashboardPage({ params }: { params: Promise<{ uniqueCode: string }> }) {
  const { uniqueCode } = await params;
  const customer = await prisma.customer.findFirst({
    where: { uniqueCode, status: "ACTIVE" },
    include: {
      barbershop: {
        include: {
          rewards: {
            orderBy: { visitsRequired: 'asc' }
          }
        }
      },
      _count: {
        select: {
          visits: { where: { status: "CONFIRMED" } }
        }
      }
    }
  });

  if (!customer) {
    notFound();
  }

  const totalVisits = customer._count.visits;
  const barbershop = customer.barbershop;
  const rewards = barbershop.rewards;
  const maxVisits = rewards.length > 0 ? rewards[rewards.length - 1].visitsRequired : 10;

  const referralProgress = await getReferralProgress(customer.id, barbershop.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://barberia.club";
  const referralUrl = `${appUrl}/${barbershop.slug}?ref=${customer.uniqueCode}`;
  
  let effectiveVisits = totalVisits % maxVisits;
  if (effectiveVisits === 0 && totalVisits > 0) {
    effectiveVisits = maxVisits;
  }

  const visitsCount = effectiveVisits; // Use effective visits for the UI

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Area */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', textAlign: 'center' }}>
        {barbershop.logo && (
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <img src={barbershop.logo} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '0', objectFit: 'contain' }} />
          </div>
        )}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{barbershop.name}</p>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Hola, {customer.name} 👋</h1>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ 
            border: '2px solid var(--border-color)', 
            borderRadius: '16px', 
            padding: '1rem', 
            textAlign: 'center', 
            width: '120px',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Vas</p>
            <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-primary)', lineHeight: 1 }}>{visitsCount}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>cortes</p>
          </div>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '1rem' }}>recompensas</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {barbershop.rewards.map((reward, index) => {
            const isUnlocked = visitsCount >= reward.visitsRequired;
            const prevRequired = index === 0 ? 0 : barbershop.rewards[index - 1].visitsRequired;
            
            let progress = 0;
            if (visitsCount >= reward.visitsRequired) {
              progress = 100;
            } else if (visitsCount > prevRequired) {
              progress = ((visitsCount - prevRequired) / (reward.visitsRequired - prevRequired)) * 100;
            }

            return (
              <div key={reward.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{reward.visitsRequired}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>cortes</span>
                </div>
                
                <div style={{ 
                  flex: 1, 
                  height: '28px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(10,10,10,0.8)',
                  position: 'relative',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${progress}%`, 
                    backgroundColor: 'var(--accent-success)',
                    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: progress > 0 ? '0 0 10px var(--accent-success)' : 'none'
                  }} />
                  <span style={{ 
                    position: 'absolute', 
                    left: '50%', 
                    top: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: '#ffffff',
                    textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)',
                    whiteSpace: 'nowrap',
                    zIndex: 2
                  }}>
                    {reward.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', width: '50px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    opacity: isUnlocked ? 1 : 0.4,
                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                    borderRadius: '50%',
                    overflow: 'hidden'
                  }}>
                    {reward.image ? (
                      <img src={reward.image} alt={reward.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🎁</span>
                    )}
                  </div>
                  {isUnlocked && (
                    <span style={{ color: 'var(--accent-success)', fontSize: '1.25rem', fontWeight: 'bold', position: 'absolute', right: '0' }}>✓</span>
                  )}
                </div>
              </div>
            );
          })}
          {barbershop.rewards.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Pronto habrán recompensas disponibles.</p>
          )}

          {/* Barra celeste: progreso de la recompensa por referidos (solo si ya invitó a alguien) */}
          {referralProgress?.reward &&
            referralProgress.validCount + referralProgress.pendingCount >= 1 && (
              <ReferralProgressBar
                rewardName={referralProgress.reward.name}
                required={referralProgress.required}
                validCount={referralProgress.validCount}
              />
            )}
        </div>

        {/* Tarjeta de referidos del cliente */}
        {referralProgress && customer.uniqueCode && (
          <div style={{ marginTop: '2rem' }}>
            <ReferralProgressCard referralUrl={referralUrl} />
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href={`/${barbershop.slug}`} className="premium-btn" style={{ width: '100%', maxWidth: '300px' }}>
            Volver al menú
          </Link>
        </div>

      </div>
      
    </div>
  );
}
