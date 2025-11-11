import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
//mecanic-fixs firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD-PU2z8TtS5hcLZkRIsJS0jnoId-y3qWw",
  authDomain: "mecanic-fixs.firebaseapp.com",
  projectId: "mecanic-fixs",
  storageBucket: "mecanic-fixs.firebasestorage.app", // ✅ Bucket correcto que funcionaba antes
  messagingSenderId: "1088421079089",
  appId: "1:1088421079089:android:ed1ee29c9e310b202a0d10",
  measurementId: "G-X0NENKYEQ0"
};

//inventario-ds firebase config  work order

const firebaseConfig2 = {
  apiKey: "AIzaSyBWGA9DLufePinfsgFKU4fRubBYKcP10w8",
  authDomain: "inventario-ds.firebaseapp.com",
  databaseURL: "https://inventario-ds-default-rtdb.firebaseio.com",
  projectId: "inventario-ds",
  storageBucket: "inventario-ds.appspot.com",
  messagingSenderId: "761232972085",
  appId: "1:761232972085:web:4ad20a183876f3c971547c",
  measurementId: "G-ZHWE6Y84NH"
};

const app = initializeApp(firebaseConfig);

const workOrderApp = initializeApp(firebaseConfig2, 'workOrderApp');

// Usar getAuth en lugar de initializeAuth para mejor compatibilidad
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const workOrderDb = getFirestore(workOrderApp);

export default app;