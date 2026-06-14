import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { assertAppointmentAccess } from "@/lib/guards";

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

function confirmMessage(name: string, date: string, time: string) {
  return `Hola ${name} 👋\n\nAgendamos tu cita para:\n📅 Día: ${formatDate(date)}\n🕒 Hora: ${time}\n\nTe esperamos. Gracias 🙌`;
}

export default async function CitasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({ where: { slug } });
  if (!barbershop) return null;

  const appointments = await prisma.appointment.findMany({
    where: { barbershopId: barbershop.id },
    include: { customer: { select: { name: true, phone: true } } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  const pendientes = appointments.filter((a) => a.status === "PENDING");
  const confirmadas = appointments.filter((a) => a.status === "APPROVED");
  const historial = appointments.filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED");

  async function approveAppointment(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await assertAppointmentAccess(id);
    await prisma.appointment.update({ where: { id }, data: { status: "APPROVED" } });
    revalidatePath(`/admin/${slug}/citas`);
  }

  async function completeAppointment(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await assertAppointmentAccess(id);
    await prisma.appointment.update({ where: { id }, data: { status: "COMPLETED" } });
    revalidatePath(`/admin/${slug}/citas`);
  }

  async function cancelAppointment(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await assertAppointmentAccess(id);
    await prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
    revalidatePath(`/admin/${slug}/citas`);
  }

  const cardStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  };

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem" }}>Citas</h2>

      {/* Pendientes */}
      <h3 style={{ color: "var(--accent-primary)", marginBottom: "1rem" }}>Pendientes ({pendientes.length})</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
        {pendientes.length === 0 && (
          <p style={{ color: "var(--text-secondary)" }}>No hay citas pendientes.</p>
        )}
        {pendientes.map((a) => (
          <div key={a.id} className="premium-card" style={cardStyle}>
            <div>
              <p style={{ fontWeight: "bold" }}>{a.customer.name}</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{a.customer.phone}</p>
              <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>📅 {formatDate(a.date)} &nbsp;·&nbsp; 🕒 {a.time}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <form action={approveAppointment}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="premium-btn" style={{ backgroundColor: "var(--accent-success)", padding: "8px 16px", fontSize: "0.85rem" }}>Aprobar</button>
              </form>
              <form action={cancelAppointment}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="premium-btn-secondary" style={{ color: "var(--accent-danger)", padding: "8px 16px", fontSize: "0.85rem" }}>Cancelar</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmadas */}
      <h3 style={{ marginBottom: "1rem" }}>Confirmadas ({confirmadas.length})</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2.5rem" }}>
        {confirmadas.length === 0 && (
          <p style={{ color: "var(--text-secondary)" }}>No hay citas confirmadas.</p>
        )}
        {confirmadas.map((a) => (
          <div key={a.id} className="premium-card" style={cardStyle}>
            <div>
              <p style={{ fontWeight: "bold" }}>{a.customer.name}</p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{a.customer.phone}</p>
              <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>📅 {formatDate(a.date)} &nbsp;·&nbsp; 🕒 {a.time}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <a
                href={`https://wa.me/${a.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(confirmMessage(a.customer.name, a.date, a.time))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-btn"
                style={{ backgroundColor: "#25D366", color: "white", textDecoration: "none", padding: "8px 16px", fontSize: "0.85rem" }}
              >
                📲 Enviar confirmación por WhatsApp
              </a>
              <form action={completeAppointment}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="premium-btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>Completar</button>
              </form>
              <form action={cancelAppointment}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="premium-btn-secondary" style={{ color: "var(--accent-danger)", padding: "8px 16px", fontSize: "0.85rem" }}>Cancelar</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Historial */}
      {historial.length > 0 && (
        <>
          <h3 style={{ marginBottom: "1rem" }}>Historial ({historial.length})</h3>
          <div className="premium-card" style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-tertiary)" }}>
                  <th style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Cliente</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Fecha</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>{a.customer.name}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>{formatDate(a.date)} · {a.time}</td>
                    <td style={{ padding: "0.75rem", fontSize: "0.8rem", color: a.status === "COMPLETED" ? "var(--accent-success)" : "var(--text-secondary)" }}>
                      {a.status === "COMPLETED" ? "Completada" : "Cancelada"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
