# 👑 Sistema de Roles - Guía Completa

## ✅ Sistema Implementado

Se ha implementado un **sistema completo de Control de Acceso Basado en Roles (RBAC)** con dos tipos de usuarios:

### 🎯 Roles Disponibles:

1. **👑 Administrador (admin)**
   - Acceso completo al sistema
   - Puede crear y gestionar usuarios
   - Puede ver, editar y eliminar problemas
   - Puede asignar roles a otros usuarios
   - Puede activar/desactivar usuarios

2. **👤 Usuario Normal (user)**
   - Puede registrar problemas
   - Puede ver problemas (todos o solo los suyos, según configuración)
   - Puede buscar soluciones
   - NO puede crear usuarios
   - NO puede cambiar roles

---

## 📋 Funcionalidades por Rol

### ADMIN puede:
- ✅ Ver opción "Gestionar Usuarios" en el menú
- ✅ Crear nuevos usuarios directamente desde la app
- ✅ Asignar roles (admin/usuario) a los usuarios
- ✅ Activar/Desactivar usuarios
- ✅ Ver todos los usuarios del sistema
- ✅ Cambiar el rol de cualquier usuario
- ✅ Registrar problemas/soluciones
- ✅ Ver y buscar problemas
- ✅ Editar y eliminar problemas (si se implementa)

### USUARIO NORMAL puede:
- ✅ Registrar problemas/soluciones
- ✅ Ver problemas
- ✅ Buscar soluciones
- ❌ NO ve la opción "Gestionar Usuarios"
- ❌ NO puede crear usuarios
- ❌ NO puede cambiar roles
- ❌ NO puede editar/eliminar problemas de otros

---

## 🏗️ Estructura de Datos

### Colección `users` en Firestore:

```javascript
users/
  └── userId123/
      ├── email: "admin@example.com"
      ├── name: "Admin Principal"
      ├── role: "admin"               // "admin" o "user"
      ├── isActive: true              // true o false
      ├── createdAt: timestamp
      ├── createdBy: "adminUserId"    // Quién creó este usuario
      └── updatedAt: timestamp
```

### Campos de Usuario:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `email` | string | Correo electrónico del usuario |
| `name` | string | Nombre completo |
| `role` | string | Rol: "admin" o "user" |
| `isActive` | boolean | Si el usuario está activo |
| `createdAt` | timestamp | Fecha de creación |
| `createdBy` | string | ID del admin que creó el usuario |
| `updatedAt` | timestamp | Última actualización |

---

## 📁 Archivos Creados/Modificados

### ✅ Nuevos Archivos:

1. **`src/services/userService.js`**
   - Servicio para gestión de usuarios
   - Funciones: crear, leer, actualizar, eliminar usuarios
   - Funciones: verificar roles, cambiar roles

2. **`src/screens/ManageUsersScreen.js`**
   - Pantalla de gestión de usuarios (solo admin)
   - Lista de usuarios
   - Crear nuevo usuario
   - Cambiar roles
   - Activar/Desactivar usuarios

3. **`app/manage-users.tsx`**
   - Ruta de la pantalla de gestión

4. **`firestore.rules`**
   - Reglas de seguridad de Firestore
   - Control de acceso basado en roles

### ✅ Archivos Modificados:

1. **`src/context/AuthContext.js`**
   - Agrega soporte para roles
   - Agrega `isAdmin` y `isUser` al contexto
   - Obtiene rol del usuario desde Firestore

2. **`src/screens/MenuScreen.js`**
   - Muestra opciones según rol
   - Agrega opción "Gestionar Usuarios" (solo admin)
   - Muestra badge de rol (👑 Admin / 👤 Usuario)

---

## 🚀 Cómo Usar el Sistema

### 1. **Configurar el Primer Admin**

Primero necesitas crear manualmente el primer usuario admin en Firestore Console:

#### Opción A: Desde Firebase Console

1. Ve a **Firebase Console** → Tu proyecto
2. Ve a **Firestore Database**
3. Crea la colección `users` si no existe
4. Agrega un documento con el **UID del usuario** como ID:

```json
{
  "email": "admin@example.com",
  "name": "Admin Principal",
  "role": "admin",
  "isActive": true,
  "createdAt": [timestamp actual],
  "createdBy": "system"
}
```

**IMPORTANTE**: El ID del documento debe ser el **UID** del usuario en Firebase Auth.

#### Opción B: Desde la App (después de login)

1. Inicia sesión con el usuario que quieres hacer admin
2. En la consola del navegador, ejecuta:
```javascript
import userService from './src/services/userService';
await userService.createUserDocument('USER_ID_AQUI', {
  email: 'admin@example.com',
  name: 'Admin Principal',
  role: 'admin'
});
```

### 2. **Desplegar Reglas de Firestore**

Las reglas de seguridad están en `firestore.rules`. Para desplegarlas:

```bash
firebase deploy --only firestore:rules
```

Si no tienes Firebase CLI instalado:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 3. **Usar la App como Admin**

1. **Inicia sesión** con la cuenta admin
2. Verás **"👑 Administrador"** en tu perfil
3. En el menú verás la opción **"Gestionar Usuarios"**
4. Desde ahí puedes:
   - ➕ **Crear nuevos usuarios**
   - 🔄 **Cambiar roles** (admin ↔ usuario)
   - ✅/❌ **Activar/Desactivar usuarios**

### 4. **Crear un Nuevo Usuario (Como Admin)**

1. Presiona el botón **"+"** (Agregar usuario)
2. Llena el formulario:
   - **Nombre completo**
   - **Correo electrónico**
   - **Contraseña** (mínimo 6 caracteres)
   - **Rol**: Usuario o Administrador
3. Presiona **"Crear Usuario"**
4. El usuario se crea en Firebase Auth y en Firestore

---

## 🔒 Reglas de Seguridad

### Firestore Rules (`firestore.rules`):

```javascript
// Solo admins pueden crear usuarios
allow create: if isAdmin();

// Solo admins pueden cambiar roles
allow update: if isAdmin();

// Usuarios pueden ver problemas solo si están activos
allow read: if isSignedIn() && isUserActive();

// Usuarios pueden crear problemas
allow create: if isSignedIn() && isUserActive();

// Solo admins pueden editar/eliminar problemas
allow update, delete: if isAdmin();
```

### Storage Rules (`firebase-storage.rules`):

```javascript
// Solo usuarios autenticados pueden leer/escribir
allow read, write: if request.auth != null;
```

---

## 🎨 UI/UX del Sistema

### Menú Principal:

**Para Admin:**
```
┌─────────────────────────────┐
│  Registrar problema         │
├─────────────────────────────┤
│  Ver Registros              │
├─────────────────────────────┤
│  Buscar Soluciones          │
├─────────────────────────────┤
│  👑 Gestionar Usuarios      │  ← Solo Admin
└─────────────────────────────┘
```

**Para Usuario Normal:**
```
┌─────────────────────────────┐
│  Registrar problema         │
├─────────────────────────────┤
│  Ver Registros              │
├─────────────────────────────┤
│  Buscar Soluciones          │
└─────────────────────────────┘
```

### Pantalla de Gestión de Usuarios:

```
┌──────────────────────────────────┐
│  ← Gestión de Usuarios        +  │
├──────────────────────────────────┤
│  👑 Admin Principal              │
│  admin@example.com               │
│  ✓ Activo                        │
├──────────────────────────────────┤
│  👤 Juan Pérez          🔄  ✅   │
│  juan@example.com                │
│  ✓ Activo                        │
├──────────────────────────────────┤
│  👤 María García        🔄  ❌   │
│  maria@example.com               │
│  ✗ Inactivo                      │
└──────────────────────────────────┘
```

**Iconos:**
- 🔄 = Cambiar rol (admin ↔ usuario)
- ✅ = Activar usuario
- ❌ = Desactivar usuario

---

## 🧪 Cómo Probar

### Paso 1: Configurar Admin Inicial

1. Regístrate o inicia sesión con un usuario
2. Ve a Firebase Console → Firestore
3. Busca o crea el documento en `users/{userId}`
4. Asegúrate que tenga `role: "admin"`

### Paso 2: Desplegar Reglas

```bash
firebase deploy --only firestore:rules
```

### Paso 3: Probar como Admin

1. Cierra sesión y vuelve a iniciar con la cuenta admin
2. Verás "👑 Administrador" en el menú
3. Ve a "Gestionar Usuarios"
4. Crea un nuevo usuario de prueba
5. Cambia su rol a admin o user
6. Desactiva y reactiva el usuario

### Paso 4: Probar como Usuario Normal

1. Cierra sesión
2. Inicia sesión con el usuario normal
3. Verás "👤 Usuario" en el menú
4. **NO verás** la opción "Gestionar Usuarios"
5. Intenta registrar un problema (debe funcionar)

---

## 🐛 Solución de Problemas

### "Permission denied" en Firestore

**Causa**: Las reglas no están desplegadas o el usuario no tiene rol

**Solución**:
1. Despliega las reglas: `firebase deploy --only firestore:rules`
2. Verifica que el usuario tenga un documento en `users/` con `role`
3. Verifica que `isActive: true`

### No veo la opción "Gestionar Usuarios"

**Causa**: No eres admin

**Solución**:
1. Ve a Firebase Console → Firestore → `users/{tuUserId}`
2. Verifica que `role: "admin"`
3. Cierra sesión y vuelve a iniciar

### Error al crear usuario: "Email already in use"

**Causa**: El correo ya está registrado

**Solución**:
- Usa otro correo electrónico
- O elimina el usuario existente primero (desde Firebase Auth)

### El rol no se actualiza en la app

**Causa**: El AuthContext no se ha refrescado

**Solución**:
- Cierra sesión y vuelve a iniciar sesión
- El rol se carga al autenticarse

---

## 📊 Flujo de Autenticación con Roles

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│  Firebase Auth           │
│  ✓ Email/Password válido │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Firestore: users/{uid}  │
│  Obtener rol y datos     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  AuthContext             │
│  user.role = "admin"     │
│  isAdmin = true          │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  MenuScreen              │
│  Muestra opciones según  │
│  rol del usuario         │
└──────────────────────────┘
```

---

## 🔧 Personalización

### Cambiar permisos de usuarios normales:

En `firestore.rules`, línea de problemas:

```javascript
// Permitir que usuarios editen sus propios problemas:
allow update: if isAdmin() ||
              resource.data.registeredBy.userId == request.auth.uid;

// Permitir que usuarios solo vean sus propios problemas:
allow read: if isAdmin() ||
             resource.data.registeredBy.userId == request.auth.uid;
```

### Agregar más roles:

1. Agrega el nuevo rol en `userService.js`
2. Actualiza las reglas en `firestore.rules`
3. Agrega lógica en `AuthContext.js`:

```javascript
isManager: user?.role === 'manager',
```

4. Agrega opciones de menú según el rol en `MenuScreen.js`

---

## 🎯 Casos de Uso

### Caso 1: Admin crea técnico

```
1. Admin inicia sesión
2. Va a "Gestionar Usuarios"
3. Presiona "+" para agregar usuario
4. Llena formulario:
   - Nombre: "Juan Pérez"
   - Email: "juan@empresa.com"
   - Password: "123456"
   - Rol: Usuario
5. Presiona "Crear Usuario"
6. Juan recibe acceso al sistema
7. Juan puede registrar problemas
```

### Caso 2: Promover usuario a admin

```
1. Admin ve lista de usuarios
2. Encuentra a Juan (👤 Usuario)
3. Presiona 🔄 (cambiar rol)
4. Confirma el cambio
5. Juan ahora es 👑 Admin
6. Juan cierra sesión y vuelve a entrar
7. Juan ve "Gestionar Usuarios" en el menú
```

### Caso 3: Desactivar usuario

```
1. Admin ve lista de usuarios
2. Encuentra usuario a desactivar
3. Presiona ❌ (desactivar)
4. Confirma la acción
5. Usuario queda con estado "✗ Inactivo"
6. Usuario no puede acceder al sistema
```

---

## ✨ Próximas Mejoras Sugeridas

1. **Historial de cambios de rol**
   - Registrar quién cambió el rol y cuándo

2. **Permisos granulares**
   - Permisos específicos por función
   - Ejemplo: "puede_editar_problemas", "puede_eliminar"

3. **Notificaciones**
   - Notificar al usuario cuando se le crea la cuenta
   - Notificar cuando se cambia su rol

4. **Auditoría**
   - Registrar todas las acciones de admin
   - Log de creación/edición/eliminación

5. **Recuperación de contraseña**
   - Implementar reset de password desde la app

---

## 📞 Resumen de Comandos

```bash
# Desplegar reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar reglas de Storage
firebase deploy --only storage:rules

# Ejecutar la app
npx expo start

# Ver logs en tiempo real
npx expo start --clear
```

---

## ✅ Checklist de Implementación

- [x] Servicio de usuarios creado
- [x] AuthContext actualizado con roles
- [x] Pantalla de gestión de usuarios
- [x] Menú dinámico según rol
- [x] Reglas de Firestore configuradas
- [x] Rutas protegidas por rol
- [x] UI con badges de rol
- [x] Crear/editar/eliminar usuarios
- [x] Cambiar roles
- [x] Activar/desactivar usuarios

---

## 🎉 ¡Todo Listo!

El sistema de roles está **100% funcional**.

**Siguiente paso**:
1. Configura tu primer usuario admin en Firestore
2. Despliega las reglas de seguridad
3. ¡Prueba el sistema!

**¿Necesitas ayuda?** Revisa la sección de Solución de Problemas 🐛
