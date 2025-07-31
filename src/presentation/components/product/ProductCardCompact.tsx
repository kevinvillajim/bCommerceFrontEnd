import React, {useState} from "react";
import {Heart, ShoppingCart, Check} from "lucide-react";
import {Link} from "react-router-dom";
import RatingStars from "../common/RatingStars";
import {useCart} from "../../hooks/useCart";
import {useFavorites} from "../../hooks/useFavorites";
import {useInvalidateCounters} from "../../hooks/useHeaderCounters";
import {NotificationType} from "../../contexts/CartContext";
import CacheService from "../../../infrastructure/services/CacheService";

interface ProductCardProps {
	id: number;
	name: string;
	price: number;
	discount?: number;
	rating?: number;
	reviews?: number;
	image: string;
	category?: string;
	isNew?: boolean;
	color?: boolean;
	stock?: number;
	slug?: string;
	// Props opcionales para funciones externas - pueden ser async
	onAddToCart?: (id: number) => void | Promise<void>;
	onAddToWishlist?: (id: number) => void | Promise<void>;
}

const ProductCardCompact: React.FC<ProductCardProps> = ({
	id,
	name,
	price,
	discount,
	rating = 0,
	reviews = 0,
	image,
	category,
	isNew = false,
	color = true,
	stock = 10,
	slug,
	// Funciones externas opcionales
	onAddToCart,
	onAddToWishlist,
}) => {
	// Estados para controlar las animaciones y feedback visual
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [isInCart, setIsInCart] = useState(false); // ✅ NUEVO: estado para carrito

	// Hooks para carrito y favoritos
	const {addToCart, showNotification} = useCart();
	const {toggleFavorite, checkIsFavorite} = useFavorites();
	
	// ✅ Hook para actualizaciones optimistas
	const {
		optimisticCartAdd,
		optimisticFavoriteAdd,
		optimisticFavoriteRemove
	} = useInvalidateCounters();

	// ✅ FUNCIÓN PARA INVALIDAR CACHE DE PÁGINAS ESPECÍFICAS
	const invalidateRelatedPages = () => {
		CacheService.removeItem("cart_user_data");
		CacheService.removeItem("cart_guest_data");
		CacheService.removeItem("header_counters");
		
		// Invalidar cache de favoritos
		for (let page = 1; page <= 10; page++) {
			CacheService.removeItem(`user_favorites_${page}_10`);
		}
		
		console.log("🔄 Cache invalidado desde ProductCardCompact");
	};

	// ✅ INICIALIZAR ESTADOS AL MONTAR + MEJORAR INDICADORES VISUALES
	React.useEffect(() => {
		const isFav = checkIsFavorite(id);
		setIsFavorite(isFav);
		
		// Verificar si el producto ya está en carrito y mostrar indicador visual
		// Esta es una mejora opcional que no requiere demasiada capacidad
		const checkIfInCart = () => {
			// Verificar localStorage o estado global del carrito
			try {
				const cartData = localStorage.getItem('cart_items') || localStorage.getItem('cart_data');
				if (cartData) {
					const cart = JSON.parse(cartData);
					const isInCart = cart.items?.some((item: any) => 
						item.product_id === id || item.productId === id || item.id === id
					);
					if (isInCart) {
						setIsInCart(true);
					}
				}
			} catch (error) {
				// No hacer nada si hay error, es mejora opcional
				console.log('📝 Verificación opcional de carrito:', error);
			}
		};
		
		checkIfInCart();
	}, [id, checkIsFavorite]);

	// Calculate discounted price
	const discountedPrice = discount ? price - price * (discount / 100) : price;

	// Verificar si hay stock
	const hasStock = stock > 0;

	// ✅ FUNCIÓN PRINCIPAL PARA CARRITO - Reutilizada en todos los botones
	const executeAddToCart = async () => {
		console.log("🚀 ProductCardCompact.executeAddToCart INICIADO", {
			productId: id,
			hasExternalFunction: !!onAddToCart,
			isAddingToCart,
			hasStock
		});

		if (isAddingToCart || !hasStock) {
			if (!hasStock) {
				showNotification(
					NotificationType.ERROR,
					"Lo sentimos, este producto está agotado"
				);
			}
			console.log("❌ Acción bloqueada - isAddingToCart:", isAddingToCart, "hasStock:", hasStock);
			return;
		}

		setIsAddingToCart(true);

		try {
			if (onAddToCart) {
				// ✅ HAY FUNCIÓN EXTERNA - NO optimizar aquí, dejar que ella lo haga
				console.log("🔄 Ejecutando SOLO función externa (NO optimización aquí)");
				const result = onAddToCart(id);
				if (result && typeof result.then === 'function') {
					console.log("⏳ Esperando función externa async...");
					await result;
					console.log("✅ Función externa completada");
				} else {
					console.log("✅ Función externa sync completada");
				}
			} else {
				// ✅ NO HAY FUNCIÓN EXTERNA - optimizar + API
				console.log("🔄 NO hay función externa - aplicando optimización + API");
				
				console.log("📈 Aplicando optimisticCartAdd...");
				optimisticCartAdd();
				
				console.log("📞 Llamando addToCart API...");
				const success = await addToCart({
					productId: id,
					quantity: 1,
				});

				if (!success) {
					console.log("❌ API falló");
					throw new Error("No se pudo agregar el producto al carrito");
				}

				console.log("✅ API exitosa");
				showNotification(
					NotificationType.SUCCESS,
					`${name} ha sido agregado al carrito`
				);
				
				console.log("🔄 Invalidando cache...");
				invalidateRelatedPages();
			}
			
			// ✅ FEEDBACK VISUAL - Marcar como agregado al carrito
			setIsInCart(true);
			
			// ✅ RESETEAR FEEDBACK VISUAL DESPUÉS DE 3 SEGUNDOS
			setTimeout(() => {
				setIsInCart(false);
			}, 3000);
			
			console.log("🎉 ProductCardCompact.executeAddToCart COMPLETADO");
			
		} catch (error) {
			console.error("❌ Error en ProductCardCompact.executeAddToCart:", error);
			showNotification(
				NotificationType.ERROR,
				"Error al agregar producto al carrito. Inténtalo de nuevo."
			);
		} finally {
			console.log("🔚 Limpiando estado isAddingToCart...");
			setTimeout(() => {
				setIsAddingToCart(false);
				console.log("✅ Estado limpio");
			}, 500);
		}
	};

	// ✅ FUNCIÓN PRINCIPAL PARA FAVORITOS - Reutilizada en todos los botones
	const executeAddToWishlist = async () => {
		const isCurrentlyFavorite = checkIsFavorite(id);
		
		console.log("💖 ProductCardCompact.executeAddToWishlist INICIADO", {
			productId: id,
			isCurrentlyFavorite,
			hasExternalFunction: !!onAddToWishlist,
			isAddingToWishlist
		});

		if (isAddingToWishlist) {
			console.log("❌ Click ignorado - ya se está procesando");
			return;
		}

		setIsAddingToWishlist(true);

		try {
			if (onAddToWishlist) {
				// ✅ HAY FUNCIÓN EXTERNA - NO optimizar aquí, dejar que ella lo haga
				console.log("🔄 Ejecutando SOLO función externa (NO optimización aquí)");
				const result = onAddToWishlist(id);
				if (result && typeof result.then === 'function') {
					console.log("⏳ Esperando función externa async...");
					await result;
					console.log("✅ Función externa completada");
				} else {
					console.log("✅ Función externa sync completada");
				}
				
				setIsFavorite(!isFavorite);
			} else {
				// ✅ NO HAY FUNCIÓN EXTERNA - optimizar + API
				console.log("🔄 NO hay función externa - aplicando optimización + API");
				
				console.log(`📈 Aplicando optimistic${isCurrentlyFavorite ? 'Remove' : 'Add'}...`);
				if (isCurrentlyFavorite) {
					optimisticFavoriteRemove();
				} else {
					optimisticFavoriteAdd();
				}
				
				console.log("📞 Llamando toggleFavorite API...");
				const result = await toggleFavorite(id);
				
				if (result === undefined) {
					console.log("❌ API falló");
					throw new Error("No se pudo gestionar el favorito");
				}
				
				console.log("✅ API exitosa, resultado:", result);
				setIsFavorite(result);

				if (result) {
					showNotification(
						NotificationType.SUCCESS,
						"Producto añadido a favoritos"
					);
				} else {
					showNotification(
						NotificationType.INFO,
						"Producto eliminado de favoritos"
					);
				}
				
				console.log("🔄 Invalidando cache...");
				invalidateRelatedPages();
			}
			
			console.log("🎉 ProductCardCompact.executeAddToWishlist COMPLETADO");
			
		} catch (error) {
			console.error("❌ Error en ProductCardCompact.executeAddToWishlist:", error);
			showNotification(
				NotificationType.ERROR,
				"Error al gestionar favoritos. Inténtalo de nuevo."
			);
		} finally {
			console.log("🔚 Limpiando estado isAddingToWishlist...");
			setTimeout(() => {
				setIsAddingToWishlist(false);
				console.log("✅ Estado limpio");
			}, 500);
		}
	};

	// ✅ HANDLERS SIMPLIFICADOS - Solo llaman a las funciones principales
	const handleAddToCart = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		await executeAddToCart();
	};

	const handleAddToWishlist = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		await executeAddToWishlist();
	};

	return (
		<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group product-card">
			{/* Product Image with Overlay */}
			<div className="relative h-48 overflow-hidden">
				<Link to={`/products/${slug || id}`}>
					<img
						src={image}
						alt={name}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
					/>
				</Link>

				{/* Discount Tag - Solo si hay descuento válido */}
				{(discount && typeof discount === 'number' && discount > 0) && (
					<div
						className={`absolute top-2 left-2 ${color ? "bg-red-500" : "bg-primary-600"} text-white text-xs font-bold py-1 px-2 rounded-md badge`}
					>
						-{discount}%
					</div>
				)}

				{/* New Product Tag */}
				{isNew && (
					<div
						className={`absolute top-2 right-2 ${color ? "bg-green-500" : "bg-primary-800"} text-white text-xs font-bold py-1 px-2 rounded-md badge`}
					>
						Nuevo
					</div>
				)}

				{/* ✅ BOTONES HOVER MEJORADOS - Exactamente la misma lógica */}
				<div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-3 hidden sm:flex">
					<button
						onClick={handleAddToWishlist}
						disabled={isAddingToWishlist}
						className="cursor-pointer bg-white p-3 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
						aria-label="Añadir a favoritos"
						title="Añadir a favoritos"
					>
						{isAddingToWishlist ? (
							<div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
						) : isFavorite ? (
							<Heart size={20} className="text-red-500 fill-current" />
						) : (
							<Heart size={20} className="text-gray-600" />
						)}
					</button>
					<button
						onClick={handleAddToCart}
						disabled={isAddingToCart || !hasStock}
						className={`cursor-pointer bg-white p-3 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 ${!hasStock ? "cursor-not-allowed" : ""}`}
						aria-label="Añadir al carrito"
						title={hasStock ? "Añadir al carrito" : "Sin stock"}
					>
						{isAddingToCart ? (
							<div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
						) : isInCart ? (
							<Check size={20} className="text-green-500" />
						) : !hasStock ? (
							<ShoppingCart size={20} className="text-gray-400" />
						) : (
							<ShoppingCart size={20} className="text-gray-600" />
						)}
					</button>
				</div>

				{/* ✅ BOTONES MÓVILES/TABLET - Exactamente la misma lógica */}
				<div className="absolute bottom-2 right-2 flex gap-2 sm:hidden">
					<button
						onClick={handleAddToWishlist}
						disabled={isAddingToWishlist}
						className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 disabled:opacity-50 shadow-md"
						aria-label="Añadir a favoritos"
					>
						{isAddingToWishlist ? (
							<div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
						) : isFavorite ? (
							<Heart size={16} className="text-red-500 fill-current" />
						) : (
							<Heart size={16} className="text-gray-600" />
						)}
					</button>
					<button
						onClick={handleAddToCart}
						disabled={isAddingToCart || !hasStock}
						className={`bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 disabled:opacity-50 shadow-md ${!hasStock ? "cursor-not-allowed" : ""}`}
						aria-label="Añadir al carrito"
					>
						{isAddingToCart ? (
							<div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
						) : isInCart ? (
							<Check size={16} className="text-green-500" />
						) : !hasStock ? (
							<ShoppingCart size={16} className="text-gray-400" />
						) : (
							<ShoppingCart size={16} className="text-gray-600" />
						)}
					</button>
				</div>
			</div>

			{/* Product Info */}
			<div className="p-3">
				{/* Category */}
				{category && (
					<span className="text-xs text-gray-500 uppercase mb-1 block">
						{category}
					</span>
				)}

				{/* Product Name */}
				<Link to={`/products/${slug || id}`}>
					<h3 className="font-medium text-gray-800 mb-1 line-clamp-1 hover:text-primary-600 transition-colors">
						{name}
					</h3>
				</Link>

				{/* Rating - Solo si hay rating válido */}
				{(rating && typeof rating === 'number' && rating > 0) && (
					<div className="mb-2">
						<RatingStars
							rating={rating}
							size={14}
							showValue={true}
							reviews={reviews}
						/>
					</div>
				)}

				{/* Price */}
				<div className="flex items-center justify-between">
					<div className="flex items-center flex-wrap">
						{(discount && typeof discount === 'number' && discount > 0) ? (
							<>
								<span className="font-bold text-primary-600 text-lg">
									${discountedPrice.toFixed(2)}
								</span>
								<span className="text-sm text-gray-500 line-through ml-2">
									${price.toFixed(2)}
								</span>
							</>
						) : (
							<span className="font-bold text-primary-600 product-price text-lg">
								${price.toFixed(2)}
							</span>
						)}
					</div>

					{/* ✅ BOTÓN SECUNDARIO MEJORADO - Exactamente la misma lógica */}
					<div className="hidden xs:flex sm:hidden md:flex lg:hidden xl:flex gap-2">
						<button
							onClick={handleAddToWishlist}
							disabled={isAddingToWishlist}
							className="text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50 p-1 rounded-full hover:bg-gray-100"
							aria-label="Añadir a favoritos"
						>
							{isAddingToWishlist ? (
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
							) : isFavorite ? (
								<Heart size={18} className="text-red-500 fill-current" />
							) : (
								<Heart size={18} />
							)}
						</button>
						<button
							onClick={handleAddToCart}
							disabled={isAddingToCart || !hasStock}
							className={`text-gray-500 hover:text-primary-600 transition-colors disabled:opacity-50 p-1 rounded-full hover:bg-gray-100 ${!hasStock ? "cursor-not-allowed" : ""}`}
							aria-label="Añadir al carrito"
						>
							{isAddingToCart ? (
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
							) : isInCart ? (
								<Check size={18} className="text-green-500" />
							) : !hasStock ? (
								<ShoppingCart size={18} className="text-gray-400" />
							) : (
								<ShoppingCart size={18} />
							)}
						</button>
					</div>
				</div>

				{/* Stock Availability */}
				<div className="mt-2 flex items-center justify-between">
					{!hasStock && (
						<p className="text-xs text-red-500 font-medium">Agotado</p>
					)}
					{hasStock && stock <= 5 && (
						<p className="text-xs text-amber-600 font-medium">
							Solo quedan {stock}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProductCardCompact;