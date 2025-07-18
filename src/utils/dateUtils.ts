// src/utils/dateUtils.ts - OPTIMIZADO CON CACHE

/**
 * Utilidades para manejo y formateo de fechas
 * Configurado para la zona horaria de Ecuador (UTC-5)
 * CON CACHE INTELIGENTE PARA EVITAR RECÁLCULOS
 */

// Zona horaria de Ecuador
export const ECUADOR_TIMEZONE = "America/Guayaquil";
export const ECUADOR_UTC_OFFSET = "-05:00";

// ✅ CACHE PARA formatRelativeTime
interface RelativeTimeCache {
	[key: string]: {
		result: string;
		timestamp: number;
		expiry: number;
	};
}

const relativeTimeCache: RelativeTimeCache = {};
const CACHE_DURATION = 30 * 1000; // 30 segundos
const MAX_CACHE_SIZE = 100; // Máximo 100 entradas

/**
 * Limpia el cache de tiempo relativo cuando está muy lleno
 */
const cleanupRelativeTimeCache = (): void => {
	const now = Date.now();
	const keys = Object.keys(relativeTimeCache);

	if (keys.length > MAX_CACHE_SIZE) {
		// Remover entradas expiradas
		keys.forEach((key) => {
			if (relativeTimeCache[key].expiry < now) {
				delete relativeTimeCache[key];
			}
		});

		// Si aún hay muchas, remover las más antiguas
		const remaining = Object.keys(relativeTimeCache);
		if (remaining.length > MAX_CACHE_SIZE) {
			const sorted = remaining
				.map((key) => ({key, timestamp: relativeTimeCache[key].timestamp}))
				.sort((a, b) => a.timestamp - b.timestamp);

			const toRemove = sorted.slice(0, remaining.length - MAX_CACHE_SIZE);
			toRemove.forEach((item) => delete relativeTimeCache[item.key]);
		}
	}
};

/**
 * Parsea una fecha que viene del backend Laravel
 * Maneja tanto fechas con zona horaria como sin ella
 */
export const parseBackendDate = (dateString: string): Date | null => {
	try {
		if (!dateString || dateString.trim() === "") {
			return null;
		}

		const cleanDateString = dateString.trim();
		let date: Date;

		// Formato ISO con zona horaria: "2025-06-25T00:11:24.000000Z" o "2025-06-25T00:11:24Z"
		if (
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z?$/i.test(
				cleanDateString
			) ||
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?[+-]\d{2}:\d{2}$/.test(
				cleanDateString
			)
		) {
			// Es formato ISO válido, parsear directamente
			date = new Date(cleanDateString);
		}
		// Formato Laravel sin zona horaria: "YYYY-MM-DD HH:mm:ss"
		else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(cleanDateString)) {
			// Asumir que es hora local de Ecuador y convertir a ISO string con zona horaria
			const isoString = cleanDateString.replace(" ", "T") + ECUADOR_UTC_OFFSET;
			date = new Date(isoString);
		}
		// Otros formatos, intentar parsear directamente
		else {
			date = new Date(cleanDateString);
		}

		// Verificar si la fecha es válida
		if (isNaN(date.getTime())) {
			return null;
		}

		return date;
	} catch (error) {
		console.error("Error al parsear fecha:", error);
		return null;
	}
};

/**
 * Formatea una fecha como tiempo relativo en español
 * ✅ CON CACHE INTELIGENTE para evitar recálculos
 */
export const formatRelativeTime = (dateString: string): string => {
	try {
		if (!dateString || dateString.trim() === "") {
			return "Fecha desconocida";
		}

		const now = Date.now();
		const cacheKey = `${dateString}_${Math.floor(now / CACHE_DURATION)}`;

		// ✅ VERIFICAR CACHE PRIMERO
		const cached = relativeTimeCache[cacheKey];
		if (cached && cached.expiry > now) {
			return cached.result;
		}

		const date = parseBackendDate(dateString);

		if (!date) {
			return "Fecha inválida";
		}

		const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

		// Si la diferencia es negativa (fecha en el futuro), mostrar la fecha
		if (diffInSeconds < 0) {
			return formatAbsoluteDate(date);
		}

		let result: string;
		if (diffInSeconds < 60) {
			result = "Ahora mismo";
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			result = `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			result = `${hours} ${hours === 1 ? "hora" : "horas"}`;
		} else if (diffInSeconds < 604800) {
			const days = Math.floor(diffInSeconds / 86400);
			result = `${days} ${days === 1 ? "día" : "días"}`;
		} else {
			result = formatAbsoluteDate(date);
		}

		// ✅ GUARDAR EN CACHE
		relativeTimeCache[cacheKey] = {
			result,
			timestamp: now,
			expiry: now + CACHE_DURATION,
		};

		// Limpiar cache si está muy lleno
		if (Object.keys(relativeTimeCache).length > MAX_CACHE_SIZE) {
			cleanupRelativeTimeCache();
		}

		return result;
	} catch (error) {
		console.error("Error en formatRelativeTime:", error);
		return "Error en fecha";
	}
};

/**
 * Formatea una fecha como tiempo relativo corto (para toasts)
 * ✅ CON CACHE TAMBIÉN
 */
export const formatRelativeTimeShort = (dateString: string): string => {
	const date = parseBackendDate(dateString);

	if (!date) {
		return "Ahora";
	}

	const now = Date.now();
	const cacheKey = `short_${dateString}_${Math.floor(now / CACHE_DURATION)}`;

	// ✅ VERIFICAR CACHE
	const cached = relativeTimeCache[cacheKey];
	if (cached && cached.expiry > now) {
		return cached.result;
	}

	const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

	if (diffInSeconds < 0) {
		return "Ahora";
	}

	let result: string;
	if (diffInSeconds < 60) {
		result = "Ahora";
	} else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		result = `${minutes}min`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		result = `${hours}h`;
	} else {
		const days = Math.floor(diffInSeconds / 86400);
		result = `${days}d`;
	}

	// ✅ GUARDAR EN CACHE
	relativeTimeCache[cacheKey] = {
		result,
		timestamp: now,
		expiry: now + CACHE_DURATION,
	};

	return result;
};

/**
 * Formatea una fecha absoluta en formato legible en español
 */
export const formatAbsoluteDate = (
	date: Date,
	includeTime: boolean = false
): string => {
	try {
		const now = new Date();

		const options: Intl.DateTimeFormatOptions = {
			day: "numeric",
			month: "short",
			year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
			timeZone: ECUADOR_TIMEZONE,
		};

		if (includeTime) {
			options.hour = "2-digit";
			options.minute = "2-digit";
			options.hour12 = false; // Formato 24 horas
		}

		return date.toLocaleDateString("es-EC", options);
	} catch (error) {
		console.error("Error en formatAbsoluteDate:", error);
		return date.toLocaleDateString();
	}
};

/**
 * Formatea una fecha absoluta desde string
 */
export const formatAbsoluteDateFromString = (
	dateString: string,
	includeTime: boolean = false
): string => {
	const date = parseBackendDate(dateString);

	if (!date) {
		return "Fecha desconocida";
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

	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
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

	return (
		date.getDate() === yesterday.getDate() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getFullYear() === yesterday.getFullYear()
	);
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
		return "";
	}

	// Formato requerido: YYYY-MM-DDTHH:mm
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Valida si un string de fecha es válido
 */
export const isValidDateString = (dateString: string): boolean => {
	const date = parseBackendDate(dateString);
	return date !== null && !isNaN(date.getTime());
};

/**
 * ✅ FUNCIÓN UTILITARIA para limpiar cache manualmente
 */
export const clearRelativeTimeCache = (): void => {
	Object.keys(relativeTimeCache).forEach((key) => {
		delete relativeTimeCache[key];
	});
};

/**
 * ✅ FUNCIÓN UTILITARIA para obtener estadísticas del cache
 */
export const getRelativeTimeCacheStats = () => {
	const keys = Object.keys(relativeTimeCache);
	const now = Date.now();
	const active = keys.filter(
		(key) => relativeTimeCache[key].expiry > now
	).length;
	const expired = keys.length - active;

	return {
		total: keys.length,
		active,
		expired,
		maxSize: MAX_CACHE_SIZE,
		cacheDuration: CACHE_DURATION,
	};
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
	isValidDateString,
	clearRelativeTimeCache,
	getRelativeTimeCacheStats,
};
