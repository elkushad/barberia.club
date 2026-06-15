"use client";

import { useState, type CSSProperties } from "react";

// Dimensiones reales del flyer (public/flyer.png).
const FLYER_W = 1054;
const FLYER_H = 1492;

// Posición/tamaño inicial del QR en px sobre el flyer.
const INIT_X = 548;
const INIT_Y = 1012;
const INIT_SIZE = 200;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const btn: CSSProperties = {
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  cursor: "pointer",
  fontSize: "0.85rem",
  minWidth: "40px",
};

export default function FlyerWithQR({ qrDataUrl, slug }: { qrDataUrl: string; slug: string }) {
  const [x, setX] = useState(INIT_X);
  const [y, setY] = useState(INIT_Y);
  const [size, setSize] = useState(INIT_SIZE);
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
      ctx.drawImage(qr, x, y, size, size);
      const link = document.createElement("a");
      link.download = `flyer-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setError("No se pudo generar el flyer.");
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
          style={{
            position: "absolute",
            left: `${(x / FLYER_W) * 100}%`,
            top: `${(y / FLYER_H) * 100}%`,
            width: `${(size / FLYER_W) * 100}%`,
            height: "auto",
          }}
        />
      </div>

      {/* Controles temporales para posicionar el QR */}
      <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px dashed var(--accent-primary)", borderRadius: "8px", width: "100%", maxWidth: "380px" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--accent-primary)", marginBottom: "0.25rem" }}>
          Acomoda el QR y pásame estos valores:
        </p>
        <p style={{ fontWeight: "bold", marginBottom: "0.75rem" }}>X: {x} · Y: {y} · Tamaño: {size}</p>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Mover (1 px)</p>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <button type="button" style={btn} onClick={() => setX((v) => v - 1)}>←</button>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <button type="button" style={btn} onClick={() => setY((v) => v - 1)}>↑</button>
                <button type="button" style={btn} onClick={() => setY((v) => v + 1)}>↓</button>
              </div>
              <button type="button" style={btn} onClick={() => setX((v) => v + 1)}>→</button>
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Saltos (10 px)</p>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "180px" }}>
              <button type="button" style={btn} onClick={() => setX((v) => v - 10)}>←10</button>
              <button type="button" style={btn} onClick={() => setX((v) => v + 10)}>→10</button>
              <button type="button" style={btn} onClick={() => setY((v) => v - 10)}>↑10</button>
              <button type="button" style={btn} onClick={() => setY((v) => v + 10)}>↓10</button>
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>Tamaño</p>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "180px" }}>
              <button type="button" style={btn} onClick={() => setSize((v) => v - 1)}>−1</button>
              <button type="button" style={btn} onClick={() => setSize((v) => v + 1)}>+1</button>
              <button type="button" style={btn} onClick={() => setSize((v) => v - 10)}>−10</button>
              <button type="button" style={btn} onClick={() => setSize((v) => v + 10)}>+10</button>
            </div>
          </div>
        </div>
      </div>

      <button onClick={download} disabled={downloading} className="premium-btn" style={{ marginTop: "1.5rem" }}>
        {downloading ? "Generando…" : "Descargar flyer completo"}
      </button>
      {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
