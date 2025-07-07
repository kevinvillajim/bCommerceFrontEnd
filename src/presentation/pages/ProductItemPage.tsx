import React, {useState, useEffect} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {
	ShoppingCart,
	Heart,
	Share2,
	Star,
	Truck,
	Shield,
	RotateCcw,
	Minus,
	Plus,
	Loader,
	MessageSquare,
} from "lucide-react";
import {ProductService} from "../../core/services/ProductService";
import type {
	ProductDetail,
	ProductImage,
} from "../../core/domain/entities/Product";
import {getImageUrl} from "../../utils/imageManager";
import {useCart} from "../hooks/useCart";
import {useFavorites} from "../hooks/useFavorites";
import {useChat} from "../hooks/useChat";
import {NotificationType} from "../contexts/CartContext";
import ApiClient from "../../infrastructure/api/apiClient";

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
	const [product, setProduct] = useState<ProductDetail | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [activeImage, setActiveImage] = useState(0);
	const [activeTab, setActiveTab] = useState<
		"description" | "specifications" | "reviews"
	>("description");
	const {addToCart, showNotification} = useCart();
	const {toggleFavorite} = useFavorites();
	const {createChat} = useChat();

	// Initialize service
	const productService = new ProductService();

	useEffect(() => {
		const fetchProductData = async () => {
			if (!id) return;

			try {
				setLoading(true);
				setError(null);

				// Call the service to get product details
				const productId = parseInt(id);
				const productData = await productService.getProductById(productId);

				console.log("Product data from API:", productData);

				// Set the product state with the fetched data
				setProduct(productData);

				// Track product view
				productService
					.trackProductView(productId)
					.catch((e) => console.error("Error tracking product view:", e));
			} catch (err) {
				console.error("Error fetching product:", err);
				setError(
					"No se pudo cargar el producto. Por favor, intente nuevamente."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchProductData();
	}, [id]);

	// Funciones de utilidad
	const handleQuantityChange = (newQuantity: number) => {
		if (newQuantity >= 1 && newQuantity <= 10) {
			setQuantity(newQuantity);
		}
	};

	const handleAddToCart = async () => {
		// ✅ VERIFICACIÓN DE NULL AGREGADA
		if (!product) {
			showNotification(
				NotificationType.ERROR,
				"Error: No se pudo cargar la información del producto"
			);
			return;
		}

		console.log(`Añadido al carrito: ${quantity} unidades de ${product.name}`);

		if (!product.is_in_stock) {
			showNotification(
				NotificationType.ERROR,
				"Lo sentimos, este producto está agotado"
			);
			return;
		}

		try {
			const success = await addToCart({
				productId: Number(id),
				quantity: quantity,
			});

			if (success) {
				showNotification(
					NotificationType.SUCCESS,
					`${product.name} ha sido agregado al carrito`
				);
			} else {
				throw new Error("No se pudo agregar el producto al carrito");
			}
		} catch (error) {
			console.error("Error al agregar al carrito:", error);
			showNotification(
				NotificationType.ERROR,
				"Error al agregar producto al carrito. Inténtalo de nuevo."
			);
		}
	};

	const handleAddToWishlist = async () => {
		// ✅ VERIFICACIÓN DE NULL AGREGADA
		if (!product) {
			showNotification(
				NotificationType.ERROR,
				"Error: No se pudo cargar la información del producto"
			);
			return;
		}

		console.log(`Añadido a favoritos: ${product.name}`);

		try {
			const result = await toggleFavorite(Number(id));

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
		} catch (error) {
			console.error("Error al manejar favorito:", error);
			showNotification(
				NotificationType.ERROR,
				"Error al gestionar favoritos. Inténtalo de nuevo."
			);
		}
	};

	const handleChatWithSeller = async () => {
		// Verificación de null
		if (!product) {
			showNotification(
				NotificationType.ERROR,
				"Error: No se pudo cargar la información del producto"
			);
			return;
		}

		try {
			let sellerId;

			// Caso 1: El producto ya tiene seller_id directamente
			if (product.seller_id) {
				sellerId = product.seller_id;
				console.log(`Usando seller_id directo del producto: ${sellerId}`);
			}
			// Caso 2: El producto tiene objeto seller con id
			else if (product.seller?.id) {
				sellerId = product.seller.id;
				console.log(`Usando seller.id del producto: ${sellerId}`);
			}
			// Caso 3: Necesitamos convertir user_id a seller_id
			else if (product.user_id) {
				console.log(
					`Intentando obtener seller_id a partir de user_id: ${product.user_id}`
				);

				try {
					// ✅ CORRECCIÓN - Tipar la respuesta de la API
					const response = await ApiClient.get<SellerApiResponse>(
						`/sellers/by-user/${product.user_id}`
					);

					// ✅ ACCESO SEGURO A LAS PROPIEDADES
					if (response && response.data) {
						if (response.data.id) {
							sellerId = response.data.id;
							console.log(
								`Convertido user_id ${product.user_id} a seller_id ${sellerId}`
							);
						} else if (response.data.seller_id) {
							sellerId = response.data.seller_id;
							console.log(
								`Convertido user_id ${product.user_id} a seller_id ${sellerId}`
							);
						} else {
							// Si no podemos obtener el seller_id, usamos el user_id como fallback
							console.warn(
								`No se pudo obtener seller_id, usando user_id como fallback`
							);
							sellerId = product.user_id;
						}
					} else {
						// Respuesta vacía o sin data
						console.warn(
							`Respuesta de API vacía o sin data, usando user_id como fallback`
						);
						sellerId = product.user_id;
					}
				} catch (error) {
					console.error("Error al obtener seller_id:", error);
					// Como fallback, usamos el user_id directamente
					sellerId = product.user_id;
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
				`Iniciando chat con vendedor ID ${sellerId} para producto ${product.id}`
			);

			const chatId = await createChat(sellerId, Number(id));
			if (chatId) {
				// Redirigir a la página de chat
				navigate(`/chats/${chatId}`);
			} else {
				throw new Error("No se pudo crear el chat con el vendedor");
			}
		} catch (error) {
			console.error("Error al iniciar chat con vendedor:", error);
			showNotification(
				NotificationType.ERROR,
				"Error al iniciar chat con vendedor. Inténtalo de nuevo."
			);
		}
	};

	// Renderizar estrellas de valoración
	const renderRatingStars = (rating: number) => {
		return (
			<div className="flex items-center">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						size={18}
						className={`${
							star <= Math.floor(rating)
								? "text-yellow-400 fill-current"
								: star <= rating
									? "text-yellow-400 fill-current opacity-60"
									: "text-gray-300"
						}`}
					/>
				))}
			</div>
		);
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

	// Show error state
	if (error || !product) {
		return (
			<div className="container mx-auto py-20">
				<div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md">
					<h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
					<p className="text-gray-700 mb-6">
						{error || "No se encontró el producto solicitado."}
					</p>
					<button
						onClick={() => navigate(-1)}
						className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
					>
						Volver
					</button>
				</div>
			</div>
		);
	}

	// Process product data for display
	const categories = product.category ? [product.category.name] : [];

	// ✅ CORREGIDO - Función helper para obtener URL de imagen
	const getImageUrlFromProduct = (image: string | ProductImage): string => {
		if (typeof image === "string") {
			return getImageUrl(image);
		}
		return getImageUrl(image.original || image.medium || image.thumbnail);
	};

	// ✅ CORREGIDO - Eliminar variable no utilizada mainImage
	// const mainImage = product.images && product.images.length > 0
	// 	? getImageUrlFromProduct(product.images[0])
	// 	: getImageUrl(null);

	// Parse colors, sizes, and tags
	const parseStringArrays = (value: any): string[] => {
		if (!value) return [];
		if (Array.isArray(value)) {
			// If already an array of strings, return as is
			if (typeof value[0] === "string" && !value[0].startsWith("[")) {
				return value;
			}
			// If it's an array of JSON strings, parse them
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

	const colors = parseStringArrays(product.colors);
	const sizes = parseStringArrays(product.sizes);
	const tags = parseStringArrays(product.tags);

	// Create specification items from product data
	const specifications = [
		{name: "SKU", value: product.sku || "N/A"},
		{name: "Peso", value: product.weight ? `${product.weight} kg` : "N/A"},
		{
			name: "Dimensiones",
			value:
				product.dimensions || (product.width && product.height && product.depth)
					? `${product.width} × ${product.height} × ${product.depth} cm`
					: "N/A",
		},
		{
			name: "Disponibilidad",
			value: product.is_in_stock ? "En stock" : "Agotado",
		},
		{name: "Categoría", value: product.category?.name || "N/A"},
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
					{product.category && (
						<>
							<Link
								to={`/category/${product.category.slug}`}
								className="hover:text-primary-600"
							>
								{product.category.name}
							</Link>
							<span className="mx-2">/</span>
						</>
					)}
					<span className="text-gray-700 font-medium">{product.name}</span>
				</nav>

				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 lg:p-10">
						{/* Product Images */}
						<div className="space-y-6">
							<div className="bg-gray-50 rounded-xl overflow-hidden h-96 lg:h-[500px]">
								{product.images && product.images.length > 0 && (
									<img
										src={getImageUrlFromProduct(product.images[activeImage])}
										alt={product.name}
										className="w-full h-full object-cover transition-all duration-300"
									/>
								)}
							</div>
							{product.images && product.images.length > 1 && (
								<div className="grid grid-cols-4 gap-3">
									{product.images.map((image, index) => (
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
												alt={`${product.name} thumbnail ${index + 1}`}
												className="w-full h-full object-cover"
											/>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Product Info */}
						<div className="space-y-6">
							{/* Product Header */}
							<div>
								{product.seller && (
									<div className="flex items-center mb-2">
										<span className="text-sm bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-medium">
											{product.seller.name || "Vendedor"}
										</span>
									</div>
								)}

								{product.discount_percentage &&
									product.discount_percentage > 0 && (
										<span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-sm font-medium">
											{product.discount_percentage}% DESCUENTO
										</span>
									)}

								<h1 className="text-3xl font-bold text-gray-900 mb-3">
									{product.name}
								</h1>

								<div className="flex items-center gap-3 mb-4">
									<div className="flex items-center">
										{renderRatingStars(product.rating || 0)}
										<span className="text-yellow-500 ml-1 font-medium">
											{(product.rating || 0).toFixed(1)}
										</span>
									</div>
									<div className="text-gray-500 text-sm">
										<span className="font-medium">
											{product.rating_count || 0}
										</span>{" "}
										valoraciones
									</div>
									<div className="text-gray-400">|</div>
									<div className="text-sm text-gray-500">
										SKU:{" "}
										<span className="text-gray-700">
											{product.sku || "N/A"}
										</span>
									</div>
								</div>

								{/* Price */}
								<div className="flex items-center mb-2">
									<span className="text-3xl font-bold text-primary-700">
										$
										{product.final_price
											? product.final_price.toFixed(2)
											: product.price.toFixed(2)}
									</span>
									{product.discount_percentage &&
										product.discount_percentage > 0 && (
											<span className="ml-3 text-lg text-gray-500 line-through">
												${product.price.toFixed(2)}
											</span>
										)}
								</div>
								{product.discount_percentage &&
									product.discount_percentage > 0 && (
										<p className="text-sm text-green-600 font-medium mb-4">
											¡Ahorra $
											{(product.price - (product.final_price || 0)).toFixed(2)}!
											Oferta por tiempo limitado.
										</p>
									)}
							</div>

							{/* Color Selection */}
							{colors.length > 0 && (
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
							)}

							{/* Size Selection */}
							{sizes.length > 0 && (
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
							)}

							{/* Quantity and Add to Cart */}
							<div className="flex flex-col sm:flex-row gap-4">
								<div className="flex border border-gray-300 rounded-lg overflow-hidden h-12">
									<button
										className="px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
										onClick={() => handleQuantityChange(quantity - 1)}
										disabled={quantity <= 1}
									>
										<Minus size={18} />
									</button>
									<input
										type="number"
										className="w-16 text-center border-x border-gray-300 text-gray-700 font-medium"
										min="1"
										max="10"
										value={quantity}
										onChange={(e) =>
											handleQuantityChange(parseInt(e.target.value) || 1)
										}
									/>
									<button
										className="px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
										onClick={() => handleQuantityChange(quantity + 1)}
										disabled={quantity >= 10}
									>
										<Plus size={18} />
									</button>
								</div>
								<button
									className="flex-grow h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
									onClick={handleAddToCart}
									disabled={!product.is_in_stock}
								>
									<ShoppingCart size={20} className="mr-2" />
									{product.is_in_stock
										? "Añadir al Carrito"
										: "Producto Agotado"}
								</button>
								<button
									className="h-12 w-12 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-600 transition-colors duration-200"
									onClick={handleAddToWishlist}
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
											{product.is_in_stock ? (
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
							{(categories.length > 0 || tags.length > 0) && (
								<div className="pt-4 border-t border-gray-200">
									{categories.length > 0 && (
										<div className="flex items-center mb-2">
											<span className="text-gray-600 mr-2">Categorías:</span>
											<div className="flex flex-wrap gap-2">
												{categories.map((category, index) => (
													<Link
														key={index}
														to={`/category/${product.category?.slug || ""}`}
														className="bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm rounded-full text-gray-700 transition-colors"
													>
														{category}
													</Link>
												))}
											</div>
										</div>
									)}

									{tags.length > 0 && (
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
									)}
								</div>
							)}

							{/* Share */}
							<div className="flex items-center text-gray-500 text-sm">
								<Share2 size={16} className="mr-2" />
								<span>Compartir este producto</span>
							</div>
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

						<div className="p-6 lg:p-10">
							{activeTab === "description" && (
								<div className="max-w-3xl space-y-6">
									{product.short_description && (
										<p className="font-medium text-lg text-gray-800">
											{product.short_description}
										</p>
									)}
									<p className="text-gray-700 leading-relaxed">
										{product.description}
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
								<div className="max-w-3xl">
									<div className="flex items-center mb-6">
										<div className="mr-4">
											<div className="text-5xl font-bold text-gray-900">
												{(product.rating || 0).toFixed(1)}
											</div>
											<div className="flex mt-2">
												{renderRatingStars(product.rating || 0)}
											</div>
											<div className="text-sm text-gray-500 mt-1">
												{product.rating_count || 0} valoraciones
											</div>
										</div>

										<div className="flex-grow">
											{/* Rating bars would go here */}
											<p className="text-center text-gray-500">
												No hay valoraciones disponibles
											</p>
										</div>

										<div className="ml-6">
											<button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg">
												Escribir valoración
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Related Products */}
				{product.related_products && product.related_products.length > 0 && (
					<div className="mt-16">
						<h2 className="text-2xl font-bold mb-8">Productos relacionados</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{product.related_products.map((relatedProduct) => (
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
										<div className="flex items-center mb-2">
											{renderRatingStars(relatedProduct.rating || 0)}
											<span className="text-xs text-gray-500 ml-1">
												({relatedProduct.rating || 0})
											</span>
										</div>
										<Link to={`/product/${relatedProduct.id}`}>
											<h3 className="font-medium text-gray-800 mb-2 hover:text-primary-600 transition-colors line-clamp-2 h-12">
												{relatedProduct.name}
											</h3>
										</Link>
										<p className="text-primary-600 font-bold">
											$
											{relatedProduct.final_price
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
				)}
			</div>
		</div>
	);
};

export default ProductItemPage;
