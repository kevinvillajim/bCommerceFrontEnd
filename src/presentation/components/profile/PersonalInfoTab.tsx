import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { UserProfileUpdateData } from '../../../core/domain/entities/User';

// Esta interfaz debe coincidir con la definida en UserProfilePage
interface UserProfile {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  created_at: string;
}

interface PersonalInfoTabProps {
  userProfile: UserProfile | null;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
}

/**
 * Componente de pestaña de información personal
 */
const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  userProfile,
  onProfileUpdate
}) => {
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  
  // Estado para formulario de edición
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    location: ''
  });
  
  // Inicializar formulario con datos del usuario
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        age: userProfile.age?.toString() || '',
        gender: userProfile.gender || '',
        location: userProfile.location || ''
      });
    }
  }, [userProfile]);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario de información personal
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsUpdating(true);
    
    try {
      // Preparar datos para actualizar
      const profileData: UserProfileUpdateData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        location: formData.location || null
      };
      
      // Actualizar perfil usando la API correcta mediante el hook de autenticación
      const updatedUser = await updateProfile(profileData);
      
      if (updatedUser && onProfileUpdate && userProfile) {
        // Asegurarse de que el objeto actualizado mantiene los campos obligatorios
        const updatedProfile: UserProfile = {
          ...userProfile,
          name: updatedUser.name || userProfile.name,
          age: updatedUser.age ?? userProfile.age,
          gender: updatedUser.gender ?? userProfile.gender,
          location: updatedUser.location ?? userProfile.location
        };
        
        // Notificar al componente padre sobre la actualización
        onProfileUpdate(updatedProfile);
        
        setProfileSuccess('Perfil actualizado correctamente');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      if (error instanceof Error) {
        setProfileError(error.message);
      } else {
        setProfileError('No se pudo actualizar el perfil. Inténtelo de nuevo.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancelar edición y revertir cambios
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Revertir cambios
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        age: userProfile.age?.toString() || '',
        gender: userProfile.gender || '',
        location: userProfile.location || ''
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Información Personal</h3>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <Settings size={18} className="mr-1" />
            Editar
          </button>
        )}
      </div>
      
      {/* Mensajes de éxito/error */}
      {profileSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 text-sm text-green-700 animate-fadeIn">
          {profileSuccess}
        </div>
      )}
      
      {profileError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-sm text-red-700 animate-fadeIn">
          {profileError}
        </div>
      )}
      
      {isEditing ? (
        <form onSubmit={handlePersonalInfoSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                required
                disabled  // El email no se puede cambiar normalmente
              />
              <p className="text-xs text-gray-500 mt-1">El correo electrónico no se puede cambiar directamente.</p>
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="0"
                max="120"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="No binario">No binario</option>
                <option value="Prefiero no decirlo">Prefiero no decirlo</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                placeholder="Ciudad, País"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isUpdating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              disabled={isUpdating}
            >
              {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Nombre completo</div>
              <div className="flex items-center text-gray-800">
                <User size={18} className="text-primary-500 mr-2" />
                {userProfile?.name || 'No especificado'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Correo electrónico</div>
              <div className="flex items-center text-gray-800">
                <Mail size={18} className="text-primary-500 mr-2" />
                {userProfile?.email || 'No especificado'}
                {userProfile?.emailVerifiedAt && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                    Verificado
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Edad</div>
              <div className="flex items-center text-gray-800">
                <Calendar size={18} className="text-primary-500 mr-2" />
                {userProfile?.age || 'No especificada'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Género</div>
              <div className="flex items-center text-gray-800">
                <User size={18} className="text-primary-500 mr-2" />
                {userProfile?.gender || 'No especificado'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Ubicación</div>
              <div className="flex items-center text-gray-800">
                <MapPin size={18} className="text-primary-500 mr-2" />
                {userProfile?.location || 'No especificada'}
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-700">
            <p>
              <strong>Nota:</strong> Tu información personal se mantiene privada y solo se utiliza para mejorar tu experiencia de compra.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoTab;