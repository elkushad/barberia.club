// Lógica centralizada de acceso PRO.
// Úsala en TODOS los puntos donde hoy se verificaba `plan === "PRO"` / `=== "FREE"`
// para evitar checks duplicados.

export const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

type PlanInfo = { plan: string; trialEndsAt?: Date | null };

/**
 * ¿La barbería tiene beneficios PRO ahora mismo?
 * 1. PRO pagado (plan === "PRO") siempre tiene acceso y tiene prioridad.
 * 2. FREE con trial vigente (trialEndsAt en el futuro) también.
 * 3. En cualquier otro caso, no.
 *
 * La expiración depende solo de la fecha: cuando `trialEndsAt` queda en el
 * pasado, esta función devuelve false automáticamente, sin proceso manual.
 */
export function hasProAccess(barbershop: PlanInfo): boolean {
  if (barbershop.plan === "PRO") return true;
  if (barbershop.trialEndsAt && new Date() < new Date(barbershop.trialEndsAt)) {
    return true;
  }
  return false;
}

/** ¿El acceso PRO proviene de la prueba gratuita (y no de un PRO pagado)? */
export function isOnTrial(barbershop: PlanInfo): boolean {
  return barbershop.plan !== "PRO" && hasProAccess(barbershop);
}

/** Días enteros que le quedan a la prueba gratuita (0 si no aplica o ya venció). */
export function trialDaysLeft(barbershop: PlanInfo): number {
  if (!barbershop.trialEndsAt) return 0;
  const ms = new Date(barbershop.trialEndsAt).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

/** Fecha de fin de trial para una barbería nueva (ahora + 7 días). */
export function newTrialEndsAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + TRIAL_DURATION_MS);
}
