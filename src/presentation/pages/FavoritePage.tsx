import React, {useState, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
	Heart,
	Trash2,
	ShoppingCart,
	Star,
	Check,
	AlertTriangle,
	Settings,
} from "lucide-react";
import {useFavoriteApi} from "../hooks/useFavoriteApi";
import {useAuth} from "../hooks/useAuth";
import {useCart} from "../hooks/useCart";
import {formatCurrency} from "../../utils/formatters/formatCurrency";
// IMPORTAR EL HELPER DE IMÁGENES CORREGIDO
import { getImageUrl } from "../../utils/imageUtils";

// Tipo para los datos del producto favorito
interface FavoriteProduct {
	id: number;
	name: string;
	price: number | string; // Puede venir como string o number
	discount?: number | string;
	discount_percentage?: number | string;
	rating?: number | string;
	rating_count?: number | string;
	image?: string;
	images?: {
		original: string;
		thumbnail: string;
		medium: string;
		large: string;
	}[];
	category?: string;
	isNew?: boolean;
	stock: number;
	slug: string;
	category_id?: number;
	is_in_stock?: boolean;
}

// Tipo para el elemento favorito completo
interface FavoriteItem {
	favorite: {
		id: number;
		userId: number;
		productId: number;
		notifyPriceChange: boolean;
		notifyPromotion: boolean;
		notifyLowStock: boolean;
	};
	product?: FavoriteProduct;
}

// Componente de preferencias de notificación
interface NotificationPreferencesProps {
	favoriteId: number;
	initialPreferences: {
		notifyPriceChange: boolean;
		notifyPromotion: boolean;
		notifyLowStock: boolean;
	};
	onClose: () => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
	favoriteId,
	initialPreferences,
	onClose,
}) => {
	const [preferences, setPreferences] = useState({
		notify_price_change: initialPreferences.notifyPriceChange,
		notify_promotion: initialPreferences.notifyPromotion,
		notify_low_stock: initialPreferences.notifyLowStock,
	});
	const [isSaving, setIsSaving] = useState(false);
	const {updateNotificationPreferences} = useFavoriteApi();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, checked} = e.target;
		setPreferences((prev) => ({...prev, [name]: checked}));
	};

	const handleSave = async () => {
		try {
			setIsSaving(true);
			await updateNotificationPreferences(favoriteId, preferences);
			onClose();
		} catch (error) {
			console.error("Error saving preferences:", error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold">
						Preferencias de notificación
					</h3>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					>
						<span className="sr-only">Cerrar</span>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div className="space-y-4">
					<div className="flex items-center">
						<input
							type="checkbox"
							id="notify_price_change"
							name="notify_price_change"
							checked={preferences.notify_price_change}
							onChange={handleChange}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
						/>
						<label
							htmlFor="notify_price_change"
							className="ml-2 block text-sm text-gray-700"
						>
							Notificarme cambios de precio
						</label>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							id="notify_promotion"
							name="notify_promotion"
							checked={preferences.notify_promotion}
							onChange={handleChange}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
						/>
						<label
							htmlFor="notify_promotion"
							className="ml-2 block text-sm text-gray-700"
						>
							Notificarme promociones
						</label>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							id="notify_low_stock"
							name="notify_low_stock"
							checked={preferences.notify_low_stock}
							onChange={handleChange}
							className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
						/>
						<label
							htmlFor="notify_low_stock"
							className="ml-2 block text-sm text-gray-700"
						>
							Notificarme cuando haya poco stock
						</label>
					</div>
				</div>

				<div className="mt-6 flex justify-end space-x-3">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
					>
						Cancelar
					</button>
					<button
						onClick={handleSave}
						disabled={isSaving}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
					>
						{isSaving ? "Guardando..." : "Guardar"}
					</button>
				</div>
			</div>
		</div>
	);
};

const FavoritePage: React.FC = () => {
	const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isEmpty, setIsEmpty] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activePreferences, setActivePreferences] = useState<number | null>(
		null
	);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [total, setTotal] = useState(0);

	const limit = 10;
	const {getUserFavorites, toggleFavorite} = useFavoriteApi();
	const {isAuthenticated} = useAuth();
	const {addToCart} = useCart();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login", {state: {from: "/favorites"}});
			return;
		}

		fetchFavorites();
	}, [isAuthenticated, currentPage]);

	const fetchFavorites = async () => {
		try {
			setIsLoading(true);
			const offset = (currentPage - 1) * limit;
			const result = await getUserFavorites(limit, offset);

			// Asegúrate de que los datos tengan el formato correcto
			const formattedFavorites = result.favorites.map((item) => ({
				favorite: {
					id: item.favorite.id || 0, // Asigna un valor por defecto si es undefined
					userId: item.favorite.userId,
					productId: item.favorite.productId,
					notifyPriceChange: item.favorite.notifyPriceChange || false,
					notifyPromotion: item.favorite.notifyPromotion || false,
					notifyLowStock: item.favorite.notifyLowStock || false,
				},
				product: item.product,
			}));

			setFavorites(formattedFavorites);
			setTotal(result.meta.total);
			setHasMore(result.meta.has_more);
			setIsEmpty(formattedFavorites.length === 0 && currentPage === 1);
		} catch (err) {
			console.error("Error fetching favorites:", err);
			setError(
				"No se pudieron cargar los favoritos. Por favor, inténtalo de nuevo."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveFromWishlist = async (productId: number) => {
		try {
			await toggleFavorite(productId);
			// Actualizar la lista de favoritos después de eliminar
			fetchFavorites();
		} catch (error) {
			console.error("Error removing from favorites:", error);
		}
	};

	const handleAddToCart = async (product: FavoriteProduct) => {
		try {
			if (!product.stock || product.stock <= 0) {
				return;
			}

			await addToCart({
				productId: product.id,
				quantity: 1,
			});

			// Opcional: Mostrar un mensaje de éxito
		} catch (error) {
			console.error(`Error adding product ${product.id} to cart:`, error);
		}
	};

	// FUNCIÓN CORREGIDA PARA OBTENER IMAGEN DEL PRODUCTO
	const getProductImage = (product: FavoriteProduct): string => {
		console.log("🎨 FavoritePage - getProductImage:", product);
		
		let imagePath = "";

		// Prioridad 1: image
		if (product?.image) {
			imagePath = product.image;
		}
		// Prioridad 2: primer elemento de images array
		else if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
			const firstImage = product.images[0];
			if (typeof firstImage === 'string') {
				imagePath = firstImage;
			} else if (typeof firstImage === 'object' && firstImage !== null) {
				imagePath = firstImage.original || firstImage.medium || firstImage.thumbnail || "";
			}
		}

		console.log("🖼️ FavoritePage - Path extraído:", imagePath);
		
		// USAR EL HELPER CORREGIDO
		const finalUrl = getImageUrl(imagePath);
		console.log("🔗 FavoritePage - URL final:", finalUrl);
		
		return finalUrl;
	};

	// FUNCIÓN CORREGIDA PARA CALCULAR PRECIO CON DESCUENTO - CONVIERTE STRINGS A NUMBERS
	const calculateDiscountedPrice = (product: FavoriteProduct): { original: number, discounted: number, discount: number } => {
		console.log("💰 FavoritePage - Datos del producto completo:", product);
		
		// CONVERTIR STRINGS A NÚMEROS - ESTA ERA LA PARTE QUE FALTABA
		const originalPrice = parseFloat(product.price?.toString() || "0");
		const discountPercentage = parseFloat((product.discount_percentage || product.discount)?.toString() || "0");
		
		console.log("💰 FavoritePage - Precio original (convertido):", originalPrice);
		console.log("💰 FavoritePage - Descuento % (convertido):", discountPercentage);
		
		// Calcular precio con descuento
		let discountedPrice = originalPrice;
		if (discountPercentage > 0) {
			discountedPrice = originalPrice - (originalPrice * (discountPercentage / 100));
		}
		
		console.log("💰 FavoritePage - Precio con descuento:", discountedPrice);
		
		return {
			original: originalPrice,
			discounted: discountedPrice,
			discount: discountPercentage
		};
	};

	// FUNCIÓN CORREGIDA PARA RENDERIZAR ESTRELLAS - CONVIERTE STRINGS A NUMBERS
	const renderRatingStars = (rating: number | string = 0, ratingCount: number | string = 0) => {
		// CONVERTIR STRINGS A NÚMEROS
		const safeRating = parseFloat(rating?.toString() || "0");
		const safeRatingCount = parseInt(ratingCount?.toString() || "0");

		console.log("⭐ renderRatingStars:", { rating, safeRating, ratingCount, safeRatingCount });

		return (
			<div className="flex items-center">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						size={14}
						className={`${
							star <= Math.round(safeRating)
								? "text-yellow-400 fill-current"
								: "text-gray-300"
						}`}
					/>
				))}
				<span className="ml-2 text-sm text-gray-600">
					{safeRating.toFixed(1)} ({safeRatingCount})
				</span>
			</div>
		);
	};

	const openPreferences = (favoriteId: number) => {
		if (favoriteId) {
			setActivePreferences(favoriteId);
		}
	};

	const closePreferences = () => {
		setActivePreferences(null);
	};

	const loadMore = () => {
		if (hasMore) {
			setCurrentPage((prev) => prev + 1);
		}
	};

	return (
		<div className="container mx-auto px-10 lg:px-20 py-10">
			<div className="flex flex-wrap justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Mis Favoritos</h1>

				{!isEmpty && !isLoading && (
					<div className="text-sm text-gray-500 mt-2 md:mt-0 px-3 py-1.5 bg-gray-100 rounded-full">
						{total} {total === 1 ? "producto" : "productos"} en tu lista
					</div>
				)}
			</div>

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
					{error}
					<button className="ml-2 underline" onClick={fetchFavorites}>
						Reintentar
					</button>
				</div>
			)}

			{isLoading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			) : isEmpty ? (
				<div className="text-center py-20 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md">
					<Heart className="mx-auto h-16 w-16 text-red-100 mb-6" />
					<h2 className="text-2xl font-semibold text-gray-700 mb-3">
						Tu lista de favoritos está vacía
					</h2>
					<p className="text-gray-500 mb-8 max-w-md mx-auto">
						Guarda los productos que te gusten para verlos más tarde.
					</p>
					<Link
						to="/products"
						className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow transition-all"
					>
						Explorar productos
					</Link>
				</div>
			) : (
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{favorites.map((item, index) => {
						const product = item.product;
						if (!product) return null;

						const isInStock =
							product.is_in_stock !== undefined
								? product.is_in_stock
								: product.stock > 0;

						// USAR LA FUNCIÓN CORREGIDA QUE CONVIERTE STRINGS
						const prices = calculateDiscountedPrice(product);

						return (
							<div
								key={item.favorite.id}
								className={`flex flex-col sm:flex-row p-6 ${
									index !== favorites.length - 1
										? "border-b border-gray-200"
										: ""
								} hover:bg-gray-50 transition-colors`}
							>
								{/* Imagen del producto con badges - NAVEGACIÓN CORREGIDA */}
								<div className="sm:w-40 sm:h-40 h-60 w-full flex-shrink-0 mx-auto sm:mx-0 relative">
									<Link to={`/products/${product.id}`}>
										<img
											src={getProductImage(product)}
											alt={product.name}
											className="w-full h-full object-contain sm:object-cover rounded-lg shadow-sm"
										/>
									</Link>

									{/* Badges */}
									<div className="absolute top-2 left-2 flex flex-col space-y-1">
										{prices.discount > 0 && (
											<span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
												{prices.discount}% OFF
											</span>
										)}
										{product.isNew && (
											<span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
												NUEVO
											</span>
										)}
									</div>
								</div>

								{/* Información del producto */}
								<div className="flex-1 sm:ml-6 mt-4 sm:mt-0 flex flex-col">
									<div className="flex justify-between">
										<div>
											{/* Categoría */}
											{product.category && (
												<span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md mb-2 uppercase tracking-wide">
													{product.category}
												</span>
											)}

											{/* Nombre del producto - NAVEGACIÓN CORREGIDA */}
											<Link
												to={`/products/${product.id}`}
												className="block"
											>
												<h3 className="text-xl font-medium text-gray-800 hover:text-primary-600 transition-colors mb-2">
													{product.name}
												</h3>
											</Link>

											{/* Valoración - FUNCIÓN CORREGIDA QUE CONVIERTE STRINGS */}
											<div className="mb-2">
												{renderRatingStars(
													product.rating || 0,
													product.rating_count || 0
												)}
											</div>

											{/* Disponibilidad */}
											<div className="mb-3">
												{isInStock ? (
													<span className="inline-flex items-center text-sm text-green-600">
														<Check size={14} className="mr-1" />
														En stock
													</span>
												) : (
													<span className="inline-flex items-center text-sm text-amber-600">
														<AlertTriangle size={14} className="mr-1" />
														Agotado
													</span>
												)}
											</div>
										</div>

										{/* Botones de acciones */}
										<div className="flex space-x-2">
											<button
												onClick={() => openPreferences(item.favorite.id)}
												className="cursor-pointer text-gray-400 hover:text-blue-500 transition-colors"
												aria-label="Configurar notificaciones"
											>
												<Settings
													size={20}
													className="stroke-current"
												/>
											</button>

											<button
												onClick={() => handleRemoveFromWishlist(product.id)}
												className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
												aria-label="Eliminar de favoritos"
											>
												<Trash2
													size={20}
													className="stroke-current"
												/>
											</button>
										</div>
									</div>

									{/* Precio y botón de añadir al carrito - USANDO PRICES CALCULADOS CORRECTAMENTE */}
									<div className="mt-auto pt-4 flex flex-wrap sm:flex-nowrap items-center justify-between">
										<div className="flex items-center mb-3 sm:mb-0">
											{prices.discount > 0 ? (
												<>
													<span className="font-bold text-primary-600 text-xl">
														{formatCurrency(prices.discounted)}
													</span>
													<span className="text-sm text-gray-500 line-through ml-2">
														{formatCurrency(prices.original)}
													</span>
													<span className="ml-3 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
														{prices.discount}% DESCUENTO
													</span>
												</>
											) : (
												<span className="font-bold text-primary-600 text-xl">
													{formatCurrency(prices.original)}
												</span>
											)}
										</div>

										<button
											onClick={() => handleAddToCart(product)}
											disabled={!isInStock}
											className={`cursor-pointer inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium transition-all ${
												isInStock
													? "bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow"
													: "bg-gray-400 cursor-not-allowed"
											}`}
										>
											<ShoppingCart size={18} className="mr-2" />
											{isInStock ? "Añadir al carrito" : "Agotado"}
										</button>
									</div>
								</div>
							</div>
						);
					})}

					{/* Paginación o botón "cargar más" */}
					{hasMore && (
						<div className="flex justify-center py-4">
							<button
								onClick={loadMore}
								className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
							>
								Cargar más favoritos
							</button>
						</div>
					)}
				</div>
			)}

			{/* Modal para las preferencias de notificación */}
			{activePreferences !== null && (
				<NotificationPreferences
					favoriteId={activePreferences}
					initialPreferences={{
						notifyPriceChange:
							favorites.find((f) => f.favorite.id === activePreferences)
								?.favorite.notifyPriceChange || true,
						notifyPromotion:
							favorites.find((f) => f.favorite.id === activePreferences)
								?.favorite.notifyPromotion || true,
						notifyLowStock:
							favorites.find((f) => f.favorite.id === activePreferences)
								?.favorite.notifyLowStock || true,
					}}
					onClose={closePreferences}
				/>
			)}
		</div>
	);
};

export default FavoritePage;