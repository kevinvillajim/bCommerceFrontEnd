// src/infrastructure/services/OptimizedRoleService.ts

import axiosInstance from "../api/axiosConfig";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import {SecureRoleCache} from "./SecureRoleCache";

// Endpoint fallback en caso de que no esté definido
const CHECK_ROLE_ENDPOINT =
	API_ENDPOINTS?.AUTH?.CHECK_ROLE || "/api/user/check-role";

export interface RoleCheckResponse {
	success: boolean;
	status: number;
	data: {
		user_id: number;
		role: string;
		is_seller: boolean;
		is_admin: boolean;
		seller_info?: any;
		admin_info?: any;
	};
}

/**
 * Servicio optimizado y seguro para roles
 */
export class OptimizedRoleService {
	private static memoryCache: Map<string, {data: any; timestamp: number}> =
		new Map();
	private static readonly MEMORY_CACHE_TIME = 30000; // 30 segundos

	/**
	 * Obtiene datos desde memoria (más rápido)
	 */
	private static getFromMemory(key: string): any | null {
		const cached = this.memoryCache.get(key);
		if (!cached) return null;

		const now = Date.now();
		if (now - cached.timestamp > this.MEMORY_CACHE_TIME) {
			this.memoryCache.delete(key);
			return null;
		}

		return cached.data;
	}

	/**
	 * Guarda en memoria
	 */
	private static setInMemory(key: string, data: any): void {
		this.memoryCache.set(key, {
			data,
			timestamp: Date.now(),
		});

		// Limitar tamaño del cache en memoria
		if (this.memoryCache.size > 10) {
			const firstKey = this.memoryCache.keys().next().value;
			if (firstKey !== undefined) {
				this.memoryCache.delete(firstKey);
			}
		}
	}

	/**
	 * Verifica rol con cache seguro híbrido
	 */
	static async checkUserRole(
		forceRefresh = false,
		criticalOperation = false
	): Promise<RoleCheckResponse | null> {
		const cacheKey = "user_role_check";

		try {
			// 1. Cache en memoria (más rápido, menos seguro) - solo para operaciones no críticas
			if (!forceRefresh && !criticalOperation) {
				const memoryData = this.getFromMemory(cacheKey);
				if (memoryData) {
					console.log("🧠 Usando rol desde memoria");
					return memoryData;
				}
			}

			// 2. Cache seguro cifrado - para operaciones normales
			if (!forceRefresh) {
				// Para operaciones críticas, verificar si necesita revalidación
				if (criticalOperation && SecureRoleCache.needsCriticalRevalidation()) {
					console.log("🔒 Operación crítica requiere revalidación");
				} else {
					const secureData = SecureRoleCache.getSecureRoleData();
					if (secureData) {
						console.log("🔐 Usando rol desde cache seguro");

						const roleResponse: RoleCheckResponse = {
							success: true,
							status: 200,
							data: {
								user_id: 0,
								role: secureData.role,
								is_admin: secureData.isAdmin,
								is_seller: secureData.isSeller,
								seller_info: secureData.sellerInfo,
								admin_info: secureData.adminInfo,
							},
						};

						// Guardar en memoria para consultas rápidas
						this.setInMemory(cacheKey, roleResponse);
						return roleResponse;
					}
				}
			}

			// 3. Consulta fresh desde API
			console.log("🌐 Consultando rol desde API");
			const response = await axiosInstance.get(CHECK_ROLE_ENDPOINT);

			if (response?.data?.success) {
				const roleData = response.data;

				// Guardar en cache seguro
				SecureRoleCache.setSecureRoleData({
					role: roleData.data.role,
					isAdmin: roleData.data.is_admin,
					isSeller: roleData.data.is_seller,
					sellerInfo: roleData.data.seller_info,
					adminInfo: roleData.data.admin_info,
				});

				// Guardar en memoria
				this.setInMemory(cacheKey, roleData);

				return roleData;
			}

			return null;
		} catch (error) {
			console.error("Error verificando rol:", error);
			return null;
		}
	}

	/**
	 * Verificaciones rápidas (usan memoria + cache seguro)
	 */
	static async isAdmin(): Promise<boolean> {
		const roleData = await this.checkUserRole(false, false);
		return roleData?.data?.is_admin || false;
	}

	static async isSeller(): Promise<boolean> {
		const roleData = await this.checkUserRole(false, false);
		return roleData?.data?.is_seller || false;
	}

	/**
	 * Verificaciones críticas (requieren revalidación frecuente)
	 */
	static async isAdminCritical(): Promise<boolean> {
		const roleData = await this.checkUserRole(false, true);
		return roleData?.data?.is_admin || false;
	}

	static async isSellerCritical(): Promise<boolean> {
		const roleData = await this.checkUserRole(false, true);
		return roleData?.data?.is_seller || false;
	}

	/**
	 * Limpia toda la cache
	 */
	static clearAllCache(): void {
		this.memoryCache.clear();
		SecureRoleCache.clearSecureCache();
		console.log("🗑️ Cache de roles limpiada completamente");
	}
}
