import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export default async function QRPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug }
  });

  if (!barbershop) return null;

  // Ideally this would use an environment variable for the domain
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const landingUrl = `${domain}/${barbershop.slug}`;
  
  // Generate QR as Data URI
  const qrDataUrl = await QRCode.toDataURL(landingUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Material Promocional y QR</h2>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
        
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Tu Código QR Oficial</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
            Imprime este código y colócalo en tu barbería. Los clientes lo escanearán para registrarse y sumar visitas.
          </p>
          
          <div style={{ background: 'white', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
            <img src={qrDataUrl} alt={`QR Code for ${barbershop.name}`} style={{ width: '100%', maxWidth: '300px' }} />
          </div>
          
          <a href={qrDataUrl} download={`QR_${barbershop.slug}.png`} className="premium-btn">
            Descargar Imagen QR
          </a>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem' }}>Instrucciones para el Local</h3>
          <div className="premium-card">
            <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Imprime el QR:</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Descarga la imagen y ponla en un lugar visible (espejos, recepción).</p>
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Invita a los clientes:</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Diles: &quot;Escanea este código para unirte a nuestro club y ganar cortes gratis&quot;.</p>
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Aprueba en tu panel:</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Cuando se registren, ve a la pestaña &quot;Clientes&quot; y apruébalos.</p>
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Suma visitas:</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Cada vez que vuelvan, pídeles que escaneen el mismo QR para registrar su visita.</p>
              </li>
            </ol>
          </div>
          
          <div className="premium-card" style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Enlace Directo</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              También puedes enviar este enlace por WhatsApp o Instagram:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" readOnly value={landingUrl} className="premium-input" style={{ flex: 1 }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
