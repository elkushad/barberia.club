"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

interface ImageUploadPreviewProps {
  name: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ImageUploadPreview({ name, accept = "image/*", multiple = false, className, style }: ImageUploadPreviewProps) {
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
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Timeout por INACTIVIDAD: se reinicia mientras el progreso avance,
        // así una subida lenta pero constante termina; solo se cancela si se
        // traba de verdad (sin avance por 30s).
        const controller = new AbortController();
        let stall: ReturnType<typeof setTimeout>;
        const resetStall = () => {
          clearTimeout(stall);
          stall = setTimeout(() => controller.abort(), 30_000);
        };
        resetStall();
        try {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/blob/upload",
            multipart: true, // parte el archivo, sube en paralelo y reintenta trozos
            abortSignal: controller.signal,
            onUploadProgress: (p) => {
              setProgress(Math.round(p.percentage));
              resetStall();
            },
          });
          uploaded.push({ url: blob.url, isVideo: file.type.startsWith("video/") });
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
