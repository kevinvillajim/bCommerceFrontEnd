import React from "react";
import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "../presentation/contexts/AuthContext";
import {routes} from "../constants/routes";

interface AdminRouteProps {
	children: React.ReactNode;
	redirectPath?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({
	children,
	redirectPath = routes.LOGIN,
}) => {
	const {isAuthenticated, roleInfo, isLoadingRole, isInitialized} = useAuth();
	const location = useLocation();

	// Esperar a que termine la inicialización
	if (!isInitialized || isLoadingRole) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	// Si no está autenticado, redirigir al login
	if (!isAuthenticated) {
		return <Navigate to={redirectPath} state={{from: location}} replace />;
	}

	// Si está autenticado pero no es admin, redirigir al home
	if (!roleInfo.isAdmin) {
		console.log("Usuario autenticado pero no es admin, redirigiendo al home");
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

export default AdminRoute;