// src/presentation/services/ErrorHandlingService.ts - MEJORADO
export interface ApiError {
	status: string;
	message: string;
	code?: string;
	details?: any;
}

export interface ErrorResponse {
	status: 'error' | 'fail';
	message: string;
	data?: any;
	code?: string;
}

export interface ErrorHandlingResult {
	message: string;
	type: 'error' | 'warning' | 'info';
	shouldRetry: boolean;
}

export class ErrorHandlingService {
	/**
	 * Extrae el mensaje de error más útil para el usuario
	 */
	static extractUserMessage(error: any): string {
		// Si es un error de respuesta de API
		if (error?.response?.data) {
			const data = error.response.data;
			
			// Formato estándar de la API: { status: "error", message: "..." }
			if (data.message) {
				return this.translateErrorMessage(data.message);
			}
			
			// Si hay errores de validación
			if (data.errors && Array.isArray(data.errors)) {
				return data.errors.map((err: any) => err.message || err).join(', ');
			}
			
			// Si hay un error general
			if (data.error) {
				return this.translateErrorMessage(data.error);
			}
		}

		// Si es un error directo con message
		if (error?.message) {
			return this.translateErrorMessage(error.message);
		}

		// Si es un string directo
		if (typeof error === 'string') {
			return this.translateErrorMessage(error);
		}

		// Error de red
		if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
			return 'Error de conexión. Verifica tu conexión a internet.';
		}

		// Error por timeout
		if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
			return 'La solicitud tardó demasiado. Inténtalo de nuevo.';
		}

		// Error por defecto
		return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
	}

	/**
	 * Traduce mensajes de error del backend a mensajes amigables
	 */
	static translateErrorMessage(message: string): string {
		const translations: Record<string, string> = {
			// Errores de stock
			'Stock insuficiente': 'No hay suficiente stock disponible. Reduce la cantidad.',
			'Insufficient stock': 'No hay suficiente stock disponible. Reduce la cantidad.',
			'Out of stock': 'Producto agotado. No hay unidades disponibles.',
			'No hay suficiente stock': 'No hay suficiente stock disponible. Reduce la cantidad.',
			'Producto agotado': 'Producto agotado. No hay unidades disponibles.',
			
			// Errores de autenticación
			'Unauthorized': 'Debes iniciar sesión para realizar esta acción.',
			'Token expired': 'Tu sesión ha expirado. Inicia sesión nuevamente.',
			'Invalid credentials': 'Credenciales incorrectas. Verifica tu email y contraseña.',
			
			// Errores de validación
			'Validation failed': 'Los datos ingresados no son válidos.',
			'Required field missing': 'Faltan campos obligatorios.',
			'Invalid email format': 'El formato del email no es válido.',
			'Password too weak': 'La contraseña debe ser más segura.',
			
			// Errores de productos
			'Product not found': 'El producto no fue encontrado.',
			'Product unavailable': 'El producto no está disponible temporalmente.',
			'Price changed': 'El precio del producto ha cambiado. Actualiza la página.',
			
			// Errores de carrito
			'Cart empty': 'Tu carrito está vacío.',
			'Cart item not found': 'El producto no se encuentra en tu carrito.',
			'Cannot update cart': 'No se pudo actualizar el carrito. Inténtalo de nuevo.',
			
			// Errores de pago
			'Payment failed': 'El pago no pudo ser procesado. Verifica tus datos.',
			'Invalid payment method': 'Método de pago no válido.',
			'Insufficient funds': 'Fondos insuficientes en tu cuenta.',
			
			// Errores de envío
			'Invalid shipping address': 'La dirección de envío no es válida.',
			'Shipping not available': 'Envío no disponible para tu ubicación.',
			
			// Errores del sistema
			'Server error': 'Error del servidor. Inténtalo más tarde.',
			'Service unavailable': 'Servicio temporalmente no disponible.',
			'Rate limit exceeded': 'Has realizado demasiadas solicitudes. Espera un momento.',
		};

		// Buscar traducción exacta
		if (translations[message]) {
			return translations[message];
		}

		// Buscar por palabras clave
		const lowerMessage = message.toLowerCase();
		
		if (lowerMessage.includes('stock') || lowerMessage.includes('existencia')) {
			return 'Problema con el stock del producto. Verifica la disponibilidad.';
		}
		
		if (lowerMessage.includes('payment') || lowerMessage.includes('pago')) {
			return 'Error en el procesamiento del pago. Verifica tus datos.';
		}
		
		if (lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('conexión')) {
			return 'Error de conexión. Verifica tu conexión a internet.';
		}
		
		if (lowerMessage.includes('timeout') || lowerMessage.includes('tiempo')) {
			return 'La operación tardó demasiado. Inténtalo de nuevo.';
		}

		if (lowerMessage.includes('cantidad') || lowerMessage.includes('disponible')) {
			return 'Cantidad solicitada no disponible. Verifica el stock.';
		}

		// Si no hay traducción, devolver el mensaje original
		return message;
	}

	/**
	 * Determina el tipo de notificación basado en el error
	 */
	static getNotificationType(error: any): 'error' | 'warning' | 'info' {
		const message = error?.response?.data?.message || error?.message || '';
		const lowerMessage = message.toLowerCase();

		// Warnings para errores de validación o stock
		if (lowerMessage.includes('stock') || 
			lowerMessage.includes('existencia') ||
			lowerMessage.includes('cantidad') ||
			lowerMessage.includes('validation') || 
			lowerMessage.includes('required')) {
			return 'warning';
		}

		// Info para errores de autenticación
		if (lowerMessage.includes('unauthorized') || 
			lowerMessage.includes('token') ||
			lowerMessage.includes('login') ||
			lowerMessage.includes('sesión')) {
			return 'info';
		}

		// Error por defecto
		return 'error';
	}

	/**
	 * Maneja errores de API de manera consistente
	 */
	static handleApiError(error: any, context?: string): ErrorHandlingResult {
		const message = this.extractUserMessage(error);
		const type = this.getNotificationType(error);
		
		// Determinar si se puede reintentar
		const shouldRetry = this.shouldRetry(error);

		// Log del error para debugging
		console.error(`Error${context ? ` in ${context}` : ''}:`, {
			originalError: error,
			userMessage: message,
			type,
			shouldRetry
		});

		return {
			message,
			type,
			shouldRetry
		};
	}

	/**
	 * Determina si un error permite reintentar la operación
	 */
	static shouldRetry(error: any): boolean {
		// Errores de red o timeout - se puede reintentar
		if (error?.code === 'NETWORK_ERROR' || 
			error?.code === 'ECONNABORTED' || 
			error?.message?.includes('timeout') ||
			error?.message?.includes('Network Error')) {
			return true;
		}

		// Errores del servidor (5xx) - se puede reintentar
		if (error?.response?.status >= 500) {
			return true;
		}

		// Errores de cliente (4xx) - generalmente no se puede reintentar
		if (error?.response?.status >= 400 && error?.response?.status < 500) {
			// Excepto algunos casos específicos
			const retryableCodes = [408, 429]; // Request Timeout, Too Many Requests
			return retryableCodes.includes(error.response.status);
		}

		// Errores de stock - no se puede reintentar sin cambiar datos
		const message = error?.response?.data?.message || error?.message || '';
		if (message.toLowerCase().includes('stock') || 
			message.toLowerCase().includes('existencia') ||
			message.toLowerCase().includes('cantidad')) {
			return false;
		}

		return false;
	}

	/**
	 * Maneja errores específicos de stock
	 */
	static handleStockError(availableStock: number, requestedQuantity: number): ErrorHandlingResult {
		const message = `Solo hay ${availableStock} unidad${availableStock !== 1 ? 'es' : ''} disponible${availableStock !== 1 ? 's' : ''} en stock. Solicitaste ${requestedQuantity}.`;
		
		return {
			message,
			type: 'warning',
			shouldRetry: false
		};
	}

	/**
	 * Maneja errores de validación de formularios
	 */
	static handleValidationError(validationErrors: Record<string, string[]>): ErrorHandlingResult {
		const errors = Object.values(validationErrors).flat();
		const message = errors.length > 0 ? errors.join('. ') : 'Error de validación';
		
		return {
			message,
			type: 'warning',
			shouldRetry: false
		};
	}
}

export default ErrorHandlingService;