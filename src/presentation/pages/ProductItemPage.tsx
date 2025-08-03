import React, {useState, useEffect} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {
	ShoppingCart,
	Heart,
	Share2,
	Truck,
	Shield,
	RotateCcw,
	Minus,
	Plus,
	Loader,
	MessageSquare,
	Gift,
	TrendingDown,
	AlertTriangle
} from "lucide-react";
// ❌ NO necesitamos ProductService anymore
// import {ProductService} from "../../core/services/ProductService";
import type {
	ProductDetail,
	ProductImage,
} from "../../core/domain/entities/Product";
import {getImageUrl} from "../../utils/imageManager";
import {useCart} from "../hooks/useCart";
import {useFavorites} from "../hooks/useFavorites";
import {useChat} from "../hooks/useChat";
import {useProducts} from "../hooks/useProducts"; // ✅ USAR HOOK OPTIMIZADO
import {useInvalidateCounters} from "../hooks/useHeaderCounters";
import {useErrorHandler} from "../hooks/useErrorHandler";
import {NotificationType} from "../contexts/CartContext";
import CacheService from "../../infrastructure/services/CacheService";
import ApiClient from "../../infrastructure/api/apiClient";
import {useProductVolumeDiscount} from "../hooks/useVolumeDiscount";
import ProductReviews from "../components/product/ProductReviews";
import RatingStars from "../components/common/RatingStars";

interface SellerApiResponse {
	status?: string;
	success?: boolean;
	data?: {
		id?: number;
		seller_id?: number;
		name?: string;
		email?: string;
	};
	message?: string;
}

const ProductItemPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	
	// ✅ USAR HOOKS OPTIMIZADOS
	const {
		product,
		loading,
		error,
		fetchProductById,
		trackProductView,
		clearCurrentProduct // ✅ NUEVA FUNCIÓN PARA LIMPIAR ESTADO
	} = useProducts();
	
	const [activeImage, setActiveImage] = useState(0);
	const [activeTab, setActiveTab] = useState<
		"description" | "specifications" | "reviews"
	>("description");
	const [isUpdating, setIsUpdating] = useState(false);
	
	const {addToCart, showNotification} = useCart();
	const {toggleFavorite, checkIsFavorite} = useFavorites();
	const {createChat} = useChat();
	
	// ✅ Hook para manejo de errores mejorado
	const {handleError, handleSuccess, handleStockError} = useErrorHandler({
		showNotification,
		context: 'ProductItemPage'
	});
	
	// ✅ Hook para actualizaciones optimistas
	const {
		optimisticCartAdd,
		optimisticFavoriteAdd,
		optimisticFavoriteRemove
	} = useInvalidateCounters();

	// ✅ USAR HOOK CORREGIDO PARA DESCUENTOS POR VOLUMEN
	const {
		quantity,
		setQuantity,
		discountResult,
		discountInfo,
		hasDiscount,
		finalPrice,
		totalSavings
	} = useProductVolumeDiscount(product, 1);

	// ❌ YA NO necesitamos ProductService directo
	// Initialize services - mantener solo para compatibilidad con chat si es necesario

	// ✅ HELPER PARA OBTENER STOCK DISPONIBLE
	const getAvailableStock = (product: ProductDetail): number => {
		// Prioridad: stockAvailable > stock > 0
		if (typeof product.stockAvailable === 'number') {
			return product.stockAvailable;
		}
		if (typeof product.stock === 'number') {
			return product.stock;
		}
		return 0;
	};

	// ✅ HELPER PARA VALIDAR DISPONIBILIDAD
	const isStockAvailable = (product: ProductDetail, requestedQuantity: number): boolean => {
		const availableStock = getAvailableStock(product);
		return availableStock >= requestedQuantity && product.is_in_stock !== false;
	};

	// ✅ HELPER PARA VALIDAR VALORES
	const hasValidValue = (value: any): boolean => {
		return value !== null && value !== undefined && value !== 0 && value !== "0" && value !== "";
	};

	// ✅ HELPER PARA MOSTRAR RATING COUNT
	const displayRatingCount = (count?: number) => {
		if (!count || count === 0 || isNaN(count)) return "Sin valoraciones";
		return `${count} valoración${count > 1 ? 'es' : ''}`;
	};

	// ✅ FUNCIÓN PARA INVALIDAR CACHE DE PÁGINAS ESPECÍFICAS
	const invalidateRelatedPages = () => {
		CacheService.removeItem("cart_user_data");
		CacheService.removeItem("cart_guest_data");
		CacheService.removeItem("header_counters");
		
		for (let page = 1; page <= 10; page++) {
			CacheService.removeItem(`user_favorites_${page}_10`);
		}
		
		console.log("🔄 Cache de páginas relacionadas invalidado");
	};

	// ✅ EFECTO OPTIMIZADO PARA CARGAR PRODUCTO POR ID
	useEffect(() => {
		const loadProduct = async () => {
			if (!id) {
				console.error("❌ ProductItemPage: ID no disponible");
				return;
			}

			try {
				const productId = parseInt(id);
				if (isNaN(productId)) {
					console.error("❌ ProductItemPage: ID inválido:", id);
					return;
				}

				console.log("🚀 ProductItemPage: Cargando producto ID:", productId);
				
				// Usar el hook optimizado en lugar del servicio directo
				const productData = await fetchProductById(productId);

				console.log("📥 ProductItemPage: Producto cargado:", productData);

				// Registrar visualización de producto de manera asíncrona
				trackProductView(productId).catch((error) => {
					console.error("⚠️ Error registrando visualización de producto:", error);
				});
			} catch (err) {
				console.error("❌ ProductItemPage: Error cargando producto:", err);
			}
		};

		loadProduct();
	}, [id, fetchProductById, trackProductView]);
	
	// ✅ EFECTO PARA LIMPIAR PRODUCTO CUANDO CAMBIA EL ID
	useEffect(() => {
		// Si cambia el ID y tenemos un producto cargado que no coincide, 
		// limpiar para evitar mostrar producto incorrecto
		if (product && id && product.id !== parseInt(id)) {
			console.log("🧩 ProductItemPage: Limpiando producto anterior, ID cambio de", product.id, "a", id);
			clearCurrentProduct(); // ✅ USAR FUNCIÓN DEL HOOK
		}
	}, [id, product, clearCurrentProduct]);

	// ✅ FUNCIÓN PARA CAMBIAR CANTIDAD CON VALIDACIÓN DE STOCK
	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity < 1) return;
		
		if (!product) {
			handleError(new Error("Producto no disponible"), "No se puede cambiar la cantidad");
			return;
		}

		const availableStock = getAvailableStock(product);
		
		if (newQuantity > availableStock) {
			handleStockError(availableStock, newQuantity);
			return;
		}

		if (newQuantity <= 50) {
			setQuantity(newQuantity);
		} else {
			showNotification(
				NotificationType.WARNING,
				"No puedes agregar más de 50 unidades por producto"
			);
		}
	};

	// ✅ FUNCIÓN PARA AGREGAR AL CARRITO CON VALIDACIÓN DE STOCK
	const handleAddToCart = async () => {
		if (isUpdating || !product) {
			if (!product) {
				handleError(new Error("Producto no disponible"), "Error: No se pudo cargar la información del producto");
			}
			return;
		}

		// Validar disponibilidad general
		if (!product!.is_in_stock) {
			showNotification(
				NotificationType.ERROR,
				"Lo sentimos, este producto está agotado"
			);
			return;
		}

		// Validar stock específico
		const availableStock = getAvailableStock(product!);
		if (!isStockAvailable(product!, quantity)) {
			handleStockError(availableStock, quantity);
			return;
		}

		console.log(`Añadiendo al carrito: ${quantity} unidades de ${product!.name} con precio final: $${finalPrice}`);

		try {
			setIsUpdating(true);

			// ✅ ACTUALIZACIÓN OPTIMISTA INMEDIATA
			optimisticCartAdd();

			const success = await addToCart({
				productId: Number(id),
				quantity: quantity,
			});

			if (success) {
				// ✅ INVALIDAR CACHE DE PÁGINAS RELACIONADAS
				invalidateRelatedPages();

				let message = `${product!.name} ha sido agregado al carrito`;
				if (hasDiscount && totalSavings > 0) {
					message += ` con ${discountResult?.discountPercentage}% de descuento (ahorro: $${totalSavings.toFixed(2)})`;
				}

				handleSuccess(message);
			} else {
				throw new Error("No se pudo agregar el producto al carrito");
			}
		} catch (error: any) {
			console.error("Error al agregar al carrito:", error);
			
			// Manejo específico de errores de stock
			if (error?.response?.data?.message?.includes('stock') || 
				error?.message?.includes('stock') ||
				error?.response?.data?.message?.includes('insuficiente')) {
				const availableStock = getAvailableStock(product!);
				handleStockError(availableStock, quantity);
			} else {
				handleError(error, "Error al agregar producto al carrito. Inténtalo de nuevo.");
			}
		} finally {
			// ✅ TIMEOUT PARA PREVENIR SPAM
			setTimeout(() => {
				setIsUpdating(false);
			}, 1000);
		}
	};

	const handleAddToWishlist = async () => {
		if (isUpdating || !product) {
			if (!product) {
				handleError(new Error("Producto no disponible"), "Error: No se pudo cargar la información del producto");
			}
			return;
		}

		console.log(`Gestionando favoritos: ${product!.name}`);

		try {
			setIsUpdating(true);

			// ✅ VERIFICAR ESTADO ACTUAL Y ACTUALIZACIÓN OPTIMISTA
			const isCurrentlyFavorite = checkIsFavorite(Number(id));
			
			if (isCurrentlyFavorite) {
				optimisticFavoriteRemove();
			} else {
				optimisticFavoriteAdd();
			}

			const result = await toggleFavorite(Number(id));

			// ✅ INVALIDAR CACHE DE PÁGINAS RELACIONADAS
			invalidateRelatedPages();

			if (result) {
				handleSuccess("Producto añadido a favoritos");
			} else {
				showNotification(NotificationType.INFO, "Producto eliminado de favoritos");
			}
		} catch (error: any) {
			console.error("Error al manejar favorito:", error);
			handleError(error, "Error al gestionar favoritos. Inténtalo de nuevo.");
		} finally {
			setTimeout(() => {
				setIsUpdating(false);
			}, 1000);
		}
	};

	const handleChatWithSeller = async () => {
		if (!product) {
			handleError(new Error("Producto no disponible"), "Error: No se pudo cargar la información del producto");
			return;
		}

		try {
			let sellerId;

			if (product!.seller_id) {
				sellerId = product!.seller_id;
				console.log(`Usando seller_id directo del producto: ${sellerId}`);
			}
			else if (product!.seller?.id) {
				sellerId = product!.seller.id;
				console.log(`Usando seller.id del producto: ${sellerId}`);
			}
			else if (product!.user_id) {
				console.log(
					`Intentando obtener seller_id a partir de user_id: ${product!.user_id}`
				);

				try {
					const response = await ApiClient.get<SellerApiResponse>(
						`/sellers/by-user/${product!.user_id}`
					);

					if (response && response.data) {
						if (response.data.id) {
							sellerId = response.data.id;
							console.log(
								`Convertido user_id ${product!.user_id} a seller_id ${sellerId}`
							);
						} else if (response.data.seller_id) {
							sellerId = response.data.seller_id;
							console.log(
								`Convertido user_id ${product!.user_id} a seller_id ${sellerId}`
							);
						} else {
							console.warn(
								`No se pudo obtener seller_id, usando user_id como fallback`
							);
							sellerId = product!.user_id;
						}
					} else {
						console.warn(
							`Respuesta de API vacía o sin data, usando user_id como fallback`
						);
						sellerId = product!.user_id;
					}
				} catch (error) {
					console.error("Error al obtener seller_id:", error);
					sellerId = product!.user_id;
					console.warn(
						`Fallback: usando user_id ${sellerId} como seller_id debido a error`
					);
				}
			} else {
				console.error(
					"No se encontró información de vendedor en datos del producto:",
					product
				);
				throw new Error("No se pudo determinar el vendedor del producto");
			}

			console.log(
				`Iniciando chat con vendedor ID ${sellerId} para producto ${product!.id}`
			);

			const chatId = await createChat(sellerId, Number(id));
			if (chatId) {
				navigate(`/chats/${chatId}`);
			} else {
				throw new Error("No se pudo crear el chat con el vendedor");
			}
		} catch (error: any) {
			console.error("Error al iniciar chat con vendedor:", error);
			handleError(error, "Error al iniciar chat con vendedor. Inténtalo de nuevo.");
		}
	};

	// ✅ FUNCIÓN COMPARTIR
	const handleShareProduct = async () => {
		const currentUrl = window.location.href;
		
		try {
			await navigator.clipboard.writeText(currentUrl);
			handleSuccess("¡Enlace copiado al portapapeles!");
		} catch (error: any) {
			console.error("Error al copiar enlace:", error);
			handleError(error, "No se pudo copiar el enlace");
		}
	};



	// Show loading state
	if (loading) {
		return (
			<div className="container mx-auto flex items-center justify-center py-20">
				<div className="text-center">
					<Loader
						size={40}
						className="animate-spin mx-auto mb-4 text-primary-600"
					/>
					<p className="text-gray-600">Cargando información del producto...</p>
				</div>
			</div>
		);
	}

	// Show error state - SOLO si no está cargando
	if (!loading && (error || !product)) {
		console.log("❌ ProductItemPage: Mostrando error:", { loading, error, hasProduct: !!product });
		return (
			<div className="container mx-auto py-20">
				<div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md">
					<h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
					<p className="text-gray-700 mb-6">
						{error || "No se encontró el producto solicitado."}
					</p>
					<div className="flex gap-3">
						<button
							onClick={() => navigate(-1)}
							className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
						>
							Volver
						</button>
						{id && (
							<button
								onClick={() => {
									const productId = parseInt(id);
									if (!isNaN(productId)) {
										console.log("🔄 ProductItemPage: Reintentando cargar producto:", productId);
										fetchProductById(productId);
									}
								}}
								className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
							>
								Reintentar
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Process product data for display - product is guaranteed to be non-null here
	const categories = product!.category ? [product!.category.name] : [];
	const availableStock = getAvailableStock(product!);
	
	// 🔍 LOGS DE DEBUG PARA MONITOREO
	console.log("🔍 ProductItemPage: Estado actual:", {
		id,
		loading,
		error,
		hasProduct: !!product,
		productId: product?.id,
		productName: product?.name,
		availableStock
	});

	// Función helper para obtener URL de imagen
	const getImageUrlFromProduct = (image: string | ProductImage): string => {
		if (typeof image === "string") {
			return getImageUrl(image);
		}
		return getImageUrl(image.original || image.medium || image.thumbnail);
	};

	// Parse colors, sizes, and tags
	const parseStringArrays = (value: any): string[] => {
		if (!value) return [];
		if (Array.isArray(value)) {
			if (typeof value[0] === "string" && !value[0].startsWith("[")) {
				return value;
			}
			try {
				return value
					.join(",")
					.replace(/\[|\]|"/g, "")
					.split(",");
			} catch (e) {
				return [];
			}
		}
		return [];
	};

	const colors = parseStringArrays(product!.colors);
	const sizes = parseStringArrays(product!.sizes);
	const tags = parseStringArrays(product!.tags);

	// Create specification items from product data
	const specifications = [
		{
			name: "Peso", 
			value: hasValidValue(product!.weight) ? `${product!.weight} kg` : "N/A"
		},
		{
			name: "Dimensiones",
			value: product!.dimensions || 
				(hasValidValue(product!.width) && hasValidValue(product!.height) && hasValidValue(product!.depth))
					? `${product!.width} × ${product!.height} × ${product!.depth} cm`
					: "N/A",
		},
		{
			name: "Disponibilidad",
			value: product!.is_in_stock ? `En stock (${availableStock} unidades)` : "Agotado",
		},
		{
			name: "Categoría", 
			value: product!.category?.name || "N/A"
		},
	];

	return (
		<div className="container mx-auto px-4 py-10">
			<div className="max-w-7xl mx-auto">
				{/* Breadcrumbs */}
				<nav className="flex mb-6 text-sm text-gray-500">
					<Link to="/" className="hover:text-primary-600">
						Inicio
					</Link>
					<span className="mx-2">/</span>
					{product!.category ? (
						<>
							<Link
								to={`/category/${product!.category.slug}`}
								className="hover:text-primary-600"
							>
								{product!.category.name}
							</Link>
							<span className="mx-2">/</span>
						</>
					) : null}
					<span className="text-gray-700 font-medium">{product!.name}</span>
				</nav>

				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 lg:p-10">
						{/* Product Images */}
						<div className="space-y-6">
							<div className="bg-gray-50 rounded-xl overflow-hidden h-96 lg:h-[500px]">
								{(product!.images && product!.images.length > 0) ? (
									<img
										src={getImageUrlFromProduct(product!.images[activeImage])}
										alt={product!.name}
										className="w-full h-full object-cover transition-all duration-300"
									/>
								) : null}
							</div>
							{(product!.images && product!.images.length > 1) ? (
								<div className="grid grid-cols-4 gap-3">
									{product!.images.map((image, index) => (
										<div
											key={index}
											className={`bg-gray-50 rounded-lg h-24 cursor-pointer border-2 transition-all overflow-hidden ${
												index === activeImage
													? "border-primary-500 shadow-md"
													: "border-transparent hover:border-gray-300"
											}`}
											onClick={() => setActiveImage(index)}
										>
											<img
												src={getImageUrlFromProduct(image)}
												alt={`${product!.name} thumbnail ${index + 1}`}
												className="w-full h-full object-cover"
											/>
										</div>
									))}
								</div>
							) : null}
						</div>

						{/* Product Info */}
						<div className="space-y-6">
							{/* Seller Info */}
							{(product!.seller && product!.seller.name) ? (
								<div className="flex items-center mb-2">
									<span className="text-sm bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-medium">
										{product!.seller.name}
									</span>
								</div>
							) : null}

							{/* Title */}
							<h1 className="text-3xl font-bold text-gray-900">
								{product!.name}
							</h1>

							{/* ✅ INFORMACIÓN DE STOCK PROMINENTE */}
							<div className="flex items-center space-x-3">
								{product!.is_in_stock ? (
									<div className="flex items-center">
										<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
										<span className="text-green-700 font-medium">
											En stock ({availableStock} disponibles)
										</span>
									</div>
								) : (
									<div className="flex items-center">
										<AlertTriangle size={16} className="text-red-500 mr-2" />
										<span className="text-red-600 font-medium">Agotado</span>
									</div>
								)}
							</div>

							{/* Rating */}
							{(product!.rating && 
							  typeof product!.rating === 'number' && 
							  product!.rating > 0) ? (
								<div className="flex items-center gap-3">
									<div className="flex items-center">
										<RatingStars rating={product!.rating} size={18} showValue={true} />
									</div>
									<div className="text-gray-500 text-sm">
										<span className="font-medium">
											{displayRatingCount(product!.rating_count)}
										</span>
									</div>
								</div>
							) : null}

							{/* ✅ SECCIÓN DE PRECIOS CON DESCUENTOS POR VOLUMEN ACTUALIZADOS */}
							<div className="space-y-3">
								{/* Precio principal */}
								<div className="price-container">
									<span className="text-3xl font-bold text-primary-700">
										${finalPrice.toFixed(2)}
									</span>
									{hasDiscount && (
										<span className="ml-3 text-lg text-gray-500 line-through">
											${(product!.final_price || product!.price).toFixed(2)}
										</span>
									)}
									{hasDiscount && (
										<span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
											{discountResult?.discountPercentage}% OFF
										</span>
									)}
								</div>

								{/* ✅ MOSTRAR AHORROS ACTUALES */}
								{hasDiscount && totalSavings > 0 && (
									<div className="flex items-center text-green-600">
										<Gift size={16} className="mr-1" />
										<span className="font-medium">
											¡Ahorras ${totalSavings.toFixed(2)} con descuento por volumen!
										</span>
									</div>
								)}
							</div>

							{/* ✅ MOSTRAR INFORMACIÓN DE DESCUENTOS DISPONIBLES */}
							{discountInfo.enabled && discountInfo.tiers.length > 0 && (
								<div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
									<div className="flex items-start">
										<TrendingDown size={20} className="text-blue-600 mr-2 mt-0.5" />
										<div className="flex-1">
											<h4 className="text-sm font-medium text-blue-900 mb-2">
												¡Descuentos por volumen disponibles!
											</h4>
											<div className="space-y-1">
												{discountInfo.tiers.map((tier, index) => (
													<div key={index} className="flex items-center justify-between text-sm">
														<span className={`${
															quantity >= tier.quantity 
																? "text-green-700 font-medium" 
																: "text-blue-800"
														}`}>
															{tier.quantity}+ unidades = {tier.discount}% descuento
														</span>
														{quantity >= tier.quantity && (
															<span className="text-green-600 text-xs font-medium">
																✓ Aplicado
															</span>
														)}
													</div>
												))}
											</div>
											
											{/* ✅ MOSTRAR PRÓXIMO DESCUENTO DISPONIBLE */}
											{discountResult?.nextTier && (
												<div className="mt-2 pt-2 border-t border-blue-200">
													<span className="text-xs text-blue-600">
														¡Añade {discountResult.itemsNeededForNext} más y obtén {discountResult.nextTier.discount}% de descuento!
													</span>
												</div>
											)}
										</div>
									</div>
								</div>
							)}

							{/* Color Selection */}
							{colors.length > 0 ? (
								<div>
									<h3 className="font-medium text-gray-900 mb-3">Color:</h3>
									<div className="flex space-x-3">
										{colors.map((color, index) => (
											<div
												key={index}
												className="px-3 py-1 border border-gray-300 rounded-full cursor-pointer hover:border-primary-500"
												title={color}
											>
												{color}
											</div>
										))}
									</div>
								</div>
							) : null}

							{/* Size Selection */}
							{sizes.length > 0 ? (
								<div>
									<h3 className="font-medium text-gray-900 mb-3">Tamaño:</h3>
									<div className="flex space-x-3">
										{sizes.map((size, index) => (
											<div
												key={index}
												className="px-3 py-1 border border-gray-300 rounded-full cursor-pointer hover:border-primary-500"
												title={size}
											>
												{size}
											</div>
										))}
									</div>
								</div>
							) : null}

							{/* ✅ CANTIDAD Y PRECIO TOTAL CON VALIDACIÓN DE STOCK */}
							<div className="space-y-4">
								<div>
									<h3 className="font-medium text-gray-900 mb-3">Cantidad:</h3>
									<div className="flex items-center space-x-4">
										<div className="flex border border-gray-300 rounded-lg overflow-hidden h-12">
											<button
												className="px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
												onClick={() => handleQuantityChange(quantity - 1)}
												disabled={quantity <= 1}
											>
												<Minus size={18} />
											</button>
											<input
												type="number"
												className="w-20 text-center border-x border-gray-300 text-gray-700 font-medium focus:outline-none"
												min="1"
												max={Math.min(availableStock, 50)}
												value={quantity}
												onChange={(e) =>
													handleQuantityChange(parseInt(e.target.value) || 1)
												}
											/>
											<button
												className="px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center disabled:opacity-50"
												onClick={() => handleQuantityChange(quantity + 1)}
												disabled={quantity >= Math.min(availableStock, 50)}
											>
												<Plus size={18} />
											</button>
										</div>
										
										{/* ✅ MOSTRAR PRECIO TOTAL EN TIEMPO REAL */}
										<div className="text-lg">
											<span className="text-gray-600">Total: </span>
											<span className="font-bold text-primary-700">
												${(finalPrice * quantity).toFixed(2)}
											</span>
											{hasDiscount && (
												<div className="text-sm text-green-600">
													(Ahorras ${totalSavings.toFixed(2)})
												</div>
											)}
										</div>
									</div>

									{/* ✅ MOSTRAR LÍMITE DE STOCK */}
									{availableStock < 10 && availableStock > 0 && (
										<div className="mt-2 text-sm text-amber-600 flex items-center">
											<AlertTriangle size={14} className="mr-1" />
											¡Solo quedan {availableStock} unidades disponibles!
										</div>
									)}
								</div>

								{/* ✅ BOTONES DE ACCIÓN */}
								<div className="flex flex-col sm:flex-row gap-4">
									<button
										className="flex-grow h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
										onClick={handleAddToCart}
										disabled={!product!.is_in_stock || isUpdating || availableStock === 0}
									>
										<ShoppingCart size={20} className="mr-2" />
										{isUpdating ? "Agregando..." : product!.is_in_stock && availableStock > 0
											? `Añadir al Carrito - $${(finalPrice * quantity).toFixed(2)}`
											: "Producto Agotado"}
									</button>
									<button
										className="h-12 w-12 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-600 transition-colors duration-200 disabled:opacity-50"
										onClick={handleAddToWishlist}
										disabled={isUpdating}
										title="Añadir a favoritos"
									>
										<Heart size={20} />
									</button>
									<button
										className="h-12 px-4 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-600 transition-colors duration-200"
										onClick={handleChatWithSeller}
										title="Chatear con el vendedor"
									>
										<MessageSquare size={20} className="mr-2" />
										Contactar
									</button>
								</div>
							</div>

							{/* Delivery and Benefits */}
							<div className="bg-gray-50 rounded-xl p-5 space-y-4">
								<div className="flex items-start">
									<Truck
										className="text-primary-600 mt-1 flex-shrink-0 mr-3"
										size={20}
									/>
									<div>
										<h4 className="font-medium text-gray-900">
											Entrega rápida
										</h4>
										<p className="text-sm text-gray-600">
											{product!.is_in_stock ? (
												<>
													Disponible para entrega en{" "}
													<span className="font-medium">1-3 días hábiles</span>
												</>
											) : (
												"Producto agotado temporalmente"
											)}
										</p>
									</div>
								</div>
								<div className="flex items-start">
									<Shield
										className="text-primary-600 mt-1 flex-shrink-0 mr-3"
										size={20}
									/>
									<div>
										<h4 className="font-medium text-gray-900">
											Garantía de 1 año
										</h4>
										<p className="text-sm text-gray-600">
											Garantía del fabricante contra defectos
										</p>
									</div>
								</div>
								<div className="flex items-start">
									<RotateCcw
										className="text-primary-600 mt-1 flex-shrink-0 mr-3"
										size={20}
									/>
									<div>
										<h4 className="font-medium text-gray-900">
											Devolución gratuita
										</h4>
										<p className="text-sm text-gray-600">
											Devolución sin costo en los primeros 30 días
										</p>
									</div>
								</div>
							</div>

							{/* Categories */}
							{(categories.length > 0 || tags.length > 0) ? (
								<div className="pt-4 border-t border-gray-200">
									{categories.length > 0 ? (
										<div className="flex items-center mb-2">
											<span className="text-gray-600 mr-2">Categorías:</span>
											<div className="flex flex-wrap gap-2">
												{categories.map((category, index) => (
													<Link
														key={index}
														to={`/category/${product!.category?.slug || ""}`}
														className="bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm rounded-full text-gray-700 transition-colors"
													>
														{category}
													</Link>
												))}
											</div>
										</div>
									) : null}

									{tags.length > 0 ? (
										<div className="flex items-center">
											<span className="text-gray-600 mr-2">Etiquetas:</span>
											<div className="flex flex-wrap gap-2">
												{tags.map((tag, index) => (
													<Link
														key={index}
														to={`/tags/${tag}`}
														className="bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm rounded-full text-gray-700 transition-colors"
													>
														{tag}
													</Link>
												))}
											</div>
										</div>
									) : null}
								</div>
							) : null}

							{/* Share */}
							<button 
								onClick={handleShareProduct}
								className="flex items-center text-gray-500 text-sm hover:text-primary-600 transition-colors cursor-pointer"
							>
								<Share2 size={16} className="mr-2" />
								<span>Compartir este producto</span>
							</button>
						</div>
					</div>

					{/* Tabs */}
					<div className="border-t border-gray-200">
						<div className="flex border-b border-gray-200">
							<button
								className={`py-4 px-6 font-medium text-sm ${
									activeTab === "description"
										? "text-primary-600 border-b-2 border-primary-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => setActiveTab("description")}
							>
								Descripción
							</button>
							<button
								className={`py-4 px-6 font-medium text-sm ${
									activeTab === "specifications"
										? "text-primary-600 border-b-2 border-primary-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => setActiveTab("specifications")}
							>
								Especificaciones
							</button>
							<button
								className={`py-4 px-6 font-medium text-sm ${
									activeTab === "reviews"
										? "text-primary-600 border-b-2 border-primary-600"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => setActiveTab("reviews")}
							>
								Valoraciones
							</button>
						</div>

						<div className="flex justify-center p-6 lg:p-10">
							{activeTab === "description" && (
								<div className="max-w-3xl space-y-6">
									{product!.short_description ? (
										<p className="font-medium text-lg text-gray-800">
											{product!.short_description}
										</p>
									) : null}
									<p className="text-gray-700 leading-relaxed">
										{product!.description}
									</p>
								</div>
							)}

							{activeTab === "specifications" && (
								<div className="max-w-3xl">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
										{specifications.map((spec, index) => (
											<div
												key={index}
												className="flex border-b border-gray-100 pb-3"
											>
												<span className="w-40 font-medium text-gray-700">
													{spec.name}:
												</span>
												<span className="text-gray-600">{spec.value}</span>
											</div>
										))}
									</div>
								</div>
							)}

							{activeTab === "reviews" && (
							<ProductReviews 
							productId={product!.id || 0} 
							rating={product!.rating || 0} 
							ratingCount={product!.rating_count || product!.ratingCount || 0} 
							/>
							)}
						</div>
					</div>
				</div>

				{/* Related Products */}
				{(product!.related_products && product!.related_products.length > 0) ? (
					<div className="mt-16">
						<h2 className="text-2xl font-bold mb-8">Productos relacionados</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{product!.related_products.map((relatedProduct) => (
								<div
									key={relatedProduct.id}
									className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
								>
									<div className="h-52 bg-gray-50 flex items-center justify-center p-4">
										<img
											src={getImageUrl(
												relatedProduct.images &&
													relatedProduct.images.length > 0
													? typeof relatedProduct.images[0] === "string"
														? relatedProduct.images[0]
														: (relatedProduct.images[0] as ProductImage)
																.original ||
															(relatedProduct.images[0] as ProductImage).medium
													: null
											)}
											alt={relatedProduct.name}
											className="max-h-full max-w-full object-contain"
										/>
									</div>
									<div className="p-5">
										{(relatedProduct.rating && 
										typeof relatedProduct.rating === 'number' && 
										relatedProduct.rating > 0) ? (
										<div className="flex items-center mb-2">
										<RatingStars 
										 rating={relatedProduct.rating} 
										size={14} 
										 showValue={true} 
										 />
										 </div>
									) : null}
										<Link to={`/product/${relatedProduct.id}`}>
											<h3 className="font-medium text-gray-800 mb-2 hover:text-primary-600 transition-colors line-clamp-2 h-12">
												{relatedProduct.name}
											</h3>
										</Link>
										<p className="text-primary-600 font-bold">
											$
											{(relatedProduct.final_price && 
											  typeof relatedProduct.final_price === 'number' && 
											  relatedProduct.final_price > 0)
												? relatedProduct.final_price.toFixed(2)
												: relatedProduct.price.toFixed(2)}
										</p>
										<Link
											to={`/product/${relatedProduct.id}`}
											className="block w-full mt-3"
										>
											<button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium text-sm transition-colors">
												Ver detalles
											</button>
										</Link>
									</div>
								</div>
							))}
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default ProductItemPage;