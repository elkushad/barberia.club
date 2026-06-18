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

// Las 3 plantillas comparten layout/dimensiones, por lo que el recuadro del QR
// es el mismo. Si en el futuro un diseño mueve el QR, basta ajustar su `qr` aquí.
export const FLYER_TEMPLATES: FlyerTemplate[] = [
  { id: "flyer", label: "Clásico", src: "/flyer.png", width: 1054, height: 1492, qr: { x: 559, y: 939, size: 245 } },
  { id: "flyer2", label: "Diseño 2", src: "/flyer2.png", width: 1054, height: 1492, qr: { x: 559, y: 939, size: 245 } },
  { id: "flyer3", label: "Diseño 3", src: "/flyer3.png", width: 1054, height: 1492, qr: { x: 559, y: 939, size: 245 } },
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
