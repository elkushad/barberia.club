import Link from 'next/link';
import Image from 'next/image';
import RegisterLink from './RegisterLink';

export default function PublicNavbar() {
  return (
    <nav className="public-nav" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, backgroundColor: 'rgba(11, 15, 20, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--saas-border)' }}>
      <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0, maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.png" alt="barberia.club logo" width={140} height={40} className="nav-logo" style={{ objectFit: 'contain' }} />
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
          <Link href="/planes" className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Precios
          </Link>
          <a href="mailto:contacto@barberia.club" className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Soporte
          </a>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="nav-actions">
          <Link href="/login" className="saas-btn-outlined nav-btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            Iniciar sesión
          </Link>
          <RegisterLink className="saas-btn-primary nav-btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            Empezar ahora
          </RegisterLink>
        </div>
        
      </div>

      <style>{`
        .public-nav {
          padding: 1rem 2rem 1rem 0.75rem;
        }
        @media (max-width: 900px) {
          .hide-on-mobile {
            display: none !important;
          }
          .public-nav {
            padding: 0.5rem; /* Menos padding para pegar el logo más a la izquierda */
          }
          .nav-logo {
            width: 120px !important;
            height: 30px !important;
          }
          .nav-actions {
            gap: 0.5rem !important;
          }
          .nav-btn-outline {
            display: none !important; /* Esconder iniciar sesión en móvil si falta espacio, o achicarlo */
          }
          .nav-btn-primary {
            padding: 0.5rem 0.8rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </nav>
  );
}
