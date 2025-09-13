// src/presentation/types/NotificationTypes.ts
// Tipo centralizado para todas las notificaciones del sistema

export enum NotificationType {
	SUCCESS = "success",
	ERROR = "error",
	INFO = "info",
	WARNING = "warning",
}

// Alias para compatibilidad con sistemas que usen union types
export type ToastType = `${NotificationType}`;

// Utility types para validaciones
export const isValidNotificationType = (type: string): type is NotificationType => {
	return Object.values(NotificationType).includes(type as NotificationType);
};

// Mapear strings a NotificationType de forma segura
export const stringToNotificationType = (type: string): NotificationType => {
	if (isValidNotificationType(type)) {
		return type;
	}
	// Fallback por defecto
	return NotificationType.INFO;
};