import React, { useState, useEffect } from 'react';
import { Upload, Save, CheckCircle, AlertCircle, Building, FileText, Key, Loader2, Trash2, Edit } from 'lucide-react';
import SriApiClient from '../../../infrastructure/api/sriApiClient';

interface CompanyData {
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  direccion_matriz: string;
  telefono: string;
  email_facturacion: string;
  establecimiento: string;
  punto_emision: string;
  obligado_contabilidad: string;
}

interface CertificateData {
  file: File | null;
  password: string;
  alias: string;
}

interface Certificate {
  id: number;
  alias: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  daysUntilExpiry: number;
}

interface ActiveCertificate {
  id: number;
  alias?: string;
  subject: string;
  issuer: string;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  status: string;
}

// Helper para calcular días hasta expiración
const calculateDaysUntilExpiry = (validToDate: string): number => {
  const today = new Date();
  const expiryDate = new Date(validToDate);
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper para formatear fecha
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
};

const SriConfiguration: React.FC = () => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    ruc: '',
    razon_social: '',
    nombre_comercial: '',
    direccion_matriz: '',
    telefono: '',
    email_facturacion: '',
    establecimiento: '001',
    punto_emision: '001',
    obligado_contabilidad: 'SI'
  });

  const [certificate, setCertificate] = useState<CertificateData>({
    file: null,
    password: '',
    alias: ''
  });

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<ActiveCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadActiveCertificate = async () => {
    try {
      const response = await SriApiClient.getActiveCertificate();
      if (response.success && response.data?.certificate) {
        setActiveCertificate(response.data.certificate);
      } else {
        setActiveCertificate(null);
      }
    } catch (error) {
      console.log('No hay certificado activo disponible');
      setActiveCertificate(null);
    }
  };

  const loadProfileData = async () => {
    try {
      setPageLoading(true);
      const response = await SriApiClient.getProfile();
      
      if (response.success && response.data) {
        const company = response.data.company;
        setCompanyData({
          ruc: company.ruc || '',
          razon_social: company.razon_social || '',
          nombre_comercial: company.nombre_comercial || '',
          direccion_matriz: company.direccion_matriz || '',
          telefono: company.telefono || '',
          email_facturacion: company.email_facturacion || '',
          establecimiento: company.establecimiento || '001',
          punto_emision: company.punto_emision || '001',
          obligado_contabilidad: company.obligado_contabilidad || 'SI'
        });
      }
      
      // Cargar certificado activo
      await loadActiveCertificate();
      
    } catch (err: any) {
      console.error('Error cargando perfil SRI:', err);
      setError('Error al cargar los datos del perfil: ' + (err?.message || 'Error desconocido'));
    } finally {
      setPageLoading(false);
    }
  };

  const handleCompanyChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.p12')) {
      setCertificate(prev => ({ ...prev, file }));
      setError(null);
    } else {
      setError('Solo se permiten archivos .p12');
    }
  };

  const handleSaveCompany = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await SriApiClient.updateProfile(companyData);
      
      if (response.success) {
        setSuccess('Información de empresa actualizada correctamente');
        // Actualizar datos con la respuesta del servidor
        if (response.data?.company) {
          const company = response.data.company;
          setCompanyData({
            ruc: company.ruc || '',
            razon_social: company.razon_social || '',
            nombre_comercial: company.nombre_comercial || '',
            direccion_matriz: company.direccion_matriz || '',
            telefono: company.telefono || '',
            email_facturacion: company.email_facturacion || '',
            establecimiento: company.establecimiento || '001',
            punto_emision: company.punto_emision || '001',
            obligado_contabilidad: company.obligado_contabilidad || 'SI'
          });
        }
      }
    } catch (err: any) {
      console.error('Error guardando perfil SRI:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al guardar la información de empresa';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCertificate = async () => {
    if (!certificate.file || !certificate.password) {
      setError('Selecciona un archivo .p12 y proporciona la contraseña');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await SriApiClient.uploadCertificate(
        certificate.file,
        certificate.password,
        certificate.alias || undefined
      );

      if (response.success) {
        setSuccess('Certificado digital subido correctamente');
        // Limpiar formulario
        setCertificate({
          file: null,
          password: '',
          alias: ''
        });
        // Recargar lista de certificados y certificado activo
        loadCertificates();
        await loadActiveCertificate();
      }
    } catch (err: any) {
      console.error('Error subiendo certificado SRI:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al subir el certificado digital';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificates = async () => {
    try {
      // TODO: Implementar cuando sepamos el endpoint para listar certificados
      // Puede ser que necesitemos hacer múltiples llamadas GET /api/certificates/{id}
      // o que exista un endpoint GET /api/certificates para listar todos
    } catch (err) {
      console.error('Error cargando certificados:', err);
    }
  };

  const deleteCertificate = async (certificateId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este certificado? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await SriApiClient.deleteCertificate(certificateId);
      
      if (response.success) {
        setSuccess('Certificado eliminado correctamente');
        loadCertificates(); // Recargar lista
      }
    } catch (err: any) {
      console.error('Error eliminando certificado SRI:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Error al eliminar el certificado';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loader principal mientras cargan los datos
  if (pageLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            <span className="text-gray-600">Cargando información del SRI...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Building className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Configuración SRI - Facturación Electrónica
          </h2>
        </div>
        <p className="text-gray-600">
          Gestiona la información de tu empresa y certificados digitales para la facturación electrónica en Ecuador.
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Certificado Digital Activo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Certificado Digital Activo
          </h3>
        </div>

        {activeCertificate ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-800 mb-2">Información del Certificado</h4>
                <div className="space-y-2 text-sm">
                  {activeCertificate.alias && (
                    <div>
                      <span className="font-medium text-green-700">Alias:</span>
                      <span className="ml-2 text-green-600">{activeCertificate.alias}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-green-700">Sujeto:</span>
                    <span className="ml-2 text-green-600 break-all">{activeCertificate.subject}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Emisor:</span>
                    <span className="ml-2 text-green-600 break-all">{activeCertificate.issuer}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2">Validez</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-green-700">Válido desde:</span>
                    <span className="ml-2 text-green-600">{formatDate(activeCertificate.valid_from)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Válido hasta:</span>
                    <span className="ml-2 text-green-600">{formatDate(activeCertificate.valid_to)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Días restantes:</span>
                    <span className={`ml-2 font-medium ${
                      calculateDaysUntilExpiry(activeCertificate.valid_to) > 30 
                        ? 'text-green-600' 
                        : calculateDaysUntilExpiry(activeCertificate.valid_to) > 7
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {calculateDaysUntilExpiry(activeCertificate.valid_to)} días
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Estado:</span>
                    <span className="ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Activo
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-yellow-700">
                No hay certificado digital activo. Sube un certificado para poder emitir facturas electrónicas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Información de la Empresa */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Información de la Empresa
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RUC *
            </label>
            <input
              type="text"
              value={companyData.ruc}
              onChange={(e) => handleCompanyChange('ruc', e.target.value)}
              placeholder="1793204144001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Facturación *
            </label>
            <input
              type="email"
              value={companyData.email_facturacion}
              onChange={(e) => handleCompanyChange('email_facturacion', e.target.value)}
              placeholder="facturacion@empresa.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón Social *
            </label>
            <input
              type="text"
              value={companyData.razon_social}
              onChange={(e) => handleCompanyChange('razon_social', e.target.value)}
              placeholder="EMPRESA S.A.S."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Comercial
            </label>
            <input
              type="text"
              value={companyData.nombre_comercial}
              onChange={(e) => handleCompanyChange('nombre_comercial', e.target.value)}
              placeholder="EMPRESA"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="text"
              value={companyData.telefono}
              onChange={(e) => handleCompanyChange('telefono', e.target.value)}
              placeholder="0999999999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección *
            </label>
            <textarea
              value={companyData.direccion_matriz}
              onChange={(e) => handleCompanyChange('direccion_matriz', e.target.value)}
              placeholder="Dirección completa de la empresa"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Establecimiento
            </label>
            <input
              type="text"
              value={companyData.establecimiento}
              onChange={(e) => handleCompanyChange('establecimiento', e.target.value)}
              placeholder="001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Punto de Emisión
            </label>
            <input
              type="text"
              value={companyData.punto_emision}
              onChange={(e) => handleCompanyChange('punto_emision', e.target.value)}
              placeholder="001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obligado a llevar Contabilidad
            </label>
            <select
              value={companyData.obligado_contabilidad}
              onChange={(e) => handleCompanyChange('obligado_contabilidad', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SI">SI</option>
              <option value="NO">NO</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveCompany}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Guardando...' : 'Guardar Información'}</span>
          </button>
        </div>
      </div>

      {/* Certificado Digital */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <Key className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Certificado Digital (.p12)
          </h3>
        </div>

        {/* Lista de certificados existentes */}
        {certificates.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Certificados Existentes</h4>
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-3 w-3 rounded-full ${cert.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cert.alias || 'Sin alias'}</p>
                      <p className="text-sm text-gray-500">{cert.subject}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">Vence: {new Date(cert.validTo).toLocaleDateString()}</span>
                        <span className={`text-xs ${cert.daysUntilExpiry < 30 ? 'text-red-600' : 'text-green-600'}`}>
                          {cert.daysUntilExpiry} días restantes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteCertificate(cert.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Certificado (Alias)
            </label>
            <input
              type="text"
              value={certificate.alias}
              onChange={(e) => setCertificate(prev => ({ ...prev, alias: e.target.value }))}
              placeholder="Ej: Certificado UANATACA 2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo de Certificado (.p12) *
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".p12"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {certificate.file && (
                <span className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {certificate.file.name}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña del Certificado *
            </label>
            <input
              type="password"
              value={certificate.password}
              onChange={(e) => setCertificate(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Contraseña del archivo .p12"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUploadCertificate}
              disabled={loading || !certificate.file || !certificate.password}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{loading ? 'Subiendo...' : 'Subir Certificado'}</span>
            </button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Información importante sobre certificados digitales:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• El certificado debe ser válido y estar emitido por una entidad certificadora autorizada por el SRI</li>
            <li>• Solo se aceptan archivos con extensión .p12</li>
            <li>• La contraseña es necesaria para validar el certificado</li>
            <li>• El certificado se utilizará para firmar digitalmente las facturas electrónicas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SriConfiguration;