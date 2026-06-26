"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";

// Zona de peligro: eliminación self-service de la cuenta del dueño.
// Llama a la server action (borrado en cascada) y, si tiene éxito, cierra la
// sesión y vuelve al inicio. Requiere escribir ELIMINAR para confirmar.
export default function DeleteAccountSection({
  deleteAccount,
}: {
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError("");
    startTransition(async () => {
      const res = await deleteAccount();
      if (res.ok) {
        await signOut({ callbackUrl: "/?cuenta_eliminada=1" });
      } else {
        setError(res.error || "No se pudo eliminar la cuenta. Intenta de nuevo.");
      }
    });
  }

  return (
    <div
      style={{
        marginTop: "2.5rem",
        border: "1px solid rgba(239,68,68,0.35)",
        borderRadius: "12px",
        padding: "1.25rem",
        background: "rgba(239,68,68,0.04)",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1rem", color: "#ef4444" }}>Eliminar cuenta</h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 1rem" }}>
        Elimina tu cuenta y todos los datos de tu barbería (clientes, visitas, citas, recompensas y
        referidos). Esta acción es permanente. Si tienes una suscripción PRO activa, cancélala primero
        en PayPal o Mercado Pago.
      </p>

      <button
        type="button"
        onClick={() => { setOpen(true); setConfirmText(""); setError(""); }}
        style={{
          background: "transparent", border: "1px solid #ef4444", color: "#ef4444",
          padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
        }}
      >
        Eliminar mi cuenta
      </button>

      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.75rem" }}>
        ¿Prefieres que lo hagamos por ti?{" "}
        <a href="/eliminar-cuenta" style={{ color: "var(--text-secondary)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
          Solicítalo por correo o WhatsApp
        </a>.
      </p>

      {open && (
        <div
          onClick={() => !pending && setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 260, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
        >
          <div onClick={(e) => e.stopPropagation()} className="premium-card" style={{ width: "100%", maxWidth: "420px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 0.75rem", color: "#ef4444" }}>¿Eliminar tu cuenta?</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Se eliminarán de forma permanente tu barbería y todos sus datos. Esta acción no se puede deshacer.
              Escribe <strong style={{ color: "var(--text-primary)" }}>ELIMINAR</strong> para confirmar.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="premium-input"
              autoFocus
              style={{ marginBottom: "1rem" }}
            />
            {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending || confirmText.trim().toUpperCase() !== "ELIMINAR"}
                style={{
                  flex: 1, padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 700,
                  background: confirmText.trim().toUpperCase() === "ELIMINAR" ? "#ef4444" : "rgba(239,68,68,0.3)",
                  color: "white", opacity: pending ? 0.7 : 1,
                }}
              >
                {pending ? "Eliminando..." : "Eliminar definitivamente"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="premium-btn-secondary"
                style={{ flex: 1, padding: "12px" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
