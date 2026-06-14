import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertBarbershopAccessBySlug, assertRewardAccess } from "@/lib/guards";
import Link from "next/link";
import Image from "next/image";
import ImageUploadPreview from "@/components/ImageUploadPreview";
import styles from "../../admin.module.css";

export default async function RecompensasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug }
  });

  if (!barbershop) return null;

  const rewards = await prisma.reward.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: { visitsRequired: 'asc' }
  });

  async function createReward(formData: FormData) {
    "use server";
    await assertBarbershopAccessBySlug(slug);
    const name = formData.get("name") as string;
    const visitsRequired = parseInt(formData.get("visitsRequired") as string);

    if (!name || !visitsRequired) return;

    // La imagen se sube en el cliente a Vercel Blob; aquí llega la URL ya subida.
    const imageUrl = (formData.get("image") as string) || null;

    const currentBarbershop = await prisma.barbershop.findUnique({ where: { slug }, select: { id: true } });
    if (!currentBarbershop) return;

    await prisma.reward.create({
      data: {
        barbershopId: currentBarbershop.id,
        name,
        visitsRequired,
        image: imageUrl
      }
    });
    revalidatePath(`/admin/${slug}/recompensas`);
  }

  async function deleteReward(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await assertRewardAccess(id);
    await prisma.reward.delete({ where: { id } });
    revalidatePath(`/admin/${slug}/recompensas`);
  }

  const isFreePlan = barbershop.plan === "FREE";
  const limitReached = isFreePlan && rewards.length >= 1;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Sistema de Recompensas</h2>
      
      <div className={styles.recompensasGrid}>
        
        {/* Nueva Recompensa */}
        <div className="premium-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Crear Nueva Recompensa</h3>
          
          {limitReached ? (
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(230,57,70,0.1)', border: '1px solid var(--saas-red)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: 'white', marginBottom: '1rem' }}>Has alcanzado el límite de 1 recompensa en el plan Gratis.</p>
              <Link href="/planes" className="saas-btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'inline-block', animation: 'none' }}>
                Actualizar al plan PRO
              </Link>
            </div>
          ) : (
            <form action={createReward} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nombre de Recompensa (ej: Corte Gratis)</label>
                <input type="text" name="name" className="premium-input" required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Imagen del Producto</label>
                <ImageUploadPreview name="image" accept="image/*" className="premium-input" style={{ padding: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Visitas Requeridas</label>
                <input type="number" name="visitsRequired" min="1" className="premium-input" required />
              </div>
              <button type="submit" className="premium-btn" style={{ marginTop: '0.5rem' }}>Guardar Recompensa</button>
            </form>
          )}
        </div>

        {/* Lista de Recompensas */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Recompensas Activas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rewards.map(reward => (
              <div key={reward.id} className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {reward.image ? (
                    <Image src={reward.image} alt={reward.name} width={60} height={60} style={{ borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>🎁</span>
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{reward.name}</h4>
                    <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{reward.visitsRequired} visitas requeridas</p>
                  </div>
                </div>
                <form action={deleteReward}>
                  <input type="hidden" name="id" value={reward.id} />
                  <button type="submit" className="premium-btn-secondary" style={{ color: 'var(--accent-danger)' }}>Eliminar</button>
                </form>
              </div>
            ))}
            {rewards.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                Aún no has configurado recompensas.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
