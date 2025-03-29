/**
 * Feedback entity
 */
export interface Feedback {
  id?: number;
  userId: number;
  sellerId?: number;
  title: string;
  description: string;
  type: 'improvement' | 'bug' | 'feature' | 'complaint' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Campos relacionados que pueden ser útiles en el frontend
  user?: {
    id: number;
    name: string;
  };
  seller?: {
    id: number;
    storeName: string;
  };
  admin?: {
    id: number;
    name: string;
  };
}

/**
 * Feedback creation data
 */
export interface FeedbackCreationData {
  title: string;
  description: string;
  sellerId?: number;
  type?: 'improvement' | 'bug' | 'feature' | 'complaint' | 'other';
}

/**
 * Feedback review request (for admin)
 */
export interface FeedbackReviewRequest {
  id: number;
  status: 'approved' | 'rejected';
  adminNotes?: string;
}

/**
 * Feedback review response
 */
export interface FeedbackReviewResponse {
  status: string;
  message: string;
  data: {
    feedback: Feedback;
    discountCode?: {
      code: string;
      discountPercentage: number;
      expiresAt: string;
    };
  };
}

/**
 * Feedback list response
 */
export interface FeedbackListResponse {
  data: Feedback[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Pending feedback count
 */
export interface PendingFeedbackCount {
  count: number;
}

/**
 * Feedback filter params
 */
export interface FeedbackFilterParams {
  userId?: number;
  sellerId?: number;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Feedback statistics (for admin dashboard)
 */
export interface FeedbackStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: {
    improvement: number;
    bug: number;
    feature: number;
    complaint: number;
    other: number;
  };
  recentTrend: {
    date: string;
    count: number;
  }[];
}