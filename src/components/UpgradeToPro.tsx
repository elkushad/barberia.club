"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "AbTvDWLweaUSef81rwQiwwOm6dXBiGMk02iBwuYOnFcgx_B0z-qEeiRCkC9Ua5UnHQMooOrn9Azt1ScI";
const PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID || "P-34R99602CN3659501NIXNLOI";
// Plan con 30% de descuento el primer mes (primer ciclo $7, luego $10).
// Si no está configurado, se usa el plan normal (sin descuento).
const PLAN_ID_DISCOUNT = process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID_DISCOUNT || "";

export default function UpgradeToPro({ slug, discountEligible = false }: { slug: string; discountEligible?: boolean }) {
  const [error, setError] = useState("");

  // Usa el plan con descuento solo si la barbería es elegible y el plan existe.
  const planId = discountEligible && PLAN_ID_DISCOUNT ? PLAN_ID_DISCOUNT : PLAN_ID;

  return (
    <div style={{ maxWidth: "360px" }}>
      <PayPalScriptProvider
        options={{ clientId: CLIENT_ID, vault: true, intent: "subscription", currency: "USD" }}
      >
        <PayPalButtons
          style={{ layout: "vertical", label: "subscribe" }}
          createSubscription={(data, actions) => actions.subscription.create({ plan_id: planId })}
          onApprove={async (data) => {
            setError("");
            try {
              const res = await fetch("/api/paypal/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionID: data.subscriptionID, slug }),
              });
              if (res.ok) {
                window.location.reload();
              } else {
                const d = await res.json().catch(() => ({}));
                setError(d.error || "No se pudo activar el plan. Contáctanos.");
              }
            } catch {
              setError("Error de red. Intenta de nuevo.");
            }
          }}
          onError={() => setError("Ocurrió un error con PayPal. Intenta de nuevo.")}
        />
      </PayPalScriptProvider>
      {error && (
        <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>
      )}
    </div>
  );
}
