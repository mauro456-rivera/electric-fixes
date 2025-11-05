# Guía de Producción - Mechanic Fixes

## ✅ Configuración Completada

### Expo & EAS
- **Cuenta Expo:** jbian
- **Project ID:** 4e45f3bf-35b6-4375-8f54-6f62e5c937ca
- **EAS CLI:** Actualizado a última versión

### Android (Google Play Store)
- **Package Name:** mecanic_ixes.ds_2025
- **Version:** 1.0.1
- **Version Code:** 15
- **Build Type:** AAB (Android App Bundle) ✅
- **Firebase:** Configurado con google-services.json

### iOS (Apple App Store)
- **Bundle Identifier:** com.mecanicfixes.ds2025
- **Version:** 1.0.1
- **Apple Developer:** Cuenta activa ($99/año) ✅
- **Build Type:** IPA para App Store

---

## 📱 PASOS PARA GENERAR BUILDS

### 1. ANDROID - Google Play Store

#### Generar el build AAB:
```bash
eas build --platform android --profile production
```

**Opciones durante el build:**
- Si te pregunta por keystore: selecciona "Generate new keystore"
- EAS guardará el keystore automáticamente en sus servidores

#### Después del build:
1. Descarga el archivo `.aab` desde el link que te proporciona EAS
2. Ve a [Google Play Console](https://play.google.com/console)
3. Crea una nueva aplicación o selecciona la existente
4. Ve a "Production" → "Create new release"
5. Sube el archivo `.aab`
6. Completa los datos requeridos (descripción, capturas, etc.)
7. Envía para revisión

**Tiempo estimado de revisión:** 1-3 días

---

### 2. iOS - Apple App Store

#### ✅ CONFIGURACIÓN FIREBASE iOS COMPLETADA

**Firebase iOS Setup:**
- ✅ App iOS agregada en Firebase Console
- ✅ Bundle ID configurado: `com.mecanicfixes.ds2025`
- ✅ GoogleService-Info.plist descargado y ubicado en raíz
- ✅ Configuración agregada en app.json
- ✅ Storage bucket configurado: `mecanic-fixs.firebasestorage.app`

**B. Apple Developer Setup:**

1. Ve a [Apple Developer](https://developer.apple.com)
2. Verifica que tu cuenta esté activa ($99/año)
3. Crea un App ID:
   - Identifier: `com.mecanicfixes.ds2025`
   - Name: "Mechanic Fixes"

4. (Opcional) Crea el app en App Store Connect:
   - Ve a [App Store Connect](https://appstoreconnect.apple.com)
   - Click "My Apps" → "+" → "New App"
   - Platform: iOS
   - Name: "Mechanic Fixes"
   - Bundle ID: Selecciona `com.mecanicfixes.ds2025`
   - SKU: mechanic-fixes-2025

#### Generar el build IPA:
```bash
eas build --platform ios --profile production
```

**Opciones durante el build:**
- Inicia sesión con tu Apple Developer account
- EAS configurará los certificates y provisioning profiles automáticamente

#### Después del build:
1. El archivo `.ipa` estará disponible en EAS
2. **Opción 1 - Submit automático:**
   ```bash
   eas submit --platform ios --profile production
   ```

3. **Opción 2 - Manual:**
   - Descarga el `.ipa`
   - Usa [Transporter app](https://apps.apple.com/app/transporter/id1450874784)
   - Sube el archivo a App Store Connect

4. En App Store Connect:
   - Completa la información de la app
   - Agrega capturas de pantalla
   - Llena el formulario de privacidad
   - Envía para revisión

**Tiempo estimado de revisión:** 1-5 días

---

## 🔧 COMANDOS ÚTILES

### Ver status de builds:
```bash
eas build:list
```

### Cancelar un build:
```bash
eas build:cancel
```

### Ver credenciales:
```bash
eas credentials
```

### Build para testing (APK):
```bash
eas build --platform android --profile preview
```

### Build local (requiere setup adicional):
```bash
eas build --platform android --profile production --local
```

---

## 📋 CHECKLIST PRE-PRODUCCIÓN

### General
- [x] Expo account activo (jbian)
- [x] EAS CLI actualizado
- [x] app.json configurado
- [x] eas.json configurado
- [ ] Probar la app en dispositivos reales
- [ ] Verificar permisos funcionan correctamente
- [ ] Revisar logs de errores (Sentry/Firebase Crashlytics recomendado)

### Android
- [x] Package name correcto
- [x] google-services.json configurado
- [x] Version y versionCode actualizados
- [x] Build type configurado a AAB
- [ ] Cuenta Google Play Console activa
- [ ] Íconos y splash screen diseñados
- [ ] Capturas de pantalla preparadas
- [ ] Descripción de la app escrita
- [ ] Política de privacidad creada

### iOS
- [x] Bundle identifier correcto (com.mecanicfixes.ds2025)
- [x] Apple Developer account activo
- [x] GoogleService-Info.plist agregado
- [x] Firebase iOS configurado en app.json
- [ ] App creada en App Store Connect
- [ ] Íconos en todas las resoluciones
- [ ] Capturas de pantalla para todos los tamaños
- [ ] Descripción de la app escrita
- [ ] Política de privacidad creada
- [ ] Formulario de export compliance completado

---

## 🚨 PROBLEMAS COMUNES

### Error: "No valid code signing identity found"
**Solución:** EAS generará automáticamente los certificates. Asegúrate de estar logueado:
```bash
eas login
```

### Error: "Duplicate resources"
**Solución:** Ya está configurado en `expo-build-properties` con `pickFirst`

### Error: "INTERNET permission missing"
**Solución:** Ya está agregado en app.json:37

### Build falla en iOS
**Solución:** Verifica que:
1. Tu Apple Developer account esté activo
2. El bundle ID esté registrado
3. No haya caracteres especiales en el nombre de la app

---

## 📞 SOPORTE

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **EAS Submit Docs:** https://docs.expo.dev/submit/introduction/
- **Google Play Console:** https://support.google.com/googleplay/android-developer
- **App Store Connect:** https://developer.apple.com/support/app-store-connect/

---

## 🎯 PRÓXIMOS PASOS

### ✅ TODO LISTO PARA GENERAR BUILDS

**Tu proyecto está 100% configurado para producción.**

1. **Generar build de Android:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Generar build de iOS:**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit a las tiendas:**
   ```bash
   # Android (después del build)
   eas submit --platform android --profile production

   # iOS (después del build)
   eas submit --platform ios --profile production
   ```

### 📌 Notas finales:
- Primera vez que buildeas: EAS generará automáticamente certificates y provisioning profiles
- Los builds toman entre 10-30 minutos cada uno
- Puedes generar ambos builds en paralelo si lo deseas
- Necesitarás iniciar sesión con tu Apple ID cuando generes el build de iOS

---

**Fecha de configuración:** 2025-11-04
**Configurado por:** Claude Code
