# Troubleshooting Firebase Storage

## Error: storage/unknown

Este error ocurre cuando Firebase Storage no puede completar la subida. Aquí están las soluciones:

### 1. Verificar Reglas de Storage

Ve a Firebase Console → Storage → Rules y asegúrate de que las reglas estén desplegadas:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**IMPORTANTE**: Después de guardar las reglas, haz clic en "Publish" para desplegarlas.

### 2. Verificar Storage Bucket

En `firebase.js` verifica que el `storageBucket` coincida con el de la consola:

```javascript
storageBucket: "mecanic-fixs.appspot.com"
```

Ve a Firebase Console → Project Settings → General y verifica que el Storage Bucket sea: `mecanic-fixs.appspot.com`

### 3. Verificar que Storage está habilitado

1. Ve a Firebase Console → Storage
2. Si dice "Get Started", haz clic y habilita Storage
3. Selecciona el modo de producción con reglas de seguridad

### 4. Verificar autenticación del usuario

El error puede ocurrir si el usuario no está autenticado. Verifica en los logs:

```
LOG  ✅ Usuario autenticado: admin@dieselsoft.co | Rol: admin
```

### 5. Limpiar caché y reconstruir

```bash
# Limpiar caché de Metro
npx expo start -c

# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules
npm install
```

### 6. Verificar conectividad

Asegúrate de que:
- El dispositivo tiene conexión a Internet
- No hay firewall bloqueando Firebase
- La app tiene permisos de red

### 7. Verificar versiones de Firebase

En `package.json` asegúrate de tener versiones compatibles:

```json
"firebase": "^10.x.x"
```

## Logs útiles

Con los logs mejorados, verás:
```
🔍 Validando archivo: image_xxx.jpg
📁 URI: file:///path/to/image.jpeg
📥 Obteniendo blob del archivo...
✅ Blob obtenido: 31.13KB, tipo: image/jpeg
📤 Subiendo archivo a Storage...
   📁 Ruta: problems/xxx/files/xxx.jpg
   📦 Tamaño: 31.13KB
   🏷️ Tipo: image/jpeg
✅ Blob subido a Storage
🔗 Obteniendo URL de descarga...
✅ Archivo subido exitosamente
```

Si falla, verás:
```
❌ Error subiendo archivo: [Error]
   📄 Nombre archivo: image_xxx.jpg
   📁 URI: file:///path/to/image.jpeg
   🔥 Código error: storage/unknown
   💬 Mensaje: An unknown error occurred
```

## Solución temporal

Si el problema persiste, puedes cambiar las reglas de Storage a modo "open" temporalmente para debugging:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // ⚠️ SOLO PARA TESTING
    }
  }
}
```

**⚠️ NO dejes estas reglas en producción**
