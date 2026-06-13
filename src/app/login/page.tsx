"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={`${styles.title} text-gradient`}>barberia.club</h1>
        <p className={styles.subtitle}>Accede a tu panel de administración</p>

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

          <button
            type="submit"
            className={`premium-btn ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
