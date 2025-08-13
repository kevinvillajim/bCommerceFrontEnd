// src/presentation/pages/RegisterPage.tsx - VERSIÓN ACTUALIZADA CON GOOGLE AUTH

import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import {usePasswordValidation} from "../hooks/usePasswordValidation";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import type {UserRegistrationData} from "../../core/domain/entities/User";
import GoogleAuthCallbackHandler from "../components/auth/GoogleAuthCallbackHandler";


const RegisterPage: React.FC = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const navigate = useNavigate();
	const {register, loading, error} = useAuth();
	const {rules: passwordRules, loading: rulesLoading, validatePassword} = usePasswordValidation();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when field is changed
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = {...prev};
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Validate first name
		if (!formData.firstName.trim()) {
			newErrors.firstName = "El nombre es obligatorio";
		}

		// Validate last name
		if (!formData.lastName.trim()) {
			newErrors.lastName = "El apellido es obligatorio";
		}

		// Validate email
		if (!formData.email.trim()) {
			newErrors.email = "El correo electrónico es obligatorio";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "El correo electrónico no es válido";
		}

		// Validate password
		if (!formData.password) {
			newErrors.password = "La contraseña es obligatoria";
		} else {
			const passwordValidation = validatePassword(formData.password);
			if (!passwordValidation.isValid) {
				newErrors.password = passwordValidation.errors[0]; // Mostrar el primer error
			}
		}

		// Validate password confirmation
		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Las contraseñas no coinciden";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Preparar datos para el registro según la interfaz UserRegistrationData
		const userData: UserRegistrationData = {
			name: `${formData.firstName} ${formData.lastName}`,
			email: formData.email,
			password: formData.password,
			password_confirmation: formData.confirmPassword,
		};

		// Intentar registrar al usuario
		const result = await register(userData);

		// Si el registro fue exitoso, verificar si requiere verificación de email
		if (result) {
			// Verificar si el usuario necesita verificar el email
			if (result.user && !result.user.emailVerifiedAt) {
				// Redirigir a la página de verificación de email
				navigate("/verify-email", {
					state: {
						email: result.user.email,
						message: "Registro completado. Revisa tu correo para verificar tu cuenta."
					}
				});
			} else {
				// Si no requiere verificación, ir al home
				navigate("/");
			}
		}
	};

	return (
		<div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
			<GoogleAuthCallbackHandler />
			<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
				<div className="text-center">
					<h2 className="text-3xl font-extrabold text-gray-900">
						Crea tu cuenta
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						¿Ya tienes una cuenta?{" "}
						<Link
							to="/login"
							className="font-medium text-primary-600 hover:text-primary-500"
						>
							Inicia sesión
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
					<GoogleAuthButton action="register" disabled={loading} />

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-4 bg-white text-gray-500">
								O registrarse con email
							</span>
						</div>
					</div>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-700"
								>
									Nombre
								</label>
								<input
									id="firstName"
									name="firstName"
									type="text"
									autoComplete="given-name"
									required
									className={`mt-1 block w-full border ${errors.firstName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
									value={formData.firstName}
									onChange={handleChange}
								/>
								{errors.firstName && (
									<p className="mt-1 text-sm text-red-600">
										{errors.firstName}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-700"
								>
									Apellido
								</label>
								<input
									id="lastName"
									name="lastName"
									type="text"
									autoComplete="family-name"
									required
									className={`mt-1 block w-full border ${errors.lastName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
									value={formData.lastName}
									onChange={handleChange}
								/>
								{errors.lastName && (
									<p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
								)}
							</div>
						</div>

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
								className={`mt-1 block w-full border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
								value={formData.email}
								onChange={handleChange}
							/>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600">{errors.email}</p>
							)}
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Contraseña
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								minLength={passwordRules.minLength}
								className={`mt-1 block w-full border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
								value={formData.password}
								onChange={handleChange}
							/>
							{errors.password && (
								<p className="mt-1 text-sm text-red-600">{errors.password}</p>
							)}
							{!rulesLoading && !errors.password && (
								<div className="mt-2">
									<p className="text-xs text-gray-600 mb-1">
										La contraseña debe tener al menos {passwordRules.minLength} caracteres{passwordRules.requirements.length > 0 && ' e incluir:'}
									</p>
									{passwordRules.requirements.length > 0 && (
										<ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
											{passwordRules.requirements.map((req, index) => (
												<li key={index}>{req}</li>
											))}
										</ul>
									)}
								</div>
							)}
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700"
							>
								Confirmar contraseña
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								className={`mt-1 block w-full border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm p-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
								value={formData.confirmPassword}
								onChange={handleChange}
							/>
							{errors.confirmPassword && (
								<p className="mt-1 text-sm text-red-600">
									{errors.confirmPassword}
								</p>
							)}
						</div>
					</div>

					<div className="flex items-center">
						<input
							id="terms"
							name="terms"
							type="checkbox"
							required
							className="cursor-pointer h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
						/>
						<label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
							Acepto los{" "}
							<Link
								to="/terms"
								className="font-medium text-primary-600 hover:text-primary-500"
							>
								Términos de Servicio
							</Link>{" "}
							y{" "}
							<Link
								to="/privacy"
								className="font-medium text-primary-600 hover:text-primary-500"
							>
								Política de Privacidad
							</Link>
						</label>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="cursor-pointer group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
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
							Crear Cuenta
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RegisterPage;
