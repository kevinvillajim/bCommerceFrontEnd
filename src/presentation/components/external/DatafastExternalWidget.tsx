import React, { useState, useEffect, useRef } from 'react';
import { XCircle } from 'lucide-react';
import { useToast } from '../../components/UniversalToast';
import { NotificationType } from '../../types/NotificationTypes';

interface DatafastExternalWidgetProps {
  widgetUrl: string;
  amount: number;
  customerName: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const DatafastExternalWidget: React.FC<DatafastExternalWidgetProps> = ({
  widgetUrl,
  amount,
  customerName,
  onSuccess,
  onError,
  onCancel,
}) => {
  const { showToast } = useToast();
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referencias para prevenir doble ejecución (StrictMode protection)
  const verificationInProgress = useRef(false);
  const verificationCompleted = useRef(false);

  useEffect(() => {
    loadDatafastWidget();
    return () => {
      // Cleanup script when component unmounts
      const script = document.getElementById('datafast-external-script');
      if (script) {
        script.remove();
      }
    };
  }, []);

  const loadDatafastWidget = () => {
    try {
      console.log('🎯 Cargando widget externo de Datafast...');

      // Remove existing script if any
      const existingScript = document.getElementById('datafast-external-script');
      if (existingScript) {
        existingScript.remove();
      }

      // Configure global options for external widget
      (window as any).wpwlOptions = {
        onReady: function () {
          console.log('✅ Widget externo Datafast listo!');
          setWidgetLoaded(true);
          showToast(NotificationType.SUCCESS, 'Formulario de pago cargado');
        },
        onBeforeSubmitCard: function (data: any) {
          console.log('🔄 Procesando pago externo...', data);
          setIsProcessing(true);
          showToast(NotificationType.INFO, 'Procesando pago...');
          return true;
        },
        onAfterSubmitCard: function (data: any) {
          console.log('📤 Pago enviado, esperando respuesta...', data);
        },
        onBeforeRedirectToResult: function (data: any) {
          console.log('🔄 Redirigiendo al resultado...', data);

          // Extract resource path for verification
          if (data && data.resourcePath) {
            localStorage.setItem('external_datafast_resource_path', data.resourcePath);

            // ✅ CRITICAL FIX: Guardar sessionId que espera el backend externo
            const sessionId = data.sessionId || `external_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('external_datafast_session_id', sessionId);
            console.log('   ✅ SessionId externo guardado para backend:', sessionId);

            // Don't redirect - handle internally con protección doble ejecución
            setTimeout(() => {
              handlePaymentResult(data.resourcePath);
            }, 1000);

            // Prevent external redirect
            return false;
          }
          return true;
        },
        onError: function (error: any) {
          console.error('❌ Error en widget externo:', error);
          const errorMessage = error.message || error.code || 'Error desconocido';
          setError(errorMessage);
          setIsProcessing(false);
          showToast(NotificationType.ERROR, `Error: ${errorMessage}`);
          onError?.(errorMessage);
        },
        style: 'card',
        locale: 'es',
        labels: {
          cvv: 'CVV',
          cardHolder: 'Nombre (igual que en la tarjeta)',
        },
      };

      // Load widget script
      const script = document.createElement('script');
      script.id = 'datafast-external-script';
      script.src = widgetUrl;
      script.async = true;

      script.onload = () => {
        console.log('✅ Script de widget externo cargado exitosamente');
      };

      script.onerror = (error) => {
        console.error('❌ Error cargando script de widget externo:', error);
        setError('Error cargando formulario de pago');
        showToast(NotificationType.ERROR, 'Error cargando formulario de pago');
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Error configurando widget externo:', error);
      setError('Error configurando formulario de pago');
    }
  };

  const handlePaymentResult = async (resourcePath: string) => {
    // ✅ PREVENCIÓN DOBLE EJECUCIÓN: Mismo patrón que DatafastResultPage
    if (verificationInProgress.current) {
      console.log('⚠️ Verificación ya en progreso, ignorando llamada duplicada');
      return;
    }

    if (verificationCompleted.current) {
      console.log('✅ Verificación ya completada previamente, ignorando llamada duplicada');
      return;
    }

    verificationInProgress.current = true;

    try {
      console.log('🔍 Verificando resultado del pago externo...');
      setIsProcessing(true);

      // Call verification endpoint
      const response = await fetch(`/api/pay/${getCheckoutId()}/verify/datafast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resource_path: resourcePath,
          transaction_id: `ext_${Date.now()}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Pago externo verificado exitosamente');
        verificationCompleted.current = true;
        showToast(NotificationType.SUCCESS, 'Pago procesado exitosamente');
        onSuccess?.(result.data);
      } else {
        // ✅ MANEJO ESPECÍFICO ERROR 200.300.404: Misma lógica que DatafastResultPage
        const errorCode = result.validation_data?.result?.code;
        if (errorCode === '200.300.404') {
          console.log('⚠️ Error 200.300.404 detectado - sesión ya consumida, verificando pagos previos...');

          // Verificar si el pago ya fue procesado exitosamente antes
          const checkResult = await checkForPreviousSuccessfulPayment();
          if (checkResult.wasSuccessful) {
            console.log('✅ Pago ya fue procesado exitosamente anteriormente');
            verificationCompleted.current = true;
            showToast(NotificationType.SUCCESS, 'Pago procesado exitosamente');
            onSuccess?.(checkResult.data);
            return;
          }
        }

        throw new Error(result.message || 'Error verificando pago');
      }
    } catch (error) {
      console.error('❌ Error verificando pago externo:', error);

      // Si es error de sesión consumida pero encontramos pago exitoso, no mostrar error
      if (verificationCompleted.current) {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error verificando pago';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      verificationInProgress.current = false;
      setIsProcessing(false);
    }
  };

  const checkForPreviousSuccessfulPayment = async () => {
    try {
      console.log('🔍 Verificando si existe pago exitoso previo...');

      // En pagos externos, verificamos usando el checkoutId
      const checkoutId = getCheckoutId();
      if (!checkoutId) {
        return { wasSuccessful: false };
      }

      // Endpoint específico para verificar estado de checkout externo
      const response = await fetch(`/api/external/checkout/${checkoutId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.status === 'completed') {
          console.log('✅ Encontrado pago exitoso previo en sistema externo');
          return {
            wasSuccessful: true,
            data: result.data,
          };
        }
      }

      console.log('ℹ️ No se encontró pago exitoso previo');
      return { wasSuccessful: false };
    } catch (error) {
      console.error('❌ Error verificando pago previo:', error);
      return { wasSuccessful: false };
    }
  };

  const getCheckoutId = () => {
    // Extract checkout ID from widget URL
    const url = new URL(widgetUrl);
    return url.searchParams.get('checkoutId') || '';
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error en el Pago</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setError(null);
                loadDatafastWidget();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Pagar con Datafast</h3>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between text-sm text-blue-800">
            <span>Cliente: {customerName}</span>
            <span>Monto: ${amount.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      <div className="min-h-[400px] border border-gray-200 rounded-lg p-4 mb-6">
        {/* Widget container */}
        <form
          className="paymentWidgets"
          data-brands="VISA MASTER AMEX DINERS DISCOVER"
        >
          {!widgetLoaded && !isProcessing && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Cargando formulario de pago...</p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Procesando pago...</p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Test card info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Datos de prueba:</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Tarjeta VISA:</strong> 4200 0000 0000 0000</p>
          <p><strong>Fecha:</strong> 07/26 | <strong>CVV:</strong> 246</p>
          <p><strong>Titular:</strong> {customerName}</p>
        </div>
      </div>

      {/* Cancel button */}
      <div className="text-center">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar Pago
        </button>
      </div>
    </div>
  );
};

export default DatafastExternalWidget;