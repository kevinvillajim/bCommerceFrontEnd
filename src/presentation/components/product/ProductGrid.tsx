import React, {memo} from "react";
import ProductCardCompact from "./ProductCardCompact";
import type {Product} from "../../../core/domain/entities/Product";
import type {Category} from "../../../core/domain/entities/Category";
import {adaptProduct} from "../../../utils/productAdapter";
import {getProductMainImage} from "../../../utils/imageManager";

interface ProductGridProps {
	products: Product[];
	categories: Category[];
	isLoading: boolean;
	error: string | null;
	onRetry: () => void;
	onAddToCart: (productId: number) => void;
	onAddToWishlist: (productId: number) => void;
	getImageUrl: (imagePath: string | undefined) => string;
	selectedCategories: string[];
	totalItems: number;
	currentPage: number;
	itemsPerPage: number;
	onResetFilters: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = memo(({
	products,
	categories,
	isLoading,
	error,
	onRetry,
	onAddToCart,
	onAddToWishlist,
	selectedCategories,
	totalItems,
	currentPage,
	itemsPerPage,
	onResetFilters,
}) => {
	// Si está cargando, mostrar spinner
	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-12">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	// Si hay error, mostrar mensaje
	if (error) {
		return (
			<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
				<p className="text-red-700">Error al cargar productos: {error}</p>
				<button
					onClick={onRetry}
					className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
				>
					Reintentar
				</button>
			</div>
		);
	}

	// Si no hay productos, mostrar mensaje
	if (products.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-sm p-8 text-center">
				<h3 className="text-xl font-medium mb-2">
					No se encontraron productos
				</h3>
				<p className="text-gray-600 mb-4">
					No hay productos que coincidan con los filtros actuales.
				</p>
				<button
					onClick={onResetFilters}
					className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
				>
					Limpiar filtros
				</button>
			</div>
		);
	}

	// Calcular el rango de productos mostrados
	const start = (currentPage - 1) * itemsPerPage + 1;
	const end = Math.min(currentPage * itemsPerPage, totalItems);

	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">
				{selectedCategories.length > 0
					? selectedCategories.join(", ")
					: "Todos los productos"}
			</h2>

			{/* Información de resultados */}
			<div className="flex justify-between items-center mb-6">
				<p className="text-gray-600">
					Mostrando {start}-{end} de {totalItems} productos
				</p>
			</div>

			{/* Grid de productos */}
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{products.map((product) => {
					const adaptedProduct = adaptProduct(product);
				
				// Lógica de rating simplificada - el backend ya maneja las prioridades
				const finalRating = product.calculated_rating ?? product.rating ?? adaptedProduct.rating ?? null;
				const finalRatingCount = product.calculated_rating_count ?? product.rating_count ?? product.ratingCount ?? null;
				
				// Solo mostrar rating si es mayor a 0
				const displayRating = (finalRating && finalRating > 0) ? finalRating : null;
				const displayRatingCount = (displayRating && finalRatingCount !== null && finalRatingCount >= 0) ? finalRatingCount : null;
				
				const imageUrl = getProductMainImage(product);

					return (
						<ProductCardCompact
							key={adaptedProduct.id}
							id={adaptedProduct.id || 0}
							name={adaptedProduct.name}
							price={adaptedProduct.price}
							discount={product.discountPercentage}
							rating={displayRating}
							reviews={displayRatingCount}
							image={imageUrl}
							category={
								categories.find((cat) => cat.id === adaptedProduct.categoryId)
									?.name
							}
							isNew={
								new Date(adaptedProduct.createdAt || "").getTime() >
								Date.now() - 30 * 24 * 60 * 60 * 1000
							}
							onAddToCart={onAddToCart}
							onAddToWishlist={onAddToWishlist}
						/>
					);
				})}
			</div>
		</div>
	);
});

export default ProductGrid;
