import React, {createContext, useState, useEffect, useCallback} from "react";
import type {ReactNode} from "react";
import {LocalStorageService} from "../../infrastructure/services/LocalStorageService";
import type {User} from "../../core/domain/entities/User";
import appConfig from "../../config/appConfig";

// Crear instancia del servicio de almacenamiento
const storageService = new LocalStorageService();

// Definir interfaz para el contexto
interface AuthContextProps {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	isAuthenticated: boolean;
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	logout: () => Promise<void>; // Añadimos la función de logout
}

// Crear el contexto con valores por defecto
export const AuthContext = createContext<AuthContextProps>({
	user: null,
	setUser: () => {},
	isAuthenticated: false,
	setIsAuthenticated: () => {},
	logout: async () => {}, // Función vacía por defecto
});

// Props para el proveedor
interface AuthProviderProps {
	children: ReactNode;
}

// Proveedor del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [initialized, setInitialized] = useState<boolean>(false);

	// Verificar si hay un token guardado al cargar
	useEffect(() => {
		const token = storageService.getItem(appConfig.storage.authTokenKey);

		if (token) {
			setIsAuthenticated(true);

			// También intentar obtener datos del usuario si están almacenados
			const userData = storageService.getItem(appConfig.storage.userKey);
			if (userData) {
				setUser(userData);
			}
		} else {
			// Si no hay token, asegurarnos de que el estado sea consistente
			setIsAuthenticated(false);
			setUser(null);
		}

		setInitialized(true);
	}, []);

	// Guardar datos del usuario en localStorage cuando cambian
	useEffect(() => {
		if (user) {
			storageService.setItem(appConfig.storage.userKey, user);
		} else if (initialized) {
			// Solo limpiar si ya se inicializó y el usuario se estableció a null explícitamente
			storageService.removeItem(appConfig.storage.userKey);
		}
	}, [user, initialized]);

	// Mantener token y estado de autenticación sincronizados
	useEffect(() => {
		if (!isAuthenticated && initialized) {
			// Si se desautentica, limpiar el token y datos de usuario
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);
			if (user !== null) {
				setUser(null);
			}
		}
	}, [isAuthenticated, initialized, user]);

	// Implementación de la función de logout
	const logout = useCallback(async (): Promise<void> => {
		try {
			// Si tienes un endpoint de API para el logout, podrías llamarlo aquí
			// Por ejemplo: await api.post('/logout');

			// Limpiar datos de sesión locales
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);

			// Limpiar otras posibles claves relacionadas con la sesión
			storageService.removeItem(appConfig.storage.refreshTokenKey);
			storageService.removeItem(appConfig.storage.cartKey);

			// Actualizar el estado
			setIsAuthenticated(false);
			setUser(null);

			console.log("Logout exitoso");
		} catch (error) {
			console.error("Error durante el logout:", error);

			// Incluso si hay un error en la API, limpiamos el estado local
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);
			setIsAuthenticated(false);
			setUser(null);
		}
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				isAuthenticated,
				setIsAuthenticated,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
