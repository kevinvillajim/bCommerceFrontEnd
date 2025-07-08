// src/presentation/pages/GoogleAuthSuccessPage.tsx

import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import {LocalStorageService} from "../../infrastructure/services/LocalStorageService";
import appConfig from "../../config/appConfig";

const GoogleAuthSuccessPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const {setUser, setIsAuthenticated} = useAuth();
	const [isProcessing, setIsProcessing] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const processGoogleAuth = async () => {
			try {
				// Obtener parámetros de la URL
				const token = searchParams.get("token");
				const userData = searchParams.get("user");
				const expiresIn = searchParams.get("expires_in");
				const error = searchParams.get("error");

				if (error) {
					setError(decodeURIComponent(error));
					setIsProcessing(false);
					return;
				}

				if (!token || !userData) {
					setError("Datos de autenticación incompletos");
					setIsProcessing(false);
					return;
				}

				// Decodificar datos del usuario
				const user = JSON.parse(atob(userData));

				// Guardar token y datos del usuario
				const storageService = new LocalStorageService();
				storageService.setItem(appConfig.storage.authTokenKey, token);
				storageService.setItem(appConfig.storage.userKey, user);

				// Actualizar estado de autenticación
				setUser(user);
				setIsAuthenticated(true);

				console.log("✅ Google Auth procesado exitosamente");

				// Determinar a dónde redirigir basado en el rol del usuario
				let redirectPath = "/";

				// Obtener información de rol
				try {
					const RoleService = (
						await import("../../infrastructure/services/RoleService")
					).default;
					const roleData = await RoleService.checkUserRole(true);

					if (roleData && roleData.success) {
						if (roleData.data.is_admin) {
							redirectPath = "/admin/dashboard";
						} else if (roleData.data.is_seller) {
							redirectPath = "/seller/dashboard";
						}
					}
				} catch (roleError) {
					console.warn(
						"No se pudo obtener información de rol, usando ruta por defecto"
					);
				}

				// Redirigir con un pequeño delay para mostrar el mensaje de éxito
				setTimeout(() => {
					navigate(redirectPath, {replace: true});
				}, 1500);
			} catch (error) {
				console.error("❌ Error procesando Google Auth:", error);
				setError("Error al procesar la autenticación con Google");
				setIsProcessing(false);
			}
		};

		processGoogleAuth();
	}, [searchParams, navigate, setUser, setIsAuthenticated]);

	if (error) {
		return (
			<div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
				<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg text-center">
					<div className="text-red-500 text-6xl mb-4">❌</div>
					<h2 className="text-2xl font-bold text-gray-900">
						Error en la autenticación
					</h2>
					<p className="text-gray-600">{error}</p>
					<button
						onClick={() => navigate("/login")}
						className="w-full py-3 px-4 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
					>
						Volver al inicio de sesión
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
			<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg text-center">
				{isProcessing ? (
					<>
						<div className="text-green-500 text-6xl mb-4">✅</div>
						<h2 className="text-2xl font-bold text-gray-900">
							¡Autenticación exitosa!
						</h2>
						<p className="text-gray-600">
							Procesando tu información y redirigiendo...
						</p>
						<div className="flex justify-center">
							<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
						</div>
					</>
				) : (
					<>
						<div className="text-green-500 text-6xl mb-4">🎉</div>
						<h2 className="text-2xl font-bold text-gray-900">¡Bienvenido!</h2>
						<p className="text-gray-600">
							Tu cuenta se ha configurado correctamente.
						</p>
					</>
				)}
			</div>
		</div>
	);
};

export default GoogleAuthSuccessPage;
