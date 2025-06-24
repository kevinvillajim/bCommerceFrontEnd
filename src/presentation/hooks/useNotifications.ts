// src/presentation/hooks/useNotifications.ts
import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }
  
  return context;
};

export default useNotifications;