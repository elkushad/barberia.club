// Precios del plan Pro.
export const PRO_PRICE_USD = 10; // PayPal (resto del mundo)
export const PRO_PRICE_PEN = "29.90"; // Mercado Pago (Perú)

// Códigos de país que manejamos (orden: más largos primero para evitar choques).
const CODES = ["598", "591", "593", "507", "51", "52", "54", "55", "56", "57", "58", "34", "44", "1"];

const COUNTRY_CURRENCY: Record<string, { currency: string; symbol: string }> = {
  "+51": { currency: "PEN", symbol: "S/" },
  "+54": { currency: "ARS", symbol: "AR$" },
  "+55": { currency: "BRL", symbol: "R$" },
  "+52": { currency: "MXN", symbol: "MX$" },
  "+56": { currency: "CLP", symbol: "CLP$" },
  "+57": { currency: "COP", symbol: "COL$" },
  "+598": { currency: "UYU", symbol: "$U" },
  "+591": { currency: "BOB", symbol: "Bs" },
  "+34": { currency: "EUR", symbol: "€" },
  "+44": { currency: "GBP", symbol: "£" },
  "+1": { currency: "USD", symbol: "$" },
  "+593": { currency: "USD", symbol: "$" }, // Ecuador
  "+58": { currency: "USD", symbol: "$" }, // Venezuela (USD informal)
  "+507": { currency: "USD", symbol: "$" }, // Panamá
};

// Región LATAM. Brasil queda EXCLUIDO a propósito: paga en USD (PayPal).
// ISO-2 (para geolocalización por IP) y códigos de llamada (para el WhatsApp del dueño).
const LATAM_ISO = new Set(["AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "SV", "GT", "HN", "MX", "NI", "PA", "PY", "PE", "UY", "VE"]);
const LATAM_CALLING = new Set(["+51", "+54", "+52", "+56", "+57", "+598", "+591", "+593", "+58", "+507"]);

/**
 * Moneda por defecto del selector según el país del visitante.
 * LATAM (menos Brasil) → PEN (soles). Brasil y el resto del mundo → USD.
 * Prioriza el código de llamada del dueño (si está logueado); si no, usa el ISO-2 de geo-IP.
 */
export function defaultCurrency({
  callingCode,
  iso,
}: {
  callingCode?: string | null;
  iso?: string | null;
}): "PEN" | "USD" {
  if (callingCode) return LATAM_CALLING.has(callingCode) ? "PEN" : "USD";
  if (iso) return LATAM_ISO.has(iso.toUpperCase()) ? "PEN" : "USD";
  return "USD";
}

/** Deduce el código de país a partir del WhatsApp guardado (con código de país). */
export function detectCountryCode(whatsapp?: string | null): string | null {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  for (const code of CODES) {
    if (digits.startsWith(code)) return "+" + code;
  }
  return null;
}

export function currencyForCode(code: string | null) {
  if (!code) return null;
  return COUNTRY_CURRENCY[code] || null;
}

/** Convierte el precio USD a la moneda local (cacheado 1h). Null si no hay key o falla. */
export async function usdToLocal(currency: string): Promise<number | null> {
  const key = process.env.EXCHANGE_RATE_API_KEY;
  if (!key || currency === "USD") return null;
  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${key}/pair/USD/${currency}/${PRO_PRICE_USD}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.conversion_result === "number" ? data.conversion_result : null;
  } catch {
    return null;
  }
}
