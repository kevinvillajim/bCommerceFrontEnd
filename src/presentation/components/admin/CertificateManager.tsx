import React, { useState, useEffect } from 'react';
import { Save, FileX, AlertTriangle, CheckCircle, AlertCircle, RefreshCw, Info, Loader2 } from 'lucide-react';
import CertificateCard from './CertificateCard';
import SriApiClient from '../../../infrastructure/api/sriApiClient';
import { useToast } from '../UniversalToast';
import { NotificationType } from '../../types/NotificationTypes';

interface Certificate {
  id: number;
  alias: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  daysUntilExpiry: number;
  status: 'vigente' | 'vencido' | 'proximo_vencer';
}

interface CertificateLimits {
  maxAllowed: number;
  currentCount: number;
  remainingSlots: number;
  limitReached: boolean;
}

interface CertificateManagerProps {
  onCertificateChange?: () => void; // Callback para notificar cambios
}

const CertificateManager: React.FC<CertificateManagerProps> = ({ onCertificateChange }) => {
  const { showToast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [limits, setLimits] = useState<CertificateLimits | null>(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCertificatesData();
  }, []);

  // Auto-limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [success, error]);


  /**
   * Carga certificados y límites desde la API
   */
  const loadCertificatesData = async () => {
    try {
      setInitialLoading(true);
      setError(null);

      // Cargar certificados y límites en paralelo
      const [certificatesResponse, limitsResponse] = await Promise.all([
        SriApiClient.listCertificates(),
        SriApiClient.getCertificateLimits()
      ]);

      if (certificatesResponse.success && certificatesResponse.data) {
        // El backend envía 'certificates', no 'certificados'
        const certificates = certificatesResponse.data.certificates || [];

        // Mapear la estructura del backend a la estructura esperada por el frontend
        const mappedCertificates = certificates.map(cert => ({
          id: cert.id,
          alias: cert.alias || `Certificado ${cert.subject}`,
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          isActive: cert.is_active,
          daysUntilExpiry: cert.status?.daysRemaining || 0,
          status: cert.status?.valid ?
            (cert.status.daysRemaining <= 30 ? 'proximo_vencer' : 'vigente') :
            'vencido'
        }));

        setCertificates(mappedCertificates);

        // Encontrar el certificado activo para pre-seleccionarlo
        const activeCert = mappedCertificates.find(cert => cert.isActive);
        if (activeCert) {
          setSelectedCertificateId(activeCert.id);
        }
      } else {
        setCertificates([]);
      }

      if (limitsResponse.success && limitsResponse.data) {
        setLimits(limitsResponse.data.limits);
      }

    } catch (err: any) {
      console.error('Error cargando certificados:', err);
      const errorMessage = 'Error al cargar los certificados: ' + (err?.response?.data?.message || err?.message || 'Error desconocido');
      setError(errorMessage);
      showToast(NotificationType.ERROR, errorMessage);
    } finally {
      setInitialLoading(false);
    }
  };

  /**
   * Refresca los datos
   */
  const handleRefresh = () => {
    loadCertificatesData();
  };

  /**
   * Maneja la selección de un certificado
   */
  const handleSelectCertificate = (certificateId: number) => {
    setSelectedCertificateId(certificateId);
    setSuccess(null);
    setError(null);
  };

  /**
   * Guarda la selección (activa el certificado seleccionado)
   */
  const handleSaveSelection = async () => {
    if (!selectedCertificateId) {
      const errorMessage = 'Selecciona un certificado para activar';
      setError(errorMessage);
      showToast(NotificationType.WARNING, errorMessage);
      return;
    }

    const selectedCert = certificates.find(cert => cert.id === selectedCertificateId);
    if (!selectedCert) {
      const errorMessage = 'Certificado seleccionado no válido';
      setError(errorMessage);
      showToast(NotificationType.ERROR, errorMessage);
      return;
    }

    // No permitir activar certificados expirados
    if (selectedCert.status === 'vencido') {
      const errorMessage = 'No puedes activar un certificado expirado';
      setError(errorMessage);
      showToast(NotificationType.ERROR, errorMessage);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await SriApiClient.activateCertificate(selectedCertificateId);

      if (response.success) {
        const successMessage = 'Certificado activado correctamente. Todas las facturas usarán este certificado.';
        setSuccess(successMessage);
        showToast(NotificationType.SUCCESS, successMessage);

        // Recargar datos para actualizar el estado
        await loadCertificatesData();

        // Notificar cambio a componente padre
        if (onCertificateChange) {
          onCertificateChange();
        }
      }
    } catch (err: any) {
      console.error('Error activando certificado:', err);
      const errorMessage = 'Error al activar el certificado: ' + (err?.response?.data?.message || err?.message || 'Error desconocido');
      setError(errorMessage);
      showToast(NotificationType.ERROR, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja la eliminación de un certificado
   */
  const handleDeleteCertificate = async (certificateId: number) => {
    const certificate = certificates.find(cert => cert.id === certificateId);
    if (!certificate) return;

    const signerName = certificate.subject.split(',')[0] || 'certificado';

    const confirmMessage = `¿Seguro que quieres borrar el certificado de "${signerName}"? Esta acción no se puede deshacer.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await SriApiClient.deleteCertificate(certificateId);

      if (response.success) {
        const successMessage = 'Certificado eliminado correctamente';
        setSuccess(successMessage);
        showToast(NotificationType.SUCCESS, successMessage);

        // Si se eliminó el certificado seleccionado, limpiar selección
        if (selectedCertificateId === certificateId) {
          setSelectedCertificateId(null);
        }

        // Recargar datos
        await loadCertificatesData();

        // Notificar cambio a componente padre
        if (onCertificateChange) {
          onCertificateChange();
        }
      }
    } catch (err: any) {
      console.error('Error eliminando certificado:', err);
      const errorMessage = 'Error al eliminar el certificado: ' + (err?.response?.data?.message || err?.message || 'Error desconocido');
      setError(errorMessage);
      showToast(NotificationType.ERROR, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loader inicial
  if (initialLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <span className="text-gray-600">Cargando certificados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Header con título y botón de refresh */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Gestión de Certificados Digitales
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200 disabled:opacity-50"
          title="Actualizar lista"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Información de límites */}
      {limits && (
        <div className="mb-6 flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <span className="text-sm text-blue-800">
            <strong>{limits.currentCount}/{limits.maxAllowed}</strong> certificados utilizados
            {limits.remainingSlots > 0 && (
              <span className="ml-2">({limits.remainingSlots} espacios disponibles)</span>
            )}
            {limits.limitReached && (
              <span className="ml-2 text-blue-900 font-medium">- Límite alcanzado</span>
            )}
          </span>
        </div>
      )}

      {/* Mensajes de success/error */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de certificados */}
      {!certificates || certificates.length === 0 ? (
        // Estado vacío
        <div className="text-center py-12">
          <FileX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No has subido aún certificados
          </h4>
          <p className="text-gray-600 mb-6">
            Sube tu primer certificado digital para poder emitir facturas electrónicas
          </p>
          <p className="text-sm text-gray-500">
            Usa el formulario de abajo para subir un archivo .p12
          </p>
        </div>
      ) : (
        <>
          {/* Grid de certificados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                isSelected={selectedCertificateId === certificate.id}
                onSelect={handleSelectCertificate}
                onDelete={handleDeleteCertificate}
                loading={loading}
              />
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCertificateId ? (
                <span>Certificado seleccionado. Haz click en "Guardar Selección" para activarlo.</span>
              ) : (
                <span>Selecciona un certificado para activarlo como certificado de firma.</span>
              )}
            </div>

            <button
              onClick={handleSaveSelection}
              disabled={!selectedCertificateId || loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Guardando...' : 'Guardar Selección'}</span>
            </button>
          </div>

          {/* Advertencia para certificados próximos a vencer */}
          {certificates && certificates.some(cert => cert.status === 'proximo_vencer') && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Certificados próximos a vencer
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Tienes certificados que vencerán pronto. Considera renovarlos o subir nuevos certificados para evitar interrupciones en la facturación.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CertificateManager;