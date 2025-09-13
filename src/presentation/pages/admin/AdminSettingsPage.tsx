// src/presentation/pages/admin/AdminSettingsPage.tsx - COMPLETO
import React, { useState } from "react";
// Imports de íconos para todos los tabs
import {
  Lock,
  Shield,
  Star,
  TrendingDown,
  Truck,
  Code,
  DollarSign,
  FileText,
} from "lucide-react";
// Imports de todos los componentes de configuración
import SecurityConfiguration from "../../components/admin/SecurityConfiguration";
import ModerationConfiguration from "../../components/admin/ModerationConfiguration";
import RatingConfiguration from "../../components/admin/RatingConfiguration";
import VolumeDiscountManager from "../../components/admin/VolumeDiscountManager";
import ShippingConfiguration from "../../components/admin/ShippingConfiguration";
import DevelopmentConfiguration from "../../components/admin/DevelopmentConfiguration";
import FinancialConfiguration from "../../components/admin/FinancialConfiguration";
import SriConfiguration from "../../components/admin/SriConfiguration";

/**
 * Página de configuración del sistema para el panel de administración
 */
const AdminSettingsPage: React.FC = () => {
	// 🎯 JORDAN: Solo tabs críticos disponibles temporalmente
	const [activeTab, setActiveTab] = useState<string>("security");
	
	// Estados para mensajes globales (comentados porque no se usan actualmente)
	// const [success, setSuccess] = useState<string | null>(null);
	// const [error, setError] = useState<string | null>(null);

	return (
		<div>
			<h1 className="text-2xl font-bold text-gray-900 mb-6">
				Configuración del Sistema
			</h1>

			{/* Mensajes globales - comentados porque no se usan actualmente */}
			{/* {success && (
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
			)} */}

			{/* Tabs de navegación */}
			<div className="mb-6">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8 overflow-x-auto">
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
							onClick={() => setActiveTab("rating")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "rating"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Star className="w-5 h-5 inline-block mr-1" />
							Calificaciones
						</button>
						<button
							onClick={() => setActiveTab("volume_discount")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "volume_discount"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<TrendingDown className="w-5 h-5 inline-block mr-1" />
							Descuentos por Volumen
						</button>
						<button
							onClick={() => setActiveTab("shipping")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "shipping"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Truck className="w-5 h-5 inline-block mr-1" />
							Envíos
						</button>
						<button
							onClick={() => setActiveTab("development")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "development"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<Code className="w-5 h-5 inline-block mr-1" />
							Desarrollo
						</button>
						<button
							onClick={() => setActiveTab("financial")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "financial"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<DollarSign className="w-5 h-5 inline-block mr-1" />
							Financiero
						</button>
						<button
							onClick={() => setActiveTab("sri")}
							className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
								activeTab === "sri"
									? "border-primary-500 text-primary-600"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<FileText className="w-5 h-5 inline-block mr-1" />
							SRI / Facturación
						</button>
					</nav>
				</div>
			</div>

			{/* Contenido de las pestañas */}
			<div className="bg-white rounded-lg shadow-sm">

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

				{/* Configuración de Calificaciones */}
				{activeTab === "rating" && (
					<div className="p-6">
						<RatingConfiguration />
					</div>
				)}

				{/* Configuración de Descuentos por Volumen */}
				{activeTab === "volume_discount" && (
					<div className="p-6">
						<VolumeDiscountManager />
					</div>
				)}

				{/* Configuración de Envíos */}
				{activeTab === "shipping" && (
					<div className="p-6">
						<ShippingConfiguration />
					</div>
				)}

				{/* Configuración de Desarrollo */}
				{activeTab === "development" && (
					<div className="p-6">
						<DevelopmentConfiguration />
					</div>
				)}

				{/* Configuración Financiera */}
				{activeTab === "financial" && (
					<div className="p-6">
						<FinancialConfiguration />
					</div>
				)}

				{/* Configuración SRI */}
				{activeTab === "sri" && (
					<div className="p-6">
						<SriConfiguration />
					</div>
				)}

			</div>
		</div>
	);
};

export default AdminSettingsPage;