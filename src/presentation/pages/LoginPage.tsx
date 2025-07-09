// src/presentation/pages/LoginPage.tsx - VERSIÓN ACTUALIZADA CON GOOGLE AUTH

import React, {useState} from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import type {UserLoginData} from "../../core/domain/entities/User";
import GoogleAuthCallbackHandler from "../components/auth/GoogleAuthCallbackHandler";

const LoginPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	// Usar el hook de autenticación
	const {login, loading, error} = useAuth();

	// Obtener ruta de redirección si existe
	const from = (location.state as any)?.from?.pathname;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isProcessing) return; // Prevenir múltiples submits

		setIsProcessing(true);

		console.log("🔐 Iniciando proceso de login con:", email);

		try {
			// Preparar las credenciales
			const credentials: UserLoginData = {
				email,
				password,
			};

			// Intentar iniciar sesión
			const result = await login(credentials);

			// Si el inicio de sesión fue exitoso
			if (result) {
				console.log("✅ Login exitoso, obteniendo información de rol...");

				// Usar el servicio directamente para obtener rol inmediatamente
				const RoleService = (
					await import("../../infrastructure/services/RoleService")
				).default;
				const roleData = await RoleService.checkUserRole(true);

				console.log("🎯 Información de rol obtenida:", roleData);

				if (roleData && roleData.success) {
					let targetRoute = from || "/";

					// Determinar ruta basada en rol
					if (roleData.data.is_admin) {
						targetRoute = "/admin/dashboard";
						console.log("👑 Usuario es admin, redirigiendo a:", targetRoute);
					} else if (roleData.data.is_seller) {
						targetRoute = "/seller/dashboard";
						console.log("🏪 Usuario es seller, redirigiendo a:", targetRoute);
					} else {
						targetRoute = from || "/";
						console.log("👤 Usuario normal, redirigiendo a:", targetRoute);
					}

					console.log("🚀 Redirigiendo inmediatamente a:", targetRoute);

					// Redirigir inmediatamente sin setTimeout
					navigate(targetRoute, {replace: true});
				} else {
					console.error("❌ No se pudo obtener información de rol");
					// Si no podemos obtener el rol, ir al home por defecto
					navigate(from || "/", {replace: true});
				}
			} else {
				console.error("❌ Fallo en el login");
			}
		} catch (error) {
			console.error("❌ Error durante el proceso de login:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	// Mostrar loading durante el procesamiento
	if (isProcessing) {
		return (
			<div className="min-h-[80vh] flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Iniciando sesión...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
			<GoogleAuthCallbackHandler />
			<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
				<div className="text-center">
					<h2 className="text-3xl font-extrabold text-gray-900">
						Inicia sesión en tu cuenta
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						O{" "}
						<Link
							to="/register"
							className="font-medium text-primary-600 hover:text-primary-500"
						>
							crea una nueva cuenta
						</Link>
					</p>
				</div>

				{error && (
					<div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
						{error}
					</div>
				)}

				{/* Google Auth Section */}
				<div className="space-y-3">
					<GoogleAuthButton action="login" disabled={loading || isProcessing} />

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-4 bg-white text-gray-500">
								O continuar con email
							</span>
						</div>
					</div>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Correo electrónico
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Contraseña
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									required
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<button
									type="button"
									onClick={togglePasswordVisibility}
									className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
								>
									{showPassword ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
											/>
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
									)}
								</button>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								id="remember_me"
								name="remember_me"
								type="checkbox"
								className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
							/>
							<label
								htmlFor="remember_me"
								className="ml-2 block text-sm text-gray-700"
							>
								Recordarme
							</label>
						</div>

						<div className="text-sm">
							<Link
								to="/forgot-password"
								className="font-medium text-primary-600 hover:text-primary-500"
							>
								¿Olvidaste tu contraseña?
							</Link>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading || isProcessing}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading || isProcessing ? (
								<span className="absolute left-0 inset-y-0 flex items-center pl-3">
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								</span>
							) : null}
							Iniciar sesión
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginPage;
