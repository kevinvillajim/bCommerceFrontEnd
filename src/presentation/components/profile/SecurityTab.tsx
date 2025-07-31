import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import ApiClient from '../../../infrastructure/api/apiClient';

/**
 * Componente de pestaña de seguridad
 */
const SecurityTab: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  // Estado de formulario para contraseñas
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Estado para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario de cambio de contraseña
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsUpdating(true);
    
    // Validación básica
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      setIsUpdating(false);
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      setIsUpdating(false);
      return;
    }
    
    try {
      // Llamar al endpoint para actualizar contraseña
      await ApiClient.post(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, {
        current_password: formData.currentPassword,
        password: formData.newPassword,
        password_confirmation: formData.confirmPassword
      });
      
      // Limpiar campos de contraseña
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordSuccess('Contraseña actualizada correctamente');
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      
      if (error.response?.data?.errors) {
        // Mostrar el primer error de validación
        const errorMessages = Object.values(error.response.data.errors).flat();
        setPasswordError(errorMessages[0] as string);
      } else if (error.response?.data?.message) {
        setPasswordError(error.response.data.message);
      } else {
        setPasswordError('Error al actualizar la contraseña. Inténtelo de nuevo.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Función para cambiar visualización de contraseña
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">Configuración de Seguridad</h3>
      
      {/* Mensajes de éxito/error */}
      {passwordSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 text-sm text-green-700">
          {passwordSuccess}
        </div>
      )}
      
      {passwordError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-sm text-red-700">
          {passwordError}
        </div>
      )}
      
      <div className="mb-8">
        <h4 className="font-medium text-gray-800 mb-4">Cambiar Contraseña</h4>
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                La contraseña debe tener al menos 8 caracteres e incluir letras y números.
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              disabled={isUpdating}
            >
              {isUpdating ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecurityTab;