"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

interface BannerUploadProps {
  name: string;
  existingImages: number;
  existingVideos: number;
}

const MAX_TOTAL = 5;
const MAX_VIDEOS = 2;
const MAX_VIDEO_SECONDS = 4;

// ── Imágenes: comprime con canvas (1600px, q0.82) ──────────────────────────
async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
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
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.82));
  if (!blob || blob.size >= file.size) return file;
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

// ── Videos: lee duración y recodifica a webm más liviano (best-effort) ─────
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const d = v.duration;
      URL.revokeObjectURL(v.src);
      resolve(d);
    };
    v.onerror = () => reject(new Error("No se pudo leer el video."));
    v.src = URL.createObjectURL(file);
  });
}

// Recodifica el video a 720px máx y bitrate bajo usando canvas + MediaRecorder.
// Si el navegador no lo soporta (p. ej. algunos iOS), devuelve el original.
async function compressVideo(file: File): Promise<File> {
  try {
    const canRecord =
      typeof MediaRecorder !== "undefined" &&
      typeof HTMLCanvasElement.prototype.captureStream === "function" &&
      MediaRecorder.isTypeSupported("video/webm");
    if (!canRecord) return file;

    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    await new Promise<void>((res, rej) => {
      video.onloadedmetadata = () => res();
      video.onerror = () => rej(new Error("metadata"));
    });

    const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.round(video.videoWidth * scale) || video.videoWidth;
    const h = Math.round(video.videoHeight * scale) || video.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    const stream = canvas.captureStream(30);
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1_200_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    const done = new Promise<Blob>((res) => {
      recorder.onstop = () => res(new Blob(chunks, { type: "video/webm" }));
    });

    recorder.start();
    await video.play();
    await new Promise<void>((res) => {
      const draw = () => {
        if (video.ended || video.paused) {
          res();
          return;
        }
        ctx.drawImage(video, 0, 0, w, h);
        requestAnimationFrame(draw);
      };
      video.onended = () => res();
      draw();
    });
    recorder.stop();
    const blob = await done;
    URL.revokeObjectURL(video.src);

    if (!blob || blob.size === 0 || blob.size >= file.size) return file;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.webm`, { type: "video/webm" });
  } catch {
    return file; // cualquier fallo → sube el original
  }
}

// ── Subidas ────────────────────────────────────────────────────────────────
async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/blob/simple-upload", { method: "POST", body });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "No se pudo subir la imagen.");
  }
  return (await res.json()).url as string;
}

async function uploadVideo(file: File, onProgress: (pct: number) => void): Promise<string> {
  // Cliente→Blob (maneja archivos grandes). Timeout por inactividad.
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
      abortSignal: controller.signal,
      onUploadProgress: (p) => {
        onProgress(Math.round(p.percentage));
        resetStall();
      },
    });
    return blob.url;
  } finally {
    clearTimeout(stall);
  }
}

export default function BannerUpload({ name, existingImages, existingVideos }: BannerUploadProps) {
  const [items, setItems] = useState<{ url: string; isVideo: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const sessionVideos = items.filter((i) => i.isVideo).length;
  const total = existingImages + existingVideos + items.length;
  const videos = existingVideos + sessionVideos;
  const full = total >= MAX_TOTAL;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const all = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (all.length === 0) return;
    setError("");

    // Filtra respetando los límites (total 5, videos 2).
    let curTotal = total;
    let curVideos = videos;
    const accepted: File[] = [];
    let msg = "";
    for (const f of all) {
      const isVid = f.type.startsWith("video/");
      const isImg = f.type.startsWith("image/");
      if (!isVid && !isImg) {
        msg = "Solo se permiten imágenes o videos.";
        continue;
      }
      if (curTotal >= MAX_TOTAL) {
        msg = `Máximo ${MAX_TOTAL} fondos en total.`;
        break;
      }
      if (isVid && curVideos >= MAX_VIDEOS) {
        msg = `Máximo ${MAX_VIDEOS} videos.`;
        continue;
      }
      accepted.push(f);
      curTotal++;
      if (isVid) curVideos++;
    }
    if (msg) setError(msg);
    if (accepted.length === 0) return;

    setUploading(true);
    try {
      const newItems: { url: string; isVideo: boolean }[] = [];
      for (const f of accepted) {
        if (f.type.startsWith("video/")) {
          setStatus("Revisando video…");
          const dur = await getVideoDuration(f);
          if (dur > MAX_VIDEO_SECONDS + 0.3) {
            throw new Error(`Los videos deben durar máximo ${MAX_VIDEO_SECONDS} segundos.`);
          }
          setStatus("Optimizando video…");
          const compressed = await compressVideo(f);
          setStatus("Subiendo video…");
          const url = await uploadVideo(compressed, (pct) => setStatus(`Subiendo video… ${pct}%`));
          newItems.push({ url, isVideo: true });
        } else {
          setStatus("Subiendo imagen…");
          const compressed = await compressImage(f);
          const url = await uploadImage(compressed);
          newItems.push({ url, isVideo: false });
        }
      }
      setItems((prev) => [...prev, ...newItems]);
    } catch (err) {
      if (err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.message))) {
        setError("La subida del video tardó demasiado y se canceló. Revisa tu conexión.");
      } else {
        setError(err instanceof Error ? err.message : "No se pudo subir el archivo.");
      }
    }
    setUploading(false);
    setStatus("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        className="premium-input"
        style={{ padding: "8px" }}
        onChange={handleFileChange}
        disabled={uploading || full}
      />

      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
        Hasta {MAX_TOTAL} fondos en total (máx. {MAX_VIDEOS} videos de {MAX_VIDEO_SECONDS}s). Llevas {total}/{MAX_TOTAL}
        {videos > 0 ? ` · ${videos}/${MAX_VIDEOS} videos` : ""}.
      </p>

      {uploading && <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{status || "Subiendo…"}</p>}
      {full && !uploading && (
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Llegaste al máximo de {MAX_TOTAL} fondos.</p>
      )}
      {error && <p style={{ fontSize: "0.8rem", color: "var(--accent-danger)" }}>{error}</p>}

      {/* URLs subidas en esta sesión → al formulario (server action). */}
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
