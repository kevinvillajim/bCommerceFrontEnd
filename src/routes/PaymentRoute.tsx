import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../presentation/contexts/AuthContext";
import { routes } from "../constants/routes";

interface PaymentRouteProps {
	children: React.ReactNode;
	redirectPath?: string;
}

/**
 * Guard para rutas de pagos externos
 * Permite acceso a:
 * - Usuarios con rol payment activo (independiente)
 * - Cualquier admin (como fallback de seguridad)
 */
const PaymentRoute: React.FC<PaymentRouteProps> = ({
	children,
	redirectPath = routes.LOGIN,
}) => {
	const { isAuthenticated, roleInfo, isLoadingRole, isInitialized, user } = useAuth();
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
		return <Navigate to={redirectPath} state={{ from: location }} replace />;
	}

	// Verificar si tiene permisos de payment
	const hasPaymentAccess = roleInfo.isPaymentUser || roleInfo.isAdmin; // Payment users o admins pueden acceder

	// Si está autenticado pero no tiene acceso a pagos, redirigir al home
	if (!hasPaymentAccess) {
		console.log("Usuario autenticado pero sin permisos de payment, redirigiendo al home");
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

export default PaymentRoute;