// Crea un plan de suscripción de PayPal con 20% de descuento el primer mes
// (primer ciclo $8.00, luego $10.00/mes). Reutiliza el producto del plan actual.
//
// Uso (PowerShell), reemplazando TU_SECRET por el client secret de PayPal:
//
//   $env:PAYPAL_CLIENT_SECRET='TU_SECRET'
//   node scripts/create-paypal-discount-plan.mjs
//
// Variables opcionales (tienen valor por defecto de SANDBOX):
//   PAYPAL_API_BASE        -> https://api-m.sandbox.paypal.com (Live: https://api-m.paypal.com)
//   PAYPAL_CLIENT_ID       -> client id (sandbox por defecto)
//   PAYPAL_BASE_PLAN_ID    -> plan actual del que se copia el producto
//   PRO_PRICE / FIRST_PRICE-> 10.00 / 8.00

const API = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const CLIENT_ID =
  process.env.PAYPAL_CLIENT_ID ||
  "AbTvDWLweaUSef81rwQiwwOm6dXBiGMk02iBwuYOnFcgx_B0z-qEeiRCkC9Ua5UnHQMooOrn9Azt1ScI";
const SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const BASE_PLAN_ID = process.env.PAYPAL_BASE_PLAN_ID || "P-34R99602CN3659501NIXNLOI";
const PRO_PRICE = process.env.PRO_PRICE || "10.00";
const FIRST_PRICE = process.env.FIRST_PRICE || "8.00";

if (!SECRET) {
  console.error("\n❌ Falta PAYPAL_CLIENT_SECRET. Córrelo así:\n   $env:PAYPAL_CLIENT_SECRET='TU_SECRET'; node scripts/create-paypal-discount-plan.mjs\n");
  process.exit(1);
}

async function token() {
  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");
  const res = await fetch(`${API}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Auth falló (${res.status}). ¿Client ID/Secret y entorno (sandbox/live) correctos?`);
  return (await res.json()).access_token;
}

async function main() {
  const t = await token();
  const headers = { Authorization: `Bearer ${t}`, "Content-Type": "application/json" };

  // 1) Producto del plan actual (para que el nuevo plan quede en el mismo producto).
  let productId;
  const planRes = await fetch(`${API}/v1/billing/plans/${BASE_PLAN_ID}`, { headers });
  if (planRes.ok) {
    productId = (await planRes.json()).product_id;
    console.log("• Reusando producto del plan actual:", productId);
  } else {
    // Si no se encontró el plan base, creamos un producto nuevo.
    const prodRes = await fetch(`${API}/v1/catalogs/products`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: "Barbería.club Pro", type: "SERVICE", category: "SOFTWARE" }),
    });
    if (!prodRes.ok) throw new Error("No se pudo obtener/crear el producto: " + (await prodRes.text()));
    productId = (await prodRes.json()).id;
    console.log("• Producto nuevo creado:", productId);
  }

  // 2) Plan con primer ciclo (TRIAL) con precio reducido + ciclo regular.
  const body = {
    product_id: productId,
    name: "Pro mensual — 20% primer mes (referido)",
    description: "Plan Pro con 20% de descuento el primer mes para barberías referidas.",
    billing_cycles: [
      {
        frequency: { interval_unit: "MONTH", interval_count: 1 },
        tenure_type: "TRIAL",
        sequence: 1,
        total_cycles: 1,
        pricing_scheme: { fixed_price: { value: FIRST_PRICE, currency_code: "USD" } },
      },
      {
        frequency: { interval_unit: "MONTH", interval_count: 1 },
        tenure_type: "REGULAR",
        sequence: 2,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: PRO_PRICE, currency_code: "USD" } },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  };

  const res = await fetch(`${API}/v1/billing/plans`, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("No se pudo crear el plan: " + (await res.text()));
  const plan = await res.json();

  console.log("\n✅ Plan con descuento creado.");
  console.log("   Plan ID:", plan.id);
  console.log("   Primer mes: $" + FIRST_PRICE + " · luego: $" + PRO_PRICE + "/mes");
  console.log("\n👉 Pon esto en Vercel (Environment Variables) y haz redeploy:");
  console.log("   NEXT_PUBLIC_PAYPAL_PLAN_ID_DISCOUNT=" + plan.id + "\n");
}

main().catch((e) => {
  console.error("\n❌", e.message, "\n");
  process.exit(1);
});
