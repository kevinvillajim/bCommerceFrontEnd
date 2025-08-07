import React, { useState, useEffect } from "react";
import {
  Gift,
  Calendar,
  CheckCircle,
  XCircle,
  Copy,
  RefreshCw,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";
import ApiClient from "../../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";

interface DiscountCode {
  id: number;
  code: string;
  discount_percentage: number;
  is_used: boolean;
  used_at: string | null;
  expires_at: string;
  feedback_id: number;
  is_expired: boolean;
}

const UserDiscountCodesPage: React.FC = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeExpired, setIncludeExpired] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscountCodes();
  }, [pagination.currentPage, includeExpired]);

  const fetchDiscountCodes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.itemsPerPage.toString(),
        offset: ((pagination.currentPage - 1) * pagination.itemsPerPage).toString(),
        include_expired: includeExpired.toString(),
      });

      const response = await ApiClient.get(`${API_ENDPOINTS.DISCOUNTS.MY_CODES}?${params.toString()}`);
      
      if (response.status === 'success') {
        setDiscountCodes(response.data || []);
        setPagination(prev => ({
          ...prev,
          totalItems: response.meta?.total || 0,
          totalPages: Math.ceil((response.meta?.total || 0) / pagination.itemsPerPage)
        }));
      }
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      setDiscountCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getCodeStatus = (code: DiscountCode) => {
    if (code.is_used) {
      return {
        label: "Usado",
        color: "bg-gray-100 text-gray-800",
        icon: <CheckCircle className="w-4 h-4" />,
      };
    } else if (code.is_expired) {
      return {
        label: "Expirado",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
      };
    } else {
      return {
        label: "Disponible",
        color: "bg-green-100 text-green-800",
        icon: <Gift className="w-4 h-4" />,
      };
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Códigos de Descuento</h1>
          <p className="text-gray-600 mt-1">Gestiona y usa tus códigos de descuento obtenidos</p>
        </div>
        <button
          onClick={fetchDiscountCodes}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeExpired}
              onChange={(e) => setIncludeExpired(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Incluir códigos expirados</span>
          </label>
        </div>
      </div>

      {/* Lista de códigos */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Cargando códigos...</span>
        </div>
      ) : discountCodes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes códigos de descuento</h3>
          <p className="text-gray-600">
            Los códigos de descuento se generan cuando tu feedback es aprobado.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {discountCodes.map((code) => {
            const status = getCodeStatus(code);
            
            return (
              <div key={code.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Tag className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {code.discount_percentage}% de descuento
                      </h3>
                      <p className="text-sm text-gray-600">Código: {code.code}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                    >
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </span>
                    
                    {!code.is_used && !code.is_expired && (
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Copiar código"
                      >
                        {copiedCode === code.code ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copiar
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Expira: {formatDate(code.expires_at)}</span>
                  </div>
                  
                  {code.is_used && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Usado: {formatDate(code.used_at)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Feedback ID: #{code.feedback_id}</span>
                  </div>
                </div>

                {!code.is_used && !code.is_expired && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>¿Cómo usar este código?</strong> Aplica este código durante el checkout 
                      para obtener {code.discount_percentage}% de descuento en tu compra.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === pagination.currentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDiscountCodesPage;