import { ApiClient } from '../api/apiClient';
import type { InvoiceRepository } from '../../core/domain/repositories/InvoiceRepository';
import type { ApiResponse, PaginatedResponse } from '../../core/domain/entities/ApiResponse';
import type { InvoiceFilters, AdminInvoice } from '../../core/useCases/admin/invoice/GetAllInvoicesUseCase';
import type { InvoiceDetail } from '../../core/useCases/admin/invoice/GetInvoiceByIdUseCase';
import type { RetryInvoiceResponse } from '../../core/useCases/admin/invoice/RetryInvoiceUseCase';
import type { InvoiceStatusCheck } from '../../core/useCases/admin/invoice/CheckInvoiceStatusUseCase';
import type { InvoiceStats } from '../../core/useCases/admin/invoice/GetInvoiceStatsUseCase';
import type { UpdateInvoiceRequest, UpdateInvoiceResponse } from '../../core/useCases/admin/invoice/UpdateInvoiceUseCase';

export class HttpInvoiceRepository implements InvoiceRepository {

  async getAllInvoices(filters: InvoiceFilters = {}): Promise<ApiResponse<AdminInvoice[], PaginatedResponse<AdminInvoice>['meta']>> {
    try {
      // Construir query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.customer_identification) queryParams.append('customer_identification', filters.customer_identification);
      if (filters.customer_name) queryParams.append('customer_name', filters.customer_name);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.invoice_number) queryParams.append('invoice_number', filters.invoice_number);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `/admin/invoices?${queryString}` : '/admin/invoices';
      
      const response = await ApiClient.get<{
        success: boolean;
        data: AdminInvoice[];
        meta: PaginatedResponse<AdminInvoice>['meta'];
        message?: string;
      }>(url);

      return {
        success: response.success,
        message: response.message,
        data: response.data || [],
        meta: response.meta
      };
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.getAllInvoices:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener las facturas',
        data: []
      };
    }
  }

  async getInvoiceById(id: number): Promise<ApiResponse<InvoiceDetail>> {
    try {
      const response = await ApiClient.get<InvoiceDetail>(`/admin/invoices/${id}`);
      return response;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.getInvoiceById:', error);
      throw error;
    }
  }

  async retryInvoice(invoiceId: number): Promise<ApiResponse<RetryInvoiceResponse>> {
    try {
      const response = await ApiClient.post<RetryInvoiceResponse>(`/admin/invoices/${invoiceId}/retry`, {});
      return response;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.retryInvoice:', error);
      throw error;
    }
  }

  async checkInvoiceStatus(invoiceId: number): Promise<ApiResponse<InvoiceStatusCheck>> {
    try {
      const response = await ApiClient.get<InvoiceStatusCheck>(`/admin/invoices/${invoiceId}/check-status`);
      return response;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.checkInvoiceStatus:', error);
      throw error;
    }
  }

  async getInvoiceStats(): Promise<ApiResponse<InvoiceStats>> {
    try {
      const response = await ApiClient.get<InvoiceStats>('/admin/invoices/stats/overview');
      return response;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.getInvoiceStats:', error);
      throw error;
    }
  }

  async updateInvoice(invoiceId: number, updateData: UpdateInvoiceRequest): Promise<ApiResponse<UpdateInvoiceResponse>> {
    try {
      const response = await ApiClient.put<UpdateInvoiceResponse>(`/admin/invoices/${invoiceId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.updateInvoice:', error);
      throw error;
    }
  }
}