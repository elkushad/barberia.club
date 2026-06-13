// Limitador de tasa simple en memoria (ventana fija) para endpoints públicos.
// Nota: en entornos serverless el estado es por instancia; para límites
// estrictos a escala usa un store compartido (p. ej. Upstash Redis).

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Devuelve true si la petición está dentro del límite; false si se excede. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;

  bucket.count++;
  return true;
}

/** Mejor estimación de la IP del cliente a partir de las cabeceras. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
