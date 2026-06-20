"use client";

/**
 * Botón de aprobación de cliente pendiente.
 * Siempre permite aprobar — el límite FREE es solo visual (ProLock en la lista).
 */
export default function PendingApproveButton({
  customerId,
  approveAction,
}: {
  isPro: boolean; // mantenido por compatibilidad pero ya no condiciona nada
  customerId: string;
  approveAction: (formData: FormData) => Promise<void>;
}) {
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
