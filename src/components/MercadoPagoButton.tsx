"use client";

import { useState } from "react";

export default function MercadoPagoButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mercadopago/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        setError(data.error || "No se pudo iniciar el pago.");
        setLoading(false);
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "360px" }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          backgroundColor: "#009ee3",
          color: "white",
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      >
        {loading ? "Redirigiendo…" : "Suscribirse con Mercado Pago"}
      </button>
      {error && (
        <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>
      )}
    </div>
  );
}
