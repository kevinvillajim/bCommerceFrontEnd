import { ApiClient } from '../api/apiClient';
import appConfig from '../../config/appConfig';
import type { CreditNoteRepository } from '../../core/domain/repositories/CreditNoteRepository';
import type { PaginatedApiResponse } from '../../core/domain/entities/ApiResponse';
import type { CreditNoteFilters, AdminCreditNote } from '../../core/useCases/admin/creditNote/GetAllCreditNotesUseCase';
import type { CreditNoteDetail } from '../../core/useCases/admin/creditNote/GetCreditNoteByIdUseCase';
import type { RetryCreditNoteResponse } from '../../core/useCases/admin/creditNote/RetryCreditNoteUseCase';
import type { CreditNoteStatusCheck } from '../../core/useCases/admin/creditNote/CheckCreditNoteStatusUseCase';
import type { CreditNoteStats } from '../../core/useCases/admin/creditNote/GetCreditNoteStatsUseCase';
import type { UpdateCreditNoteRequest, UpdateCreditNoteResponse } from '../../core/useCases/admin/creditNote/UpdateCreditNoteUseCase';
import type { SriCreditNoteRequest, SriCreditNoteResponse } from '../../core/useCases/admin/creditNote/CreateCreditNoteUseCase';

// Interfaces para facturas autorizadas (mantener UX)
export interface AuthorizedInvoice {
  id: number;
  invoice_number: string;
  display_label: string;
  customer: {
    name: string;
    identification: string;
    identification_type: string;
    email?: string;
    address: string;
    phone?: string;
  };
  amounts: {
    total: number;
    subtotal: number;
    tax: number;
  };
  issue_date: string;        // ✅ Campo devuelto por backend
  created_at: string;        // ✅ Campo devuelto por backend
}

export interface GetAuthorizedInvoicesResponse {
  success: boolean;
  data: AuthorizedInvoice[];
  total: number;
}

// Interface para detalles de factura
export interface InvoiceDetail {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  codigo_iva: string;
}

export class HttpCreditNoteRepository implements CreditNoteRepository {

  async getAllCreditNotes(filters: CreditNoteFilters = {}): Promise<PaginatedApiResponse<AdminCreditNote>> {
    try {
      // Usar endpoint SRI con filtros SRI
      const queryParams: Record<string, any> = {};

      if (filters.page) queryParams.page = filters.page;
      if (filters.limit) queryParams.limit = filters.limit;
      if (filters.estado) queryParams.estado = filters.estado;
      if (filters.fechaDesde) queryParams.fechaDesde = filters.fechaDesde;
      if (filters.fechaHasta) queryParams.fechaHasta = filters.fechaHasta;

      const response = await ApiClient.get<any>('/credit-notes', queryParams);

      // Adaptar respuesta del backend a formato esperado por el frontend
      const creditNotes = response?.data || [];
      const pagination = response?.meta || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      };

      // Usar paginación del backend directamente (ya está en formato correcto)
      const meta = {
        current_page: pagination.current_page || 1,
        last_page: pagination.last_page || 1,
        per_page: pagination.per_page || 20,
        total: pagination.total || 0,
        from: pagination.from || 1,
        to: pagination.to || 0,
      };

      return {
        status: 'success',
        message: 'Notas de crédito obtenidas exitosamente',
        data: {
          data: creditNotes,
          meta: meta,
          links: {
            first: '',
            last: '',
            prev: pagination.hasPrev ? '' : null,
            next: pagination.hasNext ? '' : null,
          }
        }
      };
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.getAllCreditNotes:', error);
      throw error;
    }
  }

  async getCreditNoteById(id: number): Promise<CreditNoteDetail> {
    try {
      // Mantener endpoint admin para detalles específicos de administración
      const response = await ApiClient.get<any>(`/admin/credit-notes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.getCreditNoteById:', error);
      throw error;
    }
  }

  async createCreditNote(creditNoteData: SriCreditNoteRequest): Promise<SriCreditNoteResponse> {
    try {
      // Enviar datos SRI exactos sin transformación
      const response = await ApiClient.post<any>('/credit-notes', creditNoteData);
      return response;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.createCreditNote:', error);
      throw error;
    }
  }

  async validateCreditNote(creditNoteData: SriCreditNoteRequest): Promise<any> {
    try {
      // Validar datos sin procesarlos (endpoint SRI)
      const response = await ApiClient.post<any>('/credit-notes/validate', creditNoteData);
      return response;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.validateCreditNote:', error);
      throw error;
    }
  }

  async getCreditNoteStatusByAccessKey(claveAcceso: string): Promise<any> {
    try {
      // Obtener estado por clave de acceso (endpoint SRI)
      const response = await ApiClient.get<any>(`/credit-notes/status/${claveAcceso}`);
      return response;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.getCreditNoteStatusByAccessKey:', error);
      throw error;
    }
  }

  async retryCreditNote(creditNoteId: number): Promise<RetryCreditNoteResponse> {
    try {
      // Mantener endpoint admin para reintentos
      const response = await ApiClient.post<any>(`/admin/credit-notes/${creditNoteId}/retry`, {});
      return response.data;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.retryCreditNote:', error);
      throw error;
    }
  }

  async checkCreditNoteStatus(creditNoteId: number): Promise<CreditNoteStatusCheck> {
    try {
      // Mantener endpoint admin para consulta de estado por ID
      const response = await ApiClient.get<any>(`/admin/credit-notes/${creditNoteId}/check-status`);
      return response.data;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.checkCreditNoteStatus:', error);
      throw error;
    }
  }

  async getCreditNoteStats(): Promise<CreditNoteStats> {
    try {
      // Mantener endpoint admin para estadísticas
      const response = await ApiClient.get<any>('/admin/credit-notes/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.getCreditNoteStats:', error);
      throw error;
    }
  }

  async updateCreditNote(creditNoteId: number, updateData: UpdateCreditNoteRequest): Promise<UpdateCreditNoteResponse> {
    try {
      // Mantener endpoint admin para actualizaciones
      const response = await ApiClient.put<any>(`/admin/credit-notes/${creditNoteId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.updateCreditNote:', error);
      throw error;
    }
  }

  async downloadCreditNotePdf(creditNoteId: number): Promise<Blob> {
    try {
      // Mantener endpoint admin para descarga de PDF
      const response = await fetch(`${appConfig.api.baseUrl}/admin/credit-notes/${creditNoteId}/download-pdf`, {
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
      console.error('Error en HttpCreditNoteRepository.downloadCreditNotePdf:', error);
      throw error;
    }
  }

  // Métodos restaurados para mantener la excelente UX
  async getAuthorizedInvoices(search?: string, limit?: number): Promise<GetAuthorizedInvoicesResponse> {
    try {
      const queryParams: Record<string, any> = {};
      if (search) queryParams.search = search;
      if (limit) queryParams.limit = limit;

      // Usar endpoint real de facturas (no admin)
      const response = await ApiClient.get<any>('/invoices/authorized', queryParams);
      return response;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.getAuthorizedInvoices:', error);
      throw error;
    }
  }

  async getInvoiceDetails(invoiceId: number): Promise<InvoiceDetail[]> {
    try {
      // Usar endpoint real de facturas (no admin)
      const response = await ApiClient.get<any>(`/invoices/${invoiceId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error en HttpCreditNoteRepository.getInvoiceDetails:', error);
      throw error;
    }
  }
}