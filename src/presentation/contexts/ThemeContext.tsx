import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import appConfig from '../../config/appConfig';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';

type ThemeMode = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const storageService = new LocalStorageService();
  
  // Inicializar tema desde localStorage o preferencia del sistema
  const initializeTheme = (): ThemeMode => {
    // Intentar obtener del localStorage
    const savedTheme = storageService.getItem(appConfig.storage.themeKey) as ThemeMode | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    // Si no hay tema guardado, verificar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };
  
  const [theme, setThemeState] = useState<ThemeMode>(initializeTheme);
  
  // Aplicar el tema al DOM
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Eliminar clase anterior
    root.classList.remove('light', 'dark');
    
    // Añadir la clase del tema actual
    root.classList.add(theme);
    
    // Guardar el tema en localStorage
    storageService.setItem(appConfig.storage.themeKey, theme);
  }, [theme, storageService]);
  
  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Solo cambiar automáticamente si el usuario no ha establecido una preferencia
      if (!storageService.hasKey(appConfig.storage.themeKey)) {
        setThemeState(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    // Añadir event listener para navegadores modernos
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [storageService]);
  
  const toggleTheme = () => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;