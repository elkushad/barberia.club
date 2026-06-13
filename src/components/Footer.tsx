import Image from 'next/image';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '4rem 0 2rem', marginTop: '4rem' }}>
      <div className="page-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <h2 className="text-gold-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>BARBER.CLUB</h2>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>
              Redefiniendo la experiencia del grooming tradicional con estándares modernos de excelencia.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Horarios</h4>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}><span>Lunes - Viernes</span> <span>09:00 - 20:00</span></li>
              <li style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}><span>Sábados</span> <span>10:00 - 18:00</span></li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Domingos</span> <span style={{ color: 'var(--accent-danger)' }}>Cerrado</span></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Contacto</h4>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>📍 Av. Principal 123, Ciudad</li>
              <li style={{ marginBottom: '0.5rem' }}>📞 +1 234 567 890</li>
              <li>✉️ info@barberia.club</li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p>&copy; {new Date().getFullYear()} BARBER.CLUB. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
            <span>Powered by</span>
            <Image src="/logo.png" alt="Barber.club Logo" width={150} height={48} style={{ objectFit: 'contain' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
