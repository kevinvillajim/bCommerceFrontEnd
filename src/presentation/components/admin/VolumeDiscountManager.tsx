// src/presentation/components/admin/VolumeDiscountManager.tsx - SIMPLIFICADO
import React, { useState, useEffect } from "react";
import {
	Settings,
	Plus,
	Trash2,
	Save,
	AlertTriangle,
	RefreshCw
} from "lucide-react";
import { useVolumeDiscountsAdmin } from "../../hooks/useVolumeDiscount";

const VolumeDiscountManager: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Configuración simple
	const [config, setConfig] = useState({
		enabled: true,
		stackable: false,
		show_savings_message: true,
		default_tiers: [
			{ quantity: 3, discount: 5, label: "Descuento 3+" },
			{ quantity: 6, discount: 10, label: "Descuento 6+" },
			{ quantity: 12, discount: 15, label: "Descuento 12+" }
		]
	});

	const {
		loading: apiLoading,
		getAdminConfiguration,
		updateAdminConfiguration
	} = useVolumeDiscountsAdmin();

	// Cargar configuración inicial
	useEffect(() => {
		loadConfiguration();
	}, []);

	const loadConfiguration = async () => {
		try {
			setLoading(true);
			setError(null);
			const adminConfig = await getAdminConfiguration();
			if (adminConfig) {
				setConfig(adminConfig);
			}
		} catch (error) {
			console.error("Error cargando configuración:", error);
			setError("No se pudo cargar la configuración");
		} finally {
			setLoading(false);
		}
	};

	// Manejar cambios en la configuración básica
	const handleConfigChange = (field: string, value: any) => {
		setConfig(prev => ({
			...prev,
			[field]: value
		}));
	};

	// Manejar cambios en los tiers por defecto
	const handleDefaultTierChange = (index: number, field: string, value: any) => {
		const newTiers = [...config.default_tiers];
		newTiers[index] = { ...newTiers[index], [field]: value };
		setConfig(prev => ({
			...prev,
			default_tiers: newTiers
		}));
	};

	// Agregar nuevo tier por defecto
	const addDefaultTier = () => {
		setConfig(prev => ({
			...prev,
			default_tiers: [
				...prev.default_tiers,
				{ quantity: 1, discount: 0, label: "Nuevo descuento" }
			]
		}));
	};

	// Eliminar tier por defecto
	const removeDefaultTier = (index: number) => {
		setConfig(prev => ({
			...prev,
			default_tiers: prev.default_tiers.filter((_, i) => i !== index)
		}));
	};

	// Guardar configuración
	const saveConfiguration = async () => {
		try {
			setLoading(true);
			setError(null);
			setSuccess(null);

			const success = await updateAdminConfiguration(config);
			if (success) {
				setSuccess("Configuración guardada exitosamente");
				setTimeout(() => setSuccess(null), 3000);
			} else {
				throw new Error("No se pudo guardar la configuración");
			}
		} catch (error) {
			console.error("Error guardando configuración:", error);
			setError("Error al guardar la configuración");
		} finally {
			setLoading(false);
		}
	};

	if (apiLoading && !config) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Mensajes */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center">
						<AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
						<p className="text-red-700">{error}</p>
					</div>
				</div>
			)}

			{success && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<div className="flex items-center">
						<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
							<div className="w-2 h-2 bg-white rounded-full"></div>
						</div>
						<p className="text-green-700">{success}</p>
					</div>
				</div>
			)}

			{/* Configuración General */}
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<div className="flex justify-between items-center mb-6">
					<div>
						<h2 className="text-xl font-semibold flex items-center">
							<Settings className="w-5 h-5 mr-2" />
							Configuración de Descuentos por Volumen
						</h2>
						<p className="text-sm text-gray-600 mt-1">
							Configure los descuentos automáticos por cantidad de productos
						</p>
					</div>
					<button
						onClick={loadConfiguration}
						className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
						disabled={loading}
					>
						<RefreshCw size={18} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
						Actualizar
					</button>
				</div>
				
				<div className="space-y-6">
					{/* Configuración básica */}
					<div>
						<h3 className="text-lg font-medium mb-4">Configuración Básica</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={config.enabled}
									onChange={(e) => handleConfigChange('enabled', e.target.checked)}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
								/>
								<span className="ml-2 text-sm font-medium text-gray-700">
									Habilitar descuentos por volumen
								</span>
							</label>
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={config.stackable}
									onChange={(e) => handleConfigChange('stackable', e.target.checked)}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
								/>
								<span className="ml-2 text-sm font-medium text-gray-700">
									Acumular con otros descuentos
								</span>
							</label>
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={config.show_savings_message}
									onChange={(e) => handleConfigChange('show_savings_message', e.target.checked)}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
								/>
								<span className="ml-2 text-sm font-medium text-gray-700">
									Mostrar mensajes de ahorro
								</span>
							</label>
						</div>
					</div>

					{/* Niveles de descuento por defecto */}
					<div>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-medium">Niveles de Descuento por Defecto</h3>
							<button
								onClick={addDefaultTier}
								className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
							>
								<Plus size={16} className="mr-1" />
								Agregar Nivel
							</button>
						</div>
						
						<div className="space-y-3">
							{config.default_tiers.map((tier, index) => (
								<div key={index} className="border rounded-lg p-4 bg-gray-50">
									<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Cantidad Mínima
											</label>
											<input
												type="number"
												value={tier.quantity}
												onChange={(e) => handleDefaultTierChange(index, 'quantity', parseInt(e.target.value))}
												className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
												min="1"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Descuento (%)
											</label>
											<input
												type="number"
												value={tier.discount}
												onChange={(e) => handleDefaultTierChange(index, 'discount', parseFloat(e.target.value))}
												className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
												min="0"
												max="100"
												step="0.1"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Etiqueta
											</label>
											<input
												type="text"
												value={tier.label}
												onChange={(e) => handleDefaultTierChange(index, 'label', e.target.value)}
												className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
												placeholder="Ej: Descuento 3+"
											/>
										</div>
										<div className="flex items-end">
											<button
												onClick={() => removeDefaultTier(index)}
												className="w-full text-red-600 hover:text-red-800 flex items-center justify-center p-2 border border-red-300 rounded-md hover:bg-red-50"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>

									{/* Vista previa del descuento */}
									<div className="mt-3 p-3 bg-white rounded border">
										<div className="text-sm text-gray-600">
											<span className="font-medium">Vista previa:</span>
											{" "}Al comprar {tier.quantity}+ unidades, el cliente obtiene {tier.discount}% de descuento
											{tier.label && (
												<span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
													{tier.label}
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						{config.default_tiers.length === 0 && (
							<div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
								No hay niveles de descuento configurados.
								<br />
								<button
									onClick={addDefaultTier}
									className="mt-2 text-primary-600 hover:text-primary-700 underline"
								>
									Agregar el primer nivel de descuento
								</button>
							</div>
						)}
					</div>

					{/* Información adicional */}
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h4 className="font-medium text-blue-900 mb-2">Información Importante</h4>
						<ul className="text-sm text-blue-800 space-y-1">
							<li>• Los descuentos se aplican automáticamente cuando el cliente alcanza la cantidad mínima</li>
							<li>• Solo se aplica el descuento del nivel más alto alcanzado</li>
							<li>• Los descuentos se calculan sobre el precio base del producto</li>
							<li>• Las configuraciones se aplican a todos los productos de la tienda</li>
						</ul>
					</div>

					{/* Botón guardar */}
					<div className="flex justify-end">
						<button
							onClick={saveConfiguration}
							disabled={loading}
							className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
						>
							<Save size={16} className="mr-2" />
							{loading ? "Guardando..." : "Guardar Configuración"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VolumeDiscountManager;