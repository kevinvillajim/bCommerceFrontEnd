import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, Clock, AlertCircle, Send } from 'lucide-react';
import ApiClient from '../../../infrastructure/api/apiClient';
import { useAuth } from '../../hooks/useAuth';

interface SellerApplication {
  id: number;
  store_name: string;
  business_activity: string;
  products_to_sell: string;
  ruc: string;
  contact_email: string;
  phone: string;
  physical_address: string;
  business_description?: string;
  experience?: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_at?: string;
  created_at: string;
}

interface ApplicationFormData {
  store_name: string;
  business_activity: string;
  products_to_sell: string;
  ruc: string;
  contact_email: string;
  phone: string;
  physical_address: string;
  business_description: string;
  experience: string;
  additional_info: string;
}

const SellerApplicationTab: React.FC = () => {
  const { user, isSeller } = useAuth();
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUserSeller, setIsUserSeller] = useState(false);

  const [formData, setFormData] = useState<ApplicationFormData>({
    store_name: '',
    business_activity: '',
    products_to_sell: '',
    ruc: '',
    contact_email: user?.email || '',
    phone: '',
    physical_address: '',
    business_description: '',
    experience: '',
    additional_info: ''
  });

  useEffect(() => {
    checkSellerStatus();
    fetchApplication();
  }, []);

  const checkSellerStatus = async () => {
    try {
      const sellerStatus = await isSeller();
      setIsUserSeller(sellerStatus);
    } catch (error) {
      console.error('Error checking seller status:', error);
    }
  };

  const fetchApplication = async () => {
    setIsLoading(true);
    try {
      const response = await ApiClient.get('/seller-applications/my-application');
      if (response?.status === 'success' && response.data) {
        setApplication(response.data);
      } else if (response?.status === 'success' && !response.data) {
        // No application found
        setApplication(null);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await ApiClient.post('/seller-applications', formData);
      if (response?.status === 'success') {
        setSuccess('Solicitud enviada exitosamente. Te contactaremos pronto.');
        setShowForm(false);
        await fetchApplication();
        // Reset form
        setFormData({
          store_name: '',
          business_activity: '',
          products_to_sell: '',
          ruc: '',
          contact_email: user?.email || '',
          phone: '',
          physical_address: '',
          business_description: '',
          experience: '',
          additional_info: ''
        });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente de revisión';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewApplication = () => {
    if (application && application.status === 'rejected') {
      // Pre-fill form with previous data
      setFormData({
        store_name: application.store_name,
        business_activity: application.business_activity,
        products_to_sell: application.products_to_sell,
        ruc: application.ruc,
        contact_email: application.contact_email,
        phone: application.phone,
        physical_address: application.physical_address,
        business_description: application.business_description || '',
        experience: application.experience || '',
        additional_info: application.additional_info || ''
      });
    }
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  // If user is already a seller
  if (isUserSeller) {
    return (
      <div className="p-6">
        <div className="text-center">
          <Store className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Ya eres un vendedor!
          </h3>
          <p className="text-gray-600">
            Ya tienes una cuenta de vendedor activa en Comersia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Store className="h-6 w-6 mr-2 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Solicitud de Vendedor</h2>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Show form if requested */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la tienda *
              </label>
              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RUC *
              </label>
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de contacto *
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actividad comercial *
            </label>
            <textarea
              name="business_activity"
              value={formData.business_activity}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe tu actividad comercial principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Productos que deseas vender *
            </label>
            <textarea
              name="products_to_sell"
              value={formData.products_to_sell}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe los tipos de productos que planeas vender"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección física *
            </label>
            <textarea
              name="physical_address"
              value={formData.physical_address}
              onChange={handleInputChange}
              required
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Dirección completa de tu negocio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del negocio
            </label>
            <textarea
              name="business_description"
              value={formData.business_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Cuéntanos más sobre tu negocio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experiencia en ventas
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe tu experiencia previa en ventas (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Información adicional
            </label>
            <textarea
              name="additional_info"
              value={formData.additional_info}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Cualquier información adicional que consideres relevante"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar solicitud
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        // Show existing application status or first-time form
        <div>
          {application ? (
            // Show existing application status
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Estado de tu solicitud</h3>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <span className="ml-2">{getStatusText(application.status)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nombre de tienda:</span>
                  <p className="text-gray-900">{application.store_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">RUC:</span>
                  <p className="text-gray-900">{application.ruc}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fecha de solicitud:</span>
                  <p className="text-gray-900">
                    {new Date(application.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                {application.reviewed_at && (
                  <div>
                    <span className="font-medium text-gray-700">Fecha de revisión:</span>
                    <p className="text-gray-900">
                      {new Date(application.reviewed_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
              </div>

              {application.status === 'rejected' && application.rejection_reason && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Motivo del rechazo:</h4>
                  <p className="text-red-700">{application.rejection_reason}</p>
                </div>
              )}

              {application.status === 'approved' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">¡Felicitaciones!</h4>
                  <p className="text-green-700 mb-3">
                    Tu solicitud ha sido aprobada. Ya puedes acceder a tu panel de vendedor.
                  </p>
                  <a 
                    href="/seller" 
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Ir al Panel de Vendedor
                  </a>
                </div>
              )}

              {application.status === 'rejected' && (
                <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                  <h4 className="font-medium text-primary-800 mb-2">¿Quieres intentar de nuevo?</h4>
                  <p className="text-primary-700 mb-3">
                    Si has solucionado los problemas mencionados en el motivo del rechazo, puedes enviar una nueva solicitud.
                  </p>
                  <button
                    onClick={handleNewApplication}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Nueva Solicitud
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Show first-time application form
            <div className="text-center">
              <div className="bg-primary-50 rounded-lg p-8 mb-6">
                <Store className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ¿Quieres ser vendedor en Comersia?
                </h3>
                <p className="text-gray-600 mb-6">
                  Para ser vendedor en nuestra plataforma, debes completar una solicitud.
                  Nuestro equipo la revisará y te contactaremos pronto.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center mx-auto"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Solicitar ser vendedor
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerApplicationTab;