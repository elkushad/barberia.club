import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default function NuevaBarberiaPage() {

  async function createBarbershop(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const ownerName = formData.get("ownerName") as string;
    const ownerEmail = formData.get("ownerEmail") as string;
    const ownerPassword = formData.get("ownerPassword") as string; // Simple text for MVP
    
    if (!name || !slug || !ownerName || !ownerEmail || !ownerPassword) {
      return; // Could throw error to handle in UI
    }

    // Create owner user
    const owner = await prisma.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        password: ownerPassword,
        role: "OWNER",
      }
    });

    // Create barbershop
    await prisma.barbershop.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        ownerId: owner.id,
      }
    });

    redirect("/admin");
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Registrar Nueva Barbería</h2>
      
      <form action={createBarbershop} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Datos de la Barbería</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nombre de la Barbería</label>
              <input type="text" name="name" className="premium-input" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Slug (URL única, ej: mi-barberia)</label>
              <input type="text" name="slug" className="premium-input" required />
            </div>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '1rem 0' }} />

        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>Datos del Dueño</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nombre del Dueño</label>
              <input type="text" name="ownerName" className="premium-input" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email del Dueño</label>
              <input type="email" name="ownerEmail" className="premium-input" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Contraseña de Acceso</label>
              <input type="password" name="ownerPassword" className="premium-input" required />
            </div>
          </div>
        </div>

        <button type="submit" className="premium-btn" style={{ marginTop: '1rem' }}>
          Crear Barbería y Cuenta
        </button>
      </form>
    </div>
  );
}
