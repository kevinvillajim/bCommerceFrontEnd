// src/presentation/components/checkout/QRPaymentForm.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import { DeunaService } from "../../../infrastructure/services/DeunaService";
import type { DeunaPaymentRequest } from "../../../infrastructure/services/DeunaTypes";
import { CheckCircle, XCircle, Clock, RefreshCw, Copy, ExternalLink, Smartphone } from "lucide-react";

interface QRPaymentFormProps {
  total?: number;
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
}

const QRPaymentForm: React.FC<QRPaymentFormProps> = ({
  total: totalProp,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { cart } = useCart();
  const { user } = useAuth();
  
  // States
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [isPolling, setIsPolling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Use prop total if provided, otherwise fallback to cart total
  const total = totalProp ?? cart?.total ?? 0;

  // Create order ID for payment
  const generateOrderId = useCallback(() => {
    return `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }, []);

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (paymentData && isPolling && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPolling(false);
            setError("El tiempo de pago ha expirado. Por favor, genera un nuevo código QR.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentData, isPolling, timeRemaining]);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle payment status changes during polling
  const handleStatusChange = useCallback((status: string) => {
    console.log('Payment status changed:', status);
    setCurrentStatus(status);
    
    const statusDisplay = DeunaService.getStatusDisplay(status);
    
    switch (status) {
      case 'completed':
        setIsPolling(false);
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentData);
        }
        break;
      case 'failed':
      case 'cancelled':
        setIsPolling(false);
        const errorMsg = `Pago ${statusDisplay.label.toLowerCase()}`;
        setError(errorMsg);
        if (onPaymentError) {
          onPaymentError(errorMsg);
        }
        break;
    }
  }, [paymentData, onPaymentSuccess, onPaymentError]);

  // Generate QR code for payment
  const generateQRPayment = async () => {
    if (!user || !cart?.items?.length) {
      setError("Información de usuario o carrito no disponible");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const orderId = generateOrderId();

      // Prepare payment request
      const paymentRequest: DeunaPaymentRequest = {
        order_id: orderId,
        amount: total,
        currency: 'USD',
        customer: {
          name: user.name || 'Cliente',
          email: user.email,
          phone: user.phone || undefined,
        },
        items: cart.items.map(item => ({
          name: item.product?.name || 'Producto',
          quantity: item.quantity,
          price: item.final_price || item.price || item.subtotal || 0,
          description: item.product?.description || undefined,
        })),
        qr_type: 'dynamic',
        format: '2', // QR + Payment Link
        metadata: {
          source: 'bcommerce_frontend',
          user_id: user.id,
          cart_id: cart.id,
          checkout_timestamp: new Date().toISOString(),
        }
      };

      console.log('Creating DeUna payment:', paymentRequest);

      // Create payment with DeUna
      const response = await DeunaService.createPayment(paymentRequest);
      
      console.log('DeUna API Response:', response);
      console.log('Response structure:', Object.keys(response));
      
      if (response.success) {
        console.log('Payment data from response:', response.data);
        console.log('QR code in response:', response.data?.qr_code_base64);
        setPaymentData(response.data);
        setCurrentStatus(response.data.status);
        setTimeRemaining(600); // Reset to 10 minutes
        
        // Start polling for status updates
        setIsPolling(true);
        
        // Start polling in background
        DeunaService.pollPaymentStatus(response.data.payment_id, {
          maxAttempts: 120, // 10 minutes
          interval: 5000, // 5 seconds
          onStatusChange: handleStatusChange
        }).catch(err => {
          console.error('Polling error:', err);
          if (isPolling) {
            setError('Error monitoreando el estado del pago');
          }
        });
        
      } else {
        throw new Error(response.message || 'Error creating payment');
      }

    } catch (error: any) {
      console.error('Error generating QR payment:', error);
      setError(error.message || 'Error al generar el código QR');
      if (onPaymentError) {
        onPaymentError(error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset payment process
  const resetPayment = () => {
    setPaymentData(null);
    setError("");
    setCurrentStatus("");
    setIsPolling(false);
    setTimeRemaining(600);
    setCopySuccess(false);
  };

  // Status indicator component
  const StatusIndicator = () => {
    if (!currentStatus) return null;
    
    const statusDisplay = DeunaService.getStatusDisplay(currentStatus);
    
    return (
      <div className={`flex items-center justify-center p-3 rounded-lg mb-4 ${
        statusDisplay.color === 'green' ? 'bg-green-50 text-green-700' :
        statusDisplay.color === 'red' ? 'bg-red-50 text-red-700' :
        statusDisplay.color === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
        'bg-blue-50 text-blue-700'
      }`}>
        <span className="mr-2">{statusDisplay.icon}</span>
        <span className="font-medium">{statusDisplay.label}</span>
        {isPolling && statusDisplay.color === 'yellow' && (
          <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
        )}
      </div>
    );
  };

  // If payment is generated, show QR code interface
  if (paymentData) {
    return (
      <div className="space-y-6">
        <StatusIndicator />
        
        {/* Timer */}
        {isPolling && (
          <div className="text-center">
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Tiempo restante para completar el pago
            </p>
          </div>
        )}

        {/* QR Code Display with DeUna Style */}
        {paymentData.qr_code_base64 ? (
          <div className="mb-4 mx-auto">
            <div className="bg-[#2fd8a8] p-6 rounded-lg text-white">
              {/* Logo de DeUna placeholder */}
              <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                <img
                  src="https://deuna.app/assets/img/brand/logo-deuna.svg"
                  alt="DeUna Logo"
                  className="w-20 h-20"
                />
              </div>

              <h3 className="text-xl font-bold mb-2">Pago con DeUna!</h3>
              <p className="text-purple-100 mb-4">
                Monto a pagar: {formatCurrency(paymentData.amount)}
              </p>

              <div className="bg-white rounded-lg p-4 mb-4">
                <img 
                  src={paymentData.qr_code_base64} 
                  alt="Código QR para pago" 
                  className="w-full h-auto max-w-64 mx-auto"
                />
              </div>

              <p className="text-purple-100 text-sm mb-4 flex items-center justify-center">
                <Smartphone className="w-4 h-4 mr-2" />
                Escanea con tu app de pagos favorita
              </p>

              <button
                onClick={resetPayment}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : null}

        {/* Payment Link */}
        {paymentData.payment_url && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={paymentData.payment_url}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyToClipboard(paymentData.payment_url)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copySuccess ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            
            <a
              href={paymentData.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#3f2b57] hover:bg-[#3f2b45] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir enlace de pago
            </a>
          </div>
        )}

        {/* Numeric Code */}
        {paymentData.numeric_code && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">Código numérico:</p>
            <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
              {paymentData.numeric_code}
            </p>
          </div>
        )}

        {/* Payment Amount */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            Monto a pagar: {formatCurrency(paymentData.amount)}
          </p>
          <p className="text-sm text-gray-500">
            ID de Pago: {paymentData.payment_id}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetPayment}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Generar Nuevo QR
          </button>
          
          {currentStatus === 'completed' && (
            <button
              onClick={() => onPaymentSuccess && onPaymentSuccess(paymentData)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continuar
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li><strong>1.</strong> Escanea el código QR con tu app de pagos</li>
            <li><strong>2.</strong> O usa el enlace de pago en tu dispositivo móvil</li>
            <li><strong>3.</strong> Completa el pago en la aplicación</li>
            <li><strong>4.</strong> Espera la confirmación automática</li>
          </ol>
        </div>
      </div>
    );
  }

  // Initial state - show generate button
  return (
    <div className="space-y-6">
      <p className="mb-4 text-center text-gray-600">
        Paga con DeUna!, Genera el código qr y escanealo desde tu app para pagar
        de forma rápida y segura.
      </p>

      {/* Información sobre DeUna */}
      <div className="bg-[#2fd8a8] border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-center mb-4">
          <img
            src="https://deuna.app/assets/img/brand/logo-deuna.svg"
            alt="DeUna Logo"
            className="w-50 h-50"
          />
        </div>
      </div>

      {/* Generate Payment Button */}
      <button
        type="button"
        onClick={generateQRPayment}
        disabled={isGenerating || !user || !cart?.items?.length}
        className="w-full bg-[#3f2b57] hover:bg-[#342843] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-101 disabled:transform-none flex items-center justify-center"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Generando código QR...
          </>
        ) : (
          `Pagar con DeUna! - ${formatCurrency(total)}`
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-center text-gray-500">
        <p>
          <strong>1.</strong> Haz clic en "Pagar con DeUna!"
        </p>
        <p>
          <strong>2.</strong> Completa el pago con el QR
        </p>
        <p>
          <strong>3.</strong> Confirma tu compra al finalizar.
        </p>
      </div>
    </div>
  );
};

export default QRPaymentForm;