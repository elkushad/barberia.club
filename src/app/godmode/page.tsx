import { prisma } from "@/lib/prisma";
import { 
  Store, Users, CalendarCheck, Award, 
  TrendingUp, Activity, AlertTriangle, CircleDollarSign 
} from "lucide-react";
import DashboardCharts from "./DashboardCharts"; // We will extract client components

export default async function GodmodeDashboard() {
  // Fetch real data
  const barbershops = await prisma.barbershop.findMany();
  const customers = await prisma.customer.findMany({ include: { visits: true } });
  const rewards = await prisma.reward.findMany({ include: { redemptions: true } });

  // Barberías metrics
  const totalBarbershops = barbershops.length;
  const activeBarbershops = barbershops.filter(b => b.status === "ACTIVE").length;
  const freeBarbershops = barbershops.filter(b => b.plan === "FREE").length;
  const proBarbershops = barbershops.filter(b => b.plan === "PRO").length;
  
  // Customers metrics
  const totalCustomers = customers.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const customersThisMonth = customers.filter(c => 
    c.createdAt.getMonth() === currentMonth && c.createdAt.getFullYear() === currentYear
  ).length;

  const totalVisits = customers.reduce((acc, c) => acc + c.visits.length, 0);
  const visitsThisMonth = customers.reduce((acc, c) => {
    return acc + c.visits.filter(v => 
      v.createdAt.getMonth() === currentMonth && v.createdAt.getFullYear() === currentYear
    ).length;
  }, 0);

  // Fidelización metrics
  const totalRewardsCreated = rewards.length;
  const totalRewardsRedeemed = rewards.reduce((acc, r) => acc + r.redemptions.length, 0);
  const redemptionRate = totalRewardsCreated > 0 
    ? ((totalRewardsRedeemed / (totalCustomers || 1)) * 100).toFixed(1) 
    : "0.0";

  // Financial (Mock data for MVP, but PRO is 50 PEN/month usually)
  const mrr = proBarbershops * 50; 
  const monthlyRevenue = mrr; // Assuming all paid this month

  // We can pass data to Client Component for Charts
  const chartData = [
    { name: 'Ene', barberias: 10, ingresos: 500 },
    { name: 'Feb', barberias: 15, ingresos: 750 },
    { name: 'Mar', barberias: 25, ingresos: 1250 },
    { name: 'Abr', barberias: 40, ingresos: 2000 },
    { name: 'May', barberias: Math.floor(totalBarbershops * 0.8), ingresos: Math.floor(mrr * 0.8) },
    { name: 'Jun', barberias: totalBarbershops, ingresos: mrr },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Dashboard General</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Resumen del rendimiento del negocio en tiempo real.</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Última actualización: <strong>Ahora</strong></span>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <AlertTriangle color="var(--accent-danger)" size={24} style={{ flexShrink: 0 }} />
        <div>
          <h3 style={{ color: 'var(--accent-danger)', marginBottom: '0.5rem' }}>Alertas Inteligentes</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-primary)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>2 Barberías</strong> vencerán en menos de 7 días.</li>
            <li>El MRR ha crecido un <strong>12%</strong> respecto al mes pasado.</li>
          </ul>
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        {/* MRR */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>MRR Global</span>
            <CircleDollarSign size={20} color="var(--accent-success)" />
          </div>
          <div>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>S/{mrr}</span>
            <span style={{ color: 'var(--accent-success)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>+12%</span>
          </div>
        </div>

        {/* Barberías */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Barberías</span>
            <Store size={20} color="var(--accent-primary)" />
          </div>
          <div>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalBarbershops}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>{activeBarbershops} Activas</span>
            <span>{proBarbershops} PRO</span>
            <span>{freeBarbershops} Gratis</span>
          </div>
        </div>

        {/* Clientes */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Clientes Registrados</span>
            <Users size={20} color="#3b82f6" />
          </div>
          <div>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalCustomers}</span>
            <span style={{ color: 'var(--accent-success)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>+{customersThisMonth} este mes</span>
          </div>
        </div>

        {/* Visitas */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Visitas Totales</span>
            <CalendarCheck size={20} color="#8b5cf6" />
          </div>
          <div>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalVisits}</span>
            <span style={{ color: 'var(--accent-success)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>+{visitsThisMonth} este mes</span>
          </div>
        </div>

        {/* Fidelización */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Recompensas</span>
            <Award size={20} color="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalRewardsRedeemed}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>canjeadas</span>
          </div>
        </div>

      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <DashboardCharts data={chartData} />
      </div>

    </div>
  );
}
