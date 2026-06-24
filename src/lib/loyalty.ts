// Helpers de fidelización: enlace de progreso del cliente y mensajes de
// WhatsApp prellenados. NO envían nada automáticamente: el sistema no tiene
// envío automático (ni SMS, ni email, ni push). Devuelven texto/links wa.me
// que el barbero envía con un toque, igual que el resto de la plataforma.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://barberia.club";

/** Enlace público de progreso del cliente (/c/{uniqueCode}). */
export function customerProgressLink(uniqueCode: string | null | undefined): string {
  return `${APP_URL}/c/${uniqueCode ?? ""}`;
}

/** Construye un enlace wa.me con un mensaje prellenado. */
export function waLink(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** Mensaje de bienvenida al agregar un cliente. */
export function welcomeMessage(name: string, shopName: string, uniqueCode: string | null): string {
  return `Hola ${name}. Bienvenido a ${shopName}. Consulta tus recompensas aquí: ${customerProgressLink(uniqueCode)}`;
}

/**
 * Mensaje tras registrar una visita, según cuántos cortes faltan para la
 * próxima recompensa. Usa los mismos umbrales que la barra de progreso de la
 * card de cliente (recompensas ordenadas por visitsRequired asc).
 */
export function visitMessage(opts: {
  name: string;
  uniqueCode: string | null;
  totalVisits: number;
  rewards: { visitsRequired: number }[];
}): string {
  const { name, uniqueCode, totalVisits, rewards } = opts;
  const link = customerProgressLink(uniqueCode);

  const maxVisits = rewards.length ? rewards[rewards.length - 1].visitsRequired : 10;
  let effective = maxVisits > 0 ? totalVisits % maxVisits : 0;
  if (effective === 0 && totalVisits > 0) effective = maxVisits;

  const next = rewards.find((r) => r.visitsRequired > effective);
  if (!next) {
    return `🎉 ¡Felicidades ${name}!\nYa desbloqueaste tu recompensa.\nMuéstrale este mensaje a tu barbero en tu próxima visita.`;
  }

  const faltan = next.visitsRequired - effective;
  if (faltan === 1) {
    return `🔥 Estás a solo 1 corte de tu recompensa.\nMira tu progreso:\n${link}`;
  }
  return `🔥 Ya registramos tu visita.\nTe faltan ${faltan} cortes para tu próxima recompensa.\nMira tu progreso:\n${link}`;
}
