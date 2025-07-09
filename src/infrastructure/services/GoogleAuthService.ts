// src/infrastructure/services/GoogleAuthService.ts - COMPATIBLE CON FedCM

interface GoogleAuthResponse {
	success: boolean;
	user?: any;
	error?: string;
}

export class GoogleAuthService {
	private static instance: GoogleAuthService;
	private isInitialized = false;
	private clientId =
		"581090375629-kds9jjgs2pk60iqe05fmjhpf6pps2nsv.apps.googleusercontent.com";
	private baseApiUrl =
		import.meta.env.VITE_API_URL || "http://localhost:8000/api";

	private constructor() {}

	public static getInstance(): GoogleAuthService {
		if (!GoogleAuthService.instance) {
			GoogleAuthService.instance = new GoogleAuthService();
		}
		return GoogleAuthService.instance;
	}

	/**
	 * Método principal con configuración FedCM
	 */
	async authenticateWithGoogle(
		action: "login" | "register"
	): Promise<GoogleAuthResponse> {
		try {
			console.log(`🔐 Iniciando ${action} con Google (FedCM compatible)...`);

			// Primero intentar método de redirect (más confiable)
			if (this.shouldUseRedirect()) {
				return this.authenticateWithRedirect(action);
			}

			// Método alternativo con FedCM
			await this.initialize();
			return this.authenticateWithFedCM(action);
		} catch (error) {
			console.error("❌ Error en authenticateWithGoogle:", error);

			// Fallback a redirect si falla FedCM
			return this.authenticateWithRedirect(action);
		}
	}

	/**
	 * Método de redirect (más confiable)
	 */
	private async authenticateWithRedirect(
		action: "login" | "register"
	): Promise<GoogleAuthResponse> {
		try {
			console.log(`🔄 Usando método de redirect para ${action}...`);

			// Guardar estado en localStorage
			localStorage.setItem("google_oauth_action", action);
			localStorage.setItem("google_oauth_return_url", window.location.pathname);

			// Redirigir al backend
			const redirectUrl = `${this.baseApiUrl}/auth/google/redirect?action=${action}`;
			window.location.href = redirectUrl;

			// Esta promesa nunca se resuelve porque redirigimos
			return new Promise(() => {});
		} catch (error) {
			console.error("❌ Error en método de redirect:", error);
			return {
				success: false,
				error: "Error al iniciar autenticación con Google",
			};
		}
	}

	/**
	 * Método FedCM (nuevo estándar de Google)
	 */
	private async authenticateWithFedCM(
		action: "login" | "register"
	): Promise<GoogleAuthResponse> {
		try {
			console.log(`🆕 Usando método FedCM para ${action}...`);

			if (!window.google?.accounts?.id) {
				throw new Error("Google Identity Services no está disponible");
			}

			return new Promise((resolve) => {
				// Configuración con FedCM habilitado
				window.google.accounts.id.initialize({
					client_id: this.clientId,
					callback: async (response: any) => {
						try {
							const result = await this.sendCredentialToBackend(
								response.credential,
								action
							);
							resolve(result);
						} catch (error) {
							console.error("❌ Error procesando credential:", error);
							resolve({
								success: false,
								error:
									error instanceof Error ? error.message : "Error desconocido",
							});
						}
					},
					auto_select: false,
					cancel_on_tap_outside: true,
					// Configuración FedCM
					use_fedcm_for_prompt: true,
					use_fedcm_for_button: true,
					// Configuración adicional para FedCM
					itp_support: true,
				});

				// Mostrar prompt
				window.google.accounts.id.prompt((notification: any) => {
					console.log("📊 Notification:", notification);

					// Manejar diferentes estados sin usar métodos deprecados
					if (notification.isNotDisplayed?.()) {
						console.log("❌ Prompt no se mostró");
						resolve({
							success: false,
							error: "No se pudo mostrar el prompt de Google",
						});
					} else if (notification.isSkippedMoment?.()) {
						console.log("⏭️ Prompt fue omitido");
						resolve({
							success: false,
							error: "Autenticación omitida por el usuario",
						});
					} else if (notification.isDismissedMoment?.()) {
						console.log("❌ Prompt fue cerrado");
						resolve({
							success: false,
							error: "Autenticación cancelada por el usuario",
						});
					}
				});
			});
		} catch (error) {
			console.error("❌ Error en método FedCM:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Error en FedCM",
			};
		}
	}

	/**
	 * Inicializar Google Identity Services
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			await this.loadGoogleScript();
			this.isInitialized = true;
			console.log("✅ Google Identity Services inicializado");
		} catch (error) {
			console.error("❌ Error inicializando Google Identity Services:", error);
			throw error;
		}
	}

	/**
	 * Cargar script de Google
	 */
	private async loadGoogleScript(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (window.google?.accounts?.id) {
				resolve();
				return;
			}

			const existingScript = document.querySelector(
				'script[src*="accounts.google.com"]'
			);
			if (existingScript) {
				existingScript.addEventListener("load", () => resolve());
				existingScript.addEventListener("error", () =>
					reject(new Error("Error cargando script"))
				);
				return;
			}

			const script = document.createElement("script");
			script.src = "https://accounts.google.com/gsi/client";
			script.async = true;
			script.defer = true;

			script.onload = () => {
				setTimeout(() => resolve(), 200);
			};

			script.onerror = () => {
				reject(new Error("Error cargando script de Google"));
			};

			document.head.appendChild(script);
		});
	}

	/**
	 * Determinar si debe usar redirect
	 */
	private shouldUseRedirect(): boolean {
		// Usar redirect por defecto para mayor confiabilidad
		const forceRedirect =
			localStorage.getItem("google_auth_force_redirect") === "true";
		const isLocalhost = window.location.hostname === "localhost";

		// Si estamos en localhost y no hay configuración específica, usar redirect
		return forceRedirect || isLocalhost;
	}

	/**
	 * Enviar credential al backend
	 */
	private async sendCredentialToBackend(
		credential: string,
		action: "login" | "register"
	): Promise<GoogleAuthResponse> {
		try {
			const response = await fetch(
				`${this.baseApiUrl}/auth/google/authenticate`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
					},
					body: JSON.stringify({
						token: credential,
						action: action,
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Error en la autenticación");
			}

			return {
				success: true,
				user: data,
			};
		} catch (error) {
			console.error("❌ Error enviando credential al backend:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Error de comunicación",
			};
		}
	}

	/**
	 * Cerrar sesión
	 */
	async signOut(): Promise<void> {
		try {
			if (window.google?.accounts?.id) {
				window.google.accounts.id.disableAutoSelect();
			}

			localStorage.removeItem("google_oauth_action");
			localStorage.removeItem("google_oauth_return_url");
			localStorage.removeItem("google_auth_force_redirect");
		} catch (error) {
			console.warn("Error al cerrar sesión de Google:", error);
		}
	}

	/**
	 * Configurar para usar método específico
	 */
	setAuthMethod(method: "redirect" | "fedcm"): void {
		localStorage.setItem(
			"google_auth_force_redirect",
			method === "redirect" ? "true" : "false"
		);
	}

	/**
	 * Verificar configuración
	 */
	async checkConfiguration(): Promise<{
		isConfigured: boolean;
		errors: string[];
		warnings: string[];
	}> {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Verificar Client ID
		if (!this.clientId || this.clientId.includes("your-google-client-id")) {
			errors.push("Client ID de Google no configurado correctamente");
		}

		// Verificar API URL
		if (!this.baseApiUrl) {
			errors.push("URL del API no configurada");
		}

		// Verificar si estamos en origen seguro
		const isSecureOrigin =
			location.protocol === "https:" || location.hostname === "localhost";
		if (!isSecureOrigin) {
			errors.push("Google OAuth requiere origen seguro (HTTPS o localhost)");
		}

		// Verificar FedCM support
		if (!window.CredentialsContainer) {
			warnings.push("FedCM no está disponible en este navegador");
		}

		// Verificar CSP
		try {
			const testImg = new Image();
			testImg.src = "https://accounts.google.com/favicon.ico";
		} catch (error) {
			warnings.push("Posible problema con Content Security Policy");
		}

		return {
			isConfigured: errors.length === 0,
			errors,
			warnings,
		};
	}
}

// Declaraciones globales para TypeScript
declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					initialize: (config: any) => void;
					prompt: (callback?: (notification: any) => void) => void;
					renderButton: (element: HTMLElement | null, config: any) => void;
					disableAutoSelect: () => void;
				};
			};
		};
		CredentialsContainer?: any;
	}
}

export default GoogleAuthService;
