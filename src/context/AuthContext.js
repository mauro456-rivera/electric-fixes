import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      const storedToken = await AsyncStorage.getItem('@token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (userData, authToken) => {
    try {
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      await AsyncStorage.setItem('@token', authToken);
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('@token');
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Error removing auth data:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};