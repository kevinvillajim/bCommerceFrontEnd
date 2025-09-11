// components/UbicacionInput.tsx
import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

interface UbicacionInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Solo países de América Latina principales
const PAISES = [
  'Ecuador', 'Colombia', 'Perú', 'Brasil', 'Argentina', 
  'Chile', 'Venezuela', 'Bolivia', 'Paraguay', 'Uruguay'
];

// Estados de Ecuador
const ESTADOS_ECUADOR = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
  'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura',
  'Loja', 'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo',
  'Orellana', 'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo',
  'Sucumbíos', 'Tungurahua', 'Zamora Chinchipe'
];

const UbicacionInput: React.FC<UbicacionInputProps> = ({ value, onChange, className = '' }) => {
  // Parsear ubicación existente
  const parseUbicacion = (locationString: string) => {
    if (!locationString) return { pais: 'Ecuador', estado: '', ciudad: '' };
    
    const parts = locationString.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      return {
        ciudad: parts[0] || '',
        estado: parts[1] || '',
        pais: parts[2] || 'Ecuador'
      };
    }
    if (parts.length === 2) {
      return {
        ciudad: parts[0] || '',
        estado: parts[1] || '',
        pais: 'Ecuador'
      };
    }
    return {
      ciudad: locationString,
      estado: '',
      pais: 'Ecuador'
    };
  };

  const [ubicacion, setUbicacion] = useState(() => parseUbicacion(value));

  // Convertir a string para backend
  const buildLocationString = (ub: typeof ubicacion) => {
    const parts = [ub.ciudad, ub.estado, ub.pais].filter(Boolean);
    return parts.join(', ');
  };

  // Actualizar cuando cambie el valor externo
  useEffect(() => {
    if (value !== buildLocationString(ubicacion)) {
      setUbicacion(parseUbicacion(value));
    }
  }, [value]);

  const handleChange = (campo: keyof typeof ubicacion, valor: string) => {
    const nuevaUbicacion = { ...ubicacion, [campo]: valor };
    
    // Si cambia país, resetear estado
    if (campo === 'pais' && valor !== 'Ecuador') {
      nuevaUbicacion.estado = '';
    }
    
    setUbicacion(nuevaUbicacion);
    onChange(buildLocationString(nuevaUbicacion));
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPin className="inline mr-1" size={16} />
        Ubicación
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* País */}
        <div className="relative">
          <select
            value={ubicacion.pais}
            onChange={(e) => handleChange('pais', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
          >
            {PAISES.map(pais => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>

        {/* Estado/Provincia - Solo para Ecuador */}
        {ubicacion.pais === 'Ecuador' ? (
          <div className="relative">
            <select
              value={ubicacion.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
            >
              <option value="">Provincia...</option>
              {ESTADOS_ECUADOR.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        ) : (
          <input
            type="text"
            placeholder="Estado/Provincia"
            value={ubicacion.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        )}

        {/* Ciudad */}
        <input
          type="text"
          placeholder="Ciudad"
          value={ubicacion.ciudad}
          onChange={(e) => handleChange('ciudad', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      {/* Vista previa */}
      <div className="mt-2 text-sm text-gray-600">
        {buildLocationString(ubicacion) || 'Ingresa tu ubicación'}
      </div>
    </div>
  );
};

export default UbicacionInput;