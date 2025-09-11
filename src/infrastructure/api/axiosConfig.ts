// src/infrastructure/api/axiosConfig.ts - Versión optimizada

import axios from "axios";
import type {
	AxiosInstance,
	AxiosError,
	InternalAxiosRequestConfig,
	AxiosResponse,
} from "axios";
import appConfig from "../../config/appConfig";

// Para evitar múltiples intentos de refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Función para añadir callbacks a la cola
const subscribeTokenRefresh = (callback: (token: string) => void) => {
	refreshSubscribers.push(callback);
};

// Función para ejecutar callbacks con el nuevo token
const onTokenRefreshed = (token: string) => {
	refreshSubscribers.forEach((callback) => callback(token));
	refreshSubscribers = [];
};

// Create a custom axios instance
const axiosInstance: AxiosInstance = axios.create({
	baseURL: appConfig.api.baseUrl,
	timeout: appConfig.api.timeout,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Request interceptor
axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// Evitar agregar token para solicitudes de refreshToken o login
		if (
			config.url?.includes("/auth/refresh") ||
			config.url?.includes("/auth/login")
		) {
			return config;
		}

		// Get token from localStorage
		const token = localStorage.getItem(appConfig.storage.authTokenKey);

		// If token exists, add it to the headers
		if (token && config.headers) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}

		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	}
);

// Response interceptor
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// Handle 401 Unauthorized error (token expired)
		if (error.response?.status === 401 && !originalRequest._retry) {
			// Evitar múltiples solicitudes de refresh simultáneas
			if (isRefreshing) {
				// Esperar a que se complete el refresh actual
				return new Promise((resolve) => {
					subscribeTokenRefresh((token) => {
						// Reemplazar el token en la solicitud original
						if (originalRequest.headers) {
							originalRequest.headers["Authorization"] = `Bearer ${token}`;
						}
						resolve(axiosInstance(originalRequest));
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// Attempt to refresh token
				const refreshToken = localStorage.getItem(
					appConfig.storage.refreshTokenKey
				);

				if (!refreshToken) {
					throw new Error("No refresh token available");
				}

				const response = await axios.post(
					`${appConfig.api.baseUrl}/auth/refresh`,
					{},
					{
						headers: {
							Authorization: `Bearer ${refreshToken}`,
						},
					}
				);

				if (response.data?.access_token) {
					const newToken = response.data.access_token;

					// Save the new token
					localStorage.setItem(appConfig.storage.authTokenKey, newToken);

					// Update headers for future requests
					axiosInstance.defaults.headers.common["Authorization"] =
						`Bearer ${newToken}`;

					// Notificar a todas las solicitudes pendientes
					onTokenRefreshed(newToken);

					// Update the header in the original request
					if (originalRequest.headers) {
						originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
					}

					isRefreshing = false;

					// Retry the original request
					return axiosInstance(originalRequest);
				} else {
					throw new Error("No access token in refresh response");
				}
			} catch (refreshError) {
				isRefreshing = false;

				// Si falla el refresh, limpiar datos de sesión y redirigir a login
				localStorage.removeItem(appConfig.storage.authTokenKey);
				localStorage.removeItem(appConfig.storage.refreshTokenKey);
				localStorage.removeItem(appConfig.storage.userKey);

				// Usar window.location.replace para evitar entradas en el historial
				window.location.replace(appConfig.routes.login);

				return Promise.reject(refreshError);
			}
		}

		// Handle other errors
		return Promise.reject(error);
	}
);

export default axiosInstance;
