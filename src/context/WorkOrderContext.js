// context/WorkOrderContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import ApiService from '../services/api';
import { useAuth } from './AuthContext';

const WorkOrderContext = createContext();

export const WorkOrderProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar work orders solo cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadWorkOrders();
    } else {
      // Limpiar work orders cuando el usuario cierre sesión
      setWorkOrders([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getWorkOrders();
      const workOrdersList = Array.isArray(data) ? data : data.workOrders || [];
      setWorkOrders(workOrdersList);
      console.log(`✅ ${workOrdersList.length} work orders cargados globalmente`);
    } catch (err) {
      console.error('❌ Error cargando work orders:', err);
      setError(err.message || 'Error al cargar work orders');
      setWorkOrders([]);
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