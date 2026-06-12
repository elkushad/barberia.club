import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import LandingForm from "./LandingForm";
import CarouselBackground from "./CarouselBackground";

export default async function PublicLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug }
  });

  if (!barbershop) {
    notFound();
  }

  const brandColor = barbershop.brandColor || "#eab308";
  
  let bannerUrls: string[] = [];
  try {
    const parsed = JSON.parse(barbershop.banner || "[]");
    if (Array.isArray(parsed)) {
      bannerUrls = parsed;
    } else if (barbershop.banner) {
      bannerUrls = [barbershop.banner];
    }
  } catch(e) {
    if (barbershop.banner) bannerUrls = [barbershop.banner];
  }

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Background Layer */}
      {bannerUrls.length > 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.3 }}>
          <CarouselBackground mediaUrls={bannerUrls} />
        </div>
      )}

      {/* Main Unified Content Area */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        zIndex: 10, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '1rem',
        gap: '1rem',
        overflow: 'hidden'
      }}>
        
        {/* Header (Logo y Título) */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          {barbershop.logo && (
            <img src={barbershop.logo} alt="Logo" style={{ width: '180px', height: '180px', maxWidth: '20vh', maxHeight: '20vh', borderRadius: '0', objectFit: 'contain', marginBottom: '0.5rem' }} />
          )}
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', margin: 0, color: 'var(--text-primary)' }}>{barbershop.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem, 3vw, 1rem)', margin: '0.25rem 0 0 0', maxWidth: '400px' }}>
            {barbershop.description || "Únete a nuestro club y disfruta beneficios exclusivos."}
          </p>
        </div>

        {/* Formulario / Botones */}
        <div style={{ width: '100%', maxWidth: '400px', flexShrink: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <LandingForm 
            barbershopId={barbershop.id} 
            brandColor={brandColor} 
            barbershopName={barbershop.name}
            barbershopWhatsapp={barbershop.whatsapp || ""}
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ padding: '0.25rem 0.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span>Powered by</span>
        <Image src="/logo.png" alt="Barber.club Logo" width={80} height={24} style={{ objectFit: 'contain' }} />
      </footer>
    </div>
  );
}
