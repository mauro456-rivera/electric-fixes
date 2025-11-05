# 🚨 SOLUCIÓN URGENTE - DESPLEGAR REGLAS MANUALMENTE

## ❌ PROBLEMA ACTUAL:
Las reglas de Firestore en Firebase Cloud **NO están actualizadas**. Por eso sigue diciendo "permission-denied" aunque cambiaste los permisos a `true`.

## ✅ SOLUCIÓN (Copiar y Pegar en Firebase Console):

### Paso 1: Abrir Editor de Reglas
**Abre este link:** https://console.firebase.google.com/project/mecanic-fixs/firestore/rules

### Paso 2: Borrar TODO y Pegar Esto

Selecciona TODO el contenido del editor y reemplázalo con esto:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isActive() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }

    function getUserPermissions() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions;
    }

    function canViewAll() {
      return isAdmin() || getUserPermissions().canViewAll == true;
    }

    function canEdit() {
      return isAdmin() || getUserPermissions().canEdit == true;
    }

    function canDelete() {
      return isAdmin() || getUserPermissions().canDelete == true;
    }

    function canOnlyRegister() {
      return !isAdmin() && getUserPermissions().canOnlyRegister == true;
    }

    function isOwner(resource) {
      return resource.data.registeredBy.userId == request.auth.uid;
    }

    match /users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow list: if isAdmin();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow update, delete: if isAdmin();
    }

    match /mechanical-problems/{problemId} {
      allow read: if isAuthenticated() &&
                    isActive() &&
                    !canOnlyRegister() &&
                    (canViewAll() || isOwner(resource));

      allow list: if isAuthenticated() &&
                     isActive() &&
                     !canOnlyRegister() &&
                     (canViewAll() || isOwner(resource));

      allow create: if isAuthenticated() &&
                      isActive() &&
                      request.resource.data.registeredBy.userId == request.auth.uid &&
                      request.resource.data.deleted == false &&
                      request.resource.data.problemType == 'mechanical';

      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canEdit()));

      allow delete: if isAdmin();

      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canDelete())) &&
                      request.resource.data.deleted == true;
    }

    match /electrical-problems/{problemId} {
      allow read: if isAuthenticated() &&
                    isActive() &&
                    !canOnlyRegister() &&
                    (canViewAll() || isOwner(resource));

      allow list: if isAuthenticated() &&
                     isActive() &&
                     !canOnlyRegister() &&
                     (canViewAll() || isOwner(resource));

      allow create: if isAuthenticated() &&
                      isActive() &&
                      request.resource.data.registeredBy.userId == request.auth.uid &&
                      request.resource.data.deleted == false &&
                      request.resource.data.problemType == 'electrical';

      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canEdit()));

      allow delete: if isAdmin();

      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canDelete())) &&
                      request.resource.data.deleted == true;
    }

    match /problems/{problemId} {
      allow read: if isAuthenticated() &&
                    isActive() &&
                    !canOnlyRegister() &&
                    (canViewAll() || isOwner(resource));

      allow list: if isAuthenticated() &&
                     isActive() &&
                     !canOnlyRegister() &&
                     (canViewAll() || isOwner(resource));

      allow create: if isAuthenticated() &&
                      isActive() &&
                      request.resource.data.registeredBy.userId == request.auth.uid;

      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canEdit()));

      allow delete: if isAdmin();
    }

    match /work_order_db/{document=**} {
      allow read: if isAuthenticated() && isActive();
      allow write: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Paso 3: Publicar
1. Click en el botón azul **"Publish"** (arriba a la derecha)
2. Confirma que quieres publicar

### Paso 4: Verificar
Después de publicar, espera 10-30 segundos para que Firebase aplique los cambios.

### Paso 5: Reiniciar App
1. **Cierra sesión** en tu app
2. **Cierra completamente la app** (forzar cierre)
3. **Vuelve a abrir** la app
4. **Inicia sesión** con admin@dieselsoft.co

## ✅ Resultado Esperado:

Deberías ver:
```
✅ Documento encontrado en Firestore
✅ Usuario autenticado: admin@dieselsoft.co | Rol: admin
```

Y **NO** deberías ver:
```
❌ Error obteniendo rol del usuario: Missing or insufficient permissions
```

---

## 🔍 ¿Por qué funcionará ahora?

Las nuevas reglas incluyen esta línea clave:
```
allow update: if isAuthenticated() && request.auth.uid == userId;
```

Esto permite que un usuario autenticado pueda **leer** su propio documento en `users/{userId}`, que es lo que necesita `getUserRole()` para funcionar.

---

## ⚠️ IMPORTANTE:

**HAZ ESTO AHORA**. Sin desplegar estas reglas, tu app **nunca** funcionará, sin importar qué valores tengan los permisos en la base de datos.

Las reglas de seguridad son como un "firewall" que bloquea todas las peticiones hasta que las actualices.

---

¿Listo para hacerlo? Te espero para confirmar que funcionó. 🚀
