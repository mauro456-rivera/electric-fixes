import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, deleteUser, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

class UserService {
  constructor() {
    // Inicializar una app secundaria para crear usuarios sin afectar la sesión actual
    // IMPORTANTE: Debe coincidir con google-services.json (Android)
    const firebaseConfig = {
      apiKey: "AIzaSyD-PU2z8TtS5hcLZkRIsJS0jnoId-y3qWw", // Android API Key
      authDomain: "mecanic-fixs.firebaseapp.com",
      projectId: "mecanic-fixs",
      storageBucket: "mecanic-fixs.appspot.com",
      messagingSenderId: "1088421079089",
      appId: "1:1088421079089:android:ed1ee29c9e310b202a0d10" // Android App ID
    };

    try {
      // Intentar inicializar la app secundaria
      this.secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
      this.secondaryAuth = initializeAuth(this.secondaryApp, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (error) {
      // Si ya existe, obtenerla
      console.log('⚠️ App secundaria ya existe, usando la existente');
    }
  }

  /**
   * Obtiene el rol y datos adicionales de un usuario desde Firestore
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Datos del usuario con rol
   */
  async getUserRole(userId) {
    try {
      console.log('🔍 Buscando documento de usuario en Firestore:', userId);
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ Documento encontrado en Firestore:', {
          id: userId,
          email: userData.email,
          role: userData.role,
          name: userData.name,
          isActive: userData.isActive
        });
        return { ...userData, _exists: true };
      } else {
        // Si el usuario no existe en Firestore
        console.warn('⚠️ Usuario NO tiene documento en Firestore:', userId);
        console.warn('⚠️ Se asignará rol "user" por defecto');
        return { role: 'user', _exists: false, _notFound: true };
      }
    } catch (error) {
      console.error('❌ Error obteniendo rol del usuario:', error);
      console.error('❌ Código de error:', error.code);
      console.error('❌ Mensaje:', error.message);

      // Distinguir entre error de red/permisos vs documento no encontrado
      if (error.code === 'permission-denied') {
        console.error('🔒 Error de permisos - NO se debe crear documento automáticamente');
        return { role: 'user', _exists: false, _permissionError: true };
      } else if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
        console.error('🌐 Error de red/timeout - NO se debe crear documento automáticamente');
        return { role: 'user', _exists: false, _networkError: true };
      }

      // Otro tipo de error
      return { role: 'user', _exists: false, _unknownError: true };
    }
  }

  /**
   * Obtiene los permisos por defecto según el rol
   * @param {string} role - Rol del usuario
   * @returns {Object} Permisos por defecto
   */
  getDefaultPermissions(role) {
    if (role === 'admin') {
      return {
        canEdit: true,
        canDelete: true,
        canViewAll: true,
        canViewSolutions: true,
        canOnlyRegister: false,
      };
    }

    if (role === 'invitado') {
      return {
        canEdit: false,
        canDelete: false,
        canViewAll: false,
        canViewSolutions: true, // Solo puede ver soluciones
        canOnlyRegister: false,
      };
    }

    // Usuario normal por defecto
    return {
      canEdit: false,
      canDelete: false,
      canViewAll: false,
      canViewSolutions: false,
      canOnlyRegister: false,
    };
  }

  /**
   * Crea un documento de usuario en Firestore con rol y permisos
   * IMPORTANTE: Verifica que el documento NO exista antes de crearlo para evitar sobrescribir
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<void>}
   */
  async createUserDocument(userId, userData) {
    try {
      const userDocRef = doc(db, 'users', userId);

      // VERIFICAR SI EL DOCUMENTO YA EXISTE ANTES DE CREARLO
      const existingDoc = await getDoc(userDocRef);

      if (existingDoc.exists()) {
        console.warn('⚠️ El documento de usuario YA EXISTE, NO se sobrescribirá');
        console.warn('ℹ️ Datos existentes:', existingDoc.data());
        console.warn('🔒 PROTECCIÓN: Se previno sobrescritura de datos de usuario existente');
        return; // NO crear/sobrescribir
      }

      // Solo crear si NO existe
      const role = userData.role || 'user';
      const permissions = this.getDefaultPermissions(role);

      await setDoc(userDocRef, {
        email: userData.email,
        name: userData.name || 'Usuario Desconocido',
        role: role,
        createdAt: serverTimestamp(),
        createdBy: userData.createdBy || userId,
        isActive: true,
        permissions: permissions,
      });
      console.log('✅ Documento de usuario creado:', userId);
    } catch (error) {
      console.error('❌ Error creando documento de usuario:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario (solo para admins)
   * @param {Object} userData - Datos del nuevo usuario
   * @param {string} currentUserId - ID del admin que crea el usuario
   * @returns {Promise<string>} ID del usuario creado
   */
  async createUser(userData, currentUserId) {
    if (!auth.currentUser) {
      throw new Error('Debes estar autenticado para crear usuarios');
    }

    try {
      console.log('🔵 Creando nuevo usuario con app secundaria...');

      // Crear usuario usando la app secundaria (NO afecta la sesión actual)
      const userCredential = await createUserWithEmailAndPassword(
        this.secondaryAuth,
        userData.email,
        userData.password
      );

      const newUserId = userCredential.user.uid;
      console.log('✅ Usuario creado en Auth:', newUserId);

      // Crear documento en Firestore
      await this.createUserDocument(newUserId, {
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        createdBy: currentUserId,
      });

      // Cerrar sesión en la app secundaria
      await this.secondaryAuth.signOut();
      console.log('✅ Sesión secundaria cerrada');

      console.log('✅ Usuario creado exitosamente sin afectar sesión actual');
      return newUserId;
    } catch (error) {
      console.error('❌ Error creando usuario:', error);

      // Intentar cerrar sesión en la app secundaria
      try {
        await this.secondaryAuth.signOut();
      } catch (signOutError) {
        console.error('⚠️ Error cerrando sesión secundaria:', signOutError);
      }

      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return users;
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      throw error;
    }
  }

  /**
   * Actualiza el rol de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} newRole - Nuevo rol
   * @returns {Promise<void>}
   */
  async updateUserRole(userId, newRole) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Rol actualizado:', userId, newRole);
    } catch (error) {
      console.error('❌ Error actualizando rol:', error);
      throw error;
    }
  }

  /**
   * Desactiva/Activa un usuario
   * @param {string} userId - ID del usuario
   * @param {boolean} isActive - Estado activo
   * @returns {Promise<void>}
   */
  async toggleUserStatus(userId, isActive) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        isActive: isActive,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Estado actualizado:', userId, isActive);
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario (solo documento de Firestore)
   * @param {string} userId - ID del usuario
   * @returns {Promise<void>}
   */
  async deleteUserDocument(userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);
      console.log('✅ Usuario eliminado:', userId);
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario es admin
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  async isAdmin(userId) {
    try {
      const userData = await this.getUserRole(userId);
      return userData.role === 'admin';
    } catch (error) {
      console.error('❌ Error verificando admin:', error);
      return false;
    }
  }

  /**
   * Actualiza los permisos de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} permissions - Nuevos permisos
   * @returns {Promise<void>}
   */
  async updateUserPermissions(userId, permissions) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        permissions: permissions,
        updatedAt: serverTimestamp(),
      });
      console.log('✅ Permisos actualizados:', userId);
    } catch (error) {
      console.error('❌ Error actualizando permisos:', error);
      throw error;
    }
  }

  /**
   * Obtiene los permisos de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Permisos del usuario
   */
  async getUserPermissions(userId) {
    try {
      const userData = await this.getUserRole(userId);
      return userData.permissions || this.getDefaultPermissions(userData.role || 'user');
    } catch (error) {
      console.error('❌ Error obteniendo permisos:', error);
      return this.getDefaultPermissions('user');
    }
  }

  /**
   * Registra un nuevo usuario invitado (auto-registro)
   * @param {Object} userData - Datos del nuevo usuario invitado
   * @returns {Promise<string>} ID del usuario creado
   */
  async registerGuest(userData) {
    try {
      console.log('🔵 Registrando nuevo usuario invitado...');

      // Crear usuario con Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const newUserId = userCredential.user.uid;
      console.log('✅ Usuario invitado creado en Auth:', newUserId);

      // Crear documento en Firestore con role 'invitado'
      await this.createUserDocument(newUserId, {
        email: userData.email,
        name: userData.name,
        role: 'invitado',
        createdBy: newUserId, // Se auto-registró
      });

      console.log('✅ Usuario invitado registrado exitosamente');
      return newUserId;
    } catch (error) {
      console.error('❌ Error registrando usuario invitado:', error);
      throw error;
    }
  }

  /**
   * Elimina la cuenta del usuario actual (cumple con requisitos del App Store)
   * - Elimina el documento de Firestore
   * - Elimina el usuario de Firebase Auth
   * Solo para usuarios que se auto-registraron (rol: invitado)
   * @returns {Promise<void>}
   */
  async deleteAccount() {
    try {
      console.log('🔵 Iniciando eliminación de cuenta...');

      if (!auth.currentUser) {
        throw new Error('Debes estar autenticado para eliminar tu cuenta');
      }

      const userId = auth.currentUser.uid;
      console.log('🔵 Eliminando cuenta del usuario:', userId);

      // 1. Primero eliminar el documento de Firestore
      try {
        const userDocRef = doc(db, 'users', userId);
        await deleteDoc(userDocRef);
        console.log('✅ Documento de Firestore eliminado:', userId);
      } catch (firestoreError) {
        console.error('⚠️ Error eliminando documento de Firestore:', firestoreError);
        // Continuar con la eliminación del usuario de Auth aunque falle Firestore
      }

      // 2. Luego eliminar el usuario de Firebase Auth
      // IMPORTANTE: Esto requiere que el usuario haya iniciado sesión recientemente
      await deleteUser(auth.currentUser);
      console.log('✅ Usuario eliminado de Firebase Auth:', userId);
      console.log('✅ Cuenta eliminada completamente');
    } catch (error) {
      console.error('❌ Error eliminando cuenta:', error);

      // Si el error es por re-autenticación requerida, lanzar error específico
      if (error.code === 'auth/requires-recent-login') {
        const reAuthError = new Error('Por seguridad, debes cerrar sesión e iniciar sesión nuevamente antes de eliminar tu cuenta');
        reAuthError.code = 'auth/requires-recent-login';
        throw reAuthError;
      }

      throw error;
    }
  }
}

export default new UserService();
