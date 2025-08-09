// src/core/services/AdminDiscountService.ts

import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import type {
  AdminDiscountCode,
  AdminDiscountCodeListResponse,
  AdminDiscountCodeStatsResponse,
  AdminDiscountCodeCreationData,
  AdminDiscountCodeUpdateData,
  AdminDiscountCodeValidationRequest,
  AdminDiscountCodeValidationResponse,
  AdminDiscountCodeApplicationRequest,
  AdminDiscountCodeApplicationResponse,
  AdminDiscountCodeFilterParams,
  GenerateCodeResponse,
} from "../domain/entities/AdminDiscountCode";

/**
 * Admin Discount Code Service - For managing promotional discount codes
 * Only accessible by administrators
 */
export class AdminDiscountService {
  /**
   * Get all admin discount codes with filters and pagination
   */
  async getDiscountCodes(
    filterParams?: AdminDiscountCodeFilterParams
  ): Promise<AdminDiscountCodeListResponse | null> {
    try {
      console.log(
        "📤 AdminDiscountService: Fetching discount codes:",
        filterParams
      );

      const response = await ApiClient.get<AdminDiscountCodeListResponse>(
        API_ENDPOINTS.ADMIN.DISCOUNT_CODES.LIST,
        filterParams
      );

      console.log("📥 AdminDiscountService: Discount codes response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error in AdminDiscountService.getDiscountCodes:", error);
      return null;
    }
  }

  /**
   * Get discount code statistics
   */
  async getDiscountCodeStats(): Promise<AdminDiscountCodeStatsResponse | null> {
    try {
      console.log("📤 AdminDiscountService: Fetching discount code stats");

      const response = await ApiClient.get<AdminDiscountCodeStatsResponse>(
        API_ENDPOINTS.ADMIN.DISCOUNT_CODES.STATS
      );

      console.log("📥 AdminDiscountService: Stats response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error in AdminDiscountService.getDiscountCodeStats:", error);
      return null;
    }
  }

  /**
   * Generate a random discount code
   */
  async generateRandomCode(): Promise<GenerateCodeResponse | null> {
    try {
      console.log("📤 AdminDiscountService: Generating random code");

      const response = await ApiClient.get<GenerateCodeResponse>(
        API_ENDPOINTS.ADMIN.DISCOUNT_CODES.GENERATE_CODE
      );

      console.log("📥 AdminDiscountService: Generated code response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error in AdminDiscountService.generateRandomCode:", error);
      return null;
    }
  }

  /**
   * Create a new discount code
   */
  async createDiscountCode(
    data: AdminDiscountCodeCreationData
  ): Promise<{ success: boolean; message: string; data?: AdminDiscountCode }> {
    try {
      console.log("📤 AdminDiscountService: Creating discount code:", data);

      const response = await ApiClient.post<{
        status: string;
        message: string;
        data: AdminDiscountCode;
      }>(API_ENDPOINTS.ADMIN.DISCOUNT_CODES.CREATE, data);

      console.log("📥 AdminDiscountService: Create response:", response);

      if (response && response.status === "success") {
        return {
          success: true,
          message: response.message,
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response?.message || "Error creating discount code",
        };
      }
    } catch (error: any) {
      console.error("❌ Error in AdminDiscountService.createDiscountCode:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error creating discount code",
      };
    }
  }

  /**
   * Get a specific discount code by ID
   */
  async getDiscountCodeById(id: number): Promise<AdminDiscountCode | null> {
    try {
      console.log("📤 AdminDiscountService: Fetching discount code by ID:", id);

      const response = await ApiClient.get<{
        status: string;
        data: AdminDiscountCode;
      }>(API_ENDPOINTS.ADMIN.DISCOUNT_CODES.DETAILS(id));

      console.log("📥 AdminDiscountService: Discount code response:", response);

      if (response && response.status === "success") {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("❌ Error in AdminDiscountService.getDiscountCodeById:", error);
      return null;
    }
  }

  /**
   * Update a discount code
   */
  async updateDiscountCode(
    id: number,
    data: AdminDiscountCodeUpdateData
  ): Promise<{ success: boolean; message: string; data?: AdminDiscountCode }> {
    try {
      console.log("📤 AdminDiscountService: Updating discount code:", id, data);

      const response = await ApiClient.put<{
        status: string;
        message: string;
        data: AdminDiscountCode;
      }>(API_ENDPOINTS.ADMIN.DISCOUNT_CODES.UPDATE(id), data);

      console.log("📥 AdminDiscountService: Update response:", response);

      if (response && response.status === "success") {
        return {
          success: true,
          message: response.message,
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response?.message || "Error updating discount code",
        };
      }
    } catch (error: any) {
      console.error("❌ Error in AdminDiscountService.updateDiscountCode:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error updating discount code",
      };
    }
  }

  /**
   * Delete a discount code
   */
  async deleteDiscountCode(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log("📤 AdminDiscountService: Deleting discount code:", id);

      const response = await ApiClient.delete<{
        status: string;
        message: string;
      }>(API_ENDPOINTS.ADMIN.DISCOUNT_CODES.DELETE(id));

      console.log("📥 AdminDiscountService: Delete response:", response);

      if (response && response.status === "success") {
        return {
          success: true,
          message: response.message,
        };
      } else {
        return {
          success: false,
          message: response?.message || "Error deleting discount code",
        };
      }
    } catch (error: any) {
      console.error("❌ Error in AdminDiscountService.deleteDiscountCode:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error deleting discount code",
      };
    }
  }

  /**
   * Validate a discount code (for public use)
   */
  async validateDiscountCode(
    data: AdminDiscountCodeValidationRequest
  ): Promise<AdminDiscountCodeValidationResponse | null> {
    try {
      console.log("📤 AdminDiscountService: Validating discount code:", data);

      const response = await ApiClient.post<AdminDiscountCodeValidationResponse>(
        API_ENDPOINTS.ADMIN.DISCOUNT_CODES.VALIDATE,
        data
      );

      console.log("📥 AdminDiscountService: Validation response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error in AdminDiscountService.validateDiscountCode:", error);
      return null;
    }
  }

  /**
   * Apply a discount code (for checkout process)
   */
  async applyDiscountCode(
    data: AdminDiscountCodeApplicationRequest
  ): Promise<AdminDiscountCodeApplicationResponse | null> {
    try {
      console.log("📤 AdminDiscountService: Applying discount code:", data);

      const response = await ApiClient.post<AdminDiscountCodeApplicationResponse>(
        API_ENDPOINTS.ADMIN.DISCOUNT_CODES.APPLY,
        data
      );

      console.log("📥 AdminDiscountService: Application response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error in AdminDiscountService.applyDiscountCode:", error);
      return null;
    }
  }
}

// Export singleton instance
export const adminDiscountService = new AdminDiscountService();