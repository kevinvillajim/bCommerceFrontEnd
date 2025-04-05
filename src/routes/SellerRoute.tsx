import React, {useEffect, useState} from "react";
import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "../presentation/contexts/AuthContext";
import {routes} from "../constants/routes";
import RoleService from "../infrastructure/services/RoleService";

interface SellerRouteProps {
	children: React.ReactNode;
	redirectPath?: string;
}

/**
 * SellerRoute component
 * Ensures that only authenticated sellers can access certain routes
 * Uses the RoleService to check seller status with caching
 */
const SellerRoute: React.FC<SellerRouteProps> = ({
	children,
	redirectPath = routes.LOGIN,
}) => {
	const {isAuthenticated, roleInfo, refreshRoleInfo} = useAuth();
	const [isCheckingRole, setIsCheckingRole] = useState<boolean>(true);
	const [isSeller, setIsSeller] = useState<boolean>(false);
	const location = useLocation();

	// Verificar si el usuario es vendedor
	useEffect(() => {
		const checkSellerStatus = async () => {
			setIsCheckingRole(true);

			// Si ya tenemos la información en el contexto, la usamos
			if (roleInfo.role) {
				setIsSeller(roleInfo.isSeller);
				setIsCheckingRole(false);
				return;
			}

			// Si no, hacemos la verificación y actualizamos el contexto
			try {
				// Verificar con el servicio (usando la caché si está disponible)
				const isSellerUser = await RoleService.isSeller();
				setIsSeller(isSellerUser);

				// Actualizar el contexto general
				await refreshRoleInfo();
			} catch (error) {
				console.error("Error al verificar rol de vendedor:", error);
				setIsSeller(false);
			} finally {
				setIsCheckingRole(false);
			}
		};

		if (isAuthenticated) {
			checkSellerStatus();
		} else {
			setIsCheckingRole(false);
			setIsSeller(false);
		}
	}, [isAuthenticated, refreshRoleInfo, roleInfo.role, roleInfo.isSeller]);

	// Mientras estamos verificando, mostrar un loader o similar
	if (isCheckingRole) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	// Si no es vendedor, redirigir al login
	if (!isAuthenticated || !isSeller) {
		return <Navigate to={redirectPath} state={{from: location}} replace />;
	}

	return <>{children}</>;
};

export default SellerRoute;
