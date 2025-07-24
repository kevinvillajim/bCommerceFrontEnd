// src/presentation/components/admin/VolumeDiscountManager.tsx
import React, { useState, useEffect } from "react";
import {
	Settings,
	Package,
	TrendingDown,
	Plus,
	Edit,
	Trash2,
	Save,
	X,
	CheckCircle,
	AlertTriangle,
	BarChart3,
	Download,
	Upload,
	Search,
	RefreshCw
} from "lucide-react";
import { useVolumeDiscountsAdmin } from "../../hooks/useVolumeDiscount";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";

// Tipos para el componente
interface VolumeDiscountTier {
	id?: number;
	min_quantity: number;
	discount_percentage: number;
	label: string;
	active: boolean;
}

interface ProductWithDiscounts {
	id: number;
	name: string;
	price: number;
	discounts: VolumeDiscountTier[];
}

const VolumeDiscountManager: React.FC = () => {
	// Estados principales
	const [activeTab, setActiveTab] = useState<"config" | "products" | "stats">("config");
	const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState<"all" | "with-discounts" | "without-discounts">("all");
	
	// Estados para modales
	const [showProductModal, setShowProductModal] = useState(false);
	const [editingProduct, setEditingProduct] = useState<ProductWithDiscounts | null>(null);
	const [showBulkModal, setShowBulkModal] = useState(false);

	// Estados para la configuración
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

	// Datos de ejemplo para productos (en producción vendría de la API)
	const [products, setProducts] = useState<ProductWithDiscounts[]>([
		{
			id: 1,
			name: "Laptop Gaming XYZ",
			price: 1299.99,
			discounts: [
				{ min_quantity: 2, discount_percentage: 5, label: "Descuento 2+", active: true },
				{ min_quantity: 5, discount_percentage: 10, label: "Descuento 5+", active: true }
			]
		},
		{
			id: 2,
			name: "Mouse Inalámbrico",
			price: 29.99,
			discounts: []
		},
		{
			id: 3,
			name: "Teclado Mecánico",
			price: 89.99,
			discounts: [
				{ min_quantity: 3, discount_percentage: 8, label: "Descuento 3+", active: true },
				{ min_quantity: 10, discount_percentage: 15, label: "Descuento 10+", active: true }
			]
		}
	]);

	// Hook personalizado
	const {
		loading,
		error,
		getAdminConfiguration,
		updateAdminConfiguration,
		updateProductDiscounts,
		applyDefaultDiscounts,
		bulkApplyDefaults,
		getStats
	} = useVolumeDiscountsAdmin();

	// Estados para estadísticas
	const [stats, setStats] = useState({
		total_products_with_discounts: 0,
		total_discount_tiers: 0,
		average_discount_percentage: 0,
		most_common_quantity: 0,
		enabled_globally: true
	});

	// Cargar datos iniciales
	useEffect(() => {
		const loadInitialData = async () => {
			try {
				const adminConfig = await getAdminConfiguration();
				if (adminConfig !== undefined && adminConfig !== null) {
					setConfig(adminConfig);
				}

				const statsData = await getStats();
				if (statsData) {
					setStats(statsData);
				}
			} catch (error) {
				console.error("Error cargando datos iniciales:", error);
			}
		};

		loadInitialData();
	}, [getAdminConfiguration, getStats]);

	// Filtrar productos
	const filteredProducts = products.filter(product => {
		const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
		
		if (filterStatus === "with-discounts") {
			return matchesSearch && product.discounts.length > 0;
		} else if (filterStatus === "without-discounts") {
			return matchesSearch && product.discounts.length === 0;
		}
		
		return matchesSearch;
	});

	// Manejar cambios en la configuración
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
			const success = await updateAdminConfiguration(config);
			if (success) {
				// Mostrar mensaje de éxito
				console.log("Configuración guardada exitosamente");
			}
		} catch (error) {
			console.error("Error guardando configuración:", error);
		}
	};

	// Aplicar descuentos por defecto a productos seleccionados
	const handleBulkApplyDefaults = async (overwriteExisting: boolean = false) => {
		try {
			const result = await bulkApplyDefaults(selectedProducts, overwriteExisting);
			if (result.success) {
				console.log(`Aplicado a ${result.processed} productos`);
				setShowBulkModal(false);
				setSelectedProducts([]);
			}
		} catch (error) {
			console.error("Error en aplicación masiva:", error);
		}
	};

	// Componente para editar descuentos de producto
	const ProductDiscountEditor = () => {
		if (!editingProduct) return null;

		const updateProductDiscount = (index: number, field: string, value: any) => {
			if (!editingProduct) return;
			
			const newDiscounts = [...editingProduct.discounts];
			newDiscounts[index] = { ...newDiscounts[index], [field]: value };
			setEditingProduct({
				...editingProduct,
				discounts: newDiscounts
			});
		};

		const addProductDiscount = () => {
			if (!editingProduct) return;
			
			setEditingProduct({
				...editingProduct,
				discounts: [
					...editingProduct.discounts,
					{ min_quantity: 1, discount_percentage: 0, label: "Nuevo descuento", active: true }
				]
			});
		};

		const removeProductDiscount = (index: number) => {
			if (!editingProduct) return;
			
			setEditingProduct({
				...editingProduct,
				discounts: editingProduct.discounts.filter((_, i) => i !== index)
			});
		};

		const saveProductDiscounts = async () => {
			if (!editingProduct) return;

			try {
				const success = await updateProductDiscounts(editingProduct.id, editingProduct.discounts);
				if (success) {
					// Actualizar la lista de productos
					setProducts(prev => prev.map(p => 
						p.id === editingProduct.id ? editingProduct : p
					));
					setEditingProduct(null);
					setShowProductModal(false);
				}
			} catch (error) {
				console.error("Error guardando descuentos del producto:", error);
			}
		};

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
					<div className="flex justify-between items-center p-6 border-b">
						<h3 className="text-lg font-semibold">
							Configurar Descuentos - {editingProduct.name}
						</h3>
						<button
							onClick={() => {
								setEditingProduct(null);
								setShowProductModal(false);
							}}
							className="text-gray-400 hover:text-gray-600"
						>
							<X size={24} />
						</button>
					</div>

					<div className="p-6 overflow-y-auto max-h-[60vh]">
						<div className="mb-4 p-4 bg-blue-50 rounded-lg">
							<div className="flex justify-between items-center">
								<div>
									<h4 className="font-medium">Información del Producto</h4>
									<p className="text-sm text-gray-600">
										Precio base: {formatCurrency(editingProduct.price)}
									</p>
								</div>
								<button
									onClick={() => applyDefaultDiscounts(editingProduct.id)}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
									disabled={loading}
								>
									Aplicar Descuentos por Defecto
								</button>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<h4 className="font-medium">Niveles de Descuento</h4>
								<button
									onClick={addProductDiscount}
									className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
								>
									<Plus size={16} className="mr-1" />
									Agregar Nivel
								</button>
							</div>

							{editingProduct.discounts.map((discount, index) => (
								<div key={index} className="border rounded-lg p-4">
									<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Cantidad Mínima
											</label>
											<input
												type="number"
												value={discount.min_quantity}
												onChange={(e) => updateProductDiscount(index, 'min_quantity', parseInt(e.target.value))}
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
												value={discount.discount_percentage}
												onChange={(e) => updateProductDiscount(index, 'discount_percentage', parseFloat(e.target.value))}
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
												value={discount.label}
												onChange={(e) => updateProductDiscount(index, 'label', e.target.value)}
												className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
											/>
										</div>
										<div className="flex items-end">
											<div className="flex items-center space-x-2">
												<label className="flex items-center">
													<input
														type="checkbox"
														checked={discount.active}
														onChange={(e) => updateProductDiscount(index, 'active', e.target.checked)}
														className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
													/>
													<span className="ml-2 text-sm text-gray-700">Activo</span>
												</label>
												<button
													onClick={() => removeProductDiscount(index)}
													className="text-red-600 hover:text-red-800"
												>
													<Trash2 size={16} />
												</button>
											</div>
										</div>
									</div>

									{/* Vista previa del descuento */}
									<div className="mt-3 p-3 bg-gray-50 rounded">
										<div className="text-sm">
											<span className="font-medium">Vista previa:</span>
											{" "}Con {discount.min_quantity}+ unidades: {" "}
											<span className="text-green-600 font-semibold">
												{formatCurrency(editingProduct.price * (1 - discount.discount_percentage / 100))}
											</span>
											{" "}por unidad (ahorro: {" "}
											<span className="text-green-600">
												{formatCurrency(editingProduct.price * discount.discount_percentage / 100)}
											</span>
											)
										</div>
									</div>
								</div>
							))}

							{editingProduct.discounts.length === 0 && (
								<div className="text-center py-8 text-gray-500">
									No hay descuentos configurados para este producto.
									<br />
									<button
										onClick={addProductDiscount}
										className="mt-2 text-primary-600 hover:text-primary-700 underline"
									>
										Agregar el primer descuento
									</button>
								</div>
							)}
						</div>
					</div>

					<div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
						<button
							onClick={() => {
								setEditingProduct(null);
								setShowProductModal(false);
							}}
							className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
						>
							Cancelar
						</button>
						<button
							onClick={saveProductDiscounts}
							disabled={loading}
							className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center"
						>
							<Save size={16} className="mr-2" />
							{loading ? "Guardando..." : "Guardar Cambios"}
						</button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Mostrar errores si existen */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<div className="flex items-center">
						<AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
						<p className="text-red-700">{error}</p>
					</div>
				</div>
			)}

			{/* Tabs */}
			<div className="border-b border-gray-200">
				<nav className="-mb-px flex space-x-8">
					<button
						onClick={() => setActiveTab("config")}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === "config"
								? "border-primary-500 text-primary-600"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						<Settings className="inline-block w-4 h-4 mr-2" />
						Configuración General
					</button>
					<button
						onClick={() => setActiveTab("products")}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === "products"
								? "border-primary-500 text-primary-600"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						<Package className="inline-block w-4 h-4 mr-2" />
						Productos
					</button>
					<button
						onClick={() => setActiveTab("stats")}
						className={`py-2 px-1 border-b-2 font-medium text-sm ${
							activeTab === "stats"
								? "border-primary-500 text-primary-600"
								: "border-transparent text-gray-500 hover:text-gray-700"
						}`}
					>
						<BarChart3 className="inline-block w-4 h-4 mr-2" />
						Estadísticas
					</button>
				</nav>
			</div>

			{/* Tab Content */}
			{activeTab === "config" && (
				<div className="space-y-6">
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<h2 className="text-xl font-semibold mb-4">Configuración General</h2>
						
						<div className="space-y-6">
							{/* Configuración básica */}
							<div>
								<h3 className="text-lg font-medium mb-3">Configuración Básica</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={config.enabled}
											onChange={(e) => handleConfigChange('enabled', e.target.checked)}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
										<span className="ml-2 text-sm font-medium text-gray-700">
											Habilitar descuentos por volumen globalmente
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
											Permitir acumular con otros descuentos
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

							{/* Niveles por defecto */}
							<div>
								<div className="flex justify-between items-center mb-3">
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
										<div key={index} className="border rounded-lg p-4">
											<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Cantidad
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
													/>
												</div>
												<div className="flex items-end">
													<button
														onClick={() => removeDefaultTier(index)}
														className="text-red-600 hover:text-red-800"
													>
														<Trash2 size={20} />
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
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
			)}

			{activeTab === "products" && (
				<div className="space-y-6">
					{/* Controles y filtros */}
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
							<div className="flex items-center space-x-4">
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<input
										type="text"
										placeholder="Buscar productos..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
									/>
								</div>
								<select
									value={filterStatus}
									onChange={(e) => setFilterStatus(e.target.value as any)}
									className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="all">Todos los productos</option>
									<option value="with-discounts">Con descuentos</option>
									<option value="without-discounts">Sin descuentos</option>
								</select>
							</div>

							<div className="flex items-center space-x-3">
								{selectedProducts.length > 0 && (
									<button
										onClick={() => setShowBulkModal(true)}
										className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
									>
										<TrendingDown size={16} className="mr-2" />
										Aplicar Descuentos ({selectedProducts.length})
									</button>
								)}
								<button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
									<Download size={16} className="mr-2" />
									Exportar
								</button>
								<button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
									<Upload size={16} className="mr-2" />
									Importar
								</button>
							</div>
						</div>
					</div>

					{/* Lista de productos */}
					<div className="bg-white rounded-lg shadow-sm border overflow-hidden">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										<input
											type="checkbox"
											checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedProducts(filteredProducts.map(p => p.id));
												} else {
													setSelectedProducts([]);
												}
											}}
											className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
										/>
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Producto
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Precio Base
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Descuentos
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Estado
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredProducts.map((product) => (
									<tr key={product.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<input
												type="checkbox"
												checked={selectedProducts.includes(product.id)}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedProducts(prev => [...prev, product.id]);
													} else {
														setSelectedProducts(prev => prev.filter(id => id !== product.id));
													}
												}}
												className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{product.name}
											</div>
											<div className="text-sm text-gray-500">
												ID: {product.id}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatCurrency(product.price)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{product.discounts.length > 0 ? (
												<div className="space-y-1">
													{product.discounts.map((discount, index) => (
														<span
															key={index}
															className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
														>
															{discount.min_quantity}+ = {discount.discount_percentage}% OFF
														</span>
													))}
												</div>
											) : (
												<span className="text-sm text-gray-500">Sin descuentos</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{product.discounts.length > 0 ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
													<CheckCircle size={12} className="mr-1" />
													Configurado
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
													Sin configurar
												</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<button
												onClick={() => {
													setEditingProduct(product);
													setShowProductModal(true);
												}}
												className="text-primary-600 hover:text-primary-900 mr-3"
											>
												<Edit size={16} />
											</button>
											<button
												onClick={() => applyDefaultDiscounts(product.id)}
												className="text-green-600 hover:text-green-900"
												title="Aplicar descuentos por defecto"
											>
												<TrendingDown size={16} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{activeTab === "stats" && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<div className="bg-white rounded-lg shadow-sm border p-6">
						<div className="flex items-center">
							<div className="p-2 bg-blue-100 rounded-lg">
								<Package className="h-6 w-6 text-blue-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Productos con Descuentos</p>
								<p className="text-2xl font-semibold text-gray-900">{stats.total_products_with_discounts}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm border p-6">
						<div className="flex items-center">
							<div className="p-2 bg-green-100 rounded-lg">
								<TrendingDown className="h-6 w-6 text-green-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Total Niveles</p>
								<p className="text-2xl font-semibold text-gray-900">{stats.total_discount_tiers}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm border p-6">
						<div className="flex items-center">
							<div className="p-2 bg-yellow-100 rounded-lg">
								<BarChart3 className="h-6 w-6 text-yellow-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Descuento Promedio</p>
								<p className="text-2xl font-semibold text-gray-900">{stats.average_discount_percentage.toFixed(1)}%</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-sm border p-6">
						<div className="flex items-center">
							<div className="p-2 bg-purple-100 rounded-lg">
								<RefreshCw className="h-6 w-6 text-purple-600" />
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Cantidad Más Común</p>
								<p className="text-2xl font-semibold text-gray-900">{stats.most_common_quantity}</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modales */}
			{showProductModal && <ProductDiscountEditor />}

			{/* Modal para aplicación masiva */}
			{showBulkModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
						<div className="p-6">
							<h3 className="text-lg font-semibold mb-4">
								Aplicar Descuentos por Defecto
							</h3>
							<p className="text-gray-600 mb-6">
								¿Deseas aplicar los descuentos por defecto a {selectedProducts.length} productos seleccionados?
							</p>
							<div className="flex justify-end space-x-3">
								<button
									onClick={() => setShowBulkModal(false)}
									className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
								>
									Cancelar
								</button>
								<button
									onClick={() => handleBulkApplyDefaults(false)}
									className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
									disabled={loading}
								>
									Aplicar (Conservar existentes)
								</button>
								<button
									onClick={() => handleBulkApplyDefaults(true)}
									className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
									disabled={loading}
								>
									Aplicar (Sobrescribir)
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default VolumeDiscountManager;