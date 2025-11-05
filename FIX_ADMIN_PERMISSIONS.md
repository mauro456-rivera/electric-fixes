# 🔧 SOLUCIÓN: Error de Permisos del Usuario Admin

## 📋 Problema
Tu usuario admin no puede leer/escribir en Firestore porque **no existe un documento en la colección `users`** para tu usuario. Las reglas de seguridad verifican que el documento exista antes de otorgar permisos de admin.

## ⚡ SOLUCIÓN RÁPIDA (Opción 1 - Recomendada)

### Usando la Consola de Firebase (Manual):

1. **Ve a la Consola de Firebase:**
   - https://console.firebase.google.com/
   - Selecciona tu proyecto: `mecanic-fixs`

2. **Ve a Firestore Database:**
   - Menú lateral → Firestore Database

3. **Crea el documento del usuario:**
   - Click en "Start collection" (o selecciona la colección "users" si ya existe)
   - Nombre de la colección: `users`
   - Document ID: `bntcBv7W1dNFN0OLGvT19ztorDm2` (tu User ID del log)
   - Agrega los siguientes campos:

   ```
   email (string): "admin@dieselsoft.co"
   name (string): "Admin Dieselsoft"
   role (string): "admin"
   isActive (boolean): true
   createdAt (timestamp): [Click en "Add field" → selecciona "timestamp" → "Set to current time"]
   createdBy (string): "bntcBv7W1dNFN0OLGvT19ztorDm2"
   
   permissions (map):
      ↳ canEdit (boolean): true
      ↳ canDelete (boolean): true
      ↳ canViewAll (boolean): true
      ↳ canViewSolutions (boolean): true
      ↳ canOnlyRegister (boolean): false
   ```

4. **Guarda el documento** haciendo click en "Save"

5. **Reinicia tu app** y vuelve a iniciar sesión

---

## 🚀 SOLUCIÓN (Opción 2 - Desplegar Nuevas Reglas)

Si prefieres usar Firebase CLI:

### Paso 1: Desplegar las Nuevas Reglas

Las reglas ya han sido actualizadas en `firestore.rules` para permitir que usuarios autenticados creen su propio documento.

```bash
# Desde la raíz del proyecto
firebase deploy --only firestore:rules
```

### Paso 2: Crear el Documento desde la App

Una vez desplegadas las reglas, puedes usar el script de ayuda:

1. Inicia sesión en la app con tu cuenta admin
2. Abre la consola del navegador/debugger
3. Ejecuta:

```javascript
// Desde la consola del debugger de React Native
import { fixAdminUser } from './scripts/fixAdminUser';
fixAdminUser();
```

O crea un botón temporal en tu app para ejecutar la función.

---

## 🔍 Verificación

Después de crear el documento, verifica que:

1. ✅ El documento existe en Firestore: `users/bntcBv7W1dNFN0OLGvT19ztorDm2`
2. ✅ El campo `role` es `"admin"`
3. ✅ El campo `isActive` es `true`
4. ✅ El campo `permissions` tiene todos los permisos en `true`

---

## 📱 Reiniciar la App

Después de crear el documento:

1. Cierra sesión en la app
2. Fuerza el cierre de la app
3. Vuelve a abrir la app
4. Inicia sesión con admin@dieselsoft.co

Deberías ver en los logs:
```
✅ Documento encontrado en Firestore
✅ Usuario autenticado: admin@dieselsoft.co | Rol: admin
```

---

## 🐛 Sobre el Error de InternalBytecode.js

El error `ENOENT: no such file or directory, open 'C:\dev2\mobille\mecanic-fixes\InternalBytecode.js'` es un error conocido de Metro bundler al intentar symbolicate los errores.

**Solución:** Este error es cosmético y no afecta la funcionalidad. Una vez resuelto el problema de permisos de Firestore, este error también desaparecerá.

Si persiste, puedes:
```bash
# Limpiar cache de Metro
npx expo start -c
```

---

## ⚠️ Advertencia sobre expo-av

El warning de `expo-av` es solo informativo:
```
WARN [expo-av]: Expo AV has been deprecated and will be removed in SDK 54.
```

**Acción requerida (no urgente):**
- Migrar de `expo-av` a `expo-audio` y `expo-video` antes del SDK 54
- Por ahora no afecta la funcionalidad

---

## 📞 ¿Aún tienes problemas?

Si después de seguir estos pasos aún tienes errores:

1. Verifica que las reglas se hayan desplegado correctamente
2. Verifica que el documento en Firestore tenga exactamente los campos mencionados
3. Cierra completamente la app y vuelve a abrirla
4. Verifica que estés usando el email correcto: `admin@dieselsoft.co`
5. Revisa los logs para ver el User ID exacto que está intentando autenticarse

---

## 🎯 Resumen

**El problema principal es:** Tu usuario admin NO tiene un documento en la colección `users` de Firestore.

**La solución es:** Crear manualmente ese documento con rol "admin" desde la Consola de Firebase (Opción 1 - más rápida).

¡Una vez creado el documento, todo debería funcionar correctamente! 🎉
