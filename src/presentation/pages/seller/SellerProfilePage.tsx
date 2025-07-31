import React, { useState, useRef, useEffect } from "react";
import {
	User,
	Store,
	Lock,
	Mail,
	MapPin,
	ChevronRight,
	Save,
	AlertCircle,
	CheckCircle,
	Eye,
	EyeOff,
	Camera,
} from "lucide-react";
import { useSellerProfile } from "../../hooks/useSellerProfile";

const SellerProfilePage: React.FC = () => {
	const {
		profileData,
		loading,
		error,
		success,
		updateProfile,
		uploadAvatar,
		changePassword,
		clearMessages,
	} = useSellerProfile();

	// Estados para los formularios
	const [personalData, setPersonalData] = useState({
		name: "",
		location: "",
	});

	const [storeData, setStoreData] = useState({
		storeName: "",
		storeDescription: "",
	});

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	const [hasChanges, setHasChanges] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState(false);
	const [imageLoadError, setImageLoadError] = useState(false);
	
	const fileInputRef = useRef<HTMLInputElement>(null);

	// ✅ ARREGLADO: Usar useEffect específico para inicialización una sola vez
	useEffect(() => {
		if (profileData.name && !isInitialized) {
			console.log('🔄 Inicializando datos del perfil por primera vez:', profileData);
			
			setPersonalData({
				name: profileData.name || "",
				location: profileData.location || "",
			});
			
			setStoreData({
				storeName: profileData.storeName || "",
				storeDescription: profileData.storeDescription || "",
			});
			
			setIsInitialized(true);
		}
	}, [profileData.name, profileData.location, profileData.storeName, profileData.storeDescription, isInitialized]);

	// ✅ ARREGLADO: Usar useEffect separado para actualizar datos después de guardado exitoso
	useEffect(() => {
		if (success && isInitialized) {
			console.log('✅ Datos guardados exitosamente, actualizando formulario');
			
			setPersonalData({
				name: profileData.name || "",
				location: profileData.location || "",
			});
			
			setStoreData({
				storeName: profileData.storeName || "",
				storeDescription: profileData.storeDescription || "",
			});
			
			setHasChanges(false);
		}
	}, [success, profileData.name, profileData.location, profileData.storeName, profileData.storeDescription, isInitialized]);

	// Limpiar mensajes después de unos segundos
	useEffect(() => {
		if (error || success) {
			const timer = setTimeout(() => {
				clearMessages();
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [error, success, clearMessages]);

	// ✅ Debug: mostrar datos en consola (solo cuando cambian realmente)
	useEffect(() => {
		if (isInitialized) {
			console.log('🎯 Estados actualizados:', {
				personalData,
				storeData,
				hasChanges
			});
		}
	}, [personalData.name, personalData.location, storeData.storeName, storeData.storeDescription, hasChanges, isInitialized]);

	const handlePersonalDataChange = (field: string, value: string) => {
		console.log(`📝 Cambiando ${field}:`, value);
		setPersonalData(prev => ({ ...prev, [field]: value }));
		setHasChanges(true);
	};

	const handleStoreDataChange = (field: string, value: string) => {
		console.log(`🏪 Cambiando ${field}:`, value);
		setStoreData(prev => ({ ...prev, [field]: value }));
		setHasChanges(true);
	};

	const handlePasswordChange = (field: string, value: string) => {
		setPasswordData(prev => ({ ...prev, [field]: value }));
	};

	const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validar tipo de archivo
			if (!file.type.startsWith('image/')) {
				alert('Por favor selecciona una imagen válida.');
				return;
			}

			// Validar tamaño (máximo 5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert('La imagen debe ser menor a 5MB.');
				return;
			}

			console.log('📷 Avatar seleccionado:', file.name, file.size);
			setAvatarFile(file);
			setHasChanges(true);
			setImageLoadError(false); // Resetear error de imagen

			// Mostrar preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setAvatarPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSaveProfile = async () => {
		console.log('💾 Iniciando guardado del perfil...');
		
		// Subir avatar si hay uno nuevo
		if (avatarFile) {
			console.log('📷 Subiendo avatar primero...');
			const avatarSuccess = await uploadAvatar(avatarFile);
			if (!avatarSuccess) {
				console.error('❌ Falló la subida del avatar');
				return; // Si falla el avatar, no continuar
			}
			setAvatarFile(null);
			setAvatarPreview(null);
			setImageLoadError(false); // Resetear error de imagen tras éxito
			console.log('✅ Avatar subido exitosamente');
		}

		// Actualizar perfil con todos los datos
		const profileUpdates = {
			name: personalData.name,
			location: personalData.location,
			storeName: storeData.storeName,
			storeDescription: storeData.storeDescription,
		};

		console.log('📤 Actualizando perfil con datos:', profileUpdates);
		const success = await updateProfile(profileUpdates);
		
		if (success) {
			console.log('✅ Perfil actualizado exitosamente');
			setImageLoadError(false); // Resetear error de imagen tras éxito
			// No cambiar hasChanges aquí, lo hará el useEffect cuando reciba success
		} else {
			console.error('❌ Falló la actualización del perfil');
		}
	};

	const handleChangePassword = async () => {
		if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
			alert("Por favor completa todos los campos de contraseña.");
			return;
		}

		console.log('🔐 Cambiando contraseña...');
		const success = await changePassword(passwordData);
		if (success) {
			console.log('✅ Contraseña cambiada exitosamente');
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		}
	};

	const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
		setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
	};

	const handleCancelChanges = () => {
		console.log('❌ Cancelando cambios...');
		setPersonalData({
			name: profileData.name || "",
			location: profileData.location || "",
		});
		setStoreData({
			storeName: profileData.storeName || "",
			storeDescription: profileData.storeDescription || "",
		});
		setAvatarFile(null);
		setAvatarPreview(null);
		setImageLoadError(false); // Resetear error de imagen
		setHasChanges(false);
	};

	// Función para obtener la URL del avatar
	const getAvatarUrl = (): string | undefined => {
		if (avatarPreview) return avatarPreview;
		if (profileData.avatar && !imageLoadError) {
			// Si la URL ya incluye el dominio, usarla tal como está
			if (profileData.avatar.startsWith('http')) {
				return profileData.avatar;
			}
			// Si es una ruta relativa, construir la URL completa
			return `${import.meta.env.VITE_URL_BASE || 'http://127.0.0.1:8000'}/storage/${profileData.avatar}`;
		}
		return undefined; // Sin imagen, mostrar inicial
	};

	// Función para obtener la inicial del usuario
	const getUserInitial = () => {
		if (profileData.name) {
			return profileData.name.charAt(0).toUpperCase();
		}
		return 'U';
	};

	// ✅ ARREGLADO: No mostrar nada hasta que esté inicializado
	if (!isInitialized) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Debug Info - Solo mostrar en desarrollo */}
			{import.meta.env.NODE_ENV === 'development' && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs">
					<details>
						<summary className="cursor-pointer font-medium">🔍 Debug Info</summary>
						<pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
							{JSON.stringify({ 
								profileData: {
									name: profileData.name,
									location: profileData.location,
									storeName: profileData.storeName,
									storeDescription: profileData.storeDescription,
									avatar: profileData.avatar
								}, 
								personalData, 
								storeData, 
								hasChanges,
								isInitialized,
								imageLoadError,
								avatarPreview: avatarPreview ? 'preview-set' : null
							}, null, 2)}
						</pre>
					</details>
				</div>
			)}

			{/* Mensajes de estado */}
			{error && (
				<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
					<div className="flex">
						<AlertCircle className="h-5 w-5 text-red-500" />
						<div className="ml-3">
							<p className="text-sm text-red-700">{error}</p>
						</div>
					</div>
				</div>
			)}

			{success && (
				<div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
					<div className="flex">
						<CheckCircle className="h-5 w-5 text-green-500" />
						<div className="ml-3">
							<p className="text-sm text-green-700">{success}</p>
						</div>
					</div>
				</div>
			)}

			{/* Header Section */}
			<div className="bg-white rounded-lg shadow-sm p-6">
				<div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
					<div className="relative">
						{getAvatarUrl() ? (
							<img
								src={getAvatarUrl()}
								alt="Seller profile"
								className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
								onError={() => {
									console.error('❌ Error cargando imagen:', getAvatarUrl());
									// Marcar que hay error de carga para mostrar la inicial
									setImageLoadError(true);
								}}
								onLoad={() => {
									// Si la imagen se carga correctamente, resetear el error
									setImageLoadError(false);
								}}
							/>
						) : (
							<div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center border-4 border-white shadow-md">
								<span className="text-white text-2xl font-bold">
									{getUserInitial()}
								</span>
							</div>
						)}
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700 transition-colors shadow-lg"
							title="Cambiar imagen de perfil"
						>
							<Camera size={16} />
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleAvatarChange}
							className="hidden"
						/>
					</div>

					<div className="flex-1 text-center md:text-left">
						<h1 className="text-2xl font-bold text-gray-900">
							{profileData.name || "Nombre del Vendedor"}
						</h1>
						<p className="text-gray-500">
							{profileData.email}
						</p>
						<div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
							<button className="flex items-center justify-center text-primary-600 hover:underline">
								<Store size={16} className="mr-1" />
								Ver tienda 
								<ChevronRight size={16} className="ml-1" />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Profile Sections */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Personal Information */}
				<div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
					<h3 className="flex items-center text-lg font-medium text-gray-900">
						<User size={20} className="mr-3 text-primary-600" />
						Información Personal
					</h3>
					<div className="space-y-4">
						<div className="flex items-center">
							<User size={18} className="text-gray-500 mr-3 flex-shrink-0" />
							<input
								type="text"
								value={personalData.name}
								onChange={(e) => handlePersonalDataChange("name", e.target.value)}
								placeholder={profileData.name || "Nombre completo"}
								className="w-full bg-transparent focus:outline-none text-gray-700 border-b border-gray-300 pb-1 focus:border-primary-500"
							/>
						</div>
						<div className="flex items-center">
							<Mail size={18} className="text-gray-500 mr-3 flex-shrink-0" />
							<input
								type="email"
								value={profileData.email}
								disabled
								className="w-full bg-gray-50 text-gray-500 cursor-not-allowed border-b border-gray-300 pb-1"
							/>
						</div>
						<div className="flex items-center">
							<MapPin size={18} className="text-gray-500 mr-3 flex-shrink-0" />
							<input
								type="text"
								value={personalData.location}
								onChange={(e) => handlePersonalDataChange("location", e.target.value)}
								placeholder={profileData.location || "Ciudad, País"}
								className="w-full bg-transparent focus:outline-none text-gray-700 border-b border-gray-300 pb-1 focus:border-primary-500"
							/>
						</div>
					</div>
				</div>

				{/* Store Information */}
				<div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
					<h3 className="flex items-center text-lg font-medium text-gray-900">
						<Store size={20} className="mr-3 text-blue-600" />
						Información de la Tienda
					</h3>
					<div className="space-y-4">
						<div>
							<label className="block text-sm text-gray-500 mb-1">
								Nombre de tienda
							</label>
							<input
								type="text"
								value={storeData.storeName}
								onChange={(e) => handleStoreDataChange("storeName", e.target.value)}
								placeholder={profileData.storeName || "Mi Tienda Online"}
								className="w-full bg-transparent focus:outline-none text-gray-700 border-b border-gray-300 pb-1 focus:border-primary-500"
							/>
							{profileData.storeName && (
								<p className="text-xs text-gray-400 mt-1">Actual: {profileData.storeName}</p>
							)}
						</div>
						<div>
							<label className="block text-sm text-gray-500 mb-1">
								Descripción
							</label>
							<textarea
								value={storeData.storeDescription}
								onChange={(e) => handleStoreDataChange("storeDescription", e.target.value)}
								placeholder={profileData.storeDescription || "Descripción de la tienda..."}
								className="w-full bg-transparent focus:outline-none text-gray-700 border-b border-gray-300 pb-1 focus:border-primary-500 resize-none"
								rows={3}
							/>
							{profileData.storeDescription && (
								<p className="text-xs text-gray-400 mt-1">Actual: {profileData.storeDescription}</p>
							)}
						</div>
					</div>
				</div>

				{/* Security */}
				<div className="bg-white rounded-lg shadow-sm p-6 space-y-4 md:col-span-2">
					<h3 className="flex items-center text-lg font-medium text-gray-900">
						<Lock size={20} className="mr-3 text-red-600" />
						Cambiar Contraseña
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="space-y-2">
							<label className="text-sm text-gray-500">
								Contraseña actual
							</label>
							<div className="relative">
								<input
									type={showPasswords.current ? "text" : "password"}
									value={passwordData.currentPassword}
									onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
									className="w-full bg-gray-50 rounded-lg px-4 py-2 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
								<button
									type="button"
									onClick={() => togglePasswordVisibility("current")}
									className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
								>
									{showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</div>
						<div className="space-y-2">
							<label className="text-sm text-gray-500">
								Nueva contraseña
							</label>
							<div className="relative">
								<input
									type={showPasswords.new ? "text" : "password"}
									value={passwordData.newPassword}
									onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
									className="w-full bg-gray-50 rounded-lg px-4 py-2 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
								<button
									type="button"
									onClick={() => togglePasswordVisibility("new")}
									className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
								>
									{showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</div>
						<div className="space-y-2">
							<label className="text-sm text-gray-500">
								Confirmar contraseña
							</label>
							<div className="relative">
								<input
									type={showPasswords.confirm ? "text" : "password"}
									value={passwordData.confirmPassword}
									onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
									className="w-full bg-gray-50 rounded-lg px-4 py-2 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
								<button
									type="button"
									onClick={() => togglePasswordVisibility("confirm")}
									className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
								>
									{showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</div>
					</div>
					<div className="flex justify-end">
						<button 
							onClick={handleChangePassword}
							disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
							className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Cambiando..." : "Cambiar Contraseña"}
						</button>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-end space-x-4">
				<button 
					onClick={handleCancelChanges}
					disabled={loading || !hasChanges}
					className="px-6 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Cancelar
				</button>
				<button 
					onClick={handleSaveProfile}
					disabled={loading || !hasChanges}
					className="px-6 py-2 bg-primary-600 rounded-lg text-white hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
				>
					{loading ? (
						<>
							<span className="inline-block animate-spin mr-1">⟳</span>
							Guardando...
						</>
					) : (
						<>
							<Save size={18} className="mr-2" />
							Guardar cambios
						</>
					)}
				</button>
			</div>
		</div>
	);
};

export default SellerProfilePage;