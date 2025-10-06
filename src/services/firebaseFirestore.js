import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import FirebaseStorageService from './firebaseStorage';

class FirebaseFirestoreService {
  /**
   * Guarda un problema completo en Firestore
   * @param {Object} generalData - Datos generales (topic, truckData, workOrder)
   * @param {Array} problems - Array de problemas
   * @param {Object} user - Usuario que registra
   * @returns {Promise<string>} ID del documento creado
   */
  async saveProblem(generalData, problems, user) {
    try {
      console.log('💾 Iniciando guardado en Firebase...');

      const problemId = `problem_${Date.now()}`;

      const processedProblems = await Promise.all(
        problems.map(async (problem, index) => {
          console.log(`📝 Procesando problema ${index + 1}...`);

          let problemFileUrls = [];
          if (problem.problemFiles && problem.problemFiles.length > 0) {
            console.log(`📤 Subiendo ${problem.problemFiles.length} archivos del problema...`);
            problemFileUrls = await FirebaseStorageService.uploadMultipleFiles(
              problem.problemFiles,
              `problems/${problemId}/problem_${index}/files`
            );
          }

          const processedActivities = await Promise.all(
            problem.activities.map(async (activity, actIndex) => {
              let activityFileUrls = [];
              if (activity.files && activity.files.length > 0) {
                console.log(`📤 Subiendo archivos de actividad ${actIndex + 1}...`);
                activityFileUrls = await FirebaseStorageService.uploadMultipleFiles(
                  activity.files,
                  `problems/${problemId}/problem_${index}/activities/activity_${actIndex}`
                );
              }
              return {
                title: activity.title,
                files: activityFileUrls,
              };
            })
          );

          const processedSolutions = await Promise.all(
            problem.solutions.map(async (solution, solIndex) => {
              let solutionFileUrls = [];
              if (solution.files && solution.files.length > 0) {
                console.log(`📤 Subiendo archivos de solución ${solIndex + 1}...`);
                solutionFileUrls = await FirebaseStorageService.uploadMultipleFiles(
                  solution.files,
                  `problems/${problemId}/problem_${index}/solutions/solution_${solIndex}`
                );
              }
              return {
                title: solution.title,
                files: solutionFileUrls,
              };
            })
          );

          return {
            problemTitle: problem.problemTitle,
            problemDescription: problem.problemDescription,
            problemFiles: problemFileUrls,
            activities: processedActivities,
            solutions: processedSolutions,
            otherData: problem.otherData,
          };
        })
      );

      const docData = {
        generalData: {
          topic: generalData.topic,
          truckData: generalData.truckData,
          workOrder: generalData.workOrder,
        },
        problems: processedProblems,
        registeredBy: {
          userId: user.id,
          name: `${user.name} ${user.lastname}`,
          email: user.businessEmail,
          position: user.position,
        },
        createdAt: serverTimestamp(),
        status: 'active',
      };

      console.log('💾 Guardando en Firestore...');
      const docRef = await addDoc(collection(db, 'problems'), docData);
      
      console.log('✅ Problema guardado exitosamente con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error guardando en Firebase:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los problemas registrados
   * @returns {Promise<Array>} Array de problemas con sus IDs
   */
  async getAllProblems() {
    try {
      console.log('📥 Obteniendo todos los problemas...');
      
      const q = query(
        collection(db, 'problems'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const problems = [];
      querySnapshot.forEach((doc) => {
        problems.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ ${problems.length} problemas obtenidos`);
      return problems;
    } catch (error) {
      console.error('❌ Error obteniendo problemas:', error);
      throw error;
    }
  }

  /**
   * Obtiene un problema específico por ID
   * @param {string} problemId - ID del problema
   * @returns {Promise<Object>} Datos del problema
   */
  async getProblemById(problemId) {
    try {
      console.log(`📥 Obteniendo problema ${problemId}...`);
      
      const docRef = doc(db, 'problems', problemId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('✅ Problema encontrado');
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        throw new Error('Problema no encontrado');
      }
    } catch (error) {
      console.error('❌ Error obteniendo problema:', error);
      throw error;
    }
  }
}

export default new FirebaseFirestoreService();