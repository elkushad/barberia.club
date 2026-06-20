import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { assertBarbershopAccessBySlug } from "@/lib/guards";
import { hasProAccess } from "@/lib/plans";
import ProLock from "@/components/ProLock";
import ServiceRow from "./ServiceRow";

const FREE_SERVICE_LIMIT = 1;

export default async function ServiciosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({ where: { slug } });
  if (!barbershop) return null;

  const isPro = hasProAccess(barbershop);

  const services = await prisma.service.findMany({
    where: { barbershopId: barbershop.id },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  // Free: 1 servicio. PRO: ilimitados.
  const atFreeLimit = !isPro && services.length >= FREE_SERVICE_LIMIT;

  const visibleServices = isPro ? services : services.slice(0, FREE_SERVICE_LIMIT);
  const lockedServices  = isPro ? []       : services.slice(FREE_SERVICE_LIMIT);

  async function createService(formData: FormData) {
    "use server";
    const shop = await assertBarbershopAccessBySlug(slug);
    const name = (formData.get("name") as string)?.trim();
    const price = parseFloat(formData.get("price") as string);
    if (!name || isNaN(price) || price < 0) return;

    const count = await prisma.service.count({ where: { barbershopId: shop.id } });
    // Defensa en servidor: Free no puede superar el límite de servicios.
    if (!hasProAccess(shop) && count >= FREE_SERVICE_LIMIT) return;
    await prisma.service.create({
      data: { name, price, barbershopId: shop.id, isPrimary: count === 0 }, // el 1ro es principal
    });
    revalidatePath(`/admin/${slug}/servicios`);
  }

  async function updateService(formData: FormData) {
    "use server";
    const shop = await assertBarbershopAccessBySlug(slug);
    const id = formData.get("id") as string;
    const name = (formData.get("name") as string)?.trim();
    const price = parseFloat(formData.get("price") as string);
    if (!id || !name || isNaN(price) || price < 0) return;
    await prisma.service.updateMany({
      where: { id, barbershopId: shop.id }, // updateMany para que el where incluya el ownership
      data: { name, price },
    });
    revalidatePath(`/admin/${slug}/servicios`);
  }

  async function setPrimary(formData: FormData) {
    "use server";
    const shop = await assertBarbershopAccessBySlug(slug);
    const id = formData.get("id") as string;
    if (!id) return;
    await prisma.$transaction([
      prisma.service.updateMany({ where: { barbershopId: shop.id }, data: { isPrimary: false } }),
      prisma.service.updateMany({ where: { id, barbershopId: shop.id }, data: { isPrimary: true } }),
    ]);
    revalidatePath(`/admin/${slug}/servicios`);
  }

  async function deleteService(formData: FormData) {
    "use server";
    const shop = await assertBarbershopAccessBySlug(slug);
    const id = formData.get("id") as string;
    if (!id) return;
    const target = await prisma.service.findFirst({ where: { id, barbershopId: shop.id } });
    if (!target) return;
    // Quitamos la referencia en visitas (conservando el precio histórico ya snapshot).
    await prisma.visit.updateMany({ where: { serviceId: id }, data: { serviceId: null } });
    await prisma.service.delete({ where: { id } });
    // Si borramos el principal, ascendemos a otro.
    if (target.isPrimary) {
      const next = await prisma.service.findFirst({ where: { barbershopId: shop.id }, orderBy: { createdAt: "asc" } });
      if (next) await prisma.service.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
    revalidatePath(`/admin/${slug}/servicios`);
  }

  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Link href={`/admin/${slug}`} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.875rem", padding: "4px 8px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          ← Volver
        </Link>
        <h2 style={{ margin: 0 }}>Servicios y precios</h2>
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Configura tus servicios y su precio. El servicio marcado como <strong>Principal</strong> se usará por defecto al registrar
        cada visita; luego puedes cambiarlo en el historial de <Link href={`/admin/${slug}/visitas`} style={{ color: "var(--accent-primary)" }}>Visitas</Link>.
        Las ganancias del dashboard se calculan con el precio de cada visita.
      </p>

      {/* Nuevo servicio — en Free queda bloqueado tras el 1er servicio */}
      <div style={{ marginBottom: "2rem" }}>
        <ProLock locked={atFreeLimit} slug={slug} radius={16}>
          <div className="premium-card">
            <h3 style={{ marginBottom: "1rem", color: "var(--accent-primary)" }}>
              Agregar servicio {!isPro && <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 400 }}>(Free: 1 · PRO: ilimitados)</span>}
            </h3>
            <form action={createService} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "2 1 180px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Nombre</label>
                <input name="name" required placeholder="Ej: Corte clásico" className="premium-input" style={{ width: "100%" }} />
              </div>
              <div style={{ flex: "1 1 100px" }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Precio (S/)</label>
                <input name="price" type="number" min="0" step="0.5" required placeholder="0.00" className="premium-input" style={{ width: "100%" }} />
              </div>
              <button type="submit" className="premium-btn" style={{ flex: "0 0 auto" }}>Agregar</button>
            </form>
          </div>
        </ProLock>
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {services.length === 0 && (
          <p style={{ color: "var(--text-secondary)" }}>Aún no tienes servicios. Agrega el primero arriba.</p>
        )}
        {visibleServices.map((s) => (
          <ServiceRow
            key={s.id}
            service={s}
            updateService={updateService}
            deleteService={deleteService}
            setPrimary={setPrimary}
          />
        ))}
        {lockedServices.length > 0 && (
          <ProLock locked slug={slug} radius={12}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {lockedServices.map((s) => (
                <ServiceRow
                  key={s.id}
                  service={s}
                  updateService={updateService}
                  deleteService={deleteService}
                  setPrimary={setPrimary}
                />
              ))}
            </div>
          </ProLock>
        )}
      </div>
    </div>
  );
}
