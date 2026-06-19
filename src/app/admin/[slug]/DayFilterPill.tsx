"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const DAYS_FULL  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const DAYS_SHORT = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export default function DayFilterPill({
  selectedDay,
  statsDay,
  selectedMes,
  selectedYear,
  todayNum,
  isCurrentMonth,
}: {
  selectedDay: number | null;  // null = no param (uses today / last day)
  statsDay: number;            // resolved day being shown
  selectedMes: number;
  selectedYear: number;
  todayNum: number;
  isCurrentMonth: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router  = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function choose(day: number | null) {
    setOpen(false);
    const params = new URLSearchParams({ mes: String(selectedMes) });
    if (day !== null) params.set("dia", String(day));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // ── Pill label ──────────────────────────────────────────────────────────
  const showHoy = selectedDay === null && isCurrentMonth;
  const pillLabel = showHoy
    ? "Hoy"
    : `${DAYS_SHORT[new Date(selectedYear, selectedMes - 1, statsDay).getDay()]} ${statsDay}`;

  // ── Dropdown options (most recent first) ────────────────────────────────
  const daysInMonth = new Date(selectedYear, selectedMes, 0).getDate();
  const maxDay = isCurrentMonth ? todayNum : daysInMonth;

  const options: Array<{ day: number | null; label: string }> = [];
  if (isCurrentMonth) {
    options.push({ day: null, label: "Hoy" });
  }
  for (let d = maxDay; d >= 1; d--) {
    if (isCurrentMonth && d === todayNum) continue; // already "Hoy"
    const date = new Date(selectedYear, selectedMes - 1, d);
    options.push({ day: d, label: `${DAYS_FULL[date.getDay()]} ${d}` });
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 14px",
          borderRadius: "999px",
          border: "1px solid var(--border-color)",
          backgroundColor: "rgba(255,255,255,0.06)",
          color: "var(--text-primary)",
          fontSize: "0.82rem",
          fontWeight: 700,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          outline: "none",
        }}
      >
        {pillLabel}
        <span aria-hidden style={{ fontSize: "0.6rem", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          zIndex: 200,
          width: "190px",
          maxHeight: "280px",
          overflowY: "auto",
          backgroundColor: "var(--bg-tertiary, #1f1f1f)",
          border: "1px solid var(--border-color)",
          borderRadius: "10px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          padding: "4px",
        }}>
          {options.map(({ day, label }) => {
            const isActive = day === null ? selectedDay === null : day === selectedDay;
            return (
              <button
                key={day ?? "hoy"}
                type="button"
                onClick={() => choose(day)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "rgba(230,57,70,0.15)" : "transparent",
                  color: isActive ? "#E63946" : "var(--text-primary)",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 700 : 500,
                  textAlign: "left",
                  WebkitTapHighlightColor: "transparent",
                  outline: "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
