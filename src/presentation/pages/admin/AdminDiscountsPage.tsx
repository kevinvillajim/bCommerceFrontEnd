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
import type { DiscountCode } from "../../../core/domain/entities/DescountCode";

// Datos simulados para códigos de descuento
const mockDiscounts: DiscountCode[] = [
  {
    id: 1,
    feedbackId: 5,
    code: "GRACIAS10",
    discountPercentage: 10,
    isUsed: false,
    expiresAt: "2023-12-31T23:59:59Z",
    createdAt: "2023-11-01T15:30:00Z",
    updatedAt: "2023-11-01T15:30:00Z",
    isValid: true,
    daysUntilExpiration: 58
  },
  {
    id: 2,
    feedbackId: 12,
    code: "BIENVENIDA20",
    discountPercentage: 20,
    isUsed: true,
    usedBy: 105,
    usedAt: "2023-11-03T14:20:00Z",
    usedOnProductId: 8,
    expiresAt: "2023-12-15T23:59:59Z",
    createdAt: "2023-10-15T10:45:00Z",
    updatedAt: "2023-11-03T14:20:00Z",
    isValid: false,
    daysUntilExpiration: 42
  },
  {
    id: 3,
    feedbackId: 7,
    code: "BLACKFRIDAY30",
    discountPercentage: 30,
    isUsed: false,
    expiresAt: "2023-11-30T23:59:59Z",
    createdAt: "2023-11-02T08:15:00Z",
    updatedAt: "2023-11-02T08:15:00Z",
    isValid: true,
    daysUntilExpiration: 25
  },
  {
    id: 4,
    feedbackId: 9,
    code: "NAVIDAD25",
    discountPercentage: 25,
    isUsed: false,
    expiresAt: "2023-12-25T23:59:59Z",
    createdAt: "2023-11-05T16:40:00Z",
    updatedAt: "2023-11-05T16:40:00Z",
    isValid: true,
    daysUntilExpiration: 50
  },
  {
    id: 5,
    feedbackId: 3,
    code: "ANIVERSARIO15",
    discountPercentage: 15,
    isUsed: false,
    expiresAt: "2023-11-15T23:59:59Z",
    createdAt: "2023-10-20T11:30:00Z",
    updatedAt: "2023-10-20T11:30:00Z",
    isValid: true,
    daysUntilExpiration: 10
  },
  {
    id: 6,
    feedbackId: 8,
    code: "CLIENTE50",
    discountPercentage: 50,
    isUsed: true,
    usedBy: 102,
    usedAt: "2023-10-30T09:15:00Z",
    usedOnProductId: 5,
    expiresAt: "2023-11-10T23:59:59Z",
    createdAt: "2023-10-10T14:20:00Z",
    updatedAt: "2023-10-30T09:15:00Z",
    isValid: false,
    daysUntilExpiration: 5
  },
  {
    id: 7,
    feedbackId: 15,
    code: "INVIERNO20",
    discountPercentage: 20,
    isUsed: false,
    expiresAt: "2024-01-15T23:59:59Z",
    createdAt: "2023-11-01T10:00:00Z",
    updatedAt: "2023-11-01T10:00:00Z",
    isValid: true,
    daysUntilExpiration: 73
  },
  {
    id: 8,
    feedbackId: 4,
    code: "VERANO15",
    discountPercentage: 15,
    isUsed: false,
    expiresAt: "2023-08-31T23:59:59Z",
    createdAt: "2023-06-01T12:00:00Z",
    updatedAt: "2023-06-01T12:00:00Z",
    isValid: false,
    daysUntilExpiration: -70
  }
];

const AdminDiscountsPage: React.FC = () => {
	const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
	const [loading, setLoading] = useState(true);
	const [validityFilter, setValidityFilter] = useState<string>("all");
	const [usageFilter, setUsageFilter] = useState<string>("all");
	const [percentageFilter, setPercentageFilter] = useState<string>("all");
	const [showDiscountModal, setShowDiscountModal] = useState(false);
	const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(
		null
	);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Formulario para nuevo descuento
	const [newDiscount, setNewDiscount] = useState({
		code: "",
		discountPercentage: 10,
		expirationDays: 30,
		isForFeedback: false,
		feedbackId: "",
	});

	// Cargar datos
	useEffect(() => {
		const fetchDiscounts = () => {
			setLoading(true);
			// Simulación de llamada a API
			setTimeout(() => {
				setDiscounts(mockDiscounts);
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalItems: mockDiscounts.length,
					itemsPerPage: 10,
				});
				setLoading(false);
			}, 500);
		};

		fetchDiscounts();
	}, []);

	// Filtrar descuentos
	const filteredDiscounts = discounts.filter((discount) => {
		// Filtro por validez
		const matchesValidity = (() => {
			if (validityFilter === "all") return true;
			if (validityFilter === "valid") return discount.isValid;
			if (validityFilter === "expired") return !discount.isValid;
			return true;
		})();

		// Filtro por uso
		const matchesUsage = (() => {
			if (usageFilter === "all") return true;
			if (usageFilter === "used") return discount.isUsed;
			if (usageFilter === "unused") return !discount.isUsed;
			return true;
		})();

		// Filtro por porcentaje
		const matchesPercentage = (() => {
			if (percentageFilter === "all") return true;

			const percentage = parseInt(percentageFilter);
			if (percentageFilter === "10") return discount.discountPercentage <= 10;
			if (percentageFilter === "20")
				return (
					discount.discountPercentage > 10 && discount.discountPercentage <= 20
				);
			if (percentageFilter === "30")
				return (
					discount.discountPercentage > 20 && discount.discountPercentage <= 30
				);
			if (percentageFilter === "50+") return discount.discountPercentage > 30;
			return true;
		})();

		return matchesValidity && matchesUsage && matchesPercentage;
	});

	// Abrir modal para ver/editar descuento
	const openDiscountModal = (discount?: DiscountCode) => {
		if (discount) {
			setSelectedDiscount(discount);
		} else {
			setSelectedDiscount(null);
			setNewDiscount({
				code: generateRandomCode(),
				discountPercentage: 10,
				expirationDays: 30,
				isForFeedback: false,
				feedbackId: "",
			});
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
		const prefix = ["PROMO", "DESCUENTO", "OFERTA", "REGALO", "BCOMMERCE"][
			Math.floor(Math.random() * 5)
		];
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let result = prefix;
		for (let i = 0; i < 5; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	};

	// Guardar descuento (nuevo o editado)
	const saveDiscount = () => {
		if (selectedDiscount) {
			// Actualizar descuento existente
			setDiscounts((prevDiscounts) =>
				prevDiscounts.map((d) =>
					d.id === selectedDiscount.id
						? {...selectedDiscount, updatedAt: new Date().toISOString()}
						: d
				)
			);
		} else {
			// Crear nuevo descuento
			const newDiscountCode: DiscountCode = {
				id: Math.max(...discounts.map((d) => d.id || 0)) + 1,
				feedbackId: newDiscount.isForFeedback
					? parseInt(newDiscount.feedbackId)
					: 0,
				code: newDiscount.code,
				discountPercentage: newDiscount.discountPercentage,
				isUsed: false,
				expiresAt: new Date(
					Date.now() + newDiscount.expirationDays * 24 * 60 * 60 * 1000
				).toISOString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				isValid: true,
				daysUntilExpiration: newDiscount.expirationDays,
			};

			setDiscounts((prevDiscounts) => [...prevDiscounts, newDiscountCode]);
		}

		closeDiscountModal();
	};

	// Eliminar descuento
	const deleteDiscount = () => {
		if (selectedDiscount) {
			setDiscounts((prevDiscounts) =>
				prevDiscounts.filter((d) => d.id !== selectedDiscount.id)
			);
			alert(
				`El código de descuento ${selectedDiscount.code} ha sido eliminado.`
			);
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

	// Refrescar datos
	const refreshData = () => {
		setLoading(true);
		// Simular recarga de datos
		setTimeout(() => {
			setLoading(false);
		}, 500);
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

	// Definir columnas de la tabla
	const columns = [
		{
			key: "code",
			header: "Código",
			sortable: true,
			render: (discount: DiscountCode) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-md flex items-center justify-center">
						<Tag className="h-4 w-4 text-primary-600 dark:text-primary-300" />
					</div>
					<div className="ml-3">
						<div className="text-sm font-medium text-gray-900 dark:text-white">
							{discount.code}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
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
			render: (discount: DiscountCode) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center">
						<Percent className="h-4 w-4 text-green-600 dark:text-green-300" />
					</div>
					<div className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
						{discount.discountPercentage}%
					</div>
				</div>
			),
		},
		{
			key: "validity",
			header: "Validez",
			sortable: true,
			render: (discount: DiscountCode) => {
				const isExpired = isDateExpired(discount.expiresAt);
				const daysRemaining = getDaysRemaining(discount.expiresAt);

				return (
					<div>
						{isExpired ? (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
								<XCircle className="w-3 h-3 mr-1" />
								Expirado
							</span>
						) : (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
								<CheckCircle className="w-3 h-3 mr-1" />
								Válido
							</span>
						)}
						<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
							{isExpired
								? `Expiró hace ${Math.abs(daysRemaining)} día${Math.abs(daysRemaining) !== 1 ? "s" : ""}`
								: `Expira en ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""}`}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							{formatDate(discount.expiresAt)}
						</div>
					</div>
				);
			},
		},
		{
			key: "usage",
			header: "Uso",
			sortable: true,
			render: (discount: DiscountCode) => {
				return (
					<div>
						{discount.isUsed ? (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
								<Check className="w-3 h-3 mr-1" />
								Utilizado
							</span>
						) : (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
								<Clock className="w-3 h-3 mr-1" />
								Sin usar
							</span>
						)}
						{discount.isUsed && discount.usedBy && (
							<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								Por: Usuario #{discount.usedBy}
							</div>
						)}
						{discount.isUsed && discount.usedAt && (
							<div className="text-xs text-gray-500 dark:text-gray-400">
								{formatDate(discount.usedAt)}
							</div>
						)}
					</div>
				);
			},
		},
		{
			key: "feedback",
			header: "Feedback",
			sortable: true,
			render: (discount: DiscountCode) => {
				if (discount.feedbackId) {
					return (
						<Link
							to={`/admin/feedback/${discount.feedbackId}`}
							className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
						>
							Ver feedback #{discount.feedbackId}
						</Link>
					);
				}
				return (
					<span className="text-gray-500 dark:text-gray-400 text-sm">N/A</span>
				);
			},
		},
		{
			key: "created",
			header: "Creado",
			sortable: true,
			render: (discount: DiscountCode) => (
				<div className="text-sm text-gray-500 dark:text-gray-400">
					{formatDate(discount.createdAt)}
				</div>
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (discount: DiscountCode) => {
				return (
					<div className="flex justify-end space-x-2">
						{/* Ver detalles / Editar */}
						<button
							onClick={() => openDiscountModal(discount)}
							className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
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
							className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
							title="Eliminar código"
						>
							<Trash2 size={18} />
						</button>
					</div>
				);
			},
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
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
						onClick={refreshData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
					>
						<RefreshCw size={18} className="inline mr-2" />
						Actualizar
					</button>
				</div>
			</div>

			{/* Panel de estadísticas */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
								Total
							</h3>
							<Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
							{discounts.length}
						</p>
						<p className="text-sm text-blue-700 dark:text-blue-300">
							Códigos de descuento
						</p>
					</div>

					<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium text-green-800 dark:text-green-200">
								Activos
							</h3>
							<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
						<p className="text-2xl font-bold text-green-900 dark:text-green-100">
							{
								discounts.filter(
									(d) => !isDateExpired(d.expiresAt) && !d.isUsed
								).length
							}
						</p>
						<p className="text-sm text-green-700 dark:text-green-300">
							Disponibles para uso
						</p>
					</div>

					<div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
								Utilizados
							</h3>
							<Check className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
						</div>
						<p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
							{discounts.filter((d) => d.isUsed).length}
						</p>
						<p className="text-sm text-yellow-700 dark:text-yellow-300">
							Ya redimidos
						</p>
					</div>

					<div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium text-red-800 dark:text-red-200">
								Expirados
							</h3>
							<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
						</div>
						<p className="text-2xl font-bold text-red-900 dark:text-red-100">
							{
								discounts.filter((d) => isDateExpired(d.expiresAt) && !d.isUsed)
									.length
							}
						</p>
						<p className="text-sm text-red-700 dark:text-red-300">
							Ya no válidos
						</p>
					</div>
				</div>
			</div>

			{/* Filtros */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Filtro de Validez */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={validityFilter}
							onChange={(e) => setValidityFilter(e.target.value)}
						>
							<option value="all">Todas las Validez</option>
							<option value="valid">Válidos</option>
							<option value="expired">Expirados</option>
						</select>
					</div>

					{/* Filtro de Uso */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={usageFilter}
							onChange={(e) => setUsageFilter(e.target.value)}
						>
							<option value="all">Todos los Usos</option>
							<option value="used">Utilizados</option>
							<option value="unused">Sin Usar</option>
						</select>
					</div>

					{/* Filtro de Porcentaje */}
					<div className="flex items-center space-x-2">
						<Percent className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={percentageFilter}
							onChange={(e) => setPercentageFilter(e.target.value)}
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
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
						<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
							<h3 className="text-lg font-medium text-gray-900 dark:text-white">
								{selectedDiscount
									? "Editar Código de Descuento"
									: "Crear Nuevo Código de Descuento"}
							</h3>
							<button
								onClick={closeDiscountModal}
								className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
							>
								<XCircle className="h-5 w-5" />
							</button>
						</div>
						<div className="p-6">
							{/* Formulario */}
							{showDeleteConfirmation ? (
								<div className="text-center">
									<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
									<h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
										¿Estás seguro de eliminar este código?
									</h4>
									<p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
										Esta acción no se puede deshacer y el código{" "}
										<span className="font-bold">{selectedDiscount?.code}</span>{" "}
										será eliminado permanentemente.
									</p>
									<div className="flex justify-center space-x-3">
										<button
											onClick={() => setShowDeleteConfirmation(false)}
											className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
												Código
											</label>
											<input
												type="text"
												className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
												Porcentaje de Descuento
											</label>
											<div className="flex items-center">
												<input
													type="range"
													min="5"
													max="50"
													step="5"
													value={selectedDiscount.discountPercentage}
													onChange={(e) =>
														setSelectedDiscount({
															...selectedDiscount,
															discountPercentage: parseInt(e.target.value),
														})
													}
													className="w-full mr-3"
												/>
												<span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[50px] text-center">
													{selectedDiscount.discountPercentage}%
												</span>
											</div>
										</div>
									</div>

									{/* Campos de expiración y feedback relacionado */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
												Fecha de Expiración
											</label>
											<input
												type="date"
												className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
												value={
													selectedDiscount.expiresAt
														? new Date(selectedDiscount.expiresAt)
																.toISOString()
																.split("T")[0]
														: ""
												}
												onChange={(e) => {
													const date = new Date(e.target.value);
													date.setHours(23, 59, 59, 999);
													setSelectedDiscount({
														...selectedDiscount,
														expiresAt: date.toISOString(),
													});
												}}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
												Feedback Relacionado
											</label>
											<div className="flex items-center">
												<span className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 w-full">
													{selectedDiscount.feedbackId
														? `Feedback #${selectedDiscount.feedbackId}`
														: "Sin feedback relacionado"}
												</span>
												{selectedDiscount.feedbackId && (
													<Link
														to={`/admin/feedback/${selectedDiscount.feedbackId}`}
														className="ml-2 p-2 text-primary-600 hover:bg-primary-100 rounded-md dark:text-primary-400 dark:hover:bg-primary-900"
														title="Ver feedback"
													>
														<Eye size={18} />
													</Link>
												)}
											</div>
										</div>
									</div>

									{/* Estado de uso */}
									<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
										<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Estado de Uso
										</h4>
										<div className="flex items-center mb-2">
											{selectedDiscount.isUsed ? (
												<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
													<Check className="w-4 h-4 mr-1" />
													Utilizado
												</span>
											) : (
												<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
													<Clock className="w-4 h-4 mr-1" />
													Sin Usar
												</span>
											)}
										</div>
										{selectedDiscount.isUsed && (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
												{selectedDiscount.usedBy && (
													<div>
														<span className="text-sm text-gray-600 dark:text-gray-400">
															Usado por:
														</span>
														<Link
															to={`/admin/users/${selectedDiscount.usedBy}`}
															className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
														>
															Usuario #{selectedDiscount.usedBy}
														</Link>
													</div>
												)}
												{selectedDiscount.usedAt && (
													<div>
														<span className="text-sm text-gray-600 dark:text-gray-400">
															Fecha de uso:
														</span>
														<span className="ml-2 text-gray-900 dark:text-gray-200">
															{formatDate(selectedDiscount.usedAt)}
														</span>
													</div>
												)}
												{selectedDiscount.usedOnProductId && (
													<div className="col-span-2">
														<span className="text-sm text-gray-600 dark:text-gray-400">
															Aplicado en:
														</span>
														<Link
															to={`/admin/products/${selectedDiscount.usedOnProductId}`}
															className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
														>
															Producto #{selectedDiscount.usedOnProductId}
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
											className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
												Código
											</label>
											<div className="flex">
												<input
													type="text"
													className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
													className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-2 rounded-r-lg dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
													title="Generar código aleatorio"
												>
													<RefreshCw size={16} />
												</button>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
												Porcentaje de Descuento
											</label>
											<div className="flex items-center">
												<input
													type="range"
													min="5"
													max="50"
													step="5"
													value={newDiscount.discountPercentage}
													onChange={(e) =>
														setNewDiscount({
															...newDiscount,
															discountPercentage: parseInt(e.target.value),
														})
													}
													className="w-full mr-3"
												/>
												<span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[50px] text-center">
													{newDiscount.discountPercentage}%
												</span>
											</div>
										</div>
									</div>

									{/* Duración y relación con feedback */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
												Duración (días)
											</label>
											<input
												type="number"
												min="1"
												max="365"
												className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
												value={newDiscount.expirationDays}
												onChange={(e) =>
													setNewDiscount({
														...newDiscount,
														expirationDays: parseInt(e.target.value),
													})
												}
											/>
											<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
												El código expirará después de{" "}
												{newDiscount.expirationDays} días.
											</p>
										</div>
										<div>
											<div className="flex items-center mb-2">
												<input
													id="isForFeedback"
													type="checkbox"
													className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
													checked={newDiscount.isForFeedback}
													onChange={(e) =>
														setNewDiscount({
															...newDiscount,
															isForFeedback: e.target.checked,
														})
													}
												/>
												<label
													htmlFor="isForFeedback"
													className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
												>
													Asociar a un feedback
												</label>
											</div>
											{newDiscount.isForFeedback && (
												<div>
													<input
														type="text"
														className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
														value={newDiscount.feedbackId}
														onChange={(e) =>
															setNewDiscount({
																...newDiscount,
																feedbackId: e.target.value,
															})
														}
														placeholder="ID del feedback"
													/>
												</div>
											)}
										</div>
									</div>

									{/* Resumen */}
									<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mt-4">
										<h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Resumen
										</h4>
										<div className="text-sm text-gray-900 dark:text-gray-200">
											<p>
												Se creará un código de descuento{" "}
												<span className="font-semibold">
													{newDiscount.code}
												</span>{" "}
												con un valor del{" "}
												<span className="font-semibold">
													{newDiscount.discountPercentage}%
												</span>{" "}
												válido por
												<span className="font-semibold">
													{" "}
													{newDiscount.expirationDays} días
												</span>
												.
											</p>
											{newDiscount.isForFeedback && newDiscount.feedbackId && (
												<p className="mt-2">
													Este código estará asociado al
													<span className="font-semibold">
														{" "}
														Feedback #{newDiscount.feedbackId}
													</span>
													.
												</p>
											)}
										</div>
									</div>

									{/* Botones de acción */}
									<div className="flex justify-end space-x-2 mt-6">
										<button
											onClick={closeDiscountModal}
											className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
						<div className="text-center">
							<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
							<h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
								¿Estás seguro de eliminar este código?
							</h4>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
								Esta acción no se puede deshacer y el código{" "}
								<span className="font-bold">{selectedDiscount?.code}</span> será
								eliminado permanentemente.
							</p>
							<div className="flex justify-center space-x-3">
								<button
									onClick={() => setShowDeleteConfirmation(false)}
									className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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