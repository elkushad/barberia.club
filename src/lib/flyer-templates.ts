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
}

// Cada diseño tiene su propio recuadro de QR (detectado sobre la imagen real,
// QR centrado dentro del placeholder blanco). Si cambias un arte, recalibra su `qr`.
export const FLYER_TEMPLATES: FlyerTemplate[] = [
  { id: "flyer", label: "Diseño oscuro", src: "/flyer.png", width: 1024, height: 1536, qr: { x: 305, y: 587, size: 380 } },
  { id: "flyer2", label: "Diseño claro", src: "/flyer2.png", width: 1024, height: 1536, qr: { x: 307, y: 637, size: 395 } },
  { id: "flyer3", label: "Clásico", src: "/flyer3.png", width: 1054, height: 1492, qr: { x: 559, y: 939, size: 245 } },
];

// Si la barbería nunca eligió una plantilla, se usa flyer2 por defecto.
export const DEFAULT_FLYER_TEMPLATE: FlyerTemplateId = "flyer2";

export function getFlyerTemplate(id?: string | null): FlyerTemplate {
  return (
    FLYER_TEMPLATES.find((t) => t.id === id) ??
    FLYER_TEMPLATES.find((t) => t.id === DEFAULT_FLYER_TEMPLATE)!
  );
}

export function isFlyerTemplateId(id: string): id is FlyerTemplateId {
  return FLYER_TEMPLATES.some((t) => t.id === id);
}
