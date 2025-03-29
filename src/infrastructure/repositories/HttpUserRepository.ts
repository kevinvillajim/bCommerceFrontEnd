import { ApiClient } from '../api/ApiClient';
import type { AxiosResponse } from 'axios';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type { 
  User,
  UserProfileUpdateData,
  UserPasswordUpdateData,
  UserListResponse
} from '../../core/domain/entities/User';
import type { IUserRepository } from '../../core/domain/interfaces/IUserRepository';

/**
 * Interfaz para las respuestas de la API
 */
interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

/**
 * Interfaz para respuestas con solo estado de éxito
 */
interface SuccessResponse {
  status: string;
  message?: string;
  success: boolean;
}

/**
 * HTTP implementation of User Repository
 */
export class HttpUserRepository implements IUserRepository {
  async getUserById(id: number): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await ApiClient.get(`/users/${id}`);
    return response.data.data;
  }
  
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await ApiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data.data;
  }
  
  async updateProfile(data: UserProfileUpdateData): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await ApiClient.put('/user/profile', data);
    return response.data.data;
  }
  
  async updatePassword(data: UserPasswordUpdateData): Promise<boolean> {
    const response: AxiosResponse<SuccessResponse> = await ApiClient.put(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, data);
    return response.data.success;
  }
  
  async getUsers(page = 1, perPage = 15): Promise<UserListResponse> {
    const response: AxiosResponse<ApiResponse<UserListResponse>> = await ApiClient.get(API_ENDPOINTS.ADMIN.USERS, {
      params: { page, per_page: perPage }
    });
    return response.data.data;
  }
  
  async blockUser(userId: number): Promise<boolean> {
    const response: AxiosResponse<SuccessResponse> = await ApiClient.put(API_ENDPOINTS.ADMIN.BLOCK_USER(userId));
    return response.data.success;
  }
  
  async unblockUser(userId: number): Promise<boolean> {
    const response: AxiosResponse<SuccessResponse> = await ApiClient.put(API_ENDPOINTS.ADMIN.UNBLOCK_USER(userId));
    return response.data.success;
  }
}