"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PublicFooter from "@/components/PublicFooter";

function SuccessContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "gratis";
  const isPro = plan === "pro";
  
  const accentColor = isPro ? "var(--saas-red)" : "#10B981";
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--saas-bg)', color: 'white' }}>
      
      {/* Custom Navbar for Success Page */}
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--saas-border)', backgroundColor: 'rgba(11, 15, 20, 0.9)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <Image src="/logo.png" alt="barberia.club logo" width={140} height={40} style={{ objectFit: 'contain' }} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/admin" className="saas-btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              Ir a mi panel
            </Link>
            <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ maxWidth: '800px', width: '100%' }}>
          
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
              {/* Fake Confetti Dots */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '30%', width: '4px', height: '4px', backgroundColor: accentColor, borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', top: '20px', left: '10%', width: '3px', height: '3px', backgroundColor: 'white', borderRadius: '50%', opacity: 0.5 }}></div>
                <div style={{ position: 'absolute', top: '40%', right: '-20px', width: '5px', height: '5px', backgroundColor: accentColor, borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-10px', right: '30%', width: '3px', height: '3px', backgroundColor: '#10B981', borderRadius: '50%', opacity: 0.8 }}></div>
              </div>

              <div style={{ 
                width: '80px', height: '80px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                border: '2px solid #10B981', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)' 
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>

            <p style={{ color: accentColor, fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>
              {isPro ? "¡PAGO APROBADO!" : "¡LISTO!"}
            </p>
            
            <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', fontWeight: 700, marginBottom: '1rem', lineHeight: '1.2' }}>
              {isPro ? "Bienvenido a" : "Ya estás en"}<br/>
              barberia.club <span style={{ color: accentColor }}>{isPro ? "Pro" : "Gratis"}</span>
            </h1>
            
            <p style={{ color: 'var(--saas-text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
              {isPro 
                ? "Tu suscripción se ha activado correctamente. Ya puedes empezar a hacer crecer tu barbería."
                : "Tu cuenta ha sido creada correctamente. Empieza a usar tu plan Gratis sin riesgos."
              }
            </p>
          </div>

          {/* Plan Details Card */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--saas-border)', 
            borderRadius: '16px', 
            padding: '2.5rem', 
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '2rem',
            marginBottom: '4rem'
          }}>
            {/* Left side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6"></circle>
                  <polygon points="12 5.5 13.5 7.5 15.5 8 14 9.5 14.5 11.5 12 10.5 9.5 11.5 10 9.5 8.5 8 10.5 7.5"></polygon>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                  Plan {isPro ? "Pro" : "Gratis"}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'white' }}>
                    {isPro ? "S/.50" : "S/.0"}
                  </span>
                  {isPro && <span style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem' }}>/mes</span>}
                </div>
                <span style={{ 
                  display: 'inline-block',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                  color: '#10B981', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  padding: '2px 10px', 
                  borderRadius: '100px' 
                }}>
                  Activo
                </span>
              </div>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1, maxWidth: '280px', borderLeft: '1px solid var(--saas-border)', paddingLeft: '2rem' }} className="details-right-col">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-text-muted)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--saas-text-muted)', margin: '0 0 0.25rem 0' }}>Fecha de activación</p>
                  <p style={{ fontSize: '0.95rem', color: 'white', margin: 0, fontWeight: 500 }}>25 de mayo de 2024</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-text-muted)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  {isPro ? (
                    <>
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </>
                  ) : (
                    <>
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                    </>
                  )}
                </svg>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--saas-text-muted)', margin: '0 0 0.25rem 0' }}>
                    {isPro ? "Próximo cobro" : "Tu plan incluye"}
                  </p>
                  <p style={{ fontSize: '0.95rem', color: 'white', margin: 0, fontWeight: 500 }}>
                    {isPro ? "25 de junio de 2024" : "Hasta 3 clientes"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps Section */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
            ¿Qué sigue ahora?
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            
            {/* Step 1 */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--saas-border)', borderRadius: '12px', padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 18c1.38 0 2.5-1.12 2.5-2.5S10.38 13 9 13s-2.5 1.12-2.5 2.5S7.62 18 9 18z"></path>
                </svg>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.75rem' }}>Configura tu perfil</h4>
              <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5', flexGrow: 1 }}>
                Completa la información de tu barbería y destaca ante más clientes.
              </p>
              <Link href="/admin/perfil" className="saas-btn-outlined" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}>
                Ir a mi perfil &nbsp;<span style={{fontSize: '1.1em'}}>›</span>
              </Link>
            </div>

            {/* Step 2 */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--saas-border)', borderRadius: '12px', padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.75rem' }}>Crea tu landing</h4>
              <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5', flexGrow: 1 }}>
                Diseña tu página {isPro ? "profesional" : "básica"} y comienza a recibir {isPro ? "más reservas" : "tus primeras reservas"}.
              </p>
              <Link href="/admin/landing" className="saas-btn-outlined" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}>
                Crear landing &nbsp;<span style={{fontSize: '1.1em'}}>›</span>
              </Link>
            </div>

            {/* Step 3 */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--saas-border)', borderRadius: '12px', padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
                  <polyline points="20 12 20 22 4 22 4 12"></polyline>
                  <rect x="2" y="7" width="20" height="5"></rect>
                  <line x1="12" y1="22" x2="12" y2="7"></line>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                </svg>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.75rem' }}>
                {isPro ? "Gestiona tus recompensas" : "Gestiona tus clientes"}
              </h4>
              <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5', flexGrow: 1 }}>
                {isPro 
                  ? "Ofrece experiencias únicas y fideliza a tus mejores clientes."
                  : "Agrega hasta 3 clientes y empieza a organizar tus citas desde un solo lugar."
                }
              </p>
              <Link href={isPro ? "/admin/recompensas" : "/admin/clientes"} className="saas-btn-outlined" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}>
                {isPro ? "Ir a recompensas" : "Ir a clientes"} &nbsp;<span style={{fontSize: '1.1em'}}>›</span>
              </Link>
            </div>

          </div>

          {/* Help Banner */}
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.01)', 
            border: '1px solid var(--saas-border)', 
            borderRadius: '12px', 
            padding: '1.5rem 2rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                </svg>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>¿Necesitas ayuda?</h4>
                <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', margin: 0 }}>Nuestro equipo está listo para ayudarte.</p>
              </div>
            </div>
            <Link href="#" className="saas-btn-outlined" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}>
              Contactar soporte
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </Link>
          </div>

        </div>
      </main>

      <PublicFooter />

      <style>{`
        @media (max-width: 768px) {
          .details-right-col {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid var(--saas-border);
            padding-top: 1.5rem;
            width: 100%;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--saas-bg)', color: 'white' }}>
        <p>Cargando...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
