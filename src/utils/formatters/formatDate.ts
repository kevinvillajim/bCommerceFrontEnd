/**
 * Formatea una fecha en formato de fecha y hora local
 *
 * @param dateString Cadena de fecha ISO o Date
 * @param options Opciones de formato
 * @returns Fecha formateada
 */
export const formatDate = (
	dateString: string | Date,
	options: {
		showTime?: boolean;
		timeFormat?: "12h" | "24h";
		dateFormat?: "short" | "medium" | "long";
	} = {}
): string => {
	if (!dateString) return "Sin fecha";

	try {
		const date =
			typeof dateString === "string" ? new Date(dateString) : dateString;

		// Verificar si la fecha es válida
		if (isNaN(date.getTime())) {
			return "Fecha inválida";
		}

		const {
			showTime = true,
			timeFormat = "24h",
			dateFormat = "medium",
		} = options;

		// Opciones para la fecha
		const dateOptions: Intl.DateTimeFormatOptions = {
			day: "numeric",
			month: "long",
			year: "numeric",
		};

		if (dateFormat === "short") {
			dateOptions.month = "numeric";
		} else if (dateFormat === "long") {
			dateOptions.weekday = "long";
		}

		// Opciones para la hora
		const timeOptions: Intl.DateTimeFormatOptions = {
			hour: "numeric",
			minute: "numeric",
		};

		if (timeFormat === "12h") {
			timeOptions.hour12 = true;
		} else {
			timeOptions.hour12 = false;
		}

		// Formatear la fecha y hora
		let formattedDate = date.toLocaleDateString("es-ES", dateOptions);

		if (showTime) {
			const formattedTime = date.toLocaleTimeString("es-ES", timeOptions);
			formattedDate += ` ${formattedTime}`;
		}

		return formattedDate;
	} catch (error) {
		console.error("Error al formatear fecha:", error);
		return String(dateString);
	}
};

/**
 * Devuelve una cadena con el tiempo relativo ("hace 5 minutos", "ayer", etc.)
 *
 * @param dateString Cadena de fecha ISO o Date
 * @returns Tiempo relativo
 */
export const getRelativeTime = (dateString: string | Date): string => {
	if (!dateString) return "";

	try {
		const date =
			typeof dateString === "string" ? new Date(dateString) : dateString;

		// Verificar si la fecha es válida
		if (isNaN(date.getTime())) {
			return "";
		}

		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		// Menos de un minuto
		if (diffInSeconds < 60) {
			return "hace unos segundos";
		}

		// Menos de una hora
		if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
		}

		// Menos de un día
		if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
		}

		// Menos de una semana
		if (diffInSeconds < 604800) {
			const days = Math.floor(diffInSeconds / 86400);
			if (days === 1) return "ayer";
			return `hace ${days} días`;
		}

		// Menos de un mes
		if (diffInSeconds < 2592000) {
			const weeks = Math.floor(diffInSeconds / 604800);
			return `hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
		}

		// Menos de un año
		if (diffInSeconds < 31536000) {
			const months = Math.floor(diffInSeconds / 2592000);
			return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
		}

		// Más de un año
		const years = Math.floor(diffInSeconds / 31536000);
		return `hace ${years} ${years === 1 ? "año" : "años"}`;
	} catch (error) {
		console.error("Error al calcular tiempo relativo:", error);
		return "";
	}
};
