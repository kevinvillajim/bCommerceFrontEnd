import React, {useContext} from "react";
import {Navigate, useLocation} from "react-router-dom";
import {AuthContext} from "../presentation/contexts/AuthContext";
import {routes} from "../constants/routes";

interface AuthRouteProps {
	children: React.ReactNode;
	redirectPath?: string;
}

/**
 * AuthRoute component
 * Específico para páginas de autenticación como login y registro.
 * Redirige a los usuarios ya autenticados a una ruta específica.
 */
const AuthRoute: React.FC<AuthRouteProps> = ({
	children,
	redirectPath = routes.HOME,
}) => {
	const {isAuthenticated} = useContext(AuthContext);
	const location = useLocation();

	// Obtiene el destino de redirección desde el estado de ubicación, si está disponible
	const from = location.state?.from?.pathname || redirectPath;

	if (isAuthenticated) {
		// Redirige a usuarios ya autenticados
		return <Navigate to={from} replace />;
	}

	return <>{children}</>;
};

export default AuthRoute;
