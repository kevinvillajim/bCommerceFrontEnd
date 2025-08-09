import { ApiClient } from '../api/apiClient';

export interface SellerInfo {
  business_name: string | null;
  description: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
}

export interface MonthlyStats {
  month: string;
  month_name: string;
  orders: number;
  revenue: number;
}

export interface RecentOrder {
  id: number;
  customer_name: string;
  total: number;
  status: string;
  date: string;
  formatted_total: string;
}

export interface TopProduct {
  id: number;
  name: string;
  price: number;
  sales_count: number;
  view_count: number;
  revenue: number;
}

export interface SellerDetail {
  id: number;
  name: string;
  email: string;
  status: string;
  is_blocked: boolean;
  created_at: string;
  joined_date: string;
  total_orders: number;
  total_revenue: number;
  products_count: number;
  average_rating: number;
  last_order_date: string | null;
  seller_info: SellerInfo;
  monthly_stats: MonthlyStats[];
  recent_orders: RecentOrder[];
  top_products: TopProduct[];
  pending_orders: number;
  completed_orders: number;
  customer_count: number;
}

export interface SellerDetailResponse {
  success: boolean;
  data: SellerDetail;
  message?: string;
  error?: string;
}

export class AdminSellerService {
  /**
   * Get detailed information about a specific seller
   */
  async getSellerDetails(sellerId: string | number): Promise<SellerDetail> {
    try {
      const response = await ApiClient.get<SellerDetailResponse>(`/admin/sellers/${sellerId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch seller details');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching seller details:', error);
      throw error;
    }
  }

  /**
   * Update seller status
   */
  async updateSellerStatus(sellerId: string | number, status: 'pending' | 'active' | 'suspended', reason?: string): Promise<void> {
    try {
      const response = await ApiClient.put<{ success: boolean; message?: string }>(`/admin/sellers/${sellerId}/status`, {
        status,
        reason,
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update seller status');
      }
    } catch (error) {
      console.error('Error updating seller status:', error);
      throw error;
    }
  }
}

export const adminSellerService = new AdminSellerService();
export default adminSellerService;