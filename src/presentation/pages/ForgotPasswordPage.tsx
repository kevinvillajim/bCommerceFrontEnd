import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../infrastructure/api/axiosConfig';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

/**
 * Página de recuperación de contraseña
 * Ofrece dos opciones: por correo electrónico o por token
 */
const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para ambos métodos
  const [method, setMethod] = useState<'email' | 'token'>('email');
  const [emailForReset, setEmailForReset] = useState('');
  const [emailForToken, setEmailForToken] = useState('');
  const [token, setToken] = useState('');
  const [tokenRequested, setTokenRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manejar la solicitud por correo electrónico
  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForReset.trim() || !/\S+@\S+\.\S+/.test(emailForReset)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_EMAIL, { email: emailForReset });
      
      if (response.data?.success || response.status === 200) {
        setSuccess(
          'Se ha enviado un correo electrónico con instrucciones para recuperar tu contraseña. ' +
          'Por favor revisa tu bandeja de entrada.'
        );
      } else {
        setError('No se pudo procesar la solicitud. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      console.error('Error al solicitar recuperación por email:', err);
      
      if (err.response?.status === 422) {
        setError('Correo electrónico inválido o no registrado');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al procesar la solicitud. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar la solicitud por token
  const handleTokenRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailForToken.trim() || !/\S+@\S+\.\S+/.test(emailForToken)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Solicitar un token de recuperación
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_TOKEN, { email: emailForToken });
      
      if (response.status === 200) {
        setSuccess('Se ha enviado un token de recuperación a los medios de contacto registrados.');
        setTokenRequested(true);
      } else {
        setError('No se pudo generar el token. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      console.error('Error al solicitar token:', err);
      
      if (err.response?.status === 422) {
        setError('Correo electrónico inválido o no registrado');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al procesar la solicitud. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar la verificación del token
  const handleTokenVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Por favor ingresa el token de recuperación');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Verificar el token antes de redireccionar
      const response = await axiosInstance.post(`${API_ENDPOINTS.AUTH.RESET_PASSWORD}/validate`, { 
        token,
        email: emailForToken 
      });
      
      if (response.status === 200) {
        setSuccess('Token válido. Serás redirigido para crear una nueva contraseña.');
        
        // Redirigir a la página de cambio de contraseña
        setTimeout(() => {
          navigate('/reset-password', { 
            state: { 
              token,
              email: emailForToken 
            } 
          });
        }, 2000);
      } else {
        setError('Token inválido o expirado. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      console.error('Error al validar token:', err);
      
      if (err.response?.status === 422) {
        setError('Token inválido o expirado');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al procesar la solicitud. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Recupera tu contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Elige el método que prefieras para recuperar tu acceso
          </p>
        </div>
        
        {/* Toggle de métodos */}
        <div className="flex border border-gray-200 rounded-md overflow-hidden">
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium ${
              method === 'email' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setMethod('email')}
          >
            Por correo electrónico
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium ${
              method === 'token' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setMethod('token')}
          >
            Por token
          </button>
        </div>
        
        {/* Mostrar mensajes de error/éxito */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
            {success}
          </div>
        )}
        
        {/* Formulario para método por email */}
        {method === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailReset}>
            <div>
              <label htmlFor="emailForReset" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="emailForReset"
                name="emailForReset"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={emailForReset}
                onChange={(e) => setEmailForReset(e.target.value)}
                placeholder="tu@email.com"
              />
              <p className="mt-2 text-sm text-gray-500">
                Te enviaremos un enlace a tu correo electrónico para que puedas crear una nueva contraseña.
              </p>
            </div>
            
            <div className="flex justify-between">
              <Link
                to="/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Volver al inicio de sesión
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : 'Enviar enlace'}
              </button>
            </div>
          </form>
        )}
        
        {/* Formulario para método por token */}
        {method === 'token' && (
          <>
            {!tokenRequested ? (
              // Paso 1: Formulario para solicitar el token
              <form className="mt-8 space-y-6" onSubmit={handleTokenRequest}>
                <div>
                  <label htmlFor="emailForToken" className="block text-sm font-medium text-gray-700">
                    Correo electrónico
                  </label>
                  <input
                    id="emailForToken"
                    name="emailForToken"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={emailForToken}
                    onChange={(e) => setEmailForToken(e.target.value)}
                    placeholder="tu@email.com"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Ingresa tu correo electrónico para recibir un token de recuperación en tus medios de contacto registrados.
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Volver al inicio de sesión
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Solicitando...
                      </span>
                    ) : 'Solicitar token'}
                  </button>
                </div>
              </form>
            ) : (
              // Paso 2: Formulario para ingresar el token recibido
              <form className="mt-8 space-y-6" onSubmit={handleTokenVerify}>
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                    Token de recuperación
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
                    placeholder="Ingresa el token recibido"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Ingresa el token de recuperación que has recibido en tus medios de contacto registrados.
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setTokenRequested(false)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Solicitar otro token
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </span>
                    ) : 'Verificar token'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;