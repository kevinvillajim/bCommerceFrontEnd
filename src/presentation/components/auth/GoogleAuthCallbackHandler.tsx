// src/presentation/components/auth/GoogleAuthCallbackHandler.tsx

import React, {useEffect} from "react";
import {useSearchParams} from "react-router-dom";

/**
 * Componente para manejar el callback de Google OAuth
 * Debe ser incluido en las páginas de login y register
 */
const GoogleAuthCallbackHandler: React.FC = () => {
	const [searchParams] = useSearchParams();

	useEffect(() => {
		// Verificar si estamos regresando de Google OAuth
		const handleGoogleCallback = () => {
			// Verificar parámetros de callback exitoso
			const token = searchParams.get("token");
			const userData = searchParams.get("user");
			const error = searchParams.get("error");

			if (error) {
				console.error("❌ Error en Google OAuth:", decodeURIComponent(error));

				// Mostrar mensaje de error al usuario
				const errorMessage = decodeURIComponent(error);
				alert(`Error en la autenticación: ${errorMessage}`);

				// Limpiar URL
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);
				return;
			}

			if (token && userData) {
				console.log("✅ Callback exitoso de Google OAuth");

				try {
					// Procesar los datos del usuario
					const user = JSON.parse(atob(userData));

					// Guardar token en localStorage
					localStorage.setItem("auth_token", token);
					localStorage.setItem("user_data", JSON.stringify(user));

					// Obtener la URL de retorno
					const returnUrl =
						localStorage.getItem("google_oauth_return_url") || "/";

					// Limpiar datos temporales
					localStorage.removeItem("google_oauth_action");
					localStorage.removeItem("google_oauth_return_url");

					// Limpiar URL
					window.history.replaceState(
						{},
						document.title,
						window.location.pathname
					);

					// Mostrar mensaje de éxito
					console.log("🎉 Autenticación completada, redirigiendo...");

					// Recargar la página para actualizar el estado de autenticación
					window.location.reload();
				} catch (error) {
					console.error("❌ Error procesando datos de Google:", error);
					alert("Error procesando los datos de autenticación");
				}
			}
		};

		// Verificar parámetros solo si existen
		if (searchParams.toString()) {
			handleGoogleCallback();
		}
	}, [searchParams]);

	// Este componente no renderiza nada visible
	return null;
};

export default GoogleAuthCallbackHandler;
