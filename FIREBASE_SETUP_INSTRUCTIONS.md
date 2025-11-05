# Instrucciones para configurar Firebase Storage

## Error actual
```
Firebase Storage: An unknown error occurred (storage/unknown)
```

Este error ocurre porque Firebase Storage no tiene las reglas de seguridad configuradas correctamente.

## Pasos para solucionar

### 1. Ir a Firebase Console
1. Abre [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto **mecanic-fixs**

### 2. Configurar Storage Rules
1. En el menú lateral izquierdo, haz clic en **"Storage"** (Almacenamiento)
2. Haz clic en la pestaña **"Rules"** (Reglas)
3. Reemplaza las reglas existentes con estas:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura y escritura para usuarios autenticados
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Haz clic en **"Publish"** (Publicar)

### 3. Verificar que Storage esté habilitado
1. En la pestaña **"Files"** de Storage
2. Si ves un botón **"Get Started"**, haz clic en él
3. Selecciona la ubicación (por ejemplo: `us-central1`)
4. Haz clic en **"Done"**

## Reglas explicadas

- `request.auth != null`: Solo usuarios autenticados pueden leer y escribir
- `match /{allPaths=**}`: Aplica a todos los archivos y carpetas

## Reglas de producción (más seguras)

Para producción, puedes usar reglas más específicas:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Archivos de problemas
    match /problems/{problemId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024; // Max 10MB
    }
  }
}
```

## Después de configurar

1. Reinicia tu app
2. Intenta subir un archivo nuevamente
3. Debería funcionar sin errores
