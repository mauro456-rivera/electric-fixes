import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// const firebaseConfig = {
//   apiKey: "AIzaSyBw41RA86O-nuX231FhAeuju7ZNK18230o",
//   authDomain: "mecanic-fixs.firebaseapp.com",
//   projectId: "mecanic-fixs",
//   storageBucket: "mecanic-fixs.firebasestorage.app",
//   messagingSenderId: "1088421079089",
//   appId: "1:1088421079089:web:1fd0246d525c9abd2a0d10",
//   measurementId: "G-X0NENKYEQ0"
// };

 const firebaseConfig = {
  apiKey: "AIzaSyDs9RqibvovP4AlhOFLnkyKUefGkMp5dzo",
  authDomain: "electric-fixes.firebaseapp.com",
  projectId: "electric-fixes",
  storageBucket: "electric-fixes.firebasestorage.app",
  messagingSenderId: "92482017711",
  appId: "1:92482017711:web:48012a5b4a74eb6771b75a",
  measurementId: "G-KW55QL33HW"
};

const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;