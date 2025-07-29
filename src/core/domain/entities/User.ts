/**
 * User entity
 */
export interface User {
	id?: number | null;
	name: string;
	email: string;
	password?: string;
	age?: number | null;
	gender?: string | null;
	location?: string | null;
	isBlocked: boolean;
	emailVerifiedAt?: string | null;
	rememberToken?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
	strikes?: UserStrike[];
	role?: "admin" | "seller" | "user" | string;

	address?: string;
	city?: string;
	state?: string;
	province?: string;
	country?: string;
	postal_code?: string;
	zip_code?: string;
	phone?: string;
  avatar?: string;
}

/**
 * User strike entity
 */
export interface UserStrike {
  id?: number;
  userId: number;
  reason: string;
  messageId?: number | null;
  createdBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token?: string;
  user: User;
}

/**
 * User registration data
 */
export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  age?: number;
  gender?: string;
  location?: string;
}

/**
 * User login data
 */
export interface UserLoginData {
  email: string;
  password: string;
}

/**
 * User profile update data
 */
export interface UserProfileUpdateData {
  name?: string;
  age?: number | null;
  gender?: string | null;
  location?: string | null;
}

/**
 * User password update data
 */
export interface UserPasswordUpdateData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

/**
 * User strike creation data
 */
export interface UserStrikeCreationData {
  userId: number;
  reason: string;
  messageId?: number;
}

/**
 * User list response
 */
export interface UserListResponse {
  data: User[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}