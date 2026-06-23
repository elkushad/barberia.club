# Google Play — Respuestas para Data Safety (Seguridad de los datos)

**Última actualización:** 22 de junio de 2026

Este documento contiene las respuestas a la sección **Data Safety** de Google Play Console, derivadas del comportamiento real del sistema. Úsalo para rellenar el formulario. Las respuestas reflejan que la app **recopila** y **comparte** ciertos datos.

> ⚠️ La compartición con Google/Meta/TikTok depende de tener implementado y activo el seguimiento. Como el sistema carga GA4 + Meta Pixel + TikTok Pixel, las respuestas asumen **"sí comparte con fines de analítica/publicidad"**. Si decides desactivar esos pixeles, actualiza estas respuestas.

---

## A. Preguntas generales

| Pregunta | Respuesta |
|----------|-----------|
| ¿Tu app recopila o comparte datos de usuario? | **Sí** |
| ¿Todos los datos se transmiten cifrados? | **Sí** (HTTPS / TLS) |
| ¿Ofreces una forma de solicitar la eliminación de datos? | **Sí** (in-app + URL https://barberia.club/eliminar-cuenta) |
| ¿Los datos recopilados son obligatorios u opcionales? | Mezcla (ver cada tipo) |

---

## B. Tipos de datos recopilados, compartidos y finalidad

Leyenda — **Recopila** = se almacena/procesa en servidores; **Comparte** = se envía a terceros; **Finalidad**.

### Información personal
| Dato | Recopila | Comparte | Finalidad |
|------|----------|----------|-----------|
| Nombre | Sí | No | Funcionalidad de la app, gestión de cuenta |
| Dirección de correo electrónico | Sí | No | Gestión de cuenta, inicio de sesión |
| Número de teléfono | Sí | No | Funcionalidad de la app (identificar al cliente, contacto) |
| Dirección (del negocio) | Sí | No | Funcionalidad de la app (mostrar la barbería) |
| Otra información (redes sociales del negocio) | Sí | No | Funcionalidad de la app |

### Información financiera
| Dato | Recopila | Comparte | Finalidad |
|------|----------|----------|-----------|
| Historial de compras (suscripción) | Sí | No | Funcionalidad de la app, gestión de la suscripción |
| Información de pago (tarjeta) | **No** (la maneja PayPal/Mercado Pago) | No | — |

### Actividad en la app
| Dato | Recopila | Comparte | Finalidad |
|------|----------|----------|-----------|
| Interacciones con la app (visitas, citas, canjes, valoraciones) | Sí | No | Funcionalidad de la app |
| Otras acciones del usuario | Sí | Sí (eventos a Meta/TikTok/GA si hay consentimiento) | Análisis y publicidad |

### Información web / identificadores
| Dato | Recopila | Comparte | Finalidad |
|------|----------|----------|-----------|
| Identificadores / cookies (GA, Meta Pixel, TikTok Pixel) | Sí | **Sí** | Análisis, publicidad/marketing |

### Ubicación
| Dato | Recopila | Comparte | Finalidad |
|------|----------|----------|-----------|
| Ubicación aproximada (dirección del negocio, texto) | Sí | No | Funcionalidad de la app (mostrar/enlazar el local) |
| Ubicación precisa (GPS) | **No** | No | — |

### Registros y diagnóstico
| Dato | Recopila | Comparte | Finalidad |
|------|----------|----------|-----------|
| Dirección IP | Sí (temporal, no persistida) | No | Prevención de fraude / abuso, seguridad |

---

## C. Prácticas de seguridad

| Pregunta | Respuesta |
|----------|-----------|
| ¿Los datos se cifran en tránsito? | **Sí** (HTTPS/TLS) |
| ¿El usuario puede solicitar que se eliminen sus datos? | **Sí** (in-app + web + correo/WhatsApp) |
| ¿Sigues alguna política de retención y eliminación? | **Sí** (ver Política de Eliminación de Cuenta) |
| Cifrado adicional en reposo | Contraseñas con bcrypt; copias de seguridad cifradas con AES-256-GCM |

---

## D. Compartición con terceros (detalle para la sección de "Compartición")

| Tercero | Datos | Finalidad declarada |
|---------|-------|---------------------|
| Google (Analytics) | Identificadores, eventos de uso, IP | Analítica |
| Meta (Facebook Pixel) | Identificadores, eventos, IP | Publicidad / medición |
| TikTok (Pixel) | Identificadores, eventos, IP | Publicidad / medición |
| PayPal / Mercado Pago | Datos de pago (en su entorno) | Procesamiento de pagos |

> Nota: PayPal y Mercado Pago se consideran **procesadores de pago**; según la guía de Google, el procesamiento de pagos puede declararse como transferencia a un proveedor de servicios, no como "compartición" con fines propios. GA/Meta/TikTok **sí** se declaran como compartición con fines de analítica/publicidad.

---

## E. Enlaces obligatorios en la ficha de Play

- **Política de Privacidad (URL):** https://barberia.club/privacidad ⚠️ *(debe estar publicada y accesible públicamente)*
- **URL de eliminación de cuenta:** https://barberia.club/eliminar-cuenta ⚠️ *(debe ser accesible sin instalar la app)*

---

## F. Cuenta y eliminación (sección específica de Play)

| Pregunta | Respuesta |
|----------|-----------|
| ¿La app permite crear una cuenta? | **Sí** (dueños de barbería) |
| ¿Los usuarios pueden solicitar la eliminación de la cuenta dentro de la app? | **Sí** |
| ¿Existe una URL web para solicitar la eliminación sin la app? | **Sí** — https://barberia.club/eliminar-cuenta |
| ¿Se eliminan también los datos asociados? | **Sí**, salvo las excepciones de retención legal/copias cifradas (ver política) |
