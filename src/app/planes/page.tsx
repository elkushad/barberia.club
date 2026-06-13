import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import ScrollAnimation from "@/components/ScrollAnimation";

export default function PlanesPage() {
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>S/.0</span>
                </div>
                
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
                </ul>

                <Link href="/admin" className="saas-btn-outlined" style={{ width: '100%', marginTop: 'auto', padding: '1rem', textAlign: 'center' }}>
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'white' }}>S/.50</span>
                  <span style={{ color: 'var(--saas-text-muted)' }}>/mes</span>
                </div>
                
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
                </ul>

                <Link href="#" className="saas-btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '1rem', textAlign: 'center', animation: 'none' }}>
                  Contactar para subir a PRO
                </Link>
              </div>
            </ScrollAnimation>

          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
