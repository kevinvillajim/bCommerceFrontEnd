import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, User, FileText, Calendar, Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { ApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { useToast } from '../../components/UniversalToast';
import { NotificationType } from '../../types/NotificationTypes';

interface PaymentLinkData {
  link_code: string;
  customer_name: string;
  amount: number;
  description: string | null;
  expires_at: string;
  status: string;
}

/**
 * Página pública para realizar pagos
 * Accesible mediante URL: /pay/{link_code}
 */
const PaymentPage: React.FC = () => {
  const { linkCode } = useParams<{ linkCode: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [linkData, setLinkData] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!linkCode) {
      navigate('/');
      return;
    }
    loadPaymentLink();
  }, [linkCode]);

  const loadPaymentLink = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get<{
        success: boolean;
        message?: string;
        data?: PaymentLinkData;
        error_code?: string;
      }>(`${API_ENDPOINTS.EXTERNAL_PAYMENT.PUBLIC.SHOW}/${linkCode}`);

      if (response.success && response.data) {
        setLinkData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Link de pago no encontrado');
      }
    } catch (err: any) {
      console.error('Error loading payment link:', err);

      if (err.response?.status === 404) {
        setError('Link de pago no encontrado');
      } else if (err.response?.data?.error_code === 'LINK_EXPIRED') {
        setError('Este link de pago ha expirado');
      } else if (err.response?.data?.error_code === 'LINK_NOT_AVAILABLE') {
        setError('Este link de pago ya no está disponible');
      } else {
        setError(err.response?.data?.message || 'Error cargando información del pago');
      }
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (method: 'datafast' | 'deuna') => {
    if (!linkData || !linkCode) return;

    try {
      setProcessingPayment(true);

      const endpoint = method === 'datafast'
        ? `${API_ENDPOINTS.EXTERNAL_PAYMENT.PUBLIC.DATAFAST}/${linkCode}`
        : `${API_ENDPOINTS.EXTERNAL_PAYMENT.PUBLIC.DEUNA}/${linkCode}`;

      const response = await ApiClient.post<{
        success: boolean;
        message?: string;
        data?: {
          checkout_id?: string;
          redirect_url?: string;
          order_id?: string;
          checkout_url?: string;
          payment_method: string;
        };
      }>(endpoint, {});

      if (response.success && response.data) {
        // Redirigir al gateway de pago
        const redirectUrl = response.data.redirect_url || response.data.checkout_url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          showToast('Error: No se recibió URL de redirección', NotificationType.ERROR);
        }
      } else {
        showToast(response.message || 'Error iniciando el pago', NotificationType.ERROR);
      }
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      showToast(
        err.response?.data?.message || 'Error procesando el pago',
        NotificationType.ERROR
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={loadPaymentLink}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!linkData) return null;

  const expired = isExpired(linkData.expires_at);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-20 h-20 mx-auto mb-4 shadow-sm">
            <CreditCard className="h-12 w-12 text-blue-600 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Realizar Pago</h1>
          <p className="text-gray-600">Procesa tu pago de forma segura</p>
        </div>

        {/* Información del pago */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Pago</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600">Para:</span>
              </div>
              <span className="font-medium text-gray-900">{linkData.customer_name}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600">Monto:</span>
              </div>
              <span className="text-2xl font-bold text-green-600">${linkData.amount.toFixed(2)} USD</span>
            </div>

            {linkData.description && (
              <div className="flex items-start justify-between py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <span className="text-gray-600">Concepto:</span>
                </div>
                <span className="font-medium text-gray-900 text-right max-w-xs">{linkData.description}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600">Válido hasta:</span>
              </div>
              <span className={`font-medium ${expired ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(linkData.expires_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Estado del pago */}
        {expired ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Link Expirado</h3>
                <p className="text-red-600">Este link de pago ha expirado y ya no está disponible.</p>
              </div>
            </div>
          </div>
        ) : linkData.status !== 'pending' ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Pago No Disponible</h3>
                <p className="text-gray-600">Este link de pago ya no está disponible para procesar.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Métodos de pago */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona tu método de pago</h3>

              <div className="space-y-4">
                {/* Datafast */}
                <button
                  onClick={() => initiatePayment('datafast')}
                  disabled={processingPayment}
                  className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {processingPayment ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  ) : (
                    <CreditCard className="h-5 w-5 mr-3" />
                  )}
                  <span className="font-medium">Pagar con Datafast</span>
                </button>

                {/* Deuna */}
                <button
                  onClick={() => initiatePayment('deuna')}
                  disabled={processingPayment}
                  className="w-full bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {processingPayment ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  ) : (
                    <CreditCard className="h-5 w-5 mr-3" />
                  )}
                  <span className="font-medium">Pagar con Deuna</span>
                </button>
              </div>
            </div>

            {/* Información de seguridad */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Pago Seguro</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    Tus datos están protegidos con encriptación SSL. Nunca almacenamos información de tarjetas de crédito.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>¿Tienes problemas con tu pago? Contacta al emisor de este link</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;