import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage, auth } from '../config/firebase';

class FirebaseStorageService {
  /**
   * Sube un archivo a Firebase Storage
   * @param {Object} file - Objeto con { uri, type, name }
   * @param {string} folderPath - Ruta de la carpeta en Storage (ej: 'problems/123/images')
   * @returns {Promise<string>} URL del archivo subido
   */
  async uploadFile(file, folderPath) {
    try {
      if (!file || !file.uri) {
        throw new Error('Archivo inválido: URI no encontrada');
      }

      console.log(`🔍 Validando archivo: ${file.name}`);
      console.log(`📁 URI: ${file.uri}`);

      // Validar que la URI sea válida
      if (typeof file.uri !== 'string' || file.uri.trim() === '') {
        throw new Error('URI inválida: debe ser una cadena de texto válida');
      }

      // Validar que la URI comience con un protocolo válido
      const validProtocols = ['file://', 'content://', 'http://', 'https://', 'blob:'];
      const hasValidProtocol = validProtocols.some(protocol => file.uri.startsWith(protocol));

      if (!hasValidProtocol) {
        console.error('❌ URI sin protocolo válido:', file.uri);
        throw new Error(`URI inválida: debe comenzar con ${validProtocols.join(', ')}`);
      }

      // Obtener el blob del archivo
      console.log(`📥 Obteniendo blob del archivo...`);
      const response = await fetch(file.uri);
      if (!response.ok) {
        throw new Error(`Error al obtener archivo: ${response.status} - ${response.statusText}`);
      }
      const blob = await response.blob();
      console.log(`✅ Blob obtenido: ${(blob.size / 1024).toFixed(2)}KB, tipo: ${blob.type}`);

      // Validar tamaño del archivo (máximo 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (blob.size > maxSize) {
        throw new Error(`Archivo muy grande: ${(blob.size / 1024 / 1024).toFixed(2)}MB. Máximo 50MB`);
      }

      // Validar que el blob tiene contenido
      if (blob.size === 0) {
        throw new Error('El archivo está vacío (0 bytes)');
      }

      // Verificar autenticación antes de subir
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('❌ Usuario NO autenticado en Firebase Auth');
        throw new Error('Usuario no autenticado. Por favor inicia sesión de nuevo.');
      }

      console.log(`✅ Usuario autenticado en Firebase Auth: ${currentUser.email}`);

      // Verificar token
      try {
        const token = await currentUser.getIdToken();
        console.log(`✅ Token de autenticación válido: ${token.substring(0, 20)}...`);
      } catch (tokenError) {
        console.error('❌ Error obteniendo token:', tokenError);
        throw new Error('Error de autenticación. Token inválido.');
      }

      // Crear referencia en Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folderPath}/${fileName}`);

      console.log(`📤 Subiendo archivo a Storage...`);
      console.log(`   📁 Ruta: ${folderPath}/${fileName}`);
      console.log(`   📦 Tamaño: ${(blob.size / 1024).toFixed(2)}KB`);
      console.log(`   🏷️ Tipo: ${blob.type || 'sin tipo'}`);
      console.log(`   🗄️ Bucket: ${storage.app.options.storageBucket}`);

      // Subir archivo con metadata
      const metadata = {
        contentType: blob.type || 'application/octet-stream',
        customMetadata: {
          uploadedBy: 'mobile-app',
          originalName: file.name,
          uploadedByUser: currentUser.email || 'unknown',
        }
      };

      console.log(`🚀 Intentando subir con uploadBytes...`);
      await uploadBytes(storageRef, blob, metadata);
      console.log(`✅ Blob subido a Storage`);

      // Obtener URL de descarga
      console.log(`🔗 Obteniendo URL de descarga...`);
      const downloadURL = await getDownloadURL(storageRef);
      console.log(`✅ Archivo subido exitosamente: ${downloadURL.substring(0, 80)}...`);

      return downloadURL;
    } catch (error) {
      console.error('❌ Error subiendo archivo:', error);
      console.error('   📄 Nombre archivo:', file.name);
      console.error('   📁 URI:', file.uri);
      console.error('   🔥 Código error:', error.code);
      console.error('   💬 Mensaje:', error.message);
      console.error('   📚 Stack:', error.stack);

      // Log del error completo para debugging
      if (error.serverResponse) {
        console.error('   🖥️ Server Response:', error.serverResponse);
      }
      if (error.customData) {
        console.error('   📋 Custom Data:', error.customData);
      }

      // Proporcionar mensajes de error más específicos
      let errorMessage = error.message;

      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Sin permisos para subir archivos a Firebase Storage. Verifica las reglas de seguridad.';
        console.error('💡 SOLUCIÓN: Ve a Firebase Console → Storage → Rules y asegúrate de que las reglas permitan escritura para usuarios autenticados');
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'Subida cancelada';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'Error desconocido de Firebase Storage. Posibles causas: (1) Storage no habilitado, (2) Reglas no desplegadas, (3) Bucket incorrecto';
        console.error('💡 SOLUCIÓN 1: Ve a Firebase Console → Storage y verifica que esté habilitado');
        console.error('💡 SOLUCIÓN 2: Ve a Firebase Console → Storage → Rules y haz clic en "Publish"');
        console.error('💡 SOLUCIÓN 3: Verifica que el storageBucket en firebase.js sea: mecanic-fixs.appspot.com');
      } else if (error.code === 'storage/object-not-found') {
        errorMessage = 'Objeto no encontrado en Storage';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'Cuota de Storage excedida';
      } else if (error.code === 'storage/unauthenticated') {
        errorMessage = 'Usuario no autenticado en Firebase';
        console.error('💡 SOLUCIÓN: Cierra sesión e inicia sesión de nuevo');
      }

      throw new Error(`Error al subir archivo: ${errorMessage}`);
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
      if (!files || files.length === 0) {
        console.log('ℹ️ No hay archivos para subir');
        return [];
      }

      console.log(`📤 Subiendo ${files.length} archivo(s) a ${folderPath}`);

      // Validar que todos los archivos tengan las propiedades necesarias
      const validFiles = files.filter((file, index) => {
        if (!file || !file.uri) {
          console.warn(`⚠️ Archivo ${index + 1} inválido (sin URI), se omitirá`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        console.warn('⚠️ No hay archivos válidos para subir');
        return [];
      }

      console.log(`✅ ${validFiles.length} de ${files.length} archivos son válidos`);

      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          console.log(`🔄 Subiendo archivo ${index + 1}/${validFiles.length}...`);
          const url = await this.uploadFile(file, folderPath);
          console.log(`✅ Archivo ${index + 1}/${validFiles.length} subido correctamente`);
          return url;
        } catch (error) {
          console.error(`❌ Error subiendo archivo ${index + 1}/${validFiles.length}:`, error.message);
          // En lugar de lanzar error, lo registramos y continuamos con los demás
          // Retornar null para archivos fallidos
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);

      // Filtrar resultados nulos (archivos que fallaron)
      const urls = results.filter(url => url !== null);

      const failedCount = results.length - urls.length;
      if (failedCount > 0) {
        console.warn(`⚠️ ${failedCount} archivo(s) no se pudieron subir`);
      }

      console.log(`✅ ${urls.length} de ${validFiles.length} archivo(s) subidos exitosamente`);

      // Si ningún archivo se subió correctamente, lanzar error
      if (urls.length === 0 && validFiles.length > 0) {
        throw new Error('No se pudo subir ningún archivo');
      }

      return urls;
    } catch (error) {
      console.error('❌ Error en subida múltiple:', error.message);
      throw new Error(`Error al subir archivos: ${error.message}`);
    }
  }
}

export default new FirebaseStorageService();