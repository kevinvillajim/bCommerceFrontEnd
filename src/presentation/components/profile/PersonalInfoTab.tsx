// PersonalInfoTab.tsx - ACTUALIZADO SIMPLE
import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import UbicacionInput from './UbicacionInput';
import type { UserProfileUpdateData } from '../../../core/domain/entities/User';
import ApiClient from '../../../infrastructure/api/apiClient';

// Mantener la interfaz existente - NO CAMBIAR
interface UserProfile {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;  // Seguir usando string
  created_at: string;
}

interface PersonalInfoTabProps {
  userProfile: UserProfile | null;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
}

/**
 * Componente actualizado con mejor UX para ubicación
 * MANTIENE total compatibilidad con backend actual
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
  
  // Estado para formulario - IGUAL que antes
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    location: ''  // Seguir usando string
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

  // Manejar cambios en campos simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambio de ubicación (desde el componente)
  const handleLocationChange = (newLocation: string) => {
    setFormData(prev => ({
      ...prev,
      location: newLocation
    }));
  };

  // Envío del formulario - EXACTAMENTE igual que antes
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsUpdating(true);
    
    try {
      // Mismos datos que antes - NO CAMBIOS en API
      const profileData: UserProfileUpdateData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        location: formData.location || null  // String simple como siempre
      };
      
      try {
        // Usar ApiClient exactamente igual
        const updatedUser = await ApiClient.put<any>('/profile', profileData);
        
        if (updatedUser && onProfileUpdate && userProfile) {
          const updatedProfile: UserProfile = {
            ...userProfile,
            name: updatedUser.name || userProfile.name,
            age: updatedUser.age ?? userProfile.age,
            gender: updatedUser.gender ?? userProfile.gender,
            location: updatedUser.location ?? userProfile.location
          };
          
          // ✅ ACTUALIZAR TAMBIÉN EL CONTEXTO DE AUTH PARA REFRESCAR HEADER
          updateProfile(profileData);
          
          onProfileUpdate(updatedProfile);
          setProfileSuccess('Perfil actualizado correctamente');
          setIsEditing(false);
        }
      } catch (error) {
        console.error("Error con ApiClient:", error);
        
        // Fallback con hook de auth (ya actualiza automáticamente el contexto)
        const updatedUser = await updateProfile(profileData);
        
        if (updatedUser && onProfileUpdate && userProfile) {
          const updatedProfile: UserProfile = {
            ...userProfile,
            name: updatedUser.name || userProfile.name,
            age: updatedUser.age ?? userProfile.age,
            gender: updatedUser.gender ?? userProfile.gender,
            location: updatedUser.location ?? userProfile.location
          };
          
          onProfileUpdate(updatedProfile);
          setProfileSuccess('Perfil actualizado correctamente');
          setIsEditing(false);
        }
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

  // Cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
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
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 text-sm text-green-700">
          {profileSuccess}
        </div>
      )}
      
      {profileError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-sm text-red-700">
          {profileError}
        </div>
      )}
      
      {isEditing ? (
        <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Email (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                El correo no se puede cambiar por seguridad
              </p>
            </div>
            
            {/* Edad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="150"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="No binario">No binario</option>
                <option value="Prefiero no decirlo">Prefiero no decir</option>
              </select>
            </div>
          </div>
          
          {/* NUEVO componente de ubicación - SIMPLE pero útil */}
          <UbicacionInput
            value={formData.location}
            onChange={handleLocationChange}
          />
          
          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
          
          <div className="bg-blue-50 border-l-4 border-primary-400 p-4 text-sm text-primary-700">
            <p>
              <strong>Nota:</strong> Tu información de ubicación se utiliza para calcular costos de envío y mejorar tu experiencia de compra.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoTab;