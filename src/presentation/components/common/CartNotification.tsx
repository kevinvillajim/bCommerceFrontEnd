import React, {useState} from "react";
import CartAlert from "./CartAlert";

// Definir enum para tipos de notificaciones
export enum NotificationType {
	SUCCESS = "success",
	ERROR = "error",
	INFO = "info",
}

// Interfaz para crear contexto
interface CartNotificationContextType {
	showNotification: (type: NotificationType, message: string) => void;
	hideNotification: () => void;
}

// Crear contexto con valores por defecto
export const CartNotificationContext =
	React.createContext<CartNotificationContextType>({
		showNotification: () => {},
		hideNotification: () => {},
	});

// Hook para usar el contexto
export const useCartNotification = () =>
	React.useContext(CartNotificationContext);

// Propiedades del provider
interface CartNotificationProviderProps {
	children: React.ReactNode;
}

// Componente Provider
export const CartNotificationProvider: React.FC<
	CartNotificationProviderProps
> = ({children}) => {
	const [notification, setNotification] = useState<{
		type: NotificationType;
		message: string;
	} | null>(null);

	const showNotification = (type: NotificationType, message: string) => {
		setNotification({type, message});
	};

	const hideNotification = () => {
		setNotification(null);
	};

	return (
		<CartNotificationContext.Provider
			value={{showNotification, hideNotification}}
		>
			{children}
			{notification && (
				<CartAlert
					type={notification.type}
					message={notification.message}
					onClose={hideNotification}
					autoClose={true}
					autoCloseTime={3000}
				/>
			)}
		</CartNotificationContext.Provider>
	);
};

export default CartNotificationProvider;
