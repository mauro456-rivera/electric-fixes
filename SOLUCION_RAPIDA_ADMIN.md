# 🚀 SOLUCIÓN INMEDIATA - Copiar Reglas a Firebase Console

## ⚡ LA FORMA MÁS RÁPIDA (2 minutos):

### Paso 1: Abrir la Consola de Firebase
1. Ve a: https://console.firebase.google.com/project/mecanic-fixs/firestore/rules
2. Esto abrirá directamente el editor de reglas de Firestore

### Paso 2: Reemplazar las Reglas Actuales
Copia TODO el contenido de abajo y reemplaza las reglas actuales:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Helper function to check if user is active
    function isActive() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isActive == true;
    }

    // Helper function to get user permissions
    function getUserPermissions() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions;
    }

    // Helper function to check if user can view all records
    function canViewAll() {
      return isAdmin() || getUserPermissions().canViewAll == true;
    }

    // Helper function to check if user can edit
    function canEdit() {
      return isAdmin() || getUserPermissions().canEdit == true;
    }

    // Helper function to check if user can delete
    function canDelete() {
      return isAdmin() || getUserPermissions().canDelete == true;
    }

    // Helper function to check if user can only register
    function canOnlyRegister() {
      return !isAdmin() && getUserPermissions().canOnlyRegister == true;
    }

    // Helper function to check if resource belongs to user
    function isOwner(resource) {
      return resource.data.registeredBy.userId == request.auth.uid;
    }

    // Users collection - Only admins can manage users
    match /users/{userId} {
      // Anyone authenticated can read their own user document
      allow read: if isAuthenticated() && request.auth.uid == userId;

      // Only admins can read all users
      allow list: if isAdmin();

      // Users can be created during registration (handled by backend)
      // IMPORTANTE: También permitir que un usuario autenticado cree/actualice su propio documento
      allow create: if isAuthenticated() && request.auth.uid == userId;
      
      // Permitir que un usuario autenticado actualice su propio documento
      allow update: if isAuthenticated() && request.auth.uid == userId;

      // Only admins can update/delete other users
      allow update, delete: if isAdmin();
    }

    // Mechanical problems collection
    match /mechanical-problems/{problemId} {
      // Read rules
      allow read: if isAuthenticated() &&
                    isActive() &&
                    !canOnlyRegister() &&
                    (canViewAll() || isOwner(resource));

      // List rules - same as read
      allow list: if isAuthenticated() &&
                     isActive() &&
                     !canOnlyRegister() &&
                     (canViewAll() || isOwner(resource));

      // Create rules - authenticated and active users can create
      allow create: if isAuthenticated() &&
                      isActive() &&
                      request.resource.data.registeredBy.userId == request.auth.uid &&
                      request.resource.data.deleted == false &&
                      request.resource.data.problemType == 'mechanical';

      // Update rules - owner with permission or admin can update
      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canEdit()));

      // Delete rules (soft delete) - owner with permission or admin can delete
      allow delete: if isAdmin(); // Only admin can permanently delete

      // Soft delete via update
      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canDelete())) &&
                      request.resource.data.deleted == true;
    }

    // Electrical problems collection
    match /electrical-problems/{problemId} {
      // Read rules
      allow read: if isAuthenticated() &&
                    isActive() &&
                    !canOnlyRegister() &&
                    (canViewAll() || isOwner(resource));

      // List rules - same as read
      allow list: if isAuthenticated() &&
                     isActive() &&
                     !canOnlyRegister() &&
                     (canViewAll() || isOwner(resource));

      // Create rules - authenticated and active users can create
      allow create: if isAuthenticated() &&
                      isActive() &&
                      request.resource.data.registeredBy.userId == request.auth.uid &&
                      request.resource.data.deleted == false &&
                      request.resource.data.problemType == 'electrical';

      // Update rules - owner with permission or admin can update
      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canEdit()));

      // Delete rules (soft delete) - owner with permission or admin can delete
      allow delete: if isAdmin(); // Only admin can permanently delete

      // Soft delete via update
      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canDelete())) &&
                      request.resource.data.deleted == true;
    }

    // Legacy problems collection (for backward compatibility)
    match /problems/{problemId} {
      // Read rules
      allow read: if isAuthenticated() &&
                    isActive() &&
                    !canOnlyRegister() &&
                    (canViewAll() || isOwner(resource));

      // List rules
      allow list: if isAuthenticated() &&
                     isActive() &&
                     !canOnlyRegister() &&
                     (canViewAll() || isOwner(resource));

      // Create rules
      allow create: if isAuthenticated() &&
                      isActive() &&
                      request.resource.data.registeredBy.userId == request.auth.uid;

      // Update rules
      allow update: if isAuthenticated() &&
                      isActive() &&
                      (isAdmin() || (isOwner(resource) && canEdit()));

      // Delete rules
      allow delete: if isAdmin();
    }

    // Work order collection
    match /work_order_db/{document=**} {
      allow read: if isAuthenticated() && isActive();
      allow write: if isAdmin();
    }

    // Deny access to any other unspecified collection
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Paso 3: Publicar las Reglas
- Click en el botón **"Publish"** (Publicar) en la parte superior
- Confirma la publicación

### Paso 4: Crear el Documento del Usuario Admin

**OPCIÓN A - Desde la Consola de Firebase (MÁS FÁCIL):**

1. Ve a: https://console.firebase.google.com/project/mecanic-fixs/firestore/data
2. Click en "Start collection" o selecciona la colección **"users"**
3. Click en "Add document"
4. **Document ID:** `bntcBv7W1dNFN0OLGvT19ztorDm2`
5. Agrega estos campos haciendo click en "Add field":

```
Campo: email          | Tipo: string    | Valor: admin@dieselsoft.co
Campo: name           | Tipo: string    | Valor: Admin Dieselsoft
Campo: role           | Tipo: string    | Valor: admin
Campo: isActive       | Tipo: boolean   | Valor: true
Campo: createdBy      | Tipo: string    | Valor: bntcBv7W1dNFN0OLGvT19ztorDm2
Campo: createdAt      | Tipo: timestamp | Valor: [usar fecha actual]
Campo: permissions    | Tipo: map       | Valor: (agregar sub-campos abajo)
```

**Sub-campos de `permissions` (hacer click en el icono + junto a permissions):**
```
permissions.canEdit              | Tipo: boolean | Valor: true
permissions.canDelete            | Tipo: boolean | Valor: true
permissions.canViewAll           | Tipo: boolean | Valor: true
permissions.canViewSolutions     | Tipo: boolean | Valor: true
permissions.canOnlyRegister      | Tipo: boolean | Valor: false
```

6. Click en **"Save"**

**OPCIÓN B - Ejecutar Script (requiere Node.js):**

Desde la terminal en la carpeta del proyecto:
```bash
node scripts/createAdminUser.js
```

### Paso 5: Reiniciar la App
1. Cierra sesión en la app
2. Cierra completamente la app (forzar cierre)
3. Vuelve a abrir la app
4. Inicia sesión con: `admin@dieselsoft.co`

### ✅ Verificación
Deberías ver en los logs:
```
✅ Documento encontrado en Firestore
✅ Usuario autenticado: admin@dieselsoft.co | Rol: admin
```

---

## 🎯 RESUMEN RÁPIDO:

1. **Actualizar reglas**: Copiar y pegar las reglas de arriba en la consola de Firebase → Publicar
2. **Crear documento**: Agregar documento en `users/bntcBv7W1dNFN0OLGvT19ztorDm2` con los campos mencionados
3. **Reiniciar app**: Cerrar sesión y volver a iniciar

¡Listo! 🎉

---

## 📸 Si prefieres ver imágenes:
- Tutorial visual: https://firebase.google.com/docs/firestore/security/get-started
- Video de cómo agregar documentos: https://www.youtube.com/results?search_query=firebase+firestore+add+document
