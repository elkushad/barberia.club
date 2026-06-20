"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

interface Reward {
  id: string;
  name: string;
  visitsRequired: number;
  imagePreview?: string;
}

export default function RecompensasPublicPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [name, setName] = useState("");
  const [visits, setVisits] = useState("");
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim() || !visits) return;
    if (editingId) {
      setRewards((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, name: name.trim(), visitsRequired: parseInt(visits), imagePreview }
            : r
        )
      );
      setEditingId(null);
    } else {
      setRewards((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: name.trim(), visitsRequired: parseInt(visits), imagePreview },
      ]);
    }
    setName("");
    setVisits("");
    setImagePreview(undefined);
    if (fileRef.current) fileRef.current.value = "";
  };

  const startEdit = (r: Reward) => {
    setEditingId(r.id);
    setName(r.name);
    setVisits(String(r.visitsRequired));
    setImagePreview(r.imagePreview);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setVisits("");
    setImagePreview(undefined);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) cancelEdit();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--saas-bg, #0a0d11)",
        color: "white",
      }}
    >
      <PublicNavbar />

      <main
        style={{
          flexGrow: 1,
          paddingTop: "80px",
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          padding: "5rem 1.5rem 3rem",
        }}
      >
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "2.6rem",
              fontFamily: "var(--font-serif, serif)",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Sistema de{" "}
            <i style={{ color: "var(--saas-red, #ff3366)", fontStyle: "italic" }}>recompensas</i>
          </h1>
          <p style={{ color: "var(--saas-text-muted, #94a3b8)", fontSize: "1rem", maxWidth: "540px" }}>
            Diseña las recompensas para tus clientes. Prueba cómo se ve y publícalas cuando estés listo.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {/* ── Formulario ── */}
          <div
            className="premium-card"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <h3 style={{ color: "var(--accent-primary, #7c3aed)", marginBottom: "0.25rem" }}>
              {editingId ? "Editar recompensa" : "Crear nueva recompensa"}
            </h3>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.875rem",
                  color: "var(--text-secondary, #94a3b8)",
                }}
              >
                Nombre de la recompensa (ej: Corte Gratis)
              </label>
              <input
                className="premium-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Corte Gratis"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.875rem",
                  color: "var(--text-secondary, #94a3b8)",
                }}
              >
                Imagen del producto
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="premium-input"
                onChange={handleImageChange}
                style={{ padding: "8px" }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    marginTop: "8px",
                    border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
                  }}
                />
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontSize: "0.875rem",
                  color: "var(--text-secondary, #94a3b8)",
                }}
              >
                Visitas requeridas
              </label>
              <input
                className="premium-input"
                type="number"
                min="1"
                value={visits}
                onChange={(e) => setVisits(e.target.value)}
                placeholder="10"
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                className="premium-btn"
                onClick={handleSubmit}
                disabled={!name.trim() || !visits}
                style={{ flex: 1 }}
              >
                {editingId ? "Guardar cambios" : "Agregar recompensa"}
              </button>
              {editingId && (
                <button className="premium-btn-secondary" onClick={cancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {/* ── Lista ── */}
          <div>
            <h3 style={{ marginBottom: "1rem" }}>
              Recompensas activas{" "}
              {rewards.length > 0 && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary, #94a3b8)",
                    fontWeight: 400,
                  }}
                >
                  ({rewards.length})
                </span>
              )}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {rewards.map((r) => (
                <div
                  key={r.id}
                  className="premium-card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1.25rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {r.imagePreview ? (
                      <img
                        src={r.imagePreview}
                        alt={r.name}
                        style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.05))",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                        }}
                      >
                        🎁
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>{r.name}</h4>
                      <p style={{ color: "var(--accent-primary, #7c3aed)", fontWeight: "bold", fontSize: "0.875rem" }}>
                        {r.visitsRequired} visitas requeridas
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="premium-btn-secondary"
                      onClick={() => startEdit(r)}
                      style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                    >
                      Editar
                    </button>
                    <button
                      className="premium-btn-secondary"
                      onClick={() => removeReward(r.id)}
                      style={{ color: "var(--accent-danger, #ef4444)", fontSize: "0.8rem", padding: "6px 12px" }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}

              {rewards.length === 0 && (
                <div
                  style={{
                    padding: "2.5rem",
                    textAlign: "center",
                    border: "1px dashed var(--border-color, rgba(255,255,255,0.1))",
                    borderRadius: "12px",
                    color: "var(--text-secondary, #94a3b8)",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎁</div>
                  <p>Crea tu primera recompensa para verla aquí.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Botón Publicar ── */}
        <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => setShowPopup(true)}
            className="saas-btn-primary"
            style={{ padding: "1rem 2.5rem", fontSize: "1.1rem", cursor: "pointer", border: "none" }}
          >
            Publicar recompensas →
          </button>
        </div>
      </main>

      <PublicFooter />

      {/* ── Popup registro ── */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-secondary, #141820)",
              borderRadius: "16px",
              padding: "2.5rem 2rem",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎁</div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.75rem", lineHeight: 1.3 }}>
              Registra tu barbería y empieza a recompensar a tus clientes
            </h3>
            <p
              style={{
                color: "var(--saas-text-muted, #94a3b8)",
                marginBottom: "1.75rem",
                fontSize: "0.95rem",
                lineHeight: 1.5,
              }}
            >
              Crea tu cuenta gratis y activa tu sistema de recompensas en minutos.
            </p>
            <Link
              href="/register"
              className="saas-btn-primary"
              style={{
                display: "inline-block",
                padding: "0.9rem 2rem",
                fontSize: "1rem",
                textDecoration: "none",
              }}
            >
              Registrar mi barbería GRATIS →
            </Link>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                display: "block",
                margin: "1.25rem auto 0",
                background: "none",
                border: "none",
                color: "var(--text-secondary, #94a3b8)",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
