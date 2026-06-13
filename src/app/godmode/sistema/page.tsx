import { Settings, Plug, Server, Database } from "lucide-react";

export default function GodmodeSistemaPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Sistema & Integraciones</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configuraciones globales de Barberia.club y conexiones con terceros.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div className="premium-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Plug size={24} color="var(--accent-primary)" />
            <h3 style={{ margin: 0 }}>Integraciones de Marketing</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>Google Analytics</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Seguimiento global de tráfico</p>
              </div>
              <button className="premium-btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Configurar</button>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>Meta Pixel</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Eventos de conversión (FB/IG)</p>
              </div>
              <button className="premium-btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Configurar</button>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>TikTok Pixel</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Campañas en TikTok</p>
              </div>
              <button className="premium-btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Configurar</button>
            </li>
          </ul>
        </div>

        <div className="premium-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Database size={24} color="#8b5cf6" />
            <h3 style={{ margin: 0 }}>Pasarelas de Pago</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>Stripe</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Suscripciones automáticas internacionales</p>
              </div>
              <button className="premium-btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Conectar</button>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>Mercado Pago</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cobros locales (Latam)</p>
              </div>
              <button className="premium-btn-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Conectar</button>
            </li>
          </ul>
        </div>

        <div className="premium-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Server size={24} color="#3b82f6" />
            <h3 style={{ margin: 0 }}>Estado del Servidor</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Base de datos</span>
              <span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>Operativa</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Almacenamiento (Archivos)</span>
              <span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>Normal</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>WhatsApp API</span>
              <span style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>Conectado</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
