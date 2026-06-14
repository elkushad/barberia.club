"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "../login/login.module.css"; // Reuse login styles

const COUNTRY_CODES = [
  { code: "+51", flag: "🇵🇪", name: "Perú" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+55", flag: "🇧🇷", name: "Brasil" },
  { code: "+52", flag: "🇲🇽", name: "México" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+1", flag: "🇺🇸", name: "USA/Canadá" },
  { code: "+34", flag: "🇪🇸", name: "España" },
  { code: "+44", flag: "🇬🇧", name: "Reino Unido" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela" },
  { code: "+507", flag: "🇵🇦", name: "Panamá" },
];

export default function RegisterPage() {
  const [barberName, setBarberName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+51");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barberName, email, password, whatsapp: `${countryCode} ${phone}`.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrar la barbería");
        setLoading(false);
        return;
      }

      // Automatically sign in the user after successful registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Registrado exitosamente, pero falló el inicio de sesión automático.");
        setLoading(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Error de red, por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard} style={{ maxWidth: '420px', width: '100%' }}>
        <h1 className={`${styles.title} text-gradient`} style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>barberia.club</h1>
        <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>Crea tu cuenta y empieza a premiar a tus clientes.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="barberName">
              Nombre de la Barbería
            </label>
            <input
              id="barberName"
              type="text"
              className="premium-input"
              placeholder="Ej. Barber VIP"
              value={barberName}
              onChange={(e) => setBarberName(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              className="premium-input"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="phone">
              WhatsApp (con código de país)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="premium-input"
                style={{ width: 'auto', flexShrink: 0 }}
                aria-label="Código de país"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code + c.name} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <input
                id="phone"
                type="tel"
                className="premium-input"
                placeholder="987 654 321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ flex: 1, minWidth: 0 }}
                required
              />
            </div>
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
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="saas-btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.05rem', animation: 'none' }} // Deshabilitar pulse en el form para no distraer tanto, o dejarlo? Dejémoslo con brillo
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Registrar mi barbería"}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--saas-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>¿Ya tienes una cuenta?</p>
          <Link href="/login" style={{ 
            display: 'block', 
            width: '100%', 
            padding: '1rem', 
            backgroundColor: '#050505', 
            color: 'white', 
            border: '1px solid var(--saas-border)', 
            borderRadius: '6px', 
            textAlign: 'center',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#111'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#050505'}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
