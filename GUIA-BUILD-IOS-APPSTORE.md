# Guia Completa: Build iOS y Subida a App Store con EAS

Esta guia te explica paso a paso como preparar tu app, generar el build para iOS usando EAS (Expo Application Services) y subirla a la App Store.

## Flujo Rapido (Para los que ya tienen todo configurado)

Si ya tienes todo listo y solo quieres generar y subir un build:

```bash
# 1. Generar el build
eas build --platform ios --profile production

# 2. Esperar a que termine (10-20 min)
# 3. Subir directamente a App Store Connect
eas submit --platform ios

# 4. Seleccionar el build mas reciente
# 5. Ingresar Apple ID y App-Specific Password
# 6. Listo! En 5-10 min estara en App Store Connect
```

Si es tu primera vez o necesitas configurar algo, sigue la guia completa abajo.

---

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuracion Inicial](#configuracion-inicial)
3. [Preparar el Proyecto](#preparar-el-proyecto)
4. [Configurar EAS Build](#configurar-eas-build)
5. [Generar el Build para iOS](#generar-el-build-para-ios)
6. [Preparar App Store Connect](#preparar-app-store-connect)
7. [Subir a App Store con EAS Submit](#subir-a-app-store)
8. [Proceso de Revision](#proceso-de-revision)
9. [Actualizaciones Futuras](#actualizaciones-futuras)
10. [Solución de Problemas Comunes](#solucion-de-problemas-comunes)

---

## Requisitos Previos

Antes de empezar necesitas tener:

### 1. Cuenta de Apple Developer
- Inscripcion al Apple Developer Program (cuesta $99 USD al año)
- Puedes inscribirte en: https://developer.apple.com/programs/

### 2. Cuenta de Expo
- Cuenta gratuita en Expo
- Crear en: https://expo.dev/signup

### 3. Herramientas Instaladas
```bash
# Node.js (version 18 o superior)
node --version

# npm o yarn
npm --version

# EAS CLI
npm install -g eas-cli

# Verificar instalacion
eas --version
```

### 4. Archivos que Debes Tener
- **GoogleService-Info.plist** - Archivo de configuracion de Firebase para iOS 
- **Icono de la app** - En `assets/images/mechanic-fixes.png`
- **Splash screen** - En `assets/images/splash-icon.png`

---

## Configuracion Inicial

### Paso 1: Iniciar Sesion en EAS

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
eas login
```

Te pedira tu email y contraseña de Expo. Ingresalos y espera confirmacion.

### Paso 2: Configurar el Proyecto en EAS

Si es la primera vez que usas EAS en este proyecto:

```bash
eas build:configure
```

Este comando:
- Creara o actualizara el archivo `eas.json`
- Te preguntara que plataformas quieres configurar (selecciona iOS)
- Vinculara el proyecto con tu cuenta de Expo

---

## Preparar el Proyecto

### Paso 1: Verificar app.json

Asegurate de que tu archivo `app.json` tenga toda la informacion correcta:

```json
{
  "expo": {
    "name": "Mechanic Fixes",
    "slug": "mechanic-fixes",
    "version": "1.0.4",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.mecanicfixes.ds2025",
      "googleServicesFile": "./GoogleService-Info.plist",
      "buildNumber": "1"
    }
  }
}
```

**Importante:**
- `version`: Version visible para usuarios (ej: 1.0.4)
- `buildNumber`: Numero de build interno (debe incrementarse en cada nuevo build)
- `bundleIdentifier`: Debe ser unico y estar registrado en Apple Developer

### Paso 2: Verificar eas.json

Tu archivo `eas.json` debe verse similar a esto:

```json
{
  "build": {
    "production": {
      "ios": {
        "simulator": false,
        "enterpriseProvisioning": "adhoc"
      }
    },
    "preview": {
      "ios": {
        "simulator": true
      }
    }
  }
}
```

**Perfiles explicados:**
- `production`: Para subir a App Store (dispositivos reales)
- `preview`: Para probar en simulador
- `development`: Para desarrollo interno

---

## Configurar EAS Build

### Paso 1: Credenciales de Apple

EAS necesita tus credenciales de Apple Developer para crear los certificados y perfiles de aprovisionamiento.

Tienes dos opciones:

#### Opcion A: EAS maneja todo automaticamente (Recomendado)

EAS creara y manejara los certificados por ti. Es la forma mas facil.

```bash
eas build --platform ios --profile production
```

EAS te preguntara:
- "Would you like to log in to your Apple account?" → Responde **yes**
- Ingresa tu Apple ID (email de tu cuenta de Apple Developer)
- Ingresa tu contraseña
- Si tienes autenticacion de dos factores, ingresa el codigo

EAS automaticamente:
- Creara los certificados de distribucion
- Creara los perfiles de aprovisionamiento
- Los guardara en tus servidores de Expo

#### Opcion B: Usar tus propios certificados

Si ya tienes certificados creados manualmente en Apple Developer Portal:

```bash
eas credentials
```

Sigue el menu interactivo para subir tus certificados.

### Paso 2: Verificar Credenciales

Para ver que credenciales estan configuradas:

```bash
eas credentials --platform ios
```

---

## Generar el Build para iOS

### Build de Produccion para App Store

Este es el build que subirás a la App Store:

```bash
eas build --platform ios --profile production
```

**Que pasara:**

1. EAS sube tu codigo a sus servidores
2. Instala todas las dependencias
3. Compila el proyecto nativo de iOS
4. Crea el archivo `.ipa` (el instalable de iOS)
5. Te da un link para descargar el `.ipa`

**Tiempo estimado:** 10-20 minutos

**Resultado:**
- Al terminar veras un mensaje como: "Build finished successfully"
- Te dara un link para descargar el archivo `.ipa`
- Tambien puedes ver todos tus builds en: https://expo.dev/accounts/[tu-cuenta]/projects/mechanic-fixes/builds

### Build de Preview (Opcional)

Si quieres probar en el simulador de Xcode primero:

```bash
eas build --platform ios --profile preview
```

Este build es para pruebas, no para App Store.

---

## Preparar App Store Connect

Antes de subir el build, necesitas crear la app en App Store Connect.

### Paso 1: Acceder a App Store Connect

1. Ve a: https://appstoreconnect.apple.com
2. Inicia sesion con tu Apple ID de Developer
3. Haz clic en "My Apps"

### Paso 2: Crear Nueva App

1. Haz clic en el boton "+" y selecciona "New App"
2. Llena el formulario:

   - **Platform:** iOS
   - **Name:** Mechanic Fixes
   - **Primary Language:** Spanish (Spain) o English (U.S.)
   - **Bundle ID:** Selecciona `com.mecanicfixes.ds2025` (debe estar registrado en tu cuenta de developer)
   - **SKU:** Un identificador unico para tu app (ej: mechanic-fixes-2025)
   - **User Access:** Full Access

3. Haz clic en "Create"

### Paso 3: Llenar Informacion de la App

#### Pestaña App Information:
- **Category:** Productivity o Business
- **Content Rights:** (Si aplica)

#### Pestaña Pricing and Availability:
- **Price:** Free (Gratis) o selecciona un precio
- **Availability:** Selecciona los paises donde estara disponible

#### Pestaña App Privacy:
- Debes llenar el cuestionario de privacidad
- Basandote en tu app:
  - Recopilas fotos/videos (SI)
  - Recopilas audio (SI)
  - Recopilas datos de usuario (SI - email, nombre)
  - Vinculas datos al usuario (SI)
- Link a tu politica de privacidad: https://sites.google.com/view/poltica-de-privacidad-mechanic/

#### Pestaña Prepare for Submission:

Aqui llenaras:

**Screenshots:**
- Necesitas capturas de pantalla de la app
- Tamaños requeridos (al menos uno):
  - iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max)
  - iPhone 6.5" (iPhone 11 Pro Max, XS Max)
- Puedes usar simuladores de Xcode para tomarlas

**Promotional Text:** (Opcional)
Texto promocional que puedes actualizar sin enviar nueva version.

**Description:**
```
Aplicacion profesional para documentar y gestionar reparaciones mecanicas y electricas de vehiculos. Permite a los tecnicos capturar fotos, videos y notas de audio sobre diagnosticos y trabajos realizados.

Caracteristicas:
- Registro de problemas mecanicos y electricos
- Captura de fotos y videos de alta calidad
- Grabacion de notas de voz
- Busqueda de soluciones previas
- Gestion de ordenes de trabajo
- Sistema de permisos por rol
```

**Keywords:**
```
mecanico, reparacion, vehiculos, diagnostico, taller, camiones, diesel
```

**Support URL:**
URL de tu sitio web o pagina de soporte.

**Marketing URL:** (Opcional)
URL de marketing de tu app.

**Copyright:**
```
2025 DIESELSOFT
```

**App Review Information:**
- **Contact Information:** Tu nombre, telefono y email
- **Notes:** Instrucciones especiales para el revisor
  - Incluye credenciales de prueba si tu app requiere login
  - Ejemplo:
    ```
    Demo Account:
    Email: demo@dieselsoft.co
    Password: DemoTest123
    ```

**Version Information:**
- **Version:** 1.0.4 (debe coincidir con app.json)

---

## Subir a App Store

Ahora que tienes el build y la app configurada en App Store Connect, es momento de subir el archivo.

### Metodo Recomendado: EAS Submit (Automatico y Facil)

Este es el metodo mas rapido y sencillo. EAS sube el build directamente a App Store Connect sin necesidad de descargar archivos.

#### Paso 1: Generar App-Specific Password

Antes de ejecutar el comando, necesitas generar una contraseña especifica para aplicaciones:

1. Ve a: https://appleid.apple.com/account/manage
2. Inicia sesion con tu Apple ID
3. En la seccion "Security", busca "App-Specific Passwords"
4. Haz clic en "Generate Password..."
5. Dale un nombre (ejemplo: "EAS Submit Mechanic Fixes")
6. Copia la contraseña generada (formato: xxxx-xxxx-xxxx-xxxx)
7. **Guardala en un lugar seguro**, la necesitaras cada vez que hagas submit

**Nota:** Esta contraseña es diferente a tu contraseña normal de Apple ID.

#### Paso 2: Ejecutar EAS Submit

En la terminal, ejecuta:

```bash
eas submit --platform ios
```

#### Paso 3: Seguir el Proceso Interactivo

EAS te guiara paso a paso:

**1. Seleccionar Build:**
```
? Select a build from the list (Use arrow keys)
❯ Build ID: abc123... - Version 1.0.4 (Build 1) - Dec 10, 2024
  Build ID: xyz789... - Version 1.0.3 (Build 1) - Dec 05, 2024
```
Selecciona el build mas reciente que acabas de generar.

**2. Ingresar Apple ID:**
```
? Apple ID: [tu-email@dieselsoft.co]
```
Ingresa tu Apple ID (el de tu cuenta de Apple Developer).

**3. Ingresar App-Specific Password:**
```
? App-specific password:
```
Pega la contraseña que generaste en el Paso 1.

**4. Proceso Automatico:**
EAS automaticamente:
- Valida tus credenciales
- Conecta con App Store Connect
- Sube el archivo .ipa
- Muestra el progreso en tiempo real

**5. Confirmacion:**
```
✔ Successfully submitted build to App Store Connect!
```

**Tiempo estimado:** 5-10 minutos

#### Ventajas de EAS Submit:
- No necesitas descargar el archivo .ipa
- No necesitas instalar Transporter
- Todo se hace desde la terminal
- Manejo automatico de autenticacion
- Muestra errores claramente si algo falla

### Metodo Alternativo: Transporter (Manual)

Solo usa este metodo si EAS Submit falla o prefieres hacerlo manualmente:

1. Descarga el archivo `.ipa` del build desde el link que te dio EAS
2. En una Mac, descarga la app "Transporter" de la Mac App Store
3. Abre Transporter e inicia sesion con tu Apple ID
4. Arrastra el archivo `.ipa` a la ventana de Transporter
5. Haz clic en "Deliver"
6. Espera a que termine la subida (5-10 minutos)

**Nota:** Transporter solo funciona en macOS.

### Verificar que la Subida fue Exitosa

1. Ve a App Store Connect
2. Entra a tu app "Mechanic Fixes"
3. Ve a la pestaña "TestFlight" o "Activity"
4. En unos minutos (5-15 min) veras el build aparecer
5. El build pasara por un proceso automatico de validacion

**Estados del build:**
- **Processing:** Apple esta procesando el build
- **Ready to Submit:** El build esta listo para enviar a revision
- **Waiting for Review:** En cola para revision
- **In Review:** Apple esta revisando tu app
- **Pending Developer Release:** Aprobado, esperando que tu lo liberes
- **Ready for Sale:** La app esta disponible en la App Store

---

## Proceso de Revision

### Paso 1: Seleccionar Build

1. En App Store Connect, ve a tu app
2. En la seccion "Build", haz clic en "Add Build" o el boton "+"
3. Selecciona el build que subiste
4. Guarda los cambios

### Paso 2: Enviar a Revision

1. Revisa que toda la informacion este completa
2. Responde el "Export Compliance" (si tu app no usa encriptacion fuerte, responde "No")
3. Haz clic en "Submit for Review"

### Paso 3: Esperar Revision

**Tiempos tipicos:**
- **Revision inicial:** 1-3 dias
- **Actualizaciones:** 24-48 horas

**Que revisa Apple:**
- Que la app funcione correctamente
- Que no tenga contenido ofensivo
- Que cumpla las guidelines de Apple
- Que la app haga lo que dice en la descripcion
- Que no tenga bugs criticos

### Paso 4: Posibles Resultados

#### Aprobada ✓
Tu app fue aprobada y puedes liberarla:
1. Ve a App Store Connect
2. Haz clic en "Release this Version"
3. Tu app estara disponible en la App Store en unas horas

#### Rechazada ✗
Apple te enviara un mensaje explicando por que fue rechazada:
- Lee el mensaje cuidadosamente
- Corrige los problemas mencionados
- Genera un nuevo build (incrementa el buildNumber en app.json)
- Vuelve a subir
- Envia nuevamente a revision

---

## Actualizaciones Futuras

Para subir una nueva version de tu app:

### Paso 1: Actualizar Version

En `app.json`:
```json
{
  "expo": {
    "version": "1.0.5",  // Incrementa la version
    "ios": {
      "buildNumber": "2"  // Incrementa el buildNumber
    }
  }
}
```

### Paso 2: Generar Nuevo Build

```bash
eas build --platform ios --profile production
```

### Paso 3: Crear Nueva Version en App Store Connect

1. Ve a App Store Connect
2. Entra a tu app
3. Haz clic en "+ Version or Platform"
4. Selecciona "iOS"
5. Ingresa la nueva version (1.0.5)
6. Llena "What's New in This Version" con los cambios
7. Sube el nuevo build
8. Envia a revision

---

## Solucion de Problemas Comunes

### Error: "Bundle identifier is already in use"

**Solucion:**
- El bundle ID ya esta registrado en otra cuenta
- Ve a https://developer.apple.com/account
- En "Certificates, Identifiers & Profiles"
- Verifica que el bundle ID este en tu cuenta

### Error: "No provisioning profiles found"

**Solucion:**
```bash
eas credentials --platform ios
```
Regenera los perfiles de aprovisionamiento.

### Error: "Build failed - Missing GoogleService-Info.plist"

**Solucion:**
- Verifica que el archivo `GoogleService-Info.plist` este en la raiz del proyecto
- Verifica que en `app.json` la ruta sea correcta:
  ```json
  "googleServicesFile": "./GoogleService-Info.plist"
  ```

### El build tarda mucho

**Normal:**
- Primer build: 15-25 minutos
- Builds siguientes: 10-15 minutos

Si tarda mas de 30 minutos, puede haber un problema. Revisa los logs en:
https://expo.dev/accounts/[tu-cuenta]/projects/mechanic-fixes/builds

### Error al subir: "App-Specific Password required"

**Solucion:**
1. Ve a https://appleid.apple.com
2. Inicia sesion
3. En "Security" genera una contraseña especifica para apps
4. Usa esa contraseña cuando EAS la pida

### Error: "Asset validation failed"

**Causas comunes:**
- Iconos en formato o tamaño incorrecto
- Permisos mal configurados en Info.plist
- Certificados vencidos

**Solucion:**
Revisa el mensaje especifico de error en App Store Connect en la seccion "Activity".

### La app fue rechazada por "Guideline 2.1 - Performance"

**Solucion:**
- Asegurate de que la app no tenga crashes
- Prueba todas las funcionalidades antes de enviar
- Incluye credenciales de prueba funcionales para el revisor

### Error: "This bundle is invalid"

**Solucion:**
- Regenera el build con `eas build --platform ios --profile production --clear-cache`
- El flag `--clear-cache` limpia el cache y hace un build limpio

---

## Checklist Final Antes de Enviar

Antes de enviar tu app a revision, verifica:

- [ ] La app funciona correctamente sin crashes
- [ ] Todos los permisos estan correctamente descritos (camara, fotos, microfono)
- [ ] Las capturas de pantalla muestran la app actual
- [ ] La descripcion es clara y precisa
- [ ] Proporcionaste credenciales de prueba validas
- [ ] La politica de privacidad esta accesible
- [ ] El build number fue incrementado
- [ ] La version coincide entre app.json y App Store Connect
- [ ] Los archivos de Firebase estan incluidos
- [ ] Probaste la funcionalidad de login
- [ ] Probaste subir fotos/videos
- [ ] No hay contenido placeholder o de prueba visible

---

## Comandos Utiles de Referencia Rapida

```bash
# Iniciar sesion en EAS
eas login

# Ver informacion del proyecto
eas project:info

# Configurar EAS
eas build:configure

# Generar build de produccion para iOS
eas build --platform ios --profile production

# Ver builds anteriores
eas build:list --platform ios

# Subir a App Store
eas submit --platform ios

# Ver credenciales configuradas
eas credentials --platform ios

# Limpiar cache y hacer build limpio
eas build --platform ios --profile production --clear-cache

# Ver logs de un build especifico
eas build:view [BUILD_ID]
```

---

## Recursos Adicionales

- **Documentacion oficial de EAS Build:** https://docs.expo.dev/build/introduction/
- **Documentacion de EAS Submit:** https://docs.expo.dev/submit/introduction/
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **App Store Connect:** https://appstoreconnect.apple.com
- **Apple Developer Portal:** https://developer.apple.com/account

---

Esta guia cubre todo el proceso desde cero hasta tener tu app publicada en la App Store. Si tienes dudas en algun paso especifico, consulta la documentacion oficial o revisa los mensajes de error que te proporcione EAS o Apple.

Buena suerte con tu publicacion!
