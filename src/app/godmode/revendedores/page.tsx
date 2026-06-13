import { Network, Construction } from "lucide-react";

export default function GodmodeRevendedoresPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <Network size={64} color="var(--accent-primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Programa de Revendedores</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '2rem' }}>
        Esta función forma parte de la <strong>Fase 2</strong>. Aquí podrás gestionar tu red de afiliados, ver barberías referidas, calcular comisiones generadas y procesar pagos pendientes.
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '9999px', color: 'var(--text-secondary)' }}>
        <Construction size={20} />
        <span>En construcción</span>
      </div>
    </div>
  );
}
