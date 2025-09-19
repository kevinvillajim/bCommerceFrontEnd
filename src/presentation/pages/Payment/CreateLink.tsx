import React, { useState } from 'react';
import { Plus, DollarSign, User, FileText, Calendar, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { ApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { useToast } from '../../components/UniversalToast';
import { NotificationType } from '../../types/NotificationTypes';

interface CreateLinkData {
  customer_name: string;
  amount: string;
  description: string;
  expires_in_days: number;
}

interface CreatedLink {
  id: number;
  link_code: string;
  public_url: string;
  customer_name: string;
  amount: number;
  expires_at: string;
}

/**
 * Página para crear nuevos links de pago
 */
const CreateLink: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<CreateLinkData>({
    customer_name: '',
    amount: '',
    description: '',
    expires_in_days: 7,
  });
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<CreatedLink | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name.trim()) {
      showToast(NotificationType.ERROR, 'El nombre del cliente es requerido');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast(NotificationType.ERROR, 'El monto debe ser un número válido mayor a 0');
      return;
    }

    try {
      setLoading(true);

      const response = await ApiClient.post<{
        success: boolean;
        message: string;
        data: CreatedLink;
      }>(API_ENDPOINTS.EXTERNAL_PAYMENT.CREATE, {
        customer_name: formData.customer_name.trim(),
        amount: amount,
        description: formData.description.trim() || undefined,
        expires_in_days: formData.expires_in_days,
      });

      if (response.success) {
        setCreatedLink(response.data);
        showToast(NotificationType.SUCCESS, 'Link de pago creado exitosamente');

        // Reset form
        setFormData({
          customer_name: '',
          amount: '',
          description: '',
          expires_in_days: 7,
        });
      } else {
        showToast(NotificationType.ERROR, response.message || 'Error creando el link');
      }
    } catch (err: any) {
      console.error('Error creating payment link:', err);
      showToast(
        NotificationType.ERROR,
        err.response?.data?.message || 'Error creando el link de pago'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(NotificationType.SUCCESS, 'URL copiada al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast(NotificationType.ERROR, 'Error copiando la URL');
    }
  };

  const createAnotherLink = () => {
    setCreatedLink(null);
    setCopied(false);
  };

  if (createdLink) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header de éxito */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Check className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">¡Link Creado Exitosamente!</h1>
              <p className="text-gray-600">Tu link de pago está listo para compartir</p>
            </div>
          </div>
        </div>

        {/* Información del link creado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Link</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <p className="text-gray-900 font-medium">{createdLink.customer_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <p className="text-gray-900 font-medium">${parseFloat(createdLink.amount).toFixed(2)} USD</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código del Link</label>
              <p className="text-gray-900 font-mono text-lg">{createdLink.link_code}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expira el</label>
              <p className="text-gray-900">
                {new Date(createdLink.expires_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL del Link de Pago</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={createdLink.public_url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(createdLink.public_url)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={createAnotherLink}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Otro Link
          </button>
          <button
            onClick={() => window.location.href = '/payment/links'}
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
          >
            <LinkIcon className="h-5 w-5 mr-2" />
            Ver Mis Links
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <Plus className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Link de Pago</h1>
            <p className="text-gray-600">Genera un link para que tus clientes puedan pagar</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del cliente */}
          <div>
            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Nombre del Cliente *
            </label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
              placeholder="Ej: Juan Pérez"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Monto */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Monto (USD) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="0.01"
              max="99999.99"
              step="0.01"
              placeholder="Ej: 25.50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Descripción (Opcional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Ej: Pago por servicio de consultoría"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Días de expiración */}
          <div>
            <label htmlFor="expires_in_days" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Válido por
            </label>
            <select
              id="expires_in_days"
              name="expires_in_days"
              value={formData.expires_in_days}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>1 día</option>
              <option value={3}>3 días</option>
              <option value={7}>7 días (recomendado)</option>
              <option value={15}>15 días</option>
              <option value={30}>30 días</option>
            </select>
          </div>

          {/* Botón de envío */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <LinkIcon className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Creando Link...' : 'Generar Link de Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLink;