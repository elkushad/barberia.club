import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServiceCard from '@/components/ServiceCard';
import Footer from '@/components/Footer';

export default function Home() {
  const services = [
    {
      title: 'Corte Clásico',
      description: 'Corte a tijera o máquina, lavado con champú premium, masaje capilar y peinado con productos de alta gama.',
      price: '$25',
      delay: 'delay-100'
    },
    {
      title: 'Diseño de Barba',
      description: 'Perfilado de barba con navaja libre, toalla caliente, aceites esenciales y bálsamo hidratante.',
      price: '$15',
      delay: 'delay-200'
    },
    {
      title: 'Experiencia Royal',
      description: 'El servicio definitivo. Corte clásico, diseño de barba, tratamiento facial exfoliante y mascarilla.',
      price: '$45',
      delay: 'delay-300'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flexGrow: 1 }}>
        <Hero />
        
        <section id="servicios" className="page-container" style={{ padding: '6rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Nuestros Servicios</h2>
            <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--accent-primary)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {services.map((service, index) => (
              <ServiceCard 
                key={index}
                title={service.title}
                description={service.description}
                price={service.price}
                delay={service.delay}
              />
            ))}
          </div>
        </section>

        <section id="galeria" style={{ backgroundColor: 'var(--bg-secondary)', padding: '6rem 0' }}>
          <div className="page-container">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h2 className="text-gold-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>La Experiencia Barber.Club</h2>
              <p className="text-secondary" style={{ maxWidth: '700px', marginBottom: '3rem', fontSize: '1.1rem' }}>
                No solo cortamos el pelo, creamos un estilo que define tu personalidad. Relájate con una bebida de cortesía mientras nuestros expertos se encargan de tu imagen.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="/login" className="premium-btn">
                  Únete al Club
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
