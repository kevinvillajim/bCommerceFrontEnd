/**
 * Utilidad para manejar errores de la API y extraer mensajes útiles
 */

/**
 * Extrae un mensaje de error legible de una respuesta de error de la API
 * @param error Error de la API o cualquier otro error
 * @param defaultMessage Mensaje por defecto si no se puede extraer uno mejor
 * @returns Mensaje de error legible para el usuario
 */
export const extractErrorMessage = (
	error: any,
	defaultMessage: string = "Ha ocurrido un error"
): string => {
	// Si el error es una instancia de Error, usar su mensaje
	if (error instanceof Error) {
		return error.message;
	}

	// Si es un error de Axios u otro error HTTP con formato de respuesta
	if (error && typeof error === "object") {
		// Verificar si tiene una estructura de respuesta (Axios u otros clientes HTTP)
		if ("response" in error && error.response) {
			const {response} = error;

			// Extraer mensaje del cuerpo de la respuesta
			if (response.data) {
				// Mensaje directo
				if (typeof response.data.message === "string") {
					return response.data.message;
				}

				// Errores de validación
				if (response.data.errors && typeof response.data.errors === "object") {
					const validationErrors = Object.values(response.data.errors).flat();
					if (validationErrors.length > 0) {
						return Array.isArray(validationErrors[0])
							? validationErrors[0].join(". ")
							: validationErrors.join(". ");
					}
				}

				// Si hay un mensaje de error en formato string
				if (typeof response.data === "string") {
					return response.data;
				}
			}

			// Usar el código de estado HTTP si está disponible
			if (response.status) {
				return getHttpStatusMessage(response.status);
			}
		}

		// Errores de red
		if ("message" in error && typeof error.message === "string") {
			if (
				error.message.includes("network") ||
				error.message.includes("Network")
			) {
				return "Error de conexión. Verifica tu conexión a internet.";
			}

			if (error.message.includes("timeout")) {
				return "La solicitud ha tardado demasiado tiempo. Intenta de nuevo más tarde.";
			}

			return error.message;
		}
	}

	// Si no podemos extraer un mensaje específico, devolver el mensaje por defecto
	return defaultMessage;
};

/**
 * Obtiene un mensaje descriptivo basado en el código de estado HTTP
 * @param statusCode Código de estado HTTP
 * @returns Mensaje descriptivo
 */
const getHttpStatusMessage = (statusCode: number): string => {
	switch (statusCode) {
		case 400:
			return "Solicitud incorrecta. Verifica los datos enviados.";
		case 401:
			return "No estás autorizado. Inicia sesión nuevamente.";
		case 403:
			return "No tienes permiso para realizar esta acción.";
		case 404:
			return "El recurso solicitado no se ha encontrado.";
		case 422:
			return "Error de validación. Verifica los datos enviados.";
		case 500:
			return "Error en el servidor. Intenta más tarde o contacta al soporte.";
		case 503:
			return "Servicio no disponible. Intenta más tarde.";
		default:
			return `Error ${statusCode}. Por favor, intenta de nuevo.`;
	}
};

export default {
	extractErrorMessage,
	getHttpStatusMessage,
};
