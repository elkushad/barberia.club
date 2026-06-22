"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingForm({ barbershopId, brandColor, barbershopName, barbershopWhatsapp, barbershopInstagram, barbershopTiktok, barbershopFacebook, refCode }: { barbershopId: string, brandColor: string, barbershopName?: string, barbershopWhatsapp?: string, barbershopInstagram?: string, barbershopTiktok?: string, barbershopFacebook?: string, refCode?: string }) {
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
  // Valoración de la visita recién registrada (estrellas).
  const [ratingVisitId, setRatingVisitId] = useState<string | null>(null);
  const [hoverStar, setHoverStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [rated, setRated] = useState(false);
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
          body: JSON.stringify({ phone, name, barbershopId, refCode })
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
      const res = await fetch(`/api/customer/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: customerData.id })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al registrar la visita");
      setMessage("¡Visita registrada! Esperando confirmación de la barbería.");
      setRatingVisitId(data.visitId ?? null);
      setRated(false);
      setHoverStar(0);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar la visita");
    }
    setLoading(false);
  };

  const submitRating = async (value: number) => {
    if (!ratingVisitId || rated || selectedStar) return;
    // Mostramos las estrellas marcadas 1s antes de ocultarlas.
    setSelectedStar(value);
    setTimeout(() => setRated(true), 1000);
    try {
      await fetch(`/api/customer/visit/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId: ratingVisitId, rating: value })
      });
    } catch {
      // si falla, igual mostramos el agradecimiento (no bloqueamos al cliente)
    }
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
      {/* Banner: llegó invitado por alguien */}
      {refCode && step === 1 && (
        <div style={{
          backgroundColor: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '10px',
          padding: '0.6rem 0.9rem',
          marginBottom: '0.85rem',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--accent-success)',
        }}>
          🎉 Un amigo te invitó — regístrate y confirma tu primera visita para que gane su recompensa
        </div>
      )}
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

          {(barbershopInstagram || barbershopTiktok || barbershopFacebook) && (
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Sigue mi trabajo</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {barbershopInstagram && (
                  <a href={barbershopInstagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', transition: 'transform 0.2s', display: 'inline-block' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                )}
                {barbershopTiktok && (
                  <a href={barbershopTiktok} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', transition: 'transform 0.2s', display: 'inline-block' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                  </a>
                )}
                {barbershopFacebook && (
                  <a href={barbershopFacebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', transition: 'transform 0.2s', display: 'inline-block' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>¡Listo!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{message}</p>

          {/* Valoración de la visita (solo tras registrar una visita) */}
          {ratingVisitId && !rated && (
            <div style={{ marginTop: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>¿Cómo fue tu experiencia?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = selectedStar || hoverStar;
                  const filled = star <= active;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => submitRating(star)}
                      onMouseEnter={() => !selectedStar && setHoverStar(star)}
                      onMouseLeave={() => !selectedStar && setHoverStar(0)}
                      aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '2px',
                        cursor: selectedStar ? 'default' : 'pointer',
                        fontSize: '2rem',
                        lineHeight: 1,
                        color: filled ? '#f5c518' : 'rgba(255,255,255,0.25)',
                        transition: 'color 0.15s ease, transform 0.1s ease',
                      }}
                    >
                      {filled ? '★' : '☆'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {ratingVisitId && rated && (
            <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--accent-success)' }}>
              ¡Gracias! Tu valoración se publicará una vez que la barbería confirme tu visita.
            </p>
          )}

          {customerData && customerData.status === 'ACTIVE' && (
            <>
              <button 
                onClick={() => router.push(`/c/${customerData.uniqueCode}`)} 
                className="premium-btn"
                style={{ marginTop: '1rem', width: '100%', backgroundColor: brandColor, padding: '10px 20px', fontSize: '0.9rem' }}
              >
                Ver mis recompensas
              </button>

              {(barbershopInstagram || barbershopTiktok || barbershopFacebook) && (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Sigue mi trabajo</p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {barbershopInstagram && (
                      <a href={barbershopInstagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', transition: 'transform 0.2s', display: 'inline-block' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </a>
                    )}
                    {barbershopTiktok && (
                      <a href={barbershopTiktok} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', transition: 'transform 0.2s', display: 'inline-block' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                      </a>
                    )}
                    {barbershopFacebook && (
                      <a href={barbershopFacebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', transition: 'transform 0.2s', display: 'inline-block' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
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
