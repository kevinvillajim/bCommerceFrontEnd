import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import App from "./App";
import {AuthProvider} from "./presentation/contexts/AuthContext";
import {CartProvider} from "./presentation/contexts/CartContext";
import {FavoriteProvider} from "./presentation/contexts/FavoriteContext";
import {NotificationProvider} from "./presentation/contexts/NotificationContext";
import {ThemeProvider} from "./presentation/contexts/ThemeContext";
import NotificationWrapper from "./presentation/components/layout/NotificationWrapper";
import PrefetchService from "./infrastructure/services/PrefetchService";
import { VolumeDiscountProvider } from './presentation/contexts/VolumeDiscountContext';

// Import main styles
import "./styles/main.css";

// ✅ INICIALIZACIÓN OPTIMIZADA
// Iniciar precarga de datos frecuentes pero con menos agresividad
PrefetchService.initPrefetch();

// Registrar Service Worker en producción
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('✅ Service Worker registrado exitosamente'))
    .catch((error) => console.warn('⚠️ Error registrando Service Worker:', error));
}

// ✅ ORDEN OPTIMIZADO DE CONTEXTOS
// AuthProvider debe ir primero para que los demás puedan usar isAuthenticated
// CartProvider y FavoriteProvider ahora usan cache reactivo
// NotificationProvider sigue siendo necesario para notificaciones específicas
const root = document.getElementById("root");

if (root) {
	ReactDOM.createRoot(root).render(
		<React.StrictMode>
			<BrowserRouter>
				<ThemeProvider>
					<AuthProvider>
						<NotificationProvider>
							<CartProvider>
								<FavoriteProvider>
									<NotificationWrapper>
									<VolumeDiscountProvider>
										<App />
									</VolumeDiscountProvider>
									</NotificationWrapper>
								</FavoriteProvider>
							</CartProvider>
						</NotificationProvider>
					</AuthProvider>
				</ThemeProvider>
			</BrowserRouter>
		</React.StrictMode>
	);
}
