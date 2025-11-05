# Cómo Desplegar Reglas de Firebase Storage

## El problema
El error `storage/unknown` indica que las reglas de Storage no están desplegadas en Firebase Console.

## Solución: Desplegar las reglas manualmente

### Opción 1: Via Firebase Console (MÁS FÁCIL)

1. **Ve a Firebase Console**:
   - https://console.firebase.google.com/project/mecanic-fixs/storage

2. **Habilita Storage** (si no lo está):
   - Si ves "Get Started", haz clic
   - Selecciona "Start in production mode"
   - Haz clic en "Done"

3. **Abre las reglas**:
   - Haz clic en la pestaña **"Rules"**

4. **Copia y pega estas reglas**:
   ```
   rules_version = '2';

   service firebase.storage {
     match /b/{bucket}/o {
       // Permitir lectura para todos los usuarios autenticados
       match /{allPaths=**} {
         allow read: if request.auth != null;
       }

       // Permitir escritura en la carpeta problems/ para usuarios autenticados
       match /problems/{problemId}/{allSubPaths=**} {
         allow write: if request.auth != null;
       }
     }
   }
   ```

5. **¡IMPORTANTE! Haz clic en "Publish"**:
   - El botón azul que dice "Publish" en la esquina superior derecha
   - **Sin este paso, las reglas NO se aplican**

6. **Espera 10-30 segundos** para que se propaguen las reglas

### Opción 2: Via Firebase CLI (Si tienes Firebase CLI instalado)

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Desplegar solo las reglas de Storage
firebase deploy --only storage:rules
```

## Reglas Temporales para Testing (SI TODO FALLA)

Si necesitas probar que Storage funciona, puedes usar estas reglas **TEMPORALMENTE**:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // ⚠️ INSEGURO - SOLO PARA TESTING
    }
  }
}
```

**⚠️ IMPORTANTE**: NO dejes estas reglas en producción. Solo úsalas para verificar que Storage funciona, luego cámbiala a las reglas seguras.

## Verificar que las reglas están desplegadas

1. Ve a Firebase Console → Storage → Rules
2. Deberías ver la fecha y hora de la última publicación
3. Si dice "Not published" o la fecha es antigua, vuelve a hacer clic en "Publish"

## Después de desplegar

1. **Cierra la app completamente** en el dispositivo
2. **Vuelve a abrirla**
3. **Inicia sesión de nuevo**
4. **Intenta subir un archivo**

## Logs esperados después de desplegar

Si todo está bien, verás:
```
✅ Blob subido a Storage
🔗 Obteniendo URL de descarga...
✅ Archivo subido exitosamente: https://firebasestorage.googleapis.com/...
```

## Si aún falla después de desplegar

1. Verifica que el Storage Bucket en Project Settings sea: `mecanic-fixs.appspot.com`
2. Verifica que el usuario tenga permisos en Firestore (isActive: true)
3. Intenta con las reglas temporales (allow write: if true) para descartar problemas de reglas
