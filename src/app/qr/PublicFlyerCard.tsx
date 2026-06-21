"use client";

import { useState } from "react";
import Link from "next/link";
import type { FlyerTemplate } from "@/lib/flyer-templates";

type State = "idle" | "locking" | "popup";

export default function PublicFlyerCard({ template }: { template: FlyerTemplate }) {
  const [state, setState] = useState<State>("idle");

  const handleQrClick = () => {
    if (state !== "idle") return;
    setState("locking");
    setTimeout(() => setState("popup"), 1000);
  };

  const closePopup = () => setState("idle");

  const qrLeftPct = (template.qr.x / template.width) * 100;
  const qrTopPct = (template.qr.y / template.height) * 100;
  const qrSizePct = (template.qr.size / template.width) * 100;

  const cap = template.caption;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Flyer + QR placeholder */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "320px",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.src}
          alt={template.label}
          style={{ width: "100%", display: "block" }}
        />

        {/* QR placeholder box */}
        <div
          onClick={handleQrClick}
          style={{
            position: "absolute",
            left: `${qrLeftPct}%`,
            top: `${qrTopPct}%`,
            width: `${qrSizePct}%`,
            paddingBottom: `${qrSizePct}%`,
            cursor: "pointer",
            backgroundColor: "white",
          }}
        >
          {/* Text overlay inside the white box */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "6%",
              textAlign: "center",
              backgroundColor: "white",
              color: "#111",
            }}
          >
            <div
              style={{
                fontSize: "clamp(0.35rem, 2.2cqw, 0.7rem)",
                fontWeight: 800,
                letterSpacing: "0.02em",
                lineHeight: 1.15,
                marginBottom: "4%",
                containerType: "inline-size",
              }}
            >
              AQUÍ SE MOSTRARÁ TU QR
            </div>
            <div
              style={{
                fontSize: "clamp(0.25rem, 1.5cqw, 0.52rem)",
                color: "#555",
                lineHeight: 1.3,
              }}
            >
              Registra tu barbería y automáticamente se creará tu QR único.
            </div>
          </div>

          {/* Lock overlay (1s animation) */}
          {state === "locking" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.88)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "fadeInLock 0.15s ease",
              }}
            >
              <svg
                width="36%"
                height="36%"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(160,160,160,0.9)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}
        </div>

        {/* Barra con el link público (ejemplo) debajo del QR */}
        {cap && (
          <div
            style={{
              position: "absolute",
              left: `${(cap.x / template.width) * 100}%`,
              top: `${(cap.y / template.height) * 100}%`,
              width: `${(cap.width / template.width) * 100}%`,
              height: `${(cap.height / template.height) * 100}%`,
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
            <span style={{ color: "#444", fontSize: "2.7cqw", fontWeight: 500 }}>
              O ingresa a la página de esta barbería:
            </span>
            <span style={{ color: "#000", fontSize: "3cqw", fontWeight: 700 }}>
              barberia.club/tu-barbería
            </span>
          </div>
        )}
      </div>

      <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--text-secondary, #94a3b8)", fontWeight: 500 }}>
        {template.label}
        {template.pro && (
          <span
            style={{
              marginLeft: "6px",
              fontSize: "0.7rem",
              backgroundColor: "rgba(255,51,102,0.15)",
              color: "var(--saas-red, #ff3366)",
              padding: "2px 7px",
              borderRadius: "999px",
              fontWeight: 700,
            }}
          >
            PRO
          </span>
        )}
      </p>

      {/* Popup */}
      {state === "popup" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={closePopup}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-secondary, #141820)",
              borderRadius: "16px",
              padding: "2.25rem 2rem",
              maxWidth: "380px",
              width: "100%",
              textAlign: "center",
              border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Lock icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(160,160,160,0.85)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h3 style={{ fontSize: "1.15rem", marginBottom: "0.5rem", lineHeight: 1.3 }}>
              Tu QR se genera al registrar tu barbería
            </h3>
            <p
              style={{
                color: "var(--saas-text-muted, #94a3b8)",
                fontSize: "0.88rem",
                marginBottom: "1.5rem",
                lineHeight: 1.5,
              }}
            >
              Crea tu cuenta gratis y en segundos tendrás tu QR único listo para imprimir.
            </p>
            <Link
              href="/register"
              className="saas-btn-primary"
              style={{
                display: "inline-block",
                padding: "0.8rem 1.75rem",
                fontSize: "0.95rem",
                textDecoration: "none",
              }}
            >
              Registrar mi barbería GRATIS
            </Link>
            <button
              onClick={closePopup}
              style={{
                display: "block",
                margin: "1rem auto 0",
                background: "none",
                border: "none",
                color: "var(--text-secondary, #94a3b8)",
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInLock {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
