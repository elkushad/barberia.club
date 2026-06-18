import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import ScrollAnimation from "@/components/ScrollAnimation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectCountryCode, currencyForCode, usdToLocal } from "@/lib/pricing";
import ProPriceSelector from "@/components/ProPriceSelector";

export default async function PlanesPage() {
  const session = await getSession();
  let countryCode: string | null = null;
  let slug: string | null = null;
  if (session) {
    const userId = (session.user as { id?: string })?.id;
    if (userId) {
      const shop = await prisma.barbershop.findFirst({ where: { ownerId: userId } });
      if (shop) {
        countryCode = detectCountryCode(shop.whatsapp);
        slug = shop.slug;
      }
    }
  }
  const peru = countryCode === "+51";
  const cur = currencyForCode(countryCode);
  const localApprox = !peru && cur && cur.currency !== "USD" ? await usdToLocal(cur.currency) : null;
  const freeHref = session ? "/admin" : "/register";
  const proHref = slug ? `/admin/${slug}/mi-plan` : "/register";

  // Moneda por defecto del selector: soles para barberías de Perú, dólares para el resto.
  const defaultCurrency = peru ? "PEN" : "USD";
  // Conversión aproximada del precio en USD a la moneda local del usuario extranjero.
  const approxLabel =
    localApprox !== null && cur
      ? `≈ ${cur.symbol} ${localApprox.toLocaleString("es", { maximumFractionDigits: 0 })} en tu moneda (aprox.)`
      : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--saas-bg)', color: 'white' }}>
      <PublicNavbar />
      
      <main style={{ flexGrow: 1, paddingTop: '100px', paddingBottom: '6rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          <ScrollAnimation>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <p style={{ color: 'var(--saas-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>Planes</p>
              <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', fontWeight: 700, marginBottom: '1rem' }}>Precios transparentes</h1>
              <p style={{ color: 'var(--saas-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Empieza gratis y mejora tu plan cuando tu barbería crezca. Sin contratos ni letras pequeñas.
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation delay="delay-100">
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: '1rem',
              border: '1px solid var(--saas-border)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              maxWidth: '500px',
              margin: '0 auto 4rem auto',
              backgroundColor: 'transparent'
            }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.3 }}>Sin contratos</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.3 }}>Cancela cuando quieras</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.3 }}>Soporte humano</span>
              </div>
            </div>
          </ScrollAnimation>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
            
            {/* PLAN GRATIS */}
            <ScrollAnimation delay="delay-100">
              <div style={{ 
                backgroundColor: '#0d1117', 
                borderRadius: '16px', 
                border: '1px solid var(--saas-border)',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Gratis</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>S/.0</span>
                </div>
                <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.4' }}>
                  Ideal para empezar<br/>sin riesgos.
                </p>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--saas-text-muted)' }}>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Hasta <strong>3 clientes</strong></span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span>QR personalizado</span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Landing page básica</span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Hasta <strong>1 recompensa</strong></span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Últimas 5 visitas en historial</span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'var(--saas-red)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em', flexShrink: 0 }}>PRONTO</span>
                    <span>Recordatorios de citas</span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'var(--saas-red)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em', flexShrink: 0 }}>PRONTO</span>
                    <span>Panel de estadísticas básico</span>
                  </li>
                </ul>

                <Link href={freeHref} className="saas-btn-outlined" style={{ width: '100%', marginTop: 'auto', padding: '1rem', textAlign: 'center' }}>
                  Elegir plan Gratis
                </Link>
              </div>
            </ScrollAnimation>

            {/* PLAN PRO */}
            <ScrollAnimation delay="delay-200">
              <div style={{ 
                backgroundColor: '#11151c', 
                borderRadius: '16px', 
                border: '2px solid var(--saas-red)',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                boxShadow: '0 0 30px rgba(230, 57, 70, 0.1)'
              }}>
                <div style={{ position: 'absolute', top: '-12px', right: '24px', backgroundColor: 'var(--saas-red)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Más popular
                </div>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'white' }}>Pro</h3>
                <ProPriceSelector defaultCurrency={defaultCurrency} approxLabel={approxLabel} />
                <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Se renueva automáticamente · cancela cuando quieras
                </p>
                <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.4' }}>
                  Todo lo que necesitas<br/>para hacer crecer tu negocio.
                </p>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: '#e2e8f0' }}>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span><strong>Clientes ilimitados</strong></span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Hasta 5 imágenes + 2 videos en landing</span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Hasta <strong>10 recompensas</strong></span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span>WhatsApp integrado</span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span><strong>Historial completo</strong> desde el inicio</span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'var(--saas-red)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em', flexShrink: 0 }}>PRONTO</span>
                    <span>Automatizaciones de fidelización</span>
                  </li>
                  <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ backgroundColor: 'var(--saas-red)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em', flexShrink: 0 }}>PRONTO</span>
                    <span>Reportes avanzados</span>
                  </li>
                </ul>

                <Link href={proHref} className="saas-btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '1rem', textAlign: 'center', animation: 'none' }}>
                  Empezar con Pro
                </Link>
              </div>
            </ScrollAnimation>

          </div>

          <ScrollAnimation delay="delay-300">
            <div style={{ 
              marginTop: '4rem',
              backgroundColor: '#0d1117', 
              borderRadius: '16px', 
              border: '1px solid var(--saas-border)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: 'transparent', 
                  border: '1px solid var(--saas-red)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--saas-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>¿Necesitas algo más?</h4>
                  <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.95rem', margin: 0 }}>Planes personalizados para cadenas de barberías.</p>
                </div>
              </div>
              <a href="mailto:contacto@barberia.club?subject=Consulta%20de%20ventas" className="saas-btn-outlined" style={{ whiteSpace: 'nowrap' }}>
                Hablar con ventas
              </a>
            </div>
          </ScrollAnimation>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
