// src/presentation/components/checkout/QRPaymentForm.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import { DeunaService } from "../../../infrastructure/services/DeunaService";
import type { DeunaPaymentRequest } from "../../../infrastructure/services/DeunaTypes";
import type { CheckoutData } from "../../../types/checkout";
import { CheckCircle, XCircle, Clock, RefreshCw, Copy, ExternalLink, Smartphone, Zap } from "lucide-react";

interface QRPaymentFormProps {
  total?: number;
  checkoutData?: CheckoutData; // ✅ NUEVO: Objeto temporal con datos validados
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
}

const QRPaymentForm: React.FC<QRPaymentFormProps> = ({
  total: totalProp,
  checkoutData,
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
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  
  // 🚨 CRITICAL FIX: References for cleanup - prevent memory leaks
  const pollingRef = React.useRef<any>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const cleanupRefs = React.useRef<(() => void)[]>([]);

  // ✅ VALIDACIÓN ESTRICTA - NO FALLBACKS
  if (!checkoutData || !checkoutData.totals) {
    throw new Error("QRPaymentForm requiere CheckoutData válido con totales");
  }
  if (!checkoutData.totals.final_total || checkoutData.totals.final_total <= 0) {
    throw new Error("QRPaymentForm requiere total válido mayor a $0");
  }

  const total = checkoutData.totals.final_total;

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

  // 🚨 CRITICAL FIX: Timer countdown effect with complete cleanup
  useEffect(() => {
    if (paymentData && isPolling && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPolling(false);
            setError("El tiempo de pago ha expirado. El pago ha sido cancelado automáticamente.");
            
            // Automatically cancel the payment when timer reaches 0
            if (paymentData?.payment_id) {
              console.log('⏰ Timer expired - automatically cancelling payment:', paymentData.payment_id);
              
              // Cancel the payment immediately (don't wait for async)
              DeunaService.cancelPayment(paymentData.payment_id, 'Timer expired - automatic cancellation')
                .then(() => {
                  console.log('✅ Payment automatically cancelled due to timer expiration');
                  setCurrentStatus('cancelled');
                  
                  // Stop any active polling
                  if (pollingRef.current?.cancel) {
                    pollingRef.current.cancel();
                    pollingRef.current = null;
                  }
                })
                .catch((error) => {
                  console.error('❌ Error automatically cancelling expired payment:', error);
                  // Still set as cancelled in UI even if API call fails
                  setCurrentStatus('cancelled');
                });
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 🚨 CRITICAL FIX: Store timer reference for cleanup
      timerRef.current = interval;
      
      // Add to cleanup refs
      cleanupRefs.current.push(() => {
        if (interval) {
          clearInterval(interval);
        }
      });
    }

    // 🚨 CRITICAL FIX: Complete cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paymentData, isPolling, timeRemaining]);

  // 🚨 CRITICAL FIX: Component unmount cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('🚨 QRPaymentForm: Component unmounting, executing critical cleanup');
      resetPayment();
    };
  }, []); // Empty dependency array - only run on unmount

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
        console.log('✅ Payment completed successfully, processing REAL payment completion');
        
        // ✅ CORRECTED: Process real payment completion using the proper real flow
        const processPayment = async () => {
          try {
            if (paymentData) {
              console.log('🎯 Processing REAL QR payment completion through actual webhook flow');
              console.log('📋 This will trigger: webhook → HandleDeunaWebhookUseCase → createOrderFromPayment() → order + invoice + SRI');
              
              // Use the REAL payment completion flow (NOT simulation)
              const result = await DeunaService.processRealPaymentCompletion(
                paymentData.payment_id,
                paymentData.amount,
                user?.email
              );
              
              if (result.success) {
                console.log('✅ Order created successfully from REAL QR payment:', result);
                console.log('🏆 Real payment processed with complete flow: order + invoice + SRI generation');
              }
            }
            
            // Notify parent component about success
            if (onPaymentSuccess) {
              onPaymentSuccess({
                ...paymentData,
                status: 'completed',
                completed_at: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('Error processing completed payment:', error);
            // Still notify success since payment was completed
            if (onPaymentSuccess) {
              onPaymentSuccess({
                ...paymentData,
                status: 'completed',
                completed_at: new Date().toISOString()
              });
            }
          }
        };
        
        processPayment();
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

  // ✅ NUEVO: Generate QR code usando CheckoutData validado
  const generateQRPayment = async () => {
    // ✅ VALIDACIÓN ESTRICTA: Requerir CheckoutData
    if (!checkoutData) {
      setError("No se puede generar QR sin datos de checkout validados");
      return;
    }

    if (!user) {
      setError("Información de usuario no disponible");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const orderId = generateOrderId();

      // ✅ USAR DATOS DEL CHECKOUTDATA VALIDADO
      console.log('🎯 USANDO CHECKOUTDATA PARA QR DEUNA:', {
        sessionId: checkoutData.sessionId,
        userId: checkoutData.userId,
        total: checkoutData.totals.final_total,
        itemsCount: checkoutData.items.length,
        validatedAt: checkoutData.validatedAt
      });

      // ✅ PREPARAR REQUEST USANDO SOLO DATOS VALIDADOS
      const paymentRequest: DeunaPaymentRequest = {
        order_id: orderId,
        amount: checkoutData.totals.final_total,
        currency: 'USD',
        customer: {
          name: checkoutData.shippingData.name,
          email: checkoutData.shippingData.email,
          phone: checkoutData.shippingData.phone,
        },
        items: checkoutData.items.map((item, index) => {
          // ✅ DATOS YA VALIDADOS - NO NECESITA VERIFICACIÓN ADICIONAL
          const mappedItem = {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            description: item.name, // Usar name como descripción
            product_id: item.product_id,
          };

          console.log(`✅ ITEM ${index} FROM CHECKOUTDATA:`, {
            product_id: mappedItem.product_id,
            name: mappedItem.name,
            quantity: mappedItem.quantity,
            price: mappedItem.price,
          });

          return mappedItem;
        }),
        qr_type: 'dynamic',
        format: '2', // QR + Payment Link
        metadata: {
          source: 'bcommerce_checkout_validated',
          user_id: user.id,
          session_id: checkoutData.sessionId,
          validated_at: checkoutData.validatedAt,
          checkout_timestamp: new Date().toISOString(),
        },
        // ✅ NUEVOS CAMPOS PARA CHECKOUTDATA TEMPORAL
        session_id: checkoutData.sessionId,
        validated_at: checkoutData.validatedAt,
        checkout_data: checkoutData, // Enviar objeto completo para validación en backend
      };

      // Debug: Log final payment request
      console.log('🚀 FINAL PAYMENT REQUEST TO SEND:', {
        order_id: paymentRequest.order_id,
        amount: paymentRequest.amount,
        items_count: paymentRequest.items?.length || 0,
        items: paymentRequest.items,
        first_item_keys: paymentRequest.items && paymentRequest.items.length > 0 ? Object.keys(paymentRequest.items[0]) : 'no_items'
      });

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
        
        // Start polling in background (now cancelable) - 🔧 FIXED: Reduced frequency to avoid rate limiting
        const polling = DeunaService.pollPaymentStatus(response.data.payment_id, {
          maxAttempts: 40, // 10 minutes (40 attempts × 15s = 10 minutes)  
          interval: 15000, // 15 seconds (reduced from 5s to avoid rate limiting)
          onStatusChange: handleStatusChange
        });

        pollingRef.current = polling;

        polling.promise.catch(err => {
          if (err.message === 'Payment polling was cancelled') {
            console.log('DeunaService: Polling cancelled successfully');
          } else {
            console.error('Polling error:', err);
            if (isPolling) {
              setError('Error monitoreando el estado del pago');
            }
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

  // 🚨 CRITICAL FIX: Complete reset with all cleanup
  const resetPayment = () => {
    // Cancel active polling
    if (pollingRef.current?.cancel) {
      pollingRef.current.cancel();
      pollingRef.current = null;
    }
    
    // 🚨 CRITICAL FIX: Clear timer to prevent memory leak
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // 🚨 CRITICAL FIX: Execute all cleanup functions
    cleanupRefs.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    cleanupRefs.current = [];
    
    setPaymentData(null);
    setError("");
    setCurrentStatus("");
    setIsPolling(false);
    setTimeRemaining(600);
    setCopySuccess(false);
    
    console.log('🧹 QRPaymentForm: Complete cleanup executed');
  };

  // Cancel payment
  const handleCancelPayment = async () => {
    if (!paymentData?.payment_id || currentStatus === 'completed') {
      resetPayment();
      return;
    }

    if (!isPolling) {
      resetPayment();
      return;
    }

    try {
      console.log('Cancelling payment:', paymentData.payment_id);
      
      // Stop polling first (cancel the polling Promise)
      if (pollingRef.current?.cancel) {
        pollingRef.current.cancel();
        pollingRef.current = null;
      }
      setIsPolling(false);
      
      // Cancel payment via API
      await DeunaService.cancelPayment(paymentData.payment_id, 'Cancelled by user');
      
      // Update UI
      setCurrentStatus('cancelled');
      setError('Pago cancelado por el usuario');
      
      console.log('Payment successfully cancelled by user');
      
    } catch (error: any) {
      console.error('Error cancelling payment:', error);
      setError('Error al cancelar el pago: ' + error.message);
      setIsPolling(false);
    }
  };

  // Handle generating new QR (cancels current payment first if active)
  const handleNewQR = async () => {
    try {
      setIsGenerating(true);
      setError("");

      // If there's an active payment being polled, cancel it first
      if (paymentData?.payment_id && isPolling && !['completed', 'cancelled', 'failed'].includes(currentStatus)) {
        try {
          console.log('Cancelling current payment before generating new QR:', paymentData.payment_id);
          
          // Stop polling
          if (pollingRef.current?.cancel) {
            pollingRef.current.cancel();
            pollingRef.current = null;
          }
          setIsPolling(false);
          
          // Cancel current payment
          await DeunaService.cancelPayment(paymentData.payment_id, 'Cancelled to generate new QR');
          
          console.log('Current payment cancelled successfully');
          
        } catch (error: any) {
          console.error('Error cancelling current payment:', error);
          // Continue with new payment generation even if cancel fails
        }
      }

      // Generate new payment (reuse existing logic)
      await generateQRPayment();

    } catch (error: any) {
      console.error('Error generating new QR:', error);
      setError('Error al generar nuevo código QR: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Simulate payment success (for testing only)
  const handleSimulatePayment = async () => {
    // ✅ VALIDACIÓN ESTRICTA - NO FALLBACKS
    if (!paymentData?.payment_id) {
      setError("No hay un pago activo para simular");
      return;
    }

    if (!paymentData?.amount || paymentData.amount <= 0) {
      setError("Monto del pago inválido o faltante");
      return;
    }

    if (!user?.email) {
      setError("Email del usuario requerido para la simulación");
      return;
    }

    setIsSimulating(true);
    setError("");

    try {
      console.log('🧪 SIMULATING payment success for testing purposes');
      console.log('📋 This will trigger: simulation webhook → HandleDeunaWebhookUseCase → createOrderFromPayment() → order + invoice + SRI');

      // ✅ STRICT CALL: All parameters required - NO FALLBACKS
      const result = await DeunaService.simulatePaymentSuccess(
        paymentData.payment_id,
        paymentData.amount,
        user.email,
        user.name || undefined,
        checkoutData?.sessionId // ✅ PASAR SESSION_ID REAL PARA RECUPERAR CHECKOUTDATA
      );

      if (result.success) {
        console.log('✅ Payment simulation successful:', result);
        
        // Update status to completed
        setCurrentStatus('completed');
        setIsPolling(false);
        
        // Stop any active polling
        if (pollingRef.current?.cancel) {
          pollingRef.current.cancel();
          pollingRef.current = null;
        }
        
        // Trigger success callback
        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...paymentData,
            status: 'completed',
            completed_at: new Date().toISOString(),
            simulated: true
          });
        }
        
      } else {
        throw new Error(result.message || 'Simulation failed');
      }

    } catch (error: any) {
      console.error('❌ Error simulating payment:', error);
      setError('Error simulando el pago: ' + error.message);
    } finally {
      setIsSimulating(false);
    }
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
        {paymentData.qr_code_base64 && !['cancelled', 'failed'].includes(currentStatus) ? (
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

              <h3 className="text-xl font-bold mb-2">Pago con Deuna</h3>
              <p className="text-purple-100 mb-4">
                Monto a pagar: {formatCurrency(total)}
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
                Escanea con tu app Deuna
              </p>

              <button
                onClick={handleCancelPayment}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={!isPolling || currentStatus === 'completed'}
              >
                {isPolling ? 'Cancelar Pago' : 'Cerrar'}
              </button>
            </div>
          </div>
        ) : (
          // Show message when payment is cancelled or failed
          ['cancelled', 'failed'].includes(currentStatus) && (
            <div className="mb-4 mx-auto">
              <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-lg text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-gray-500" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  {currentStatus === 'cancelled' ? 'Pago Cancelado' : 'Pago Fallido'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {currentStatus === 'cancelled' 
                    ? 'El pago fue cancelado. Puedes generar un nuevo código QR.' 
                    : 'El pago falló. Puedes intentar generar un nuevo código QR.'
                  }
                </p>
              </div>
            </div>
          )
        )}

        {/* Payment Link */}
        {paymentData.payment_url && !['cancelled', 'failed'].includes(currentStatus) && (
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
        {paymentData.numeric_code && !['cancelled', 'failed'].includes(currentStatus) && (
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
            Monto a pagar: {formatCurrency(total)}
          </p>
          <p className="text-sm text-gray-500">
            ID de Pago: {paymentData.payment_id}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleNewQR}
            disabled={isGenerating}
            className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              'Generar Nuevo QR'
            )}
          </button>

          {/* Simulation Button - Only show in development and when payment is active */}
          {DeunaService.isDevelopmentMode() && isPolling && !['completed', 'cancelled', 'failed'].includes(currentStatus) && (
            <button
              onClick={handleSimulatePayment}
              disabled={isSimulating}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  🧪 Simular Pago
                </>
              )}
            </button>
          )}
          
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
          
          {/* Development Note */}
          {DeunaService.isDevelopmentMode() && isPolling && (
            <div className="mt-3 pt-3 border-t border-blue-300">
              <p className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
                🧪 <strong>Modo de desarrollo:</strong> Puedes usar el botón "Simular Pago" para testear el flujo completo sin necesidad de realizar un pago real.
              </p>
            </div>
          )}
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