// Helpers de PayPal del lado del servidor.
// El secreto SIEMPRE viene de variable de entorno (nunca hardcodeado).
// El Client ID y el Plan ID son públicos (con valor por defecto de Sandbox).

const PAYPAL_API = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "AbTvDWLweaUSef81rwQiwwOm6dXBiGMk02iBwuYOnFcgx_B0z-qEeiRCkC9Ua5UnHQMooOrn9Azt1ScI";
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

export async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("PayPal: fallo de autenticación");
  const data = await res.json();
  return data.access_token as string;
}

export async function getPayPalSubscription(subscriptionId: string) {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}
