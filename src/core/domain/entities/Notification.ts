/**
 * Notification entity
 */
export interface Notification {
  id?: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

/**
 * Notification creation data
 */
export interface NotificationCreationData {
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * Notification list response
 */
export interface NotificationListResponse {
  data: Notification[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    unread_count: number;
  };
}

/**
 * Notification count response
 */
export interface NotificationCountResponse {
  count: number;
}

/**
 * Mark notification as read request
 */
export interface MarkNotificationReadRequest {
  id: number;
}

/**
 * Mark notification as read response
 */
export interface MarkNotificationReadResponse {
  status: string;
  message: string;
  data: {
    notification: Notification;
  };
}

/**
 * Mark all notifications as read response
 */
export interface MarkAllNotificationsReadResponse {
  status: string;
  message: string;
  count: number;
}

/**
 * Notification filter params
 */
export interface NotificationFilterParams {
  read?: boolean;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}