import type { 
  User,
  UserRegistrationData,
  UserProfileUpdateData,
  UserPasswordUpdateData,
  UserListResponse
} from '../entities/User';

/**
 * Interface for User Repository
 */
export interface IUserRepository {
  /**
   * Get user by ID
   */
  getUserById(id: number): Promise<User>;
  
  /**
   * Get current user profile
   */
  getCurrentUser(): Promise<User>;
  
  /**
   * Update user profile
   */
  updateProfile(data: UserProfileUpdateData): Promise<User>;
  
  /**
   * Update user password
   */
  updatePassword(data: UserPasswordUpdateData): Promise<boolean>;
  
  /**
   * Get all users (admin functionality)
   */
  getUsers(page?: number, perPage?: number): Promise<UserListResponse>;
  
  /**
   * Block user (admin functionality)
   */
  blockUser(userId: number): Promise<boolean>;
  
  /**
   * Unblock user (admin functionality)
   */
  unblockUser(userId: number): Promise<boolean>;
}