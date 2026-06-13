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
        setStep(2); // New customer registration
      }
    } catch (err) {
      setError("Error al verificar el teléfono");
    }
    setLoading(false);
  };

  const checkPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`barberia_customer_${barbershopId}`, JSON.stringify({ phone }));
    await checkPhoneByNumber(phone);
  };

  const registerCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`/api/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, barbershopId })
      });
      setMessage("¡Registro enviado! El dueño aprobará tu cuenta pronto.");
      setStep(4);
    } catch (err) {
      setError("Error al registrar");
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

  return (
    <div style={{ width: '100%', padding: '0 10px' }}>
      {error && <div style={{ color: 'var(--accent-danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      {step === 1 && (
        <form onSubmit={checkPhone} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Ingresa tu teléfono</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
            Para registrarte o sumar una visita
          </p>
          <input 
            type="tel" 
            className="premium-input" 
            placeholder="ej: +34 600 000 000" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit" className="premium-btn" disabled={loading} style={{ backgroundColor: brandColor }}>
            {loading ? "Verificando..." : "Continuar"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={registerCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>¡Hola, nuevo cliente!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem' }}>
            Completa tus datos para unirte al club
          </p>
          <input 
            type="tel" 
            className="premium-input" 
            value={phone}
            disabled
          />
          <input 
            type="text" 
            className="premium-input" 
            placeholder="Tu Nombre Completo" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" className="premium-btn" disabled={loading} style={{ backgroundColor: brandColor }}>
            {loading ? "Registrando..." : "Unirme al Club"}
          </button>
        </form>
      )}

      {step === 3 && customerData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>¡Bienvenido de nuevo, {customerData.name}! 👋</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            ¿Estás aquí para tu corte?
          </p>
          
          <button onClick={registerVisit} className="premium-btn" disabled={loading} style={{ backgroundColor: brandColor, padding: '10px 20px', fontSize: '0.9rem' }}>
            {loading ? "Registrando..." : "Registrar Visita"}
          </button>

          <a 
            href={`https://wa.me/${(barbershopWhatsapp || "").replace(/\D/g, '')}?text=Hola ${barbershopName || "barbería"} quiero agendar una cita`}
            target="_blank"
            rel="noopener noreferrer"
            className="premium-btn"
            style={{ backgroundColor: '#25D366', textDecoration: 'none', color: 'white', padding: '10px 20px', fontSize: '0.9rem' }}
          >
            Agendar (WhatsApp)
          </a>

          <button onClick={() => router.push(`/c/${customerData.uniqueCode}`)} className="premium-btn-secondary" style={{ marginTop: '0.25rem', padding: '10px 20px', fontSize: '0.9rem' }}>
            Ver mis Recompensas
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

    </div>
  );
}
