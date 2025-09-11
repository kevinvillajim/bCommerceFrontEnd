// src/presentation/pages/account/PendingRatingsPage.tsx
import React, {useEffect, useState, useCallback, useRef} from "react";
import {Link} from "react-router-dom";
import {ShoppingBag, Search} from "lucide-react";

import PendingRatingsAdapter from "../../../core/adapters/PendingRatingsAdapter";
import type {PendingRatingItem} from "../../../core/services/RatingService";
import type {OrderGroup} from "../../../core/adapters/PendingRatingsAdapter";
import RatingModal from "../../components/rating/RatingModal";
import {useRatings} from "../../hooks/useRatings";
import PendingRatingsList from "../../components/rating/PendingRatingsList";
import {extractErrorMessage} from "../../../utils/errorHandler";

const PendingRatingsPage: React.FC = () => {
	// Estados para filtros y búsqueda
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [showRated, setShowRated] = useState<boolean>(false);

	// Estados para el modal de valoración
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [modalType, setModalType] = useState<"product" | "seller">("product");
	const [selectedEntity, setSelectedEntity] =
		useState<PendingRatingItem | null>(null);

	// Usar nuestro hook de valoraciones
	const {
		loading,
		error,
		getPendingRatings,
		rateProduct,
		rateSeller,
		reportProblem,
	} = useRatings();

	// Estado para almacenar los grupos de órdenes
	const [orderGroups, setOrderGroups] = useState<OrderGroup[]>([]);

	// ✅ REF PARA CONTROLAR QUE SOLO SE EJECUTE UNA VEZ
	const hasLoadedRef = useRef(false);

	// Cargar datos al montar el componente - SOLO UNA VEZ
	useEffect(() => {
		if (!hasLoadedRef.current) {
			hasLoadedRef.current = true;
			
			// Función interna para obtener valoraciones pendientes
			const loadPendingRatings = async () => {
				try {
					// Usar el hook para obtener los datos
					const response = await getPendingRatings();

					if (response.status !== "success") {
						throw new Error("Error al obtener las valoraciones pendientes");
					}

					// Usar el adaptador para transformar los datos al formato esperado
					const groups = PendingRatingsAdapter.adaptPendingRatings(response);
					setOrderGroups(groups);
				} catch (err) {
					console.error("Error al cargar valoraciones pendientes:", err);
				}
			};
			
			loadPendingRatings();
		}
	}, []); // ✅ DEPENDENCIAS VACÍAS

	// ✅ FUNCIÓN SEPARADA PARA RECARGAR DATOS (usado después de enviar ratings)
	const fetchPendingRatings = useCallback(async () => {
		try {
			const response = await getPendingRatings();

			if (response.status !== "success") {
				throw new Error("Error al obtener las valoraciones pendientes");
			}

			const groups = PendingRatingsAdapter.adaptPendingRatings(response);
			setOrderGroups(groups);
		} catch (err) {
			console.error("Error al cargar valoraciones pendientes:", err);
		}
	}, [getPendingRatings]); // ✅ SOLO PARA RECARGAR DATOS

	// Función para abrir el modal de valoración
	const openRatingModal = (
		type: "product" | "seller",
		entity: PendingRatingItem
	) => {
		console.log(`💱 Abriendo modal de ${type}:`, {
			id: entity.id,
			productId: entity.productId,
			seller_id: entity.seller_id,
			name: entity.name,
			order_id: entity.order_id
		});
		
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
	console.log(`📨 Enviando valoración de ${modalType}:`, {
	modalType,
	entityId: data.entityId,
	orderId: data.orderId,
	rating: data.rating,
	title: data.title,
	comment: data.comment
	});
	
	try {
	if (modalType === "product") {
	console.log(`📦 Llamando rateProduct con product_id: ${data.entityId}`);
	await rateProduct({
	product_id: data.entityId,
	order_id: data.orderId,
	rating: data.rating,
	title: data.title,
	comment: data.comment,
	});
	} else {
	// Para vendedor: usar el productId asociado desde selectedEntity
	const productIdForVendor = selectedEntity?.productId;
	
	if (!productIdForVendor) {
	 throw new Error('No se puede calificar al vendedor: falta el ID del producto asociado');
	}
	
	console.log(`🏦 Llamando rateSeller con seller_id: ${data.entityId}, product_id: ${productIdForVendor}`);
	
	// Construir datos de rating con product_id válido
	const ratingData = {
	 seller_id: data.entityId,
	 order_id: data.orderId,
	 rating: data.rating,
	 title: data.title,
	 comment: data.comment,
	product_id: productIdForVendor
	};
	
	console.log(`📨 Datos finales para rateSeller:`, ratingData);
	
	await rateSeller(ratingData);
	}

	// Actualizar datos
	await fetchPendingRatings();

	// Mostrar mensaje de éxito
	alert("Valoración enviada con éxito");

	// Cerrar el modal
	closeModal();
	} catch (error) {
	console.error("Error al enviar valoración:", error);
	alert(extractErrorMessage(error, "Error al enviar la valoración"));
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
			await reportProblem({
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

			// Cerrar el modal
			closeModal();
		} catch (error) {
			console.error("Error al reportar problema:", error);
			alert(extractErrorMessage(error, "Error al reportar el problema"));
		}
	};

	// Filtrar órdenes por término de búsqueda
	const filteredGroups = orderGroups.filter((group) => {
		if (searchTerm === "") return true;

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
				(seller.name || "").toLowerCase().includes(searchLower)
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
		<div className="container mx-auto p-4 px-10">
			<h1 className="text-2xl font-bold text-gray-900">
				Valoraciones pendientes
			</h1>

			{/* Filtros y búsqueda */}
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<div className="relative flex-grow">
					<input
						type="text"
						placeholder="Buscar por pedido o producto..."
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
						<span className="ml-2 text-gray-700">
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
				<div className="bg-white rounded-lg shadow-sm p-8 text-center">
					<ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						No tienes valoraciones pendientes
					</h2>
					<p className="text-gray-600 max-w-md mx-auto">
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
				<PendingRatingsList
					orderGroups={filteredGroups}
					onRateProduct={(product) => openRatingModal("product", product)}
					onRateSeller={(seller) => openRatingModal("seller", seller)}
				/>
			)}

			{/* Modal de valoración */}
			{selectedEntity && (
			<RatingModal
			type={modalType}
			entityId={
			(() => {
			// Para productos: usar productId o id
			// Para vendedores: usar seller_id o id
			const calculatedId = modalType === "product"
			? (selectedEntity.productId || selectedEntity.id || 0)
			 : (selectedEntity.seller_id || selectedEntity.id || 0);
			    
			console.log(`🎭 Modal recibirá entityId para ${modalType}:`, {
			calculatedId,
			selectedEntity_id: selectedEntity.id,
			 selectedEntity_productId: selectedEntity.productId,
			 selectedEntity_seller_id: selectedEntity.seller_id
			});
			 
			  return calculatedId;
			 })()
			}
			entityName={
			selectedEntity.name ||
			`${modalType === "product" ? "Producto" : "Vendedor"} #${
			modalType === "product"
			  ? (selectedEntity.productId || selectedEntity.id)
			   : (selectedEntity.seller_id || selectedEntity.id)
			 }`
			}
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
