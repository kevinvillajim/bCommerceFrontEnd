import React from "react";

interface PublicRouteProps {
	children: React.ReactNode;
}

/**
 * PublicRoute component
 * Maneja rutas que son accesibles públicamente para todos los usuarios,
 * independientemente de su estado de autenticación.
 */
const PublicRoute: React.FC<PublicRouteProps> = ({children}) => {
	// Las rutas públicas siempre renderizan sus hijos sin restricciones
	return <>{children}</>;
};

export default PublicRoute;
