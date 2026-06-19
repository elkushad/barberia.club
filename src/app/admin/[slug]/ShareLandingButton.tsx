"use client";

import { useEffect, useState } from "react";

const RED = "#E63946";

const btnBase: React.CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  outline: "none",
  color: "var(--text-primary)",
};

export default function ShareLandingButton({ slug, shopName }: { slug: string; shopName: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.barberia.club";
    setUrl(`${origin}/${slug}`);
  }, [slug]);

  const text = `Únete al club de ${shopName} 💈 y gana cortes gratis:`;
  const enc = (s: string) => encodeURIComponent(s);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  function shareTo(target: "whatsapp" | "facebook" | "instagram" | "tiktok" | "message") {
    if (target === "whatsapp") {
      window.open(`https://wa.me/?text=${enc(`${text} ${url}`)}`, "_blank");
    } else if (target === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, "_blank");
    } else if (target === "message") {
      window.location.href = `sms:?&body=${enc(`${text} ${url}`)}`;
    } else {
      // Instagram / TikTok no tienen enlace de compartir web → copiamos el link.
      copy();
    }
  }

  const items: { key: Parameters<typeof shareTo>[0]; label: string; color: string; icon: React.ReactNode }[] = [
    {
      key: "instagram", label: "Instagram", color: "#E1306C",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>,
    },
    {
      key: "facebook", label: "Facebook", color: "#1877F2",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>,
    },
    {
      key: "tiktok", label: "TikTok", color: "#ffffff",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>,
    },
    {
      key: "message", label: "Mensaje", color: "#34C759",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    },
    {
      key: "whatsapp", label: "WhatsApp", color: "#25D366",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" /></svg>,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "0.9rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          color: "var(--text-primary)",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          width: "100%",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
      >
        <span aria-hidden style={{ color: "var(--text-secondary)" }}>🔗</span>
        Compartir Landing
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "1rem" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "18px", padding: "1.5rem", width: "100%", maxWidth: "380px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Compartir tu landing</h3>
              <button type="button" onClick={() => setOpen(false)} style={{ ...btnBase, color: "var(--text-secondary)", fontSize: "1.2rem", lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {items.map((it) => (
                <button key={it.key} type="button" onClick={() => shareTo(it.key)} style={{ ...btnBase, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", flex: 1 }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", color: it.color }}>
                    {it.icon}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>{it.label}</span>
                </button>
              ))}
            </div>

            {/* Barra Copiar link */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "4px 4px 4px 12px", backgroundColor: "rgba(255,255,255,0.04)" }}>
              <span style={{ flex: 1, fontSize: "0.8rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
              <button type="button" onClick={copy} className="premium-btn" style={{ padding: "8px 16px", fontSize: "0.8rem", whiteSpace: "nowrap", backgroundColor: copied ? "var(--accent-success)" : RED, border: "none", borderRadius: "8px", color: "white", cursor: "pointer", WebkitTapHighlightColor: "transparent", outline: "none" }}>
                {copied ? "¡Copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
