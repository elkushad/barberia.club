import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo barberia.club recopila, usa y protege los datos personales de barberías y clientes.",
  alternates: { canonical: "/privacidad" },
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return (
    <LegalLayout title="Política de Privacidad" lastUpdated="22 de junio de 2026">
      <h2>1. Quiénes somos</h2>
      <p>
        barberia.club es una plataforma de fidelización para barberías que permite gestionar
        clientes, visitas, citas, recompensas y un programa de referidos.
      </p>
      <ul>
        <li><strong>Responsable del tratamiento:</strong> Luis Gonzalo Oyola Tapia, con RUC 10609761780 y domicilio en Prolongación Lucanas 367, La Victoria, Lima, Perú.</li>
        <li><strong>Sitio web:</strong> https://barberia.club</li>
        <li><strong>Correo de contacto:</strong> <a href="mailto:barberia.club777@gmail.com">barberia.club777@gmail.com</a></li>
        <li><strong>WhatsApp de soporte:</strong> +51 997 237 775</li>
      </ul>
      <p>
        Esta política se rige por la <strong>Ley N.º 29733, Ley de Protección de Datos Personales del Perú</strong>,
        y su Reglamento (D.S. 003-2013-JUS).
      </p>

      <h2>2. A quién aplica esta política</h2>
      <p>barberia.club trata datos de dos grupos distintos, con roles distintos:</p>
      <ol>
        <li>
          <strong>Dueños de barbería (titulares de cuenta).</strong> Crean una cuenta con correo y
          contraseña para administrar su negocio. Respecto a sus datos, barberia.club actúa como
          <strong> responsable del tratamiento</strong>.
        </li>
        <li>
          <strong>Clientes finales de cada barbería.</strong> Se registran en la página de una barbería
          dejando su nombre y número de teléfono. Estos datos los recopila e introduce <strong>la barbería</strong>,
          que es responsable de obtener su consentimiento. Respecto a estos datos, barberia.club actúa como
          <strong> encargado del tratamiento por cuenta de la barbería</strong>.
        </li>
      </ol>
      <p>
        Si eres cliente final y quieres ejercer tus derechos, puedes dirigirte a la barbería donde te
        registraste o escribirnos a <a href="mailto:barberia.club777@gmail.com">barberia.club777@gmail.com</a> y lo canalizaremos.
      </p>

      <h2>3. Qué datos recopilamos</h2>
      <h3>3.1 De los dueños de barbería</h3>
      <ul>
        <li><strong>Identificación y contacto:</strong> nombre, correo electrónico, número de WhatsApp.</li>
        <li><strong>Credenciales:</strong> contraseña (almacenada cifrada con bcrypt; nunca en texto plano).</li>
        <li><strong>Datos del negocio:</strong> nombre comercial, logo, banner, descripción, dirección (opcional), redes sociales, horarios y servicios con precios.</li>
        <li><strong>Datos de suscripción y pagos:</strong> plan (FREE/PRO), fechas de vigencia y prueba, identificador de suscripción e historial de pagos (monto, moneda, estado, método). No almacenamos números de tarjeta.</li>
        <li><strong>Programa de referidos:</strong> código de referido, relación con la barbería que la refirió, saldo y movimientos de crédito.</li>
      </ul>
      <h3>3.2 De los clientes finales (recopilados por la barbería)</h3>
      <ul>
        <li><strong>Nombre</strong> y <strong>número de teléfono</strong> (identificador principal del cliente dentro de una barbería).</li>
        <li><strong>Actividad:</strong> visitas, valoraciones (1–5 estrellas), citas (fecha y hora), recompensas canjeadas y referidos.</li>
        <li>Un <strong>código único</strong> asociado al cliente para el sistema de referidos.</li>
      </ul>
      <p>No solicitamos contraseña a los clientes finales; se identifican por su número de teléfono.</p>
      <h3>3.3 Datos técnicos</h3>
      <ul>
        <li><strong>Dirección IP:</strong> se procesa de forma temporal para limitar solicitudes (protección contra abuso). No se almacena en nuestra base de datos.</li>
        <li><strong>Almacenamiento local (localStorage):</strong> el número de teléfono del cliente (para no volver a pedirlo en la misma barbería) y la marca de tiempo de la última revisión de notificaciones.</li>
        <li><strong>Cookie de sesión:</strong> necesaria para mantener la sesión iniciada de los dueños.</li>
      </ul>
      <h3>3.4 Datos que no recopilamos</h3>
      <p>
        No recopilamos ubicación GPS del dispositivo, no enviamos notificaciones push, ni correos o SMS
        automáticos, ni usamos servicios de inteligencia artificial.
      </p>

      <h2>4. Para qué usamos los datos</h2>
      <ul>
        <li>Crear y administrar la cuenta del dueño y su barbería.</li>
        <li>Permitir el registro de clientes, el conteo de visitas y la entrega de recompensas.</li>
        <li>Gestionar citas y valoraciones.</li>
        <li>Procesar la suscripción PRO y el programa de referidos (incluido el cálculo de saldos).</li>
        <li>Mostrar el directorio público de barberías y la página pública de cada barbería.</li>
        <li>Proteger la plataforma frente a abusos (límite de solicitudes por IP).</li>
        <li>Medir el uso y rendimiento de la plataforma y realizar publicidad (ver sección 6).</li>
      </ul>

      <h2>5. Base legal del tratamiento</h2>
      <p>
        Tratamos los datos sobre la base del <strong>consentimiento</strong> del titular, la <strong>ejecución del contrato</strong>
        (prestación del servicio al dueño), el <strong>interés legítimo</strong> (seguridad de la plataforma) y el
        <strong> cumplimiento de obligaciones legales</strong> (p. ej., tributarias respecto a los pagos).
      </p>

      <h2>6. Cookies y tecnologías de seguimiento</h2>
      <table>
        <thead>
          <tr><th>Tecnología</th><th>Finalidad</th><th>¿Requiere consentimiento?</th></tr>
        </thead>
        <tbody>
          <tr><td>Cookie de sesión (inicio de sesión)</td><td>Funcional / necesaria</td><td>No</td></tr>
          <tr><td>Almacenamiento local (teléfono, notificaciones)</td><td>Funcional</td><td>No</td></tr>
          <tr><td>Google Analytics 4</td><td>Analítica de uso</td><td>Sí</td></tr>
          <tr><td>Meta (Facebook) Pixel</td><td>Publicidad y medición</td><td>Sí</td></tr>
          <tr><td>TikTok Pixel</td><td>Publicidad y medición</td><td>Sí</td></tr>
        </tbody>
      </table>
      <p>
        Las herramientas de analítica y publicidad (Google, Meta, TikTok) <strong>solo se activan tras obtener tu
        consentimiento</strong> mediante el aviso de cookies que se muestra al ingresar. Puedes <strong>aceptar o rechazar</strong>
        estas tecnologías y cambiar tu elección en cualquier momento. Si las rechazas, la plataforma sigue funcionando
        con normalidad. Estas herramientas pueden usar cookies e identificadores y compartir datos (como la dirección
        IP y eventos de navegación) con Google, Meta y TikTok con fines de medición y publicidad.
      </p>

      <h2>7. Con quién compartimos los datos</h2>
      <table>
        <thead>
          <tr><th>Proveedor</th><th>Finalidad</th><th>Datos involucrados</th></tr>
        </thead>
        <tbody>
          <tr><td>Google Analytics</td><td>Analítica</td><td>Navegación, identificadores, IP</td></tr>
          <tr><td>Meta (Facebook)</td><td>Publicidad/medición</td><td>Eventos, cookies, IP</td></tr>
          <tr><td>TikTok</td><td>Publicidad/medición</td><td>Eventos, cookies, IP</td></tr>
          <tr><td>PayPal</td><td>Cobro de la suscripción</td><td>Datos de pago (en el entorno de PayPal)</td></tr>
          <tr><td>Mercado Pago</td><td>Cobro de la suscripción</td><td>Datos de pago (en el entorno de Mercado Pago)</td></tr>
          <tr><td>Vercel (Blob/hosting)</td><td>Alojamiento, imágenes y copias cifradas</td><td>Imágenes, datos de la app</td></tr>
          <tr><td>Supabase</td><td>Base de datos</td><td>Todos los datos de la plataforma</td></tr>
          <tr><td>Google Maps</td><td>Abrir la ubicación de una barbería</td><td>La dirección (texto) de la barbería</td></tr>
          <tr><td>WhatsApp</td><td>Enlaces de contacto y trámite de retiros</td><td>Número de teléfono y mensaje</td></tr>
          <tr><td>exchangerate-api.com</td><td>Mostrar precios en moneda local</td><td>Ningún dato personal</td></tr>
        </tbody>
      </table>
      <p>
        No vendemos datos personales. La compartición con Google/Meta/TikTok solo ocurre si has dado tu
        consentimiento (sección 6).
      </p>

      <h2>8. Pagos</h2>
      <p>
        Las suscripciones PRO se cobran a través de <strong>PayPal</strong> o <strong>Mercado Pago</strong>. Los datos de la tarjeta
        o medio de pago se introducen y procesan en el entorno seguro de esos proveedores; barberia.club
        <strong> no recibe ni almacena</strong> los datos de la tarjeta. Solo guardamos el resultado del pago (monto, moneda,
        estado, método) y el identificador de la suscripción.
      </p>

      <h2>9. Conservación, seguridad y transferencias internacionales</h2>
      <ul>
        <li><strong>Seguridad:</strong> contraseñas cifradas con bcrypt; transmisión por HTTPS; verificación de firma en los webhooks de pago; control de acceso por roles.</li>
        <li><strong>Copias de seguridad:</strong> copias diarias cifradas con AES-256-GCM. Conservamos aproximadamente las últimas 30 copias (alrededor de un mes); las más antiguas se eliminan automáticamente.</li>
        <li><strong>Conservación:</strong> conservamos los datos mientras la cuenta esté activa y durante los plazos legales aplicables. Tras la eliminación, ver la Política de Eliminación de Cuenta.</li>
        <li><strong>Transferencias internacionales:</strong> algunos proveedores (Vercel, Supabase, Google, Meta, TikTok) procesan datos fuera del Perú, principalmente en Estados Unidos, sujetos a las garantías de cada proveedor.</li>
      </ul>

      <h2>10. Tus derechos</h2>
      <p>
        Como titular de datos, tienes derecho a <strong>acceder, rectificar, actualizar, oponerte, cancelar (suprimir)</strong>
        tus datos y, cuando corresponda, a la <strong>portabilidad</strong>, conforme a la Ley N.º 29733. Para ejercerlos, escribe
        a <a href="mailto:barberia.club777@gmail.com">barberia.club777@gmail.com</a>. También puedes presentar reclamaciones ante la
        Autoridad Nacional de Protección de Datos Personales del Perú.
      </p>

      <h2>11. Eliminación de cuenta</h2>
      <p>
        Puedes eliminar tu cuenta y los datos asociados desde la página{" "}
        <a href="/eliminar-cuenta">barberia.club/eliminar-cuenta</a> o escribiendo a{" "}
        <a href="mailto:barberia.club777@gmail.com">barberia.club777@gmail.com</a>. El detalle de qué se elimina, los plazos
        y las excepciones está en la Política de Eliminación de Cuenta.
      </p>

      <h2>12. Menores de edad</h2>
      <p>
        La plataforma está dirigida a barberías y personas mayores de edad. No recopilamos conscientemente
        datos de menores de edad para crear cuentas de dueño.
      </p>

      <h2>13. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política. Publicaremos la versión vigente en esta página con su fecha de
        actualización. Los cambios relevantes se comunicarán por medios razonables.
      </p>

      <h2>14. Contacto</h2>
      <ul>
        <li><strong>Correo:</strong> <a href="mailto:barberia.club777@gmail.com">barberia.club777@gmail.com</a></li>
        <li><strong>WhatsApp:</strong> +51 997 237 775</li>
        <li><strong>Responsable:</strong> Luis Gonzalo Oyola Tapia · RUC 10609761780 · Prolongación Lucanas 367, La Victoria, Lima, Perú.</li>
      </ul>
    </LegalLayout>
  );
}
