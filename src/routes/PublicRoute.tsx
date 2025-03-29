import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../presentation/contexts/AuthContext';
import { routes } from '../constants/routes';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
  redirectPath?: string;
}

/**
 * PublicRoute component
 * Maneja rutas que son accesibles públicamente
 * Puede opcionalmente redirigir a usuarios autenticados a otra ruta
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectIfAuthenticated = true,
  redirectPath = routes.PROFILE
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  
  // Obtiene el destino de redirección desde el estado de ubicación, si está disponible
  const from = location.state?.from?.pathname || redirectPath;

  if (redirectIfAuthenticated && isAuthenticated) {
    // Redirige a usuarios autenticados al destino o página de perfil
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;