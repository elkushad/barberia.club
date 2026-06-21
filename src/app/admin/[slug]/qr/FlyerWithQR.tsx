"use client";

import { useState, useTransition } from "react";
import { FLYER_TEMPLATES, getFlyerTemplate, type FlyerTemplateId } from "@/lib/flyer-templates";
import ProLock from "@/components/ProLock";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const CAPTION_LABEL = "O ingresa a:";

export default function FlyerWithQR({
  qrDataUrl,
  slug,
  landingDisplay,
  initialTemplate,
  onSaveTemplate,
  isPro = true,
}: {
  qrDataUrl: string;
  slug: string;
  landingDisplay: string; // link público sin protocolo, ej. "barberia.club/mi-barberia"
  initialTemplate: FlyerTemplateId;
  onSaveTemplate: (templateId: string) => Promise<void>;
  isPro?: boolean;
}) {
  // Si el usuario es Free pero tenía guardada una plantilla PRO, arranca en una libre.
  const safeInitial: FlyerTemplateId = getFlyerTemplate(initialTemplate).pro && !isPro ? "flyer" : initialTemplate;
  const [selected, setSelected] = useState<FlyerTemplateId>(safeInitial);
  const [saved, setSaved] = useState<FlyerTemplateId>(safeInitial);
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

      // Link en la barra blanca horizontal debajo del QR: una sola línea
      // "<etiqueta> <link>" centrada y ajustada al ancho de la barra.
      if (tpl.caption) {
        const c = tpl.caption;
        const cy = c.y + c.height / 2;
        const label = CAPTION_LABEL + " ";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";

        const totalWidth = (size: number) => {
          ctx.font = `500 ${size}px Arial, sans-serif`;
          const wl = ctx.measureText(label).width;
          ctx.font = `bold ${size}px Arial, sans-serif`;
          return wl + ctx.measureText(landingDisplay).width;
        };

        // Tamaño máximo que entra en la barra (por ancho y alto).
        let fontSize = Math.round(c.height * 0.62);
        while (totalWidth(fontSize) > c.width - 16 && fontSize > 6) fontSize -= 1;

        let x = c.x + (c.width - totalWidth(fontSize)) / 2;
        ctx.fillStyle = "#444444";
        ctx.font = `500 ${fontSize}px Arial, sans-serif`;
        ctx.fillText(label, x, cy);
        x += ctx.measureText(label).width;
        ctx.fillStyle = "#000000";
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillText(landingDisplay, x, cy);
      }

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
        {tpl.caption && (
          <div
            style={{
              position: "absolute",
              left: `${(tpl.caption.x / tpl.width) * 100}%`,
              top: `${(tpl.caption.y / tpl.height) * 100}%`,
              width: `${(tpl.caption.width / tpl.width) * 100}%`,
              height: `${(tpl.caption.height / tpl.height) * 100}%`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.3em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              lineHeight: 1,
              containerType: "inline-size",
            }}
          >
            <span style={{ color: "#444", fontSize: "3.4cqw", fontWeight: 500 }}>{CAPTION_LABEL}</span>
            <span style={{ color: "#000", fontSize: "4cqw", fontWeight: 700 }}>{landingDisplay}</span>
          </div>
        )}
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
            const locked = t.pro && !isPro;

            const inner = (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem",
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
              </div>
            );

            if (locked) {
              return (
                <ProLock key={t.id} locked slug={slug} radius={10}>
                  {inner}
                </ProLock>
              );
            }
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t.id)}
                aria-pressed={active}
                style={{ padding: 0, border: "none", background: "transparent", cursor: "pointer", WebkitTapHighlightColor: "transparent", outline: "none" }}
              >
                {inner}
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
