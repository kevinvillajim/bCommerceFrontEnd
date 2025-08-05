import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import ApiClient from '../../infrastructure/api/apiClient';
import { useAuth } from '../hooks/useAuth';

// Importar componentes modulares
import ProfileSidebar from '../components/profile/ProfileSidebar';
import PersonalInfoTab from '../components/profile/PersonalInfoTab';
import SecurityTab from '../components/profile/SecurityTab';
import SellerApplicationTab from '../components/profile/SellerApplicationTab';

// Definición de la interfaz para el perfil en la página principal
// Esta debe coincidir con la interfaz en los componentes hijos
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

// Interfaz para la respuesta de la API
interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  created_at: string;
  [key: string]: any; // Para cualquier otro campo que pueda venir en la respuesta
}

/**
 * Página de perfil de usuario
 * Este componente integra los diferentes módulos que componen el perfil
 */
const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'orders' | 'seller-application'>('personal');

  // Cargar datos del perfil al iniciar
  useEffect(() => {
    fetchUserProfile();
  }, [user?.id]);

  // Función para transformar la respuesta de la API al formato requerido
  const transformUserProfile = (apiResponse: UserProfileResponse): UserProfile => {
    return {
      id: apiResponse.id,
      name: apiResponse.name,
      email: apiResponse.email,
      emailVerifiedAt: apiResponse.email_verified_at,
      age: apiResponse.age,
      gender: apiResponse.gender,
      location: apiResponse.location,
      created_at: apiResponse.created_at
    };
  };

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      // Cambiamos la ruta a /profile en lugar de AUTH.ME
      const response = await ApiClient.get<UserProfileResponse>(API_ENDPOINTS.PROFILE.LIST);
      
      if (response) {
        // Transformar la respuesta para asegurar la compatibilidad de tipos
        const profileData = transformUserProfile(response);
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error al cargar el perfil del usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar actualización de perfil
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  // Renderizar contenido según la pestaña activa
  const renderActiveTab = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'personal':
        return <PersonalInfoTab userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
      case 'security':
        return <SecurityTab />;
      case 'seller-application':
        return <SellerApplicationTab />;
      default:
        return <PersonalInfoTab userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-20 py-10">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Panel lateral */}
        <ProfileSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userCreatedAt={userProfile?.created_at}
          userName={userProfile?.name}
          userEmail={userProfile?.email}
        />
        
        {/* Contenido principal */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;