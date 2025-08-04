import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ConfigurationService from '../../core/services/ConfigurationService';

/**
 * Página de verificación de email
 * Se accede con un token desde el email o manualmente
 */
const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  
  // Obtener token de la URL
  const queryParams = new URLSearchParams(location.search);
  const tokenFromQuery = queryParams.get('token');
  
  // Obtener mensaje del state de navegación
  const messageFromState = location.state?.message;
  const emailFromState = location.state?.email;
  
  // Estados
  const [token, setToken] = useState(tokenFromQuery || '');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'error'>('pending');

  // Verificar automáticamente si hay token en la URL
  useEffect(() => {
    if (tokenFromQuery) {
      handleVerifyToken(tokenFromQuery);
    }
  }, [tokenFromQuery]);

  // Verificar estado del usuario
  useEffect(() => {
    if (user && user.email_verified_at) {
      setVerificationStatus('verified');
      setSuccess('Tu email ya está verificado correctamente.');
    }
  }, [user]);

  // Función para verificar el token
  const handleVerifyToken = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) {
      setError('Por favor ingresa un token de verificación válido');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const configService = new ConfigurationService();
      const result = await configService.sendCustomEmail({
        user_id: 0, // Not used for verification
        subject: '', // Not used for verification  
        message: '', // Not used for verification
      });

      // Since we don't have a direct verify method in ConfigurationService,
      // we'll need to make a direct API call here
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}/email-verification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setVerificationStatus('verified');
        setSuccess('¡Email verificado correctamente! Tu cuenta está ahora activa.');
        
        // Refrescar información del usuario
        if (refreshUser) {
          await refreshUser();
        }
        
        // Redirigir después de un momento
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else if (data.status === 'already_verified') {
        setVerificationStatus('verified');
        setSuccess('Tu email ya estaba verificado anteriormente.');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setVerificationStatus('error');
        setError(data.message || 'Token inválido o expirado');
      }
    } catch (err: any) {
      console.error('Error al verificar email:', err);
      setVerificationStatus('error');
      setError('Error al procesar la verificación. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para reenviar email de verificación
  const handleResendVerification = async () => {
    const emailToUse = user?.email || emailFromState;
    if (!emailToUse) {
      setError('No se pudo determinar tu email. Intenta iniciar sesión nuevamente.');
      return;
    }

    setResendLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}/email-verification/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setSuccess('Email de verificación reenviado correctamente. Revisa tu bandeja de entrada.');
      } else if (data.status === 'already_verified') {
        setVerificationStatus('verified');
        setSuccess('Tu email ya está verificado.');
        setTimeout(() => navigate('/'), 2000);
      } else if (data.status === 'rate_limited') {
        setError(data.message || 'Debes esperar antes de solicitar otro email.');
      } else {
        setError(data.message || 'Error al reenviar el email de verificación.');
      }
    } catch (err: any) {
      console.error('Error al reenviar verificación:', err);
      setError('Error al procesar la solicitud. Inténtalo de nuevo.');
    } finally {
      setResendLoading(false);
    }
  };

  // Manejar envío manual del token
  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyToken(token);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
            {verificationStatus === 'verified' ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : verificationStatus === 'error' ? (
              <AlertCircle className="h-6 w-6 text-red-500" />
            ) : (
              <Mail className="h-6 w-6 text-primary-600" />
            )}
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900">
            {verificationStatus === 'verified' ? '¡Email Verificado!' : 'Verificar Email'}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {verificationStatus === 'verified' 
              ? 'Tu cuenta está ahora completamente activa'
              : 'Por favor verifica tu dirección de correo electrónico'
            }
          </p>
        </div>

        {/* Mensaje inicial desde el registro */}
        {messageFromState && !error && !success && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              <span>{messageFromState}</span>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Formulario de verificación manual */}
        {verificationStatus !== 'verified' && !tokenFromQuery && (
          <form className="mt-8 space-y-6" onSubmit={handleManualVerify}>
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                Token de Verificación
              </label>
              <input
                id="token"
                name="token"
                type="text"
                autoComplete="off"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ingresa el token de verificación"
              />
              <p className="mt-2 text-sm text-gray-500">
                Ingresa el token que recibiste en tu correo electrónico.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Verificando...
                </div>
              ) : (
                'Verificar Email'
              )}
            </button>
          </form>
        )}

        {/* Opciones adicionales */}
        {verificationStatus !== 'verified' && (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                ¿No recibiste el email de verificación?
              </p>
              
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="-ml-1 mr-2 h-4 w-4" />
                    Reenviar Email
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <Link
                to="/"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}

        {/* Verificación completada */}
        {verificationStatus === 'verified' && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Serás redirigido automáticamente en unos segundos...
            </p>
            
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Ir al inicio ahora
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;