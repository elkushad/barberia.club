import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Condiciones de uso de barberia.club: cuentas, planes, pagos, programa de referidos y responsabilidades.",
  alternates: { canonical: "/terminos" },
  robots: { index: true, follow: true },
};

function Todo({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: "rgba(212,175,55,0.18)", color: "#f1c40f", padding: "0 4px", borderRadius: "3px" }}>
      [{children}]
    </span>
  );
}

export default function TerminosPage() {
  return (
    <LegalLayout title="Términos y Condiciones" lastUpdated="22 de junio de 2026">
      <h2>1. Aceptación</h2>
      <p>
        Estos Términos y Condiciones (&quot;Términos&quot;) regulan el uso de la plataforma barberia.club
        (&quot;la Plataforma&quot;), operada por <Todo>COMPLETAR: razón social, RUC, domicilio</Todo>, Perú. Al
        registrarte o usar la Plataforma aceptas estos Términos y la <a href="/privacidad">Política de Privacidad</a>.
        Si no estás de acuerdo, no uses la Plataforma.
      </p>

      <h2>2. Definiciones</h2>
      <ul>
        <li><strong>Dueño:</strong> persona que crea una cuenta para administrar una o más barberías.</li>
        <li><strong>Cliente final:</strong> persona que se registra en la página de una barbería para acumular visitas y recompensas.</li>
        <li><strong>Plan FREE / PRO:</strong> niveles de servicio de la Plataforma.</li>
        <li><strong>Programa de referidos:</strong> mecanismo de recompensas por invitar a otras barberías (ver sección 7).</li>
      </ul>

      <h2>3. Cuentas y registro</h2>
      <ul>
        <li>El Dueño se registra con nombre, correo electrónico, contraseña y número de WhatsApp. Debe ser mayor de edad y proporcionar información veraz.</li>
        <li>El Dueño es responsable de la confidencialidad de su contraseña y de toda la actividad de su cuenta.</li>
        <li>Los Clientes finales se registran con su nombre y número de teléfono; no usan contraseña y se identifican por su teléfono.</li>
      </ul>

      <h2>4. Descripción del servicio</h2>
      <p>
        La Plataforma permite a las barberías: crear una página pública, generar un código QR, registrar
        clientes y visitas, configurar recompensas por fidelidad y por referidos, gestionar citas y
        valoraciones, y aparecer en el directorio público. Las funciones disponibles dependen del plan (FREE o PRO).
      </p>

      <h2>5. Planes, prueba gratuita y precios</h2>
      <ul>
        <li>Las barberías nuevas inician en plan <strong>FREE</strong> e incluyen un periodo de <strong>prueba PRO de 7 días</strong>; al finalizar, la barbería continúa en FREE salvo que contrate PRO.</li>
        <li>El plan <strong>PRO</strong> es una suscripción de pago recurrente. Los precios se muestran en la Plataforma y pueden expresarse en moneda local de forma referencial según el tipo de cambio.</li>
        <li>Nos reservamos el derecho de modificar funciones y precios, notificándolo con antelación razonable.</li>
      </ul>

      <h2>6. Pagos y suscripciones</h2>
      <ul>
        <li>El cobro del plan PRO se realiza a través de <strong>PayPal</strong> o <strong>Mercado Pago</strong>. Al suscribirte aceptas también los términos del procesador de pago elegido.</li>
        <li>La suscripción es <strong>recurrente</strong> y se renueva automáticamente según el ciclo contratado, hasta que la canceles.</li>
        <li><strong>Cancelación:</strong> puedes cancelar la suscripción desde el procesador de pago. Tras la cancelación, expiración o impago, la barbería vuelve al plan FREE. No se realizan reembolsos por periodos ya iniciados, salvo que la ley aplicable lo exija.</li>
        <li>barberia.club no almacena los datos de tu tarjeta; los gestiona el procesador de pago.</li>
      </ul>

      <h2>7. Programa de referidos</h2>
      <ul>
        <li>Cada barbería recibe un <strong>código de referido</strong>. Si una barbería invitada se suscribe a PRO y mantiene la suscripción vigente durante <strong>30 días</strong>, la barbería que la refirió obtiene una <strong>recompensa en soles (S/)</strong> acreditada como saldo.</li>
        <li>La barbería invitada puede recibir un <strong>beneficio de bienvenida</strong> en su primer mes PRO (descuento o periodo de prueba), según se indique en la Plataforma.</li>
        <li><strong>Antifraude:</strong> solo se reconoce una recompensa por barbería referida. Nos reservamos el derecho de anular recompensas obtenidas de forma fraudulenta o mediante cuentas duplicadas, y de cancelar la recompensa si la suscripción de la referida se cancela antes de liberarse.</li>
        <li><strong>Retiros:</strong> el saldo puede retirarse a una cuenta bancaria una vez alcanzado el <strong>monto mínimo de S/50</strong>. El retiro se solicita y tramita manualmente a través de WhatsApp con nuestro soporte. Los datos bancarios que compartas se usan únicamente con ese fin y no se almacenan en la Plataforma.</li>
        <li>El programa de referidos para Clientes finales (&quot;invita amigos&quot;) lo configura cada barbería bajo su propia responsabilidad.</li>
      </ul>

      <h2>8. Obligaciones del Dueño respecto a los datos de sus clientes</h2>
      <p>
        El Dueño que registra a sus Clientes finales declara que cuenta con el <strong>consentimiento</strong> de estos para
        tratar sus datos (nombre y teléfono) con fines de fidelización, y que cumple la normativa de protección
        de datos aplicable. barberia.club actúa como <strong>encargado</strong> de estos datos por cuenta del Dueño. El Dueño
        se compromete a atender las solicitudes de sus clientes sobre sus datos y a no usar la Plataforma para
        fines distintos de los previstos.
      </p>

      <h2>9. Contenido del usuario</h2>
      <p>
        El Dueño puede subir logos, banners e imágenes. Declara que tiene los derechos sobre dicho contenido y
        otorga a barberia.club una licencia para mostrarlo dentro de la Plataforma (incluida la página pública y
        el directorio). El contenido no debe ser ilegal, ofensivo ni infringir derechos de terceros.
      </p>

      <h2>10. Uso aceptable</h2>
      <p>
        Te comprometes a no: (a) usar la Plataforma para fines ilícitos; (b) intentar vulnerar su seguridad o
        eludir los límites de uso; (c) registrar datos de terceros sin su consentimiento; (d) abusar del programa
        de referidos; (e) cargar contenido que infrinja derechos o normas. Podemos suspender o cerrar cuentas que
        incumplan estos Términos.
      </p>

      <h2>11. Disponibilidad del servicio</h2>
      <p>
        La Plataforma se ofrece &quot;tal cual&quot; y &quot;según disponibilidad&quot;. Procuramos su continuidad y realizamos
        copias de seguridad cifradas, pero no garantizamos que el servicio sea ininterrumpido o libre de errores.
      </p>

      <h2>12. Propiedad intelectual</h2>
      <p>
        La marca, el software, el diseño y los contenidos de barberia.club son propiedad de su titular o de sus
        licenciantes. No se concede ningún derecho salvo el uso de la Plataforma conforme a estos Términos.
      </p>

      <h2>13. Limitación de responsabilidad</h2>
      <p>
        En la medida permitida por la ley, barberia.club no será responsable por daños indirectos, lucro cesante
        ni pérdida de datos derivados del uso de la Plataforma. La relación entre la barbería y sus clientes finales
        (servicios de barbería, recompensas ofrecidas) es responsabilidad exclusiva de la barbería.
      </p>

      <h2>14. Terminación y eliminación de cuenta</h2>
      <p>
        Puedes dejar de usar la Plataforma y <a href="/eliminar-cuenta">eliminar tu cuenta</a> en cualquier momento.
        Podemos suspender o terminar cuentas que incumplan estos Términos. Tras la terminación, se aplican los
        plazos y excepciones de eliminación de datos descritos en la Política de Eliminación de Cuenta.
      </p>

      <h2>15. Ley aplicable y jurisdicción</h2>
      <p>
        Estos Términos se rigen por las leyes de la <strong>República del Perú</strong>. Cualquier controversia se someterá a
        los tribunales competentes del Perú, sin perjuicio de los derechos del consumidor.
      </p>

      <h2>16. Cambios</h2>
      <p>
        Podemos modificar estos Términos. Publicaremos la versión vigente con su fecha. El uso continuado tras los
        cambios implica su aceptación.
      </p>

      <h2>17. Contacto</h2>
      <ul>
        <li><strong>Correo:</strong> <a href="mailto:contacto@barberia.club">contacto@barberia.club</a></li>
        <li><strong>WhatsApp:</strong> +51 997 237 775</li>
      </ul>
    </LegalLayout>
  );
}
