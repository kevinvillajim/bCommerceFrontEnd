import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Lock, Eye, EyeOff, LogOut, Settings, ShoppingBag, Heart } from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  created_at: string;
}

const UserProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'orders'>('personal');
  
  // Estados para formulario de edición
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    location: '',
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

  // Cargar datos del perfil (simulado)
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // Simulación de API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Datos de ejemplo
        const userData: UserProfile = {
          id: 1,
          name: 'María González',
          email: 'maria.gonzalez@ejemplo.com',
          email_verified_at: '2023-10-15T14:30:00Z',
          age: 32,
          gender: 'Femenino',
          location: 'Madrid, España',
          created_at: '2023-09-01T10:00:00Z'
        };
        
        setUserProfile(userData);
        
        // Inicializar formulario con datos del usuario
        setFormData({
          name: userData.name,
          email: userData.email,
          age: userData.age?.toString() || '',
          gender: userData.gender || '',
          location: userData.location || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Error al cargar el perfil del usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario de información personal
  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí implementaría la lógica para guardar los cambios en el backend
    console.log('Guardando información personal:', {
      name: formData.name,
      email: formData.email,
      age: formData.age ? parseInt(formData.age) : null,
      gender: formData.gender,
      location: formData.location
    });
    
    // Actualizar estado local para reflejar cambios
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        name: formData.name,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        location: formData.location
      });
    }
    
    setIsEditing(false);
  };

  // Manejar envío del formulario de cambio de contraseña
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    // Aquí implementaría la lógica para cambiar la contraseña
    console.log('Cambiando contraseña');
    
    // Limpiar campos de contraseña
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    
    alert('Contraseña actualizada correctamente');
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-10 lg:px-20 py-10">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel lateral */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Información de cabecera */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
                    <span className="text-primary-600 text-3xl font-bold">
                      {userProfile?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold">{userProfile?.name}</h2>
                  <p className="text-primary-100">{userProfile?.email}</p>
                  
                  <div className="mt-2 text-xs bg-primary-800 bg-opacity-20 rounded-full px-3 py-1">
                    Cliente desde {userProfile?.created_at ? formatDate(userProfile.created_at) : ''}
                  </div>
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
                  <li>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                        activeTab === 'orders' 
                          ? 'bg-primary-50 text-primary-600 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ShoppingBag size={18} className="mr-3" />
                      Mis Pedidos
                    </button>
                  </li>
                  <li>
                    <a 
                      href="/favorites" 
                      className="w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Heart size={18} className="mr-3" />
                      Mis Favoritos
                    </a>
                  </li>
                  <li className="pt-4 border-t border-gray-200 mt-4">
                    <button 
                      className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => console.log('Cerrar sesión')}
                    >
                      <LogOut size={18} className="mr-3" />
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Contenido principal */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Información Personal */}
              {activeTab === 'personal' && (
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
                          />
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
                            value={formData.gender}
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
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Ciudad, País"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            // Revertir cambios
                            if (userProfile) {
                              setFormData({
                                ...formData,
                                name: userProfile.name,
                                email: userProfile.email,
                                age: userProfile.age?.toString() || '',
                                gender: userProfile.gender || '',
                                location: userProfile.location || ''
                              });
                            }
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          Guardar Cambios
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
                            {userProfile?.name}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Correo electrónico</div>
                          <div className="flex items-center text-gray-800">
                            <Mail size={18} className="text-primary-500 mr-2" />
                            {userProfile?.email}
                            {userProfile?.email_verified_at && (
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
              )}
              
              {/* Seguridad */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Configuración de Seguridad</h3>
                  
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
                              onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
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
                              onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
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
                              onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
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
                        >
                          Actualizar Contraseña
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-800 mb-4">Sesiones Activas</h4>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Sesión actual</div>
                          <div className="text-sm text-gray-500">Madrid, España - Chrome en Windows</div>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Activa ahora
                        </span>
                      </div>
                    </div>
                    
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Cerrar todas las otras sesiones
                    </button>
                  </div>
                </div>
              )}
              
              {/* Pedidos */}
              {activeTab === 'orders' && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Mis Pedidos</h3>
                  
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg font-medium">
                      Todos
                    </button>
                    <button className="px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-lg">
                      En proceso
                    </button>
                    <button className="px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-lg">
                      Entregados
                    </button>
                    <button className="px-4 py-2 hover:bg-gray-100 text-gray-700 rounded-lg">
                      Cancelados
                    </button>
                  </div>
                  
                  {/* Lista de pedidos (ejemplo) */}
                  <div className="space-y-4">
                    {/* Pedido 1 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center">
                        <div>
                          <span className="text-gray-500">Pedido #12345</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-500">30 Nov 2023</span>
                        </div>
                        <div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Entregado
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                            <img 
                              src="https://thumbs.ielectro.es/product/med/23714.webp" 
                              alt="Producto" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">Auriculares Bluetooth Pro</h4>
                            <div className="text-gray-500 text-sm">Cantidad: 1</div>
                          </div>
                          <div className="ml-auto font-medium">
                            $129.99
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                          <div>
                            <span className="text-gray-500 text-sm">Total:</span>
                            <span className="ml-1 font-bold">$129.99</span>
                          </div>
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Pedido 2 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center">
                        <div>
                          <span className="text-gray-500">Pedido #12346</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-500">15 Nov 2023</span>
                        </div>
                        <div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            En tránsito
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                            <img 
                              src="https://m.media-amazon.com/images/I/71JU-bUt-sL.__AC_SX300_SY300_QL70_FMwebp_.jpg" 
                              alt="Producto" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">Smartwatch Fitness Tracker</h4>
                            <div className="text-gray-500 text-sm">Cantidad: 1</div>
                          </div>
                          <div className="ml-auto font-medium">
                            $89.99
                          </div>
                        </div>
                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                          <div>
                            <span className="text-gray-500 text-sm">Total:</span>
                            <span className="ml-1 font-bold">$89.99</span>
                          </div>
                          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mensaje si no hay pedidos */}
                    {/* <div className="text-center py-10 bg-gray-50 rounded-lg">
                      <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                      <h4 className="text-lg font-medium text-gray-700 mb-2">No tienes pedidos aún</h4>
                      <p className="text-gray-500 mb-6">¡Explora nuestros productos y realiza tu primera compra!</p>
                      <a href="/products" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                        Explorar productos
                      </a>
                    </div> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;