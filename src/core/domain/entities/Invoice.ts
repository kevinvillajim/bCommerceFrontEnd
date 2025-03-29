/**
 * Invoice entity
 */
export interface Invoice {
  id?: number;
  invoiceNumber: string;
  orderId: number;
  userId: number;
  sellerId: number;
  transactionId?: number;
  issueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'ISSUED' | 'AUTHORIZED' | 'CANCELLED' | 'REJECTED';
  sriAuthorizationNumber?: string;
  sriAccessKey?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  sriResponse?: Record<string, any>;
  items: InvoiceItem[];
  // Campos adicionales útiles para el frontend
  order?: {
    orderNumber: string;
    createdAt: string;
  };
  user?: {
    name: string;
    email: string;
  };
  seller?: {
    storeName: string;
  };
}

/**
 * Invoice item entity
 */
export interface InvoiceItem {
  id?: number;
  invoiceId?: number;
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  sriProductCode?: string;
  // Campos adicionales útiles para el frontend
  product?: {
    name: string;
    image?: string;
  };
}

/**
 * Invoice creation data
 */
export interface InvoiceCreationData {
  orderId: number;
  issueDate?: string;
  items?: InvoiceItemCreationData[];
}

/**
 * Invoice item creation data
 */
export interface InvoiceItemCreationData {
  productId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  sriProductCode?: string;
}

/**
 * Invoice cancellation request
 */
export interface InvoiceCancellationRequest {
  reason: string;
}

/**
 * Invoice list response
 */
export interface InvoiceListResponse {
  data: Invoice[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Invoice detail response
 */
export interface InvoiceDetailResponse {
  data: Invoice;
}

/**
 * Invoice filter params
 */
export interface InvoiceFilterParams {
  userId?: number;
  sellerId?: number;
  orderId?: number;
  status?: string;
  invoiceNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Invoice summary
 * Útil para resúmenes en dashboards
 */
export interface InvoiceSummary {
  issuedCount: number;
  authorizedCount: number;
  cancelledCount: number;
  rejectedCount: number;
  totalAmount: number;
  totalTax: number;
  byPeriod: {
    period: string;
    count: number;
    amount: number;
  }[];
}

/**
 * SRI authorization request
 * Específico para el sistema tributario ecuatoriano
 */
export interface SriAuthorizationRequest {
  invoiceId: number;
}

/**
 * SRI authorization response
 */
export interface SriAuthorizationResponse {
  status: string;
  message: string;
  data: {
    invoice: Invoice;
    authorizationNumber?: string;
    accessKey?: string;
    authorizationDate?: string;
    errors?: string[];
  };
}

/**
 * Invoice download options
 */
export interface InvoiceDownloadOptions {
  format: 'pdf' | 'xml';
  includeAttachments?: boolean;
}