import { ApiClient } from '../api/apiClient';
import appConfig from '../../config/appConfig';
import type { InvoiceRepository } from '../../core/domain/repositories/InvoiceRepository';
import type { PaginatedApiResponse } from '../../core/domain/entities/ApiResponse';
import type { InvoiceFilters, AdminInvoice } from '../../core/useCases/admin/invoice/GetAllInvoicesUseCase';
import type { InvoiceDetail } from '../../core/useCases/admin/invoice/GetInvoiceByIdUseCase';
import type { RetryInvoiceResponse } from '../../core/useCases/admin/invoice/RetryInvoiceUseCase';
import type { InvoiceStatusCheck } from '../../core/useCases/admin/invoice/CheckInvoiceStatusUseCase';
import type { InvoiceStats } from '../../core/useCases/admin/invoice/GetInvoiceStatsUseCase';
import type { UpdateInvoiceRequest, UpdateInvoiceResponse } from '../../core/useCases/admin/invoice/UpdateInvoiceUseCase';

export class HttpInvoiceRepository implements InvoiceRepository {

  async getAllInvoices(filters: InvoiceFilters = {}): Promise<PaginatedApiResponse<AdminInvoice>> {
    try {
      // Construir query parameters (usar objeto directo como AdminOrderService)
      const queryParams = filters;

      const response = await ApiClient.get<any>('/admin/invoices', queryParams);

      // Seguir patrón de AdminOrderService - acceso directo a datos
      const invoices = response?.data || [];
      const meta = response?.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
        from: 0,
        to: 0,
      };

      return {
        status: 'success',
        message: 'Facturas obtenidas exitosamente',
        data: {
          data: invoices,
          meta: meta,
          links: {
            first: '',
            last: '',
            prev: null,
            next: null,
          }
        }
      };
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.getAllInvoices:', error);
      throw error;
    }
  }

  async getInvoiceById(id: number): Promise<InvoiceDetail> {
    try {
      const response = await ApiClient.get<any>(`/admin/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.getInvoiceById:', error);
      throw error;
    }
  }

  async retryInvoice(invoiceId: number): Promise<RetryInvoiceResponse> {
    try {
      const response = await ApiClient.post<any>(`/admin/invoices/${invoiceId}/retry`, {});
      return response.data;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.retryInvoice:', error);
      throw error;
    }
  }

  async checkInvoiceStatus(invoiceId: number): Promise<InvoiceStatusCheck> {
    try {
      const response = await ApiClient.get<any>(`/admin/invoices/${invoiceId}/check-status`);
      return response.data;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.checkInvoiceStatus:', error);
      throw error;
    }
  }

  async getInvoiceStats(): Promise<InvoiceStats> {
    try {
      const response = await ApiClient.get<any>('/admin/invoices/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.getInvoiceStats:', error);
      throw error;
    }
  }

  async updateInvoice(invoiceId: number, updateData: UpdateInvoiceRequest): Promise<UpdateInvoiceResponse> {
    try {
      const response = await ApiClient.put<any>(`/admin/invoices/${invoiceId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.updateInvoice:', error);
      throw error;
    }
  }

  async downloadInvoicePdf(invoiceId: number): Promise<Blob> {
    try {
      // Usar fetch directo como en AdminLogService para descargas de archivos
      const response = await fetch(`${appConfig.api.baseUrl}/admin/invoices/${invoiceId}/download-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem(appConfig.storage.authTokenKey)}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error en HttpInvoiceRepository.downloadInvoicePdf:', error);
      throw error;
    }
  }
}