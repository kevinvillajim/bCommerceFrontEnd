// src/presentation/components/auth/GoogleAuthCallbackHandler.tsx - SIMPLIFICADO

import React, {useEffect} from "react";
import {useSearchParams, useLocation} from "react-router-dom";

/**
 * Componente simplificado para manejar SOLO errores de Google OAuth en páginas de login/register
 * El éxito se maneja en GoogleAuthSuccessPage
 */
const GoogleAuthCallbackHandler: React.FC = () => {
	const [searchParams] = useSearchParams();
	const location = useLocation();

	useEffect(() => {
		// Solo procesar si estamos en páginas de login/register Y hay un error
		const isLoginOrRegister = ["/login", "/register"].includes(
			location.pathname
		);
		const hasError = searchParams.has("error");

		if (!isLoginOrRegister || !hasError) {
			return;
		}

		const handleGoogleError = () => {
			const errorParam = searchParams.get("error");

			if (errorParam) {
				const decodedError = decodeURIComponent(errorParam);
				console.error("❌ Error en Google OAuth:", decodedError);

				// Mostrar mensaje de error al usuario
				alert(`Error en la autenticación: ${decodedError}`);

				// Limpiar URL
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);
			}
		};

		handleGoogleError();
	}, [searchParams, location]);

	// Este componente no renderiza nada visible
	return null;
};

export default GoogleAuthCallbackHandler;
