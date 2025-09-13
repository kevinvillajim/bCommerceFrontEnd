import React from 'react';
import { User, Building, Shield, Calendar, CheckCircle, Circle, Trash2, AlertTriangle } from 'lucide-react';

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

interface CertificateCardProps {
  certificate: Certificate;
  isSelected: boolean;
  onSelect: (certificateId: number) => void;
  onDelete: (certificateId: number) => void;
  loading?: boolean;
}

// Helper para extraer nombre del firmante del subject
const extractSignerName = (subject: string): string => {
  if (!subject) return 'Sin nombre';

  // Buscar CN (Common Name) en el subject
  const cnMatch = subject.match(/CN=([^,]+)/);
  if (cnMatch) {
    return cnMatch[1].trim();
  }

  // Si no hay CN, devolver parte del subject limpia
  const firstPart = subject.split(',')[0].trim();
  // Si tiene formato "C=" o similar, buscar el valor
  const valueMatch = firstPart.match(/[A-Z]+=(.+)/);
  return valueMatch ? valueMatch[1].trim() : firstPart || 'Sin nombre';
};

// Helper para extraer nombre de la empresa del subject
const extractCompanyName = (subject: string): string => {
  if (!subject) return 'Sin empresa';

  // Buscar O (Organization) en el subject
  const oMatch = subject.match(/O=([^,]+)/);
  if (oMatch) {
    return oMatch[1].trim();
  }

  // Buscar OU (Organizational Unit) como alternativa
  const ouMatch = subject.match(/OU=([^,]+)/);
  if (ouMatch) {
    return ouMatch[1].trim();
  }

  // Si no hay organización, usar el CN
  return extractSignerName(subject);
};

// Helper para extraer nombre de la firmadora del issuer
const extractIssuerName = (issuer: string): string => {
  if (!issuer) return 'Desconocido';

  // Buscar CN (Common Name) en el issuer
  const cnMatch = issuer.match(/CN=([^,]+)/);
  if (cnMatch) {
    return cnMatch[1].trim();
  }

  // Si no hay CN, devolver la primera parte
  return issuer.split(',')[0].trim() || 'Desconocido';
};

// Helper para formatear fecha
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  isSelected,
  onSelect,
  onDelete,
  loading = false
}) => {
  const signerName = extractSignerName(certificate.subject);
  const companyName = extractCompanyName(certificate.subject);
  const issuerName = extractIssuerName(certificate.issuer);

  // Determinar estado visual
  const isExpired = certificate.status === 'vencido';
  const isExpiringSoon = certificate.status === 'proximo_vencer';
  const isValid = certificate.status === 'vigente';

  // Clases CSS dinámicas
  const cardClasses = `
    relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
    ${certificate.isActive
      ? 'border-green-500 bg-green-50 shadow-lg'
      : isSelected
      ? 'border-blue-500 bg-blue-50 shadow-md'
      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
    }
    ${loading ? 'opacity-50 pointer-events-none' : ''}
    ${isExpired ? 'border-red-200 bg-red-50' : ''}
  `.trim();

  const handleCardClick = () => {
    if (!loading && !isExpired) {
      onSelect(certificate.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se seleccione la card
    if (!loading) {
      onDelete(certificate.id);
    }
  };

  return (
    <div className={cardClasses} onClick={handleCardClick}>
      {/* Botón eliminar - esquina superior derecha */}
      <button
        onClick={handleDeleteClick}
        disabled={loading}
        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200 disabled:opacity-50"
        title="Eliminar certificado"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Badge de estado activo */}
      {certificate.isActive && (
        <div className="absolute top-2 left-2 flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          <CheckCircle className="h-3 w-3" />
          <span>ACTIVO</span>
        </div>
      )}

      {/* Badge de advertencia de expiración */}
      {isExpiringSoon && !certificate.isActive && (
        <div className="absolute top-2 left-2 flex items-center space-x-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          <AlertTriangle className="h-3 w-3" />
          <span>PRÓXIMO A VENCER</span>
        </div>
      )}

      {/* Badge de expirado */}
      {isExpired && (
        <div className="absolute top-2 left-2 flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          <AlertTriangle className="h-3 w-3" />
          <span>EXPIRADO</span>
        </div>
      )}

      {/* Contenido principal de la card */}
      <div className={`mt-6 space-y-3 ${certificate.isActive ? 'mt-8' : isExpiringSoon || isExpired ? 'mt-8' : ''}`}>
        {/* Nombre del firmante */}
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 truncate" title={signerName}>
              {signerName}
            </p>
            <p className="text-xs text-gray-500">Firmante</p>
          </div>
        </div>

        {/* Nombre de la empresa */}
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 truncate" title={companyName}>
              {companyName}
            </p>
            <p className="text-xs text-gray-500">Empresa</p>
          </div>
        </div>

        {/* Firmadora */}
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 truncate" title={issuerName}>
              {issuerName}
            </p>
            <p className="text-xs text-gray-500">Firmadora</p>
          </div>
        </div>

        {/* Fecha de expiración */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <div>
            <p className={`text-sm font-medium ${
              isExpired ? 'text-red-600' :
              isExpiringSoon ? 'text-yellow-600' :
              'text-gray-900'
            }`}>
              {formatDate(certificate.validTo)}
            </p>
            <p className="text-xs text-gray-500">
              {isExpired ? 'Expirado' : `${certificate.daysUntilExpiry} días restantes`}
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de selección */}
      <div className="absolute bottom-2 right-2">
        {isSelected ? (
          <CheckCircle className="h-5 w-5 text-blue-600" />
        ) : (
          <Circle className="h-5 w-5 text-gray-400" />
        )}
      </div>

      {/* Alias del certificado - pie de card */}
      {certificate.alias && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 truncate" title={certificate.alias}>
            {certificate.alias}
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificateCard;