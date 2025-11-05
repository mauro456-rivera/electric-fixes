/**
 * Script para ACTUALIZAR permisos del usuario admin existente
 * Ejecutar con: node scripts/updateAdminPermissions.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD-PU2z8TtS5hcLZkRIsJS0jnoId-y3qWw",
  authDomain: "mecanic-fixs.firebaseapp.com",
  projectId: "mecanic-fixs",
  storageBucket: "mecanic-fixs.appspot.com",
  messagingSenderId: "1088421079089",
  appId: "1:1088421079089:android:ed1ee29c9e310b202a0d10"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_USER_ID = 'bntcBv7W1dNFN0OLGvT19ztorDm2';

async function updateAdminPermissions() {
  try {
    console.log('🔧 Actualizando permisos de admin...');
    console.log('🆔 User ID:', ADMIN_USER_ID);

    const userDocRef = doc(db, 'users', ADMIN_USER_ID);

    await updateDoc(userDocRef, {
      'permissions.canEdit': true,
      'permissions.canDelete': true,
      'permissions.canViewAll': true,
      'permissions.canViewSolutions': true,
      'permissions.canOnlyRegister': false,
    });

    console.log('✅ Permisos actualizados exitosamente!');
    console.log('✅ Todos los permisos de admin están ahora en TRUE');
    console.log('\n🎉 Ahora cierra sesión y vuelve a iniciar sesión en tu app.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);

    if (error.code === 'permission-denied') {
      console.error('\n🔒 ERROR DE PERMISOS');
      console.error('Usa la consola de Firebase para actualizar manualmente:');
      console.error('https://console.firebase.google.com/project/mecanic-fixs/firestore/data/~2Fusers~2FbntcBv7W1dNFN0OLGvT19ztorDm2');
    }

    process.exit(1);
  }
}

updateAdminPermissions();
