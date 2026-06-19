import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import ScrollAnimation from '@/components/ScrollAnimation';
import Link from 'next/link';
import RegisterLink from '@/components/RegisterLink';

const APP_URL = "https://barberia.club";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Barberia.club",
  "url": APP_URL,
  "description": "Convierte cada corte en una oportunidad para fidelizar. Sistema de recompensas, QR personalizado y herramientas diseñadas para barberías.",
  "hasPart": [
    { "@type": "WebPage", "name": "Empezar gratis",         "url": `${APP_URL}/register` },
    { "@type": "WebPage", "name": "Programa de referidos",  "url": `${APP_URL}/referidos` },
    { "@type": "WebPage", "name": "Planes",                 "url": `${APP_URL}/planes` },
    { "@type": "WebPage", "name": "Entrar como barbero",    "url": `${APP_URL}/login` },
    { "@type": "WebPage", "name": "Entrar como cliente",    "url": `${APP_URL}/c` },
  ],
};

export default function SaaSLanding() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--saas-bg)', color: 'white' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <PublicNavbar />
      
      <main style={{ flexGrow: 1, paddingTop: '80px' }}>
        {/* HERO SECTION */}
        <section id="inicio" style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 500px' }}>
            <ScrollAnimation>
              <h1 style={{ fontSize: '3.8rem', lineHeight: 1.1, marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Tu barbería.<br/>
                Tus clientes.<br/>
                <i style={{ color: 'var(--saas-red)', fontStyle: 'italic' }}>Su lealtad.</i>
              </h1>
            </ScrollAnimation>
            
            <ScrollAnimation delay="delay-100">
              <p style={{ fontSize: '1.1rem', color: 'var(--saas-text-muted)', marginBottom: '2.5rem', maxWidth: '500px', lineHeight: 1.6 }}>
                Crea tu cuenta gratis, obtén tu flyer con código QR listo para imprimir y comienza a premiar la fidelidad de tus clientes.
              </p>
            </ScrollAnimation>
            
            <ScrollAnimation delay="delay-200">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                <RegisterLink className="saas-btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem', width: '100%', maxWidth: '350px' }}>
                  Registrar mi barbería gratis &rarr;
                </RegisterLink>
                <Link href="/demo" className="saas-btn-outlined" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
                  Ver demo <span style={{ marginLeft: '8px' }}>&#9658;</span>
                </Link>
              </div>
            </ScrollAnimation>
            
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem', color: 'var(--saas-text-muted)', flexWrap: 'nowrap' }}>
              <ScrollAnimation delay="delay-300" style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', padding: '1rem 0.5rem', borderRadius: '12px', transition: 'background-color 0.3s ease, transform 0.3s ease' }} className="feature-item-hover">
                  <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(255,51,102,0.1) 0%, rgba(255,51,102,0.05) 100%)', borderRadius: '50%', color: 'var(--saas-red)', display: 'flex', boxShadow: '0 4px 12px rgba(255,51,102,0.1)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h6v6H3z"/><path d="M15 3h6v6h-6z"/><path d="M3 15h6v6H3z"/><path d="M15 15h6v6h-6z"/></svg>
                  </div>
                  <span style={{ lineHeight: 1.4, fontWeight: 500, color: '#e2e8f0' }}>Flyer con QR<br/>listo para imprimir</span>
                </div>
              </ScrollAnimation>

              <ScrollAnimation delay="delay-400" style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', padding: '1rem 0.5rem', borderRadius: '12px', transition: 'background-color 0.3s ease, transform 0.3s ease' }} className="feature-item-hover">
                  <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(255,51,102,0.1) 0%, rgba(255,51,102,0.05) 100%)', borderRadius: '50%', color: 'var(--saas-red)', display: 'flex', boxShadow: '0 4px 12px rgba(255,51,102,0.1)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                  </div>
                  <span style={{ lineHeight: 1.4, fontWeight: 500, color: '#e2e8f0' }}>Sistema de recompensas<br/>por fidelización</span>
                </div>
              </ScrollAnimation>

              <ScrollAnimation delay="delay-500" style={{ flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', padding: '1rem 0.5rem', borderRadius: '12px', transition: 'background-color 0.3s ease, transform 0.3s ease' }} className="feature-item-hover">
                  <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(255,51,102,0.1) 0%, rgba(255,51,102,0.05) 100%)', borderRadius: '50%', color: 'var(--saas-red)', display: 'flex', boxShadow: '0 4px 12px rgba(255,51,102,0.1)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <span style={{ lineHeight: 1.4, fontWeight: 500, color: '#e2e8f0' }}>Registro de clientes<br/>y contactos</span>
                </div>
              </ScrollAnimation>
            </div>
          </div>
          
          <ScrollAnimation delay="delay-200" style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center' }}>
            <img src="/hero.png" alt="Barberia Club App" style={{ width: '100%', maxWidth: '650px', height: 'auto', objectFit: 'contain' }} />
          </ScrollAnimation>
          
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="como-funciona" style={{ padding: '5rem 1.5rem', backgroundColor: '#07090c' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <ScrollAnimation>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <p style={{ color: 'var(--saas-red)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>Proceso</p>
                <h2 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Así de fácil funciona</h2>
              </div>
            </ScrollAnimation>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', position: 'relative' }}>
              <div className="saas-dashed-line"></div>
              
              {/* Step 1 */}
              <ScrollAnimation delay="delay-100">
                <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', display: 'flex', gap: '1rem', height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--saas-red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                    <div style={{ color: 'var(--saas-text-muted)', marginTop: 'auto' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: 500, color: 'white' }}>Registra tu barbería</h3>
                    <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>Crea tu cuenta en segundos y configura tu barbería.</p>
                  </div>
                </div>
              </ScrollAnimation>

              {/* Step 2 */}
              <ScrollAnimation delay="delay-200">
                <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', display: 'flex', gap: '1rem', height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--saas-red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                    <div style={{ color: 'var(--saas-text-muted)', marginTop: 'auto' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M8 8h8v8H8z"/><path d="M8 8v8"/><path d="M16 8v8"/><path d="M8 16h8"/><path d="M8 8h8"/></svg>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: 500, color: 'white' }}>Descarga tu flyer</h3>
                    <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>Obtén tu flyer con código QR listo para imprimir y colocar en tu local.</p>
                  </div>
                </div>
              </ScrollAnimation>

              {/* Step 3 */}
              <ScrollAnimation delay="delay-300">
                <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', display: 'flex', gap: '1rem', height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--saas-red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                    <div style={{ color: 'var(--saas-text-muted)', marginTop: 'auto' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: 500, color: 'white' }}>Tus clientes escanean</h3>
                    <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>Escanean el QR, se registran y comienzan a acumular puntos automáticamente.</p>
                  </div>
                </div>
              </ScrollAnimation>

              {/* Step 4 */}
              <ScrollAnimation delay="delay-400">
                <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', display: 'flex', gap: '1rem', height: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--saas-red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0 }}>4</div>
                    <div style={{ color: 'var(--saas-text-muted)', marginTop: 'auto' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: 500, color: 'white' }}>Premia y fideliza</h3>
                    <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>Ofrece recompensas, lleva el registro de tus clientes y haz crecer tu negocio.</p>
                  </div>
                </div>
              </ScrollAnimation>

            </div>
          </div>
        </section>

        {/* BENEFITS SECTION (Simplified like the screenshot) */}
        <section id="beneficios" style={{ padding: '0 1.5rem 6rem', backgroundColor: '#07090c' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
              
              <ScrollAnimation delay="delay-100">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ color: 'var(--saas-red)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600, color: 'white' }}>Más clientes frecuentes</h4>
                    <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>Aumenta la lealtad y las visitas recurrentes a tu barbería.</p>
                  </div>
                </div>
              </ScrollAnimation>

              <ScrollAnimation delay="delay-200">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ color: 'var(--saas-red)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600, color: 'white' }}>Conoce a tus clientes</h4>
                    <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>Lleva el registro de contactos, visitas y preferencias.</p>
                  </div>
                </div>
              </ScrollAnimation>

              <ScrollAnimation delay="delay-300">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                  <div style={{ color: 'var(--saas-red)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600, color: 'white' }}>Haz crecer tu negocio</h4>
                    <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>Promociona ofertas y premios para impulsar tus ventas.</p>
                  </div>
                </div>
              </ScrollAnimation>

            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section style={{ padding: '6rem 1.5rem', backgroundColor: '#07090c', borderTop: '1px solid var(--saas-border)', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <ScrollAnimation>
              <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif)', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                Lleva tu barbería al <span style={{ color: 'var(--saas-red)', fontStyle: 'italic' }}>siguiente nivel</span>
              </h2>
            </ScrollAnimation>
            <ScrollAnimation delay="delay-100">
              <p style={{ fontSize: '1.1rem', color: 'var(--saas-text-muted)', marginBottom: '3rem', lineHeight: 1.6 }}>
                Únete a las barberías que ya están fidelizando a sus clientes con barberia.club. Sin costos ocultos, sin compromisos.
              </p>
            </ScrollAnimation>
            <ScrollAnimation delay="delay-200">
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <RegisterLink className="saas-btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                  Registrar mi barbería gratis &rarr;
                </RegisterLink>
                <Link href="#como-funciona" className="saas-btn-outlined" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                  Conocer más
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </section>
        
      </main>

      <PublicFooter />

      <style>{`
        @media (min-width: 900px) {
          .hero-image-container {
            flex: 1 1 400px;
            display: flex;
            justify-content: flex-end;
          }
        }
        @media (max-width: 899px) {
          .hero-image-container {
            width: 100%;
          }
        }
        .feature-item-hover:hover {
          background-color: rgba(255,255,255,0.03);
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
}
