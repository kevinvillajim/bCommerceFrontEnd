import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader, ArrowRight, Mail } from 'lucide-react';

/**
 * Página de éxito de verificación de email
 * Se accede cuando el usuario hace clic en el link del email
 */
const EmailVerificationSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'already_verified'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // El backend ya procesó la verificación y redirigió aquí con un parámetro status
    const statusParam = searchParams.get('status');
    
    if (statusParam === 'success') {
      setStatus('success');
      setMessage('¡Tu registro fue exitoso! Tu cuenta ha sido verificada y ya está activa.');
    } else if (statusParam === 'already_verified') {
      setStatus('already_verified');
      setMessage('Tu email ya estaba verificado. Tu cuenta está activa y lista para usar.');
    } else {
      // Si no hay parámetro de status, es un error
      setStatus('error');
      setMessage('Link de verificación inválido o ha ocurrido un error.');
    }
  }, [searchParams]);

  // Auto-redirect después de verificación exitosa
  useEffect(() => {
    if (status === 'success' || status === 'already_verified') {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader className="h-12 w-12 text-primary-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'already_verified':
        return <CheckCircle className="h-12 w-12 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verificando tu email...';
      case 'success':
        return '¡Bienvenido a BCommerce!';
      case 'already_verified':
        return '¡Bienvenido de vuelta!';
      case 'error':
        return 'Error de verificación';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50';
      case 'already_verified':
        return 'bg-blue-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-primary-50';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Card principal */}
        <div className={`${getBackgroundColor()} p-8 rounded-lg shadow-lg border`}>
          {/* Icono */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-sm mb-4">
              {getIcon()}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h1>
            
            {message && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Contenido específico por estado */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <Mail className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 font-medium">
                    Tu registro fue completado exitosamente
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ya puedes explorar y comprar en nuestra plataforma
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Serás redirigido al inicio en 5 segundos...
                </p>
              </div>
            </div>
          )}

          {(status === 'success' || status === 'already_verified') && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Ir al Inicio
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center px-4 py-2 border border-primary-300 rounded-lg text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Registrarse Nuevamente
                </button>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Ir al Login
                </button>
              </div>
            </div>
          )}

          {status === 'verifying' && (
            <div className="mt-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="h-4 w-4 text-primary-600 animate-spin" />
                  <span className="text-sm text-gray-600">Procesando verificación...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            ¿Necesitas ayuda? {' '}
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

export default EmailVerificationSuccessPage;