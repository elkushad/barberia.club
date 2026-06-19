import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";
import { assertBarbershopAccessBySlug } from "@/lib/guards";
import { hasProAccess } from "@/lib/plans";
import { getFlyerTemplate, isFlyerTemplateId, FLYER_TEMPLATES } from "@/lib/flyer-templates";
import FlyerWithQR from "./FlyerWithQR";

export default async function QRPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug }
  });

  if (!barbershop) return null;

  const isPro = hasProAccess(barbershop);
  const selectedTemplate = getFlyerTemplate(barbershop.flyerTemplate);

  // Persiste la plantilla elegida por la barbería. Las plantillas PRO solo
  // pueden guardarse si la barbería tiene acceso PRO (defensa en servidor).
  async function saveFlyerTemplate(templateId: string) {
    "use server";
    const shop = await assertBarbershopAccessBySlug(slug);
    if (!isFlyerTemplateId(templateId)) return;
    const tpl = FLYER_TEMPLATES.find((t) => t.id === templateId);
    if (tpl?.pro && !hasProAccess(shop)) return; // Free no puede usar plantillas PRO
    await prisma.barbershop.update({
      where: { slug },
      data: { flyerTemplate: templateId },
    });
    revalidatePath(`/admin/${slug}/qr`);
  }

  // Ideally this would use an environment variable for the domain
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const landingUrl = `${domain}/${barbershop.slug}`;
  
  // Generate QR as Data URI
  const qrDataUrl = await QRCode.toDataURL(landingUrl, {
    width: 600,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Material Promocional y QR</h2>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Tu Flyer con QR</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Descárgalo e imprímelo. El QR lleva a tus clientes a tu página para registrarse y sumar visitas.
          </p>

          <FlyerWithQR
            qrDataUrl={qrDataUrl}
            slug={barbershop.slug}
            initialTemplate={selectedTemplate.id}
            onSaveTemplate={saveFlyerTemplate}
            isPro={isPro}
          />

          <a href={qrDataUrl} download={`QR_${barbershop.slug}.png`} style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Descargar solo el QR
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
