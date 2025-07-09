// src/presentation/pages/GoogleAuthSuccessPage.tsx - MEJORADO

import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import {LocalStorageService} from "../../infrastructure/services/LocalStorageService";
import appConfig from "../../config/appConfig";

interface ProcessingState {
	isProcessing: boolean;
	status: string;
	error: string | null;
}

const GoogleAuthSuccessPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const {setUser, setIsAuthenticated, refreshRoleInfo} = useAuth();
	const [state, setState] = useState<ProcessingState>({
		isProcessing: true,
		status: "Procesando autenticación...",
		error: null,
	});

	useEffect(() => {
		const processGoogleAuthSuccess = async () => {
			try {
				console.log("🔄 Procesando Google Auth Success...");
				console.log("📊 URL completa:", window.location.href);
				console.log(
					"📊 Parámetros:",
					Object.fromEntries(searchParams.entries())
				);

				setState((prev) => ({
					...prev,
					status: "Obteniendo datos de autenticación...",
				}));

				// Obtener parámetros de la URL
				const token = searchParams.get("token");
				const userData = searchParams.get("user");
				const expiresIn = searchParams.get("expires_in");
				const errorParam = searchParams.get("error");

				console.log("🔍 Parámetros obtenidos:", {
					hasToken: !!token,
					hasUserData: !!userData,
					tokenLength: token?.length,
					expiresIn,
					error: errorParam,
				});

				// Verificar si hay error
				if (errorParam) {
					const decodedError = decodeURIComponent(errorParam);
					console.error("❌ Error en autenticación:", decodedError);
					setState((prev) => ({
						...prev,
						isProcessing: false,
						error: decodedError,
					}));
					return;
				}

				// Verificar datos requeridos
				if (!token || !userData) {
					const missingData = [];
					if (!token) missingData.push("token");
					if (!userData) missingData.push("userData");

					const errorMessage = `Datos de autenticación incompletos: ${missingData.join(", ")}`;
					console.error("❌", errorMessage);
					setState((prev) => ({
						...prev,
						isProcessing: false,
						error: errorMessage,
					}));
					return;
				}

				setState((prev) => ({
					...prev,
					status: "Verificando token de acceso...",
				}));

				// Decodificar datos del usuario
				let user;
				try {
					const decodedUserData = atob(userData);
					user = JSON.parse(decodedUserData);
					console.log("✅ Datos del usuario decodificados:", user);
				} catch (decodeError) {
					console.error(
						"❌ Error decodificando datos del usuario:",
						decodeError
					);
					setState((prev) => ({
						...prev,
						isProcessing: false,
						error: "Error al procesar datos del usuario",
					}));
					return;
				}

				setState((prev) => ({
					...prev,
					status: "Guardando información de sesión...",
				}));

				// Guardar token y datos del usuario en localStorage
				const storageService = new LocalStorageService();
				storageService.setItem(appConfig.storage.authTokenKey, token);
				storageService.setItem(appConfig.storage.userKey, user);

				console.log("✅ Token y datos guardados en localStorage");
				console.log("🔑 Token guardado:", token.substring(0, 50) + "...");
				console.log("👤 Usuario guardado:", user);

				// Actualizar estado de autenticación INMEDIATAMENTE
				setUser(user);
				setIsAuthenticated(true);

				setState((prev) => ({
					...prev,
					status: "Obteniendo información de roles...",
				}));

				// Obtener información de rol del usuario
				let redirectPath = "/";

				try {
					// Usar refreshRoleInfo para obtener información de rol
					await refreshRoleInfo();

					// Usar el servicio de roles para determinar la ruta
					const RoleService = (
						await import("../../infrastructure/services/RoleService")
					).default;
					const roleData = await RoleService.checkUserRole(true);

					console.log("🎯 Información de rol obtenida:", roleData);

					if (roleData && roleData.success) {
						if (roleData.data.is_admin) {
							redirectPath = "/admin/dashboard";
							console.log("👑 Usuario es admin, redirigiendo a:", redirectPath);
						} else if (roleData.data.is_seller) {
							redirectPath = "/seller/dashboard";
							console.log(
								"🏪 Usuario es seller, redirigiendo a:",
								redirectPath
							);
						} else {
							redirectPath = "/";
							console.log("👤 Usuario normal, redirigiendo a:", redirectPath);
						}
					} else {
						console.log("🔄 Sin rol específico, redirigiendo a home");
						redirectPath = "/";
					}
				} catch (roleError) {
					console.warn("⚠️ No se pudo obtener información de rol:", roleError);
					redirectPath = "/";
				}

				setState((prev) => ({...prev, status: "Completando autenticación..."}));

				// Limpiar URL de parámetros
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);

				// Mostrar mensaje de éxito
				setState((prev) => ({
					...prev,
					status: "¡Autenticación exitosa! Redirigiendo...",
				}));

				// Pequeño delay para mostrar el mensaje de éxito
				setTimeout(() => {
					console.log("🚀 Redirigiendo a:", redirectPath);
					navigate(redirectPath, {replace: true});
				}, 1500);
			} catch (error) {
				console.error(
					"❌ Error crítico procesando Google Auth Success:",
					error
				);
				setState((prev) => ({
					...prev,
					isProcessing: false,
					error: "Error al procesar la autenticación con Google",
				}));
			}
		};

		processGoogleAuthSuccess();
	}, [searchParams, navigate, setUser, setIsAuthenticated, refreshRoleInfo]);

	// Renderizar estado de error
	if (state.error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
					<div className="text-red-500 text-6xl mb-4">❌</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Error en la autenticación
					</h2>
					<p className="text-gray-600 mb-6">{state.error}</p>
					<div className="space-y-3">
						<button
							onClick={() => navigate("/login")}
							className="w-full py-3 px-4 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
						>
							Volver al inicio de sesión
						</button>
						<button
							onClick={() => navigate("/register")}
							className="w-full py-3 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
						>
							Crear cuenta nueva
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Renderizar estado de procesamiento
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
				<div className="text-green-500 text-6xl mb-4">
					{state.isProcessing ? "🔄" : "🎉"}
				</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-4">
					{state.isProcessing ? "Procesando autenticación..." : "¡Bienvenido!"}
				</h2>
				<p className="text-gray-600 mb-6">{state.status}</p>

				{state.isProcessing && (
					<div className="flex justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				)}

				{/* Información de debug en desarrollo */}
				{process.env.NODE_ENV === "development" && (
					<details className="mt-6 text-left">
						<summary className="text-sm text-gray-500 cursor-pointer mb-2">
							🔍 Información de debug
						</summary>
						<div className="bg-gray-100 p-3 rounded text-xs">
							<div className="space-y-1">
								<div>
									<strong>URL:</strong> {window.location.href}
								</div>
								<div>
									<strong>Parámetros:</strong>
								</div>
								<pre className="whitespace-pre-wrap text-xs">
									{JSON.stringify(
										Object.fromEntries(searchParams.entries()),
										null,
										2
									)}
								</pre>
							</div>
						</div>
					</details>
				)}
			</div>
		</div>
	);
};

export default GoogleAuthSuccessPage;
