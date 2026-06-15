// Crea un plan de suscripción de Mercado Pago IGUAL al actual pero SIN los
// 7 días de prueba (mismo precio, frecuencia y back_url). Imprime el ID nuevo.
//
// Uso (PowerShell), reemplazando TU_TOKEN por el Access Token de MP de la
// MISMA cuenta donde está el plan actual:
//
//   $env:MERCADOPAGO_ACCESS_TOKEN='TU_TOKEN'
//   node scripts/create-mp-notrial-plan.mjs
//
// Opcional: MP_BASE_PLAN_ID (plan actual del que se copia la config).

const API = "https://api.mercadopago.com";
const TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
const BASE_PLAN_ID = process.env.MP_BASE_PLAN_ID || "05ca87e1eeb24969a9401242780b973e";

if (!TOKEN) {
  console.error("\n❌ Falta MERCADOPAGO_ACCESS_TOKEN. Córrelo así:\n   $env:MERCADOPAGO_ACCESS_TOKEN='TU_TOKEN'; node scripts/create-mp-notrial-plan.mjs\n");
  process.exit(1);
}

async function main() {
  const headers = { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };

  // 1) Leer el plan actual para copiar su configuración.
  const res = await fetch(`${API}/preapproval_plan/${BASE_PLAN_ID}`, { headers });
  if (!res.ok) {
    throw new Error(
      `No se pudo leer el plan base (${res.status}). ¿El token es de la misma cuenta del plan y del entorno correcto (prod vs test)?\n` +
        (await res.text())
    );
  }
  const base = await res.json();
  const ar = base.auto_recurring || {};

  // 2) Crear el plan nuevo SIN free_trial.
  const body = {
    reason: (base.reason || "Barbería.club Pro") + " (sin prueba)",
    auto_recurring: {
      frequency: ar.frequency || 1,
      frequency_type: ar.frequency_type || "months",
      transaction_amount: ar.transaction_amount || 29.9,
      currency_id: ar.currency_id || "PEN",
      // (sin free_trial -> cobro inmediato)
    },
    back_url: base.back_url || "https://www.barberia.club/planes",
  };

  const create = await fetch(`${API}/preapproval_plan`, { method: "POST", headers, body: JSON.stringify(body) });
  if (!create.ok) throw new Error("No se pudo crear el plan: " + (await create.text()));
  const plan = await create.json();

  console.log("\n✅ Plan SIN prueba creado.");
  console.log("   Plan ID:", plan.id);
  console.log("   Precio:", body.auto_recurring.transaction_amount, body.auto_recurring.currency_id, "/ mes (cobro inmediato)");
  console.log("   Link:", plan.init_point || `https://www.mercadopago.com.pe/subscriptions/checkout?preapproval_plan_id=${plan.id}`);
  console.log("\n👉 Pon esto en Vercel (Environment Variables) y haz redeploy:");
  console.log("   MERCADOPAGO_PLAN_ID_NOTRIAL=" + plan.id + "\n");
}

main().catch((e) => {
  console.error("\n❌", e.message, "\n");
  process.exit(1);
});
