"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Users,
  Flame,
  CircleDollarSign,
  Network,
  Gift,
  Settings,
  Menu,
  X
} from "lucide-react";

export default function GodmodeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/godmode", icon: LayoutDashboard },
    { name: "Barberías", href: "/godmode/barberias", icon: Store },
    { name: "Clientes", href: "/godmode/clientes", icon: Users },
    { name: "Oportunidades", href: "/godmode/oportunidades", icon: Flame },
    { name: "Finanzas", href: "/godmode/finanzas", icon: CircleDollarSign },
    { name: "Revendedores", href: "/godmode/revendedores", icon: Network },
    { name: "Referidos", href: "/godmode/referidos", icon: Gift },
    { name: "Sistema", href: "/godmode/sistema", icon: Settings },
  ];

  // For simplicity, we manage mobile layout with inline styles using media queries via custom classes or js.
  // We'll use a wrapper with a left margin on desktop.

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-primary)' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40, display: 'block' }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '260px',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column'
        }}
        className={`godmode-sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              <span style={{ color: 'white' }}>barberia</span>
              <span style={{ color: 'var(--accent-primary)' }}>.club</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="hide-desktop" aria-label="Cerrar menú" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '0 1.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>God Mode</span>
        </div>

        <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/godmode");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  fontWeight: isActive ? 600 : 400
                }}
              >
                <item.icon size={20} color={isActive ? "var(--text-primary)" : "var(--text-secondary)"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>AD</span>
            </div>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Admin Master</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>god@barberia.club</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%'
        }}
        className="godmode-main"
      >
        {/* Mobile Header */}
        <header
          className="hide-desktop"
          style={{
            height: '64px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1rem',
            backgroundColor: 'var(--bg-secondary)',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
        >
          <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menú" style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}>
            <Menu size={24} />
          </button>
          <span style={{ marginLeft: '1rem', fontWeight: 'bold' }}>God Mode</span>
        </header>

        <main style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          .hide-desktop { display: none !important; }
          .godmode-sidebar { transform: translateX(0) !important; }
          .godmode-main { margin-left: 260px; }
        }
        @media (max-width: 767px) {
          .godmode-sidebar { transform: translateX(-100%); }
          .godmode-sidebar.open { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
