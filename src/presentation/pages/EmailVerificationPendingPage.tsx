import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, RefreshCw, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Página que se muestra después del registro para informar sobre la verificación de email pendiente
 */
const EmailVerificationPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Obtener email del state de navegación
  const userEmail = (location.state as any)?.email;

  // Función para reenviar email de verificación
  const handleResendVerification = async () => {
    if (!userEmail) {
      setResendMessage({type: 'error', text: 'No se pudo determinar tu email. Por favor, intenta registrarte nuevamente.'});
      return;
    }

    setResendLoading(true);
    setResendMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}/email-verification/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setResendMessage({type: 'success', text: 'Email de verificación reenviado correctamente. Revisa tu bandeja de entrada.'});
      } else if (data.status === 'rate_limited') {
        setResendMessage({type: 'error', text: data.message || 'Debes esperar antes de solicitar otro email.'});
      } else {
        setResendMessage({type: 'error', text: data.message || 'Error al reenviar el email de verificación.'});
      }
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
      setResendMessage({type: 'error', text: 'Error al procesar la solicitud. Inténtalo de nuevo.'});
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full space-y-6">
        {/* Card principal */}
        <div className="bg-white p-8 rounded-lg shadow-lg border">
          {/* Icono */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifica tu correo electrónico
            </h1>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              Hemos enviado un enlace de verificación a tu correo electrónico
            </p>
          </div>

          {/* Información del email */}
          {userEmail && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email enviado a:</p>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Instrucciones */}
          <div className="space-y-4 mb-6">
            <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
              <h3 className="text-sm font-medium text-primary-900 mb-2">Pasos a seguir:</h3>
              <ol className="text-sm text-primary-800 space-y-1">
                <li className="flex items-start">
                  <span className=" w-5 h-5 bg-primary-200 text-primary-800 rounded-full text-xs font-bold flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                  Revisa tu bandeja de entrada
                </li>
                <li className="flex items-start">
                  <span className=" w-5 h-5 bg-primary-200 text-primary-800 rounded-full text-xs font-bold flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                  Busca un email de Comersia
                </li>
                <li className="flex items-start">
                  <span className=" w-5 h-5 bg-primary-200 text-primary-800 rounded-full text-xs font-bold flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                  Haz clic en el enlace de verificación
                </li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Nota:</strong> Si no encuentras el email, revisa tu carpeta de spam o correo no deseado.
              </p>
            </div>
          </div>

          {/* Mensaje de reenvío */}
          {resendMessage && (
            <div className={`p-4 rounded-lg border mb-4 ${
              resendMessage.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                {resendMessage.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span className="text-sm">{resendMessage.text}</span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Reenviando...
                </>
              ) : (
                <>
                  <Mail className="-ml-1 mr-2 h-4 w-4" />
                  Reenviar email de verificación
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Continuar al inicio de sesión
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            ¿Problemas con la verificación? {' '}
            <button 
              onClick={() => navigate('/contact')}
              className="text-primary-600 hover:text-primary-500 underline"
            >
              Contáctanos
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPendingPage;