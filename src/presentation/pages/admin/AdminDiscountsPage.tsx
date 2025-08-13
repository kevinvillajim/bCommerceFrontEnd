import React, { useState, useEffect } from "react";
import Table from "../../components/dashboard/Table";
import {
  Tag,
  Percent,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Eye,
  Trash2,
  Plus,
  Clock,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { AdminDiscountCode, AdminDiscountCodeFilterParams, AdminDiscountCodeCreationData } from "../../../core/domain/entities/AdminDiscountCode";
import { adminDiscountService } from "../../../core/services/AdminDiscountService";
import StatCardList from "../../components/dashboard/StatCardList";


const AdminDiscountsPage: React.FC = () => {
	const [discounts, setDiscounts] = useState<AdminDiscountCode[]>([]);
	const [loading, setLoading] = useState(true);
	const [validityFilter, setValidityFilter] = useState<"all" | "valid" | "expired">("all");
	const [usageFilter, setUsageFilter] = useState<"all" | "used" | "unused">("all");
	const [percentageFilter, setPercentageFilter] = useState<"all" | "10" | "20" | "30" | "50+">("all");
	const [showDiscountModal, setShowDiscountModal] = useState(false);
	const [selectedDiscount, setSelectedDiscount] = useState<AdminDiscountCode | null>(
		null
	);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});
	const [stats, setStats] = useState({
		total: 0,
		valid: 0,
		expired: 0,
		used: 0,
		unused: 0,
		active: 0,
	});

	// Formulario para nuevo descuento
	const [newDiscount, setNewDiscount] = useState({
		code: "",
		discount_percentage: 10,
		expirationDays: 30,
		description: "",
	});

	// Load data
	useEffect(() => {
		fetchDiscounts();
		fetchStats();
	}, [validityFilter, usageFilter, percentageFilter, pagination.currentPage]);

	// Fetch discount codes from API
	const fetchDiscounts = async () => {
		setLoading(true);
		try {
			const filterParams: AdminDiscountCodeFilterParams = {
				validity: validityFilter,
				usage: usageFilter,
				percentage: percentageFilter,
				limit: pagination.itemsPerPage,
				offset: (pagination.currentPage - 1) * pagination.itemsPerPage,
			};

			const response = await adminDiscountService.getDiscountCodes(filterParams);
			if (response && response.status === 'success') {
				setDiscounts(response.data);
				setPagination(prev => ({
					...prev,
					totalItems: response.meta.total,
					totalPages: response.meta.total_pages,
					currentPage: response.meta.current_page,
				}));
			}
		} catch (error) {
			console.error('Error fetching discounts:', error);
		} finally {
			setLoading(false);
		}
	};

	// Fetch statistics
	const fetchStats = async () => {
		try {
			const response = await adminDiscountService.getDiscountCodeStats();
			if (response && response.status === 'success') {
				setStats(response.data);
			}
		} catch (error) {
			console.error('Error fetching stats:', error);
		}
	};

	// Filtering is now handled on the backend, so we just use the discounts as-is
	const filteredDiscounts = discounts;

	// Open modal to view/edit discount
	const openDiscountModal = async (discount?: AdminDiscountCode) => {
		if (discount) {
			setSelectedDiscount(discount);
		} else {
			setSelectedDiscount(null);
			// Generate a random code
			try {
				const codeResponse = await adminDiscountService.generateRandomCode();
				const generatedCode = codeResponse?.data?.code || generateRandomCode();
				setNewDiscount({
					code: generatedCode,
					discount_percentage: 10,
					expirationDays: 30,
					description: "",
				});
			} catch (error) {
				console.error('Error generating code:', error);
				setNewDiscount({
					code: generateRandomCode(),
					discount_percentage: 10,
					expirationDays: 30,
					description: "",
				});
			}
		}
		setShowDiscountModal(true);
	};

	// Cerrar modal
	const closeDiscountModal = () => {
		setShowDiscountModal(false);
		setSelectedDiscount(null);
		setShowDeleteConfirmation(false);
	};

	// Generar código aleatorio
	const generateRandomCode = () => {
		const prefix = ["PROMO", "DESCUENTO", "OFERTA", "REGALO", "COMERSIA"][
			Math.floor(Math.random() * 5)
		];
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let result = prefix;
		for (let i = 0; i < 5; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	};

	// Save discount (new or edited)
	const saveDiscount = async () => {
		try {
			if (selectedDiscount) {
				// Update existing discount
				const updateData = {
					code: selectedDiscount.code,
					discount_percentage: selectedDiscount.discount_percentage,
					expires_at: selectedDiscount.expires_at,
					description: selectedDiscount.description || undefined,
				};
				const result = await adminDiscountService.updateDiscountCode(selectedDiscount.id!, updateData);
				if (result.success) {
					alert(result.message);
					fetchDiscounts();
					fetchStats();
				} else {
					alert(result.message);
				}
			} else {
				// Create new discount
				const expirationDate = new Date(
					Date.now() + newDiscount.expirationDays * 24 * 60 * 60 * 1000
				).toISOString();
				
				const createData: AdminDiscountCodeCreationData = {
					code: newDiscount.code,
					discount_percentage: newDiscount.discount_percentage,
					expires_at: expirationDate,
					description: newDiscount.description || undefined,
				};
				
				const result = await adminDiscountService.createDiscountCode(createData);
				if (result.success) {
					alert(result.message);
					fetchDiscounts();
					fetchStats();
				} else {
					alert(result.message);
				}
			}
		} catch (error) {
			console.error('Error saving discount:', error);
			alert('Error saving discount code');
		}
		closeDiscountModal();
	};

	// Delete discount
	const deleteDiscount = async () => {
		if (selectedDiscount && selectedDiscount.id) {
			try {
				const result = await adminDiscountService.deleteDiscountCode(selectedDiscount.id);
				if (result.success) {
					alert(result.message);
					fetchDiscounts();
					fetchStats();
				} else {
					alert(result.message);
				}
			} catch (error) {
				console.error('Error deleting discount:', error);
				alert('Error deleting discount code');
			}
		}
		closeDiscountModal();
	};

	// Formatear fecha
	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return "N/A";

		const date = new Date(dateString);
		return new Intl.DateTimeFormat("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
		// En una app real, aquí obtendrías los datos para la nueva página
	};


	// Verificar si una fecha está expirada
	const isDateExpired = (dateString: string | undefined): boolean => {
		if (!dateString) return false;

		const date = new Date(dateString);
		return date < new Date();
	};

	// Calcular días restantes
	const getDaysRemaining = (dateString: string | undefined): number => {
		if (!dateString) return 0;

		const expiryDate = new Date(dateString);
		const today = new Date();

		const diffTime = expiryDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return diffDays;
	};

	// Define table columns
	const columns = [
		{
			key: "code",
			header: "Código",
			sortable: true,
			render: (discount: AdminDiscountCode) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-md flex items-center justify-center">
						<Tag className="h-4 w-4 text-primary-600" />
					</div>
					<div className="ml-3">
						<div className="text-sm font-medium text-gray-900">
							{discount.code}
						</div>
						<div className="text-xs text-gray-500">
							ID: {discount.id}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "percentage",
			header: "Descuento",
			sortable: true,
			render: (discount: AdminDiscountCode) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-md flex items-center justify-center">
						<Percent className="h-4 w-4 text-green-600" />
					</div>
					<div className="ml-3 text-lg font-semibold text-gray-900">
						{discount.discount_percentage}%
					</div>
				</div>
			),
		},
		{
			key: "validity",
			header: "Validez",
			sortable: true,
			render: (discount: AdminDiscountCode) => {
				const isExpired = isDateExpired(discount.expires_at);
				const daysRemaining = getDaysRemaining(discount.expires_at);

				return (
					<div>
						{isExpired ? (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
								<XCircle className="w-3 h-3 mr-1" />
								Expirado
							</span>
						) : (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
								<CheckCircle className="w-3 h-3 mr-1" />
								Válido
							</span>
						)}
						<div className="text-xs text-gray-500 mt-1">
							{isExpired
								? `Expiró hace ${Math.abs(daysRemaining)} día${Math.abs(daysRemaining) !== 1 ? "s" : ""}`
								: `Expira en ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""}`}
						</div>
						<div className="text-xs text-gray-500">
							{formatDate(discount.expires_at)}
						</div>
					</div>
				);
			},
		},
		{
			key: "usage",
			header: "Uso",
			sortable: true,
			render: (discount: AdminDiscountCode) => {
				return (
					<div>
						{discount.is_used ? (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
								<Check className="w-3 h-3 mr-1" />
								Utilizado
							</span>
						) : (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
								<Clock className="w-3 h-3 mr-1" />
								Sin usar
							</span>
						)}
						{discount.is_used && discount.used_by_user && (
							<div className="text-xs text-gray-500 mt-1">
								Por: {discount.used_by_user.name}
							</div>
						)}
						{discount.is_used && discount.used_at && (
							<div className="text-xs text-gray-500">
								{formatDate(discount.used_at)}
							</div>
						)}
					</div>
				);
			},
		},
		{
			key: "description",
			header: "Descripción",
			sortable: true,
			render: (discount: AdminDiscountCode) => {
				if (discount.description) {
					return (
						<div className="text-sm text-gray-900 max-w-xs truncate" title={discount.description}>
							{discount.description}
						</div>
					);
				}
				return (
					<span className="text-gray-500 text-sm">Sin descripción</span>
				);
			},
		},
		{
			key: "created",
			header: "Creado",
			sortable: true,
			render: (discount: AdminDiscountCode) => (
				<div>
					<div className="text-sm text-gray-500">
						{formatDate(discount.created_at)}
					</div>
					{discount.created_by_user && (
						<div className="text-xs text-gray-400">
							Por: {discount.created_by_user.name}
						</div>
					)}
				</div>
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (discount: AdminDiscountCode) => {
				return (
					<div className="flex justify-end space-x-2">
						{/* Ver detalles / Editar */}
						<button
							onClick={() => openDiscountModal(discount)}
							className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
							title="Ver/Editar código"
						>
							<Eye size={18} />
						</button>

						{/* Eliminar código */}
						<button
							onClick={() => {
								setSelectedDiscount(discount);
								setShowDeleteConfirmation(true);
							}}
							className="p-1 text-red-600 hover:bg-red-100 rounded-md"
							title="Eliminar código"
						>
							<Trash2 size={18} />
						</button>
					</div>
				);
			},
		},
	];

	const statItems = [
		{ 
		  title: "Total", 
		  value: discounts.length, 
		  description: "Códigos de descuento", 
		  icon: Tag, 
		  bgColor: "bg-blue-50/20", 
		  textColor: "text-blue-800", 
		  valueColor: "text-blue-900", 
		  descriptionColor: "text-blue-700", 
		  iconColor: "text-blue-600", 
		},
		{ 
		  title: "Activos", 
		  value: stats.active, 
		  description: "Disponibles para uso", 
		  icon: CheckCircle, 
		  bgColor: "bg-green-50/20", 
		  textColor: "text-green-800", 
		  valueColor: "text-green-900", 
		  descriptionColor: "text-green-700", 
		  iconColor: "text-green-600", 
		},
		{ 
		  title: "Utilizados", 
		  value: stats.used, 
		  description: "Ya redimidos", 
		  icon: Check, 
		  bgColor: "bg-yellow-50", 
		  textColor: "text-yellow-800", 
		  valueColor: "text-yellow-900", 
		  descriptionColor: "text-yellow-700", 
		  iconColor: "text-yellow-600", 
		},
		{ 
		  title: "Expirados", 
		  value: stats.expired, 
		  description: "Ya no válidos", 
		  icon: XCircle, 
		  bgColor: "bg-red-50/20", 
		  textColor: "text-red-800", 
		  valueColor: "text-red-900", 
		  descriptionColor: "text-red-700", 
		  iconColor: "text-red-600", 
		}
	  ];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					Gestión de Códigos de Descuento
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={() => openDiscountModal()}
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						<Plus size={18} className="inline mr-2" />
						Nuevo Código
					</button>
					<button
						onClick={() => { fetchDiscounts(); fetchStats(); }}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
					>
						<RefreshCw size={18} className="inline mr-2" />
						Actualizar
					</button>
				</div>
			</div>

			{/* Panel de estadísticas */}
			<StatCardList items={statItems} />

			{/* Filtros */}
			<div className="bg-white rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Filtro de Validez */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500" />
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={validityFilter}
							onChange={(e) => setValidityFilter(e.target.value as "all" | "valid" | "expired")}
						>
							<option value="all">Todas las Validez</option>
							<option value="valid">Válidos</option>
							<option value="expired">Expirados</option>
						</select>
					</div>

					{/* Filtro de Uso */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={usageFilter}
							onChange={(e) => setUsageFilter(e.target.value as "all" | "used" | "unused")}
						>
							<option value="all">Todos los Usos</option>
							<option value="used">Utilizados</option>
							<option value="unused">Sin Usar</option>
						</select>
					</div>

					{/* Filtro de Porcentaje */}
					<div className="flex items-center space-x-2">
						<Percent className="h-5 w-5 text-gray-500" />
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={percentageFilter}
							onChange={(e) => setPercentageFilter(e.target.value as "all" | "10" | "20" | "30" | "50+")}
						>
							<option value="all">Todos los Porcentajes</option>
							<option value="10">Hasta 10%</option>
							<option value="20">11% - 20%</option>
							<option value="30">21% - 30%</option>
							<option value="50+">Más de 30%</option>
						</select>
					</div>
				</div>
			</div>

			{/* Tabla de Códigos de Descuento */}
			<Table
				data={filteredDiscounts}
				columns={columns}
				searchFields={["code"]}
				loading={loading}
				emptyMessage="No se encontraron códigos de descuento"
				pagination={{
					currentPage: pagination.currentPage,
					totalPages: pagination.totalPages,
					totalItems: pagination.totalItems,
					itemsPerPage: pagination.itemsPerPage,
					onPageChange: handlePageChange,
				}}
			/>

			{/* Modal para Crear/Editar Descuento */}
			{showDiscountModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
						<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
							<h3 className="text-lg font-medium text-gray-900">
								{selectedDiscount
									? "Editar Código de Descuento"
									: "Crear Nuevo Código de Descuento"}
							</h3>
							<button
								onClick={closeDiscountModal}
								className="text-gray-400 hover:text-gray-500"
							>
								<XCircle className="h-5 w-5" />
							</button>
						</div>
						<div className="p-6">
							{/* Formulario */}
							{showDeleteConfirmation ? (
								<div className="text-center">
									<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
									<h4 className="text-lg font-medium text-gray-900 mb-2">
										¿Estás seguro de eliminar este código?
									</h4>
									<p className="text-sm text-gray-500 mb-6">
										Esta acción no se puede deshacer y el código{" "}
										<span className="font-bold">{selectedDiscount?.code}</span>{" "}
										será eliminado permanentemente.
									</p>
									<div className="flex justify-center space-x-3">
										<button
											onClick={() => setShowDeleteConfirmation(false)}
											className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
										>
											Cancelar
										</button>
										<button
											onClick={deleteDiscount}
											className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
										>
											Eliminar
										</button>
									</div>
								</div>
							) : selectedDiscount ? (
								<div className="space-y-4">
									{/* Detalles del código */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Código
											</label>
											<input
												type="text"
												className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
												value={selectedDiscount.code}
												onChange={(e) =>
													setSelectedDiscount({
														...selectedDiscount,
														code: e.target.value,
													})
												}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Porcentaje de Descuento
											</label>
											<div className="flex items-center">
												<input
													type="range"
													min="5"
													max="50"
													step="5"
													value={selectedDiscount.discount_percentage}
													onChange={(e) =>
														setSelectedDiscount({
															...selectedDiscount,
															discount_percentage: parseInt(e.target.value),
														})
													}
													className="w-full mr-3"
												/>
												<span className="text-lg font-semibold text-gray-900 min-w-[50px] text-center">
													{selectedDiscount.discount_percentage}%
												</span>
											</div>
										</div>
									</div>

									{/* Campos de expiración y feedback relacionado */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Fecha de Expiración
											</label>
											<input
												type="date"
												className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
												value={
													selectedDiscount.expires_at
														? new Date(selectedDiscount.expires_at)
																.toISOString()
																.split("T")[0]
														: ""
												}
												onChange={(e) => {
													const date = new Date(e.target.value);
													date.setHours(23, 59, 59, 999);
													setSelectedDiscount({
														...selectedDiscount,
														expires_at: date.toISOString(),
													});
												}}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Descripción
											</label>
											<textarea
												className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
												rows={3}
												value={selectedDiscount.description || ""}
												onChange={(e) =>
													setSelectedDiscount({
														...selectedDiscount,
														description: e.target.value,
													})
												}
												placeholder="Descripción opcional del código de descuento..."
											/>
										</div>
									</div>

									{/* Estado de uso */}
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-sm font-medium text-gray-700 mb-2">
											Estado de Uso
										</h4>
										<div className="flex items-center mb-2">
											{selectedDiscount.is_used ? (
												<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
													<Check className="w-4 h-4 mr-1" />
													Utilizado
												</span>
											) : (
												<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
													<Clock className="w-4 h-4 mr-1" />
													Sin Usar
												</span>
											)}
										</div>
										{selectedDiscount.is_used && (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
												{selectedDiscount.used_by_user && (
													<div>
														<span className="text-sm text-gray-600">
															Usado por:
														</span>
														<Link
															to={`/admin/users/${selectedDiscount.used_by_user.id}`}
															className="ml-2 text-primary-600 hover:text-primary-800"
														>
															{selectedDiscount.used_by_user.name} ({selectedDiscount.used_by_user.email})
														</Link>
													</div>
												)}
												{selectedDiscount.used_at && (
													<div>
														<span className="text-sm text-gray-600">
															Fecha de uso:
														</span>
														<span className="ml-2 text-gray-900">
															{formatDate(selectedDiscount.used_at)}
														</span>
													</div>
												)}
												{selectedDiscount.used_on_product && (
													<div className="col-span-2">
														<span className="text-sm text-gray-600">
															Aplicado en:
														</span>
														<Link
															to={`/admin/products/${selectedDiscount.used_on_product.id}`}
															className="ml-2 text-primary-600 hover:text-primary-800"
														>
															{selectedDiscount.used_on_product.name} (${selectedDiscount.used_on_product.price})
														</Link>
													</div>
												)}
											</div>
										)}
									</div>

									{/* Botones de acción */}
									<div className="flex justify-end space-x-2 mt-6">
										<button
											onClick={closeDiscountModal}
											className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
										>
											Cancelar
										</button>
										<button
											onClick={saveDiscount}
											className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
										>
											Guardar Cambios
										</button>
									</div>
								</div>
							) : (
								<div className="space-y-4">
									{/* Crear nuevo código */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Código
											</label>
											<div className="flex">
												<input
													type="text"
													className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
													value={newDiscount.code}
													onChange={(e) =>
														setNewDiscount({
															...newDiscount,
															code: e.target.value,
														})
													}
													placeholder="Ej. WELCOME20"
												/>
												<button
													onClick={() =>
														setNewDiscount({
															...newDiscount,
															code: generateRandomCode(),
														})
													}
													className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-2 rounded-r-lg"
													title="Generar código aleatorio"
												>
													<RefreshCw size={16} />
												</button>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Porcentaje de Descuento
											</label>
											<div className="flex items-center">
												<input
													type="range"
													min="5"
													max="50"
													step="5"
													value={newDiscount.discount_percentage}
													onChange={(e) =>
														setNewDiscount({
															...newDiscount,
															discount_percentage: parseInt(e.target.value),
														})
													}
													className="w-full mr-3"
												/>
												<span className="text-lg font-semibold text-gray-900 min-w-[50px] text-center">
													{newDiscount.discount_percentage}%
												</span>
											</div>
										</div>
									</div>

									{/* Duración y relación con feedback */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Duración (días)
											</label>
											<input
												type="number"
												min="1"
												max="365"
												className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
												value={newDiscount.expirationDays}
												onChange={(e) =>
													setNewDiscount({
														...newDiscount,
														expirationDays: parseInt(e.target.value),
													})
												}
											/>
											<p className="text-xs text-gray-500 mt-1">
												El código expirará después de{" "}
												{newDiscount.expirationDays} días.
											</p>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Descripción (Opcional)
											</label>
											<textarea
												className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
												rows={3}
												value={newDiscount.description || ""}
												onChange={(e) =>
													setNewDiscount({
														...newDiscount,
														description: e.target.value,
													})
												}
												placeholder="Describe el propósito de este código de descuento..."
											/>
										</div>
									</div>

									{/* Resumen */}
									<div className="bg-gray-50 p-4 rounded-lg mt-4">
										<h4 className="text-sm font-medium text-gray-700 mb-2">
											Resumen
										</h4>
										<div className="text-sm text-gray-900">
											<p>
												Se creará un código de descuento{" "}
												<span className="font-semibold">
													{newDiscount.code}
												</span>{" "}
												con un valor del{" "}
												<span className="font-semibold">
													{newDiscount.discount_percentage}%
												</span>{" "}
												válido por
												<span className="font-semibold">
													{" "}
													{newDiscount.expirationDays} días
												</span>
												.
											</p>
											{newDiscount.description && (
												<p className="mt-2">
													Descripción: 
													<span className="font-semibold">
														{" "}
														{newDiscount.description}
													</span>
												</p>
											)}
										</div>
									</div>

									{/* Botones de acción */}
									<div className="flex justify-end space-x-2 mt-6">
										<button
											onClick={closeDiscountModal}
											className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
										>
											Cancelar
										</button>
										<button
											onClick={saveDiscount}
											className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
										>
											Crear Código
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Modal Confirmación de Eliminación */}
			{showDeleteConfirmation && selectedDiscount && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<div className="text-center">
							<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
							<h4 className="text-lg font-medium text-gray-900 mb-2">
								¿Estás seguro de eliminar este código?
							</h4>
							<p className="text-sm text-gray-500 mb-6">
								Esta acción no se puede deshacer y el código{" "}
								<span className="font-bold">{selectedDiscount?.code}</span> será
								eliminado permanentemente.
							</p>
							<div className="flex justify-center space-x-3">
								<button
									onClick={() => setShowDeleteConfirmation(false)}
									className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
								>
									Cancelar
								</button>
								<button
									onClick={deleteDiscount}
									className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
								>
									Eliminar
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminDiscountsPage;