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

// Import main styles
import "./styles/main.css";

// ✅ INICIALIZACIÓN OPTIMIZADA
// Iniciar precarga de datos frecuentes pero con menos agresividad
PrefetchService.initPrefetch();

// Service Worker removido - no implementado actualmente
// TODO: Implementar Service Worker para caching offline en el futuro

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
										<App />
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
