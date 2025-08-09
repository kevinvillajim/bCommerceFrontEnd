/**
 * Admin Discount Code entity - Different from user feedback discount codes
 * These are promotional codes created by admins for marketing purposes
 */
export interface AdminDiscountCode {
  id?: number;
  code: string;
  discount_percentage: number;
  is_used: boolean;
  used_by?: number | null;
  used_at?: string | null;
  used_on_product_id?: number | null;
  expires_at: string;
  description?: string | null;
  created_by: number;
  created_at?: string;
  updated_at?: string;
  
  // Computed fields that may be useful in frontend
  is_valid?: boolean;
  days_until_expiration?: number;
  
  // Related data
  used_by_user?: {
    id: number;
    name: string;
    email: string;
  };
  used_on_product?: {
    id: number;
    name: string;
    price: number;
  };
  created_by_user?: {
    id: number;
    name: string;
  };
}

/**
 * Admin Discount Code creation data
 */
export interface AdminDiscountCodeCreationData {
  code: string;
  discount_percentage: number;
  expires_at: string;
  description?: string;
}

/**
 * Admin Discount Code update data
 */
export interface AdminDiscountCodeUpdateData {
  code?: string;
  discount_percentage?: number;
  expires_at?: string;
  description?: string;
}

/**
 * Admin Discount Code validation request
 */
export interface AdminDiscountCodeValidationRequest {
  code: string;
  product_id?: number;
}

/**
 * Admin Discount Code validation response
 */
export interface AdminDiscountCodeValidationResponse {
  status: string;
  valid: boolean;
  message: string;
  data?: {
    code: AdminDiscountCode;
    discount_amount?: number;
  };
}

/**
 * Admin Discount Code application request
 */
export interface AdminDiscountCodeApplicationRequest {
  code: string;
  product_id: number;
}

/**
 * Admin Discount Code application response
 */
export interface AdminDiscountCodeApplicationResponse {
  status: string;
  success: boolean;
  message: string;
  data?: {
    code: AdminDiscountCode;
    original_price: number;
    discount_amount: number;
    final_price: number;
  };
}

/**
 * Admin Discount Code list response
 */
export interface AdminDiscountCodeListResponse {
  status: string;
  data: AdminDiscountCode[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    current_page: number;
    total_pages: number;
  };
}

/**
 * Admin Discount Code statistics response
 */
export interface AdminDiscountCodeStatsResponse {
  status: string;
  data: {
    total: number;
    valid: number;
    expired: number;
    used: number;
    unused: number;
    active: number; // Valid and unused
  };
}

/**
 * Admin Discount Code filter params
 */
export interface AdminDiscountCodeFilterParams {
  validity?: 'all' | 'valid' | 'expired';
  usage?: 'all' | 'used' | 'unused';
  percentage?: 'all' | '10' | '20' | '30' | '50+';
  code?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Generate random code response
 */
export interface GenerateCodeResponse {
  status: string;
  data: {
    code: string;
  };
}