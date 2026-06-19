"use client";

import { useState, useTransition } from "react";

const GREEN = "#22c55e";

export default function ServiceRow({
  service,
  updateService,
  deleteService,
  setPrimary,
}: {
  service: { id: string; name: string; price: number; isPrimary: boolean };
  updateService: (formData: FormData) => Promise<void>;
  deleteService: (formData: FormData) => Promise<void>;
  setPrimary: (formData: FormData) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [name,  setName]  = useState(service.name);
  const [price, setPrice] = useState(String(service.price));
  const [pending, startTransition] = useTransition();

  function startEdit() {
    setName(service.name);
    setPrice(String(service.price));
    setSaved(false);
    setEditing(true);
  }

  function handleSave() {
    if (!name.trim() || isNaN(parseFloat(price))) return;
    const fd = new FormData();
    fd.set("id", service.id);
    fd.set("name", name);
    fd.set("price", price);
    startTransition(async () => {
      await updateService(fd);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function handleDelete() {
    const fd = new FormData();
    fd.set("id", service.id);
    startTransition(async () => { await deleteService(fd); });
  }

  function handleSetPrimary() {
    const fd = new FormData();
    fd.set("id", service.id);
    startTransition(async () => { await setPrimary(fd); });
  }

  return (
    <div
      className="premium-card"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "flex-end",
        borderColor: service.isPrimary ? "var(--accent-primary)" : "var(--border-color)",
        opacity: pending ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* ── Campos ── */}
      <div style={{ display: "flex", gap: "0.75rem", flex: "1 1 280px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: "2 1 160px" }}>
          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
            Nombre {service.isPrimary && <span style={{ color: "var(--accent-primary)", fontWeight: 700 }}>· Principal ★</span>}
          </label>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="premium-input"
              style={{ width: "100%" }}
              autoFocus
            />
          ) : (
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", paddingBottom: "2px" }}>
              {service.name}
            </p>
          )}
        </div>

        <div style={{ flex: "1 1 90px" }}>
          <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
            Precio (S/)
          </label>
          {editing ? (
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              min="0"
              step="0.5"
              className="premium-input"
              style={{ width: "100%" }}
            />
          ) : (
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", paddingBottom: "2px" }}>
              S/ {service.price}
            </p>
          )}
        </div>
      </div>

      {/* ── Acciones ── */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {!service.isPrimary && (
          <button
            type="button"
            onClick={handleSetPrimary}
            disabled={pending}
            className="premium-btn-secondary"
            style={{ padding: "8px 12px", fontSize: "0.8rem" }}
          >
            ★ Principal
          </button>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="premium-btn-secondary"
          style={{ padding: "8px 12px", fontSize: "0.8rem", color: "var(--accent-danger)" }}
        >
          Eliminar
        </button>

        {/* Editar / Guardar / Pill guardado */}
        {saved ? (
          /* Pill verde 1:1 con checkmark */
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            backgroundColor: GREEN, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        ) : editing ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="premium-btn-secondary"
            style={{ padding: "8px 14px", fontSize: "0.8rem" }}
          >
            {pending ? "…" : "Guardar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            disabled={pending}
            className="premium-btn-secondary"
            style={{ padding: "8px 12px", fontSize: "0.8rem" }}
          >
            Editar
          </button>
        )}
      </div>
    </div>
  );
}
