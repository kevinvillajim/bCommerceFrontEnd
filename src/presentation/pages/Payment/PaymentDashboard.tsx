import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, DollarSign, Link, Clock, CheckCircle, XCircle, Timer } from 'lucide-react';
import { ApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

interface PaymentStats {
  total_links: number;
  pending_links: number;
  paid_links: number;
  expired_links: number;
  total_amount_collected: number;
  active_links: number;
}

/**
 * Dashboard para usuarios con rol payment
 * Muestra estadísticas simples de sus links de pago
 */
const PaymentDashboard: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get<{ success: boolean; data: PaymentStats }>(
        API_ENDPOINTS.EXTERNAL_PAYMENT.DASHBOARD
      );

      if (response.success) {
        setStats(response.data);
      } else {
        setError('Error cargando estadísticas');
      }
    } catch (err: any) {
      console.error('Error loading payment stats:', err);
      setError(err.response?.data?.message || 'Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const conversionRate = stats.total_links > 0
    ? ((stats.paid_links / stats.total_links) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <BarChart2 className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Pagos</h1>
            <p className="text-gray-600">Resumen de tus links de pago</p>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Links</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_links}</p>
            </div>
          </div>
        </div>

        {/* Links Pagados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pagados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paid_links}</p>
            </div>
          </div>
        </div>

        {/* Links Pendientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_links}</p>
            </div>
          </div>
        </div>

        {/* Total Recaudado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recaudado</p>
              <p className="text-2xl font-bold text-gray-900">${Number(stats.total_amount_collected || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Links Activos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Links Activos</p>
              <p className="text-3xl font-bold text-blue-600">{stats.active_links}</p>
              <p className="text-sm text-gray-500 mt-1">Disponibles para pago</p>
            </div>
            <Timer className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        {/* Links Expirados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Expirados</p>
              <p className="text-3xl font-bold text-red-600">{stats.expired_links}</p>
              <p className="text-sm text-gray-500 mt-1">Ya no válidos</p>
            </div>
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Tasa de Conversión */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Conversión</p>
              <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
              <p className="text-sm text-gray-500 mt-1">Links pagados vs total</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600" />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.location.href = '/payment/create'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Link className="h-5 w-5 mr-2" />
            Crear Nuevo Link
          </button>
          <button
            onClick={() => window.location.href = '/payment/links'}
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center"
          >
            <BarChart2 className="h-5 w-5 mr-2" />
            Ver Mis Links
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;