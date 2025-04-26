import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {
	Star,
	Package,
	Store,
	AlertTriangle,
	ShoppingBag,
	Clock,
	Search,
} from "lucide-react";

import RatingService from "../../../core/services/RatingService";
import type {
	PendingRatingItem,
} from "../../../core/services/RatingService";
import {formatDate} from "../../../utils/formatters/formatDate";
import RatingModal from "../../components/rating/RatingModal";
import StarRating from "../../components/rating/StarRating";
import {useRatings} from "../../hooks/useRatings";
import PendingRatingsList from "../../components/rating/PendingRatingsList";

interface OrderGroup {
	orderId: number;
	orderNumber: string;
	orderDate: string;
	products: PendingRatingItem[];
	sellers: PendingRatingItem[];
}

const PendingRatingsPage: React.FC = () => {
	// Estados para almacenar datos
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [showRated, setShowRated] = useState<boolean>(false);

	// Estados para el modal de valoración
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [modalType, setModalType] = useState<"product" | "seller">("product");
	const [selectedEntity, setSelectedEntity] =
		useState<PendingRatingItem | null>(null);

	// Instancia del servicio
	const ratingService = new RatingService();

	// Cargar datos al montar el componente
	useEffect(() => {
		fetchPendingRatings();
	}, []);

	// Función para obtener las valoraciones pendientes
	const fetchPendingRatings = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await ratingService.getPendingRatings();

			if (response.status !== "success") {
				throw new Error("Error al obtener las valoraciones pendientes");
			}

			// Agrupar por orden
			const groups: OrderGroup[] = [];
			const orderMap = new Map<number, OrderGroup>();

			// Procesar productos
			response.data.products.forEach((product) => {
				if (!orderMap.has(product.order_id)) {
					const group: OrderGroup = {
						orderId: product.order_id,
						orderNumber: product.order_number,
						orderDate: product.order_date,
						products: [],
						sellers: [],
					};
					orderMap.set(product.order_id, group);
					groups.push(group);
				}

				orderMap.get(product.order_id)?.products.push(product);
			});

			// Procesar vendedores
			response.data.sellers.forEach((seller) => {
				if (!orderMap.has(seller.order_id)) {
					const group: OrderGroup = {
						orderId: seller.order_id,
						orderNumber: seller.order_number,
						orderDate: seller.order_date,
						products: [],
						sellers: [],
					};
					orderMap.set(seller.order_id, group);
					groups.push(group);
				}

				orderMap.get(seller.order_id)?.sellers.push(seller);
			});

			// Ordenar por fecha de orden (más reciente primero)
			groups.sort((a, b) => {
				return (
					new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
				);
			});

			setOrderGroups(groups);
		} catch (error) {
			console.error("Error al cargar valoraciones pendientes:", error);
			setError("No se pudieron cargar las valoraciones pendientes");
		} finally {
			setLoading(false);
		}
	};

	// Función para abrir el modal de valoración
	const openRatingModal = (
		type: "product" | "seller",
		entity: PendingRatingItem
	) => {
		setModalType(type);
		setSelectedEntity(entity);
		setIsModalOpen(true);
	};

	// Función para cerrar el modal
	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedEntity(null);
	};

	// Función para enviar una valoración
	const handleSubmitRating = async (data: {
		rating: number;
		title?: string;
		comment?: string;
		entityId: number;
		orderId: number;
	}) => {
		try {
			if (modalType === "product") {
				await ratingService.rateProduct({
					product_id: data.entityId,
					order_id: data.orderId,
					rating: data.rating,
					title: data.title,
					comment: data.comment,
				});
			} else {
				await ratingService.rateSeller({
					seller_id: data.entityId,
					order_id: data.orderId,
					rating: data.rating,
					title: data.title,
					comment: data.comment,
				});
			}

			// Actualizar datos
			await fetchPendingRatings();

			// Mostrar mensaje de éxito (aquí se podría usar un sistema de notificaciones)
			alert("Valoración enviada con éxito");
		} catch (error) {
			console.error("Error al enviar valoración:", error);
			alert("Error al enviar la valoración");
		}
	};

	// Función para reportar un problema
	const handleReportProblem = async (data: {
		type: "product" | "seller";
		entityId: number;
		orderId: number;
		problemType: string;
		description: string;
	}) => {
		try {
			await ratingService.reportProblem({
				type: data.type,
				entity_id: data.entityId,
				order_id: data.orderId,
				problem_type: data.problemType,
				description: data.description,
			});

			// Actualizar datos
			await fetchPendingRatings();

			// Mostrar mensaje de éxito
			alert("Problema reportado con éxito");
		} catch (error) {
			console.error("Error al reportar problema:", error);
			alert("Error al reportar el problema");
		}
	};

	// Filtrar órdenes por término de búsqueda
	const filteredGroups = orderGroups.filter((group) => {
		const searchLower = searchTerm.toLowerCase();

		// Buscar en número de orden
		if (group.orderNumber.toLowerCase().includes(searchLower)) {
			return true;
		}

		// Buscar en productos
		if (
			group.products.some((product) =>
				product.name.toLowerCase().includes(searchLower)
			)
		) {
			return true;
		}

		// Buscar en vendedores
		if (
			group.sellers.some((seller) =>
				seller.name.toLowerCase().includes(searchLower)
			)
		) {
			return true;
		}

		return false;
	});

	// Verificar si hay elementos pendientes
	const hasPendingItems = orderGroups.some(
		(group) => group.products.length > 0 || group.sellers.length > 0
	);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
				Valoraciones pendientes
			</h1>

			{/* Filtros y búsqueda */}
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="relative flex-grow">
					<input
						type="text"
						placeholder="Buscar por pedido o producto..."
						className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
				</div>

				<div className="flex items-center">
					<label className="inline-flex items-center">
						<input
							type="checkbox"
							className="form-checkbox h-5 w-5 text-primary-600"
							checked={showRated}
							onChange={(e) => setShowRated(e.target.checked)}
						/>
						<span className="ml-2 text-gray-700 dark:text-gray-300">
							Mostrar también valorados
						</span>
					</label>
				</div>
			</div>

			{/* Estado de carga */}
			{loading && (
				<div className="flex justify-center my-12">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			)}

			{/* Mensaje de error */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
					<strong className="font-bold">Error: </strong>
					<span className="block sm:inline">{error}</span>
				</div>
			)}

			{/* Sin valoraciones pendientes */}
			{!loading && !error && !hasPendingItems && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
					<ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						No tienes valoraciones pendientes
					</h2>
					<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
						Todas tus compras recientes han sido valoradas. ¡Gracias por
						compartir tu opinión!
					</p>
					<Link
						to="/orders"
						className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
					>
						Ver mis pedidos
					</Link>
				</div>
			)}

			{/* Lista de órdenes con valoraciones pendientes */}
			{!loading && !error && filteredGroups.length > 0 && (
				<div className="space-y-6">
					{filteredGroups.map((group) => (
						<div
							key={group.orderId}
							className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
						>
							{/* Cabecera de la orden */}
							<div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
								<div className="flex flex-col md:flex-row md:justify-between md:items-center">
									<div>
										<h3 className="text-lg font-medium text-gray-900 dark:text-white">
											Pedido #{group.orderNumber}
										</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Fecha: {formatDate(group.orderDate)}
										</p>
									</div>
									<Link
										to={`/orders/${group.orderId}`}
										className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center mt-2 md:mt-0"
									>
										<Clock className="w-4 h-4 mr-1" />
										Ver detalles del pedido
									</Link>
								</div>
							</div>

							{/* Lista de productos pendientes */}
							{group.products.length > 0 && (
								<div className="px-6 py-4">
									<h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
										<Package className="w-5 h-5 mr-2 text-primary-600" />
										Productos
									</h4>
									<div className="space-y-4">
										{group.products.map((product) => (
											<div
												key={product.id}
												className="flex flex-col sm:flex-row sm:items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
											>
												{/* Imagen y detalles del producto */}
												<div className="flex items-center flex-grow mb-3 sm:mb-0">
													{product.image ? (
														<img
															src={product.image}
															alt={product.name}
															className="w-16 h-16 object-cover rounded-md mr-4"
															onError={(e) => {
																const target = e.target as HTMLImageElement;
																target.onerror = null;
																target.src =
																	"https://via.placeholder.com/64?text=Producto";
															}}
														/>
													) : (
														<div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-4">
															<Package className="h-8 w-8 text-gray-400" />
														</div>
													)}
													<div>
														<h5 className="font-medium text-gray-900 dark:text-white">
															{product.name}
														</h5>
														<Link
															to={`/products/${product.id}`}
															className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400"
														>
															Ver producto
														</Link>
													</div>
												</div>

												{/* Botón de valorar */}
												<div>
													<button
														onClick={() => openRatingModal("product", product)}
														className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center"
													>
														<Star className="h-4 w-4 mr-2" />
														Valorar producto
													</button>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Lista de vendedores pendientes */}
							{group.sellers.length > 0 && (
								<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600">
									<h4 className="text-md font-medium text-gray-900 dark:text-white mb-3 flex items-center">
										<Store className="w-5 h-5 mr-2 text-green-600" />
										Vendedores
									</h4>
									<div className="space-y-4">
										{group.sellers.map((seller) => (
											<div
												key={seller.id}
												className="flex flex-col sm:flex-row sm:items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
											>
												{/* Imagen y detalles del vendedor */}
												<div className="flex items-center flex-grow mb-3 sm:mb-0">
													{seller.image ? (
														<img
															src={seller.image}
															alt={seller.name}
															className="w-16 h-16 object-cover rounded-md mr-4"
															onError={(e) => {
																const target = e.target as HTMLImageElement;
																target.onerror = null;
																target.src =
																	"https://via.placeholder.com/64?text=Tienda";
															}}
														/>
													) : (
														<div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-4">
															<Store className="h-8 w-8 text-gray-400" />
														</div>
													)}
													<div>
														<h5 className="font-medium text-gray-900 dark:text-white">
															{seller.name}
														</h5>
														<span className="text-sm text-gray-500 dark:text-gray-400">
															Tienda
														</span>
													</div>
												</div>

												{/* Botón de valorar */}
												<div>
													<button
														onClick={() => openRatingModal("seller", seller)}
														className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
													>
														<Star className="h-4 w-4 mr-2" />
														Valorar vendedor
													</button>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Modal de valoración */}
			{selectedEntity && (
				<RatingModal
					type={modalType}
					entityId={selectedEntity.id}
					entityName={selectedEntity.name}
					entityImage={selectedEntity.image}
					orderId={selectedEntity.order_id}
					isOpen={isModalOpen}
					onClose={closeModal}
					onSubmit={handleSubmitRating}
					onReport={handleReportProblem}
				/>
			)}
		</div>
	);
};

export default PendingRatingsPage;
