import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import Image from "next/image";

export default async function ConfiguracionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug }
  });

  if (!barbershop) return null;

  // Parse existing banners as array
  let existingBanners: string[] = [];
  try {
    const parsed = JSON.parse(barbershop.banner || "[]");
    if (Array.isArray(parsed)) {
      existingBanners = parsed;
    } else if (barbershop.banner) {
      existingBanners = [barbershop.banner]; // legacy string
    }
  } catch(e) {
    if (barbershop.banner) existingBanners = [barbershop.banner];
  }

  async function updateConfig(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const brandColor = formData.get("brandColor") as string;
    const whatsapp = formData.get("whatsapp") as string;
    
    const logoFile = formData.get("logo") as File | null;
    const bannerFiles = formData.getAll("banners") as File[];

    let logoUrl = barbershop!.logo;
    let newBanners = [...existingBanners];

    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = logoFile.type || "image/png";
      logoUrl = `data:${mimeType};base64,${base64}`;
    }

    for (let i = 0; i < bannerFiles.length; i++) {
      const file = bannerFiles[i];
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mimeType = file.type || "image/jpeg";
        newBanners.push(`data:${mimeType};base64,${base64}`);
      }
    }

    await prisma.barbershop.update({
      where: { id: barbershop!.id },
      data: { name, description, brandColor, whatsapp, logo: logoUrl, banner: JSON.stringify(newBanners) }
    });
    
    revalidatePath(`/admin/${slug}/configuracion`);
    revalidatePath(`/${slug}`);
  }

  async function deleteBanner(formData: FormData) {
    "use server";
    const urlToDelete = formData.get("url") as string;
    const filteredBanners = existingBanners.filter(url => url !== urlToDelete);
    
    await prisma.barbershop.update({
      where: { id: barbershop!.id },
      data: { banner: JSON.stringify(filteredBanners) }
    });
    
    revalidatePath(`/admin/${slug}/configuracion`);
    revalidatePath(`/${slug}`);
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Configuración de la Barbería</h2>
      
      <form action={updateConfig} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nombre Público</label>
          <input type="text" name="name" defaultValue={barbershop.name} className="premium-input" required />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Número de WhatsApp (con código de país)</label>
          <input type="tel" name="whatsapp" defaultValue={barbershop.whatsapp || ""} className="premium-input" placeholder="ej: +34 600 000 000" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Logo de la Barbería</label>
          {barbershop.logo && (
            <div style={{ marginBottom: '1rem' }}>
              <Image src={barbershop.logo} alt="Logo actual" width={100} height={100} style={{ borderRadius: '0', objectFit: 'contain' }} />
            </div>
          )}
          <input type="file" name="logo" accept="image/*" className="premium-input" style={{ padding: '8px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Añadir Fondos (Imágenes/Videos)</label>
          <input type="file" name="banners" accept="image/*,video/*" multiple className="premium-input" style={{ padding: '8px' }} />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Puedes subir varios archivos. Estos se mostrarán en un carrusel dinámico en tu página pública.
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Descripción (Para la Landing Page)</label>
          <textarea 
            name="description" 
            defaultValue={barbershop.description || ""} 
            className="premium-input" 
            rows={4}
            placeholder="¡Bienvenido a la mejor barbería de la ciudad! Regístrate para ganar cortes gratis..."
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Color de Marca (Acento)</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="color" 
              name="brandColor" 
              defaultValue={barbershop.brandColor || "#eab308"} 
              style={{ width: '50px', height: '50px', cursor: 'pointer', border: 'none', background: 'none' }} 
            />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Este color se usará en los botones de tu Landing Page
            </span>
          </div>
        </div>

        <button type="submit" className="premium-btn" style={{ marginTop: '1rem' }}>
          Guardar Cambios
        </button>
      </form>

      {/* Gallery of existing banners */}
      <div className="premium-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Fondos Actuales ({existingBanners.length})</h3>
        {existingBanners.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Aún no has subido fondos.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {existingBanners.map((url, idx) => {
              const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.startsWith('data:video/');
              return (
                <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', height: '100px' }}>
                  {isVideo ? (
                    <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  ) : (
                    <Image src={url} alt={`Fondo ${idx}`} fill style={{ objectFit: 'cover' }} />
                  )}
                  <form action={deleteBanner} style={{ position: 'absolute', top: '4px', right: '4px' }}>
                    <input type="hidden" name="url" value={url} />
                    <button type="submit" style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>
                      X
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
