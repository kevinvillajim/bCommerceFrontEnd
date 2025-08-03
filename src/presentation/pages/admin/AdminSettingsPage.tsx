// src/presentation/pages/admin/AdminSettingsPage.tsx - COMPLETO
import React, { useState } from "react";
import {
  Save,
  Settings,
  Star,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Shield,
  Lock,
  Bell,
  Sliders,
} from "lucide-react";
import RatingConfiguration from "../../components/admin/RatingConfiguration";
import VolumeDiscountManager from "../../components/admin/VolumeDiscountManager";
import ModerationConfiguration from "../../components/admin/ModerationConfiguration";
import SecurityConfiguration from "../../components/admin/SecurityConfiguration";
import NotificationConfiguration from "../../components/admin/NotificationConfiguration";
import SystemLimitsConfiguration from "../../components/admin/SystemLimitsConfiguration";

/**
 * Página de configuración del sistema para el panel de administración
 */
const AdminSettingsPage: React.FC = () => {
	// Estado para el tab activo
	const [activeTab, setActiveTab] = useState<string>("general");
	
	// Estados para configuración general
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	
	// Configuraciones generales básicas
	const [generalSettings, setGeneralSettings] = useState({
		site_name: "Comersia",
		site_description: "Tu marketplace de confianza",
		contact_email: "soporte@comersia.com",
		maintenance_mode: false,
		registration_enabled: true,
		seller_registration_enabled: true,
	});

	// Manejar cambios en configuración general
	const handleGeneralSettingChange = (field: string, value: any) => {
		setGeneralSettings(prev => ({
			...prev,
			[field]: value
		}));
	};

	// Guardar configuración general
	const handleSaveGeneral = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			// Simular llamada a API
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			setSuccess("Configuración general guardada exitosamente");
			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			setError("Error al guardar la configuración general");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 mb-6">
				Configuración del Sistema
			</h1>

			{/* Mensajes globales */}
			{success && (
				<div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
					<div className="flex items-center">
						<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
						<p className="text-green-700">{success}</p>
					</div>
				</div>
			)}

			{error && (
				<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center">
						<AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
						<p className="text-red-700">{error}</p>
					</div>
				</div>
			)}

			{/* Tabs de navegación */}
			<div className="mb-6">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8 overflow-x-auto">
						<button
							onClick={() => setActiveTab("general")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "general"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Settings className="w-5 h-5 inline-block mr-1" />
							General
						</button>
						<button
							onClick={() => setActiveTab("security")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "security"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Lock className="w-5 h-5 inline-block mr-1" />
							Seguridad
						</button>
						<button
							onClick={() => setActiveTab("moderation")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "moderation"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Shield className="w-5 h-5 inline-block mr-1" />
							Moderación
						</button>
						<button
							onClick={() => setActiveTab("ratings")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "ratings"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Star className="w-5 h-5 inline-block mr-1" />
							Valoraciones
						</button>
						<button
							onClick={() => setActiveTab("volume-discounts")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "volume-discounts"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<TrendingDown className="w-5 h-5 inline-block mr-1" />
							Descuentos
						</button>
						<button
							onClick={() => setActiveTab("notifications")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "notifications"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Bell className="w-5 h-5 inline-block mr-1" />
							Notificaciones
						</button>
						<button
							onClick={() => setActiveTab("limits")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "limits"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Sliders className="w-5 h-5 inline-block mr-1" />
							Límites
						</button>
					</nav>
				</div>
			</div>

			{/* Contenido de las pestañas */}
			<div className="bg-white rounded-lg shadow-sm">
				
				{/* Configuración General */}
				{activeTab === "general" && (
					<form onSubmit={handleSaveGeneral} className="p-6">
						<div className="mb-6">
							<h2 className="text-lg font-medium text-gray-900">
								Configuración General del Sistema
							</h2>
							<p className="mt-1 text-sm text-gray-500">
								Configure los aspectos básicos de su tienda.
							</p>
						</div>

						<div className="space-y-6">
							{/* Información básica */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nombre del sitio
									</label>
									<input
										type="text"
										value={generalSettings.site_name}
										onChange={(e) => handleGeneralSettingChange('site_name', e.target.value)}
										className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Email de contacto
									</label>
									<input
										type="email"
										value={generalSettings.contact_email}
										onChange={(e) => handleGeneralSettingChange('contact_email', e.target.value)}
										className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Descripción del sitio
								</label>
								<textarea
									value={generalSettings.site_description}
									onChange={(e) => handleGeneralSettingChange('site_description', e.target.value)}
									rows={3}
									className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
								/>
							</div>

							{/* Opciones generales */}
							<div className="space-y-4">
								<h3 className="text-md font-medium text-gray-900">Opciones del Sistema</h3>
								
								<div className="space-y-3">
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={generalSettings.maintenance_mode}
											onChange={(e) => handleGeneralSettingChange('maintenance_mode', e.target.checked)}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
										<span className="ml-2 text-sm text-gray-700">
											Modo de mantenimiento
										</span>
									</label>
									
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={generalSettings.registration_enabled}
											onChange={(e) => handleGeneralSettingChange('registration_enabled', e.target.checked)}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
										<span className="ml-2 text-sm text-gray-700">
											Permitir registro de nuevos usuarios
										</span>
									</label>
									
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={generalSettings.seller_registration_enabled}
											onChange={(e) => handleGeneralSettingChange('seller_registration_enabled', e.target.checked)}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
										<span className="ml-2 text-sm text-gray-700">
											Permitir registro de nuevos vendedores
										</span>
									</label>
								</div>
							</div>
						</div>

						{/* Botones de acción */}
						<div className="mt-8 flex justify-end space-x-3">
							<button
								type="button"
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
								onClick={() => window.location.reload()}
							>
								<RefreshCw className="w-4 h-4 inline mr-2" />
								Restablecer
							</button>
							<button
								type="submit"
								disabled={isLoading}
								className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
							>
								{isLoading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
										Guardando...
									</>
								) : (
									<>
										<Save className="w-4 h-4 mr-2" />
										Guardar Cambios
									</>
								)}
							</button>
						</div>
					</form>
				)}

				{/* Configuración de Seguridad */}
				{activeTab === "security" && (
					<div className="p-6">
						<SecurityConfiguration />
					</div>
				)}

				{/* Configuración de Moderación */}
				{activeTab === "moderation" && (
					<div className="p-6">
						<ModerationConfiguration />
					</div>
				)}

				{/* Configuración de Valoraciones */}
				{activeTab === "ratings" && (
					<div className="p-6">
						<RatingConfiguration />
					</div>
				)}

				{/* Descuentos por Volumen */}
				{activeTab === "volume-discounts" && (
					<div className="p-6">
						<VolumeDiscountManager />
					</div>
				)}

				{/* Configuración de Notificaciones */}
				{activeTab === "notifications" && (
					<div className="p-6">
						<NotificationConfiguration />
					</div>
				)}

				{/* Límites del Sistema */}
				{activeTab === "limits" && (
					<div className="p-6">
						<SystemLimitsConfiguration />
					</div>
				)}

			</div>
		</div>
	);
};

export default AdminSettingsPage;