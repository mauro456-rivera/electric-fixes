# 🔥 Guía de Prueba - Firebase Storage

## ✅ Estado de la Configuración

### Configuración Completa
- ✅ Firebase Storage configurado en `src/config/firebase.js`
- ✅ Servicio de Storage creado en `src/services/firebaseStorage.js`
- ✅ Integración con Firestore en `src/services/firebaseFirestore.js`
- ✅ Componente FileUploader listo en `src/components/FileUploader.js`
- ✅ Reglas de seguridad configuradas
- ✅ Manejo de errores mejorado

---

## 📋 Cómo Funciona

### 1. **Flujo de Subida de Archivos**

Cuando un usuario registra un problema:

1. **Selecciona archivos** usando el componente `FileUploader`
   - Imágenes (galería o cámara)
   - Videos
   - Documentos

2. **Los archivos se guardan localmente** en el estado de React

3. **Al presionar "Guardar"**:
   - Se suben los archivos a Firebase Storage
   - Se obtienen las URLs de descarga
   - Se guardan las URLs en Firestore

### 2. **Estructura de Archivos en Storage**

```
problems/
  └── problem_1234567890/
      ├── problem_0/
      │   ├── files/              # Archivos del problema
      │   ├── activities/
      │   │   └── activity_0/     # Archivos de actividades
      │   └── solutions/
      │       └── solution_0/     # Archivos de soluciones
      ├── problem_1/
      └── ...
```

### 3. **Validaciones Implementadas**

- ✅ Tamaño máximo: **50MB por archivo**
- ✅ Valida que el archivo tenga URI
- ✅ Maneja errores de red
- ✅ Logs detallados en consola

---

## 🧪 Pasos para Probar

### Paso 1: Verificar Reglas de Storage en Firebase

1. Ve a **Firebase Console** → Tu proyecto **mecanic-fixs**
2. Ve a **Storage** → **Rules**
3. Verifica que las reglas sean:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Si no están así, copia el archivo `firebase-storage.rules` y súbelo:

```bash
firebase deploy --only storage:rules
```

### Paso 2: Ejecutar la App

```bash
# Si aún no has instalado las dependencias
npm install

# Ejecutar la app
npx expo start
```

### Paso 3: Probar Subida de Archivos

1. **Inicia sesión** en la app
2. Ve a **"Registrar Problema"**
3. Llena el formulario:
   - ✅ Tópico (requerido)
   - Datos del camión (opcional)
   - Work Order (opcional)

4. **Prueba agregar archivos**:
   - Toca "Agregar archivos"
   - Selecciona:
     - 📸 Tomar Foto
     - 🖼️ Elegir Imagen
     - 🎥 Elegir Video
     - 📄 Elegir Documento

5. **Agrega archivos en diferentes secciones**:
   - Archivos del problema
   - Archivos de actividades
   - Archivos de soluciones

6. **Presiona "Guardar"**

### Paso 4: Verificar en Firebase Console

1. Ve a **Firestore Database** → Colección `problems`
2. Busca el documento recién creado
3. Verifica que tenga:
   ```json
   {
     "generalData": {...},
     "problems": [
       {
         "problemFiles": ["https://..."],  // URLs de Storage
         "activities": [
           {
             "files": ["https://..."]      // URLs de Storage
           }
         ],
         "solutions": [
           {
             "files": ["https://..."]      // URLs de Storage
           }
         ]
       }
     ]
   }
   ```

4. Ve a **Storage** → **Files**
5. Navega a `problems/problem_xxxxx/`
6. Verifica que los archivos estén ahí

---

## 🔍 Logs en Consola

Durante la prueba, verás logs como:

```
💾 Iniciando guardado de problema: problem_1234567890
📋 Procesando problema 1/1
📎 Subiendo 2 archivos del problema
📤 Subiendo 2 archivo(s) a problems/problem_1234567890/problem_0/files
📤 Subiendo archivo: problems/.../1234567890_image.jpg (245.67KB)
✅ Archivo subido exitosamente
✅ 2 archivo(s) subidos exitosamente
💾 Guardando documento en Firestore...
✅ Problema guardado exitosamente con ID: abc123
```

---

## 🐛 Solución de Problemas

### Error: "Permission denied"

**Causa**: Usuario no autenticado o reglas incorrectas

**Solución**:
1. Verifica que estés autenticado
2. Revisa las reglas de Storage
3. Redespliega las reglas: `firebase deploy --only storage:rules`

### Error: "Archivo muy grande"

**Causa**: Archivo mayor a 50MB

**Solución**:
- Usa archivos más pequeños
- O modifica el límite en `firebaseStorage.js:25`

### Error: "Network request failed"

**Causa**: Problema de conexión

**Solución**:
1. Verifica tu conexión a Internet
2. Verifica que Firebase esté activo
3. Revisa la configuración en `firebase.js`

### Los archivos no aparecen en Storage

**Causa**: Error en la subida

**Solución**:
1. Revisa los logs en consola
2. Verifica el `storageBucket` en `firebase.js`
3. Asegúrate de que Storage esté habilitado en Firebase Console

---

## 📊 Estructura de Datos Final

### En Firestore (`problems` collection):

```json
{
  "generalData": {
    "topic": "Problema eléctrico",
    "truckData": "Camión #123",
    "workOrder": "WO-456"
  },
  "problems": [
    {
      "problemTitle": "Falla en luces",
      "problemDescription": "Las luces no encienden",
      "problemFiles": [
        "https://firebasestorage.googleapis.com/.../image1.jpg",
        "https://firebasestorage.googleapis.com/.../video1.mp4"
      ],
      "activities": [
        {
          "title": "Revisión de fusibles",
          "files": ["https://firebasestorage.googleapis.com/.../fusible.jpg"]
        }
      ],
      "solutions": [
        {
          "title": "Reemplazar fusible",
          "files": ["https://firebasestorage.googleapis.com/.../nuevo_fusible.jpg"]
        }
      ],
      "otherData": "Notas adicionales"
    }
  ],
  "registeredBy": {
    "userId": "user123",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "createdAt": "Timestamp",
  "status": "active"
}
```

---

## 🎯 Checklist de Prueba

- [ ] Usuario autenticado correctamente
- [ ] Subir imagen desde galería
- [ ] Tomar foto con cámara
- [ ] Subir video
- [ ] Subir documento PDF/Word
- [ ] Archivos aparecen en Firebase Storage
- [ ] URLs guardadas en Firestore
- [ ] Logs muestran progreso correctamente
- [ ] Manejo de errores funciona (probar sin internet)
- [ ] Validación de archivos muy grandes

---

## 📞 Siguiente Paso

Una vez que pruebes y confirmes que funciona:

1. **Ver archivos subidos**: Necesitarás crear una pantalla para mostrar los problemas guardados
2. **Descargar/Visualizar archivos**: Implementar visor de imágenes/videos
3. **Eliminar archivos**: Agregar funcionalidad para eliminar de Storage

---

## 💡 Notas Importantes

- Los archivos se suben **solo cuando el usuario presiona "Guardar"**
- Si hay un error en la subida, **todo el proceso falla** (para mantener consistencia)
- Las URLs son **permanentes** y públicas para usuarios autenticados
- El Storage bucket es: `mecanic-fixs.firebasestorage.app`

---

**¡Todo está listo para probar!** 🚀

Si encuentras algún error, revisa los logs en la consola de Expo y en la consola del navegador.
