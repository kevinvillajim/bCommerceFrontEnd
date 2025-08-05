import React, { useState, useEffect } from 'react';
import { User, Lock, LogOut, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ProfileSidebarProps {
  activeTab: 'personal' | 'security' | 'orders' | 'seller-application';
  setActiveTab: (tab: 'personal' | 'security' | 'orders' | 'seller-application') => void;
  userCreatedAt?: string;
  userName?: string;
  userEmail?: string;
}

/**
 * Componente de barra lateral para el perfil de usuario
 */
const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeTab,
  setActiveTab,
  userCreatedAt,
  userName,
  userEmail
}) => {
  const { logout, user, isSeller, isAdmin } = useAuth();
  const [isUserSeller, setIsUserSeller] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    checkUserRoles();
  }, []);

  const checkUserRoles = async () => {
    try {
      const [sellerStatus, adminStatus] = await Promise.all([
        isSeller(),
        isAdmin()
      ]);
      setIsUserSeller(sellerStatus);
      setIsUserAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking user roles:', error);
    }
  };
  
  // Obtener la inicial del usuario para el avatar
  const getUserInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    } else if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      await logout();
      // La redirección la maneja el hook useAuth
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="lg:w-1/4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Información de cabecera */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
              <span className="text-primary-600 text-3xl font-bold">
                {getUserInitial()}
              </span>
            </div>
            <h2 className="text-xl font-semibold">{userName || user?.name}</h2>
            <p className="text-primary-100">{userEmail || user?.email}</p>
            
            {userCreatedAt && (
              <div className="mt-2 text-xs bg-primary-800 bg-opacity-20 rounded-full px-3 py-1">
                Cliente desde {formatDate(userCreatedAt)}
              </div>
            )}
          </div>
        </div>
        
        {/* Menú de navegación */}
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <button 
                onClick={() => setActiveTab('personal')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeTab === 'personal' 
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User size={18} className="mr-3" />
                Información Personal
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock size={18} className="mr-3" />
                Seguridad
              </button>
            </li>
            
            {/* Mostrar solicitud de vendedor solo para usuarios normales (no vendedores ni admins) */}
            {!isUserSeller && !isUserAdmin && (
              <li>
                <button 
                  onClick={() => setActiveTab('seller-application')}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === 'seller-application' 
                      ? 'bg-primary-50 text-primary-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Store size={18} className="mr-3" />
                  Solicitud de Vendedor
                </button>
              </li>
            )}
            <li className="pt-4 border-t border-gray-200 mt-4">
              <button 
                className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={18} className="mr-3" />
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;