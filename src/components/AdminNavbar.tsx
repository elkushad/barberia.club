"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
}

export default function AdminNavbar({ userName, role, shopLogo, shopName, shopSlug, navLinks }: AdminNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo a la izquierda */}
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center' }}>
          {shopLogo ? (
            <img src={shopLogo} alt={shopName || "Barberia Logo"} style={{ width: '40px', height: '40px', borderRadius: '0', objectFit: 'contain' }} />
          ) : (
            <Image src="/logo.png" alt="Barber.club Logo" width={120} height={35} style={{ objectFit: 'contain' }} />
          )}
        </Link>

        {/* Botón Hamburguesa (solo visible en móvil mediante CSS) */}
        <button 
          className={styles.hamburgerBtn} 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menú"
        >
          <div className={`${styles.hamburgerLine} ${isOpen ? styles.line1Open : ''}`}></div>
          <div className={`${styles.hamburgerLine} ${isOpen ? styles.line2Open : ''}`}></div>
          <div className={`${styles.hamburgerLine} ${isOpen ? styles.line3Open : ''}`}></div>
        </button>

        {/* Acciones y Links (Desktop: horizontal, Móvil: colapsable) */}
        <div className={`${styles.navActions} ${isOpen ? styles.navActionsOpen : ''}`}>
          
          {/* Submenu de la barbería */}
          {navLinks && navLinks.length > 0 && (
            <div className={styles.navMenuLinks}>
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={styles.navLinkItem}
                  onClick={() => setIsOpen(false)}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {link.label}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span style={{ 
                      marginLeft: '6px', 
                      backgroundColor: 'var(--accent-danger)', 
                      color: 'white', 
                      fontSize: '0.7rem', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      lineHeight: '1'
                    }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              {shopSlug && (
                <Link 
                  href={`/${shopSlug}`} 
                  target="_blank"
                  className={styles.navLinkItem}
                  style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
                  onClick={() => setIsOpen(false)}
                >
                  Ver Landing ↗
                </Link>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: isOpen ? '1rem' : '0', width: isOpen ? '100%' : 'auto', justifyContent: isOpen ? 'space-between' : 'flex-end', paddingTop: isOpen ? '1rem' : '0', borderTop: isOpen ? '1px solid var(--border-color)' : 'none' }}>
            {shopSlug && <NotificationBell slug={shopSlug} />}
            <span className={styles.userName}>{userName} ({role})</span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
