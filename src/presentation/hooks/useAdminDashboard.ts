import { useState, useEffect, useCallback } from 'react';
import { adminDashboardService } from '../../infrastructure/services/AdminDashboardService';
import type { AdminDashboardStats } from '../../infrastructure/services/AdminDashboardService';

interface UseAdminDashboardReturn {
  stats: AdminDashboardStats | null;
  transformedData: ReturnType<typeof adminDashboardService.transformToLegacyFormat> | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: string | null;
}

export const useAdminDashboard = (autoRefresh = false, refreshInterval = 60000): UseAdminDashboardReturn => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardStats = await adminDashboardService.getDashboardStats();
      setStats(dashboardStats);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching dashboard statistics');
      console.error('Dashboard stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Auto refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboardStats]);

  // Transform data for legacy component compatibility
  const transformedData = stats ? adminDashboardService.transformToLegacyFormat(stats) : null;

  return {
    stats,
    transformedData,
    loading,
    error,
    refetch: fetchDashboardStats,
    lastUpdated,
  };
};

export default useAdminDashboard;