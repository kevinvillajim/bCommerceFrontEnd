// src/presentation/pages/admin/AdminSettingsPage.tsx - ACTUALIZADO
import React, { useState } from "react";
import {
  Save,
  Mail,
  Shield,
  CreditCard,
  Settings,
  HelpCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  Globe,
  Clock,
  X,
  Upload,
  FileCheck,
  TrendingDown, // Añadido para descuentos por volumen
} from "lucide-react";
import RatingConfiguration from "../../components/admin/RatingConfiguration";
import VolumeDiscountManager from "../../components/admin/VolumeDiscountManager"; // Componente nuevo

// ... resto de componentes Modal y Alert (igual que antes) ...

/**
 * Página de configuración del sistema para el panel de administración
 */
const AdminSettingsPage: React.FC = () => {
	// Estado para el tab activo - ACTUALIZADO para incluir volume-discounts
	const [activeTab, setActiveTab] = useState<string>("general");

	// ... todos los demás estados (iguales que antes) ...

	// ... todas las funciones (iguales que antes) ...

	return (
		<div>
			<RatingConfiguration/>
			<h1 className="text-2xl font-bold text-gray-900 mb-6">
				Configuración del Sistema
			</h1>

			{/* ... Alerta (igual que antes) ... */}

			{/* Tabs de navegación - ACTUALIZADO */}
			<div className="mb-6">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-4 overflow-x-auto sm:space-x-8">
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
							onClick={() => setActiveTab("email")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "email"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Mail className="w-5 h-5 inline-block mr-1" />
							Correo
						</button>
						<button
							onClick={() => setActiveTab("security")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "security"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Shield className="w-5 h-5 inline-block mr-1" />
							Seguridad
						</button>
						<button
							onClick={() => setActiveTab("payment")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "payment"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<CreditCard className="w-5 h-5 inline-block mr-1" />
							Pagos
						</button>
						{/* NUEVA PESTAÑA - Descuentos por Volumen */}
						<button
							onClick={() => setActiveTab("volume-discounts")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "volume-discounts"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<TrendingDown className="w-5 h-5 inline-block mr-1" />
							Descuentos por Volumen
						</button>
						<button
							onClick={() => setActiveTab("integrations")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "integrations"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Globe className="w-5 h-5 inline-block mr-1" />
							Integraciones
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
							onClick={() => setActiveTab("backup")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "backup"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Database className="w-5 h-5 inline-block mr-1" />
							Respaldo
						</button>
					</nav>
				</div>
			</div>

			{/* Contenido del formulario */}
			<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
				
				{/* ... Todas las secciones existentes (general, email, security, payment) ... */}

				{/* NUEVA SECCIÓN - Descuentos por Volumen */}
				{activeTab === "volume-discounts" && (
					<div className="p-6">
						<div className="mb-6">
							<h2 className="text-lg font-medium text-gray-900">
								Gestión de Descuentos por Volumen
							</h2>
							<p className="mt-1 text-sm text-gray-500">
								Configure y gestione los descuentos por volumen de su tienda.
							</p>
						</div>
						
						{/* Integrar el componente VolumeDiscountManager */}
						<VolumeDiscountManager />
					</div>
				)}

				{/* ... Resto de secciones existentes (integrations, notifications, backup) ... */}

				{/* Botones de acción del formulario - SOLO se muestran si NO estamos en volume-discounts */}
				{activeTab !== "volume-discounts" && (
					<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
						<button
							type="button"
							onClick={() => setIsResetSettingsModalOpen(true)}
							className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
						>
							<RefreshCw className="w-4 h-4 mr-2" />
							Restaurar valores predeterminados
						</button>
						<div className="flex space-x-3">
							<button
								type="button"
								className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
							>
								Cancelar
							</button>
							<button
								type="submit"
								disabled={isProcessing}
								className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none ${isProcessing ? "opacity-70 cursor-not-allowed" : ""}`}
							>
								{isProcessing ? (
									<>
										<svg
											className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
										Guardando...
									</>
								) : (
									<>
										<Save className="w-4 h-4 mr-2" />
										Guardar cambios
									</>
								)}
							</button>
						</div>
					</div>
				)}
			</form>

			{/* ... Todos los modales existentes (iguales que antes) ... */}

		</div>
	);
};

// Importación faltante de Bell
import {Bell} from "lucide-react";

export default AdminSettingsPage;