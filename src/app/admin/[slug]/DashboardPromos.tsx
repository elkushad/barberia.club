"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const VISITS_KEY = "bcPromoVisits";
const DISMISS_KEY = "bcPromoDismissed";

type PromoType = "pro" | "ref";

const PRO_FEATURES = [
  "Clientes ilimitados",
  "Personalización de página",
  "Acceso al programa de referidos",
  "Hasta 10 recompensas",
  "Historial completo",
  "Mensajes automáticos por WhatsApp",
];

const REF_FEATURES = [
  "S/10 por barbería referida",
  "Sin límite de ganancias",
  "Retira tus ganancias acumuladas",
];

const CSS = `
.bcp-overlay{position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;padding:1rem;background:rgba(0,0,0,.8);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);animation:bcpFade .25s ease}
.bcp-overlay[data-closing="true"]{animation:bcpFadeOut .25s ease forwards}
.bcp-wrap{width:100%;max-width:380px;animation:bcpIn .4s cubic-bezier(.2,.85,.25,1)}
.bcp-wrap[data-closing="true"]{animation:bcpOut .25s ease forwards}
.bcp-card{position:relative;border-radius:22px;padding:1.6rem 1.35rem;overflow:hidden;text-align:center;background:radial-gradient(125% 85% at 50% 0%, #121821 0%, #06080c 70%)}
.bcp-card.pro{border:1px solid rgba(56,189,248,.4);box-shadow:0 0 45px rgba(56,189,248,.2),inset 0 0 32px rgba(56,189,248,.05);animation:bcpGlowPro 3.5s ease-in-out infinite}
.bcp-card.ref{border:1px solid rgba(230,57,70,.45);box-shadow:0 0 45px rgba(230,57,70,.22),inset 0 0 32px rgba(59,130,246,.06);animation:bcpGlowRef 3.5s ease-in-out infinite}
.bcp-close{position:absolute;top:12px;right:14px;background:none;border:none;color:rgba(255,255,255,.55);font-size:1.25rem;line-height:1;cursor:pointer;z-index:3;-webkit-tap-highlight-color:transparent}
.bcp-badge{display:inline-flex;align-items:center;gap:6px;font-size:.6rem;font-weight:800;letter-spacing:.09em;color:#cbd5e1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.16);padding:5px 13px;border-radius:999px;margin-bottom:1rem}
.bcp-h1{font-size:1.4rem;font-weight:900;line-height:1.06;color:#fff;margin:0}
.bcp-sky{color:#38bdf8;font-weight:800;letter-spacing:.06em;font-size:.92rem;margin:0 0 .35rem;text-shadow:0 0 14px rgba(56,189,248,.6)}
.bcp-pill{display:inline-block;border:2px solid #38bdf8;color:#38bdf8;font-weight:800;font-size:.95rem;padding:7px 20px;border-radius:999px;margin:.9rem 0;text-shadow:0 0 10px rgba(56,189,248,.7);box-shadow:0 0 18px rgba(56,189,248,.35),inset 0 0 14px rgba(56,189,248,.12)}
.bcp-grid{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin:.25rem 0 1.1rem}
.bcp-feat{display:flex;align-items:center;gap:7px;text-align:left;font-size:.71rem;color:#e2e8f0;background:rgba(255,255,255,.03);border:1px solid rgba(56,189,248,.28);border-radius:10px;padding:8px 9px;transition:border-color .25s,box-shadow .25s,transform .15s}
.bcp-feat:hover{border-color:rgba(56,189,248,.7);box-shadow:0 0 16px rgba(56,189,248,.25);transform:translateY(-1px)}
.bcp-feat.ref{border-color:rgba(230,57,70,.3)}
.bcp-feat.ref:hover{border-color:rgba(230,57,70,.75);box-shadow:0 0 16px rgba(230,57,70,.3)}
.bcp-check{color:#38bdf8;font-weight:900;flex-shrink:0}
.bcp-price{font-size:1.15rem;font-weight:900;color:#fff;margin:.2rem 0 .15rem}
.bcp-muted{color:#94a3b8;font-size:.72rem;margin:0}
.bcp-cta{display:block;width:100%;margin-top:1.1rem;text-decoration:none;border-radius:14px;padding:2px;background:linear-gradient(90deg,#E63946,#3b82f6);transition:transform .15s}
.bcp-cta:hover{transform:translateY(-1px)}
.bcp-cta>span{display:block;background:#070a0e;border-radius:12px;padding:.9rem;color:#fff;font-weight:800;letter-spacing:.04em;font-size:.95rem}
.bcp-card.pro .bcp-cta{animation:bcpBlinkCyan 1.4s ease-in-out infinite}
.bcp-card.ref .bcp-cta{animation:bcpBlinkRed 1.4s ease-in-out infinite}
@keyframes bcpBlinkCyan{0%,100%{box-shadow:0 0 12px rgba(56,189,248,.35)}50%{box-shadow:0 0 32px rgba(56,189,248,.9)}}
@keyframes bcpBlinkRed{0%,100%{box-shadow:0 0 12px rgba(230,57,70,.4)}50%{box-shadow:0 0 32px rgba(230,57,70,.95)}}
.bcp-gana{font-size:2.6rem;font-weight:900;color:#fff;line-height:1;margin:.2rem 0 .3rem}
.bcp-gana b{color:#E63946;text-shadow:0 0 20px rgba(230,57,70,.75)}
.bcp-dismiss{display:block;margin:.85rem auto 0;background:none;border:none;color:rgba(255,255,255,.42);font-size:.72rem;cursor:pointer;text-decoration:underline;-webkit-tap-highlight-color:transparent}
@keyframes bcpFade{from{opacity:0}to{opacity:1}}
@keyframes bcpFadeOut{from{opacity:1}to{opacity:0}}
@keyframes bcpIn{from{opacity:0;transform:translateY(20px) scale(.93)}to{opacity:1;transform:none}}
@keyframes bcpOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(14px) scale(.96)}}
@keyframes bcpGlowPro{0%,100%{box-shadow:0 0 45px rgba(56,189,248,.18),inset 0 0 32px rgba(56,189,248,.05)}50%{box-shadow:0 0 62px rgba(56,189,248,.32),inset 0 0 32px rgba(56,189,248,.08)}}
@keyframes bcpGlowRef{0%,100%{box-shadow:0 0 45px rgba(230,57,70,.2),inset 0 0 32px rgba(59,130,246,.06)}50%{box-shadow:0 0 62px rgba(230,57,70,.34),inset 0 0 32px rgba(59,130,246,.1)}}
`;

export default function DashboardPromos({ isPro, slug, preview = false }: { isPro: boolean; slug: string; preview?: boolean }) {
  const [active, setActive] = useState<PromoType | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Modo preview (cuentas de prueba): cada recarga alterna pro / ref, ignorando
    // la cadencia normal y la preferencia "No volver a mostrar".
    if (preview) {
      const p = (parseInt(localStorage.getItem("bcPromoPreview") || "0", 10) || 0) + 1;
      localStorage.setItem("bcPromoPreview", String(p));
      const show: PromoType = p % 2 === 1 ? "pro" : "ref";
      const t = setTimeout(() => setActive(show), 400);
      return () => clearTimeout(t);
    }

    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    const n = (parseInt(localStorage.getItem(VISITS_KEY) || "0", 10) || 0) + 1;
    localStorage.setItem(VISITS_KEY, String(n));

    let show: PromoType | null = null;
    if (isPro) {
      if (n % 5 === 0) show = "ref"; // Pro: solo referidos, cada 5
    } else if (n % 3 === 0) {
      // Free: cada 3, alternando pro / ref / pro / ref...
      show = (n / 3) % 2 === 1 ? "pro" : "ref";
    }
    if (show) {
      const t = setTimeout(() => setActive(show), 650);
      return () => clearTimeout(t);
    }
  }, [isPro, preview]);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setActive(null);
      setClosing(false);
    }, 250);
  }

  function dismissForever() {
    localStorage.setItem(DISMISS_KEY, "1");
    close();
  }

  if (!active) return null;

  return (
    <div className="bcp-overlay" data-closing={closing} onClick={close}>
      <style>{CSS}</style>
      <div className="bcp-wrap" data-closing={closing} onClick={(e) => e.stopPropagation()}>
        {active === "pro" ? <ProCard slug={slug} /> : <RefCard pro={isPro} slug={slug} />}
        <button className="bcp-dismiss" onClick={dismissForever}>No volver a mostrar</button>
      </div>
    </div>
  );

  function CloseBtn() {
    return (
      <button className="bcp-close" aria-label="Cerrar" onClick={close}>
        ✕
      </button>
    );
  }

  function ProCard({ slug }: { slug: string }) {
    return (
      <div className="bcp-card pro">
        <CloseBtn />
        <span className="bcp-badge">🔥 SOLO PARA BARBERÍAS</span>
        <p className="bcp-sky">ACTIVA PLAN PRO</p>
        <h3 className="bcp-h1">LLEVA TU BARBERÍA AL SIGUIENTE NIVEL</h3>
        <div className="bcp-pill">7 DÍAS GRATIS</div>
        <div className="bcp-grid">
          {PRO_FEATURES.map((f) => (
            <span key={f} className="bcp-feat">
              <span className="bcp-check">✓</span>
              {f}
            </span>
          ))}
        </div>
        <p className="bcp-price">SOLO S/29.90 AL MES</p>
        <p className="bcp-muted">Pago seguro con Mercado Pago 💳</p>
        <Link href={`/admin/${slug}/mi-plan#sube-pro`} className="bcp-cta" onClick={close}>
          <span>PROBAR 7 DÍAS GRATIS</span>
        </Link>
      </div>
    );
  }

  function RefCard({ pro, slug }: { pro: boolean; slug: string }) {
    return (
      <div className="bcp-card ref">
        <CloseBtn />
        <span className="bcp-badge">{pro ? "💈 TU PROGRAMA DE REFERIDOS" : "🔒 EXCLUSIVO PARA USUARIOS PRO"}</span>
        <p className="bcp-gana">
          GANA <b>S/10</b>
        </p>
        <h3 className="bcp-h1" style={{ fontSize: "1.05rem", letterSpacing: "0.02em" }}>POR CADA BARBERÍA REFERIDA</h3>
        <p className="bcp-muted" style={{ margin: "0.6rem 0 1rem", lineHeight: 1.45 }}>
          {pro
            ? "Comparte tu enlace y genera ingresos invitando a otras barberías."
            : "Recomienda Barbería.club y empieza a generar ingresos invitando a otras barberías."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", marginBottom: "1rem" }}>
          {REF_FEATURES.map((f) => (
            <span key={f} className="bcp-feat ref" style={{ justifyContent: "center", textAlign: "center" }}>
              <span style={{ flexShrink: 0 }}>💸</span>
              {f}
            </span>
          ))}
        </div>
        {pro ? (
          <Link href={`/admin/${slug}/referidos`} className="bcp-cta" onClick={close}>
            <span>IR A MIS REFERIDOS</span>
          </Link>
        ) : (
          <>
            <p className="bcp-muted" style={{ marginBottom: "0.4rem" }}>Activa Pro y desbloquea el programa de referidos</p>
            <Link href={`/admin/${slug}/mi-plan#sube-pro`} className="bcp-cta" onClick={close}>
              <span>DESBLOQUEAR REFERIDOS</span>
            </Link>
          </>
        )}
      </div>
    );
  }
}
