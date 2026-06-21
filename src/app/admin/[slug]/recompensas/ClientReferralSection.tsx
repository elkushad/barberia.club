"use client";

import { useState, useTransition } from "react";

type ReferralReward = {
  id: string;
  name: string;
  referralsRequired: number;
  isActive: boolean;
};

export default function ClientReferralSection({
  rewards,
  onCreate,
  onDelete,
  onToggleActive,
}: {
  rewards: ReferralReward[];
  onCreate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onToggleActive: (formData: FormData) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(rewards.length === 0);
  const [pending, startTransition] = useTransition();

  const submit = (action: (fd: FormData) => Promise<void>) => (fd: FormData) => {
    startTransition(() => action(fd));
  };

  return (
    <div style={{ marginTop: "3rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          <h3 style={{ marginBottom: "0.2rem" }}>Recompensas por referidos</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Tus clientes invitan amigos → cuando el amigo confirma su primera visita, el cliente
            suma +1 referido hacia su recompensa.
          </p>
        </div>
        {rewards.length > 0 && (
          <button
            className="premium-btn-secondary"
            onClick={() => setShowForm((v) => !v)}
            style={{ fontSize: "0.85rem" }}
          >
            {showForm ? "Cancelar" : "+ Nueva recompensa"}
          </button>
        )}
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <div className="premium-card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginBottom: "1rem", color: "var(--accent-primary)" }}>
            Nueva recompensa por referidos
          </h4>
          <form action={submit(onCreate)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.875rem" }}>
                Nombre de la recompensa
              </label>
              <input
                name="name"
                className="premium-input"
                placeholder="Corte gratis por referidos"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.875rem" }}>
                Referidos requeridos
              </label>
              <input
                name="referralsRequired"
                type="number"
                min="1"
                max="50"
                defaultValue="2"
                className="premium-input"
                required
              />
            </div>
            <button type="submit" className="premium-btn" disabled={pending}>
              {pending ? "Guardando…" : "Crear recompensa"}
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      {rewards.length === 0 && !showForm && (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            border: "1px dashed var(--border-color)",
            borderRadius: "12px",
            color: "var(--text-secondary)",
          }}
        >
          <p style={{ marginBottom: "1rem" }}>No tienes recompensas por referidos configuradas.</p>
          <button className="premium-btn" onClick={() => setShowForm(true)}>
            Crear primera recompensa
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {rewards.map((r) => (
          <div
            key={r.id}
            className="premium-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              flexWrap: "wrap",
              padding: "1.25rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <h4 style={{ fontSize: "1rem" }}>{r.name}</h4>
                {!r.isActive && (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(239,68,68,0.12)",
                      color: "var(--accent-danger)",
                      padding: "2px 8px",
                      borderRadius: "999px",
                    }}
                  >
                    INACTIVA
                  </span>
                )}
              </div>
              <p style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "0.875rem" }}>
                {r.referralsRequired} referido{r.referralsRequired !== 1 ? "s" : ""} requeridos
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <form action={submit(onToggleActive)}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="isActive" value={r.isActive ? "false" : "true"} />
                <button
                  type="submit"
                  className="premium-btn-secondary"
                  disabled={pending}
                  style={{ fontSize: "0.78rem", padding: "5px 10px" }}
                >
                  {r.isActive ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={submit(onDelete)}>
                <input type="hidden" name="id" value={r.id} />
                <button
                  type="submit"
                  className="premium-btn-secondary"
                  disabled={pending}
                  style={{ fontSize: "0.78rem", padding: "5px 10px", color: "var(--accent-danger)" }}
                >
                  Eliminar
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
