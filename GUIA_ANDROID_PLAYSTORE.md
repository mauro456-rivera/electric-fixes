# Guía para Publicar en Google Play Store

## 📋 Pre-requisitos

1. **Cuenta de Google Play Console**
   - Crear cuenta en: https://play.google.com/console
   - Pago único de $25 USD para registro de desarrollador
   - Verificar identidad con documento oficial

2. **Información de la App**
   - Nombre de la app: Mechanic Fixes
   - Package ID: mecanic_ixes.ds_2025
   - Versión actual: 1.0.1 (versionCode: 15)

## 🔑 Paso 1: Generar Keystore para Firma

```bash
# Generar keystore (solo la primera vez)
eas credentials

# Seleccionar:
# 1. Android
# 2. production
# 3. Keystore: Set up a new keystore
```

**IMPORTANTE:** EAS generará y guardará tu keystore automáticamente.

## 🏗️ Paso 2: Construir el APK/Bundle

### Opción A: Build con EAS (Recomendado)

```bash
# Build para producción (genera AAB - Android App Bundle)
eas build --platform android --profile production

# Esperar a que termine el build (puede tomar 10-20 minutos)
# Al terminar, recibirás un link para descargar el .aab
```

### Opción B: Build local

```bash
# Si prefieres build local
eas build --platform android --profile production --local
```

## 📱 Paso 3: Configurar en Google Play Console

### 3.1 Crear Nueva Aplicación

1. Ir a https://play.google.com/console
2. Click en "Crear aplicación"
3. Llenar:
   - Nombre: **Mechanic Fixes**
   - Idioma predeterminado: **Español (España)** o **Español (Latinoamérica)**
   - Tipo: **Aplicación** (no juego)
   - Gratis o de pago: **Gratis**
4. Aceptar políticas y crear

### 3.2 Información de la Ficha

#### Descripción Corta (80 caracteres)
```
Gestión profesional de reparaciones automotrices
```

#### Descripción Completa (4000 caracteres máx)
```
Mechanic Fixes es la aplicación líder para gestionar tu taller mecánico de forma profesional.

🔧 Funcionalidades principales:
• Gestión completa de órdenes de reparación
• Control de inventario de repuestos
• Administración de clientes y vehículos
• Sistema de roles (Admin, Mecánico, Recepcionista)
• Galería de fotos para documentar reparaciones
• Reportes y estadísticas en tiempo real
• Notificaciones automáticas
• Modo offline para trabajar sin conexión

💼 Ideal para:
- Talleres mecánicos pequeños y medianos
- Centros de servicio automotriz
- Mecánicos independientes
- Administradores de flotas vehiculares

✨ Características destacadas:
• Interfaz intuitiva y fácil de usar
• Sincronización en tiempo real
• Seguridad con Firebase
• Multiusuario con diferentes roles
• Respaldos automáticos en la nube

Descarga Mechanic Fixes hoy y lleva tu taller al siguiente nivel.
```

#### Capturas de Pantalla
**Necesitas mínimo:**
- 2 capturas (recomendado: 4-8)
- Resolución: 1920x1080 (16:9) o similar
- Formatos: PNG o JPG

### 3.3 Gráficos

**Icon (512x512 px)**
- Ya tienes: `assets/images/mecanic-fixes.png`
- Formato: PNG de 32 bits, sin transparencia

**Feature Graphic (1024x500 px)**
- Banner promocional
- Formato: PNG o JPG

### 3.4 Categorización

- **Categoría:** Productividad o Empresa
- **Etiquetas:** taller, mecánico, reparaciones, automotriz

### 3.5 Información de Contacto

- **Email de soporte:** [tu email]
- **Sitio web:** (opcional)
- **Política de privacidad:** https://[tu-dominio]/privacy-policy.html

## 📤 Paso 4: Subir el Bundle (AAB)

1. En Play Console, ir a **Producción**
2. Click en **Crear nueva versión**
3. **Subir el archivo .aab** descargado de EAS
4. Agregar **Notas de la versión** en español:

```
Primera versión de Mechanic Fixes
• Sistema completo de gestión de reparaciones
• Control de inventario
• Gestión de clientes y vehículos
• Sistema de roles y permisos
• Galería de fotos
• Reportes en tiempo real
```

## 🔐 Paso 5: Configuraciones Obligatorias

### 5.1 Clasificación de Contenido

1. Ir a **Clasificación de contenido**
2. Completar cuestionario:
   - Tipo: Utilidad / Productividad
   - No contiene violencia, lenguaje adulto, etc.
3. Enviar para clasificación

### 5.2 Público Objetivo

1. Ir a **Público objetivo y contenido**
2. Seleccionar:
   - **Público objetivo:** Mayores de 18 años (PEGI 3 o Everyone)
   - **Anuncios:** No (si no usas ads)

### 5.3 Privacidad de Datos

1. Ir a **Seguridad de datos**
2. Declarar qué datos recopilas:
   - Información personal (nombre, email)
   - Fotos (para reparaciones)
   - Ubicación (si aplica)
3. Explicar uso y seguridad de datos
4. Link a política de privacidad

### 5.4 App Access

Si tu app requiere login:
1. Ir a **App access**
2. Proporcionar credenciales de prueba para revisores de Google

## 🚀 Paso 6: Enviar a Revisión

1. Verificar todos los requisitos estén completos ✅
2. Click en **Enviar para revisión**
3. Proceso de revisión: **1-7 días** (usualmente 24-48 horas)

## 📊 Paso 7: Actualizaciones Futuras

Para actualizar la app:

```bash
# 1. Incrementar versión en app.json
# "version": "1.0.2"
# "versionCode": 16

# 2. Build nueva versión
eas build --platform android --profile production

# 3. En Play Console > Producción > Crear nueva versión
# 4. Subir nuevo .aab y notas de versión
# 5. Enviar para revisión
```

## 🔄 Automatizar con EAS Submit

Para automatizar el proceso de subida:

```bash
# Configurar submit automático
eas submit --platform android --latest

# Seguir instrucciones para autenticar con Google Play
```

## ⚠️ Problemas Comunes

### Error: Package name inválido
- Verificar que el package en `app.json` coincida con Play Console
- Actual: `mecanic_ixes.ds_2025`

### Error: Version code duplicado
- Incrementar `versionCode` en `app.json`
- Cada build debe tener un versionCode único y mayor al anterior

### Error: Keystore
- No compartir ni perder el keystore
- EAS lo guarda automáticamente en la nube

## 📱 Probar Antes de Publicar

### Test Interno (Recomendado)
1. Play Console > **Testing interno**
2. Crear lista de testers (hasta 100 emails)
3. Subir .aab
4. Compartir link de test con tu equipo
5. Recibir feedback antes de publicar

### Test Cerrado
- Para grupos más grandes (hasta 100,000 usuarios)
- Útil para beta testing

## 📞 Recursos Adicionales

- Play Console: https://play.google.com/console
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/android/
- Políticas de Play Store: https://play.google.com/about/developer-content-policy/

## ✅ Checklist Final

- [ ] Cuenta de Google Play creada y pagada ($25)
- [ ] Keystore generada con EAS
- [ ] Build de producción generado (.aab)
- [ ] App creada en Play Console
- [ ] Descripción y gráficos agregados
- [ ] Capturas de pantalla subidas (mín. 2)
- [ ] Clasificación de contenido completada
- [ ] Público objetivo definido
- [ ] Política de privacidad publicada
- [ ] Seguridad de datos declarada
- [ ] Bundle (.aab) subido
- [ ] Notas de versión agregadas
- [ ] Enviado a revisión

---

**¡Listo!** Una vez aprobada, tu app estará disponible en Google Play Store en 24-48 horas. 🎉
