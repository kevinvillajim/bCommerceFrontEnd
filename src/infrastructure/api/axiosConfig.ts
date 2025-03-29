import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import appConfig from '../../config/appConfig';

// Create a custom axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem(appConfig.storage.authTokenKey);
    
    // If token exists, add it to the headers
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized error (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem(appConfig.storage.refreshTokenKey);
        
        if (refreshToken) {
          const response = await axios.post(
            `${appConfig.api.baseUrl}/auth/refresh`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${refreshToken}`
              }
            }
          );
          
          if (response.data.access_token) {
            // Save the new token
            localStorage.setItem(appConfig.storage.authTokenKey, response.data.access_token);
            
            // Update the header in the original request
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
            }
            
            // Retry the original request
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem(appConfig.storage.authTokenKey);
        localStorage.removeItem(appConfig.storage.refreshTokenKey);
        localStorage.removeItem(appConfig.storage.userKey);
        
        window.location.href = appConfig.routes.login;
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;