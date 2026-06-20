"use client";

import { useState, useTransition } from "react";

type ReferralReward = {
  id: string;
  name: string;
  rewardType: string;
  description: string | null;
  referralsRequired: number;
  isActive: boolean;
  isPrimary: boolean;
};

const REWARD_TYPES = [
  { value: "CORTE_GRATIS", label: "Corte gratis" },
  { value: "DESCUENTO", label: "Descuento" },
  { value: "PRODUCTO", label: "Producto" },
  { value: "TEXT", label: "Texto libre" },
];

export default function ClientReferralSection({
  rewards,
  onCreate,
  onDelete,
  onSetPrimary,
  onToggleActive,
}: {
  rewards: ReferralReward[];
  onCreate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onSetPrimary: (formData: FormData) => Promise<void>;
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.875rem" }}>
                  Tipo de recompensa
                </label>
                <select name="rewardType" className="premium-input" defaultValue="CORTE_GRATIS">
                  {REWARD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
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
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.875rem" }}>
                Descripción (opcional)
              </label>
              <input
                name="description"
                className="premium-input"
                placeholder="Ej: Un corte gratis en cualquier servicio"
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
              <input type="checkbox" name="isPrimary" value="true" defaultChecked={rewards.length === 0} />
              Marcar como principal (destacada en la landing del cliente)
            </label>
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
              border: r.isPrimary ? "1px solid var(--accent-primary)" : undefined,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <h4 style={{ fontSize: "1rem" }}>{r.name}</h4>
                {r.isPrimary && (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(124,58,237,0.15)",
                      color: "var(--accent-primary)",
                      padding: "2px 8px",
                      borderRadius: "999px",
                    }}
                  >
                    PRINCIPAL
                  </span>
                )}
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
                {r.referralsRequired} referido{r.referralsRequired !== 1 ? "s" : ""} requeridos ·{" "}
                {REWARD_TYPES.find((t) => t.value === r.rewardType)?.label ?? r.rewardType}
              </p>
              {r.description && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                  {r.description}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {!r.isPrimary && (
                <form action={submit(onSetPrimary)}>
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    className="premium-btn-secondary"
                    disabled={pending}
                    style={{ fontSize: "0.78rem", padding: "5px 10px" }}
                  >
                    Hacer principal
                  </button>
                </form>
              )}
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
