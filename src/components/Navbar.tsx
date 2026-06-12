import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="glass-panel" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, padding: '1rem 2rem' }}>
      <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
        <Link href="/" className="text-gold-gradient" style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
          BARBER.CLUB
        </Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="#servicios" className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Servicios
          </Link>
          <Link href="#galeria" className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            Galería
          </Link>
          <Link href="/login" className="premium-btn" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>
            Acceder
          </Link>
        </div>
      </div>
    </nav>
  );
}
