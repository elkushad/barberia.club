// Configuración centralizada de las plantillas de flyer.
// La lógica de QR no cambia: cada plantilla solo define su imagen base y la
// posición/tamaño del recuadro donde se superpone el QR (en px de la imagen real).

export type FlyerTemplateId = "flyer" | "flyer2" | "flyer3";

export interface FlyerTemplate {
  id: FlyerTemplateId;
  label: string;
  src: string;
  width: number;
  height: number;
  qr: { x: number; y: number; size: number };
  // Barra horizontal (dentro del cuadro blanco, debajo del QR) donde se escribe
  // "O ingresa a la página de esta barbería: <link>". Opcional por plantilla.
  caption?: { x: number; y: number; width: number; height: number };
  pro: boolean; // true = exclusiva del plan PRO
}

// Cada diseño tiene su propio recuadro de QR (detectado sobre la imagen real,
// QR centrado dentro del placeholder blanco). Si cambias un arte, recalibra su `qr`
// (y su `caption`). Plan Free: oscura + clásica. Plan PRO: además la clara.
export const FLYER_TEMPLATES: FlyerTemplate[] = [
  // QR llena el recuadro blanco (x290 y560 414x436). El link va en la barra blanca de abajo (x282 y1038 432x35).
  { id: "flyer", label: "Diseño oscuro", src: "/flyer.png", width: 1024, height: 1535, qr: { x: 317, y: 598, size: 360 }, caption: { x: 292, y: 1038, width: 412, height: 35 }, pro: false },
  { id: "flyer3", label: "Clásico", src: "/flyer3.png", width: 1054, height: 1492, qr: { x: 559, y: 939, size: 245 }, pro: false },
  // QR llena el recuadro blanco (x289 y613 431x399). El link va en la barra blanca de abajo (x283 y1036 440x37).
  { id: "flyer2", label: "Diseño claro", src: "/flyer2.png", width: 1024, height: 1535, qr: { x: 329, y: 637, size: 350 }, caption: { x: 293, y: 1036, width: 420, height: 37 }, pro: true },
];

// Si la barbería nunca eligió una plantilla, se usa la oscura (disponible en Free).
export const DEFAULT_FLYER_TEMPLATE: FlyerTemplateId = "flyer";

export function getFlyerTemplate(id?: string | null): FlyerTemplate {
  return (
    FLYER_TEMPLATES.find((t) => t.id === id) ??
    FLYER_TEMPLATES.find((t) => t.id === DEFAULT_FLYER_TEMPLATE)!
  );
}

export function isFlyerTemplateId(id: string): id is FlyerTemplateId {
  return FLYER_TEMPLATES.some((t) => t.id === id);
}
