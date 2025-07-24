// src/presentation/hooks/useErrorHandler.ts
import { useCallback } from 'react';
import { NotificationType } from '../contexts/CartContext';

export interface UseErrorHandlerProps {
	showNotification: (type: NotificationType, message: string) => void;
	context?: string;
}

export const useErrorHandler = ({ showNotification, context }: UseErrorHandlerProps) => {
	const handleError = useCallback((error: any, customMessage?: string): boolean => {
		const errorInfo = ErrorHandlingService.handleApiError(error, context);
		
		// Usar mensaje personalizado si se proporciona
		const message = customMessage || errorInfo.message;
		
		// Mapear tipos a NotificationType
		const notificationTypeMap = {
			'error': NotificationType.ERROR,
			'warning': NotificationType.WARNING,
			'info': NotificationType.INFO
		};

		showNotification(
			notificationTypeMap[errorInfo.type] || NotificationType.ERROR,
			message
		);

		return errorInfo.shouldRetry;
	}, [showNotification, context]);

	const handleSuccess = useCallback((message: string) => {
		showNotification(NotificationType.SUCCESS, message);
	}, [showNotification]);

	return {
		handleError,
		handleSuccess
	};
};

