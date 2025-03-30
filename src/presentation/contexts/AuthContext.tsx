import React, { createContext, useState, useEffect } from 'react';
import type {ReactNode} from 'react';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';
import type { User } from '../../core/domain/entities/User';
import appConfig from '../../config/appConfig';

// Crear instancia del servicio de almacenamiento
const storageService = new LocalStorageService();

// Definir interfaz para el contexto
interface AuthContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

// Crear el contexto con valores por defecto
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {}
});

// Props para el proveedor
interface AuthProviderProps {
  children: ReactNode;
}

// Proveedor del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Verificar si hay un token guardado al cargar
  useEffect(() => {
    const token = storageService.getItem(appConfig.storage.authTokenKey);
    if (token) {
      setIsAuthenticated(true);
      
      // También intentar obtener datos del usuario si están almacenados
      const userData = storageService.getItem(appConfig.storage.userKey);
      if (userData) {
        setUser(userData);
      }
    }
  }, []);

  // Guardar datos del usuario en localStorage cuando cambian
  useEffect(() => {
    if (user) {
      storageService.setItem(appConfig.storage.userKey, user);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};