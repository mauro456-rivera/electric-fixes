import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

class FirebaseStorageService {
  /**
   * Sube un archivo a Firebase Storage
   * @param {Object} file - Objeto con { uri, type, name }
   * @param {string} folderPath - Ruta de la carpeta en Storage (ej: 'problems/123/images')
   * @returns {Promise<string>} URL del archivo subido
   */
  async uploadFile(file, folderPath) {
    try {
      // Obtener el blob del archivo
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Crear referencia en Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folderPath}/${fileName}`);

      // Subir archivo
      console.log(`📤 Subiendo archivo: ${folderPath}/${fileName}`);
      await uploadBytes(storageRef, blob);

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);
      console.log(`✅ Archivo subido: ${downloadURL}`);

      return downloadURL;
    } catch (error) {
      console.error('❌ Error subiendo archivo:', error);
      throw error;
    }
  }

  /**
   * Sube múltiples archivos
   * @param {Array} files - Array de archivos
   * @param {string} folderPath - Ruta base de la carpeta
   * @returns {Promise<Array<string>>} Array de URLs
   */
  async uploadMultipleFiles(files, folderPath) {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folderPath));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('❌ Error subiendo múltiples archivos:', error);
      throw error;
    }
  }
}

export default new FirebaseStorageService();