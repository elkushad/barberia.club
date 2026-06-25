import Link from 'next/link';
import CookiePrefsLink from './CookiePrefsLink';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{ backgroundColor: 'var(--saas-bg)', borderTop: '1px solid var(--saas-border)', padding: '4rem 2rem 2rem', color: 'var(--saas-text-muted)' }}>
      <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          
          <div>
            <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>barberia<span style={{ color: '#E63946' }}>.club</span></h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              La plataforma definitiva para gestionar tu barbería y premiar la lealtad de tus clientes.
            </p>
          </div>
          
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 500 }}>Producto</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link href="#como-funciona" style={{ fontSize: '0.9rem' }}>Características</Link></li>
              <li><Link href="/planes" style={{ fontSize: '0.9rem' }}>Precios</Link></li>
              <li><Link href="/login" style={{ fontSize: '0.9rem' }}>Iniciar sesión</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 500 }}>Soporte</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="mailto:barberia.club777@gmail.com" style={{ fontSize: '0.9rem' }}>Centro de ayuda</a></li>
              <li><a href="mailto:barberia.club777@gmail.com" style={{ fontSize: '0.9rem' }}>Contacto</a></li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem', fontWeight: 500 }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link href="/terminos" style={{ fontSize: '0.9rem' }}>Términos de servicio</Link></li>
              <li><Link href="/privacidad" style={{ fontSize: '0.9rem' }}>Política de privacidad</Link></li>
              <li><Link href="/eliminar-cuenta" style={{ fontSize: '0.9rem' }}>Eliminar cuenta</Link></li>
              <li><CookiePrefsLink style={{ fontSize: '0.9rem' }} /></li>
            </ul>
          </div>
          
        </div>
        
        <div style={{ borderTop: '1px solid var(--saas-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
          <p>&copy; {currentYear} barberia<span style={{ color: '#E63946' }}>.club</span>. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="#">X (Twitter)</Link>
            <Link href="#">Instagram</Link>
            <Link href="#">Facebook</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
