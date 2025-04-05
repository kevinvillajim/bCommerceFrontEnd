import React, {useEffect, useState} from "react";
import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "../presentation/contexts/AuthContext";
import {routes} from "../constants/routes";
import RoleService from "../infrastructure/services/RoleService";

interface AdminRouteProps {
	children: React.ReactNode;
	redirectPath?: string;
}

/**
 * AdminRoute component
 * Ensures that only authenticated admins can access certain routes
 * Uses the RoleService to check admin status with caching
 */
const AdminRoute: React.FC<AdminRouteProps> = ({
	children,
	redirectPath = routes.LOGIN,
}) => {
	const {isAuthenticated, roleInfo, refreshRoleInfo} = useAuth();
	const [isCheckingRole, setIsCheckingRole] = useState<boolean>(true);
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const location = useLocation();

	// Verificar si el usuario es admin
	useEffect(() => {
		const checkAdminStatus = async () => {
			setIsCheckingRole(true);

			// Si ya tenemos la información en el contexto, la usamos
			if (roleInfo.role) {
				setIsAdmin(roleInfo.isAdmin);
				setIsCheckingRole(false);
				return;
			}

			// Si no, hacemos la verificación y actualizamos el contexto
			try {
				// Verificar con el servicio (usando la caché si está disponible)
				const isAdminUser = await RoleService.isAdmin();
				setIsAdmin(isAdminUser);

				// Actualizar el contexto general
				await refreshRoleInfo();
			} catch (error) {
				console.error("Error al verificar rol de administrador:", error);
				setIsAdmin(false);
			} finally {
				setIsCheckingRole(false);
			}
		};

		if (isAuthenticated) {
			checkAdminStatus();
		} else {
			setIsCheckingRole(false);
			setIsAdmin(false);
		}
	}, [isAuthenticated, refreshRoleInfo, roleInfo.role, roleInfo.isAdmin]);

	// Mientras estamos verificando, mostrar un loader o similar
	if (isCheckingRole) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	// Si no es administrador, redirigir al login
	if (!isAuthenticated || !isAdmin) {
		return <Navigate to={redirectPath} state={{from: location}} replace />;
	}

	return <>{children}</>;
};

export default AdminRoute;