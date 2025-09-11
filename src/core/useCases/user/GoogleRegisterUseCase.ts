// src/core/useCases/user/GoogleRegisterUseCase.ts

import {AuthService} from "../../services/AuthService";
import {LocalStorageService} from "../../../infrastructure/services/LocalStorageService";
import type {AuthResponse} from "../../domain/entities/User";
import appConfig from "../../../config/appConfig";

/**
 * Caso de uso para el registro con Google
 */
export class GoogleRegisterUseCase {
	private authService: AuthService;
	private storageService: LocalStorageService;

	constructor() {
		this.authService = new AuthService();
		this.storageService = new LocalStorageService();
	}

	/**
	 * Ejecuta el proceso de registro con Google
	 * @returns Datos de autenticación o null si falla
	 */
	async execute(): Promise<AuthResponse | null> {
		try {
			console.log("🔐 Ejecutando GoogleRegisterUseCase...");

			// Llamada al servicio de autenticación con Google
			const authResponse = await this.authService.registerWithGoogle();

			// Verificar que la respuesta sea válida
			if (!authResponse || !authResponse.access_token) {
				throw new Error("Respuesta de registro con Google inválida");
			}

			// Guardar el token en el almacenamiento local
			this.storageService.setItem(
				appConfig.storage.authTokenKey,
				authResponse.access_token
			);

			// Si existe información del usuario, guardarla también
			if (authResponse.user) {
				this.storageService.setItem(
					appConfig.storage.userKey,
					authResponse.user
				);
			}

			console.log("✅ GoogleRegisterUseCase completado exitosamente");
			return authResponse;
		} catch (error) {
			console.error("❌ Error en GoogleRegisterUseCase:", error);

			// Propagar el error para que pueda ser manejado en la capa superior
			if (error instanceof Error) {
				throw error;
			} else {
				throw new Error("Error desconocido en el registro con Google");
			}
		}
	}
}

export default GoogleRegisterUseCase;
