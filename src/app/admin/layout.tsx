import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import styles from "./admin.module.css";
import AdminNavbar from "@/components/AdminNavbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string })?.role;
  const userId = (session.user as { id?: string })?.id;
  
  let barbershopLogo = "";
  let barbershopName = "";
  let barbershopSlug = "";
  let navLinks: { label: string; href: string; badge?: number }[] = [];

  if (role === "OWNER") {
    const barbershop = await prisma.barbershop.findFirst({
      where: { ownerId: userId },
      select: { logo: true, name: true, slug: true, id: true }
    });
    if (barbershop) {
      if (barbershop.logo) barbershopLogo = barbershop.logo;
      barbershopName = barbershop.name;
      barbershopSlug = barbershop.slug;
      
      const pendingVisitsCount = await prisma.visit.count({
        where: { 
          customer: { barbershopId: barbershop.id },
          status: "PENDING" 
        }
      });

      navLinks = [
        { label: "Dashboard", href: `/admin/${barbershop.slug}` },
        { label: "Clientes", href: `/admin/${barbershop.slug}/clientes` },
        { label: "Visitas", href: `/admin/${barbershop.slug}/visitas`, badge: pendingVisitsCount },
        { label: "Recompensas", href: `/admin/${barbershop.slug}/recompensas` },
        { label: "Configuración", href: `/admin/${barbershop.slug}/configuracion` },
        { label: "QR / Promoción", href: `/admin/${barbershop.slug}/qr` },
      ];
    }
  }

  return (
    <div className={styles.adminLayout}>
      <AdminNavbar 
        userName={session.user?.name || ""} 
        role={role || ""} 
        shopLogo={barbershopLogo}
        shopName={barbershopName}
        shopSlug={barbershopSlug}
        navLinks={navLinks}
      />
      <main className={styles.mainContent}>
        {children}
      </main>
      <footer style={{ textAlign: 'center', padding: '0.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <span>Powered by</span>
        <Image src="/logo.png" alt="Barber.club Logo" width={90} height={28} style={{ objectFit: 'contain' }} />
      </footer>
    </div>
  );
}
