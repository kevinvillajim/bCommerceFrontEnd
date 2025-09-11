import { ApiClient } from '../api/apiClient';
import appConfig from '../../config/appConfig';
import {
  AdminLogEntity,
} from '../../core/domain/entities/AdminLog';
import type {
  AdminLog,
  AdminLogFilters,
  AdminLogResponse,
  AdminLogSingleResponse,
  AdminLogStatsResponse,
  AdminLogEventTypesResponse,
  AdminLogUsersResponse,
  AdminLogCleanupRequest,
  AdminLogCleanupResponse,
} from '../../core/domain/entities/AdminLog';

export class AdminLogService {
  private readonly baseUrl = '/admin/logs';

  /**
   * Get paginated logs with filters
   */
  async getLogs(filters: AdminLogFilters = {}): Promise<{
    logs: AdminLogEntity[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  }> {
    const params = new URLSearchParams();

    // Add filters as query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await ApiClient.get<AdminLogResponse>(
      `${this.baseUrl}?${params.toString()}`
    );

    const logs = response.data.map((logData) => new AdminLogEntity(logData));

    return {
      logs,
      total: response.meta.total,
      currentPage: response.meta.current_page,
      lastPage: response.meta.last_page,
      perPage: response.meta.per_page,
    };
  }

  /**
   * Get specific log by ID
   */
  async getLog(id: number): Promise<AdminLogEntity> {
    const response = await ApiClient.get<AdminLogSingleResponse>(`${this.baseUrl}/${id}`);
    return new AdminLogEntity(response.data);
  }

  /**
   * Get logs statistics
   */
  async getStats(): Promise<AdminLogStatsResponse['data']> {
    const response = await ApiClient.get<AdminLogStatsResponse>(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Get recent logs
   */
  async getRecentLogs(limit: number = 50): Promise<AdminLogEntity[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));

    const response = await ApiClient.get<{ data: AdminLog[] }>(
      `${this.baseUrl}/recent?${params.toString()}`
    );

    return response.data.map((logData) => new AdminLogEntity(logData));
  }

  /**
   * Get critical logs from last X hours
   */
  async getCriticalLogs(hours: number = 24): Promise<{
    logs: AdminLogEntity[];
    hours: number;
    count: number;
  }> {
    const params = new URLSearchParams();
    if (hours) params.append('hours', String(hours));

    const response = await ApiClient.get<{
      data: AdminLog[];
      meta: { hours: number; count: number };
    }>(`${this.baseUrl}/critical?${params.toString()}`);

    const logs = response.data.map((logData) => new AdminLogEntity(logData));

    return {
      logs,
      hours: response.meta.hours,
      count: response.meta.count,
    };
  }

  /**
   * Get logs by event type
   */
  async getLogsByEventType(eventType: string, limit: number = 10): Promise<{
    logs: AdminLogEntity[];
    eventType: string;
    count: number;
  }> {
    const params = new URLSearchParams();
    params.append('event_type', eventType);
    if (limit) params.append('limit', String(limit));

    const response = await ApiClient.get<{
      data: AdminLog[];
      meta: { event_type: string; count: number };
    }>(`${this.baseUrl}/by-event-type?${params.toString()}`);

    const logs = response.data.map((logData) => new AdminLogEntity(logData));

    return {
      logs,
      eventType: response.meta.event_type,
      count: response.meta.count,
    };
  }

  /**
   * Get available event types
   */
  async getEventTypes(): Promise<string[]> {
    const response = await ApiClient.get<AdminLogEventTypesResponse>(`${this.baseUrl}/event-types`);
    return response.data;
  }

  /**
   * Get users that have generated logs
   */
  async getLogUsers(): Promise<AdminLogUsersResponse['data']> {
    const response = await ApiClient.get<AdminLogUsersResponse>(`${this.baseUrl}/users`);
    return response.data;
  }

  /**
   * Delete specific log
   */
  async deleteLog(id: number): Promise<void> {
    await ApiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Execute manual cleanup of old logs
   */
  async cleanupLogs(request: AdminLogCleanupRequest = {}): Promise<AdminLogCleanupResponse['data']> {
    const response = await ApiClient.post<AdminLogCleanupResponse>(
      `${this.baseUrl}/cleanup`,
      request
    );
    return response.data;
  }

  /**
   * Get logs with multiple filters for dashboard
   */
  async getDashboardData(): Promise<{
    recentLogs: AdminLogEntity[];
    criticalLogs: AdminLogEntity[];
    stats: AdminLogStatsResponse['data'];
    eventTypes: string[];
  }> {
    try {
      const [recentLogs, criticalLogs, stats, eventTypes] = await Promise.all([
        this.getRecentLogs(10),
        this.getCriticalLogs(24),
        this.getStats(),
        this.getEventTypes(),
      ]);

      return {
        recentLogs,
        criticalLogs: criticalLogs.logs,
        stats,
        eventTypes,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Search logs with text query
   */
  async searchLogs(
    searchTerm: string,
    filters: Omit<AdminLogFilters, 'search'> = {}
  ): Promise<{
    logs: AdminLogEntity[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  }> {
    return this.getLogs({
      ...filters,
      search: searchTerm,
    });
  }

  /**
   * Export logs data (returns download URL or blob)
   */
  async exportLogs(filters: AdminLogFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    // Use app configuration for API base URL and token key
    const response = await fetch(`${appConfig.api.baseUrl}${this.baseUrl}/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(appConfig.storage.authTokenKey)}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export logs');
    }

    return response.blob();
  }

  /**
   * Format filters for display
   */
  formatFiltersForDisplay(filters: AdminLogFilters): Record<string, string> {
    const formatted: Record<string, string> = {};

    if (filters.level) formatted['Level'] = filters.level.toUpperCase();
    if (filters.event_type) formatted['Event Type'] = filters.event_type.replace('_', ' ');
    if (filters.user_id) formatted['User ID'] = String(filters.user_id);
    if (filters.status_code) formatted['Status Code'] = String(filters.status_code);
    if (filters.from_date) formatted['From'] = new Date(filters.from_date).toLocaleDateString();
    if (filters.to_date) formatted['To'] = new Date(filters.to_date).toLocaleDateString();
    if (filters.search) formatted['Search'] = filters.search;

    return formatted;
  }

  /**
   * Validate filters before sending request
   */
  validateFilters(filters: AdminLogFilters): string[] {
    const errors: string[] = [];

    if (filters.per_page && (filters.per_page < 5 || filters.per_page > 100)) {
      errors.push('Per page must be between 5 and 100');
    }

    if (filters.from_date && filters.to_date) {
      const fromDate = new Date(filters.from_date);
      const toDate = new Date(filters.to_date);
      if (fromDate > toDate) {
        errors.push('From date must be before to date');
      }
    }

    if (filters.search && filters.search.length > 255) {
      errors.push('Search term is too long (max 255 characters)');
    }

    return errors;
  }
}