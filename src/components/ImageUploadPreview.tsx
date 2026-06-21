"use client";

import { useState } from "react";

interface ImageUploadPreviewProps {
  name: string;
  accept?: string;
  multiple?: boolean;
  // Texto del botón de subida.
  label?: string;
  // "logo": pequeño y nítido, conserva transparencia. "photo": fondos/galería.
  variant?: "logo" | "photo";
  // Máximo de imágenes permitidas en total (existentes + nuevas). Sin límite si no se pasa.
  maxItems?: number;
  // Cantidad ya guardada en el servidor (cuenta para el límite).
  existingCount?: number;
}

// Comprime imágenes en el navegador antes de subir: redimensiona al lado mayor
// indicado y reencoda. Reduce mucho los MB (una foto de móvil 6-8 MB → ~200 KB)
// sin pérdida visible. No toca GIF/SVG, y si no mejora deja el original.
async function compressImage(file: File, maxDim: number): Promise<File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // si el navegador no puede decodificarla, sube el original
  }

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // PNG/WebP pueden tener transparencia → salida WebP (la conserva y pesa poco).
  // El resto → JPEG.
  const keepsAlpha = file.type === "image/png" || file.type === "image/webp";
  const outType = keepsAlpha ? "image/webp" : "image/jpeg";

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, outType, 0.82));
  if (!blob || blob.size >= file.size) return file; // no mejoró: deja el original

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const ext = outType === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${baseName}.${ext}`, { type: outType });
}

export default function ImageUploadPreview({ name, accept = "image/*", multiple = false, label = "Seleccionar archivo", variant = "photo", maxItems, existingCount = 0 }: ImageUploadPreviewProps) {
  const [items, setItems] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const remaining = maxItems === undefined ? Infinity : maxItems - existingCount - items.length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const all = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (all.length === 0) return;

    setError("");

    // Solo imágenes.
    const images = all.filter((f) => f.type.startsWith("image/"));
    if (images.length < all.length) {
      setError("Solo se permiten imágenes.");
    }

    // Respeta el límite de cantidad.
    let toUpload = images;
    if (remaining !== Infinity && images.length > remaining) {
      toUpload = images.slice(0, Math.max(0, remaining));
      setError(`Máximo ${maxItems} imágenes.`);
    }
    if (toUpload.length === 0) return;

    setUploading(true);
    const maxDim = variant === "logo" ? 512 : 1600;
    try {
      const uploaded: string[] = [];
      for (const original of toUpload) {
        const file = await compressImage(original, maxDim);
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/blob/simple-upload", { method: "POST", body });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "No se pudo subir la imagen.");
        }
        const data = await res.json();
        uploaded.push(data.url as string);
      }
      // Logo / imagen única: reemplaza. Múltiple: acumula.
      setItems((prev) => (multiple ? [...prev, ...uploaded] : uploaded));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la imagen.");
    }
    setUploading(false);
  };

  const limitReached = remaining !== Infinity && remaining <= 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <label className={`upload-zone${uploading || limitReached ? " is-disabled" : ""}`}>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={uploading || limitReached}
        />
        <span className="upload-zone__icon">{uploading ? "⏳" : "📤"}</span>
        <span className="upload-zone__title">{uploading ? "Subiendo…" : label}</span>
        <span className="upload-zone__hint">Toca para elegir desde tu dispositivo</span>
      </label>

      {uploading && <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Subiendo…</p>}
      {limitReached && !uploading && (
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Llegaste al máximo de {maxItems} imágenes.</p>
      )}
      {error && <p style={{ fontSize: "0.8rem", color: "var(--accent-danger)" }}>{error}</p>}

      {/* Inputs ocultos: llevan las URLs ya subidas al formulario (server action). */}
      {items.map((url, idx) => (
        <input key={`${name}-${idx}`} type="hidden" name={name} value={url} />
      ))}

      {items.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          {items.map((url, idx) => (
            <div key={idx} style={{ width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Vista previa ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
