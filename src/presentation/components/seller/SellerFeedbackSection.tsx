import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Clock, CheckCircle, XCircle, Star, AlertCircle, Gift, Sparkles, Crown } from 'lucide-react';
import ApiClient from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

interface Feedback {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'improvement' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  seller_featured?: {
    featured_at: string;
    featured_expires_at: string;
    featured_days: number;
    is_active: boolean;
  };
}

const SellerFeedbackSection: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'improvement' as Feedback['type']
  });

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // ✅ NUEVO: Actualizar countdown cada minuto para featured status activos
  useEffect(() => {
    const hasActiveFeatured = feedbacks.some(feedback => 
      feedback.seller_featured?.is_active && 
      !calculateTimeRemaining(feedback.seller_featured.featured_expires_at).expired
    );

    if (hasActiveFeatured) {
      const interval = setInterval(() => {
        // Forzar re-render cada minuto para actualizar countdown
        setFeedbacks(prevFeedbacks => [...prevFeedbacks]);
      }, 60000); // 60 segundos

      return () => clearInterval(interval);
    }
  }, [feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const response = await ApiClient.get(`${API_ENDPOINTS.FEEDBACK.LIST}?limit=20`) as { data: Feedback[] };
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Basic client-side validation
    if (!formData.title.trim()) {
      setValidationErrors({ title: ['El título es obligatorio'] });
      return;
    }
    
    if (formData.title.length < 5) {
      setValidationErrors({ title: ['El título debe tener al menos 5 caracteres'] });
      return;
    }
    
    if (!formData.description.trim()) {
      setValidationErrors({ description: ['La descripción es obligatoria'] });
      return;
    }
    
    if (formData.description.length < 20) {
      setValidationErrors({ description: ['La descripción debe tener al menos 20 caracteres'] });
      return;
    }

    try {
      setIsSubmitting(true);
      await ApiClient.post(API_ENDPOINTS.FEEDBACK.CREATE, formData);
      
      // Reset form and refresh list
      setFormData({ title: '', description: '', type: 'improvement' });
      setValidationErrors({});
      setShowForm(false);
      await fetchFeedbacks();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      
      // Handle validation errors from backend
      if (error.response?.status === 422) {
        // Laravel validation errors - try multiple possible locations
        const errorData = error.response.data;
        let validationErrors = {};
        
        if (errorData?.errors) {
          validationErrors = errorData.errors;
        } else if (errorData?.data) {
          validationErrors = errorData.data;
        } else if (errorData && typeof errorData === 'object' && !errorData.message) {
          // If errorData is directly the errors object (like {description: [...], type: [...]})
          validationErrors = errorData;
        }
        
        console.log('Validation errors received:', validationErrors);
        setValidationErrors(validationErrors);
      } else {
        // Handle other types of errors
        const errorMessage = error.response?.data?.message || error.message || 'Error al enviar feedback';
        setValidationErrors({ general: [errorMessage] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: Feedback['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: Feedback['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
    }
  };

  const getTypeText = (type: Feedback['type']) => {
    switch (type) {
      case 'bug':
        return 'Error/Bug';
      case 'improvement':
        return 'Mejora';
      case 'other':
        return 'Otro';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ NUEVA: Función para calcular tiempo restante de featured status
  const calculateTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0 };
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { expired: false, days, hours, minutes };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare size={20} className="mr-3 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Feedback y Sugerencias</h3>
            <p className="text-sm text-gray-600">
              Comparte tus ideas para mejorar la plataforma y obtén tienda destacada por 15 días
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Nuevo Feedback
        </button>
      </div>

      {/* Formulario para nuevo feedback */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Enviar Nuevo Feedback</h4>
          
          {/* Errores generales */}
          {validationErrors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <div>
                  {validationErrors.general.map((error, index) => (
                    <p key={index} className="text-red-700 text-sm">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Feedback
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Feedback['type'] })}
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                    validationErrors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="improvement">Mejora</option>
                  <option value="bug">Error/Bug</option>
                  <option value="other">Otro</option>
                </select>
                {validationErrors.type && (
                  <div className="mt-1">
                    {validationErrors.type.map((error, index) => (
                      <p key={index} className="text-red-600 text-xs">{error}</p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-gray-500">(min. 5 chars)</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Describe brevemente tu feedback"
                  className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                    validationErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                <div className="mt-1 text-xs text-gray-500">
                  {formData.title.length}/100 caracteres
                </div>
                {validationErrors.title && (
                  <div className="mt-1">
                    {validationErrors.title.map((error, index) => (
                      <p key={index} className="text-red-600 text-xs">{error}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-gray-500">(min. 20 chars)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe detalladamente tu feedback, sugerencia o el error encontrado"
                rows={3}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                  validationErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              <div className="mt-1 text-xs text-gray-500">
                {formData.description.length}/1000 caracteres
              </div>
              {validationErrors.description && (
                <div className="mt-1">
                  {validationErrors.description.map((error, index) => (
                    <p key={index} className="text-red-600 text-xs">{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de feedback */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Mi Historial de Feedback</h4>
        {feedbacks.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No has enviado feedback aún</h3>
            <p className="text-sm text-gray-500">
              ¡Comparte tus ideas para mejorar la plataforma!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 text-sm">{feedback.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{getTypeText(feedback.type)}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{formatDate(feedback.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(feedback.status)}
                    <span className={`text-xs font-medium ${
                      feedback.status === 'approved' ? 'text-green-600' :
                      feedback.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {getStatusText(feedback.status)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3">{feedback.description}</p>

                {feedback.admin_notes && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <h6 className="font-medium text-blue-900 text-sm mb-1">Respuesta del equipo:</h6>
                    <p className="text-blue-800 text-sm">{feedback.admin_notes}</p>
                  </div>
                )}

                {feedback.seller_featured && (() => {
                  const timeRemaining = calculateTimeRemaining(feedback.seller_featured.featured_expires_at);
                  const isActive = feedback.seller_featured.is_active && !timeRemaining.expired;
                  
                  return (
                    <div className={`rounded-lg p-4 border-2 ${
                      isActive 
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-sm' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        {isActive ? (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Crown className="w-6 h-6 text-blue-600" />
                              <Sparkles className="w-3 h-3 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
                            </div>
                            <div>
                              <h6 className="font-bold text-blue-900 text-sm flex items-center gap-1">
                                ¡Gracias por ayudarnos a mejorar! 
                                <Gift className="w-4 h-4 text-purple-600" />
                              </h6>
                              <p className="text-blue-700 text-xs font-medium">
                                Has obtenido visibilidad premium gratuita
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-gray-500" />
                            <h6 className="font-medium text-gray-700 text-sm">
                              Recompensa de visibilidad otorgada
                            </h6>
                          </div>
                        )}
                      </div>

                      {isActive ? (
                        <div className="space-y-3">
                          {/* Contador de tiempo restante */}
                          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                            <p className="text-blue-800 text-xs font-medium mb-2 text-center">
                              ⏰ Tiempo restante de tu regalo
                            </p>
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div className="bg-blue-100 rounded-lg py-2 px-1">
                                <div className="text-lg font-bold text-blue-900">{timeRemaining.days}</div>
                                <div className="text-xs text-blue-700 font-medium">
                                  {timeRemaining.days === 1 ? 'día' : 'días'}
                                </div>
                              </div>
                              <div className="bg-purple-100 rounded-lg py-2 px-1">
                                <div className="text-lg font-bold text-purple-900">{timeRemaining.hours}</div>
                                <div className="text-xs text-purple-700 font-medium">
                                  {timeRemaining.hours === 1 ? 'hora' : 'horas'}
                                </div>
                              </div>
                              <div className="bg-indigo-100 rounded-lg py-2 px-1">
                                <div className="text-lg font-bold text-indigo-900">{timeRemaining.minutes}</div>
                                <div className="text-xs text-indigo-700 font-medium">
                                  {timeRemaining.minutes === 1 ? 'minuto' : 'minutos'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Mensaje motivacional */}
                          <div className="text-center">
                            <p className="text-blue-800 text-sm font-medium">
                              🌟 ¡Esperamos que disfrutes tu regalo! 🌟
                            </p>
                            <p className="text-blue-600 text-xs mt-1">
                              Tu tienda aparece destacada en las búsquedas
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-600 font-medium">Duración otorgada:</span>
                            <p className="font-bold text-gray-800">{feedback.seller_featured.featured_days} días</p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Expiró el:</span>
                            <p className="text-gray-700">{formatDate(feedback.seller_featured.featured_expires_at)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerFeedbackSection;