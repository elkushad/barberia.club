"use client";

import { useEffect, useState } from "react";

export interface OpportunityRow {
  id: string;
  name: string;
  situation: string;
  waHref: string;
}

/**
 * Vista principal de Oportunidades.
 *
 * El switch "Seguimiento automático" solo cambia el MODO de envío: no elimina
 * oportunidades. Se recuerda por barbería en el navegador (localStorage). Cuando
 * está activo, el botón "Enviar WhatsApp" queda deshabilitado (con tooltip),
 * porque el envío lo haría barberia.club; cuando está inactivo, el barbero envía
 * personalmente con un toque, igual que en el resto de la plataforma.
 */
export default function OportunidadesClient({
  slug,
  rows,
}: {
  slug: string;
  rows: OpportunityRow[];
}) {
  const storageKey = `bc:auto-followup:${slug}`;
  const [autoFollow, setAutoFollow] = useState(false);

  // Leemos la preferencia tras el montaje (no en el render inicial) para evitar
  // un desajuste de hidratación: el servidor no conoce el localStorage del barbero.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAutoFollow(localStorage.getItem(storageKey) === "1");
    } catch {
      /* localStorage no disponible: se queda en modo manual */
    }
  }, [storageKey]);

  function toggle() {
    setAutoFollow((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        /* ignora si no se puede persistir */
      }
      return next;
    });
  }

  return (
    <>
      {/* ── Switch de seguimiento automático ── */}
      <div className="premium-card oppSwitchCard">
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <button
            type="button"
            role="switch"
            aria-checked={autoFollow}
            aria-label="Seguimiento automático por WhatsApp"
            onClick={toggle}
            className="oppSwitch"
            data-on={autoFollow ? "1" : "0"}
          >
            <span className="oppSwitchKnob" />
          </button>
          <span style={{ fontWeight: 600 }}>Seguimiento automático por WhatsApp</span>
        </div>

        <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            barberia.club enviará automáticamente mensajes de seguimiento cuando detecte una
            oportunidad para que un cliente regrese.
          </p>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            Si prefieres enviar los mensajes personalmente desde tu WhatsApp, desactiva esta opción.
          </p>
        </div>
      </div>

      {/* ── Tabla de oportunidades ── */}
      {rows.length === 0 ? (
        <div className="premium-card" style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
          <p style={{ fontSize: "1.05rem", marginBottom: "0.35rem" }}>Sin oportunidades por ahora ✅</p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
            Tus clientes están al día. Vuelve más tarde: aquí aparecerá a quién conviene escribirle.
          </p>
        </div>
      ) : (
        <div className="premium-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="oppTable">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Situación</th>
                <th style={{ textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Nombre" style={{ fontWeight: 600 }}>{row.name}</td>
                  <td data-label="Situación">{row.situation}</td>
                  <td data-label="Acción" className="oppActionCell">
                    {autoFollow ? (
                      <span className="oppTip" tabIndex={0}>
                        <button type="button" className="premium-btn-secondary oppSendBtn" disabled>
                          Enviar WhatsApp
                        </button>
                        <span className="oppTipText" role="tooltip">
                          El seguimiento automático está activado. Desactívalo si prefieres enviar
                          este mensaje personalmente.
                        </span>
                      </span>
                    ) : (
                      <a
                        href={row.waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="premium-btn-secondary oppSendBtn"
                      >
                        Enviar WhatsApp
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Estilos locales: toggle, tabla responsive (filas → tarjetas en móvil) y tooltip. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .oppSwitchCard { margin-bottom: 1.5rem; }

        /* Toggle */
        .oppSwitch {
          position: relative; width: 44px; height: 26px; flex-shrink: 0;
          border-radius: 9999px; border: 1px solid var(--border-color);
          background: var(--bg-tertiary); cursor: pointer; padding: 0;
          transition: background .2s ease, border-color .2s ease;
        }
        .oppSwitch[data-on="1"] { background: var(--accent-primary); border-color: var(--accent-primary); }
        .oppSwitchKnob {
          position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
          border-radius: 50%; background: #fff; transition: transform .2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,.4);
        }
        .oppSwitch[data-on="1"] .oppSwitchKnob { transform: translateX(18px); }

        /* Tabla */
        .oppTable { width: 100%; border-collapse: collapse; text-align: left; }
        .oppTable thead tr { background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); }
        .oppTable th {
          padding: 0.9rem 1rem; font-size: 0.75rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: .5px; color: var(--text-secondary);
        }
        .oppTable td { padding: 0.9rem 1rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
        .oppTable tbody tr:last-child td { border-bottom: none; }
        .oppActionCell { text-align: right; white-space: nowrap; }
        .oppSendBtn { padding: 8px 14px; font-size: 0.8rem; border-radius: 8px; }
        button.oppSendBtn:disabled { opacity: .5; cursor: not-allowed; }

        /* Tooltip */
        .oppTip { position: relative; display: inline-block; outline: none; }
        .oppTipText {
          visibility: hidden; opacity: 0; position: absolute; right: 0; bottom: calc(100% + 8px);
          width: 240px; background: rgba(15,15,15,.98); color: var(--text-primary);
          border: 1px solid var(--border-color); border-radius: 8px; padding: 0.6rem 0.7rem;
          font-size: 0.75rem; line-height: 1.45; text-align: left; white-space: normal;
          box-shadow: 0 8px 30px rgba(0,0,0,.5); z-index: 40; transition: opacity .15s ease;
        }
        .oppTip:hover .oppTipText, .oppTip:focus-within .oppTipText { visibility: visible; opacity: 1; }

        /* Móvil: filas → tarjetas */
        @media (max-width: 640px) {
          .oppTable thead { display: none; }
          .oppTable, .oppTable tbody, .oppTable tr, .oppTable td { display: block; width: 100%; }
          .oppTable tr {
            border: 1px solid var(--border-color); border-radius: 12px;
            background: var(--bg-secondary); margin: 0.75rem; padding: 0.35rem 0.25rem;
          }
          .oppTable td { border: none; padding: 0.55rem 0.9rem; }
          .oppTable td[data-label]::before {
            content: attr(data-label); display: block; font-size: 0.68rem;
            text-transform: uppercase; letter-spacing: .5px; color: var(--text-secondary);
            margin-bottom: 3px;
          }
          .oppActionCell { text-align: left; }
          .oppTipText { right: auto; left: 0; }
        }
      `,
        }}
      />
    </>
  );
}
