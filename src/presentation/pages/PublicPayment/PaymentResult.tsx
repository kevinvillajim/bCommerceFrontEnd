import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { ApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

interface PaymentResultData {
  payment_method: string;
  transaction_id: string;
  amount: number;
  customer_name: string;
  paid_at: string;
}

/**
 * Página de resultado de pago público
 * Muestra el resultado después de procesar un pago externo
 */
const PaymentResult: React.FC = () => {
  const { linkCode } = useParams<{ linkCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [result, setResult] = useState<PaymentResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linkCode) {
      navigate('/');
      return;
    }
    processPaymentResult();
  }, [linkCode, searchParams]);

  const processPaymentResult = async () => {
    try {
      setLoading(true);

      // Extraer parámetros según el método de pago
      const resourcePath = searchParams.get('resourcePath') || searchParams.get('resource_path');
      const transactionId = searchParams.get('transaction_id') || searchParams.get('transactionId') || searchParams.get('id');

      // Para Datafast necesitamos verificar el pago
      if (resourcePath && transactionId) {
        const response = await ApiClient.post<{
          success: boolean;
          message: string;
          data?: PaymentResultData;
        }>(`${API_ENDPOINTS.EXTERNAL_PAYMENT.PUBLIC.DATAFAST_VERIFY}/${linkCode}`, {
          resource_path: resourcePath,
          transaction_id: transactionId,
        });

        if (response.success && response.data) {
          setResult(response.data);
          setSuccess(true);
        } else {
          setError(response.message || 'Error verificando el pago');
          setSuccess(false);
        }
      } else {
        // Para Deuna o cuando no hay parámetros, verificar estado del link
        const response = await ApiClient.get<{
          success: boolean;
          data?: any;
        }>(`${API_ENDPOINTS.EXTERNAL_PAYMENT.PUBLIC.SHOW}/${linkCode}`);

        if (response.success && response.data) {
          if (response.data.status === 'paid') {
            // El pago fue procesado exitosamente (probablemente vía webhook de Deuna)
            setSuccess(true);
            setResult({
              payment_method: 'deuna',
              transaction_id: 'Procesado automáticamente',
              amount: response.data.amount,
              customer_name: response.data.customer_name,
              paid_at: new Date().toISOString(),
            });
          } else {
            setError('El pago no fue completado');
            setSuccess(false);
          }
        } else {
          setError('Error verificando el estado del pago');
          setSuccess(false);
        }
      }
    } catch (err: any) {
      console.error('Error processing payment result:', err);
      setError(err.response?.data?.message || 'Error procesando el resultado del pago');
      setSuccess(false);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Procesando tu pago...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras verificamos tu transacción
          </p>
        </div>
      </div>
    );
  }

  if (success === false || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error en el pago
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Ocurrió un error procesando tu pago'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/pay/${linkCode}`)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Intentar de nuevo
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

  if (success && result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Pago exitoso!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu pago ha sido procesado correctamente
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium">{result.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-medium text-green-600">${result.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Método:</span>
                <span className="font-medium capitalize">{result.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transacción:</span>
                <span className="font-medium text-xs break-all">{result.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium text-xs">{formatDate(result.paid_at)}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-green-800 font-medium">
                Pago procesado exitosamente
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Finalizar
          </button>

          <div className="mt-4 text-xs text-gray-500">
            <p>Guarda esta información para tus registros</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado desconocido
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Estado desconocido
        </h2>
        <p className="text-gray-600 mb-6">
          No podemos determinar el estado de tu pago en este momento
        </p>
        <div className="space-y-3">
          <button
            onClick={processPaymentResult}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Verificar nuevamente
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
};

export default PaymentResult;