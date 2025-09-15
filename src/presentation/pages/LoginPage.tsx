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
	const [emailNotVerified, setEmailNotVerified] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	// Usar el hook de autenticación
	const {login, loading, error} = useAuth();

	// Obtener ruta de redirección si existe
	const from = (location.state as any)?.from?.pathname;
	
	// Obtener mensaje de verificación desde el registro
	const verificationMessage = (location.state as any)?.message;
	const verificationEmail = (location.state as any)?.email;
	
	// Verificar si viene desde verificación exitosa
	const verifiedParam = new URLSearchParams(location.search).get('verified');

	// Verificar si viene desde sesión expirada
	const sessionExpiredParam = new URLSearchParams(location.search).get('sessionExpired');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isProcessing) return; // Prevenir múltiples submits

		setIsProcessing(true);

		console.log("🔐 Iniciando proceso de login con:", email);

		try {
			// Reset email verification state
			setEmailNotVerified(false);
			
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
				// Check if it's an email verification error
				if (error && typeof error === 'string' && error.includes('verificar')) {
					setEmailNotVerified(true);
				}
			}
		} catch (error: any) {
			console.error("❌ Error durante el proceso de login:", error);
			// Check if it's an email verification error
			if (error?.response?.status === 409 && error?.response?.data?.error_code === 'EMAIL_NOT_VERIFIED') {
				setEmailNotVerified(true);
			}
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

				{/* Mensaje de verificación exitosa */}
				{verifiedParam && (
					<div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
						<div className="flex items-center">
							<svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							<span className="font-medium">¡Email verificado correctamente!</span>
						</div>
						<p className="mt-1 text-sm">Tu cuenta está ahora activa. Puedes iniciar sesión normalmente.</p>
					</div>
				)}

				{/* Mensaje de sesión expirada */}
				{sessionExpiredParam && (
					<div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-md">
						<div className="flex items-center">
							<svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
							</svg>
							<span className="font-medium">Tu sesión expiró</span>
						</div>
						<p className="mt-1 text-sm">Por favor, vuelve a iniciar sesión para continuar navegando.</p>
					</div>
				)}

				{/* Mensaje de verificación pendiente */}
				{verificationMessage && (
					<div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md">
						<div className="flex items-start">
							<svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
								<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
								<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
							</svg>
							<div>
								{!verificationMessage && (
									<p className="font-medium">Revisa tu correo electrónico</p>
								)}
								<p className="mt-1 text-sm">{verificationMessage}</p>
								{verificationEmail && (
									<p className="mt-1 text-xs text-blue-600">Enviado a: {verificationEmail}</p>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Mensaje de email no verificado en login */}
				{emailNotVerified && (
					<div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-md">
						<div className="flex items-start">
							<svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
							<div className="w-full">
								<p className="font-medium">Email no verificado</p>
								<p className="mt-1 text-sm">Debes verificar tu dirección de correo electrónico antes de iniciar sesión.</p>
								<div className="mt-3 flex space-x-3">
									<button
										onClick={() => navigate('/email-verification-pending', { state: { email } })}
										className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded transition-colors"
									>
										Ver instrucciones de verificación
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

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
