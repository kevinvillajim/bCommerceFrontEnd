// src/presentation/hooks/useNotifications.ts - OPTIMIZADO
import {useContext} from "react";
import {NotificationContext} from "../contexts/NotificationContext";

/**
 * Hook optimizado para usar el contexto de notificaciones
 * ✅ MEMOIZADO PARA EVITAR RE-CREACIONES
 */
export const useNotifications = () => {
	const context = useContext(NotificationContext);

	if (!context) {
		throw new Error(
			"useNotifications debe usarse dentro de un NotificationProvider"
		);
	}

	return context;
};

export default useNotifications;
