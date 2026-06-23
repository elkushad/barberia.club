import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Eliminar mi cuenta",
  description:
    "Cómo eliminar tu cuenta de barberia.club y los datos asociados, qué se elimina y en qué plazos.",
  alternates: { canonical: "/eliminar-cuenta" },
  robots: { index: true, follow: true },
};

// WhatsApp de soporte (mismo número que usa el resto de la plataforma).
const SUPPORT_WHATSAPP = "51997237775";
const WHATSAPP_MSG =
  "Hola, quiero solicitar la eliminación de mi cuenta de barberia.club. Mi correo de registro es: ";
const WHATSAPP_LINK = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

const MAIL_SUBJECT = "Solicitud de eliminación de cuenta";
const MAIL_BODY =
  "Hola, solicito la eliminación de mi cuenta de barberia.club y los datos asociados.%0A%0ACorreo de registro: %0ANombre de la barbería: ";
const MAIL_LINK = `mailto:contacto@barberia.club?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${MAIL_BODY}`;

export default function EliminarCuentaPage() {
  return (
    <LegalLayout title="Eliminar mi cuenta" lastUpdated="22 de junio de 2026">
      <p>
        Puedes eliminar tu cuenta de barberia.club y los datos asociados en cualquier momento. Aquí te
        explicamos cómo hacerlo, qué se elimina y en qué plazos.
      </p>

      <h2>Cómo solicitar la eliminación</h2>
      <p>Elige la vía que prefieras:</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", margin: "1.25rem 0 1.5rem" }}>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            backgroundColor: "#25D366", color: "#0b0f14", fontWeight: 700,
            padding: "0.75rem 1.25rem", borderRadius: "8px", textDecoration: "none",
          }}
        >
          Solicitar por WhatsApp
        </a>
        <a
          href={MAIL_LINK}
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            border: "1px solid var(--saas-border)", color: "white", fontWeight: 600,
            padding: "0.75rem 1.25rem", borderRadius: "8px", textDecoration: "none",
          }}
        >
          Solicitar por correo
        </a>
        <a
          href="/login"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            border: "1px solid var(--saas-border)", color: "white", fontWeight: 600,
            padding: "0.75rem 1.25rem", borderRadius: "8px", textDecoration: "none",
          }}
        >
          Iniciar sesión en mi cuenta
        </a>
      </div>

      <ol>
        <li>
          <strong>Por WhatsApp:</strong> escríbenos al <strong>+51 997 237 775</strong> indicando el correo con el que te
          registraste. Verificaremos tu identidad antes de proceder.
        </li>
        <li>
          <strong>Por correo:</strong> envía tu solicitud a{" "}
          <a href="mailto:contacto@barberia.club">contacto@barberia.club</a> desde el correo de tu cuenta,
          indicando el nombre de tu barbería.
        </li>
        <li>
          <strong>Desde tu cuenta:</strong> <a href="/login">inicia sesión</a> para gestionar tu barbería y solicitar la
          eliminación.
        </li>
      </ol>

      <h2>Quién puede solicitarla</h2>
      <ul>
        <li><strong>Dueños de barbería:</strong> pueden eliminar su cuenta y la(s) barbería(s) asociada(s).</li>
        <li>
          <strong>Clientes finales:</strong> sus datos los gestiona la barbería donde se registraron. Pueden solicitar la
          eliminación a esa barbería o a nosotros, y lo canalizaremos.
        </li>
      </ul>

      <h2>Qué datos se eliminan</h2>
      <p>Al eliminar la cuenta de un Dueño, se eliminan de la base de datos:</p>
      <ul>
        <li>La barbería (nombre, logo, banner, descripción, dirección, redes, horarios, configuración).</li>
        <li>Los clientes finales registrados en esa barbería (nombre, teléfono, código único, estado).</li>
        <li>El historial de visitas, valoraciones, citas y canjes de recompensas.</li>
        <li>Los servicios y recompensas configurados.</li>
        <li>Los referidos de clientes y los registros de referidos de la barbería.</li>
        <li>Los movimientos de crédito y el saldo del programa de referidos.</li>
        <li>El registro de pagos asociado (sujeto a la conservación legal indicada abajo).</li>
        <li>La cuenta del Dueño (usuario, correo, contraseña cifrada).</li>
      </ul>

      <h2>Plazos</h2>
      <ul>
        <li>Las solicitudes desde tu cuenta se procesan de forma inmediata o dentro de un máximo de 30 días.</li>
        <li>Las solicitudes por correo o WhatsApp se atienden en un plazo máximo de 30 días.</li>
      </ul>

      <h2>Qué se conserva y por qué</h2>
      <p>Aunque elimines tu cuenta, podemos conservar de forma limitada:</p>
      <ul>
        <li><strong>Registros de pagos / facturación:</strong> durante el plazo exigido por la normativa tributaria y contable del Perú.</li>
        <li><strong>Copias de seguridad cifradas:</strong> la base de datos se respalda diariamente en copias cifradas (AES-256-GCM); se conservan aproximadamente las últimas 30 copias (~1 mes) y luego se eliminan automáticamente. Tus datos desaparecerán de las copias dentro de ese ciclo.</li>
        <li><strong>Datos anonimizados o agregados</strong> que no permitan identificarte.</li>
        <li>Información necesaria para cumplir obligaciones legales, resolver disputas o prevenir fraude.</li>
      </ul>

      <h2>Efecto de la eliminación</h2>
      <p>
        La eliminación es <strong>permanente e irreversible</strong> una vez completada. Perderás el acceso a la cuenta, al
        saldo del programa de referidos no retirado y a todo el historial. Si tienes una suscripción PRO activa,
        <strong> cancélala primero</strong> en el procesador de pago (PayPal o Mercado Pago); eliminar la cuenta en barberia.club
        no cancela automáticamente cobros gestionados por terceros.
      </p>

      <h2>Contacto</h2>
      <ul>
        <li><strong>Correo:</strong> <a href="mailto:contacto@barberia.club">contacto@barberia.club</a></li>
        <li><strong>WhatsApp:</strong> +51 997 237 775</li>
      </ul>
    </LegalLayout>
  );
}
