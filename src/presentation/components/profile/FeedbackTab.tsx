import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Clock, CheckCircle, XCircle, Gift, AlertCircle, Copy } from 'lucide-react';
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
  discount_code?: {
    code: string;
    discount_percentage: number;
    expires_at: string;
    is_used: boolean;
    used_at?: string;
    is_expired: boolean;
    days_left: number;
  };
}

const FeedbackTab: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
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

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const response = await ApiClient.get(`${API_ENDPOINTS.FEEDBACK.LIST}?limit=50`) as { data: Feedback[] };
      setFeedbacks(response.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
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
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

function DiasAHorasYMinutos(decimalDias: number): string {
  const dias = Math.floor(decimalDias);
  const horasDecimales = (decimalDias - dias) * 24;
  const horas = Math.floor(horasDecimales);
  const minutos = Math.floor((horasDecimales - horas) * 60);

  return `Te quedan ${dias} días, ${horas} horas y ${minutos} minutos para utilizar este cupón.`;
}


  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback y Sugerencias</h2>
          <p className="text-gray-600 mt-1">
            Comparte tus opiniones, reporta errores o sugiere mejoras. ¡Si tu feedback es aprobado, recibirás un cupón de descuento especial!
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Nuevo Feedback
        </button>
      </div>

      {/* Información sobre el sistema de recompensas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">¿Cómo funciona el sistema de recompensas?</h3>
            <p className="text-blue-700 text-sm mt-1">
              Cuando envías feedback valioso (reportes de bugs, sugerencias útiles, o ideas de mejora), 
              nuestro equipo lo revisa. Si es aprobado, recibirás un cupón de descuento que podrás usar en cualquier compra.
            </p>
          </div>
        </div>
      </div>


      {/* Formulario para nuevo feedback */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Enviar Nuevo Feedback</h3>
          
          {/* Errores generales */}
          {validationErrors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  {validationErrors.general.map((error, index) => (
                    <p key={index} className="text-red-700 text-sm">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Feedback
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Feedback['type'] })}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  validationErrors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="improvement">Mejora</option>
                <option value="bug">Error/Bug</option>
                <option value="other">Otro</option>
              </select>
              {validationErrors.type && (
                <div className="mt-2">
                  {validationErrors.type.map((error, index) => (
                    <p key={index} className="text-red-600 text-sm">{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título <span className="text-gray-500">(mínimo 5 caracteres)</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Describe brevemente tu feedback"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  validationErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              <div className="mt-1 text-sm text-gray-500">
                {formData.title.length}/100 caracteres
              </div>
              {validationErrors.title && (
                <div className="mt-2">
                  {validationErrors.title.map((error, index) => (
                    <p key={index} className="text-red-600 text-sm">{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción <span className="text-gray-500">(mínimo 20 caracteres)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe detalladamente tu feedback, sugerencia o el error encontrado"
                rows={4}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  validationErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              <div className="mt-1 text-sm text-gray-500">
                {formData.description.length}/1000 caracteres
              </div>
              {validationErrors.description && (
                <div className="mt-2">
                  {validationErrors.description.map((error, index) => (
                    <p key={index} className="text-red-600 text-sm">{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de feedback */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes feedback enviado</h3>
            <p className="text-gray-500">
              ¡Comparte tus ideas y sugerencias para mejorar la plataforma!
            </p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{feedback.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">{getTypeText(feedback.type)}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{formatDate(feedback.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(feedback.status)}
                  <span className={`text-sm font-medium ${
                    feedback.status === 'approved' ? 'text-green-600' :
                    feedback.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {getStatusText(feedback.status)}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{feedback.description}</p>

              {feedback.admin_notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">Respuesta del equipo:</h4>
                  <p className="text-gray-700 text-sm">{feedback.admin_notes}</p>
                </div>
              )}

              {feedback.discount_code && (
                <div className={`border rounded-lg p-4 ${
                  feedback.discount_code.is_used || feedback.discount_code.is_expired 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gift className={`w-5 h-5 ${
                        feedback.discount_code.is_used || feedback.discount_code.is_expired 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`} />
                      <h4 className={`font-medium ${
                        feedback.discount_code.is_used || feedback.discount_code.is_expired 
                          ? 'text-red-900' 
                          : 'text-green-900'
                      }`}>
                        {feedback.discount_code.is_used ? '¡Cupón ya utilizado!' : 
                         feedback.discount_code.is_expired ? '¡Cupón expirado!' :
                         '¡Cupón de descuento disponible!'}
                      </h4>
                    </div>
                    {!feedback.discount_code.is_used && !feedback.discount_code.is_expired && (
                      <button
                        onClick={() => copyToClipboard(feedback.discount_code!.code)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedCode === feedback.discount_code.code ? '¡Copiado!' : 'Copiar'}
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className={`font-medium ${feedback.discount_code.is_used || feedback.discount_code.is_expired ? 'text-red-700' : 'text-green-700'}`}>Código:</span>
                      <p className={`font-mono font-bold ${
                        feedback.discount_code.is_used || feedback.discount_code.is_expired 
                          ? 'text-red-900 line-through' 
                          : 'text-green-900'
                      }`}>
                        {feedback.discount_code.code}
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium ${feedback.discount_code.is_used || feedback.discount_code.is_expired ? 'text-red-700' : 'text-green-700'}`}>Descuento:</span>
                      <p className={`font-bold ${
                        feedback.discount_code.is_used || feedback.discount_code.is_expired 
                          ? 'text-red-900' 
                          : 'text-green-900'
                      }`}>
                        {feedback.discount_code.discount_percentage}% OFF
                      </p>
                    </div>
                    <div>
                      <span className={`font-medium ${feedback.discount_code.is_used || feedback.discount_code.is_expired ? 'text-red-700' : 'text-green-700'}`}>
                        {feedback.discount_code.is_used ? 'Usado:' : 'Válido hasta:'}
                      </span>
                      <p className={feedback.discount_code.is_used || feedback.discount_code.is_expired ? 'text-red-900' : 'text-green-900'}>
                        {feedback.discount_code.is_used && feedback.discount_code.used_at 
                          ? formatDate(feedback.discount_code.used_at)
                          : formatDate(feedback.discount_code.expires_at)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Estado y días restantes */}
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    {feedback.discount_code.is_used ? (
                      <p className="text-red-600 text-sm font-medium">✗ Cupón ya utilizado</p>
                    ) : feedback.discount_code.is_expired ? (
                      <p className="text-red-600 text-sm font-medium"> Cupón expirado</p>
                    ) : (
                      <p className="text-green-600 text-sm font-medium">
                        {DiasAHorasYMinutos(feedback.discount_code.days_left)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackTab;