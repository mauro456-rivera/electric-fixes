/**
 * Script TEMPORAL para arreglar el problema del usuario admin
 * Este script debe ejecutarse UNA VEZ cuando el usuario admin ya está autenticado
 * 
 * PASOS:
 * 1. Inicia sesión en la app con admin@dieselsoft.co
 * 2. Cuando veas el error de permisos, ejecuta este script
 * 3. El script creará el documento del usuario en Firestore
 */

import { auth, db } from '../src/config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export async function fixAdminUser() {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('❌ No hay usuario autenticado');
      return { success: false, error: 'No authenticated user' };
    }

    console.log('🔵 Usuario actual:', currentUser.email);
    console.log('🔵 UID:', currentUser.uid);

    const userDocRef = doc(db, 'users', currentUser.uid);

    // Verificar si ya existe
    try {
      const existingDoc = await getDoc(userDocRef);
      
      if (existingDoc.exists()) {
        console.log('✅ El documento ya existe:', existingDoc.data());
        return { success: true, exists: true, data: existingDoc.data() };
      }
    } catch (readError) {
      console.log('⚠️ No se pudo leer el documento (puede no existir):', readError.code);
    }

    // Crear el documento
    console.log('🔧 Creando documento de usuario...');
    
    const userData = {
      email: currentUser.email,
      name: 'Admin Dieselsoft',
      role: 'admin',
      isActive: true,
      permissions: {
        canEdit: true,
        canDelete: true,
        canViewAll: true,
        canViewSolutions: true,
        canOnlyRegister: false,
      },
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid,
    };

    await setDoc(userDocRef, userData);

    console.log('✅ Documento de usuario creado exitosamente!');
    console.log('✅ Ahora debes cerrar sesión y volver a iniciar sesión');

    return { success: true, created: true, data: userData };
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);

    if (error.code === 'permission-denied') {
      console.error('\n🔒 ERROR DE PERMISOS');
      console.error('Necesitas desplegar las nuevas reglas de Firestore:');
      console.error('1. firebase deploy --only firestore:rules');
      console.error('2. O desde la consola de Firebase manualmente');
    }

    return { success: false, error: error.message, code: error.code };
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  fixAdminUser().then(result => {
    console.log('Resultado:', result);
    process.exit(result.success ? 0 : 1);
  });
}
