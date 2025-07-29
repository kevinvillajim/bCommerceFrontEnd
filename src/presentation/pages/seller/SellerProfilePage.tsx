import React, { useState } from "react";
import {
	User,
	Store,
	Lock,
	Mail,
	Phone,
	MapPin,
	ChevronRight,
	Save,
	AlertCircle,
	CheckCircle,
	Eye,
	EyeOff,
} from "lucide-react";
import { useSellerProfile } from "../../hooks/useSellerProfile";

const SellerProfilePage: React.FC = () => {
	const {
		profileData,
		loading,
		error,
		success,
		updateProfile,
		changePassword,
		clearMessages,
	} = useSellerProfile();

	// Estados para los formularios - inicializar solo una vez
	const [personalData, setPersonalData] = useState({
		name: "",
		phone: "",
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
	const [isInitialized, setIsInitialized] = useState(false);

	// Inicializar estados cuando cambie profileData - solo una vez
	React.useEffect(() => {
		if (profileData.name && !isInitialized) {
			setPersonalData({
				name: profileData.name,
				phone: profileData.phone || "",
				location: profileData.location || "",
			});
			setStoreData({
				storeName: profileData.storeName || "",
				storeDescription: profileData.storeDescription || "",
			});
			setIsInitialized(true);
		}
	}, [profileData.name, profileData.phone, profileData.location, profileData.storeName, profileData.storeDescription, isInitialized]);

	// Limpiar mensajes después de unos segundos
	React.useEffect(() => {
		if (error || success) {
			const timer = setTimeout(() => {
				clearMessages();
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [error, success, clearMessages]);

	const handlePersonalDataChange = (field: string, value: string) => {
		setPersonalData(prev => ({ ...prev, [field]: value }));
		setHasChanges(true);
	};

	const handleStoreDataChange = (field: string, value: string) => {
		setStoreData(prev => ({ ...prev, [field]: value }));
		setHasChanges(true);
	};

	const handlePasswordChange = (field: string, value: string) => {
		setPasswordData(prev => ({ ...prev, [field]: value }));
	};

	const handleSaveProfile = async () => {
		const profileUpdates = {
			name: personalData.name,
			phone: personalData.phone,
			location: personalData.location,
			store_name: storeData.storeName,
			store_description: storeData.storeDescription,
		};

		const success = await updateProfile(profileUpdates);
		if (success) {
			setHasChanges(false);
		}
	};

	const handleChangePassword = async () => {
		if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
			alert("Por favor completa todos los campos de contraseña.");
			return;
		}

		const success = await changePassword(passwordData);
		if (success) {
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

	return (
		<div className="space-y-6">
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
						<img
							src={profileData.avatar || "https://i.pravatar.cc/150"}
							alt="Seller profile"
							className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
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
								placeholder="Nombre completo"
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
							<Phone size={18} className="text-gray-500 mr-3 flex-shrink-0" />
							<input
								type="tel"
								value={personalData.phone}
								onChange={(e) => handlePersonalDataChange("phone", e.target.value)}
								placeholder="Número de teléfono"
								className="w-full bg-transparent focus:outline-none text-gray-700 border-b border-gray-300 pb-1 focus:border-primary-500"
							/>
						</div>
						<div className="flex items-center">
							<MapPin size={18} className="text-gray-500 mr-3 flex-shrink-0" />
							<input
								type="text"
								value={personalData.location}
								onChange={(e) => handlePersonalDataChange("location", e.target.value)}
								placeholder="Ciudad, País"
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
								placeholder="Mi Tienda Online"
								className="w-full bg-transparent focus:outline-none text-gray-700 border-b border-gray-300 pb-1 focus:border-primary-500"
							/>
						</div>
						<div>
							<label className="block text-sm text-gray-500 mb-1">
								Descripción
							</label>
							<textarea
								value={storeData.storeDescription}
								onChange={(e) => handleStoreDataChange("storeDescription", e.target.value)}
								placeholder="Descripción de la tienda..."
								className="w-full bg-transparent focus:outline-none text-gray-700 border-b border-gray-300 pb-1 focus:border-primary-500 resize-none"
								rows={3}
							/>
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
					onClick={() => {
						setPersonalData({
							name: profileData.name,
							phone: profileData.phone || "",
							location: profileData.location || "",
						});
						setStoreData({
							storeName: profileData.storeName || "",
							storeDescription: profileData.storeDescription || "",
						});
						setHasChanges(false);
					}}
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