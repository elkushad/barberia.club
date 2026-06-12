interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  delay?: string;
}

export default function ServiceCard({ title, description, price, delay = '' }: ServiceCardProps) {
  return (
    <div className={`premium-card animate-slide-up ${delay}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="text-gold-gradient" style={{ fontSize: '1.5rem', margin: 0 }}>{title}</h3>
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{price}</span>
      </div>
      <p className="text-secondary" style={{ flexGrow: 1, marginBottom: '2rem' }}>{description}</p>
      <button className="premium-btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}>
        Agendar
      </button>
    </div>
  );
}
