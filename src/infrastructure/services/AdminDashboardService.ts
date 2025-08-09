import { ApiClient } from '../api/apiClient';

export interface AdminDashboardStats {
  main_stats: {
    total_sales: {
      value: string;
      change: number;
      formatted_value: string;
    };
    total_users: {
      value: number;
      change: number;
      formatted_value: string;
    };
    total_orders: {
      value: number;
      change: number;
      formatted_value: string;
    };
    active_products: {
      value: string;
      change: number;
      active_count: number;
      total_count: number;
      formatted_value: string;
    };
  };
  pending_items: {
    pending_ratings: {
      count: number;
      message: string;
    };
    pending_sellers: {
      count: number;
      message: string;
    };
    pending_feedback: {
      count: number;
      message: string;
    };
  };
  system_alerts: Array<{
    type: string;
    title: string;
    description: string;
    count: number;
    link_to: string;
  }>;
  recent_orders: Array<{
    id: string;
    date: string;
    customer: string;
    total: number;
    status: string;
    formatted_total: string;
  }>;
  top_sellers: Array<{
    id: number;
    name: string;
    order_count: number;
    revenue: number;
    formatted_revenue: string;
  }>;
  performance_metrics: {
    conversion_rate: number;
    average_order_value: number;
    order_fulfillment_rate: number;
    customer_retention_rate: number;
    daily_stats: Array<{
      date: string;
      order_count: number;
      daily_revenue: string;
      unique_customers: number;
    }>;
    system_health: {
      error_rate: number;
      average_response_time: number;
      uptime: string;
    };
  };
  last_updated: string;
}

export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardStats;
  message?: string;
  error?: string;
}

export class AdminDashboardService {
  /**
   * Get comprehensive dashboard statistics for admin
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const response = await ApiClient.get<AdminDashboardResponse>('/admin/dashboard');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dashboard statistics');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Transform backend data to frontend format for backward compatibility
   */
  transformToLegacyFormat(stats: AdminDashboardStats) {
    return {
      // Main statistics cards
      cards: [
        {
          title: "Ventas Totales",
          value: stats.main_stats.total_sales.formatted_value,
          change: stats.main_stats.total_sales.change,
          icon: "DollarSign",
          iconBgColor: "bg-green-50",
          iconColor: "text-green-600",
        },
        {
          title: "Usuarios Totales",
          value: stats.main_stats.total_users.value,
          change: stats.main_stats.total_users.change,
          icon: "Users",
          iconBgColor: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          title: "Pedidos Totales",
          value: stats.main_stats.total_orders.value,
          change: stats.main_stats.total_orders.change,
          icon: "ShoppingBag",
          iconBgColor: "bg-purple-50",
          iconColor: "text-purple-600",
        },
        {
          title: "Productos Activos",
          value: stats.main_stats.active_products.formatted_value,
          change: stats.main_stats.active_products.change,
          icon: "Package",
          iconBgColor: "bg-yellow-50",
          iconColor: "text-yellow-600",
        },
      ],

      // Pending moderation items
      pendingCardItems: [
        {
          icon: "Star",
          iconBgColor: "bg-yellow-50",
          iconColor: "text-yellow-600",
          title: "Valoraciones y Reseñas",
          description: stats.pending_items.pending_ratings.message,
          linkText: "Moderar Reseñas",
          linkTo: "/admin/ratings?status=pending",
        },
        {
          icon: "Briefcase",
          iconBgColor: "bg-blue-50",
          iconColor: "text-blue-600",
          title: "Solicitudes de Vendedores",
          description: stats.pending_items.pending_sellers.message,
          linkText: "Ver solicitudes",
          linkTo: "/admin/sellers?status=pending",
        },
        {
          icon: "MessageSquare",
          iconBgColor: "bg-purple-50",
          iconColor: "text-purple-600",
          title: "Customer Feedback",
          description: stats.pending_items.pending_feedback.message,
          linkText: "Revisar Comentarios",
          linkTo: "/admin/feedback?status=pending",
        },
      ],

      // System alerts
      alertItems: stats.system_alerts.map(alert => ({
        icon: "AlertTriangle",
        borderColor: alert.type === 'error' ? "border-red-500" : "border-amber-500",
        bgColor: alert.type === 'error' ? "bg-red-50" : "bg-amber-50",
        iconColor: alert.type === 'error' ? "text-red-500" : "text-amber-500",
        title: alert.title,
        description: alert.description,
        linkText: "Ver detalles",
        linkTo: alert.link_to,
        textColor: alert.type === 'error' ? "text-red-800" : "text-amber-800",
        hoverTextColor: alert.type === 'error' ? "text-red-600" : "text-amber-600",
      })),

      // Recent orders
      recentOrders: stats.recent_orders.map(order => ({
        id: order.id,
        date: order.date,
        customer: order.customer,
        total: order.total,
        status: this.mapOrderStatus(order.status),
      })),

      // Top sellers
      topSellers: stats.top_sellers.map(seller => ({
        id: seller.id,
        name: seller.name,
        orderCount: seller.order_count,
        revenue: seller.revenue,
      })),

      // Performance metrics
      performanceMetrics: stats.performance_metrics,

      // Metadata
      lastUpdated: stats.last_updated,
    };
  }

  /**
   * Map backend order status to frontend expected values
   */
  private mapOrderStatus(backendStatus: string): "Completed" | "Processing" | "Shipped" {
    const statusMap: { [key: string]: "Completed" | "Processing" | "Shipped" } = {
      'Completado': 'Completed',
      'completed': 'Completed',
      'Completed': 'Completed',
      'Procesando': 'Processing', 
      'processing': 'Processing',
      'Processing': 'Processing',
      'Pendiente': 'Processing',
      'pending': 'Processing',
      'Enviado': 'Shipped',
      'shipped': 'Shipped',
      'Shipped': 'Shipped',
      'delivered': 'Shipped',
      'Entregado': 'Shipped',
    };

    return statusMap[backendStatus] || 'Processing';
  }
}

export const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;