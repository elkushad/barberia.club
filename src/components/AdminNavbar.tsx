"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "@/app/admin/admin.module.css";
import LogoutButton from "@/app/admin/LogoutButton";
import NotificationBell from "@/components/NotificationBell";

interface AdminNavbarProps {
  userName: string;
  role: string;
  shopLogo?: string;
  shopName?: string;
  shopSlug?: string;
  navLinks?: { label: string; href: string; badge?: number }[];
  children: React.ReactNode;
}

/* ── Icons ────────────────────────────────────────────────────────────── */
function Ic({ children }: { children: React.ReactNode }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const NAV_ICONS: Record<string, React.ReactNode> = {
  Dashboard: <Ic><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ic>,
  Oportunidades: <Ic><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></Ic>,
  Clientes:  <Ic><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ic>,
  Visitas:   <Ic><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Ic>,
  Citas:     <Ic><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ic>,
  Servicios: <Ic><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></Ic>,
  Recompensas: <Ic><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></Ic>,
  "Configuración": <Ic><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ic>,
  "QR / Promoción": <Ic><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="5" y="5" width="3" height="3" fill="currentColor"/><rect x="16" y="5" width="3" height="3" fill="currentColor"/><rect x="5" y="16" width="3" height="3" fill="currentColor"/><polyline points="14 14 14 20 20 20 20 14"/><line x1="14" y1="17" x2="17" y2="17"/></Ic>,
  Referidos: <Ic><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></Ic>,
  "Mi Plan": <Ic><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Ic>,
};

/* ── Helpers ──────────────────────────────────────────────────────────── */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getPageTitle(pathname: string): string {
  const seg = pathname.split("/").pop() || "";
  const map: Record<string, string> = {
    oportunidades: "Oportunidades",
    clientes: "Clientes",
    visitas: "Visitas",
    citas: "Citas",
    servicios: "Servicios",
    recompensas: "Recompensas",
    configuracion: "Configuración",
    qr: "QR / Promoción",
    referidos: "Referidos",
    "mi-plan": "Mi Plan",
  };
  return map[seg] || "Dashboard";
}

function isLinkActive(pathname: string, href: string, shopSlug?: string): boolean {
  if (href === `/admin/${shopSlug}`) return pathname === href;
  return pathname.startsWith(href);
}

/* ── Component ────────────────────────────────────────────────────────── */
export default function AdminNavbar({ userName, shopLogo, shopName, shopSlug, navLinks, children }: AdminNavbarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const initials = getInitials(shopName || userName || "BC");
  const pageTitle = getPageTitle(pathname);

  function closeSidebar() { setSidebarOpen(false); }

  return (
    <div className={styles.outerLayout}>

      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div className={styles.mobileBackdrop} onClick={closeSidebar} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarMobileOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", textDecoration: "none" }} onClick={closeSidebar}>
            {shopLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shopLogo} alt={shopName || "Logo"} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <Image src="/logo.png" alt="barberia.club" width={110} height={32} style={{ objectFit: "contain" }} />
            )}
          </Link>
          <button className={styles.sidebarCloseBtn} onClick={closeSidebar} aria-label="Cerrar menú">✕</button>
        </div>

        <nav className={styles.sidebarNav}>
          {navLinks?.map((link) => {
            const active = isLinkActive(pathname, link.href, shopSlug);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.sidebarLink} ${active ? styles.sidebarLinkActive : ""}`}
                onClick={closeSidebar}
              >
                <span className={styles.sidebarIcon}>{NAV_ICONS[link.label]}</span>
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className={styles.sidebarBadge}>{link.badge > 99 ? "99+" : link.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {shopSlug && (
          <div className={styles.sidebarFooter}>
            <Link href={`/${shopSlug}`} target="_blank" className={styles.sidebarLandingLink} onClick={closeSidebar}>
              Ver Landing
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </Link>
            <div className={styles.sidebarLogout}>
              <LogoutButton />
            </div>
          </div>
        )}
      </aside>

      {/* ── Right: top bar + content ── */}
      <div className={styles.mainWrapper}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.hamburgerBtn} onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
              <span /><span /><span />
            </button>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
          </div>

          <div className={styles.topBarRight}>
            {shopSlug && <NotificationBell slug={shopSlug} />}
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{initials}</div>
              <span className={styles.shopName}>{shopName || userName}</span>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          {children}
        </main>

        <footer className={styles.adminFooter}>
          <span>Powered by</span>
          <Image src="/logo.png" alt="barberia.club" width={88} height={26} style={{ objectFit: "contain" }} />
        </footer>
      </div>
    </div>
  );
}
