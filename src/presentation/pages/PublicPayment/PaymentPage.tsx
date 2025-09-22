import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, User, FileText, Calendar, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { ApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { useToast } from '../../components/UniversalToast';
import { NotificationType } from '../../types/NotificationTypes';
import DatafastExternalWidget from '../../components/external/DatafastExternalWidget';
import ExternalDeunaPayment from '../../components/external/ExternalDeunaPayment';

interface PaymentLinkData {
  link_code: string;
  customer_name: string;
  amount: number;
  description: string | null;
  expires_at: string;
  status: string;
}

interface CustomerData {
  given_name: string;
  surname: string;
  identification: string;
  middle_name?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
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
  const [showDatafastWidget, setShowDatafastWidget] = useState(false);
  const [showDeunaQR, setShowDeunaQR] = useState(false);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    given_name: '',
    surname: '',
    identification: '',
    middle_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });
  const [formValid, setFormValid] = useState(false);

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
      }>(API_ENDPOINTS.EXTERNAL_PAYMENT.PUBLIC.SHOW(linkCode!));

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

  const validateForm = () => {
    const { given_name, surname, identification, email, phone, address, city } = customerData;
    const isValid = given_name.trim() !== '' &&
                   surname.trim() !== '' &&
                   identification.trim() !== '' &&
                   /^\d{10}$/.test(identification) &&
                   email.trim() !== '' &&
                   phone.trim() !== '' &&
                   address.trim() !== '' &&
                   city.trim() !== '' &&
                   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setFormValid(isValid);
    return isValid;
  };

  const handleCustomerDataChange = (field: keyof CustomerData, value: string) => {
    const newData = { ...customerData, [field]: value };
    setCustomerData(newData);
    // Validar después de cada cambio
    setTimeout(() => {
      const { given_name, surname, identification, email, phone, address, city } = newData;
      const isValid = given_name.trim() !== '' &&
                     surname.trim() !== '' &&
                     identification.trim() !== '' &&
                     /^\d{10}$/.test(identification) &&
                     email.trim() !== '' &&
                     phone.trim() !== '' &&
                     address.trim() !== '' &&
                     city.trim() !== '' &&
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setFormValid(isValid);
    }, 100);
  };

  const initiatePayment = async (method: 'datafast' | 'deuna') => {
    if (!linkData || !linkCode) return;

    if (!validateForm()) {
      showToast(NotificationType.ERROR, 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setProcessingPayment(true);

      const endpoint = method === 'datafast'
        ? API_ENDPOINTS.EXTERNAL_PAYMENT.PUBLIC.DATAFAST(linkCode)
        : API_ENDPOINTS.EXTERNAL_PAYMENT.PUBLIC.DEUNA(linkCode);

      const response = await ApiClient.post<{
        success: boolean;
        message?: string;
        data?: {
          checkout_id?: string;
          redirect_url?: string;
          widget_url?: string;
          order_id?: string;
          checkout_url?: string;
          payment_method: string;
        };
      }>(endpoint, customerData);

      if (response.success && response.data) {
        // ✅ CRITICAL FIX: Guardar transaction_id interno para verificación posterior
        const transactionId = response.data.checkout_id || response.data.order_id || `external_${linkCode}_${Date.now()}`;
        localStorage.setItem('datafast_transaction_id', transactionId);
        console.log('🔧 Transaction ID guardado para external payment:', transactionId);

        if (method === 'datafast') {
          // Show embedded Datafast widget
          const widgetUrl = response.data.widget_url || response.data.redirect_url;
          if (widgetUrl) {
            setWidgetUrl(widgetUrl);
            setShowDatafastWidget(true);
          } else {
            showToast(NotificationType.ERROR, 'Error: No se recibió URL del widget');
          }
        } else {
          // Show embedded Deuna QR
          setShowDeunaQR(true);
        }
      } else {
        showToast(NotificationType.ERROR, response.message || 'Error iniciando el pago');
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

  const handlePaymentSuccess = (data: any) => {
    console.log('✅ Pago completado:', data);
    showToast(NotificationType.SUCCESS, '¡Pago procesado exitosamente!');
    // Could redirect to success page or show success message
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Error en pago:', error);
    showToast(NotificationType.ERROR, `Error: ${error}`);
    setShowDatafastWidget(false);
    setShowDeunaQR(false);
  };

  const handlePaymentCancel = () => {
    setShowDatafastWidget(false);
    setShowDeunaQR(false);
    showToast(NotificationType.INFO, 'Pago cancelado');
  };

  if (!linkData) return null;

  const expired = isExpired(linkData.expires_at);

  // Show embedded widgets
  if (showDatafastWidget && widgetUrl) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <DatafastExternalWidget
            widgetUrl={widgetUrl}
            amount={linkData.amount}
            customerName={linkData.customer_name}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  if (showDeunaQR) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <ExternalDeunaPayment
            linkCode={linkCode!}
            amount={linkData.amount}
            customerName={linkData.customer_name}
            customerData={customerData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

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
            {/* Formulario de datos del cliente */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tus Datos</h3>
              <p className="text-gray-600 mb-6">Por favor completa los siguientes datos para procesar tu pago de forma segura.</p>

              <div className="space-y-4">
                {/* Nombres */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="given_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="given_name"
                      required
                      value={customerData.given_name}
                      onChange={(e) => handleCustomerDataChange('given_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Juan"
                    />
                  </div>

                  <div>
                    <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="surname"
                      required
                      value={customerData.surname}
                      onChange={(e) => handleCustomerDataChange('surname', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                {/* Segundo nombre (opcional) */}
                <div>
                  <label htmlFor="middle_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Segundo Nombre (opcional)
                  </label>
                  <input
                    type="text"
                    id="middle_name"
                    value={customerData.middle_name || ''}
                    onChange={(e) => handleCustomerDataChange('middle_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Carlos"
                  />
                </div>

                {/* Cédula */}
                <div>
                  <label htmlFor="identification" className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula * (10 dígitos)
                  </label>
                  <input
                    type="text"
                    id="identification"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={customerData.identification}
                    onChange={(e) => handleCustomerDataChange('identification', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1234567890"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa tu número de cédula de 10 dígitos
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={customerData.email}
                      onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      pattern="[0-9+\s()-]+"
                      value={customerData.phone}
                      onChange={(e) => handleCustomerDataChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0987654321"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    id="address"
                    required
                    value={customerData.address}
                    onChange={(e) => handleCustomerDataChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Av. Principal 123, Sector Norte"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={customerData.city}
                      onChange={(e) => handleCustomerDataChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Quito"
                    />
                  </div>

                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal (opcional)
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      pattern="[0-9A-Za-z\-\s]+"
                      value={customerData.postal_code}
                      onChange={(e) => handleCustomerDataChange('postal_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="170135"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de pago */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona tu método de pago</h3>

              {!formValid && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-3" />
                    <p className="text-amber-800 text-sm">
                      Por favor completa todos los campos de datos personales para habilitar los métodos de pago.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Datafast */}
                <button
                  onClick={() => initiatePayment('datafast')}
                  disabled={processingPayment || !formValid}
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
                  disabled={processingPayment || !formValid}
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