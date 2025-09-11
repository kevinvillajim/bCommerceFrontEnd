// PriceRangeInput.tsx
import React, { useState, useEffect } from 'react';

interface PriceRangeInputProps {
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
}

const PriceRangeInput: React.FC<PriceRangeInputProps> = ({ min, max, onChange }) => {
  // Usamos strings para los inputs para permitir valores vacíos
  const [minValue, setMinValue] = useState<string>(min !== null ? min.toString() : '');
  const [maxValue, setMaxValue] = useState<string>(max !== null ? max.toString() : '');

  // Actualizar el estado local cuando las props cambian
  useEffect(() => {
    setMinValue(min !== null ? min.toString() : '');
    setMaxValue(max !== null ? max.toString() : '');
  }, [min, max]);

const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setMinValue(value);
  const parsedMin = value === '' ? null : parseFloat(value);
  const parsedMax = maxValue === '' ? null : parseFloat(maxValue);
  onChange(parsedMin, parsedMax);
};

const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setMaxValue(value);
  const parsedMin = minValue === '' ? null : parseFloat(minValue);
  const parsedMax = value === '' ? null : parseFloat(value);
  onChange(parsedMin, parsedMax);
};

  const handleBlur = () => {
    // Parsear valores solo cuando el usuario termina de editar
    const parsedMin = minValue === '' ? null : parseFloat(minValue);
    const parsedMax = maxValue === '' ? null : parseFloat(maxValue);
    
    if (parsedMin !== min || parsedMax !== max) {
      onChange(parsedMin, parsedMax);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleBlur();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={minValue}
        onChange={handleMinChange}
        onBlur={handleBlur}
        placeholder="Min"
        className="w-full p-2 border border-gray-300 rounded-md text-sm"
      />
      <span>-</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={maxValue}
        onChange={handleMaxChange}
        onBlur={handleBlur}
        placeholder="Max"
        className="w-full p-2 border border-gray-300 rounded-md text-sm"
      />
      <button 
        type="submit" 
        className="p-2 bg-primary-600 text-white rounded-md text-sm"
      >
        Aplicar
      </button>
    </form>
  );
};

export default PriceRangeInput;