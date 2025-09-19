import ApiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import axiosInstance from '../api/axiosConfig';

// Tipos para las respuestas de earnings
interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface EarningsStats {
  total_earnings: number;
  pending_payments: number;
  sales_this_period: number;
  sales_growth: number;
  commissions_this_period: number;
  commissions_percentage: number;
  net_earnings_this_period: number;
  earnings_growth: number;
  period: {
    label: string;
    start_date: string;
    end_date: string;
    previous_period: {
      start: string;
      end: string;
    };
    has_custom_dates: boolean;
  };
}

export interface MonthlyEarnings {
  month: string;
  month_short: string;
  year: string;
  sales: number;
  commissions: number;
  net: number;
  orders_count: number;
}

interface EarningsApiResponse {
  success: boolean;
  data: EarningsStats;
  message?: string;
}

interface MonthlyEarningsApiResponse {
  success: boolean;
  data: MonthlyEarnings[];
  message?: string;
}

class SellerEarningsService {
  /**
   * Obtener métricas generales de earnings del seller
   */
  static async getEarnings(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<EarningsStats> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.start_date) {
        queryParams.append('start_date', params.start_date);
      }

      if (params?.end_date) {
        queryParams.append('end_date', params.end_date);
      }

      const url = API_ENDPOINTS.SELLER.EARNINGS.BASE;
      const response = await ApiClient.get<EarningsApiResponse>(
        url,
        Object.fromEntries(queryParams)
      );

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener earnings');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching seller earnings:', error);
      throw new Error(error.message || 'Error al obtener las ganancias del seller');
    }
  }

  /**
   * Obtener desglose mensual de earnings
   */
  static async getMonthlyBreakdown(params?: DateRangeParams): Promise<MonthlyEarnings[]> {
    try {
      const url = API_ENDPOINTS.SELLER.EARNINGS.MONTHLY;

      // Preparar parámetros de consulta
      const queryParams: [string, string][] = [];
      if (params?.start_date) {
        queryParams.push(['start_date', params.start_date]);
      }
      if (params?.end_date) {
        queryParams.push(['end_date', params.end_date]);
      }

      const response = await ApiClient.get<MonthlyEarningsApiResponse>(
        url,
        Object.fromEntries(queryParams)
      );

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener desglose mensual');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching monthly earnings breakdown:', error);
      throw new Error(error.message || 'Error al obtener el desglose mensual');
    }
  }

  /**
   * Validar rango de fechas
   */
  static validateDateRange(startDate: string, endDate: string): boolean {
    if (!startDate || !endDate) {
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return start <= end;
  }

  /**
   * Obtener fechas por defecto (último mes)
   */
  static getDefaultDateRange(): { start_date: string; end_date: string } {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);

    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };
  }

  /**
   * Formatear datos para gráficos
   */
  static formatForCharts(monthlyData: MonthlyEarnings[]) {
    return {
      monthlySales: monthlyData.map(item => ({
        month: item.month_short,
        sales: item.sales,
        commissions: item.commissions,
        net: item.net,
      })),
      totals: {
        total_sales: monthlyData.reduce((sum, item) => sum + item.sales, 0),
        total_commissions: monthlyData.reduce((sum, item) => sum + item.commissions, 0),
        total_net: monthlyData.reduce((sum, item) => sum + item.net, 0),
        total_orders: monthlyData.reduce((sum, item) => sum + item.orders_count, 0),
      }
    };
  }

  /**
   * Calcular crecimiento porcentual
   */
  static calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }

  /**
   * Exportar reporte de earnings en PDF
   */
  static async exportPdf(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ download_url: string; filename: string; file_path: string }> {
    try {
      const url = API_ENDPOINTS.SELLER.EARNINGS.EXPORT_PDF;
      const response = await ApiClient.post<{
        success: boolean;
        data: { download_url: string; filename: string; file_path: string };
        message: string;
      }>(url, params || {});

      if (!response.success) {
        throw new Error(response.message || 'Error al exportar reporte PDF');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error exporting earnings PDF:', error);
      throw new Error(error.message || 'Error al exportar el reporte en PDF');
    }
  }

  /**
   * Descargar PDF generado
   */
  static async downloadPdf(filePath: string): Promise<Blob> {
    try {
      const url = API_ENDPOINTS.SELLER.EARNINGS.DOWNLOAD_PDF;
      const response = await axiosInstance.get(url, {
        params: { file_path: filePath },
        responseType: 'blob'
      });

      return response.data;
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      throw new Error(error.message || 'Error al descargar el archivo PDF');
    }
  }

}

export default SellerEarningsService;