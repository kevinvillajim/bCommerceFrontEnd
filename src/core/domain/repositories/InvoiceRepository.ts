import type { ApiResponse, PaginatedResponse } from '../entities/ApiResponse';
import type { InvoiceFilters, AdminInvoice } from '../../useCases/admin/invoice/GetAllInvoicesUseCase';
import type { InvoiceDetail } from '../../useCases/admin/invoice/GetInvoiceByIdUseCase';
import type { RetryInvoiceResponse } from '../../useCases/admin/invoice/RetryInvoiceUseCase';
import type { InvoiceStatusCheck } from '../../useCases/admin/invoice/CheckInvoiceStatusUseCase';
import type { InvoiceStats } from '../../useCases/admin/invoice/GetInvoiceStatsUseCase';
import type { UpdateInvoiceRequest, UpdateInvoiceResponse } from '../../useCases/admin/invoice/UpdateInvoiceUseCase';

export interface InvoiceRepository {
  getAllInvoices(filters?: InvoiceFilters): Promise<ApiResponse<AdminInvoice[], PaginatedResponse<AdminInvoice>['meta']>>;
  getInvoiceById(id: number): Promise<ApiResponse<InvoiceDetail>>;
  retryInvoice(invoiceId: number): Promise<ApiResponse<RetryInvoiceResponse>>;
  checkInvoiceStatus(invoiceId: number): Promise<ApiResponse<InvoiceStatusCheck>>;
  getInvoiceStats(): Promise<ApiResponse<InvoiceStats>>;
  updateInvoice(invoiceId: number, updateData: UpdateInvoiceRequest): Promise<ApiResponse<UpdateInvoiceResponse>>;
  downloadInvoicePdf(invoiceId: number): Promise<Blob>;
}