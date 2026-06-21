// Barra de progreso (celeste) de la recompensa por referidos que ofrece la
// barbería. Replica el estilo de la barra de cortes pero en celeste.
// Se muestra solo a clientes que ya invitaron a algún amigo.
const CELESTE = "#38bdf8";

export default function ReferralProgressBar({
  rewardName,
  required,
  validCount,
}: {
  rewardName: string;
  required: number;
  validCount: number;
}) {
  const pct = required > 0 ? Math.min((validCount / required) * 100, 100) : 0;
  const reached = validCount >= required;

  return (
    <div style={{ marginTop: "2rem" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "16px",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "9999px",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${pct}%`,
            background: `linear-gradient(90deg, rgba(56,189,248,0.4), ${CELESTE})`,
            borderRadius: "9999px",
            transition: "width 0.5s ease-in-out",
            boxShadow: "0 0 12px rgba(56,189,248,0.5)",
          }}
        />
        {/* Hito de la recompensa por referidos */}
        <div
          style={{
            position: "absolute",
            left: "100%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "24px",
              textAlign: "center",
              whiteSpace: "nowrap",
              color: reached ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: reached ? "bold" : "normal",
              fontSize: "0.72rem",
            }}
          >
            {required} amigos
          </div>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: reached ? CELESTE : "var(--bg-tertiary)",
              border: "3px solid var(--bg-primary)",
              boxShadow: reached ? `0 0 8px ${CELESTE}` : "0 2px 4px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      </div>
      <p style={{ fontSize: "0.72rem", color: CELESTE, marginTop: "0.6rem", fontWeight: 600 }}>
        🔵 {rewardName} · {validCount}/{required} amigos confirmados
      </p>
    </div>
  );
}
