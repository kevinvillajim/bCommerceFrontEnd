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
	return (
		<div className="space-y-6">
			{orderGroups.map((group) => (
				<div
					key={`order-${group.orderId}`}
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
										key={`product-${product.id}-order-${group.orderId}`}
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
												onClick={() => onRateProduct(product)}
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
										key={`seller-${seller.id || seller.seller_id}-order-${group.orderId}`}
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
													{seller.name ||
														`Vendedor #${seller.seller_id || seller.id}`}
												</h5>
												<span className="text-sm text-gray-500 dark:text-gray-400">
													Tienda
												</span>
											</div>
										</div>

										{/* Botón de valorar */}
										<div>
											<button
												onClick={() => onRateSeller(seller)}
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
	);
};

export default PendingRatingsList;
