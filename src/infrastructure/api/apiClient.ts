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
  public static async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    try {

      const headers = axiosInstance.defaults.headers;
      console.log('Request headers:', headers);
      
      const response: AxiosResponse<T> = await axiosInstance.get(url, {
        params,
        ...config
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.error('Authentication error - token may be invalid or missing');
      // Can add additional debugging here
    }
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a POST request
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param config - Additional axios config
   */
  public static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PUT request
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param config - Additional axios config
   */
  public static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a PATCH request
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param config - Additional axios config
   */
  public static async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   * @param url - API endpoint URL
   * @param config - Additional axios config
   */
  public static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Upload file(s) with multipart/form-data
   * @param url - API endpoint URL
   * @param formData - FormData containing file(s) and other data
   * @param config - Additional axios config
   */
  public static async uploadFile<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        ...config
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param error - Error object
   */
  private static handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const { response } = error;
      
      // Log the error in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          status: response?.status,
          statusText: response?.statusText,
          data: response?.data,
          url: error.config?.url
        });
      }
      
      // Handle specific error scenarios
      if (response?.status === 422) {
        // Validation error
        console.error('Validation error:', response.data.errors);
      } else if (response?.status === 404) {
        // Resource not found
        console.error('Resource not found');
      } else if (response?.status === 500) {
        // Server error
        console.error('Server error');
      }
    } else {
      // Handle non-Axios errors
      console.error('Unknown error:', error);
    }
  }
}

export default ApiClient;