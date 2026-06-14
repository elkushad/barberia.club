"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingForm({ barbershopId, brandColor, barbershopName, barbershopWhatsapp }: { barbershopId: string, brandColor: string, barbershopName?: string, barbershopWhatsapp?: string }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptError, setApptError] = useState("");
  const [apptLoading, setApptLoading] = useState(false);
  const [today] = useState(() => new Date().toISOString().split("T")[0]);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem(`barberia_customer_${barbershopId}`);
    if (saved) {
      try {
        const { phone: savedPhone } = JSON.parse(saved);
        if (savedPhone) {
          setPhone(savedPhone);
          checkPhoneByNumber(savedPhone);
        }
      } catch(e) {}
    }
  }, [barbershopId]);

  const checkPhoneByNumber = async (phoneNumber: string) => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch(`/api/customer/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, barbershopId })
      });
      const data = await res.json();
      
      if (data.exists) {
        setCustomerData(data.customer);
        if (data.customer.status === 'PENDING') {
          setMessage("Tu cuenta está pendiente de aprobación por el dueño.");
          setStep(4);
        } else {
          setStep(3); // Existing customer flow
        }
      } else {
        setStep(1); // They don't exist, show the form so they can type their name
      }
    } catch (err) {
      setError("Error al verificar el teléfono");
    }
    setLoading(false);
  };

  const processFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError("Por favor ingresa tu nombre");
      return;
    }

    setLoading(true);
    setError("");
    localStorage.setItem(`barberia_customer_${barbershopId}`, JSON.stringify({ phone }));
    
    try {
      // Primero revisamos si el teléfono ya existe
      const res = await fetch(`/api/customer/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, barbershopId })
      });
      const data = await res.json();
      
      if (data.exists) {
        setCustomerData(data.customer);
        if (data.customer.status === 'PENDING') {
          setMessage("Tu cuenta está pendiente de aprobación por el dueño.");
          setStep(4);
        } else {
          setStep(3); // Flujo de cliente existente
        }
      } else {
        // Cliente nuevo, lo registramos inmediatamente usando el nombre y teléfono provistos
        const regRes = await fetch(`/api/customer/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, name, barbershopId })
        });
        
        if (!regRes.ok) {
           const errData = await regRes.json();
           throw new Error(errData.error || "Error al registrar");
        }
        
        setMessage("¡Registro enviado! El dueño aprobará tu cuenta pronto.");
        setStep(4);
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud");
    }
    setLoading(false);
  };

  const registerVisit = async () => {
    setLoading(true);
    try {
      await fetch(`/api/customer/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customerData.id })
      });
      setMessage("¡Visita registrada! Esperando confirmación del dueño.");
      setStep(4);
    } catch (err) {
      setError("Error al registrar la visita");
    }
    setLoading(false);
  };

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  const openApptModal = () => {
    setApptError("");
    setApptDate("");
    setApptTime("");
    setShowApptModal(true);
  };

  const bookViaWhatsApp = () => {
    if (!apptDate || !apptTime) { setApptError("Elige fecha y hora."); return; }
    const msg = `Hola ${barbershopName || "barbería"} 👋\nSoy ${customerData?.name}.\n\nQuisiera agendar una cita para:\n📅 Fecha: ${formatDate(apptDate)}\n🕒 Hora: ${apptTime}\n\nGracias.`;
    const url = `https://wa.me/${(barbershopWhatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setShowApptModal(false);
    setMessage("Te abrimos WhatsApp para confirmar tu cita. 💈");
    setStep(4);
  };

  const bookInSystem = async () => {
    if (!apptDate || !apptTime) { setApptError("Elige fecha y hora."); return; }
    setApptLoading(true);
    setApptError("");
    try {
      const res = await fetch(`/api/customer/appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customerData.id, barbershopId, date: apptDate, time: apptTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApptError(data.error || "No se pudo agendar la cita.");
      } else {
        setCustomerData({ ...customerData, hasActiveAppointment: true });
        setShowApptModal(false);
        setMessage("¡Cita registrada! La barbería la confirmará pronto.");
        setStep(4);
      }
    } catch {
      setApptError("Error de red, intenta de nuevo.");
    }
    setApptLoading(false);
  };

  return (
    <div style={{ width: '100%', padding: '0 10px' }}>
      {error && <div style={{ color: 'var(--accent-danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      {step === 1 && (
        <form onSubmit={processFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Regístrate o Ingresa</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
            Un solo paso para unirte a nuestro club o sumar visitas
          </p>
          <input 
            type="text" 
            className="premium-input" 
            placeholder="Tu Nombre Completo" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input 
            type="tel" 
            className="premium-input" 
            placeholder="Tu teléfono (ej: +34 600 000 000)" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit" className="premium-btn" disabled={loading} style={{ backgroundColor: brandColor }}>
            {loading ? "Procesando..." : "Continuar"}
          </button>
        </form>
      )}

      {step === 3 && customerData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>¡Bienvenido de nuevo, {customerData.name}! 👋</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            ¿Qué quieres hacer hoy?
          </p>
          
          <button onClick={registerVisit} className="premium-btn" disabled={loading} style={{ backgroundColor: brandColor, padding: '10px 20px', fontSize: '0.9rem' }}>
            {loading ? "Registrando..." : "Registrar visita"}
          </button>

          <button onClick={openApptModal} className="premium-btn" style={{ backgroundColor: '#25D366', color: 'white', padding: '10px 20px', fontSize: '0.9rem' }}>
            Agendar cita
          </button>

          <button onClick={() => router.push(`/c/${customerData.uniqueCode}`)} className="premium-btn-secondary" style={{ marginTop: '0.25rem', padding: '10px 20px', fontSize: '0.9rem' }}>
            Ver mis recompensas
          </button>
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>¡Listo!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{message}</p>
          
          {customerData && customerData.status === 'ACTIVE' && (
            <button 
              onClick={() => router.push(`/c/${customerData.uniqueCode}`)} 
              className="premium-btn"
              style={{ marginTop: '1rem', width: '100%', backgroundColor: brandColor, padding: '10px 20px', fontSize: '0.9rem' }}
            >
              Ver mis recompensas
            </button>
          )}
        </div>
      )}

      {customerData && (
        <button
          onClick={() => {
            localStorage.removeItem(`barberia_customer_${barbershopId}`);
            window.location.reload();
          }}
          style={{
            position: 'fixed',
            bottom: '15px',
            left: '15px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            zIndex: 100,
            textDecoration: 'underline'
          }}
        >
          Salir
        </button>
      )}

      {showApptModal && (
        <div
          onClick={() => setShowApptModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '360px', border: '1px solid var(--border-color)' }}
          >
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Agenda tu próxima visita</h3>

            {customerData?.hasActiveAppointment ? (
              <>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1rem' }}>
                  Ya tienes una cita agendada. Cancela o espera a que se complete para crear otra.
                </p>
                <button onClick={() => setShowApptModal(false)} className="premium-btn-secondary" style={{ width: '100%', padding: '10px' }}>
                  Cerrar
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fecha</label>
                <input type="date" className="premium-input" min={today} value={apptDate} onChange={(e) => setApptDate(e.target.value)} />
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hora</label>
                <input type="time" className="premium-input" value={apptTime} onChange={(e) => setApptTime(e.target.value)} />

                {apptError && <p style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>{apptError}</p>}

                <button onClick={bookViaWhatsApp} className="premium-btn" style={{ backgroundColor: '#25D366', color: 'white', padding: '12px', marginTop: '0.5rem' }}>
                  Agendar por WhatsApp
                </button>
                <button onClick={bookInSystem} disabled={apptLoading} className="premium-btn-secondary" style={{ padding: '12px' }}>
                  {apptLoading ? "Agendando..." : "Agendar en barberia.club"}
                </button>
                <button onClick={() => setShowApptModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'underline', marginTop: '0.25rem' }}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
