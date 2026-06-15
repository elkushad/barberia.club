"use client";

import { useState } from "react";

// Posición y tamaño del QR sobre el flyer, en % del ancho/alto. Ajustable.
const QR_LEFT_PCT = 53;
const QR_TOP_PCT = 64;
const QR_SIZE_PCT = 22;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function FlyerWithQR({ qrDataUrl, slug }: { qrDataUrl: string; slug: string }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setDownloading(true);
    setError("");
    try {
      const [flyer, qr] = await Promise.all([loadImage("/flyer.png"), loadImage(qrDataUrl)]);
      const canvas = document.createElement("canvas");
      canvas.width = flyer.naturalWidth;
      canvas.height = flyer.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no ctx");
      ctx.drawImage(flyer, 0, 0);
      const size = canvas.width * (QR_SIZE_PCT / 100);
      const x = canvas.width * (QR_LEFT_PCT / 100);
      const y = canvas.height * (QR_TOP_PCT / 100);
      ctx.drawImage(qr, x, y, size, size);
      const link = document.createElement("a");
      link.download = `flyer-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setError("No se pudo generar el flyer. Revisa que el archivo del flyer esté subido.");
    }
    setDownloading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: "380px", borderRadius: "8px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/flyer.png" alt="Flyer de barberia.club" style={{ width: "100%", display: "block" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="Código QR"
          style={{ position: "absolute", left: `${QR_LEFT_PCT}%`, top: `${QR_TOP_PCT}%`, width: `${QR_SIZE_PCT}%`, height: "auto" }}
        />
      </div>
      <button onClick={download} disabled={downloading} className="premium-btn" style={{ marginTop: "1.5rem" }}>
        {downloading ? "Generando…" : "Descargar flyer completo"}
      </button>
      {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
