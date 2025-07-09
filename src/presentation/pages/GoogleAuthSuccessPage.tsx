// src/presentation/pages/GoogleAuthSuccessPage.tsx

import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import {LocalStorageService} from "../../infrastructure/services/LocalStorageService";
import appConfig from "../../config/appConfig";

const GoogleAuthSuccessPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const {setUser, setIsAuthenticated, refreshRoleInfo} = useAuth();
	const [isProcessing, setIsProcessing] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<string>("Procesando autenticación...");

	useEffect(() => {
		const processGoogleAuthSuccess = async () => {
			try {
				setStatus("Obteniendo datos de autenticación...");

				// Obtener parámetros de la URL
				const token = searchParams.get("token");
				const userData = searchParams.get("user");
				const expiresIn = searchParams.get("expires_in");
				const errorParam = searchParams.get("error");

				console.log("📊 Google Auth Success - Parámetros recibidos:", {
					hasToken: !!token,
					hasUserData: !!userData,
					expiresIn,
					error: errorParam,
				});

				if (errorParam) {
					setError(decodeURIComponent(errorParam));
					setIsProcessing(false);
					return;
				}

				if (!token || !userData) {
					setError("Datos de autenticación incompletos");
					setIsProcessing(false);
					return;
				}

				setStatus("Verificando token de acceso...");

				// Decodificar datos del usuario
				let user;
				try {
					user = JSON.parse(atob(userData));
					console.log("✅ Datos del usuario decodificados:", user);
				} catch (decodeError) {
					console.error(
						"❌ Error decodificando datos del usuario:",
						decodeError
					);
					setError("Error al procesar datos del usuario");
					setIsProcessing(false);
					return;
				}

				setStatus("Guardando información de sesión...");

				// Guardar token y datos del usuario en localStorage
				const storageService = new LocalStorageService();
				storageService.setItem(appConfig.storage.authTokenKey, token);
				storageService.setItem(appConfig.storage.userKey, user);

				console.log("✅ Token y datos guardados en localStorage");

				// Actualizar estado de autenticación
				setUser(user);
				setIsAuthenticated(true);

				setStatus("Obteniendo información de roles...");

				// Obtener información de rol del usuario
				let redirectPath = "/";

				try {
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
					}
				} catch (roleError) {
					console.warn("⚠️ No se pudo obtener información de rol:", roleError);
					redirectPath = "/";
				}

				setStatus("Completando autenticación...");

				// Limpiar URL de parámetros
				window.history.replaceState(
					{},
					document.title,
					window.location.pathname
				);

				// Pequeño delay para mostrar el mensaje de éxito
				setTimeout(() => {
					console.log("🚀 Redirigiendo a:", redirectPath);
					navigate(redirectPath, {replace: true});
				}, 1000);
			} catch (error) {
				console.error("❌ Error procesando Google Auth Success:", error);
				setError("Error al procesar la autenticación con Google");
				setIsProcessing(false);
			}
		};

		processGoogleAuthSuccess();
	}, [searchParams, navigate, setUser, setIsAuthenticated, refreshRoleInfo]);

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
					<div className="text-red-500 text-6xl mb-4">❌</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Error en la autenticación
					</h2>
					<p className="text-gray-600 mb-6">{error}</p>
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

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
				{isProcessing ? (
					<>
						<div className="text-green-500 text-6xl mb-4">✅</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							¡Autenticación exitosa!
						</h2>
						<p className="text-gray-600 mb-6">{status}</p>
						<div className="flex justify-center">
							<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
						</div>
					</>
				) : (
					<>
						<div className="text-green-500 text-6xl mb-4">🎉</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							¡Bienvenido!
						</h2>
						<p className="text-gray-600 mb-6">
							Tu cuenta se ha configurado correctamente. Redirigiendo...
						</p>
					</>
				)}
			</div>
		</div>
	);
};

export default GoogleAuthSuccessPage;
