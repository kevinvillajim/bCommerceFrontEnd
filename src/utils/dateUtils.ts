// src/utils/dateUtils.ts

/**
 * Utilidades para manejo y formateo de fechas
 * Configurado para la zona horaria de Ecuador (UTC-5)
 */

// Zona horaria de Ecuador
export const ECUADOR_TIMEZONE = 'America/Guayaquil';
export const ECUADOR_UTC_OFFSET = '-05:00';

/**
 * Parsea una fecha que viene del backend Laravel
 * Maneja tanto fechas con zona horaria como sin ella
 */
export const parseBackendDate = (dateString: string): Date | null => {
  try {
    if (!dateString || dateString.trim() === '') {
      return null;
    }

    const cleanDateString = dateString.trim();
    let date: Date;

    // Formato ISO con zona horaria: "2025-06-25T00:11:24.000000Z" o "2025-06-25T00:11:24Z"
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z?$/i.test(cleanDateString) || 
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?[+-]\d{2}:\d{2}$/.test(cleanDateString)) {
      // Es formato ISO válido, parsear directamente
      date = new Date(cleanDateString);
    }
    // Formato Laravel sin zona horaria: "YYYY-MM-DD HH:mm:ss"
    else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(cleanDateString)) {
      // Asumir que es hora local de Ecuador y convertir a ISO string con zona horaria
      const isoString = cleanDateString.replace(' ', 'T') + ECUADOR_UTC_OFFSET;
      date = new Date(isoString);
    }
    // Otros formatos, intentar parsear directamente
    else {
      date = new Date(cleanDateString);
    }

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida parseada:', cleanDateString, 'Resultado:', date);
      return null;
    }

    return date;
  } catch (error) {
    console.error('Error al parsear fecha:', error, 'Fecha original:', dateString);
    return null;
  }
};

/**
 * Formatea una fecha como tiempo relativo en español
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    if (!dateString || dateString.trim() === '') {
      console.warn('formatRelativeTime: fecha vacía o undefined');
      return 'Fecha desconocida';
    }

    const date = parseBackendDate(dateString);
    
    if (!date) {
      console.warn('formatRelativeTime: no se pudo parsear la fecha:', dateString);
      return 'Fecha inválida';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Debug logging
    console.log('formatRelativeTime debug:', {
      original: dateString,
      parsed: date.toISOString(),
      now: now.toISOString(),
      diffInSeconds,
      diffInMinutes: Math.floor(diffInSeconds / 60),
      diffInHours: Math.floor(diffInSeconds / 3600)
    });
    
    // Si la diferencia es negativa (fecha en el futuro), mostrar la fecha
    if (diffInSeconds < 0) {
      console.log('formatRelativeTime: fecha en el futuro, mostrando fecha absoluta');
      return formatAbsoluteDate(date);
    }
    
    if (diffInSeconds < 60) {
      return 'Ahora mismo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'día' : 'días'}`;
    } else {
      return formatAbsoluteDate(date);
    }
  } catch (error) {
    console.error('Error en formatRelativeTime:', error, 'Fecha original:', dateString);
    return 'Error en fecha';
  }
};

/**
 * Formatea una fecha como tiempo relativo corto (para toasts)
 */
export const formatRelativeTimeShort = (dateString: string): string => {
  const date = parseBackendDate(dateString);
  
  if (!date) {
    return 'Ahora';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 0) {
    return 'Ahora';
  }
  
  if (diffInSeconds < 60) {
    return 'Ahora';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d`;
  }
};

/**
 * Formatea una fecha absoluta en formato legible en español
 */
export const formatAbsoluteDate = (date: Date, includeTime: boolean = false): string => {
  try {
    const now = new Date();
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      timeZone: ECUADOR_TIMEZONE
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false; // Formato 24 horas
    }

    return date.toLocaleDateString('es-EC', options);
  } catch (error) {
    console.error('Error en formatAbsoluteDate:', error);
    return date.toLocaleDateString();
  }
};

/**
 * Formatea una fecha absoluta desde string
 */
export const formatAbsoluteDateFromString = (dateString: string, includeTime: boolean = false): string => {
  const date = parseBackendDate(dateString);
  
  if (!date) {
    return 'Fecha desconocida';
  }

  return formatAbsoluteDate(date, includeTime);
};

/**
 * Verifica si una fecha está en el rango de "hoy"
 */
export const isToday = (dateString: string): boolean => {
  const date = parseBackendDate(dateString);
  
  if (!date) {
    return false;
  }

  const today = new Date();
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * Verifica si una fecha está en el rango de "ayer"
 */
export const isYesterday = (dateString: string): boolean => {
  const date = parseBackendDate(dateString);
  
  if (!date) {
    return false;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

/**
 * Convierte una fecha del backend a timestamp para comparaciones
 */
export const dateStringToTimestamp = (dateString: string): number => {
  const date = parseBackendDate(dateString);
  return date ? date.getTime() : 0;
};

/**
 * Formatea una fecha para mostrar en inputs de tipo datetime-local
 */
export const formatForDatetimeInput = (dateString: string): string => {
  const date = parseBackendDate(dateString);
  
  if (!date) {
    return '';
  }

  // Formato requerido: YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Valida si un string de fecha es válido
 */
export const isValidDateString = (dateString: string): boolean => {
  const date = parseBackendDate(dateString);
  return date !== null && !isNaN(date.getTime());
};

// Exportar funciones principales para retrocompatibilidad
export default {
  parseBackendDate,
  formatRelativeTime,
  formatRelativeTimeShort,
  formatAbsoluteDate,
  formatAbsoluteDateFromString,
  isToday,
  isYesterday,
  dateStringToTimestamp,
  formatForDatetimeInput,
  isValidDateString
};