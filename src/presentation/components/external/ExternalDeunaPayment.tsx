import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw, Copy, ExternalLink, Smartphone, Zap } from 'lucide-react';
import { useToast } from '../../components/UniversalToast';
import { NotificationType } from '../../types/NotificationTypes';
import { ExternalDeunaService } from '../../../infrastructure/services/ExternalDeunaService';

interface ExternalDeunaPaymentProps {
  linkCode: string;
  amount: number;
  customerName: string;
  customerData: {
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
  };
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const ExternalDeunaPayment: React.FC<ExternalDeunaPaymentProps> = ({
  linkCode,
  amount,
  customerName,
  customerData,
  onSuccess,
  onError,
  onCancel,
}) => {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('pending');
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Refs for cleanup
  const pollingRef = React.useRef<any>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateQRPayment();

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        pollingRef.current.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (paymentData && isPolling && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPolling(false);
            setError("El tiempo de pago ha expirado. El pago ha sido cancelado automáticamente.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timerRef.current = interval;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paymentData, isPolling, timeRemaining]);

  const generateQRPayment = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('🔄 Generando QR externo para Deuna...');

      const response = await ExternalDeunaService.createExternalPayment(linkCode, customerData);

      if (response.success && response.data) {
        console.log('✅ QR externo generado exitosamente');
        setPaymentData(response.data);
        setIsPolling(true);
        startPollingPaymentStatus();
        showToast('Código QR generado', NotificationType.SUCCESS);
      } else {
        throw new Error(response.message || 'Error generando código QR');
      }
    } catch (error) {
      console.error('❌ Error generando QR externo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error generando código QR';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const startPollingPaymentStatus = () => {
    const polling = ExternalDeunaService.pollExternalPaymentStatus(linkCode, {
      maxAttempts: 40,
      interval: 15000,
      onStatusChange: handleStatusChange
    });

    pollingRef.current = polling;

    polling.promise.catch(err => {
      console.error('Error en polling:', err);
      if (isPolling) {
        setError('Error monitoreando el estado del pago');
      }
    });
  };

  const handleStatusChange = (status: string) => {
    console.log('📊 Estado del pago cambió:', status);
    setCurrentStatus(status);

    switch (status) {
      case 'completed':
        setIsPolling(false);
        showToast('¡Pago completado exitosamente!', NotificationType.SUCCESS);
        onSuccess?.(paymentData);
        break;
      case 'failed':
      case 'cancelled':
        setIsPolling(false);
        const errorMsg = `Pago ${status === 'failed' ? 'fallido' : 'cancelado'}`;
        setError(errorMsg);
        onError?.(errorMsg);
        break;
    }
  };

  const cancelPayment = async (reason = 'Usuario canceló') => {
    try {
      console.log('🚫 Cancelando pago externo...');
      setIsPolling(false);

      if (pollingRef.current) {
        pollingRef.current.cancel();
      }

      showToast('Pago cancelado', NotificationType.INFO);
      onCancel?.();
    } catch (error) {
      console.error('Error cancelando pago:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      showToast('Enlace copiado', NotificationType.SUCCESS);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
      showToast('Error copiando enlace', NotificationType.ERROR);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const simulatePayment = async () => {
    if (!paymentData?.payment_id) return;

    try {
      console.log('🧪 Simulando pago exitoso...');
      await ExternalDeunaService.simulateWebhook(linkCode, paymentData.payment_id);
      showToast('Simulación de pago enviada', NotificationType.INFO);
    } catch (error) {
      console.error('Error simulando pago:', error);
      showToast('Error simulando pago', NotificationType.ERROR);
    }
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
                generateQRPayment();
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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

  if (isGenerating) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Generando Código QR</h3>
          <p className="text-gray-600">Preparando tu pago con Deuna...</p>
        </div>
      </div>
    );
  }

  if (currentStatus === 'completed') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">¡Pago Completado!</h3>
          <p className="text-gray-600 mb-4">Tu pago ha sido procesado exitosamente</p>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-800 font-semibold">Monto: ${amount.toFixed(2)} USD</p>
            <p className="text-green-700">Cliente: {customerName}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Zap className="h-8 w-8 text-green-600 mr-2" />
          <h3 className="text-xl font-bold text-gray-900">Pagar con Deuna</h3>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between text-sm text-green-800">
            <span>Cliente: {customerName}</span>
            <span>Monto: ${amount.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center text-orange-600 mb-4">
          <Clock className="h-5 w-5 mr-2" />
          <span className="font-mono text-lg font-bold">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center mb-6">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 inline-block mb-4">
          {paymentData?.qr_code_base64 ? (
            <img
              src={paymentData.qr_code_base64}
              alt="Código QR de pago"
              className="w-48 h-48"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-500">Generando QR...</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Escanea el código QR con tu aplicación bancaria móvil
        </p>
      </div>

      {/* Action buttons */}
      {paymentData?.payment_url && (
        <div className="space-y-3 mb-6">
          <button
            onClick={() => copyToClipboard(paymentData.payment_url)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {copySuccess ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 mr-2" />
                Copiar Enlace de Pago
              </>
            )}
          </button>

          <button
            onClick={() => window.open(paymentData.payment_url, '_blank')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Smartphone className="h-5 w-5 mr-2" />
            Abrir en Móvil
          </button>
        </div>
      )}

      {/* Status indicator */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          {isPolling ? (
            <>
              <RefreshCw className="h-5 w-5 text-yellow-600 mr-3 animate-spin" />
              <div>
                <p className="font-semibold text-yellow-800">Esperando Pago</p>
                <p className="text-yellow-700 text-sm">Verifica tu app móvil para completar el pago</p>
              </div>
            </>
          ) : (
            <>
              <Clock className="h-5 w-5 text-yellow-600 mr-3" />
              <p className="font-semibold text-yellow-800">Pago Inactivo</p>
            </>
          )}
        </div>
      </div>

      {/* Development simulation button */}
      {process.env.NODE_ENV === 'development' && paymentData && isPolling && (
        <div className="mb-4">
          <button
            onClick={simulatePayment}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
          >
            <Zap className="h-4 w-4 mr-2" />
            🧪 Simular Pago (Dev)
          </button>
        </div>
      )}

      {/* Cancel button */}
      <div className="text-center">
        <button
          onClick={() => cancelPayment('Usuario canceló')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancelar Pago
        </button>
      </div>
    </div>
  );
};

export default ExternalDeunaPayment;