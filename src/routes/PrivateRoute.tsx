import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../presentation/contexts/AuthContext';
import { routes } from '../constants/routes';

interface PrivateRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

/**
 * PrivateRoute component
 * Ensures that only authenticated users can access certain routes
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  redirectPath = routes.LOGIN 
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login and store the attempted URL to redirect back after login
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;