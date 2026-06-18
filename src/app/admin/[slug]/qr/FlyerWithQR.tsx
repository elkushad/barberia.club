"use client";

import { useState, useTransition } from "react";
import { FLYER_TEMPLATES, getFlyerTemplate, type FlyerTemplateId } from "@/lib/flyer-templates";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function FlyerWithQR({
  qrDataUrl,
  slug,
  initialTemplate,
  onSaveTemplate,
}: {
  qrDataUrl: string;
  slug: string;
  initialTemplate: FlyerTemplateId;
  onSaveTemplate: (templateId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<FlyerTemplateId>(initialTemplate);
  const [saved, setSaved] = useState<FlyerTemplateId>(initialTemplate);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();

  const tpl = getFlyerTemplate(selected);
  const dirty = selected !== saved;

  const download = async () => {
    setDownloading(true);
    setError("");
    try {
      const [flyer, qr] = await Promise.all([loadImage(tpl.src), loadImage(qrDataUrl)]);
      const canvas = document.createElement("canvas");
      canvas.width = flyer.naturalWidth;
      canvas.height = flyer.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no ctx");
      ctx.drawImage(flyer, 0, 0);
      ctx.drawImage(qr, tpl.qr.x, tpl.qr.y, tpl.qr.size, tpl.qr.size);
      const link = document.createElement("a");
      link.download = `flyer-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setError("No se pudo generar el flyer.");
    }
    setDownloading(false);
  };

  const save = () => {
    setError("");
    startSaving(async () => {
      try {
        await onSaveTemplate(selected);
        setSaved(selected);
      } catch {
        setError("No se pudo guardar el diseño.");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Vista previa de la plantilla seleccionada con el QR superpuesto */}
      <div style={{ position: "relative", width: "100%", maxWidth: "380px", borderRadius: "8px", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={tpl.src} alt={`Flyer ${tpl.label}`} style={{ width: "100%", display: "block" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="Código QR"
          style={{
            position: "absolute",
            left: `${(tpl.qr.x / tpl.width) * 100}%`,
            top: `${(tpl.qr.y / tpl.height) * 100}%`,
            width: `${(tpl.qr.size / tpl.width) * 100}%`,
            height: "auto",
          }}
        />
      </div>

      <button onClick={download} disabled={downloading} className="premium-btn" style={{ marginTop: "1.5rem" }}>
        {downloading ? "Generando…" : "Descargar flyer completo"}
      </button>
      {error && <p style={{ color: "var(--accent-danger)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}

      {/* Selector de diseño: vista previa de las 3 plantillas */}
      <div style={{ width: "100%", marginTop: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
        <h4 style={{ marginBottom: "0.25rem", textAlign: "center" }}>Cambiar diseño del flyer</h4>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", textAlign: "center", marginBottom: "1rem" }}>
          Elige una plantilla y guarda. El QR y la personalización no cambian.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          {FLYER_TEMPLATES.map((t) => {
            const active = selected === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t.id)}
                aria-pressed={active}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem",
                  cursor: "pointer",
                  background: "transparent",
                  border: active ? "2px solid var(--accent-primary)" : "2px solid var(--border-color)",
                  borderRadius: "10px",
                  transition: "border-color 0.18s ease",
                }}
              >
                <div style={{ position: "relative", width: "100%", borderRadius: "6px", overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.src} alt={t.label} style={{ width: "100%", display: "block" }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt=""
                    style={{
                      position: "absolute",
                      left: `${(t.qr.x / t.width) * 100}%`,
                      top: `${(t.qr.y / t.height) * 100}%`,
                      width: `${(t.qr.size / t.width) * 100}%`,
                      height: "auto",
                    }}
                  />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: active ? 700 : 500, color: active ? "var(--accent-primary)" : "var(--text-secondary)" }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "1rem" }}>
          <button onClick={save} disabled={!dirty || isSaving} className="premium-btn" style={{ opacity: !dirty ? 0.6 : 1 }}>
            {isSaving ? "Guardando…" : dirty ? "Guardar diseño" : "Diseño guardado"}
          </button>
          {!dirty && !isSaving && (
            <p style={{ color: "var(--accent-success)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
              ✓ Esta es tu plantilla activa
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
