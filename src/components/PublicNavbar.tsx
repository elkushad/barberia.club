import Link from 'next/link';
import Image from 'next/image';

export default function PublicNavbar() {
  return (
    <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, padding: '1rem 2rem', backgroundColor: 'rgba(11, 15, 20, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--saas-border)' }}>
      <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0, maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.png" alt="barberia.club logo" width={140} height={40} style={{ objectFit: 'contain' }} />
        </Link>
        
        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="hide-on-mobile">
          <Link href="#inicio" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'white', borderBottom: '2px solid var(--saas-red)', paddingBottom: '4px' }}>
            Inicio
          </Link>
          <Link href="#como-funciona" className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            ¿Cómo funciona?
          </Link>
          <Link href="#beneficios" className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Beneficios
          </Link>
          <Link href="#precios" className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Precios
          </Link>
          <Link href="#soporte" className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Soporte
          </Link>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/login" className="saas-btn-outlined" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            Iniciar sesión
          </Link>
          <Link href="/login" className="saas-btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            Registrar mi barbería
          </Link>
        </div>
        
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hide-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
