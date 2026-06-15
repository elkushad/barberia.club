"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

interface ImageUploadPreviewProps {
  name: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
  style?: React.CSSProperties;
  // "logo": pequeño y nítido, conserva transparencia. "photo": fondos/galería.
  variant?: "logo" | "photo";
}

// Tope de tamaño para videos (no se comprimen en el navegador).
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

// Comprime imágenes en el navegador antes de subir: redimensiona al lado mayor
// indicado y reencoda. Reduce mucho los MB (una foto de móvil 6-8 MB → ~200 KB)
// sin pérdida visible. No toca GIF/SVG ni videos, y si no mejora deja el original.
async function compressImage(file: File, maxDim: number): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
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

export default function ImageUploadPreview({ name, accept = "image/*", multiple = false, className, style, variant = "photo" }: ImageUploadPreviewProps) {
  const [items, setItems] = useState<{ url: string; isVideo: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const uploaded: { url: string; isVideo: boolean }[] = [];
      const maxDim = variant === "logo" ? 512 : 1600;
      for (let i = 0; i < files.length; i++) {
        const original = files[i];
        const isVideo = original.type.startsWith("video/");

        if (isVideo && original.size > MAX_VIDEO_BYTES) {
          throw new Error("El video supera los 50 MB. Súbelo más liviano o comprímelo antes.");
        }

        // Las imágenes se comprimen en el navegador; videos van tal cual.
        const file = isVideo ? original : await compressImage(original, maxDim);

        // Timeout por INACTIVIDAD: se reinicia mientras el progreso avance,
        // así una subida lenta pero constante termina; solo se cancela si se
        // traba de verdad (sin avance por 30s).
        const controller = new AbortController();
        let stall: ReturnType<typeof setTimeout> | undefined;
        const resetStall = () => {
          clearTimeout(stall);
          stall = setTimeout(() => controller.abort(), 30_000);
        };
        resetStall();
        try {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/blob/upload",
            // PUT simple (sin multipart): es el camino que sí reportaba progreso.
            // Multipart hacía varias peticiones y se trababa en 0% con archivos chicos.
            abortSignal: controller.signal,
            onUploadProgress: (p) => {
              setProgress(Math.round(p.percentage));
              resetStall();
            },
          });
          uploaded.push({ url: blob.url, isVideo });
        } finally {
          clearTimeout(stall);
        }
      }
      // Logo (single): reemplaza. Fondos (multiple): acumula.
      setItems((prev) => (multiple ? [...prev, ...uploaded] : uploaded));
    } catch (err) {
      if (err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.message))) {
        setError("La subida tardó demasiado y se canceló. Revisa tu conexión e inténtalo de nuevo.");
      } else {
        setError(err instanceof Error ? `Error al subir: ${err.message}` : "No se pudo subir el archivo.");
      }
    }

    setUploading(false);
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className={className}
        style={style}
        onChange={handleFileChange}
        disabled={uploading}
      />

      {uploading && <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Subiendo… {progress}%</p>}
      {error && <p style={{ fontSize: "0.8rem", color: "var(--accent-danger)" }}>{error}</p>}

      {/* Inputs ocultos: llevan las URLs ya subidas al formulario (server action). */}
      {items.map((item, idx) => (
        <input key={`${name}-${idx}`} type="hidden" name={name} value={item.url} />
      ))}

      {items.length > 0 && (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ width: "100px", height: "100px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              {item.isVideo ? (
                <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={`Vista previa ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
