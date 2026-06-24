"use client";

import { useMemo, useState, useTransition } from "react";

export type SlimCustomer = {
  id: string;
  name: string;
  phone: string;
  uniqueCode: string | null;
  totalVisits: number;
};

type AddResult =
  | { ok: true; name: string; link: string; welcomeWaLink: string }
  | { ok: false; error: string };

type VisitResult =
  | { ok: true; name: string; totalVisits: number; message: string; waLink: string }
  | { ok: false; error: string };

export default function ClientActions({
  customers,
  isPro,
  freeLimit,
  addCustomerAction,
  registerVisitAction,
}: {
  customers: SlimCustomer[];
  isPro: boolean;
  freeLimit: number;
  addCustomerAction: (name: string, phone: string) => Promise<AddResult>;
  registerVisitAction: (customerId: string) => Promise<VisitResult>;
}) {
  const [view, setView] = useState<null | "visit" | "add">(null);
  const [toast, setToast] = useState<{ text: string; waLink?: string } | null>(null);

  function showToast(text: string, waLink?: string) {
    setToast({ text, waLink });
    window.clearTimeout((showToast as unknown as { _t?: number })._t);
    (showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(null), 8000);
  }

  const atFreeLimit = !isPro && customers.length >= freeLimit;

  return (
    <>
      {/* ── Acciones principales ── */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <button
          type="button"
          onClick={() => setView("visit")}
          className="premium-btn"
          style={{ flex: "1 1 220px", padding: "20px", fontSize: "1.05rem", gap: "0.6rem", background: "var(--accent-primary)", color: "var(--text-inverse)", borderColor: "transparent" }}
        >
          ✂️ Registrar visita
        </button>
        <button
          type="button"
          onClick={() => setView("add")}
          className="premium-btn-secondary"
          style={{ flex: "1 1 220px", padding: "20px", fontSize: "1.05rem", gap: "0.6rem" }}
        >
          ➕ Agregar cliente
        </button>
      </div>

      {view === "visit" && (
        <RegisterVisitModal
          customers={customers}
          onClose={() => setView(null)}
          registerVisitAction={registerVisitAction}
          onRegistered={(r) => {
            setView(null);
            showToast(`✅ Visita registrada · ${r.name}`, r.waLink);
          }}
        />
      )}

      {view === "add" && (
        <AddCustomerModal
          atFreeLimit={atFreeLimit}
          freeLimit={freeLimit}
          onClose={() => setView(null)}
          addCustomerAction={addCustomerAction}
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)",
            zIndex: 300, background: "rgba(15,15,15,0.97)", border: "1px solid var(--accent-success)",
            borderRadius: "12px", padding: "0.9rem 1.1rem", display: "flex", alignItems: "center",
            gap: "0.9rem", maxWidth: "min(92vw, 460px)", boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
          }}
        >
          <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{toast.text}</span>
          {toast.waLink && (
            <a
              href={toast.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn-secondary"
              style={{ padding: "8px 14px", fontSize: "0.8rem", borderRadius: "8px", whiteSpace: "nowrap" }}
            >
              Enviar WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

// ── Marco de modal compartido ───────────────────────────────────────────────
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 250, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", overflowY: "auto" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="premium-card"
        style={{ width: "100%", maxWidth: "480px", marginTop: "6vh", padding: "1.5rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1 }} aria-label="Cerrar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Registrar visita ────────────────────────────────────────────────────────
function RegisterVisitModal({
  customers,
  onClose,
  registerVisitAction,
  onRegistered,
}: {
  customers: SlimCustomer[];
  onClose: () => void;
  registerVisitAction: (customerId: string) => Promise<VisitResult>;
  onRegistered: (r: { name: string; waLink: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<SlimCustomer | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")));
  }, [query, customers]);

  function doRegister(customer: SlimCustomer) {
    setError("");
    startTransition(async () => {
      const res = await registerVisitAction(customer.id);
      if (res.ok) {
        onRegistered({ name: res.name, waLink: res.waLink });
      } else {
        setError(res.error);
        setConfirm(null);
      }
    });
  }

  return (
    <ModalShell title="Registrar visita" onClose={onClose}>
      <input
        type="text"
        autoFocus
        placeholder="Buscar cliente..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="premium-input"
        style={{ marginBottom: "1rem" }}
      />

      {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "55vh", overflowY: "auto" }}>
        {filtered.length === 0 && (
          <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1.5rem 0" }}>
            {customers.length === 0 ? "Aún no tienes clientes. Agrega uno primero." : "Sin resultados."}
          </p>
        )}
        {filtered.map((c) => (
          <div
            key={c.id}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.75rem 0.9rem", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>{c.phone}</p>
            </div>
            <button
              type="button"
              onClick={() => setConfirm(c)}
              disabled={pending}
              className="premium-btn"
              style={{ padding: "10px 18px", fontSize: "1rem", flexShrink: 0 }}
            >
              +1
            </button>
          </div>
        ))}
      </div>

      {/* Confirmación */}
      {confirm && (
        <div
          onClick={() => !pending && setConfirm(null)}
          style={{ position: "fixed", inset: 0, zIndex: 260, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
        >
          <div onClick={(e) => e.stopPropagation()} className="premium-card" style={{ width: "100%", maxWidth: "360px", padding: "1.5rem", textAlign: "center" }}>
            <p style={{ marginBottom: "0.5rem" }}>¿Registrar una visita para este cliente?</p>
            <p style={{ fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>{confirm.name}</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>{confirm.phone}</p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button type="button" onClick={() => doRegister(confirm)} disabled={pending} className="premium-btn" style={{ padding: "10px 24px" }}>
                {pending ? "..." : "Sí"}
              </button>
              <button type="button" onClick={() => setConfirm(null)} disabled={pending} className="premium-btn-secondary" style={{ padding: "10px 24px" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ── Agregar cliente ───────────────────────────────────────────────────────--
function AddCustomerModal({
  atFreeLimit,
  freeLimit,
  onClose,
  addCustomerAction,
}: {
  atFreeLimit: boolean;
  freeLimit: number;
  onClose: () => void;
  addCustomerAction: (name: string, phone: string) => Promise<AddResult>;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<{ name: string; link: string; welcomeWaLink: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Completa nombre y teléfono.");
      return;
    }
    startTransition(async () => {
      const res = await addCustomerAction(name, phone);
      if (res.ok) {
        setSuccess({ name: res.name, link: res.link, welcomeWaLink: res.welcomeWaLink });
      } else {
        setError(res.error);
      }
    });
  }

  async function copyLink() {
    if (!success) return;
    try {
      await navigator.clipboard.writeText(success.link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar. Copia el enlace manualmente: " + success.link);
    }
  }

  if (success) {
    return (
      <ModalShell title="Cliente agregado" onClose={onClose}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.05rem", color: "var(--accent-success)", marginBottom: "0.5rem" }}>✅ Cliente agregado correctamente</p>
          <p style={{ fontWeight: 700, marginBottom: "1.25rem" }}>{success.name}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <button type="button" onClick={copyLink} className="premium-btn" style={{ padding: "12px" }}>
              {copied ? "Enlace copiado ✓" : "Copiar enlace"}
            </button>
            <a href={success.welcomeWaLink} target="_blank" rel="noopener noreferrer" className="premium-btn-secondary" style={{ padding: "12px" }}>
              Enviar bienvenida por WhatsApp
            </a>
            <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", marginTop: "0.25rem", fontSize: "0.85rem" }}>
              Cerrar
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title="Agregar cliente" onClose={onClose}>
      {atFreeLimit ? (
        <p style={{ color: "var(--text-secondary)" }}>
          Alcanzaste el límite del plan Free ({freeLimit} clientes). Actualiza a PRO para agregar clientes ilimitados.
        </p>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Nombre completo</label>
            <input type="text" autoFocus value={name} onChange={(e) => setName(e.target.value)} className="premium-input" maxLength={80} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>Teléfono (WhatsApp)</label>
            <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="premium-input" maxLength={30} />
          </div>
          {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
          <button type="submit" disabled={pending} className="premium-btn" style={{ padding: "14px" }}>
            {pending ? "Guardando..." : "Guardar cliente"}
          </button>
        </form>
      )}
    </ModalShell>
  );
}
