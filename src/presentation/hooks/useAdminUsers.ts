// src/presentation/hooks/useAdminUsers.ts
import {useState, useCallback} from "react";
import AdminUserService from "../../core/services/AdminUserService";
import {extractErrorMessage} from "../../utils/errorHandler";

// Tipo de usuario para el componente AdminUsersPage
export interface AdminUserData {
	id: number;
	name: string;
	email: string;
	role: "customer" | "seller" | "admin";
	status: "active" | "blocked";
	lastLogin: string;
	registeredDate: string;
	ordersCount: number;
}

// Tipo para opciones de filtrado
interface FilterOptions {
	role?: string;
	status?: string;
	searchTerm?: string;
}

/**
 * Hook personalizado para gestión de usuarios desde administración
 */
export const useAdminUsers = () => {
	const [users, setUsers] = useState<AdminUserData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 5,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Instancia del servicio
	const adminUserService = new AdminUserService();

	/**
	 * Mapea el usuario de la API al formato esperado por el componente
	 */
	const mapApiUserToAdminUserData = (apiUser: any): AdminUserData => {
		// Determinar el rol
		let role: "customer" | "seller" | "admin" = "customer";
		if (apiUser.is_admin) role = "admin";
		else if (apiUser.is_seller) role = "seller";

		// Mapear el estado (is_blocked -> status)
		const status: "active" | "blocked" = apiUser.is_blocked
			? "blocked"
			: "active";

		return {
			id: apiUser.id,
			name: apiUser.name,
			email: apiUser.email,
			role,
			status,
			lastLogin: apiUser.last_login_at || "N/A",
			registeredDate: apiUser.created_at,
			ordersCount: apiUser.orders_count || 0,
		};
	};

	/**
	 * Carga la lista de usuarios desde la API
	 */
	const fetchUsers = useCallback(async (page = 1, perPage = 10) => {
		setLoading(true);
		setError(null);

		try {
			const response = await adminUserService.getUsers(page, perPage);

			// Mapear usuarios al formato esperado por el componente
			const mappedUsers = response.data.map(mapApiUserToAdminUserData);

			setUsers(mappedUsers);
			setPagination({
				currentPage: response.meta.current_page,
				totalPages: response.meta.last_page,
				totalItems: response.meta.total,
				itemsPerPage: response.meta.per_page,
			});

			return mappedUsers;
		} catch (err) {
			const errorMsg = extractErrorMessage(
				err,
				"Error al obtener la lista de usuarios"
			);
			console.error("Error fetching users:", errorMsg);
			setError(errorMsg);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Bloquea o desbloquea un usuario
	 */
	const toggleUserStatus = useCallback(
		async (userId: number, isCurrentlyBlocked: boolean) => {
			setLoading(true);
			setError(null);

			try {
				let success;

				if (isCurrentlyBlocked) {
					// Si está bloqueado, desbloqueamos
					success = await adminUserService.unblockUser(userId);
				} else {
					// Si no está bloqueado, bloqueamos
					success = await adminUserService.blockUser(userId);
				}

				if (success) {
					// Actualizar el estado del usuario en la lista local
					setUsers((prevUsers) =>
						prevUsers.map((user) =>
							user.id === userId
								? {
										...user,
										status: isCurrentlyBlocked ? "active" : "blocked",
									}
								: user
						)
					);
					return true;
				} else {
					setError(
						`No se pudo ${isCurrentlyBlocked ? "desbloquear" : "bloquear"} al usuario`
					);
					return false;
				}
			} catch (err) {
				const errorMsg = extractErrorMessage(
					err,
					`Error al ${isCurrentlyBlocked ? "desbloquear" : "bloquear"} al usuario`
				);
				console.error("Error toggling user status:", errorMsg);
				setError(errorMsg);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	/**
	 * Envía un correo de restablecimiento de contraseña
	 */
	const sendPasswordReset = useCallback(async (userId: number) => {
		setLoading(true);
		setError(null);

		try {
			const success = await adminUserService.sendPasswordResetEmail(userId);

			if (!success) {
				setError(
					"No se pudo enviar el correo de restablecimiento de contraseña"
				);
			}

			return success;
		} catch (err) {
			const errorMsg = extractErrorMessage(
				err,
				"Error al enviar correo de restablecimiento"
			);
			console.error("Error sending password reset:", errorMsg);
			setError(errorMsg);
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Actualiza el rol de un usuario a administrador
	 */
	const makeUserAdmin = useCallback(async (userId: number) => {
		setLoading(true);
		setError(null);

		try {
			const success = await adminUserService.makeAdmin(userId);

			if (success) {
				// Actualizar el rol del usuario en la lista local
				setUsers((prevUsers) =>
					prevUsers.map((user) =>
						user.id === userId ? {...user, role: "admin"} : user
					)
				);
				return true;
			} else {
				setError("No se pudo convertir al usuario en administrador");
				return false;
			}
		} catch (err) {
			const errorMsg = extractErrorMessage(
				err,
				"Error al convertir usuario en administrador"
			);
			console.error("Error making user admin:", errorMsg);
			setError(errorMsg);
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Convierte un usuario en vendedor
	 */
	const makeUserSeller = useCallback(
		async (
			userId: number,
			storeData: {store_name: string; description?: string}
		) => {
			setLoading(true);
			setError(null);

			try {
				const success = await adminUserService.makeSeller(userId, storeData);

				if (success) {
					// Actualizar el rol del usuario en la lista local
					setUsers((prevUsers) =>
						prevUsers.map((user) =>
							user.id === userId ? {...user, role: "seller"} : user
						)
					);
					return true;
				} else {
					setError("No se pudo convertir al usuario en vendedor");
					return false;
				}
			} catch (err) {
				const errorMsg = extractErrorMessage(
					err,
					"Error al convertir usuario en vendedor"
				);
				console.error("Error making user seller:", errorMsg);
				setError(errorMsg);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	// Filtrar usuarios según criterios
	const filterUsers = useCallback(
		(options: FilterOptions) => {
			const {role, status, searchTerm} = options;

			return users.filter((user) => {
				// Filtro por rol
				const matchesRole = !role || role === "all" || user.role === role;

				// Filtro por estado
				const matchesStatus =
					!status || status === "all" || user.status === status;

				// Filtro por término de búsqueda
				const matchesSearch =
					!searchTerm ||
					user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					user.email.toLowerCase().includes(searchTerm.toLowerCase());

				return matchesRole && matchesStatus && matchesSearch;
			});
		},
		[users]
	);

	return {
		users,
		loading,
		error,
		pagination,
		fetchUsers,
		toggleUserStatus,
		sendPasswordReset,
		makeUserAdmin,
		makeUserSeller,
		filterUsers,
	};
};

export default useAdminUsers;
