/**
 * Discount Code entity
 */
export interface DiscountCode {
  id?: number;
  feedbackId: number;
  code: string;
  discountPercentage: number;
  isUsed: boolean;
  usedBy?: number;
  usedAt?: string;
  usedOnProductId?: number;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Campos calculados que pueden ser útiles en frontend
  isValid?: boolean;
  daysUntilExpiration?: number;
}

/**
 * Discount Code creation data
 */
export interface DiscountCodeCreationData {
  feedbackId: number;
  code?: string; // Opcional si se genera automáticamente
  discountPercentage?: number;
  expirationDays?: number;
}

/**
 * Discount Code validation request
 */
export interface DiscountCodeValidationRequest {
  code: string;
  productId?: number;
}

/**
 * Discount Code validation response
 */
export interface DiscountCodeValidationResponse {
  status: string;
  valid: boolean;
  message: string;
  data?: {
    code: DiscountCode;
    discountAmount?: number;
  };
}

/**
 * Discount Code application request
 */
export interface DiscountCodeApplicationRequest {
  code: string;
  productId: number;
}

/**
 * Discount Code application response
 */
export interface DiscountCodeApplicationResponse {
  status: string;
  success: boolean;
  message: string;
  data?: {
    code: DiscountCode;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  };
}

/**
 * Discount Code list response
 */
export interface DiscountCodeListResponse {
  data: DiscountCode[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Discount Code filter params
 */
export interface DiscountCodeFilterParams {
  feedbackId?: number;
  isUsed?: boolean;
  usedBy?: number;
  isValid?: boolean;
  code?: string;
  page?: number;
  perPage?: number;
}