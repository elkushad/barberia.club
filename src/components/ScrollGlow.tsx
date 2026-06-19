"use client";

import { useEffect } from "react";

/**
 * Si la URL llega con el hash indicado, hace scroll suave al elemento `targetId`
 * y lo resalta con un brillo de ~2 segundos. Pensado para los CTA promocionales
 * que redirigen a /mi-plan#sube-pro.
 */
export default function ScrollGlow({ targetId, hash = "#sube-pro" }: { targetId: string; hash?: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== hash) return;

    const el = document.getElementById(targetId);
    if (!el) return;

    const t = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.animate(
        [
          { boxShadow: "0 0 0 rgba(230,57,70,0)" },
          { boxShadow: "0 0 34px rgba(230,57,70,0.85)" },
          { boxShadow: "0 0 0 rgba(230,57,70,0)" },
        ],
        { duration: 1000, iterations: 2, easing: "ease-in-out" }
      );
    }, 250);

    return () => clearTimeout(t);
  }, [targetId, hash]);

  return null;
}
