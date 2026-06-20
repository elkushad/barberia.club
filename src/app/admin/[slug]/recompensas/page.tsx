import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertBarbershopAccessBySlug, assertRewardAccess } from "@/lib/guards";
import Image from "next/image";
import ImageUploadPreview from "@/components/ImageUploadPreview";
import styles from "../../admin.module.css";
import { hasProAccess } from "@/lib/plans";
import ProLock from "@/components/ProLock";
import ClientReferralSection from "./ClientReferralSection";

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
    const shop = await assertBarbershopAccessBySlug(slug);
    const name = formData.get("name") as string;
    const visitsRequired = parseInt(formData.get("visitsRequired") as string);

    if (!name || !visitsRequired) return;

    // Defensa en servidor: Free solo puede tener 1 recompensa.
    const count = await prisma.reward.count({ where: { barbershopId: shop.id } });
    if (!hasProAccess(shop) && count >= 1) return;

    // La imagen se sube en el cliente a Vercel Blob; aquí llega la URL ya subida.
    const imageUrl = (formData.get("image") as string) || null;

    await prisma.reward.create({
      data: {
        barbershopId: shop.id,
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

  const referralRewards = await prisma.clientReferralReward.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  // ── Server actions para referral rewards ──────────────────────────────────
  async function createReferralReward(formData: FormData) {
    "use server";
    const shop = await assertBarbershopAccessBySlug(slug);
    const name = (formData.get("name") as string)?.trim();
    const rewardType = (formData.get("rewardType") as string) || "TEXT";
    const description = (formData.get("description") as string)?.trim() || null;
    const referralsRequired = parseInt(formData.get("referralsRequired") as string) || 2;
    const isPrimary = formData.get("isPrimary") === "true";
    if (!name) return;

    // Si va a ser principal, quitar el flag a los demás
    if (isPrimary) {
      await prisma.clientReferralReward.updateMany({
        where: { barbershopId: shop.id },
        data: { isPrimary: false },
      });
    }
    await prisma.clientReferralReward.create({
      data: { barbershopId: shop.id, name, rewardType, description, referralsRequired, isPrimary, updatedAt: new Date() },
    });
    revalidatePath(`/admin/${slug}/recompensas`);
  }

  async function deleteReferralReward(formData: FormData) {
    "use server";
    await assertBarbershopAccessBySlug(slug);
    const id = formData.get("id") as string;
    await prisma.clientReferralReward.delete({ where: { id } });
    revalidatePath(`/admin/${slug}/recompensas`);
  }

  async function setReferralRewardPrimary(formData: FormData) {
    "use server";
    const shop = await assertBarbershopAccessBySlug(slug);
    const id = formData.get("id") as string;
    await prisma.clientReferralReward.updateMany({ where: { barbershopId: shop.id }, data: { isPrimary: false } });
    await prisma.clientReferralReward.update({ where: { id }, data: { isPrimary: true } });
    revalidatePath(`/admin/${slug}/recompensas`);
  }

  async function toggleReferralRewardActive(formData: FormData) {
    "use server";
    await assertBarbershopAccessBySlug(slug);
    const id = formData.get("id") as string;
    const isActive = formData.get("isActive") === "true";
    await prisma.clientReferralReward.update({ where: { id }, data: { isActive } });
    revalidatePath(`/admin/${slug}/recompensas`);
  }

  const isFreePlan = !hasProAccess(barbershop);
  const limitReached = isFreePlan && rewards.length >= 1;

  const visibleRewards = isFreePlan ? rewards.slice(0, 1) : rewards;
  const lockedRewards  = isFreePlan ? rewards.slice(1)    : [];

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Sistema de Recompensas</h2>
      
      <div className={styles.recompensasGrid}>
        
        {/* Nueva Recompensa — en Free queda bloqueada tras la 1ra recompensa */}
        <div className="premium-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>
            Crear Nueva Recompensa {isFreePlan && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>(Free: 1 · PRO: hasta 10)</span>}
          </h3>

          <ProLock locked={limitReached} slug={slug} radius={12}>
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
          </ProLock>
        </div>

        {/* Lista de Recompensas */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Recompensas Activas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {visibleRewards.map(reward => (
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

            {lockedRewards.length > 0 && (
              <ProLock locked slug={slug} radius={12}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {lockedRewards.map(reward => (
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
                    </div>
                  ))}
                </div>
              </ProLock>
            )}

            {rewards.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                Aún no has configurado recompensas.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ── Sección: recompensas por referidos de clientes ── */}
      <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "2rem" }}>
        <ClientReferralSection
          rewards={referralRewards}
          onCreate={createReferralReward}
          onDelete={deleteReferralReward}
          onSetPrimary={setReferralRewardPrimary}
          onToggleActive={toggleReferralRewardActive}
        />
      </div>
    </div>
  );
}
