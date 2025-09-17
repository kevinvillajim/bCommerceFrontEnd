// src/core/services/AdminUserService.ts
import axiosInstance from "../../infrastructure/api/axiosConfig";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {UserListResponse} from "../domain/entities/User";
import type {User} from "../domain/entities/User";

/**
 * Servicio para la gestión de usuarios desde el panel de administración
 */
export class AdminUserService {
	/**
	 * Obtiene la lista de usuarios con paginación
	 * @param page Número de página
	 * @param perPage Cantidad de elementos por página
	 * @returns Lista paginada de usuarios
	 */
	async getUsers(page = 1, perPage = 15): Promise<UserListResponse> {
		const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS, {
			params: {page, per_page: perPage},
		});
		return response.data;
	}

	/**
	 * Bloquea a un usuario
	 * @param userId ID del usuario a bloquear
	 * @returns true si se bloqueó correctamente
	 */
	async blockUser(userId: number): Promise<boolean> {
		const response = await axiosInstance.put(
			API_ENDPOINTS.ADMIN.BLOCK_USER(userId)
		);
		return response.data.success;
	}

	/**
	 * Desbloquea a un usuario
	 * @param userId ID del usuario a desbloquear
	 * @returns true si se desbloqueó correctamente
	 */
	async unblockUser(userId: number): Promise<boolean> {
		const response = await axiosInstance.put(
			API_ENDPOINTS.ADMIN.UNBLOCK_USER(userId)
		);
		return response.data.success;
	}

	/**
	 * Envía un correo para restablecer contraseña
	 * @param userId ID del usuario
	 * @returns true si se envió correctamente
	 */
	async sendPasswordResetEmail(userId: number): Promise<boolean> {
		const response = await axiosInstance.post(
			API_ENDPOINTS.ADMIN.RESET_PASSWORD(userId)
		);
		return response.data.success;
	}

	/**
	 * Obtiene detalles de un usuario específico
	 * @param userId ID del usuario
	 * @returns Datos del usuario
	 */
	async getUserDetails(userId: number): Promise<User> {
		const response = await axiosInstance.get(
			API_ENDPOINTS.ADMIN.USER_DETAIL(userId)
		);
		return response.data;
	}

	/**
	 * Actualiza rol de usuario a administrador
	 * @param userId ID del usuario a promover
	 * @returns true si se actualizó correctamente
	 */
	async makeAdmin(userId: number): Promise<boolean> {
		const response = await axiosInstance.put(
			API_ENDPOINTS.ADMIN.MAKE_ADMIN(userId)
		);
		return response.data.success;
	}

	/**
	 * Actualiza rol de usuario a usuario de pagos
	 * @param userId ID del usuario a promover
	 * @returns true si se actualizó correctamente
	 */
	async makePaymentUser(userId: number): Promise<boolean> {
		const response = await axiosInstance.put(
			API_ENDPOINTS.ADMIN.MAKE_PAYMENT_USER(userId)
		);
		return response.data.success;
	}

	/**
	 * Convierte un usuario en vendedor
	 * @param userId ID del usuario a convertir
	 * @param storeData Datos de la tienda
	 * @returns true si se creó correctamente
	 */
	async makeSeller(
		userId: number,
		storeData: {store_name: string; description?: string}
	): Promise<boolean> {
		const response = await axiosInstance.post(
			API_ENDPOINTS.ADMIN.MAKE_SELLER(userId),
			storeData
		);
		return response.data.success;
	}

	/**
	 * Elimina un usuario del sistema
	 * @param userId ID del usuario a eliminar
	 * @returns true si se eliminó correctamente
	 */
	async deleteUser(userId: number): Promise<boolean> {
		const response = await axiosInstance.delete(
			API_ENDPOINTS.ADMIN.DELETE_USER(userId)
		);
		return response.data.success;
	}
}

export default AdminUserService;
