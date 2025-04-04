// src/utils/apiHealthCheck.ts
import axios from "axios";
import environment from "../config/environment";

/**
 * Utilidad para verificar la conectividad y estado de la API
 */
export class ApiHealthCheck {
	/**
	 * Verifica la conectividad con la API
	 * @returns Objeto con estado de la conexión y detalles
	 */
	static async checkConnection(): Promise<{
		ok: boolean;
		statusCode?: number;
		message: string;
		responseTime?: number;
		details?: any;
	}> {
		console.log("Verificando conexión con la API...");
		const baseUrl = environment.apiBaseUrl;
		const startTime = Date.now();

		try {
			console.log(`Intentando conectar a: ${baseUrl}`);

			// Intenta una solicitud simple (generalmente un ping o health-check)
			const response = await axios.get(`${baseUrl}/api/health`, {
				timeout: 5000, // 5 segundos de timeout
			});

			const endTime = Date.now();
			const responseTime = endTime - startTime;

			console.log(`✅ Conexión exitosa (${responseTime}ms)`);
			return {
				ok: true,
				statusCode: response.status,
				message: `Conectado correctamente a ${baseUrl}`,
				responseTime,
				details: response.data,
			};
		} catch (error) {
			const endTime = Date.now();
			const responseTime = endTime - startTime;

			if (axios.isAxiosError(error)) {
				if (error.code === "ECONNREFUSED") {
					console.error(
						`❌ No se pudo conectar a ${baseUrl} - Servidor no disponible`
					);
					return {
						ok: false,
						message: `No se pudo conectar a ${baseUrl} - Servidor no disponible`,
						responseTime,
						details: error.message,
					};
				} else if (error.code === "ETIMEDOUT") {
					console.error(`❌ Timeout al conectar a ${baseUrl}`);
					return {
						ok: false,
						message: `Timeout al conectar a ${baseUrl}`,
						responseTime,
						details: error.message,
					};
				} else if (error.response) {
					console.error(
						`❌ Error de API: ${error.response.status} - ${error.response.statusText}`
					);
					return {
						ok: false,
						statusCode: error.response.status,
						message: `Error de API: ${error.response.status} - ${error.response.statusText}`,
						responseTime,
						details: error.response.data,
					};
				} else {
					console.error(`❌ Error de red: ${error.message}`);
					return {
						ok: false,
						message: `Error de red: ${error.message}`,
						responseTime,
						details: error,
					};
				}
			} else {
				console.error(`❌ Error desconocido: ${String(error)}`);
				return {
					ok: false,
					message: `Error desconocido: ${String(error)}`,
					responseTime,
					details: error,
				};
			}
		}
	}

	/**
	 * Verifica los endpoints específicos de productos y categorías
	 * @returns Objeto con estado de los endpoints
	 */
	static async checkEndpoints(): Promise<{
		products: boolean;
		categories: boolean;
		message: string;
		details: any;
	}> {
		console.log("Verificando endpoints de API...");
		const baseUrl = environment.apiBaseUrl;
		const results: any = {
			products: false,
			categories: false,
			details: {},
		};

		try {
			// Verificar endpoint de productos
			try {
				console.log("Verificando endpoint de productos...");
				const productsResponse = await axios.get(`${baseUrl}/api/products`, {
					params: {limit: 1},
					timeout: 5000,
				});

				results.products = productsResponse.status === 200;
				results.details.products = {
					status: productsResponse.status,
					hasData:
						productsResponse.data &&
						(Array.isArray(productsResponse.data) ||
							Array.isArray(productsResponse.data.data)),
					responseTime: productsResponse.headers["x-response-time"] || "N/A",
				};

				console.log(`${results.products ? "✅" : "❌"} Endpoint de productos`);
			} catch (error) {
				results.details.products = {error: String(error)};
				console.error("❌ Error al verificar endpoint de productos:", error);
			}

			// Verificar endpoint de categorías
			try {
				console.log("Verificando endpoint de categorías...");
				const categoriesResponse = await axios.get(
					`${baseUrl}/api/categories`,
					{
						params: {limit: 1},
						timeout: 5000,
					}
				);

				results.categories = categoriesResponse.status === 200;
				results.details.categories = {
					status: categoriesResponse.status,
					hasData:
						categoriesResponse.data &&
						(Array.isArray(categoriesResponse.data) ||
							Array.isArray(categoriesResponse.data.data)),
					responseTime: categoriesResponse.headers["x-response-time"] || "N/A",
				};

				console.log(
					`${results.categories ? "✅" : "❌"} Endpoint de categorías`
				);
			} catch (error) {
				results.details.categories = {error: String(error)};
				console.error("❌ Error al verificar endpoint de categorías:", error);
			}

			// Determinar mensaje general
			if (results.products && results.categories) {
				results.message = "Todos los endpoints están funcionando correctamente";
			} else if (results.products || results.categories) {
				results.message = "Algunos endpoints están funcionando, otros no";
			} else {
				results.message = "Ningún endpoint está funcionando";
			}

			return results;
		} catch (error) {
			console.error("Error al verificar endpoints:", error);
			return {
				products: false,
				categories: false,
				message: `Error al verificar endpoints: ${String(error)}`,
				details: {error},
			};
		}
	}

	/**
	 * Ejecuta un diagnóstico completo de la API
	 * @returns Resultados del diagnóstico
	 */
	static async runDiagnostic(): Promise<any> {
		console.group("Diagnóstico de API");

		try {
			// Verificar conectividad básica
			console.log("1. Verificando conectividad básica...");
			const connectionResult = await this.checkConnection();

			if (!connectionResult.ok) {
				console.warn(
					"⚠️ No se pudo establecer conexión con la API. Abortando diagnóstico."
				);
				console.groupEnd();
				return {
					ok: false,
					connection: connectionResult,
					message: "No se pudo establecer conexión con la API",
				};
			}

			// Verificar endpoints específicos
			console.log("2. Verificando endpoints específicos...");
			const endpointsResult = await this.checkEndpoints();

			// Generar reporte final
			const results = {
				ok:
					connectionResult.ok &&
					(endpointsResult.products || endpointsResult.categories),
				connection: connectionResult,
				endpoints: endpointsResult,
				timestamp: new Date().toISOString(),
				message: endpointsResult.message,
			};

			console.log(
				"Diagnóstico completado:",
				results.ok ? "✅ OK" : "❌ Problemas detectados"
			);
			console.groupEnd();

			return results;
		} catch (error) {
			console.error("Error durante el diagnóstico:", error);
			console.groupEnd();

			return {
				ok: false,
				message: `Error durante el diagnóstico: ${String(error)}`,
				error,
			};
		}
	}
}

export default ApiHealthCheck;
