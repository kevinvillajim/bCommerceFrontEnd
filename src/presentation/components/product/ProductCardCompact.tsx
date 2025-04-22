import React, {useState} from "react";
import {Heart, ShoppingCart, Check} from "lucide-react";
import {Link} from "react-router-dom";
import RatingStars from "../common/RatingStars";
import {useCart} from "../../hooks/useCart";
import {useFavorites} from "../../hooks/useFavorites";
import {NotificationType} from "../../contexts/CartContext";

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
	// Props opcionales para funciones externas
	onAddToCart?: (id: number) => void;
	onAddToWishlist?: (id: number) => void;
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
	stock = 10, // Valor predeterminado para stock
	slug,
	// Funciones externas opcionales
	onAddToCart,
	onAddToWishlist,
}) => {
	// Estados para controlar las animaciones
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);

	// Hooks para carrito y favoritos
	const {addToCart, showNotification} = useCart();
	const {toggleFavorite} = useFavorites();

	// Calculate discounted price
	const discountedPrice = discount ? price - price * (discount / 100) : price;

	// Verificar si hay stock
	const hasStock = stock > 0;

	// Función para agregar al carrito
	const handleAddToCart = async (e: React.MouseEvent) => {
		e.preventDefault(); // Evitar navegación
		e.stopPropagation(); // Evitar propagación a elementos padres

		if (!hasStock) {
			showNotification(
				NotificationType.ERROR,
				"Lo sentimos, este producto está agotado"
			);
			return;
		}

		setIsAddingToCart(true);

		try {
			// Si hay una función externa, usarla primero
			if (onAddToCart) {
				onAddToCart(id);
			} else {
				// Llamar a la API para agregar al carrito
				const success = await addToCart({
					productId: id,
					quantity: 1,
				});

				if (success) {
					showNotification(
						NotificationType.SUCCESS,
						`${name} ha sido agregado al carrito`
					);
				} else {
					throw new Error("No se pudo agregar el producto al carrito");
				}
			}
		} catch (error) {
			console.error("Error al agregar al carrito:", error);
			showNotification(
				NotificationType.ERROR,
				"Error al agregar producto al carrito. Inténtalo de nuevo."
			);
		} finally {
			// Restaurar el estado después de un breve tiempo para la animación
			setTimeout(() => {
				setIsAddingToCart(false);
			}, 1000);
		}
	};

	// Función para agregar a favoritos
	const handleAddToWishlist = async (e: React.MouseEvent) => {
		e.preventDefault(); // Evitar navegación
		e.stopPropagation(); // Evitar propagación a elementos padres

		setIsAddingToWishlist(true);

		try {
			// Si hay una función externa, usarla primero
			if (onAddToWishlist) {
				onAddToWishlist(id);
				setIsFavorite(!isFavorite);
			} else {
				// Llamar a la API para alternar favorito
				const result = await toggleFavorite(id);

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
			}
		} catch (error) {
			console.error("Error al manejar favorito:", error);
			showNotification(
				NotificationType.ERROR,
				"Error al gestionar favoritos. Inténtalo de nuevo."
			);
		} finally {
			// Restaurar el estado después de un breve tiempo para la animación
			setTimeout(() => {
				setIsAddingToWishlist(false);
			}, 1000);
		}
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

				{/* Discount Tag */}
				{discount && (
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

				{/* Quick Action Buttons */}
				<div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-2 hidden md:flex">
					<button
						onClick={handleAddToWishlist}
						className="cursor-pointer bg-white p-2 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
						aria-label="Añadir a favoritos"
					>
						{isAddingToWishlist || isFavorite ? (
							<Heart size={18} className="text-red-500 fill-current" />
						) : (
							<Heart size={18} />
						)}
					</button>
					<button
						onClick={handleAddToCart}
						disabled={isAddingToCart || !hasStock}
						className={`cursor-pointer bg-white p-2 rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors ${!hasStock ? "opacity-50 cursor-not-allowed" : ""}`}
						aria-label="Añadir al carrito"
					>
						{isAddingToCart ? (
							<Check size={18} className="text-green-500" />
						) : (
							<ShoppingCart size={18} />
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

				{/* Rating */}
				<div className="mb-2">
					<RatingStars
						rating={rating}
						size={14}
						showValue={true}
						reviews={reviews}
					/>
				</div>

				{/* Price */}
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						{discount ? (
							<>
								<span className="font-bold text-primary-600">
									${discountedPrice.toFixed(2)}
								</span>
								<span className="text-sm text-gray-500 line-through ml-2">
									${price.toFixed(2)}
								</span>
							</>
						) : (
							<span className="font-bold text-primary-600 product-price">
								${price.toFixed(2)}
							</span>
						)}
					</div>

					{/* Botones de acción rápida para móvil */}
					<div className="flex lg:hidden gap-1">
						<button
							onClick={handleAddToWishlist}
							className="text-gray-500 hover:text-primary-600 transition-colors"
							aria-label="Añadir a favoritos"
						>
							{isAddingToWishlist || isFavorite ? (
								<Heart size={16} className="text-red-500 fill-current" />
							) : (
								<Heart size={16} />
							)}
						</button>
						<button
							onClick={handleAddToCart}
							disabled={isAddingToCart || !hasStock}
							className={`text-gray-500 hover:text-primary-600 transition-colors ${!hasStock ? "opacity-50 cursor-not-allowed" : ""}`}
							aria-label="Añadir al carrito"
						>
							{isAddingToCart ? (
								<Check size={16} className="text-green-500" />
							) : (
								<ShoppingCart size={16} />
							)}
						</button>
					</div>
				</div>

				{/* Stock Availability */}
				{!hasStock && <p className="text-xs text-red-500 mt-1">Agotado</p>}
			</div>
		</div>
	);
};

export default ProductCardCompact;
