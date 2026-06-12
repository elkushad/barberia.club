import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <section style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Background Image */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image 
          src="/hero-bg.png" 
          alt="Barbershop Interior" 
          fill
          style={{ objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.35)' }}
          priority
        />
      </div>

      {/* Content */}
      <div className="page-container animate-fade-in" style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%' }}>
        <h1 className="text-gradient animate-slide-up" style={{ fontSize: '4.5rem', marginBottom: '1rem', lineHeight: 1.1 }}>
          Cortes de <span className="text-gold-gradient">Autor</span>
        </h1>
        <p className="text-secondary animate-slide-up delay-100" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem', fontWeight: 300 }}>
          Experimenta el arte del grooming clásico combinado con estilos modernos en un ambiente diseñado para caballeros.
        </p>
        <div className="flex-center animate-slide-up delay-200" style={{ gap: '1.5rem' }}>
          <Link href="/login" className="premium-btn">
            Reservar Cita
          </Link>
          <Link href="#servicios" className="premium-btn-secondary">
            Ver Servicios
          </Link>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="animate-fade-in delay-500" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, animation: 'bounce 2s infinite' }}>
        <div style={{ width: '30px', height: '50px', border: '2px solid var(--text-secondary)', borderRadius: '15px', display: 'flex', justifyContent: 'center', padding: '5px' }}>
          <div style={{ width: '4px', height: '10px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px' }}></div>
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
          40% { transform: translateY(-15px) translateX(-50%); }
          60% { transform: translateY(-7px) translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
