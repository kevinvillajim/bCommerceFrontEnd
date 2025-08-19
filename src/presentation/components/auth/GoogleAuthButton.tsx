// src/presentation/components/auth/GoogleAuthButton.tsx - CORREGIDO PARA PRODUCCIÓN

import React, {useState, useEffect} from "react";
import {useAuth} from "../../hooks/useAuth";
import GoogleAuthService from "../../../infrastructure/services/GoogleAuthService";

interface GoogleAuthButtonProps {
	action: "login" | "register";
	disabled?: boolean;
	className?: string;
	preferredMethod?: "redirect" | "fedcm" | "auto";
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
	action,
	disabled = false,
	className = "",
	preferredMethod = "auto",
}) => {
	const {loginWithGoogle, registerWithGoogle, loading} = useAuth();
	const [isProcessing, setIsProcessing] = useState(false);
	const [configStatus, setConfigStatus] = useState<{
		isConfigured: boolean;
		errors: string[];
		warnings: string[];
	}>({isConfigured: false, errors: [], warnings: []});

	// Verificar configuración al montar (solo una vez)
	useEffect(() => {
		const checkConfig = async () => {
			const googleService = GoogleAuthService.getInstance();
			const config = await googleService.checkConfiguration();
			setConfigStatus(config);

			// En producción, siempre forzar redirect
			const isProduction = window.location.hostname === 'comersia.app';
			if (isProduction) {
				console.log('🏭 Producción detectada - configurando método redirect');
				googleService.setAuthMethod('redirect');
			} else if (preferredMethod !== "auto") {
				console.log('🔧 Configurando método preferido:', preferredMethod);
				googleService.setAuthMethod(preferredMethod);
			}

			// Ejecutar diagnóstico en desarrollo (solo una vez)
			if (process.env.NODE_ENV === 'development' && !window.__googleAuthDiagnosed) {
				window.__googleAuthDiagnosed = true;
				await googleService.diagnose();
			}
		};

		checkConfig();
	}, []); // Eliminado preferredMethod de dependencias

	const handleGoogleAuth = async () => {
		if (isProcessing || disabled) return;

		setIsProcessing(true);

		try {
			console.log(`🔐 Iniciando ${action} con Google...`);
			console.log("🔧 Método preferido:", preferredMethod);
			console.log("🌐 Origin actual:", window.location.origin);

			// Configurar método si no es auto
			const googleService = GoogleAuthService.getInstance();
			const isProduction = window.location.hostname === 'comersia.app';
			
			if (isProduction) {
				// En producción, siempre usar redirect
				console.log('🏭 Forzando método redirect para producción');
				googleService.setAuthMethod('redirect');
			} else if (preferredMethod !== "auto") {
				googleService.setAuthMethod(preferredMethod);
			}

			// Ejecutar autenticación
			if (action === "login") {
				await loginWithGoogle();
			} else {
				await registerWithGoogle();
			}
		} catch (error) {
			console.error(`❌ Error en ${action} con Google:`, error);
			
			// Mostrar error al usuario
			alert(`Error en ${action === 'login' ? 'inicio de sesión' : 'registro'}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
		} finally {
			setIsProcessing(false);
		}
	};

	const isLoading = loading || isProcessing;
	const buttonText = action === "login" ? "Iniciar sesión con Google" : "Registrarse con Google";
	const hasErrors = configStatus.errors.length > 0;
	const isProduction = window.location.hostname === 'comersia.app';

	return (
		<div className="space-y-2">
			{/* Botón principal */}
			<button
				type="button"
				onClick={handleGoogleAuth}
				disabled={isLoading || disabled || hasErrors}
				className={`
          w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 
          rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
          focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${hasErrors ? "border-red-300 bg-red-50" : ""}
          ${className}
        `}
			>
				{isLoading ? (
					<>
						<svg
							className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						{isProduction || preferredMethod === "redirect" ? "Redirigiendo..." : "Procesando..."}
					</>
				) : (
					<>
						{/* Google Icon */}
						<svg
							className="w-5 h-5 mr-2"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
								<path
									fill="#4285F4"
									d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
								/>
								<path
									fill="#34A853"
									d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
								/>
								<path
									fill="#FBBC05"
									d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
								/>
								<path
									fill="#EA4335"
									d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
								/>
							</g>
						</svg>
						{buttonText}
					</>
				)}
			</button>

			{/* Indicador de método en desarrollo */}
			{/* {process.env.NODE_ENV === 'development' && (
				<div className="text-xs text-gray-500 text-center">
					{isProduction ? '🏭 Producción: Método Redirect' : `🔧 Desarrollo: ${preferredMethod}`}
				</div>
			)} */}

			{/* Mensajes de error */}
			{hasErrors && (
				<div className="bg-red-50 border border-red-200 rounded-md p-2">
					<div className="flex">
						<svg
							className="h-5 w-5 text-red-400 mr-2 flex-shrink-0"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clipRule="evenodd"
							/>
						</svg>
						<div className="text-sm text-red-700">
							<p className="font-medium">Problemas de configuración:</p>
							<ul className="mt-1 list-disc list-inside">
								{configStatus.errors.map((error, index) => (
									<li key={index}>{error}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			{/* Mensajes de advertencia */}
			{configStatus.warnings.length > 0 && !isProduction && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
					<div className="flex">
						<svg
							className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
						<div className="text-sm text-yellow-700">
							<p className="font-medium">Advertencias:</p>
							<ul className="mt-1 list-disc list-inside">
								{configStatus.warnings.map((warning, index) => (
									<li key={index}>{warning}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			)}

			{/* Información de debug en desarrollo */}
			{/* {process.env.NODE_ENV === "development" && (
				<details className="text-xs">
					<summary className="text-gray-500 cursor-pointer mb-2">
						🔍 Información de debug
					</summary>
					<div className="bg-gray-100 p-2 rounded text-xs space-y-1">
						<div><strong>Hostname:</strong> {window.location.hostname}</div>
						<div><strong>Protocol:</strong> {window.location.protocol}</div>
						<div><strong>Is Production:</strong> {isProduction.toString()}</div>
						<div><strong>Preferred Method:</strong> {preferredMethod}</div>
						<div><strong>Configurado:</strong> {configStatus.isConfigured.toString()}</div>
						<div><strong>Errores:</strong> {configStatus.errors.length}</div>
						<div><strong>Advertencias:</strong> {configStatus.warnings.length}</div>
					</div>
				</details>
			)} */}
		</div>
	);
};

export default GoogleAuthButton;