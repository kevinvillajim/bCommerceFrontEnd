import React, {useState, useEffect} from "react";
import Table from "../../components/dashboard/Table";
import {
	Store,
	ShieldCheck,
	Star,
	DollarSign,
	Filter,
	RefreshCw,
	Eye,
	Ban,
	CheckCircle,
	Clock,
} from "lucide-react";
import type {Seller} from "../../../core/domain/entities/Seller";
import ApiClient from "../../../infrastructure/api/apiClient";
import adminSellerService from "../../../infrastructure/services/AdminSellerService";
import StatusUpdateModal from "../../components/admin/StatusUpdateModal";
import SellerFormModal from "../../components/admin/SellerFormModal";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";

const AdminSellersPage: React.FC = () => {
	const [sellers, setSellers] = useState<Seller[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [verificationFilter, setVerificationFilter] = useState<string>("all");
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Estados para modales
	const [statusModal, setStatusModal] = useState({
		isOpen: false,
		sellerId: 0,
		status: "activate" as "activate" | "suspend" | "deactivate",
		title: "",
		message: "",
		buttonText: "",
	});

	const [sellerFormModal, setSellerFormModal] = useState({
		isOpen: false,
		seller: null as Seller | null,
		isCreate: true,
		title: "Crear nuevo vendedor",
	});

	const [error, setError] = useState<string | null>(null);

	// Inicializar el servicio
	// Cargar datos de vendedores
	useEffect(() => {
		fetchSellers();
	}, [statusFilter, verificationFilter, pagination.currentPage]);

	// Función para obtener vendedores del backend usando nuestro endpoint de admin
	const fetchSellers = async () => {
		setLoading(true);
		setError(null);
		try {
			const params = new URLSearchParams({
				page: pagination.currentPage.toString(),
				per_page: pagination.itemsPerPage.toString(),
			});

			// Añadir filtros si están definidos
			if (statusFilter !== "all") {
				params.append('status', statusFilter);
			}

			if (verificationFilter !== "all") {
				params.append('is_featured', verificationFilter === "featured" ? '1' : '0');
			}

			const response = await ApiClient.get(`/admin/sellers?${params.toString()}`);
			
			console.log('Full response:', JSON.stringify(response, null, 2)); // Debug detallado
			
			// Manejo flexible: la respuesta puede tener o no tener el campo success
			let sellersData = [];
			
			// Si la respuesta es exitosa O si directamente tiene data
			if ((response as any).success !== false && (response as any).data) {
				// Extraer los sellers de diferentes posibles ubicaciones
				if (Array.isArray((response as any).data.data)) {
					sellersData = (response as any).data.data; // Laravel paginated response
				} else if (Array.isArray((response as any).data)) {
					sellersData = (response as any).data; // Direct array in data
				}
				
				console.log('Extracted sellers data:', sellersData);
				setSellers(sellersData);
				
				// Manejar paginación si está disponible
				if ((response as any).data && (response as any).data.current_page) {
					setPagination({
						currentPage: (response as any).data.current_page,
						totalPages: (response as any).data.last_page,
						totalItems: (response as any).data.total,
						itemsPerPage: (response as any).data.per_page,
					});
				}
			} else {
				console.error('Response not successful:', response);
				throw new Error((response as any).message || (response as any).error || 'Error al obtener sellers');
			}
		} catch (error) {
			console.error("Error al obtener vendedores:", error);
			setError("Error al cargar vendedores. Por favor, inténtalo de nuevo.");
		} finally {
			setLoading(false);
		}
	};


	// Manejar cambio de estado de vendedor
	const toggleSellerStatus = (sellerId: number) => {
		// Buscar el vendedor
		const seller = sellers.find((s) => s.id === sellerId);
		if (!seller) return;

		let status: "activate" | "suspend" | "deactivate";
		let title = "";
		let message = "";
		let buttonText = "";

		if (seller.status === "active") {
			status = "suspend";
			title = "Suspender vendedor";
			message = `¿Estás seguro de que deseas suspender al vendedor "${seller.storeName}"? Esta acción limitará temporalmente su capacidad para vender.`;
			buttonText = "Suspender";
		} else if (seller.status === "suspended") {
			status = "deactivate";
			title = "Desactivar vendedor";
			message = `¿Estás seguro de que deseas desactivar al vendedor "${seller.storeName}"? Esta acción lo desactivará completamente.`;
			buttonText = "Desactivar";
		} else {
			status = "activate";
			title = "Activar vendedor";
			message = `¿Estás seguro de que deseas activar al vendedor "${seller.storeName}"? Esta acción permitirá que vuelva a vender en la plataforma.`;
			buttonText = "Activar";
		}

		setStatusModal({
			isOpen: true,
			sellerId,
			status,
			title,
			message,
			buttonText,
		});
	};

	// Procesar cambio de estado
	const handleStatusUpdate = async (reason: string) => {
		setLoading(true);
		setError(null);
		try {
			const {sellerId, status} = statusModal;
			let newStatus: "active" | "suspended" | "inactive";

			if (status === "activate") {
				newStatus = "active";
			} else if (status === "suspend") {
				newStatus = "suspended";
			} else {
				newStatus = "inactive";
			}

			await adminSellerService.updateSellerStatus(sellerId, newStatus, reason);

			// Actualizar el estado local para reflejar el cambio inmediatamente
			setSellers((prevSellers) =>
				prevSellers.map((seller) => {
					if (seller.id === sellerId) {
						return {...seller, status: newStatus};
					}
					return seller;
				})
			);

			// Cerrar el modal
			setStatusModal((prev) => ({...prev, isOpen: false}));
		} catch (error) {
			console.error("Error al actualizar estado:", error);
			setError(
				"Error al actualizar el estado del vendedor. Por favor, inténtalo de nuevo."
			);
		} finally {
			setLoading(false);
		}
	};

	// Aprobar vendedor pendiente
	const approveSeller = async (sellerId: number) => {
		setLoading(true);
		setError(null);
		try {
			await adminSellerService.updateSellerStatus(sellerId, "active");

			// Actualizar el estado local
			setSellers((prevSellers) =>
				prevSellers.map((seller) => {
					if (seller.id === sellerId) {
						return {...seller, status: "active"};
					}
					return seller;
				})
			);

			alert(`Vendedor #${sellerId} ha sido aprobado`);
		} catch (error) {
			console.error("Error al aprobar vendedor:", error);
			setError("Error al aprobar el vendedor. Por favor, inténtalo de nuevo.");
		} finally {
			setLoading(false);
		}
	};


	// Destacar/Quitar destacado de vendedor y sus productos
	const toggleFeatured = async (sellerId: number) => {
		// Buscar el vendedor para determinar el estado actual
		const seller = sellers.find((s) => s.id === sellerId);
		if (!seller) return;

		const newFeaturedState = !seller.isFeatured;
		setLoading(true);
		setError(null);
		
		try {
			// Actualizar el vendedor
			await ApiClient.put(`/admin/sellers/${sellerId}`, {
				is_featured: newFeaturedState,
			});

			// Si se está marcando como destacado, también actualizar todos sus productos
			if (newFeaturedState) {
				try {
					await ApiClient.post(`/admin/sellers/${sellerId}/feature-products`);
					console.log(`Todos los productos del vendedor ${sellerId} han sido marcados como destacados`);
				} catch (productError) {
					console.error("Error al marcar productos como destacados:", productError);
					// No lanzamos el error para que el vendedor se marque como destacado aunque falle lo de productos
				}
			}

			// Actualizar el estado local
			setSellers((prevSellers) =>
				prevSellers.map((seller) => {
					if (seller.id === sellerId) {
						return {...seller, isFeatured: newFeaturedState};
					}
					return seller;
				})
			);

			// Mostrar mensaje de éxito
			const actionText = newFeaturedState ? "destacado" : "desmarcado como destacado";
			alert(`Vendedor ${actionText} correctamente${newFeaturedState ? ". Todos sus productos han sido marcados como destacados." : "."}`);
			
		} catch (error) {
			console.error("Error al actualizar estado destacado:", error);
			setError(
				"Error al actualizar estado destacado. Por favor, inténtalo de nuevo."
			);
		} finally {
			setLoading(false);
		}
	};


	// Abrir modal para editar vendedor
	const handleEditSeller = (seller: Seller) => {
		setSellerFormModal({
			isOpen: true,
			seller,
			isCreate: false,
			title: `Editar vendedor: ${seller.storeName}`,
		});
	};

	// Procesar formulario de creación/edición
	const handleSellerFormSubmit = async (formData: any) => {
		setLoading(true);
		setError(null);
		try {
			if (sellerFormModal.isCreate) {
				// Crear nuevo vendedor
				await ApiClient.post('/admin/sellers', formData);
				alert("Vendedor creado correctamente");
			} else if (sellerFormModal.seller) {
				// Actualizar vendedor existente
				await ApiClient.put(`/admin/sellers/${sellerFormModal.seller.id}`, formData);
				alert("Vendedor actualizado correctamente");
			}

			// Recargar lista de vendedores
			fetchSellers();
			// Cerrar modal
			setSellerFormModal((prev) => ({...prev, isOpen: false}));
		} catch (error) {
			console.error("Error al procesar vendedor:", error);
			throw error; // Propagamos el error para que lo maneje el componente del formulario
		} finally {
			setLoading(false);
		}
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
	};

	// Refrescar datos
	const refreshData = () => {
		fetchSellers();
	};


	// Definir columnas de la tabla
	const columns = [
		{
			key: "store",
			header: "Tienda",
			sortable: true,
			render: (seller: Seller) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
						<Store className="h-6 w-6 text-primary-600" />
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900 flex items-center">
							{seller.store_name}
							{seller.isFeatured && (
								<span className="ml-2">
									<Star className="h-4 w-4 text-yellow-500 inline" />
								</span>
							)}
						</div>
						<div className="text-xs text-gray-500">
							{seller.userName} ({seller.email})
						</div>
						<div className="text-xs text-gray-400">
							ID: {seller.id}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (seller: Seller) => {
				let statusColor = "";
				let statusText = "";
				let StatusIcon: any = null;

				switch (seller.status) {
					case "active":
						statusColor =
							"bg-green-100 text-green-800";
						statusText = "Activo";
						StatusIcon = CheckCircle;
						break;
					case "pending":
						statusColor =
							"bg-yellow-100 text-yellow-800";
						statusText = "Pendiente";
						StatusIcon = Clock;
						break;
					case "suspended":
						statusColor =
							"bg-red-100 text-red-800";
						statusText = "Suspendido";
						StatusIcon = Ban;
						break;
					case "inactive":
						statusColor =
							"bg-gray-100 text-gray-800";
						statusText = "Inactivo";
						StatusIcon = Eye;
						break;
				}

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
					>
						{StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
						{statusText}
					</span>
				);
			},
		},
		{
			key: "verification",
			header: "Verificación",
			sortable: true,
			render: (seller: Seller) => {
				const isFeatured = seller.isFeatured;
				
				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
							isFeatured
								? "bg-yellow-100 text-yellow-800"
								: "bg-gray-100 text-gray-800"
						}`}
					>
						{isFeatured ? "Destacado" : "Normal"}
					</span>
				);
			},
		},
		// Temporalmente deshabilitadas hasta que el backend envíe los datos
		
		{
			key: "rating",
			header: "Valoración",
			sortable: true,
			render: (seller: Seller) => (
				<div className="flex items-center">
					{seller.average_rating && seller.average_rating > 0 ? (
						<>
							<Star className="h-4 w-4 text-yellow-500 mr-1" />
							<span>{seller.average_rating.toFixed(1)}</span>
						</>
					) : (
						<span className="text-xs text-gray-500">Sin valoraciones</span>
					)}
				</div>
			),
		},
		{
			key: "sales", 
			header: "Ventas",
			sortable: true,
			render: (seller: Seller) => (
				<div className="flex items-center">
					<DollarSign className="h-4 w-4 text-green-500 mr-1" />
					<span>{formatCurrency(seller.total_revenue || 0)}</span>
				</div>
			),
		},
		{
			key: "createdAt",
			header: "Creado", 
			sortable: true,
			render: (seller: Seller) => {
				const dateString = seller.created_at;
				if (!dateString) return "N/A";
				
				const date = new Date(dateString);
				if (isNaN(date.getTime())) return "Fecha inválida";
				
				return date.toLocaleDateString('es-ES', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				});
			},
		},
		
		{
			key: "actions", 
			header: "Acciones",
			render: (seller: Seller) => (
				<div className="flex justify-end space-x-2">
					{/* Botón para cambiar estado */}
					<button
						onClick={() => toggleSellerStatus(seller.id)}
						className={`p-1 rounded-md ${
							seller.status === "active"
								? "text-red-600 hover:bg-red-100"
								: "text-green-600 hover:bg-green-100"
						}`}
						title={
							seller.status === "active"
								? "Suspender vendedor"
								: seller.status === "suspended"
									? "Desactivar vendedor"
									: "Activar vendedor"
						}
					>
						{seller.status === "active" ? (
							<Ban size={18} />
						) : (
							<CheckCircle size={18} />
						)}
					</button>

					{/* Botón de aprobación para vendedores pendientes */}
					{seller.status === "pending" && (
						<button
							onClick={() => approveSeller(seller.id)}
							className="p-1 text-green-600 hover:bg-green-100 rounded-md"
							title="Aprobar vendedor"
						>
							<CheckCircle size={18} />
						</button>
					)}

					{/* Botón para verificar/desverificar */}
					<button
						onClick={() => toggleFeatured(seller.id)}
						className={`p-1 rounded-md ${
							seller.isFeatured
								? "text-yellow-600 hover:bg-yellow-100"
								: "text-gray-600 hover:bg-gray-100"
						}`}
						title={seller.isFeatured ? "Desmarcar como destacado" : "Verificar"}
					>
						{seller.isFeatured ? <Star size={18} /> : <ShieldCheck size={18} />}
					</button>


					{/* Botón para editar vendedor */}
					<button
						onClick={() => handleEditSeller(seller)}
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
						title="Editar vendedor"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
					</button>

				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					Gestión de Vendedores
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						disabled={loading}
					>
						<RefreshCw
							size={18}
							className={`inline mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Actualizar
					</button>
				</div>
			</div>

			{/* Mensaje de error */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
					<span className="block sm:inline">{error}</span>
				</div>
			)}

			{/* Filtros */}
			<div className="bg-white rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Filtro de Estado */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500" />
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los Estados</option>
							<option value="active">Activos</option>
							<option value="pending">Pendientes</option>
							<option value="suspended">Suspendidos</option>
							<option value="inactive">Inactivos</option>
						</select>
					</div>

					{/* Filtro de Tipo de Vendedor */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={verificationFilter}
							onChange={(e) => setVerificationFilter(e.target.value)}
						>
							<option value="all">Todos los Tipos</option>
							<option value="featured">Destacados</option>
							<option value="normal">Normales</option>
						</select>
					</div>
				</div>
			</div>

			{/* Tabla de Vendedores */}
			<Table
				data={sellers}
				columns={columns}
				searchFields={["store_name", "storeName", "name", "userName", "email"]}
				loading={loading}
				emptyMessage="No se encontraron vendedores"
				pagination={{
					currentPage: pagination.currentPage,
					totalPages: pagination.totalPages,
					totalItems: pagination.totalItems,
					itemsPerPage: pagination.itemsPerPage,
					onPageChange: handlePageChange,
				}}
			/>

			{/* Modal de actualización de estado */}
			<StatusUpdateModal
				isOpen={statusModal.isOpen}
				onClose={() => setStatusModal((prev) => ({...prev, isOpen: false}))}
				onConfirm={handleStatusUpdate}
				title={statusModal.title}
				message={statusModal.message}
				confirmButtonText={statusModal.buttonText}
				status={statusModal.status}
			/>

			{/* Modal de creación/edición de vendedor */}
			<SellerFormModal
				isOpen={sellerFormModal.isOpen}
				onClose={() => setSellerFormModal((prev) => ({...prev, isOpen: false}))}
				onSubmit={handleSellerFormSubmit}
				seller={sellerFormModal.seller}
				title={sellerFormModal.title}
				isCreate={sellerFormModal.isCreate}
				users={[]}
			/>
		</div>
	);
};

export default AdminSellersPage;
