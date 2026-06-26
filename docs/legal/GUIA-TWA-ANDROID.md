# Guía — Empaquetar barberia.club como app Android (TWA) para Google Play

**Objetivo (#10):** publicar barberia.club en Google Play como una **TWA** (Trusted Web Activity) con **Bubblewrap**, con Play Billing habilitado (prerequisito de #9).

Una TWA es tu sitio web mostrado a pantalla completa, sin barra del navegador, verificado mediante **Digital Asset Links** (`assetlinks.json`).

---

## Archivos que ya dejé en el repo

| Archivo | Para qué |
|---------|----------|
| `src/app/manifest.ts` | Web App Manifest → se sirve en `https://barberia.club/manifest.webmanifest`. Hace la app instalable. |
| `public/.well-known/assetlinks.json` | Verificación del dominio ↔ app. **Falta** poner tu huella SHA-256 (paso 5). |
| `twa-manifest.json` | Configuración de Bubblewrap (nombre, colores, icono, Play Billing). |

> Tras desplegar, comprueba que cargan:
> - https://barberia.club/manifest.webmanifest
> - https://barberia.club/.well-known/assetlinks.json

---

## Requisitos previos

- **Node.js** (ya lo tienes).
- **JDK 17** y **Android SDK**: Bubblewrap los descarga solo la primera vez (`bubblewrap doctor` te guía). No necesitas Android Studio.
- Una **cuenta de Google Play Console** (pago único de USD 25).
- Un **icono PNG cuadrado de al menos 512×512** en `public/icon.png`. ✅ Resuelto: ahora es PNG 1024×1024 (convertido desde el JPEG que se había subido por error con extensión .png).

---

## Pasos

### 1. Instalar Bubblewrap
```bash
npm install -g @bubblewrap/cli
# o sin instalar global:  npx @bubblewrap/cli <comando>
```

### 2. Revisar `twa-manifest.json`
- `packageId`: `club.barberia.app` — este es el **identificador definitivo** de la app en Play. Cámbialo ahora si prefieres otro; debe coincidir con el de `assetlinks.json` (paso 5). No se puede cambiar tras publicar.
- Colores/icono ya están configurados al tema del sitio.

### 3. Inicializar el proyecto Android
```bash
bubblewrap init --manifest=https://barberia.club/manifest.webmanifest
```
Cuando pregunte, **responde "Sí" a incluir Play Billing** (o usa el `twa-manifest.json` de este repo, que ya lo trae). Si prefieres partir del archivo del repo:
```bash
bubblewrap init --manifest=./twa-manifest.json
```

### 4. Generar la app firmada
```bash
bubblewrap build
```
- En el primer build, Bubblewrap crea un **keystore** (`android.keystore`) y te pide una contraseña. **Guárdala muy bien**: sin ella no podrás publicar actualizaciones. **No subas el keystore al repo.**
- Resultado: `app-release-bundle.aab` (esto es lo que se sube a Play).

### 5. Obtener la huella SHA-256 y completar `assetlinks.json`
Hay dos huellas posibles; usa la del **App Signing de Play** (recomendado):

- **Opción A (recomendada):** sube primero el `.aab` a Play Console → **Configuración › Integridad de la app › App signing**. Ahí Google te muestra el **SHA-256 del certificado de firma de la app**. Cópialo.
- **Opción B (tu keystore local):**
  ```bash
  keytool -list -v -keystore android.keystore -alias android
  ```
  y copia la línea `SHA256:`.

Pega esa huella en `public/.well-known/assetlinks.json` reemplazando `REEMPLAZAR_CON_EL_SHA256_DE_PLAY_APP_SIGNING`, haz commit y despliega. Verifica con:
https://developers.google.com/digital-asset-links/tools/generator

> Si usas App Signing de Play (lo normal), la huella correcta es la de Play, no la de tu keystore local.

### 6. Subir a Google Play Console
- Crea la app, completa la ficha (usa la **Política de Privacidad** `https://barberia.club/privacidad`, **eliminación de cuenta** `https://barberia.club/eliminar-cuenta` y la ficha de **Data Safety** ya redactada).
- Sube el `.aab`, completa el cuestionario de contenido y envía a revisión.

### 7. Verificar la TWA
- Instala la app desde Play (o por internal testing). Debe abrir **sin barra de navegador**. Si aparece la barra, el `assetlinks.json` no está verificado (revisa huella y `packageId`).

---

## Runbook interactivo (respuestas exactas a cada prompt)

Bubblewrap ya está instalado (`@bubblewrap/cli@1.24.1`). Corre esto **en tu propia terminal (PowerShell)**, en una carpeta **fuera del repo** para no mezclar el keystore con el código:

```powershell
cd C:\Users\Windows\Desktop
mkdir barberia-twa
cd barberia-twa
bubblewrap init --manifest=https://barberia.club/manifest.webmanifest
```

La **primera vez** te preguntará si descarga el **JDK 17** y el **Android SDK** → responde **Sí** a ambos y acepta las licencias. Luego, respuestas a los prompts:

| Prompt | Respuesta |
|--------|-----------|
| Domain | `barberia.club` (ya viene del manifest) |
| URL path | `/` |
| Application name | `Barbería Club` |
| Short name | `Barbería` |
| Application ID (package) | **`club.barberia.app`** (escríbelo exacto) |
| Starting version code | `1` |
| Display mode | `standalone` |
| Orientation | `portrait` |
| Status bar / splash colors | Enter (acepta los del tema) |
| Icon / Maskable icon URL | Enter (usa tu `icon.png` 1024) |
| Monochrome icon | dejar vacío |
| **Include support for Play Billing** | **Yes** ✅ |
| Request geolocation permission | No |
| Include app shortcuts | No |
| Key store location | `./android.keystore` (default) |
| Key alias | `android` (default) |
| **Contraseña del keystore / de la clave** | **Elige una y GUÁRDALA muy bien** |

Luego genera la app:
```powershell
bubblewrap build
```
Te pedirá las contraseñas que pusiste. Resultado:
- **`app-release-bundle.aab`** → esto subes a Play.
- `app-release-signed.apk` → para probar en un teléfono.

> ⚠️ **Guarda con tu vida:** `android.keystore` + las contraseñas. Sin ellos no podrás publicar actualizaciones. No los subas a ningún repo (ya están en `.gitignore`).

### Sobre la huella SHA-256 (assetlinks)
- La huella **definitiva** la da **Play Console → App signing** *después* de subir el `.aab` (requiere tu cuenta ya verificada). Esa es la que va en `public/.well-known/assetlinks.json`.
- La huella de tu keystore local (de `bubblewrap build`) sirve solo si quieres probar el APK firmado localmente. `assetlinks.json` acepta **varias** huellas en el array, así que se pueden tener ambas.
- Cuando tengas la huella de Play, pásamela y actualizo `assetlinks.json` + despliego.

## Después de #10 viene #9 (Play Billing)
Con la TWA publicada y verificada, seguimos con `PLAN-GOOGLE-PLAY-BILLING.md`:
1. Crear el producto de suscripción en Play Console.
2. Crear la Service Account + variables de entorno.
3. Implemento el código de billing (frontend Digital Goods + `/api/play/verify` + `/api/play/rtdn`).

---

## Notas
- **No subir al repo:** `android.keystore`, contraseñas ni el `.aab`. Añádelos a `.gitignore` si trabajas el proyecto Android dentro de esta carpeta (recomendado: genéralo en una carpeta aparte).
- `packageId` y la huella SHA-256 deben **coincidir** entre la app y `assetlinks.json`, o la verificación falla.
