"use client";

import { useRef, useState } from "react";

export default function PendingApproveButton({
  isPro,
  customerId,
  approveAction,
}: {
  isPro: boolean;
  customerId: string;
  approveAction: (formData: FormData) => Promise<void>;
}) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (isPro) {
    return (
      <form action={approveAction}>
        <input type="hidden" name="id" value={customerId} />
        <button
          type="submit"
          className="premium-btn"
          style={{ padding: "8px 16px", backgroundColor: "var(--accent-success)" }}
        >
          Aprobar
        </button>
      </form>
    );
  }

  function handleClick() {
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 2500);
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleClick}
        className="premium-btn"
        style={{ padding: "8px 16px", backgroundColor: "var(--accent-success)" }}
      >
        Aprobar
      </button>

      {show && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(10,10,12,0.97)",
            border: "1px solid #E63946",
            borderRadius: "10px",
            padding: "0.5rem 0.85rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "white",
            whiteSpace: "nowrap",
            zIndex: 20,
            boxShadow: "0 0 16px rgba(230,57,70,0.35)",
            pointerEvents: "none",
          }}
        >
          Sube a{" "}
          <span style={{ color: "#E63946", fontWeight: 900 }}>PRO</span>{" "}
          para agregar clientes
        </div>
      )}
    </div>
  );
}
