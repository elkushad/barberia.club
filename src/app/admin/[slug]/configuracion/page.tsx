import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertBarbershopAccessBySlug } from "@/lib/guards";
import Image from "next/image";
import ImageUploadPreview from "@/components/ImageUploadPreview";
import BannerUpload from "@/components/BannerUpload";

function isVideoUrl(u: string) {
  return /\.(mp4|webm|mov|m4v|ogg)$/i.test(u) || u.startsWith("data:video/");
}

export default async function ConfiguracionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug }
  });

  if (!barbershop) return null;

  const isPro = barbershop.plan === "PRO";

  // Parse existing banners as array
  let existingBanners: string[] = [];
  try {
    const parsed = JSON.parse(barbershop.banner || "[]");
    if (Array.isArray(parsed)) {
      existingBanners = parsed;
    } else if (barbershop.banner) {
      existingBanners = [barbershop.banner]; // legacy string
    }
  } catch {
    if (barbershop.banner) existingBanners = [barbershop.banner];
  }

  const existingVideos = existingBanners.filter(isVideoUrl).length;
  const existingImages = existingBanners.length - existingVideos;

  async function updateConfig(formData: FormData) {
    "use server";
    await assertBarbershopAccessBySlug(slug);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const brandColor = formData.get("brandColor") as string;
    const whatsapp = formData.get("whatsapp") as string;

    // Las imágenes/videos se suben en el cliente a Vercel Blob; aquí solo
    // llegan las URLs ya subidas (evita el límite de tamaño de las server actions).
    const newLogoUrl = formData.get("logo") as string | null;
    const newBannerUrls = (formData.getAll("banners") as string[]).filter(Boolean);

    const currentBarbershop = await prisma.barbershop.findUnique({ where: { slug } });
    if (!currentBarbershop) return;

    let currentBanners: string[] = [];
    try {
      const parsed = JSON.parse(currentBarbershop.banner || "[]");
      if (Array.isArray(parsed)) currentBanners = parsed;
      else if (currentBarbershop.banner) currentBanners = [currentBarbershop.banner];
    } catch {
      if (currentBarbershop.banner) currentBanners = [currentBarbershop.banner];
    }

    const logoUrl = newLogoUrl || currentBarbershop.logo;
    // Fondos del landing: solo plan Pro. Máximo 5 en total y máximo 2 videos.
    const isProShop = currentBarbershop.plan === "PRO";
    let newBanners = currentBanners;
    if (isProShop) {
      const capped: string[] = [];
      const seen = new Set<string>();
      let vids = 0;
      for (const u of [...currentBanners, ...newBannerUrls]) {
        if (seen.has(u)) continue; // dedup: reenviar la misma URL no la duplica
        if (capped.length >= 5) break;
        const vid = isVideoUrl(u);
        if (vid && vids >= 2) continue;
        seen.add(u);
        capped.push(u);
        if (vid) vids++;
      }
      newBanners = capped;
    }

    await prisma.barbershop.update({
      where: { id: currentBarbershop.id },
      data: { name, description, brandColor, whatsapp, logo: logoUrl, banner: JSON.stringify(newBanners) }
    });
    
    revalidatePath(`/admin/${slug}/configuracion`);
    revalidatePath(`/${slug}`);
  }

  async function deleteBanner(formData: FormData) {
    "use server";
    await assertBarbershopAccessBySlug(slug);
    const urlToDelete = formData.get("url") as string;
    
    const currentBarbershop = await prisma.barbershop.findUnique({ where: { slug } });
    if (!currentBarbershop) return;

    let currentBanners: string[] = [];
    try {
      const parsed = JSON.parse(currentBarbershop.banner || "[]");
      if (Array.isArray(parsed)) currentBanners = parsed;
      else if (currentBarbershop.banner) currentBanners = [currentBarbershop.banner];
    } catch {
      if (currentBarbershop.banner) currentBanners = [currentBarbershop.banner];
    }

    const filteredBanners = currentBanners.filter(url => url !== urlToDelete);
    
    await prisma.barbershop.update({
      where: { id: currentBarbershop.id },
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
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Logo actual:</p>
              <Image src={barbershop.logo} alt="Logo actual" width={100} height={100} style={{ borderRadius: '0', objectFit: 'contain' }} />
            </div>
          )}
          <ImageUploadPreview name="logo" accept="image/*" variant="logo" className="premium-input" style={{ padding: '8px' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Fondos del Landing</label>
          {isPro ? (
            <BannerUpload key={`${existingImages}-${existingVideos}`} name="banners" existingImages={existingImages} existingVideos={existingVideos} />
          ) : (
            <div style={{ padding: '1rem', borderRadius: '8px', border: '1px dashed var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Los fondos del landing están disponibles en el <strong style={{ color: 'var(--text-primary)' }}>plan Pro</strong>.{' '}
                <a href={`/admin/${slug}/mi-plan`} style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Mejora tu plan</a>.
              </p>
            </div>
          )}
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
