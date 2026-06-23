# Política de Privacidad — barberia.club

**Última actualización:** 22 de junio de 2026
**Vigencia:** desde la fecha de publicación.

> ⚠️ **Campos que debes completar antes de publicar** (no figuran en el código): razón social del titular, RUC, domicilio fiscal y, si aplica, nombre del encargado de protección de datos. Aparecen marcados como `[COMPLETAR: ...]`.

---

## 1. Quiénes somos

barberia.club es una plataforma de fidelización para barberías que permite gestionar clientes, visitas, citas, recompensas y un programa de referidos.

- **Responsable del tratamiento:** `[COMPLETAR: razón social]`, con RUC `[COMPLETAR]` y domicilio en `[COMPLETAR]`, Perú.
- **Sitio web:** https://barberia.club
- **Correo de contacto:** contacto@barberia.club
- **WhatsApp de soporte:** +51 997 237 775

Esta política se rige por la **Ley N.º 29733, Ley de Protección de Datos Personales del Perú**, y su Reglamento (D.S. 003-2013-JUS).

---

## 2. A quién aplica esta política (dos tipos de usuario)

barberia.club trata datos de dos grupos distintos, con roles distintos:

1. **Dueños de barbería (titulares de cuenta).** Crean una cuenta con correo y contraseña para administrar su negocio. Respecto a sus datos, barberia.club actúa como **responsable del tratamiento**.

2. **Clientes finales de cada barbería.** Son las personas que se registran en la página de una barbería (dejando su nombre y número de teléfono) para acumular visitas y recompensas. Estos datos los recopila e introduce **la barbería**, que es la responsable de obtener el consentimiento de sus clientes. Respecto a estos datos, **barberia.club actúa como encargado del tratamiento por cuenta de la barbería**, almacenándolos y procesándolos según las instrucciones de esta.

Si eres cliente final y quieres ejercer tus derechos, puedes dirigirte a la barbería donde te registraste o escribirnos a contacto@barberia.club y lo canalizaremos.

---

## 3. Qué datos recopilamos

### 3.1 De los dueños de barbería
- **Identificación y contacto:** nombre, correo electrónico, número de WhatsApp.
- **Credenciales:** contraseña (almacenada **cifrada con bcrypt**; nunca en texto plano).
- **Datos del negocio:** nombre comercial, logo, banner, descripción, dirección (opcional), redes sociales (Instagram, TikTok, Facebook), horarios y servicios con precios.
- **Datos de suscripción y pagos:** plan (FREE/PRO), fechas de vigencia y prueba, identificador de suscripción del procesador de pago e historial de pagos (monto, moneda, estado, método). **No almacenamos números de tarjeta** (los gestiona el procesador de pago).
- **Programa de referidos:** código de referido, relación con la barbería que la refirió, saldo y movimientos de crédito.

### 3.2 De los clientes finales (recopilados por la barbería)
- **Nombre** y **número de teléfono** (identificador principal del cliente dentro de una barbería).
- **Actividad:** visitas, valoraciones (1–5 estrellas), citas (fecha y hora), recompensas canjeadas y referidos.
- Un **código único** asociado al cliente para el sistema de referidos.

> No solicitamos contraseña a los clientes finales; se identifican por su número de teléfono.

### 3.3 Datos técnicos
- **Dirección IP:** se procesa de forma temporal para limitar el número de solicitudes (protección contra abuso). No se almacena en nuestra base de datos.
- **Almacenamiento local en el dispositivo (localStorage):** guardamos el número de teléfono del cliente (para no volver a pedirlo en la misma barbería) y la marca de tiempo de la última revisión de notificaciones.
- **Cookie de sesión:** necesaria para mantener la sesión iniciada de los dueños.

### 3.4 Datos que **no** recopilamos
No recopilamos ubicación GPS del dispositivo, no enviamos notificaciones push, ni correos o SMS automáticos, ni usamos servicios de inteligencia artificial.

---

## 4. Para qué usamos los datos

- Crear y administrar la cuenta del dueño y su barbería.
- Permitir el registro de clientes, el conteo de visitas y la entrega de recompensas.
- Gestionar citas y valoraciones.
- Procesar la suscripción PRO y el programa de referidos (incluido el cálculo de saldos).
- Mostrar el directorio público de barberías (`/descubrir`) y la página pública de cada barbería.
- Proteger la plataforma frente a abusos (límite de solicitudes por IP).
- Medir el uso y rendimiento de la plataforma y realizar publicidad (ver sección 6).

---

## 5. Base legal del tratamiento

Tratamos los datos sobre la base del **consentimiento** del titular, la **ejecución del contrato** (prestación del servicio al dueño), el **interés legítimo** (seguridad de la plataforma) y el **cumplimiento de obligaciones legales** (p. ej., tributarias respecto a los pagos).

---

## 6. Cookies y tecnologías de seguimiento

Utilizamos:

| Tecnología | Finalidad | ¿Requiere consentimiento? |
|------------|-----------|----------------------------|
| Cookie de sesión (inicio de sesión) | Funcional / necesaria | No |
| Almacenamiento local (teléfono, notificaciones) | Funcional | No |
| **Google Analytics 4** | Analítica de uso | Sí |
| **Meta (Facebook) Pixel** | Publicidad y medición | Sí |
| **TikTok Pixel** | Publicidad y medición | Sí |

Las herramientas de analítica y publicidad (Google, Meta, TikTok) **solo se activan tras obtener tu consentimiento** mediante el aviso de cookies que se muestra al ingresar. Puedes **aceptar o rechazar** estas tecnologías y cambiar tu elección en cualquier momento desde el mismo aviso. Si las rechazas, la plataforma sigue funcionando con normalidad.

Estas herramientas pueden usar cookies e identificadores y compartir datos (como la dirección IP y eventos de navegación) con Google, Meta y TikTok con fines de medición y publicidad.

---

## 7. Con quién compartimos los datos

Compartimos datos con proveedores que nos ayudan a operar el servicio:

| Proveedor | Finalidad | Datos involucrados |
|-----------|-----------|--------------------|
| Google Analytics | Analítica | Navegación, identificadores, IP |
| Meta (Facebook) | Publicidad/medición | Eventos, cookies, IP |
| TikTok | Publicidad/medición | Eventos, cookies, IP |
| PayPal | Cobro de la suscripción | Datos de pago (en el entorno de PayPal) |
| Mercado Pago | Cobro de la suscripción | Datos de pago (en el entorno de Mercado Pago) |
| Vercel (Blob/hosting) | Alojamiento e imágenes y copias de seguridad cifradas | Imágenes, datos de la app |
| Supabase | Base de datos | Todos los datos de la plataforma |
| Google Maps | Abrir la ubicación de una barbería | La dirección (texto) de la barbería |
| WhatsApp | Enlaces de contacto y trámite de retiros | Número de teléfono y mensaje |
| exchangerate-api.com | Mostrar precios en moneda local | Ningún dato personal |

No vendemos datos personales. La compartición con Google/Meta/TikTok solo ocurre si has dado tu consentimiento (sección 6).

---

## 8. Pagos

Las suscripciones PRO se cobran a través de **PayPal** o **Mercado Pago**. Los datos de la tarjeta o medio de pago se introducen y procesan en el entorno seguro de esos proveedores; barberia.club **no recibe ni almacena** los datos de la tarjeta. Solo guardamos el resultado del pago (monto, moneda, estado, método) y el identificador de la suscripción.

---

## 9. Conservación, seguridad y transferencias internacionales

- **Seguridad:** contraseñas cifradas con bcrypt; transmisión por HTTPS; verificación de firma en los webhooks de pago; control de acceso por roles.
- **Copias de seguridad:** realizamos copias diarias de la base de datos **cifradas con AES-256-GCM**. Conservamos aproximadamente las **últimas 30 copias** (alrededor de un mes) en el almacenamiento de Vercel; las más antiguas se eliminan automáticamente.
- **Conservación:** conservamos los datos mientras la cuenta esté activa y durante los plazos legales aplicables (p. ej., obligaciones tributarias sobre los pagos). Tras la eliminación de la cuenta, ver la **Política de Eliminación de Cuenta**.
- **Transferencias internacionales:** algunos proveedores (Vercel, Supabase, Google, Meta, TikTok) procesan datos fuera del Perú, principalmente en Estados Unidos. Al usar la plataforma aceptas estas transferencias, sujetas a las garantías de cada proveedor.

---

## 10. Tus derechos

Como titular de datos, tienes derecho a **acceder, rectificar, actualizar, oponerte, cancelar (suprimir)** tus datos y, cuando corresponda, a la **portabilidad**, conforme a la Ley N.º 29733.

Para ejercerlos, escribe a **contacto@barberia.club**. Responderemos en los plazos legales. También puedes presentar reclamaciones ante la **Autoridad Nacional de Protección de Datos Personales** del Perú.

Para eliminar tu cuenta y tus datos, consulta la **Política de Eliminación de Cuenta** (sección 11).

---

## 11. Eliminación de cuenta

Puedes eliminar tu cuenta y los datos asociados:
- **Desde la aplicación:** opción "Eliminar mi cuenta" en la configuración de tu barbería.
- **Desde la web, sin instalar la app:** https://barberia.club/eliminar-cuenta
- **Por contacto:** escribiendo a contacto@barberia.club o al WhatsApp +51 997 237 775.

El detalle de qué se elimina, los plazos y las excepciones está en la **Política de Eliminación de Cuenta**.

---

## 12. Menores de edad

La plataforma está dirigida a barberías y personas mayores de edad. No recopilamos conscientemente datos de menores de edad para crear cuentas de dueño.

---

## 13. Cambios a esta política

Podemos actualizar esta política. Publicaremos la versión vigente en esta página con su fecha de actualización. Los cambios relevantes se comunicarán por medios razonables.

---

## 14. Contacto

- **Correo:** contacto@barberia.club
- **WhatsApp:** +51 997 237 775
- **Responsable:** `[COMPLETAR: razón social, RUC, domicilio]`
