import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Users, Store } from "lucide-react";

export default async function GodmodeClientesPage() {
  await requireAdmin();

  const customers = await prisma.customer.findMany({
    include: {
      barbershop: { select: { name: true, slug: true } },
      _count: { select: { visits: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Clientes Globales</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Todos los clientes registrados a través de la plataforma.</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} color="var(--text-secondary)" />
          <span style={{ fontWeight: 'bold' }}>{customers.length} Registros</span>
        </div>
      </div>

      <div className="premium-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Cliente</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Barbería Origen</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Teléfono</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Código</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Visitas Totales</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 'bold' }}>{c.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registrado: {c.createdAt.toLocaleDateString()}</p>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Store size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.875rem' }}>{c.barbershop.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{c.phone}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', fontFamily: 'monospace' }}>
                    {c.uniqueCode || "N/A"}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                  {c._count.visits}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No hay clientes registrados en ninguna barbería.
          </div>
        )}
      </div>

    </div>
  );
}
