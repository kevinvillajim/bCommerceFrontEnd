import axiosInstance from '../api/axiosConfig';
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
    const response: AxiosResponse = await axiosInstance.get(`/users/${id}`);
    return response.data;
  }
  
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  }
  
  async updateProfile(data: UserProfileUpdateData): Promise<User> {
    const response: AxiosResponse = await axiosInstance.put('/user/profile', data);
    return response.data;
  }
  
  async updatePassword(data: UserPasswordUpdateData): Promise<boolean> {
    const response: AxiosResponse<SuccessResponse> = await axiosInstance.put(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, data);
    return response.data.success;
  }
  
  async getUsers(page = 1, perPage = 15): Promise<UserListResponse> {
    const response: AxiosResponse = await axiosInstance.get(API_ENDPOINTS.ADMIN.USERS, {
      params: { page, per_page: perPage }
    });
    return response.data;
  }
  
  async blockUser(userId: number): Promise<boolean> {
    const response: AxiosResponse<SuccessResponse> = await axiosInstance.put(API_ENDPOINTS.ADMIN.BLOCK_USER(userId));
    return response.data.success;
  }
  
  async unblockUser(userId: number): Promise<boolean> {
    const response: AxiosResponse<SuccessResponse> = await axiosInstance.put(API_ENDPOINTS.ADMIN.UNBLOCK_USER(userId));
    return response.data.success;
  }
}