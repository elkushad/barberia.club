import { prisma } from "@/lib/prisma";
import { CircleDollarSign, TrendingUp, RefreshCw, CreditCard } from "lucide-react";

export default async function GodmodeFinanzasPage() {
  const payments = await prisma.payment.findMany({
    include: { barbershop: { select: { name: true, slug: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const barbershops = await prisma.barbershop.findMany({ select: { plan: true } });
  
  // Calculate metrics (Mocking logic for MVP where PRO = 50)
  const proCount = barbershops.filter(b => b.plan === "PRO").length;
  const mrr = proCount * 50;
  const arr = mrr * 12;
  
  const totalRevenue = payments.reduce((acc, p) => p.status === 'PAID' ? acc + p.amount : acc, 0);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentRevenue = payments
    .filter(p => p.status === 'PAID' && p.createdAt >= thirtyDaysAgo)
    .reduce((acc, p) => acc + p.amount, 0);

  const averagePerBarbershop = barbershops.length > 0 ? (totalRevenue / barbershops.length).toFixed(2) : "0.00";

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard Financiero</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Métricas clave de ingresos y suscripciones.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="premium-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>MRR Actual</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={24} color="var(--accent-success)" />
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>S/{mrr}</span>
          </div>
        </div>
        
        <div className="premium-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>ARR Proyectado</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={24} color="#3b82f6" />
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>S/{arr}</span>
          </div>
        </div>

        <div className="premium-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Ingresos Totales (Histórico)</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CircleDollarSign size={24} color="#8b5cf6" />
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>S/{totalRevenue}</span>
          </div>
        </div>

        <div className="premium-card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Ingresos Últimos 30 Días</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={24} color="#f59e0b" />
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>S/{recentRevenue}</span>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Historial de Transacciones</h3>
      <div className="premium-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Fecha</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Barbería</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Monto</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Estado</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Método</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{p.createdAt.toLocaleDateString()} {p.createdAt.toLocaleTimeString()}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.barbershop.name}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.currency} {p.amount}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: p.status === 'PAID' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: p.status === 'PAID' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay transacciones registradas.
          </div>
        )}
      </div>

    </div>
  );
}
