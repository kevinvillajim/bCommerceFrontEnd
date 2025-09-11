// src/presentation/hooks/useErrorHandler.ts - CORREGIDO
import { useCallback } from 'react';
import { NotificationType } from '../contexts/CartContext';
import { ErrorHandlingService } from '../services/ErrorHandlingService';

export interface UseErrorHandlerProps {
	showNotification: (type: NotificationType, message: string) => void;
	context?: string;
}

// Tipos para el resultado del manejo de errores
interface ErrorHandlingResult {
	message: string;
	type: 'error' | 'warning' | 'info';
	shouldRetry: boolean;
}

export const useErrorHandler = ({ showNotification, context }: UseErrorHandlerProps) => {
	const handleError = useCallback((error: any, customMessage?: string): boolean => {
		const errorInfo: ErrorHandlingResult = ErrorHandlingService.handleApiError(error, context);
		
		// Usar mensaje personalizado si se proporciona
		const message = customMessage || errorInfo.message;
		
		// Mapear tipos a NotificationType con tipado correcto
		const notificationTypeMap: Record<string, NotificationType> = {
			'error': NotificationType.ERROR,
			'warning': NotificationType.WARNING,
			'info': NotificationType.INFO
		};

		// Obtener el tipo con fallback seguro
		const notificationType = notificationTypeMap[errorInfo.type] || NotificationType.ERROR;

		showNotification(notificationType, message);

		return errorInfo.shouldRetry;
	}, [showNotification, context]);

	const handleSuccess = useCallback((message: string) => {
		showNotification(NotificationType.SUCCESS, message);
	}, [showNotification]);

	// Función específica para errores de stock
	const handleStockError = useCallback((availableStock: number, requestedQuantity: number) => {
		const message = `Solo hay ${availableStock} unidad${availableStock !== 1 ? 'es' : ''} disponible${availableStock !== 1 ? 's' : ''} en stock. Solicitaste ${requestedQuantity}.`;
		showNotification(NotificationType.WARNING, message);
	}, [showNotification]);

	return {
		handleError,
		handleSuccess,
		handleStockError
	};
};