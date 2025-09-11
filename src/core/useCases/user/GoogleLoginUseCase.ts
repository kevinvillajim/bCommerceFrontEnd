// src/core/useCases/user/GoogleLoginUseCase.ts

import {AuthService} from "../../services/AuthService";
import {LocalStorageService} from "../../../infrastructure/services/LocalStorageService";
import type {AuthResponse} from "../../domain/entities/User";
import appConfig from "../../../config/appConfig";

/**
 * Caso de uso para el inicio de sesión con Google
 */
export class GoogleLoginUseCase {
	private authService: AuthService;
	private storageService: LocalStorageService;

	constructor() {
		this.authService = new AuthService();
		this.storageService = new LocalStorageService();
	}

	/**
	 * Ejecuta el proceso de inicio de sesión con Google
	 * @returns Datos de autenticación o null si falla
	 */
	async execute(): Promise<AuthResponse | null> {
		try {
			console.log("🔐 Ejecutando GoogleLoginUseCase...");

			// Llamada al servicio de autenticación con Google
			const authResponse = await this.authService.loginWithGoogle();

			// Verificar que la respuesta sea válida
			if (!authResponse || !authResponse.access_token) {
				throw new Error("Respuesta de autenticación con Google inválida");
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

			console.log("✅ GoogleLoginUseCase completado exitosamente");
			return authResponse;
		} catch (error) {
			console.error("❌ Error en GoogleLoginUseCase:", error);

			// Propagar el error para que pueda ser manejado en la capa superior
			if (error instanceof Error) {
				throw error;
			} else {
				throw new Error("Error desconocido en el inicio de sesión con Google");
			}
		}
	}
}

export default GoogleLoginUseCase;
