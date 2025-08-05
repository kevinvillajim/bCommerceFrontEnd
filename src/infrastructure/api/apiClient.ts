import axios from "axios";
import type {AxiosRequestConfig, AxiosResponse} from "axios";
import axiosInstance from "./axiosConfig";

/**
 * Base API client para realizar peticiones HTTP
 * Con mejoras para manejar diferentes estructuras de respuesta
 */
export class ApiClient {
	/**
	 * Realizar petición GET
	 * @param url - URL del endpoint de la API
	 * @param params - Parámetros de consulta
	 * @param config - Configuración adicional de axios
	 */
	public static async get<T>(
		url: string,
		params?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			// Transformar parámetros camelCase a snake_case para API
			const transformedParams = this.transformParamsToSnakeCase(params);

			const response: AxiosResponse = await axiosInstance.get(url, {
				params: transformedParams,
				...config,
			});

			// Response received successfully

			// Validar y transformar la respuesta
			return this.handleApiResponse<T>(response);
		} catch (error) {
			this.handleApiError(error, url, "GET");
			throw error;
		}
	}

	/**
	 * Realizar petición POST
	 * @param url - URL del endpoint de la API
	 * @param data - Datos del cuerpo de la petición
	 * @param config - Configuración adicional de axios
	 */
	public static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<T> {
    try {
        // POST request

        // ✅ ARREGLADO: NO transformar FormData
        const transformedData = data instanceof FormData 
            ? data  // FormData se mantiene tal como está
            : data ? this.transformDataToSnakeCase(data) : undefined;

        // FormData is sent without transformation

        const response: AxiosResponse = await axiosInstance.post(
            url,
            transformedData,
            config
        );

        // POST response received

        // Validar y transformar la respuesta
        return this.handleApiResponse<T>(response);
    } catch (error) {
        this.handleApiError(error, url, "POST");
        throw error;
    }
}

	/**
	 * Realizar petición PUT
	 * @param url - URL del endpoint de la API
	 * @param data - Datos del cuerpo de la petición
	 * @param config - Configuración adicional de axios
	 */
	public static async put<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			// Transformar datos de camelCase a snake_case
			const transformedData = data
				? this.transformDataToSnakeCase(data)
				: undefined;

			const response: AxiosResponse = await axiosInstance.put(
				url,
				transformedData,
				config
			);

			// Validar y transformar la respuesta
			return this.handleApiResponse<T>(response);
		} catch (error) {
			this.handleApiError(error, url, "PUT");
			throw error;
		}
	}

	/**
	 * Realizar petición PATCH
	 * @param url - URL del endpoint de la API
	 * @param data - Datos del cuerpo de la petición
	 * @param config - Configuración adicional de axios
	 */
	public static async patch<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			// Transformar datos de camelCase a snake_case
			const transformedData = data
				? this.transformDataToSnakeCase(data)
				: undefined;

			const response: AxiosResponse = await axiosInstance.patch(
				url,
				transformedData,
				config
			);

			// Validar y transformar la respuesta
			return this.handleApiResponse<T>(response);
		} catch (error) {
			this.handleApiError(error, url, "PATCH");
			throw error;
		}
	}

	/**
	 * Realizar petición DELETE
	 * @param url - URL del endpoint de la API
	 * @param config - Configuración adicional de axios
	 */
	public static async delete<T>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			const response: AxiosResponse = await axiosInstance.delete(url, config);

			// Validar y transformar la respuesta
			return this.handleApiResponse<T>(response);
		} catch (error) {
			this.handleApiError(error, url, "DELETE");
			throw error;
		}
	}

	/**
	 * Subir archivo(s) con multipart/form-data
	 * @param url - URL del endpoint de la API
	 * @param formData - FormData con archivo(s) y otros datos
	 * @param config - Configuración adicional de axios
	 */
	public static async uploadFile<T>(
		url: string,
		formData: FormData,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			// Las claves del FormData ya deben estar en snake_case
			const response: AxiosResponse = await axiosInstance.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				...config,
			});

			// Validar y transformar la respuesta
			return this.handleApiResponse<T>(response);
		} catch (error) {
			this.handleApiError(error, url, "UPLOAD");
			throw error;
		}
	}
	
	/**
	 * Actualiza archivo(s) con multipart/form-data
	 * @param url - URL del endpoint de la API
	 * @param formData - FormData con archivo(s) y otros datos
	 * @param config - Configuración adicional de axios
	 */
	public static async updateFile<T>(
		url: string,
		formData: FormData,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			formData.append("_method", "PUT");

			const response: AxiosResponse = await axiosInstance.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				...config,
			});

			// Validar y transformar la respuesta
			return this.handleApiResponse<T>(response);
		} catch (error) {
			this.handleApiError(error, url, "UPDATE");
			throw error;
		}
	}

	/**
	 * Transforma parámetros de camelCase a snake_case
	 * @param params - Parámetros originales
	 * @returns Parámetros transformados
	 */
	private static transformParamsToSnakeCase(params?: any): any {
		if (!params) return undefined;

		const transformed: Record<string, any> = {};

		Object.entries(params).forEach(([key, value]) => {
			// Convertir camelCase a snake_case
			const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

			// Si el parámetro ya está en snake_case, no lo modificamos
			const finalKey = key.includes("_") ? key : snakeKey;

			transformed[finalKey] = value;
		});

		return transformed;
	}

	/**
	 * Transforma los datos de camelCase a snake_case
	 * @param data - Datos originales
	 * @returns Datos transformados
	 */
	private static transformDataToSnakeCase(data: any): any {
		if (!data || typeof data !== "object") return data;

		if (Array.isArray(data)) {
			return data.map((item) => this.transformDataToSnakeCase(item));
		}

		const transformed: Record<string, any> = {};

		Object.entries(data).forEach(([key, value]) => {
			// Convertir camelCase a snake_case
			const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();

			// Si la clave ya está en snake_case, no la modificamos
			const finalKey = key.includes("_") ? key : snakeKey;

			// Recursivamente transformar objetos anidados
			if (value !== null && typeof value === "object") {
				transformed[finalKey] = this.transformDataToSnakeCase(value);
			} else {
				transformed[finalKey] = value;
			}
		});

		return transformed;
	}

	/**
	 * Procesa la respuesta de la API para manejar diferentes estructuras
	 * @param response - Respuesta de axios
	 * @returns Datos procesados
	 */
	private static handleApiResponse<T>(response: AxiosResponse): T {
		if (!response) {
			throw new Error("Respuesta vacía de la API");
		}

		// Extraer datos según la estructura de la respuesta
		if (response.data) {
			// Casos específicos comunes en APIs Laravel

			// 1. Respuesta con data.data anidada
			if (
				response.data.data &&
				(Array.isArray(response.data.data) ||
					typeof response.data.data === "object")
			) {
				// Processing nested data.data structure
				return response.data;
			}

			// 2. Respuesta con data directamente
			return response.data;
		}

		// Si no hay datos en la respuesta, devolver la respuesta completa
		return response as unknown as T;
	}

	/**
	 * Método auxiliar para manejar errores de API
	 * @param error - Objeto de error
	 * @param url - URL de la petición
	 * @param method - Método HTTP utilizado
	 */
	private static handleApiError(error: any, url: string, method: string): void {
		if (axios.isAxiosError(error)) {
			const {response} = error;

			console.error(`API Error (${method} ${url}):`, {
				status: response?.status,
				statusText: response?.statusText,
				data: response?.data,
			});

			// Error de autenticación
			if (response?.status === 401) {
				console.error(
					"Error de autenticación - el token puede ser inválido o estar ausente"
				);
			}

			// Error de validación
			else if (response?.status === 422) {
				console.error(
					"Error de validación:",
					response.data?.errors || response.data
				);
			}

			// Recurso no encontrado
			else if (response?.status === 404) {
				console.error("Recurso no encontrado");
			}

			// Error del servidor
			else if (response?.status === 500) {
				console.error("Error del servidor");
			}

			// Error de CORS
			else if (error.message.includes("Network Error")) {
				console.error("Error de red - podría ser un problema de CORS");
			}
		} else {
			// Error no relacionado con Axios
			console.error(`Error desconocido (${method} ${url}):`, error);
		}
	}
}

export default ApiClient;
