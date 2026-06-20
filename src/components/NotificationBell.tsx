"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

interface NotifItem {
  id: string;
  type: "customer" | "visit" | "appointment";
  title: string;
  subtitle: string;
  createdAt: string;
  href: string;
}

const ICONS: Record<NotifItem["type"], string> = {
  customer: "👤",
  visit: "✂️",
  appointment: "📅",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export default function NotificationBell({ slug }: { slug?: string }) {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const storageKey = `notifLastSeen:${slug || "default"}`;

  useEffect(() => {
    const stored = Number(localStorage.getItem(storageKey) || 0);
    setLastSeen(stored);
  }, [storageKey]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  // Cerrar al hacer clic fuera.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((i) => new Date(i.createdAt).getTime() > lastSeen).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      // Al abrir, marcamos todo como visto.
      const now = Date.now();
      localStorage.setItem(storageKey, String(now));
      setLastSeen(now);
    }
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <style>{`
        @media (max-width: 768px) {
          .notif-panel {
            position: fixed !important;
            top: 56px !important;
            right: 1rem !important;
            left: auto !important;
          }
        }
      `}</style>
      <button
        onClick={toggle}
        aria-label="Notificaciones"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-primary)",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-4px",
              backgroundColor: "var(--accent-danger)",
              color: "white",
              fontSize: "0.65rem",
              fontWeight: "bold",
              minWidth: "16px",
              height: "16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notif-panel"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: "300px",
            maxWidth: "85vw",
            maxHeight: "400px",
            overflowY: "auto",
            background: "var(--bg-primary, #121212)",
            border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            zIndex: 200,
          }}
        >
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.1))", fontWeight: "bold", fontSize: "0.9rem" }}>
            Notificaciones
          </div>
          {items.length === 0 ? (
            <div style={{ padding: "1.25rem 1rem", color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center" }}>
              Sin actividad reciente
            </div>
          ) : (
            items.map((i) => (
              <Link
                key={i.id}
                href={i.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  gap: "0.6rem",
                  padding: "0.7rem 1rem",
                  borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.06))",
                  textDecoration: "none",
                  color: "var(--text-primary)",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{ICONS[i.type]}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "0.85rem", fontWeight: 600 }}>{i.title}</span>
                  <span style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {i.subtitle}
                  </span>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {timeAgo(i.createdAt)}
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
