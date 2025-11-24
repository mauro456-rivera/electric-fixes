import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth } from '../config/firebase';
import userService from '../services/userService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref para almacenar resolvers de promises cuando esperamos autenticación completa
  const authCompleteResolvers = useRef([]);

  // Escuchar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Usuario autenticado en Firebase
          let userToken = null;
          try {
            userToken = await firebaseUser.getIdToken();
          } catch (tokenError) {
            console.error('Error obteniendo token:', tokenError.message);
          }

          // Intentar obtener rol y datos adicionales de Firestore
          let userRole = { role: 'user', name: 'Usuario', isActive: true, _exists: false };

          try {
            console.log('🔍 Obteniendo rol de usuario desde Firestore...');
            userRole = await userService.getUserRole(firebaseUser.uid);

            // SOLO crear documento si realmente no existe (no si hay error de red/permisos)
            if (userRole._exists === false && userRole._notFound === true) {
              console.log('⚠️ Usuario sin documento en Firestore, creando automáticamente...');
              console.log('ℹ️ Email del usuario:', firebaseUser.email);

              await userService.createUserDocument(firebaseUser.uid, {
                email: firebaseUser.email,
                name: firebaseUser.email?.split('@')[0] || 'Usuario',
                role: 'user',
                createdBy: firebaseUser.uid,
              });

              console.log('✅ Documento creado con rol "user" por defecto');
              console.log('ℹ️ Si este usuario debe ser admin, actualiza el documento en Firestore manualmente');

              // Obtener el rol nuevamente después de crear el documento
              userRole = await userService.getUserRole(firebaseUser.uid);
            } else if (userRole._permissionError) {
              console.error('🔒 Error de permisos al leer usuario - NO se creará documento');
              console.error('ℹ️ Continuando con rol "user" por defecto hasta que se resuelva el problema');
            } else if (userRole._networkError) {
              console.error('🌐 Error de red al leer usuario - NO se creará documento');
              console.error('ℹ️ Continuando con rol "user" por defecto. Intenta verificar tu conexión.');
            } else if (userRole._unknownError) {
              console.error('❓ Error desconocido al leer usuario - NO se creará documento');
              console.error('ℹ️ Continuando con rol "user" por defecto');
            }
          } catch (roleError) {
            console.warn('❌ No se pudo obtener rol de Firestore:', roleError.message);
          }

          console.log('📊 Rol final asignado:', userRole.role);

          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userRole.name || firebaseUser.email?.split('@')[0] || 'Usuario',
            emailVerified: firebaseUser.emailVerified,
            role: userRole.role || 'user',
            isActive: userRole.isActive !== false,
            permissions: userRole.permissions || userService.getDefaultPermissions(userRole.role || 'user'),
          };

          setUser(userData);
          setToken(userToken);
          console.log('✅ Usuario autenticado:', userData.email, '| Rol:', userData.role);

          // Resolver todas las promises pendientes que esperan autenticación completa
          authCompleteResolvers.current.forEach(resolve => resolve(userData));
          authCompleteResolvers.current = [];
        } else {
          // Usuario no autenticado
          setUser(null);
          setToken(null);

          // Resolver promises pendientes con null (no autenticado)
          authCompleteResolvers.current.forEach(resolve => resolve(null));
          authCompleteResolvers.current = [];
        }
      } catch (error) {
        console.error('Error en autenticación:', error.message);

        // Solo cerrar sesión si hay error crítico de autenticación de Firebase
        if (error.code && error.code.includes('auth/')) {
          setUser(null);
          setToken(null);
        }

        // Rechazar promises pendientes en caso de error
        authCompleteResolvers.current.forEach(resolve => resolve(null));
        authCompleteResolvers.current = [];
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (emailOrUsername, password) => {
    try {
      setLoading(true);
      console.log('🔵 Iniciando login con Firebase Auth directamente...');

      // Detectar si es username (sin @) o email completo
      let email = emailOrUsername;
      if (!emailOrUsername.includes('@')) {
        // Es un username, convertir a email
        email = `${emailOrUsername.toLowerCase()}@mecanic-fixes.app`;
        console.log('🔄 Username detectado, convertido a email:', email);
      }

      // Autenticación directa con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log('✅ Autenticación exitosa:', userCredential.user.email);
      console.log('⏳ Esperando a que se carguen datos del usuario (rol, permisos, etc.)...');

      // Crear promise que se resolverá cuando onAuthStateChanged termine
      // con timeout de seguridad de 5 segundos
      const authCompletePromise = new Promise((resolve) => {
        authCompleteResolvers.current.push(resolve);

        // Timeout de seguridad: si después de 5 segundos no se resuelve, continuar
        setTimeout(() => {
          console.warn('⚠️ Timeout esperando autenticación completa, continuando de todas formas...');
          resolve(user); // Resolver con el usuario actual del estado
        }, 5000);
      });

      // Si ya hay un usuario autenticado en el estado (sesión activa),
      // resolver inmediatamente con ese usuario
      if (user && user.email === email) {
        console.log('ℹ️ Usuario ya autenticado, usando datos existentes...');
        setTimeout(() => {
          if (authCompleteResolvers.current.length > 0) {
            authCompleteResolvers.current.forEach(resolve => resolve(user));
            authCompleteResolvers.current = [];
          }
        }, 100);
      }

      // Esperar a que onAuthStateChanged termine de procesar completamente el usuario
      const completeUser = await authCompletePromise;

      if (completeUser) {
        console.log('✅ Datos del usuario cargados completamente. Usuario listo para navegar.');
      } else {
        console.warn('⚠️ Usuario autenticado pero sin datos completos');
      }

      return userCredential;
    } catch (error) {
      console.error('❌ Error en signIn:', error);

      // Limpiar resolvers pendientes en caso de error
      authCompleteResolvers.current = [];

      // Traducir errores de Firebase a español
      let errorMessage = 'Error de autenticación';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Credenciales inválidas';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet';
          break;
        default:
          errorMessage = error.message;
      }

      const customError = new Error(errorMessage);
      customError.code = error.code;
      throw customError;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🔵 Cerrando sesión con Firebase Auth...');

      // Cerrar sesión directamente con Firebase
      await firebaseSignOut(auth);

      console.log('✅ Sesión cerrada');
      // onAuthStateChanged se encargará de limpiar el estado
    } catch (error) {
      console.error('❌ Error en signOut:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      console.log('🔵 Eliminando cuenta...');

      // Llamar al servicio para eliminar la cuenta
      await userService.deleteAccount();

      console.log('✅ Cuenta eliminada exitosamente');
      // onAuthStateChanged detectará automáticamente que el usuario fue eliminado
      // y limpiará el estado
    } catch (error) {
      console.error('❌ Error en deleteAccount:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    signIn,
    signOut,
    deleteAccount,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    isGuest: user?.role === 'invitado',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};