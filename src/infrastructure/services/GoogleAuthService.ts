// src/infrastructure/services/GoogleAuthService.ts

interface GoogleUser {
	credential: string;
	clientId: string;
}

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

	private constructor() {}

	public static getInstance(): GoogleAuthService {
		if (!GoogleAuthService.instance) {
			GoogleAuthService.instance = new GoogleAuthService();
		}
		return GoogleAuthService.instance;
	}

	/**
	 * Initialize Google OAuth
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		return new Promise((resolve, reject) => {
			// Verificar si ya está cargado
			if (window.google && window.google.accounts) {
				this.isInitialized = true;
				resolve();
				return;
			}

			// Cargar script de Google OAuth
			const script = document.createElement("script");
			script.src = "https://accounts.google.com/gsi/client";
			script.async = true;
			script.defer = true;

			script.onload = () => {
				this.isInitialized = true;
				resolve();
			};

			script.onerror = () => {
				reject(new Error("Failed to load Google OAuth script"));
			};

			document.head.appendChild(script);
		});
	}

	/**
	 * Handle Google OAuth login/register
	 */
	async authenticateWithGoogle(
		action: "login" | "register"
	): Promise<GoogleAuthResponse> {
		try {
			await this.initialize();

			return new Promise((resolve, reject) => {
				if (!window.google?.accounts?.id) {
					reject(new Error("Google OAuth not initialized"));
					return;
				}

				// Configurar Google OAuth
				window.google.accounts.id.initialize({
					client_id: this.clientId,
					callback: async (response: GoogleUser) => {
						try {
							console.log("🔐 Google credential received:", {
								hasCredential: !!response.credential,
								clientId: response.clientId,
							});

							// Enviar credential al backend
							const result = await this.sendCredentialToBackend(
								response.credential,
								action
							);
							resolve(result);
						} catch (error) {
							console.error("❌ Error processing Google auth:", error);
							resolve({
								success: false,
								error:
									error instanceof Error ? error.message : "Error desconocido",
							});
						}
					},
					auto_select: false,
					cancel_on_tap_outside: true,
				});

				// Mostrar el popup de Google
				window.google.accounts.id.prompt((notification: any) => {
					if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
						console.log("Google OAuth prompt was not displayed or skipped");
						resolve({
							success: false,
							error: "Autenticación cancelada",
						});
					}
				});
			});
		} catch (error) {
			console.error("❌ Error in Google authentication:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Error al inicializar Google OAuth",
			};
		}
	}

	/**
	 * Send credential to backend for verification
	 */
	private async sendCredentialToBackend(
		credential: string,
		action: "login" | "register"
	): Promise<GoogleAuthResponse> {
		try {
			const apiUrl =
				import.meta.env.VITE_API_URL || "http://localhost:8000/api";

			const response = await fetch(`${apiUrl}/auth/google/authenticate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					token: credential,
					action: action,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Error en la autenticación");
			}

			return {
				success: true,
				user: data,
			};
		} catch (error) {
			console.error("❌ Error sending credential to backend:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Error de comunicación con el servidor",
			};
		}
	}

	/**
	 * Render Google Sign-In Button
	 */
	renderSignInButton(elementId: string, action: "login" | "register"): void {
		if (!this.isInitialized || !window.google?.accounts?.id) {
			console.warn("Google OAuth not initialized");
			return;
		}

		window.google.accounts.id.renderButton(document.getElementById(elementId), {
			theme: "outline",
			size: "large",
			type: "standard",
			text: action === "login" ? "signin_with" : "signup_with",
			width: "100%",
		});
	}

	/**
	 * Sign out from Google
	 */
	async signOut(): Promise<void> {
		if (window.google?.accounts?.id) {
			window.google.accounts.id.disableAutoSelect();
		}
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
	}
}

export default GoogleAuthService;
