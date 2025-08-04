// src/presentation/pages/admin/AdminSettingsPage.tsx - COMPLETO
import React, { useState } from "react";
import {
  Star,
  TrendingDown,
  Shield,
  Lock,
  Truck,
} from "lucide-react";
import RatingConfiguration from "../../components/admin/RatingConfiguration";
import VolumeDiscountManager from "../../components/admin/VolumeDiscountManager";
import ModerationConfiguration from "../../components/admin/ModerationConfiguration";
import SecurityConfiguration from "../../components/admin/SecurityConfiguration";
import ShippingConfiguration from "../../components/admin/ShippingConfiguration";

/**
 * Página de configuración del sistema para el panel de administración
 */
const AdminSettingsPage: React.FC = () => {
	// Estado para el tab activo - empezamos con Security ahora
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

				{/* Configuración de Envíos */}
				{activeTab === "shipping" && (
					<div className="p-6">
						<ShippingConfiguration />
					</div>
				)}

			</div>
		</div>
	);
};

export default AdminSettingsPage;