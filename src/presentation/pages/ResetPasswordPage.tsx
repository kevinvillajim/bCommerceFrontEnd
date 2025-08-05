import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../../infrastructure/api/axiosConfig';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { useAuth } from '../hooks/useAuth';
import { AuthService } from '../../core/services/AuthService';

/**
 * Página de restablecimiento de contraseña
 * Se accede después de validar el token de recuperación o hacer clic en el enlace del correo
 */
const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Obtener parámetros de la URL y el estado
  const queryParams = new URLSearchParams(location.search);
  const tokenFromQuery = queryParams.get('token');
  const emailFromQuery = queryParams.get('email');
  
  // Obtener datos del estado de navegación (desde ForgotPasswordPage)
  const tokenFromState = location.state?.token;
  const emailFromState = location.state?.email;
  
  // Establecer los valores iniciales
  const [token, setToken] = useState(tokenFromQuery || tokenFromState || '');
  const [email, setEmail] = useState(emailFromQuery || emailFromState || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordRules, setPasswordRules] = useState({
    minLength: 8,
    requireSpecial: true,
    requireUppercase: true,
    requireNumbers: true,
    validationMessage: '',
    requirements: [] as string[]
  });
  
  // Cargar reglas de validación de contraseñas
  useEffect(() => {
    const authService = new AuthService();
    authService.getPasswordValidationRules().then(rules => {
      setPasswordRules(rules);
    }).catch(err => {
      console.error('Error loading password rules:', err);
    });
  }, []);

  // Validar token al cargar la página
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setError(!token 
          ? 'No se proporcionó un token válido para restablecer la contraseña'
          : 'Es necesario proporcionar un correo electrónico para restablecer la contraseña'
        );
        return;
      }

      try {
        const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VALIDATE_RESET_TOKEN, {
          token,
          email
        });

        if (response.data?.status !== 'success' || !response.data?.valid) {
          setError('El enlace de restablecimiento ha expirado o es inválido. Por favor, solicita un nuevo enlace.');
        }
      } catch (err: any) {
        console.error('Error validating token:', err);
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('El enlace de restablecimiento ha expirado o es inválido. Por favor, solicita un nuevo enlace.');
        }
      }
    };

    validateToken();
  }, [token, email]);
  
  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones dinámicas de contraseña
    if (password.length < passwordRules.minLength) {
      setError(`La contraseña debe tener al menos ${passwordRules.minLength} caracteres`);
      return;
    }

    if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
      setError('La contraseña debe incluir al menos una letra mayúscula');
      return; 
    }

    if (passwordRules.requireNumbers && !/[0-9]/.test(password)) {
      setError('La contraseña debe incluir al menos un número');
      return;
    }

    if (passwordRules.requireSpecial && !/[!@#$%^&*]/.test(password)) {
      setError('La contraseña debe incluir al menos un carácter especial (!@#$%^&*)');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Enviar solicitud para restablecer la contraseña
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        email,
        password,
        password_confirmation: confirmPassword
      });
      
      // Verificar si la solicitud fue exitosa
      if (response.data?.status === 'success') {
        setSuccess('Contraseña actualizada correctamente. Serás redirigido para iniciar sesión.');
        
        // Si la API devuelve un token de autenticación, iniciar sesión automáticamente
        if (response.data?.token || response.data?.auth_token) {
          // Iniciar sesión automáticamente si es posible
          const credentials = { email, password };
          const loginResult = await login(credentials);
          
          if (loginResult) {
            // Si el login fue exitoso, redirigir a la página principal
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } else {
            // Si el login falló, redirigir a la página de login
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          }
        } else {
          // Si no hay token, redirigir a la página de login
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setError('No se pudo restablecer la contraseña. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      console.error('Error al restablecer la contraseña:', err);
      
      if (err.response?.status === 422) {
        // Error de validación
        const validationErrors = err.response.data?.errors;
        if (validationErrors) {
          // Si hay errores de validación, mostrar el primero
          const firstError = Object.values(validationErrors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setError('Los datos proporcionados no son válidos');
        }
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
            Crea tu nueva contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor, ingresa y confirma tu nueva contraseña
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
        
        {/* Formulario de restablecimiento de contraseña */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Campo de email (si no está presente) */}
          {!email && (
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
            </div>
          )}
          
          {/* Campo de token (si no está presente) */}
          {!token && (
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
                placeholder="Ingresa el token de recuperación"
              />
            </div>
          )}
          
          {/* Campo de nueva contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="mt-2 text-xs text-gray-600">
              <p className="font-medium mb-1">La contraseña debe incluir:</p>
              <ul className="list-disc list-inside space-y-1">
                <li className={password.length >= passwordRules.minLength ? 'text-green-600' : 'text-gray-500'}>
                  Al menos {passwordRules.minLength} caracteres
                </li>
                {passwordRules.requireUppercase && (
                  <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    Al menos una letra mayúscula
                  </li>
                )}
                {passwordRules.requireNumbers && (
                  <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    Al menos un número
                  </li>
                )}
                {passwordRules.requireSpecial && (
                  <li className={/[!@#$%^&*]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                    Al menos un carácter especial (!@#$%^&*)
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Campo de confirmación de contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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
              disabled={loading || !token || !email}
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Actualizando...
                </span>
              ) : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;