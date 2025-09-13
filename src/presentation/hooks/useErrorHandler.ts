// src/presentation/hooks/useErrorHandler.ts - CORREGIDO
import { useCallback } from 'react';
import { NotificationType } from '../types/NotificationTypes';
import { ErrorHandlingService } from '../services/ErrorHandlingService';
import type { ErrorHandlingResult } from '../services/ErrorHandlingService';

export interface UseErrorHandlerProps {
	showNotification: (type: NotificationType, message: string) => void;
	context?: string;
}

export const useErrorHandler = ({ showNotification, context }: UseErrorHandlerProps) => {
	const handleError = useCallback((error: any, customMessage?: string): boolean => {
		const errorInfo: ErrorHandlingResult = ErrorHandlingService.handleApiError(error, context);

		// Usar mensaje personalizado si se proporciona
		const message = customMessage || errorInfo.message;

		showNotification(errorInfo.type, message);

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