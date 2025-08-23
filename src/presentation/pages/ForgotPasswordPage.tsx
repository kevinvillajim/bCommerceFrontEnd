import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../infrastructure/api/axiosConfig';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

/**
 * Página de recuperación de contraseña
 * Solo permite recuperación por correo electrónico
 */
const ForgotPasswordPage: React.FC = () => {
  // Estados para el método de email
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manejar la solicitud por correo electrónico
  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD_EMAIL, { email });
      
      // Verificar la respuesta correcta del backend
      if (response.data?.status === 'success' && response.data?.email_sent) {
        setSuccess(
          'Se ha enviado un correo electrónico con instrucciones para recuperar tu contraseña. ' +
          'Por favor revisa tu bandeja de entrada y carpeta de spam.'
        );
      } else if (response.data?.status === 'success') {
        // Email no enviado pero proceso exitoso (modo desarrollo)
        setSuccess(
          'Solicitud procesada correctamente. Si el correo existe en nuestro sistema, recibirás un enlace de restablecimiento.'
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No te preocupes, te ayudamos a recuperarla
          </p>
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
        
        {/* Formulario para solicitar reset por email */}
        <form className="mt-8 space-y-6" onSubmit={handleEmailReset}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
            <p className="mt-2 text-sm text-gray-500">
              Te enviaremos un enlace seguro para que puedas crear una nueva contraseña.
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
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>
        </form>

        {/* Enlaces adicionales */}
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-500">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;