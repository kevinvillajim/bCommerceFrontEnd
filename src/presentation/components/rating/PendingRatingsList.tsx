// src/presentation/components/rating/PendingRatingsList.tsx
import React from "react";
import {Link} from "react-router-dom";
import {Package, Store, Clock, Star} from "lucide-react";
import {formatDate} from "../../../utils/formatters/formatDate";
import type {PendingRatingItem} from "../../../core/services/RatingService";

interface PendingRatingsListProps {
	orderGroups: Array<{
		orderId: number;
		orderNumber: string;
		orderDate: string;
		products: PendingRatingItem[];
		sellers: PendingRatingItem[];
	}>;
	onRateProduct: (product: PendingRatingItem) => void;
	onRateSeller: (seller: PendingRatingItem) => void;
}

const PendingRatingsList: React.FC<PendingRatingsListProps> = ({
	orderGroups,
	onRateProduct,
	onRateSeller,
}) => {
	// ✅ FUNCIÓN PARA MANEJAR ERRORES DE IMAGEN SIN PLACEHOLDER EXTERNO
	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const target = e.currentTarget;
		// Ocultar la imagen rota y mostrar el ícono de respaldo
		target.style.display = 'none';
		const parentDiv = target.parentElement;
		if (parentDiv) {
			parentDiv.querySelector('.fallback-icon')?.classList.remove('hidden');
		}
	};

	return (
		<div className="space-y-6">
			{orderGroups.map((group) => (
				<div
					key={`order-${group.orderId}`}
					className="bg-white rounded-lg shadow-sm overflow-hidden"
				>
					{/* Cabecera de la orden */}
					<div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
						<div className="flex flex-col md:flex-row md:justify-between md:items-center">
							<div>
								<h3 className="text-lg font-medium text-gray-900">
									Pedido #{group.orderNumber}
								</h3>
								<p className="text-sm text-gray-500">
									Fecha: {formatDate(group.orderDate)}
								</p>
							</div>
							<Link
								to={`/orders/${group.orderId}`}
								className="text-primary-600 hover:text-primary-800 flex items-center mt-2 md:mt-0"
							>
								<Clock className="w-4 h-4 mr-1" />
								Ver detalles del pedido
							</Link>
						</div>
					</div>

					{/* Lista de productos pendientes */}
					{group.products.length > 0 && (
						<div className="px-6 py-4">
							<h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
								<Package className="w-5 h-5 mr-2 text-primary-600" />
								Productos
							</h4>
							<div className="space-y-4">
								{group.products.map((product, index) => (
									<div
										key={`product-${product.id || product.productId}-order-${group.orderId}-${index}-${product.order_id || ''}`}
										className="flex flex-col sm:flex-row sm:items-center p-3 border border-gray-200 rounded-lg"
									>
										{/* Imagen y detalles del producto */}
										<div className="flex items-center flex-grow mb-3 sm:mb-0">
											{/* CONTENEDOR DE IMAGEN CON FALLBACK LOCAL */}
											<div className="w-16 h-16 rounded-md mr-4 relative bg-gray-100 flex items-center justify-center">
												{product.image ? (
													<>
														<img
															src={product.image}
															alt={product.name || 'Producto'}
															className="w-16 h-16 object-cover rounded-md"
															onError={handleImageError}
														/>
														{/* ÍCONO DE RESPALDO LOCAL OCULTO POR DEFECTO */}
														<Package className="h-8 w-8 text-gray-400 fallback-icon hidden absolute" />
													</>
												) : (
												<Package className="h-8 w-8 text-gray-400" />
												)}
											</div>
											
											<div>
												<h5 className="font-medium text-gray-900">
													{product.name || `Producto #${product.id || product.productId}`}
												</h5>
												<Link
													to={`/products/${product.id || product.productId}`}
													className="text-sm text-primary-600 hover:text-primary-800"
												>
													Ver producto
												</Link>
											</div>
										</div>

										{/* Botón de valorar */}
										<div>
											<button
												onClick={() => onRateProduct(product)}
												className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center transition-colors"
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
						<div className="px-6 py-4 border-t border-gray-200">
							<h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
								<Store className="w-5 h-5 mr-2 text-green-600" />
								Vendedores
							</h4>
							<div className="space-y-4">
								{group.sellers.map((seller, index) => (
									<div
										key={`seller-${seller.id || seller.seller_id}-order-${group.orderId}-${index}-${seller.productId || ''}`}
										className="flex flex-col sm:flex-row sm:items-center p-3 border border-gray-200 rounded-lg"
									>
										{/* Imagen y detalles del vendedor */}
										<div className="flex items-center flex-grow mb-3 sm:mb-0">
											{/* CONTENEDOR DE IMAGEN CON FALLBACK LOCAL */}
											<div className="w-16 h-16 rounded-md mr-4 relative bg-gray-100 flex items-center justify-center">
												{seller.image ? (
													<>
														<img
															src={seller.image}
															alt={seller.name || 'Tienda'}
															className="w-16 h-16 object-cover rounded-md"
															onError={handleImageError}
														/>
														{/* ÍCONO DE RESPALDO LOCAL OCULTO POR DEFECTO */}
														<Store className="h-8 w-8 text-gray-400 fallback-icon hidden absolute" />
													</>
												) : (
												<Store className="h-8 w-8 text-gray-400" />
												)}
											</div>
											
											<div>
												<h5 className="font-medium text-gray-900">
													{seller.name || `Vendedor #${seller.seller_id || seller.id}`}
												</h5>
												<span className="text-sm text-gray-500">
													Tienda
													{seller.productId && (
														<span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
															Producto #{seller.productId}
														</span>
													)}
												</span>
											</div>
										</div>

										{/* Botón de valorar */}
										<div>
											<button
												onClick={() => onRateSeller(seller)}
												className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
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
	);
};

export default PendingRatingsList;
