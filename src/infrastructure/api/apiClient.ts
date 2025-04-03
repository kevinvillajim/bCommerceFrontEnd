import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosInstance from './axiosConfig';

/**
 * Base API client for making HTTP requests
 */
export class ApiClient {
	/**
	 * Make a GET request
	 * @param url - API endpoint URL
	 * @param params - Query parameters
	 * @param config - Additional axios config
	 */
	public static async get<T>(
		url: string,
		params?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			console.log("ApiClient: Making GET request to:", url);

			// Transform camelCase parameters to snake_case for Laravel API
			let transformedParams = {...params};

			if (params) {
				// Category API specific parameters
				if (params.withCounts !== undefined) {
					transformedParams.with_counts = params.withCounts;
					delete transformedParams.withCounts;
				}

				if (params.withChildren !== undefined) {
					transformedParams.with_children = params.withChildren;
					delete transformedParams.withChildren;
				}

				if (params.withSubcategories !== undefined) {
					transformedParams.with_subcategories = params.withSubcategories;
					delete transformedParams.withSubcategories;
				}

				if (params.withProducts !== undefined) {
					transformedParams.with_products = params.withProducts;
					delete transformedParams.withProducts;
				}

				if (params.productsLimit !== undefined) {
					transformedParams.products_limit = params.productsLimit;
					delete transformedParams.productsLimit;
				}

				if (params.includeSubcategories !== undefined) {
					transformedParams.include_subcategories = params.includeSubcategories;
					delete transformedParams.includeSubcategories;
				}

				// General pagination and sorting parameters
				if (params.sortBy !== undefined) {
					transformedParams.sort_by = params.sortBy;
					delete transformedParams.sortBy;
				}

				if (params.sortDir !== undefined) {
					transformedParams.sort_dir = params.sortDir;
					delete transformedParams.sortDir;
				}
			}

			console.log("ApiClient: Transformed params:", transformedParams);

			const response: AxiosResponse = await axiosInstance.get(url, {
				params: transformedParams,
				...config,
			});

			return response.data;
		} catch (error) {
			this.handleApiError(error, url, "GET");
			throw error;
		}
	}

	/**
	 * Make a POST request
	 * @param url - API endpoint URL
	 * @param data - Request body data
	 * @param config - Additional axios config
	 */
	public static async post<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			console.log("Making POST request to:", url);

			const response: AxiosResponse = await axiosInstance.post(
				url,
				data,
				config
			);

			console.log("Response received:", response.status);

			return response.data;
		} catch (error) {
			this.handleApiError(error, url, "POST");
			throw error;
		}
	}

	/**
	 * Make a PUT request
	 * @param url - API endpoint URL
	 * @param data - Request body data
	 * @param config - Additional axios config
	 */
	public static async put<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			const response: AxiosResponse = await axiosInstance.put(
				url,
				data,
				config
			);
			return response.data;
		} catch (error) {
			this.handleApiError(error, url, "PUT");
			throw error;
		}
	}

	/**
	 * Make a PATCH request
	 * @param url - API endpoint URL
	 * @param data - Request body data
	 * @param config - Additional axios config
	 */
	public static async patch<T>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			const response: AxiosResponse = await axiosInstance.patch(
				url,
				data,
				config
			);
			return response.data;
		} catch (error) {
			this.handleApiError(error, url, "PATCH");
			throw error;
		}
	}

	/**
	 * Make a DELETE request
	 * @param url - API endpoint URL
	 * @param config - Additional axios config
	 */
	public static async delete<T>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			const response: AxiosResponse = await axiosInstance.delete(url, config);
			return response.data;
		} catch (error) {
			this.handleApiError(error, url, "DELETE");
			throw error;
		}
	}

	/**
	 * Upload file(s) with multipart/form-data
	 * @param url - API endpoint URL
	 * @param formData - FormData containing file(s) and other data
	 * @param config - Additional axios config
	 */
	public static async uploadFile<T>(
		url: string,
		formData: FormData,
		config?: AxiosRequestConfig
	): Promise<T> {
		try {
			const response: AxiosResponse = await axiosInstance.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				...config,
			});
			return response.data;
		} catch (error) {
			this.handleApiError(error, url, "UPLOAD");
			throw error;
		}
	}

	/**
	 * Helper method to handle API errors
	 * @param error - Error object
	 * @param url - The URL of the request
	 * @param method - The HTTP method used
	 */
	private static handleApiError(error: any, url: string, method: string): void {
		if (axios.isAxiosError(error)) {
			const {response} = error;

			console.error(`API Error (${method} ${url}):`, {
				status: response?.status,
				statusText: response?.statusText,
				data: response?.data,
				headers: response?.headers,
			});

			// Authentication error
			if (response?.status === 401) {
				console.error("Authentication error - token may be invalid or missing");
			}

			// Validation error
			else if (response?.status === 422) {
				console.error(
					"Validation error:",
					response.data?.errors || response.data
				);
			}

			// Not found
			else if (response?.status === 404) {
				console.error("Resource not found");
			}

			// Server error
			else if (response?.status === 500) {
				console.error("Server error");
			}

			// CORS error
			else if (error.message.includes("Network Error")) {
				console.error("Network error - this might be a CORS issue");
			}
		} else {
			// Non-Axios error
			console.error(`Unknown error (${method} ${url}):`, error);
		}
	}
}

export default ApiClient;