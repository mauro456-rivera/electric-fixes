/**
 * Script para crear/actualizar el documento de usuario admin en Firestore
 * Ejecutar con: node scripts/createAdminUser.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase (debe coincidir con tu app)
const firebaseConfig = {
  apiKey: "AIzaSyD-PU2z8TtS5hcLZkRIsJS0jnoId-y3qWw",
  authDomain: "mecanic-fixs.firebaseapp.com",
  projectId: "mecanic-fixs",
  storageBucket: "mecanic-fixs.appspot.com",
  messagingSenderId: "1088421079089",
  appId: "1:1088421079089:android:ed1ee29c9e310b202a0d10"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ID del usuario admin (cámbialo por el ID real que ves en los logs)
const ADMIN_USER_ID = 'bntcBv7W1dNFN0OLGvT19ztorDm2';
const ADMIN_EMAIL = 'admin@dieselsoft.co';

async function createAdminUser() {
  try {
    console.log('🔵 Iniciando creación de documento admin...');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🆔 User ID:', ADMIN_USER_ID);

    const userDocRef = doc(db, 'users', ADMIN_USER_ID);

    // Verificar si ya existe
    const existingDoc = await getDoc(userDocRef);

    if (existingDoc.exists()) {
      console.log('⚠️ El documento ya existe. Datos actuales:');
      console.log(existingDoc.data());
      console.log('\n¿Deseas actualizarlo? Cambia FORCE_UPDATE a true en el código.');
      
      const FORCE_UPDATE = true; // Cambia a true para actualizar
      
      if (!FORCE_UPDATE) {
        console.log('❌ No se actualizará. Script finalizado.');
        process.exit(0);
      }
    }

    // Crear o actualizar el documento
    await setDoc(userDocRef, {
      email: ADMIN_EMAIL,
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
      createdAt: existingDoc.exists() ? existingDoc.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: ADMIN_USER_ID,
    }, { merge: true }); // merge: true para no sobrescribir campos existentes

    console.log('✅ Documento de usuario admin creado/actualizado exitosamente!');
    console.log('✅ Rol: admin');
    console.log('✅ Permisos completos asignados');
    console.log('\n🎉 Ya puedes iniciar sesión con tu cuenta admin.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando documento admin:', error);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('\n🔒 SOLUCIÓN: Necesitas reglas temporales más permisivas.');
      console.error('Agrega esta regla temporal a firestore.rules:');
      console.error('\nmatch /users/{userId} {');
      console.error('  allow write: if request.auth != null && request.auth.uid == userId;');
      console.error('}');
    }
    
    process.exit(1);
  }
}

createAdminUser();
