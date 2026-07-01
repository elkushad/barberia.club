// Motor de "Oportunidades": detecta, por cliente, la razón MÁS importante para
// contactarlo hoy y arma el mensaje de WhatsApp pre-escrito correspondiente.
//
// Diseño desacoplado y escalable: cada tipo de oportunidad vive como una entrada
// en OPPORTUNITY_DEFS con su prioridad, icono, título, cómo se construye su
// "situación" visible y qué plantilla de mensaje usa. La UI y las páginas no
// saben de reglas concretas: solo consumen `detectOpportunities()`.
//
// Para agregar una oportunidad nueva (Cumpleaños, Recompensa desbloqueada,
// Referidos, Cliente VIP, Mayor gasto, ...):
//   1. Añade su `kind` a OpportunityKind.
//   2. Añade su plantilla a MESSAGE_TEMPLATES.
//   3. Añade su definición a OPPORTUNITY_DEFS (prioridad + matcher + textos).
// No hace falta tocar la tabla, el switch ni las páginas.

import { customerProgressLink, waLink } from "@/lib/loyalty";

/* ── Tipos ─────────────────────────────────────────────────────────────── */

export type OpportunityKind =
  | "ONE_AWAY"        // 🔥 A 1 visita de recompensa
  | "TWO_AWAY"        // 🎯 A 2 visitas de recompensa
  | "OVER_FREQUENCY"  // ⏰ Superó su frecuencia habitual
  | "INACTIVE"        // 🚨 Cliente inactivo
  | "FREQUENT";       // ⭐ Cliente frecuente

/** Señal mínima por cliente que necesita el motor (agnóstico de Prisma). */
export interface CustomerSignal {
  id: string;
  name: string;
  phone: string;
  uniqueCode: string | null;
  totalVisits: number;             // visitas CONFIRMED
  lastVisitAt: Date | null;        // fecha de la última visita CONFIRMED
  avgIntervalDays: number | null;  // días promedio entre visitas (null si <2)
}

export interface RewardSignal {
  name: string;
  visitsRequired: number;
}

/** Oportunidad lista para renderizar y accionar. */
export interface Opportunity {
  kind: OpportunityKind;
  priority: number;             // menor = más importante (se muestra primero)
  icon: string;                 // emoji para la columna Situación
  title: string;               // título corto del tipo (metadato / futuros usos)
  situation: string;            // texto humano — NUNCA cálculos, promedios ni fórmulas
  message: string;              // mensaje de WhatsApp pre-escrito ya interpolado
  waHref: string;               // enlace wa.me listo para abrir
  daysSinceLastVisit: number;   // metadato para orden secundario (no se muestra crudo)
  customer: {
    id: string;
    name: string;
    phone: string;
    uniqueCode: string | null;
  };
}

/* ── Umbrales (ajustables en un solo lugar) ────────────────────────────── */

const INACTIVE_DAYS = 60;          // 🚨 sin volver hace mucho
const OVER_FREQUENCY_FACTOR = 1.5; // superó 1.5× su intervalo habitual
const FREQUENT_MIN_VISITS = 6;     // ⭐ suficientes visitas para considerarlo frecuente
const FREQUENT_MAX_DAYS = 45;      // ...y aún activo

/* ── Plantillas de mensaje (texto exacto de producto) ──────────────────── */
// Placeholders: {{nombre}}, {{recompensa}}, {{link}}

const MESSAGE_TEMPLATES: Record<OpportunityKind, string> = {
  ONE_AWAY:
    `Hola {{nombre}} 🔥\n\n` +
    `¡Estás a solo 1 corte de obtener tu {{recompensa}} por tu fidelidad!\n\n` +
    `Mira tu progreso aquí:\n\n{{link}}`,
  TWO_AWAY:
    `Hola {{nombre}} 👋\n\n` +
    `Te faltan solo 2 cortes para obtener tu {{recompensa}} por tu fidelidad.\n\n` +
    `Mira tu progreso aquí:\n\n{{link}}`,
  OVER_FREQUENCY:
    `Hola {{nombre}} 👋\n\n` +
    `Tus visitas y recompensas siguen acumulándose.\n\n` +
    `Mira tu progreso aquí:\n\n{{link}}`,
  INACTIVE:
    `Hola {{nombre}} 💈\n\n` +
    `Hace tiempo que no te vemos.\n\n` +
    `Tu progreso sigue guardado.\n\n` +
    `Mira aquí tus visitas y recompensas:\n\n{{link}}`,
  FREQUENT:
    `Hola {{nombre}} 🙌\n\n` +
    `Gracias por seguir confiando en nosotros.\n\n` +
    `Tu progreso continúa acumulándose.\n\n` +
    `Mira aquí tus recompensas:\n\n{{link}}`,
};

/* ── Contexto que un matcher recibe para decidir ───────────────────────── */
interface MatchContext {
  signal: CustomerSignal;
  daysSince: number;        // días desde la última visita (Infinity si nunca)
  faltan: number | null;    // cortes que faltan para la próxima recompensa
  rewardName: string;       // nombre de esa próxima recompensa
}

/* ── Definiciones de cada oportunidad ──────────────────────────────────── */
// El orden de PRIORIDAD y de EVALUACIÓN es el mismo: se recorre de mayor a menor
// importancia y el primer `match` gana. Así cada cliente recibe una sola
// oportunidad: la más importante.

interface OpportunityDef {
  kind: OpportunityKind;
  priority: number;
  icon: string;
  title: string;
  match: (ctx: MatchContext) => boolean;
  situation: (ctx: MatchContext) => string;
}

const OPPORTUNITY_DEFS: OpportunityDef[] = [
  {
    kind: "ONE_AWAY",
    priority: 1,
    icon: "🔥",
    title: "A 1 visita de recompensa",
    match: (c) => c.faltan === 1,
    situation: (c) => `🔥 A 1 visita de obtener un ${c.rewardName}`,
  },
  {
    kind: "TWO_AWAY",
    priority: 2,
    icon: "🎯",
    title: "A 2 visitas de recompensa",
    match: (c) => c.faltan === 2,
    situation: (c) => `🎯 A 2 visitas de obtener un ${c.rewardName}`,
  },
  {
    kind: "OVER_FREQUENCY",
    priority: 3,
    icon: "⏰",
    title: "Superó su frecuencia habitual",
    match: (c) =>
      c.signal.avgIntervalDays !== null &&
      c.signal.totalVisits >= 2 &&
      c.daysSince < INACTIVE_DAYS &&
      c.daysSince > c.signal.avgIntervalDays * OVER_FREQUENCY_FACTOR,
    situation: () => `⏰ Superó su frecuencia habitual`,
  },
  {
    kind: "INACTIVE",
    priority: 4,
    icon: "🚨",
    title: "Cliente inactivo",
    match: (c) => Number.isFinite(c.daysSince) && c.daysSince >= INACTIVE_DAYS,
    situation: (c) => `🚨 Hace ${c.daysSince} días que no vuelve`,
  },
  {
    kind: "FREQUENT",
    priority: 5,
    icon: "⭐",
    title: "Cliente frecuente",
    match: (c) =>
      c.signal.totalVisits >= FREQUENT_MIN_VISITS && c.daysSince <= FREQUENT_MAX_DAYS,
    situation: () => `⭐ Cliente frecuente`,
  },
];

/* ── Helpers ───────────────────────────────────────────────────────────── */

const DAY_MS = 86_400_000;

/** Deriva lastVisitAt y el intervalo promedio a partir de las fechas de visita. */
export function computeVisitStats(dates: Date[]): {
  totalVisits: number;
  lastVisitAt: Date | null;
  avgIntervalDays: number | null;
} {
  const totalVisits = dates.length;
  if (totalVisits === 0) return { totalVisits, lastVisitAt: null, avgIntervalDays: null };

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const lastVisitAt = sorted[sorted.length - 1];

  if (sorted.length < 2) return { totalVisits, lastVisitAt, avgIntervalDays: null };

  const spanDays = (lastVisitAt.getTime() - sorted[0].getTime()) / DAY_MS;
  const avgIntervalDays = spanDays / (sorted.length - 1);
  return { totalVisits, lastVisitAt, avgIntervalDays };
}

/** Progreso cíclico hacia la próxima recompensa (mismo criterio que la card de cliente). */
function nextRewardInfo(
  totalVisits: number,
  rewards: RewardSignal[],
): { faltan: number | null; rewardName: string } {
  const sorted = [...rewards].sort((a, b) => a.visitsRequired - b.visitsRequired);
  const maxVisits = sorted.length ? sorted[sorted.length - 1].visitsRequired : 0;
  if (maxVisits <= 0) return { faltan: null, rewardName: "recompensa" };

  let effective = totalVisits % maxVisits;
  if (effective === 0 && totalVisits > 0) effective = maxVisits;

  const next = sorted.find((r) => r.visitsRequired > effective);
  if (!next) return { faltan: null, rewardName: "recompensa" };
  return { faltan: next.visitsRequired - effective, rewardName: next.name };
}

function fillTemplate(kind: OpportunityKind, name: string, rewardName: string, link: string): string {
  return MESSAGE_TEMPLATES[kind]
    .replaceAll("{{nombre}}", name)
    .replaceAll("{{recompensa}}", rewardName)
    .replaceAll("{{link}}", link);
}

/* ── API principal ─────────────────────────────────────────────────────── */

/** Devuelve la oportunidad más importante de un cliente, o null si está al día. */
export function computeCustomerOpportunity(
  signal: CustomerSignal,
  rewards: RewardSignal[],
): Opportunity | null {
  const daysSince = signal.lastVisitAt
    ? Math.floor((Date.now() - signal.lastVisitAt.getTime()) / DAY_MS)
    : Infinity;

  const { faltan, rewardName } = nextRewardInfo(signal.totalVisits, rewards);
  const ctx: MatchContext = { signal, daysSince, faltan, rewardName };

  const def = OPPORTUNITY_DEFS.find((d) => d.match(ctx));
  if (!def) return null;

  const link = customerProgressLink(signal.uniqueCode);
  const message = fillTemplate(def.kind, signal.name, rewardName, link);

  return {
    kind: def.kind,
    priority: def.priority,
    icon: def.icon,
    title: def.title,
    situation: def.situation(ctx),
    message,
    waHref: waLink(signal.phone, message),
    daysSinceLastVisit: Number.isFinite(daysSince) ? daysSince : 9999,
    customer: {
      id: signal.id,
      name: signal.name,
      phone: signal.phone,
      uniqueCode: signal.uniqueCode,
    },
  };
}

/**
 * Detecta y ordena las oportunidades de un conjunto de clientes.
 * Orden: por prioridad (más importante primero) y, dentro del mismo tipo, el
 * cliente más "en riesgo" (más días sin volver) primero.
 */
export function detectOpportunities(
  signals: CustomerSignal[],
  rewards: RewardSignal[],
): Opportunity[] {
  const list: Opportunity[] = [];
  for (const s of signals) {
    const op = computeCustomerOpportunity(s, rewards);
    if (op) list.push(op);
  }
  list.sort((a, b) => a.priority - b.priority || b.daysSinceLastVisit - a.daysSinceLastVisit);
  return list;
}
