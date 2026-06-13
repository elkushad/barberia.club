import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function GodModePage() {
  const cookieStore = await cookies();
  const isGodMode = cookieStore.get("godmode")?.value === "activated";

  async function login(formData: FormData) {
    "use server";
    const pass = formData.get("password") as string;
    if (pass === "admin1234") {
      const cookieStore = await cookies();
      cookieStore.set("godmode", "activated", { httpOnly: true, secure: true });
    }
    revalidatePath("/godmode");
  }

  async function togglePlan(formData: FormData) {
    "use server";
    const isGodMode = (await cookies()).get("godmode")?.value === "activated";
    if (!isGodMode) return;

    const id = formData.get("id") as string;
    const currentPlan = formData.get("currentPlan") as string;
    const newPlan = currentPlan === "FREE" ? "PRO" : "FREE";

    await prisma.barbershop.update({
      where: { id },
      data: { plan: newPlan }
    });
    revalidatePath("/godmode");
  }

  if (!isGodMode) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: 'red', fontFamily: 'monospace' }}>
        <form action={login} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', border: '1px solid red' }}>
          <h2>ACCESO RESTRINGIDO</h2>
          <input type="password" name="password" placeholder="Contraseña..." style={{ padding: '0.5rem', backgroundColor: '#111', color: 'red', border: '1px solid red' }} />
          <button type="submit" style={{ padding: '0.5rem', backgroundColor: 'red', color: 'black', fontWeight: 'bold', cursor: 'pointer' }}>ENTRAR</button>
        </form>
      </div>
    );
  }

  const barbershops = await prisma.barbershop.findMany({
    include: {
      owner: true,
      _count: { select: { customers: true, rewards: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111', color: 'white', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'red', fontFamily: 'monospace' }}>GOD MODE</h1>
          <Link href="/" style={{ color: 'white', textDecoration: 'underline' }}>Volver al sitio</Link>
        </div>

        <div style={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#222', color: '#999' }}>
                <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Barbería</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Dueño</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Clientes</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Recompensas</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Plan Actual</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {barbershops.map(shop => (
                <tr key={shop.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
                    <strong>{shop.name}</strong><br/>
                    <span style={{ color: '#666', fontSize: '0.8rem' }}>/{shop.slug}</span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
                    {shop.owner.name}<br/>
                    <span style={{ color: '#666', fontSize: '0.8rem' }}>{shop.owner.email}</span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #333' }}>{shop._count.customers}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #333' }}>{shop._count.rewards}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: shop.plan === "PRO" ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.1)',
                      color: shop.plan === "PRO" ? '#e63946' : '#999',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>
                      {shop.plan}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
                    <form action={togglePlan}>
                      <input type="hidden" name="id" value={shop.id} />
                      <input type="hidden" name="currentPlan" value={shop.plan} />
                      <button type="submit" style={{ 
                        padding: '6px 12px', 
                        backgroundColor: shop.plan === "PRO" ? '#333' : '#e63946', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                      }}>
                        {shop.plan === "PRO" ? 'Bajar a FREE' : 'Subir a PRO'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {barbershops.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No hay barberías registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
