import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import FirebaseStorageService from './firebaseStorage';

class FirebaseFirestoreService {
  /**
   * Obtiene el nombre de la colección según el tipo de problema
   * @param {string} problemType - Tipo de problema ('mechanical' o 'electrical')
   * @returns {string} Nombre de la colección
   */
  getCollectionName(problemType) {
    return problemType === 'electrical' ? 'electrical-problems' : 'mechanical-problems';
  }

  /**
   * Guarda una guía de diagnóstico completa en Firestore con sus archivos en Storage
   * @param {Object} generalData - Datos generales (diagnosticGuide, truckData, workOrder, síntomas, herramientas)
   * @param {Array} problems - Array de PASOS con sus SUB-PASOS
   * @param {Object} user - Información del usuario que registra la guía
   * @param {string} problemType - Tipo de problema ('mechanical' o 'electrical')
   * @returns {Promise<string>} ID del documento creado en Firestore
   * @throws {Error} Si falla el guardado en Firebase
   */
  async saveProblem(generalData, problems, user, problemType = 'mechanical') {
    try {
      const problemId = `problem_${Date.now()}`;
      console.log(`💾 Iniciando guardado de guía de diagnóstico: ${problemId}`);

      // Procesa cada PASO subiendo sus archivos a Storage
      const processedProblems = await Promise.all(
        problems.map(async (problem, index) => {
          console.log(`📋 Procesando PASO ${index + 1}/${problems.length}`);

          // Procesa y sube archivos de cada SUB-PASO (antes "actividades")
          const processedActivities = await Promise.all(
            problem.activities.map(async (activity, actIndex) => {
              let activityFileUrls = [];
              if (activity.files && activity.files.length > 0) {
                console.log(`📎 Subiendo ${activity.files.length} archivos de SUB-PASO ${actIndex + 1}`);
                activityFileUrls = await FirebaseStorageService.uploadMultipleFiles(
                  activity.files,
                  `problems/${problemId}/step_${index}/substeps/substep_${actIndex}`
                );
              }
              return {
                title: activity.title,
                files: activityFileUrls,
                notes: activity.notes ? activity.notes.filter(note => note.text.trim() !== '').map(note => note.text) : [],
              };
            })
          );

          // Retorna el PASO procesado con todas las URLs de archivos de los SUB-PASOS
          return {
            stepTitle: problem.problemTitle, // Título del PASO
            subSteps: processedActivities,    // SUB-PASOS (antes "activities")
            otherData: problem.otherData,
          };
        })
      );

      // Construye el documento completo para guardar en Firestore
      const collectionName = this.getCollectionName(problemType);
      const docData = {
        generalData: {
          diagnosticGuide: generalData.diagnosticGuide || '', // GUÍA DE DIAGNÓSTICO (antes "topic")
          // Datos del camión separados
          truckBrand: generalData.truckBrand || '',
          truckModel: generalData.truckModel || '',
          truckYear: generalData.truckYear || '',
          // Mantener truckData para compatibilidad con registros antiguos
          truckData: generalData.truckData || `${generalData.truckBrand || ''} ${generalData.truckModel || ''} ${generalData.truckYear || ''}`.trim(),
          workOrder: generalData.workOrder || '', // Código del Work Order (texto manual, sin BD)
          // Información Básica
          mainSymptom: generalData.mainSymptom || '',
          urgency: generalData.urgency || 'Media',
          estimatedDiagnosticTime: generalData.estimatedDiagnosticTime || '',
          // Síntomas Reportados (array dinámico)
          reportedSymptoms: generalData.reportedSymptoms || [],
          // Herramientas Requeridas (objeto con categorías)
          requiredTools: generalData.requiredTools || {
            diagnostic: [],
            tools: [],
            safety: [],
          },
        },
        steps: processedProblems, // PASOS (antes "problems")
        registeredBy: {
          userId: user.id,
          name: user.name || 'Usuario Desconocido',
          email: user.email,
        },
        problemType: problemType, // 'mechanical' o 'electrical'
        createdAt: serverTimestamp(),
        status: 'active',
        deleted: false, // Soft delete flag
      };

      // Guarda el documento en la colección correspondiente
      console.log(`💾 Guardando documento en colección: ${collectionName}...`);
      const docRef = await addDoc(collection(db, collectionName), docData);
      console.log(`✅ Guía de diagnóstico guardada exitosamente con ID: ${docRef.id}`);

      return docRef.id;
    } catch (error) {
      console.error('❌ Error al guardar problema:', error.message);
      throw new Error(`Error al guardar el problema: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los problemas registrados con filtros de permisos
   * @param {Object} user - Usuario que solicita los problemas
   * @param {boolean} includeDeleted - Si se incluyen los eliminados (solo admin)
   * @returns {Promise<Array>} Array de problemas filtrados según permisos
   * @throws {Error} Si falla la consulta a Firestore
   */
  async getAllProblems(user, includeDeleted = false) {
    try {
      const isAdmin = user?.role === 'admin';
      const canViewAll = isAdmin || user?.permissions?.canViewAll;

      // Obtener problemas de ambas colecciones
      const mechanicalProblems = await this.getProblemsFromCollection('mechanical-problems');
      const electricalProblems = await this.getProblemsFromCollection('electrical-problems');

      // Combinar todos los problemas
      let allProblems = [...mechanicalProblems, ...electricalProblems];

      // Filtrar según permisos
      allProblems = allProblems.filter(problem => {
        // Excluir eliminados (a menos que sea admin y se solicite incluirlos)
        if (problem.deleted && !(isAdmin && includeDeleted)) {
          return false;
        }

        // Admin o usuario con permiso canViewAll ve todo
        if (canViewAll) {
          return true;
        }

        // Usuario normal solo ve sus propios registros
        return problem.registeredBy?.userId === user?.id;
      });

      // Ordenar por fecha descendente
      allProblems.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA;
      });

      return allProblems;
    } catch (error) {
      console.error('❌ Error obteniendo problemas:', error);
      throw error;
    }
  }

  /**
   * Obtiene problemas de una colección específica
   * @param {string} collectionName - Nombre de la colección
   * @returns {Promise<Array>} Array de problemas
   */
  async getProblemsFromCollection(collectionName) {
    try {
      const q = query(
        collection(db, collectionName),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const problems = [];

      querySnapshot.forEach((doc) => {
        problems.push({
          id: doc.id,
          collectionName: collectionName, // Para saber de qué colección viene
          ...doc.data(),
        });
      });

      return problems;
    } catch (error) {
      console.error(`❌ Error obteniendo problemas de ${collectionName}:`, error);
      return []; // Retornar array vacío si falla
    }
  }

  /**
   * Obtiene solo los problemas eliminados (para papelera - solo admin)
   * @returns {Promise<Array>} Array de problemas eliminados
   */
  async getDeletedProblems() {
    try {
      const mechanicalProblems = await this.getProblemsFromCollection('mechanical-problems');
      const electricalProblems = await this.getProblemsFromCollection('electrical-problems');

      const allProblems = [...mechanicalProblems, ...electricalProblems];

      // Filtrar solo los eliminados
      const deletedProblems = allProblems.filter(problem => problem.deleted === true);

      // Ordenar por fecha de creación descendente
      deletedProblems.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA;
      });

      return deletedProblems;
    } catch (error) {
      console.error('❌ Error obteniendo problemas eliminados:', error);
      throw error;
    }
  }

  /**
   * Obtiene un problema por ID buscando en ambas colecciones
   * @param {string} problemId - ID único del problema en Firestore
   * @param {string} collectionName - Nombre de la colección (opcional)
   * @returns {Promise<Object>} Objeto con los datos completos del problema y su ID
   * @throws {Error} Si el problema no existe o falla la consulta
   */
  async getProblemById(problemId, collectionName = null) {
    try {
      // Si se especifica la colección, buscar solo ahí
      if (collectionName) {
        const docRef = doc(db, collectionName, problemId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            collectionName: collectionName,
            ...docSnap.data(),
          };
        }
      } else {
        // Buscar en ambas colecciones
        const collections = ['mechanical-problems', 'electrical-problems'];

        for (const coll of collections) {
          const docRef = doc(db, coll, problemId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            return {
              id: docSnap.id,
              collectionName: coll,
              ...docSnap.data(),
            };
          }
        }
      }

      throw new Error('Problema no encontrado');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Marca un problema como eliminado (soft delete)
   * @param {string} problemId - ID del problema
   * @param {string} collectionName - Nombre de la colección
   * @returns {Promise<void>}
   */
  async softDeleteProblem(problemId, collectionName) {
    try {
      const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore');
      const docRef = doc(db, collectionName, problemId);

      await updateDoc(docRef, {
        deleted: true,
        deletedAt: serverTimestamp(),
      });

      console.log(`✅ Problema marcado como eliminado: ${problemId}`);
    } catch (error) {
      console.error('❌ Error en soft delete:', error);
      throw error;
    }
  }

  /**
   * Restaura un problema eliminado
   * @param {string} problemId - ID del problema
   * @param {string} collectionName - Nombre de la colección
   * @returns {Promise<void>}
   */
  async restoreProblem(problemId, collectionName) {
    try {
      const { updateDoc, doc, deleteField } = await import('firebase/firestore');
      const docRef = doc(db, collectionName, problemId);

      await updateDoc(docRef, {
        deleted: false,
        deletedAt: deleteField(), // Eliminar el campo deletedAt
      });

      console.log(`✅ Problema restaurado: ${problemId}`);
    } catch (error) {
      console.error('❌ Error restaurando problema:', error);
      throw error;
    }
  }

  /**
   * Elimina un problema permanentemente de Firestore (solo desde la base de datos)
   * ADVERTENCIA: Esta acción no se puede deshacer
   * @param {string} problemId - ID del problema
   * @param {string} collectionName - Nombre de la colección
   * @returns {Promise<void>}
   */
  async permanentDeleteProblem(problemId, collectionName) {
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const docRef = doc(db, collectionName, problemId);

      await deleteDoc(docRef);
      console.log(`✅ Problema eliminado permanentemente: ${problemId}`);
    } catch (error) {
      console.error('❌ Error eliminando permanentemente:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de registros por usuario
   * @returns {Promise<Array>} Array de usuarios con su conteo de problemas registrados
   */
  async getUserRegistrationStats() {
    try {
      const mechanicalProblems = await this.getProblemsFromCollection('mechanical-problems');
      const electricalProblems = await this.getProblemsFromCollection('electrical-problems');

      const allProblems = [...mechanicalProblems, ...electricalProblems];

      // Filtrar solo problemas activos (no eliminados)
      const activeProblems = allProblems.filter(problem => !problem.deleted);

      // Agrupar por usuario
      const userStats = {};

      activeProblems.forEach(problem => {
        const userId = problem.registeredBy?.userId;
        const userName = problem.registeredBy?.name || 'Usuario Desconocido';
        const userEmail = problem.registeredBy?.email || '';

        if (userId) {
          if (!userStats[userId]) {
            userStats[userId] = {
              userId,
              userName,
              userEmail,
              count: 0,
              problems: [],
            };
          }
          // Contar cada problema individual dentro del registro
          const problemCount = problem.problems?.length || 1;
          userStats[userId].count += problemCount;
          userStats[userId].problems.push(problem);
        }
      });

      // Convertir a array y ordenar por conteo descendente
      const statsArray = Object.values(userStats).sort((a, b) => b.count - a.count);

      return statsArray;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los problemas registrados por un usuario específico
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} Array de problemas del usuario
   */
  async getProblemsByUser(userId) {
    try {
      const mechanicalProblems = await this.getProblemsFromCollection('mechanical-problems');
      const electricalProblems = await this.getProblemsFromCollection('electrical-problems');

      const allProblems = [...mechanicalProblems, ...electricalProblems];

      // Filtrar problemas del usuario específico (no eliminados)
      const userProblems = allProblems.filter(
        problem => problem.registeredBy?.userId === userId && !problem.deleted
      );

      // Ordenar por fecha descendente
      userProblems.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA;
      });

      return userProblems;
    } catch (error) {
      console.error('❌ Error obteniendo problemas del usuario:', error);
      throw error;
    }
  }
}

export default new FirebaseFirestoreService();