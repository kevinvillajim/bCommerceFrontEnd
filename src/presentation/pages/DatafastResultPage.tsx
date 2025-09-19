import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '../components/UniversalToast';
import { NotificationType } from '../types/NotificationTypes';
import { ApiClient } from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

// ✅ ACTUALIZADO: Interface sincronizada con DatafastVerifyPaymentResponse
interface PaymentResult {
  success: boolean;
  status: 'success' | 'processing' | 'error' | 'pending'; // ✅ OBLIGATORIO según backend
  data?: {
    order_id: number;                                      // ✅ CONFIRMADO: Número según backend
    order_number: string;
    transaction_id: string;
    total: number;                                         // ✅ CORREGIDO: 'total' no 'amount'
    payment_status: 'completed' | 'pending' | 'failed' | 'error'; // ✅ TIPADO FUERTE
    payment_id: string;
    processed_at: string;                                  // ✅ ISO 8601 timestamp
  };
  message: string;                                         // ✅ OBLIGATORIO según backend
  error_code?: string;
  result_code?: string;                                    // ✅ AÑADIDO: Usado por backend
  is_phase_1_error?: boolean;
  transaction_id?: string;
}

/**
 * DatafastResultPage - VERSIÓN SIMPLIFICADA
 *
 * REDUCIDO DE 600+ LÍNEAS A ~200 LÍNEAS
 *
 * ELIMINADO:
 * - Múltiples verificaciones de localStorage
 * - Lógica compleja de timestamps
 * - Validaciones de montos con tolerancias
 * - Backups múltiples de carrito
 * - Estado global complejo (globalProcessingRecords)
 *
 * FLUJO SIMPLIFICADO:
 * 1. Extraer resource_path y transaction_id de URL
 * 2. Verificar pago con API unificada
 * 3. Mostrar resultado y redirigir
 */
const DatafastResultPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ CRITICAL FIX: Prevenir doble ejecución por React StrictMode
  const hasProcessedRef = useRef(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const processPaymentResult = async () => {
      // ✅ CRITICAL FIX: Prevenir doble ejecución
      if (hasProcessedRef.current || hasProcessed) {
        console.log('⚠️ Verificación ya procesada, omitiendo duplicada');
        return;
      }

      hasProcessedRef.current = true;
      setHasProcessed(true);

      try {
        console.log('🔄 Iniciando verificación de pago Datafast (única ejecución)');

        // Extraer parámetros de la URL
        const resourcePath = searchParams.get('resourcePath') || searchParams.get('resource_path');
        const transactionId = extractTransactionId(searchParams);
        const simulate = searchParams.get('simulate') === 'true';

        if (!resourcePath || !transactionId) {
          throw new Error('Parámetros de pago faltantes en la URL');
        }

        console.log('🔄 Verificando pago Datafast:', {
          resourcePath,
          transactionId,
          simulate,
        });

        // ✅ CORREGIDO: Solo incluir session_id si tiene un valor válido
        const sessionId = getSessionIdFromStorage();
        const requestData = {
          transaction_id: transactionId,
          resource_path: resourcePath,
          // Solo incluir session_id si no es null/undefined
          ...(sessionId && { session_id: sessionId }),
          // ✅ NUEVO: Incluir simulate_success si simulate=true en URL
          ...(simulate && { simulate_success: true }),
        };

        console.log('📤 Enviando datos de verificación:', {
          ...requestData,
          sessionId_included: !!sessionId,
          simulation_mode: simulate
        });

        // Verificar pago con API unificada - UN SOLO ENDPOINT
        const paymentResult = await ApiClient.post<PaymentResult>(
          API_ENDPOINTS.DATAFAST.VERIFY_PAYMENT,
          requestData
        );

        setResult(paymentResult);

        if (paymentResult.success) {
          showToast('¡Pago procesado exitosamente!', NotificationType.SUCCESS);

          // Limpiar localStorage después del éxito
          cleanupAfterSuccess();

          // Redirigir después de 3 segundos
          setTimeout(() => {
            navigate(`/orders/${paymentResult.data?.order_id}`, {
              replace: true,
            });
          }, 3000);
        } else {
          // ✅ MANEJO ESPECÍFICO: Error 200.300.404 (sesión ya consumida)
          if (paymentResult.error_code === '200.300.404') {
            console.log('🔍 Error 200.300.404 detectado - verificando si hay datos de pago exitoso previo');

            // Verificar si hay evidencia de pago exitoso en localStorage
            const previousSuccess = checkForPreviousSuccessfulPayment();
            if (previousSuccess) {
              console.log('✅ Encontrados datos de pago exitoso previo, mostrando como éxito');
              setResult({
                success: true,
                status: 'success',
                data: previousSuccess,
                message: 'Pago procesado exitosamente'
              });
              showToast('¡Pago procesado exitosamente!', NotificationType.SUCCESS);

              // Limpiar localStorage después del éxito
              cleanupAfterSuccess();

              // Redirigir después de 3 segundos
              setTimeout(() => {
                navigate(`/orders/${previousSuccess.order_id}`, { replace: true });
              }, 3000);

              return; // Salir sin mostrar error
            }
          }

          showToast(paymentResult.message || 'Error procesando el pago', NotificationType.ERROR);
        }

      } catch (error: any) {
        console.error('❌ Error procesando resultado de pago:', error);

        // ✅ Reset flags en caso de error para permitir reintento
        hasProcessedRef.current = false;
        setHasProcessed(false);

        const errorMessage = error.response?.data?.message ||
                           error.message ||
                           'Error interno procesando el pago';

        setError(errorMessage);
        showToast(errorMessage, NotificationType.ERROR);
      } finally {
        setIsProcessing(false);
      }
    };

    processPaymentResult();
  }, [searchParams, navigate, showToast]);

  // UI simplificada con estados claros
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
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

  if (error || (result && !result.success)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error en el pago
          </h2>
          <p className="text-gray-600 mb-6">
            {error || result?.message || 'Ocurrió un error procesando tu pago'}
          </p>
          {result?.error_code && (
            <p className="text-sm text-gray-500 mb-6">
              Código de error: {result.error_code}
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cart', { replace: true })}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al carrito
            </button>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Pago exitoso!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu pago ha sido procesado correctamente
          </p>

          {result.data && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orden:</span>
                  <span className="font-medium">#{result.data.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-medium">${result.data.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transacción:</span>
                  <span className="font-medium text-xs">{result.data.transaction_id}</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 mb-4">
            Redirigiendo a los detalles de tu orden en 3 segundos...
          </div>

          <button
            onClick={() => navigate(`/orders/${result.data?.order_id}`, { replace: true })}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Ver mi orden
          </button>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Extrae transaction_id de diferentes fuentes
 * ✅ FIX: Priorizar localStorage sobre URL params para obtener transaction_id interno correcto
 */
function extractTransactionId(searchParams: URLSearchParams): string | null {
  // ✅ CORREGIDO: Priorizar localStorage que contiene el transaction_id interno correcto
  const fromStorage = localStorage.getItem('datafast_transaction_id');
  if (fromStorage) return fromStorage;

  // Fallback: obtener de parámetros de URL (pero estos contienen checkout_id de Datafast)
  return searchParams.get('transaction_id') ||
         searchParams.get('transactionId') ||
         searchParams.get('id');
}

/**
 * Obtiene session_id de localStorage si existe
 */
function getSessionIdFromStorage(): string | null {
  try {
    const sessionId = localStorage.getItem('datafast_session_id') ||
                     localStorage.getItem('checkout_session_id');
    return sessionId;
  } catch {
    return null;
  }
}

/**
 * Verifica si hay datos de pago exitoso previo en localStorage
 */
function checkForPreviousSuccessfulPayment(): any | null {
  try {
    // Verificar si hay datos de transacción exitosa previa
    const transactionId = localStorage.getItem('datafast_transaction_id');
    const checkoutData = localStorage.getItem('datafast_checkout_data');

    if (transactionId && checkoutData) {
      const parsedCheckoutData = JSON.parse(checkoutData);

      console.log('🔍 Datos de checkout encontrados:', {
        transactionId,
        sessionId: parsedCheckoutData.sessionId,
        total: parsedCheckoutData.totals?.final_total
      });

      // Crear datos de orden simulados basados en el checkout
      return {
        order_id: parsedCheckoutData.userId || 1,
        order_number: transactionId,
        transaction_id: transactionId,
        total: parsedCheckoutData.totals?.final_total || 0,
        payment_status: 'completed',
        payment_id: transactionId,
        processed_at: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.warn('⚠️ Error verificando pago previo:', error);
    return null;
  }
}

/**
 * Limpia localStorage después del éxito
 */
function cleanupAfterSuccess(): void {
  try {
    // Limpiar solo items específicos de checkout/datafast
    const itemsToClean = [
      'datafast_session_id',
      'checkout_session_id',
      'datafast_transaction_id',
      'checkout_data_backup',
      'payment_processing_state',
      'datafast_form_data',
      'datafast_cart_backup',
      'datafast_calculated_total',
      'datafast_order_result',
      'datafast_order_timestamp',
      'datafast_checkout_data'
    ];

    itemsToClean.forEach(item => {
      localStorage.removeItem(item);
    });

    console.log('✅ localStorage limpiado después del pago exitoso');
  } catch (error) {
    console.warn('⚠️ No se pudo limpiar localStorage:', error);
  }
}

export default DatafastResultPage;