"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

type Mode = "barbero" | "cliente";

interface ClientShop {
  shopName: string;
  slug: string;
  logo: string | null;
  status: string;
  uniqueCode: string | null;
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("barbero");

  // --- Barbero (flujo existente, sin cambios) ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Cliente ---
  const [phone, setPhone] = useState("");
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState("");
  const [shops, setShops] = useState<ClientShop[] | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciales incorrectas");
      setLoading(false);
    } else {
      const session = await getSession();
      const role = (session?.user as { role?: string } | undefined)?.role;
      router.push(role === "ADMIN" ? "/godmode" : "/admin");
      router.refresh();
    }
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientLoading(true);
    setClientError("");
    setShops(null);

    try {
      const res = await fetch("/api/customer/barbershops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setClientError(data.error || "No se pudo buscar tus barberías.");
      } else {
        setShops(data.barbershops as ClientShop[]);
        setClientName(data.name);
      }
    } catch {
      setClientError("Error de red, intenta de nuevo.");
    }
    setClientLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={`${styles.title} text-gradient`}>barberia.club</h1>
        <p className={styles.subtitle}>
          {mode === "barbero" ? "Accede a tu panel de administración" : "Consulta tus barberías y recompensas"}
        </p>

        {/* Segmented control Barbero | Cliente */}
        <div
          role="group"
          aria-label="Tipo de acceso"
          style={{
            display: "flex",
            padding: "4px",
            gap: "4px",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border-color)",
            borderRadius: "999px",
            marginBottom: "1.5rem",
          }}
        >
          {(["barbero", "cliente"] as Mode[]).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                  setClientError("");
                }}
                aria-pressed={active}
                style={{
                  flex: 1,
                  border: "none",
                  cursor: "pointer",
                  padding: "0.6rem 0.5rem",
                  borderRadius: "999px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: active ? "white" : "var(--text-secondary)",
                  backgroundColor: active ? "var(--accent-primary)" : "transparent",
                  transition: "background-color 0.18s ease, color 0.18s ease",
                }}
              >
                {m === "barbero" ? "Entrar como Barbero" : "Entrar como Cliente"}
              </button>
            );
          })}
        </div>

        {/* --- MODO BARBERO --- */}
        {mode === "barbero" && (
          <>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  className="premium-input"
                  placeholder="ejemplo@barberia.club"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  className="premium-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={`premium-btn ${styles.submitBtn}`} disabled={loading}>
                {loading ? "Entrando..." : "Iniciar Sesión"}
              </button>
            </form>
          </>
        )}

        {/* --- MODO CLIENTE --- */}
        {mode === "cliente" && (
          <>
            {clientError && <div className={styles.error}>{clientError}</div>}
            <form onSubmit={handleClientSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="phone">
                  Tu WhatsApp / teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="premium-input"
                  placeholder="Ej: +51 999 888 777"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={`premium-btn ${styles.submitBtn}`} disabled={clientLoading}>
                {clientLoading ? "Buscando..." : "Ver mis barberías"}
              </button>
            </form>

            {/* Resultados */}
            {shops !== null && (
              <div style={{ marginTop: "1.5rem" }}>
                {shops.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textAlign: "center" }}>
                    No encontramos barberías registradas con ese número. Pídele a tu barbería que escanees su código QR
                    para registrarte.
                  </p>
                ) : (
                  <>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                      {clientName ? `Hola, ${clientName} 👋 ` : ""}
                      Estás registrado en {shops.length} {shops.length === 1 ? "barbería" : "barberías"}:
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {shops.map((s) => {
                        const active = s.status === "ACTIVE" && s.uniqueCode;
                        const href = active ? `/c/${s.uniqueCode}` : `/${s.slug}`;
                        return (
                          <Link
                            key={s.slug}
                            href={href}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                              padding: "0.75rem 1rem",
                              borderRadius: "12px",
                              border: "1px solid var(--border-color)",
                              backgroundColor: "var(--bg-secondary)",
                              textDecoration: "none",
                              color: "var(--text-primary)",
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                                overflow: "hidden",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(255,255,255,0.05)",
                              }}
                            >
                              {s.logo ? (
                                <img src={s.logo} alt={s.shopName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                              ) : (
                                <span style={{ fontSize: "1.2rem" }}>💈</span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ display: "block", fontWeight: 600, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {s.shopName}
                              </span>
                              <span style={{ display: "block", fontSize: "0.78rem", color: active ? "var(--accent-success)" : "var(--text-secondary)" }}>
                                {active ? "Ver mis recompensas →" : "Pendiente de aprobación"}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
