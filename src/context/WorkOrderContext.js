// context/WorkOrderContext.js
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { workOrderDb } from '../config/firebase';
import { useAuth } from './AuthContext';

const WorkOrderContext = createContext();

export const WorkOrderProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar work orders cuando el usuario esté completamente autenticado
  useEffect(() => {
    // Validar que el usuario esté completamente autenticado (con id)
    if (isAuthenticated && user && user.id) {
      // Cargar work orders sin delay para login más rápido
      loadWorkOrders().catch(err => {
        console.error('Error cargando work orders:', err.message);
        setWorkOrders([]);
        setLoading(false);
        setError(err.message);
      });
    } else {
      // Limpiar datos si no está autenticado
      setWorkOrders([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, user]);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar que el usuario esté autenticado antes de cargar
      if (!isAuthenticated || !user || !user.id) {
        console.warn('⚠️ Intento de cargar work orders sin usuario autenticado');
        setWorkOrders([]);
        setLoading(false);
        return;
      }

      console.log('🔵 Cargando work orders desde Firestore (workOrderDb)...');

      // Obtener work orders desde Firestore (inventario-ds)
      const workOrdersRef = collection(workOrderDb, 'work_order_db');

      // Cargar TODOS los work orders sin filtros para asegurar que obtenemos los últimos por código
      // Nota: Solo se cargan los datos necesarios y luego se ordenan en memoria
      const querySnapshot = await getDocs(workOrdersRef);
      const data = [];

      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          id: doc.id,
          code: doc.id, // El ID del documento es el código (ej: WO-TA-1234)
          ...docData,
        });
      });

      console.log(`📥 ${data.length} work orders descargados de Firestore (todos)`);

      // Ordenar por código en JavaScript (del más reciente al más antiguo)
      data.sort((a, b) => {
        // Extraer el número del código (ej: WO-TA-1234 -> 1234)
        const codeA = a.code || a.id || '';
        const codeB = b.code || b.id || '';

        const numA = parseInt(codeA.split('-').pop()) || 0;
        const numB = parseInt(codeB.split('-').pop()) || 0;

        return numB - numA; // Orden descendente (más reciente primero)
      });

      // Limitar a los últimos 30 por código más alto
      const limitedData = data.slice(0, 30);

      setWorkOrders(limitedData);
      console.log(`✅ ${limitedData.length} work orders procesados (últimos 30 por código más alto)`);

      if (limitedData.length > 0) {
        const firstCode = limitedData[0].code;
        const lastCode = limitedData[limitedData.length - 1].code;
        const firstNum = parseInt(firstCode.split('-').pop()) || 0;
        const lastNum = parseInt(lastCode.split('-').pop()) || 0;

        console.log(`📊 Rango de códigos: ${lastCode} a ${firstCode} (${lastNum} - ${firstNum})`);
        console.log(`📊 Código más alto disponible: ${firstCode}`);
      }
    } catch (err) {
      console.error('❌ Error cargando work orders:', err);

      // Manejo de errores específicos
      let errorMessage = 'Error al cargar work orders';
      if (err.code === 'permission-denied') {
        errorMessage = 'No tienes permisos para cargar los work orders';
      } else if (err.code === 'unavailable') {
        errorMessage = 'Firestore no está disponible. Verifica tu conexión';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setWorkOrders([]);

      // NO lanzar el error para evitar crashes
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar work orders localmente
  const searchWorkOrders = (searchText, limit = 5) => {
    const trimmedText = searchText.trim();
    
    if (!trimmedText) {
      return [];
    }

    const isNumericSearch = /^\d+$/.test(trimmedText);
    
    let filtered = workOrders.filter(wo => {
      const code = (wo.code || '').toLowerCase();
      const searchLower = trimmedText.toLowerCase();
      
      if (isNumericSearch) {
        // Búsqueda numérica: buscar en cualquier parte
        return code.includes(trimmedText);
      } else {
        // Búsqueda textual: desde el inicio
        return code.startsWith(searchLower);
      }
    });

    return filtered.slice(0, limit);
  };

  // Función para refrescar work orders manualmente
  const refreshWorkOrders = async () => {
    await loadWorkOrders();
  };

  const value = {
    workOrders,
    loading,
    error,
    searchWorkOrders,
    refreshWorkOrders,
  };

  return (
    <WorkOrderContext.Provider value={value}>
      {children}
    </WorkOrderContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useWorkOrders = () => {
  const context = useContext(WorkOrderContext);
  if (!context) {
    throw new Error('useWorkOrders debe usarse dentro de WorkOrderProvider');
  }
  return context;
};

export default WorkOrderContext;