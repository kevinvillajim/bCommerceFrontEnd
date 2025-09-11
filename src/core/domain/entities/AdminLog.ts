export interface AdminLogUser {
  id: number;
  name: string;
  email: string;
}

export interface AdminLogContext {
  [key: string]: any;
}

export interface AdminLog {
  id: number;
  level: 'error' | 'critical' | 'warning' | 'info';
  event_type: string;
  message: string;
  context?: AdminLogContext;
  method?: string;
  url?: string;
  ip_address?: string;
  user_agent?: string;
  user_id?: number;
  status_code?: number;
  error_hash: string;
  created_at: string;
  time_ago: string;
  is_critical: boolean;
  is_error: boolean;
  user?: AdminLogUser;
}

export interface AdminLogFilters {
  page?: number;
  per_page?: number;
  level?: AdminLog['level'];
  event_type?: string;
  user_id?: number;
  status_code?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface AdminLogStats {
  total: number;
  critical: number;
  errors: number;
  warnings: number;
  info: number;
  today: number;
  this_week: number;
  this_month: number;
}

export interface AdminLogResponse {
  data: AdminLog[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface AdminLogSingleResponse {
  data: AdminLog;
}

export interface AdminLogStatsResponse {
  data: AdminLogStats;
}

export interface AdminLogEventTypesResponse {
  data: string[];
}

export interface AdminLogUsersResponse {
  data: AdminLogUser[];
}

export interface AdminLogCleanupRequest {
  days?: number;
  batch_size?: number;
}

export interface AdminLogCleanupResponse {
  message: string;
  data: {
    deleted_count: number;
    days: number;
    batch_size: number;
  };
}

export class AdminLogEntity {
  public readonly id: number;
  public readonly level: AdminLog['level'];
  public readonly eventType: string;
  public readonly message: string;
  public readonly context: AdminLogContext | undefined;
  public readonly method: string | undefined;
  public readonly url: string | undefined;
  public readonly ipAddress: string | undefined;
  public readonly userAgent: string | undefined;
  public readonly userId: number | undefined;
  public readonly statusCode: number | undefined;
  public readonly errorHash: string;
  public readonly createdAt: string;
  public readonly timeAgo: string;
  public readonly isCritical: boolean;
  public readonly isError: boolean;
  public readonly user: AdminLogUser | undefined;

  constructor(data: AdminLog) {
    this.id = data.id;
    this.level = data.level;
    this.eventType = data.event_type;
    this.message = data.message;
    this.context = data.context;
    this.method = data.method;
    this.url = data.url;
    this.ipAddress = data.ip_address;
    this.userAgent = data.user_agent;
    this.userId = data.user_id;
    this.statusCode = data.status_code;
    this.errorHash = data.error_hash;
    this.createdAt = data.created_at;
    this.timeAgo = data.time_ago;
    this.isCritical = data.is_critical;
    this.isError = data.is_error;
    this.user = data.user;
  }

  /**
   * Get formatted date
   */
  getFormattedDate(): string {
    return new Date(this.createdAt).toLocaleString();
  }

  /**
   * Get level badge color
   */
  getLevelColor(): string {
    switch (this.level) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-orange-100 text-orange-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get level icon
   */
  getLevelIcon(): string {
    switch (this.level) {
      case 'critical':
        return '🔥';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  }

  /**
   * Get shortened message
   */
  getShortMessage(maxLength: number = 100): string {
    return this.message.length > maxLength 
      ? `${this.message.substring(0, maxLength)}...`
      : this.message;
  }

  /**
   * Get event type display name
   */
  getEventTypeDisplayName(): string {
    return this.eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Check if log has context data
   */
  hasContext(): boolean {
    return this.context !== undefined && Object.keys(this.context).length > 0;
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    if (!this.user) return 'Anonymous';
    return this.user.name || this.user.email || `User #${this.user.id}`;
  }

  /**
   * Convert to plain object
   */
  toJSON(): AdminLog {
    return {
      id: this.id,
      level: this.level,
      event_type: this.eventType,
      message: this.message,
      context: this.context,
      method: this.method,
      url: this.url,
      ip_address: this.ipAddress,
      user_agent: this.userAgent,
      user_id: this.userId,
      status_code: this.statusCode,
      error_hash: this.errorHash,
      created_at: this.createdAt,
      time_ago: this.timeAgo,
      is_critical: this.isCritical,
      is_error: this.isError,
      user: this.user,
    };
  }
}