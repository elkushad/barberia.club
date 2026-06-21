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
  // Cuadro blanco real: x290 y560 414x436. QR arriba centrado, texto en la barra de abajo.
  { id: "flyer", label: "Diseño oscuro", src: "/flyer.png", width: 1024, height: 1535, qr: { x: 332, y: 580, size: 330 }, caption: { x: 300, y: 916, width: 394, height: 70 }, pro: false },
  { id: "flyer3", label: "Clásico", src: "/flyer3.png", width: 1054, height: 1492, qr: { x: 559, y: 939, size: 245 }, pro: false },
  // Cuadro blanco real: x289 y613 431x399. QR arriba centrado, texto en la barra de abajo.
  { id: "flyer2", label: "Diseño claro", src: "/flyer2.png", width: 1024, height: 1535, qr: { x: 359, y: 632, size: 290 }, caption: { x: 300, y: 930, width: 411, height: 72 }, pro: true },
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
