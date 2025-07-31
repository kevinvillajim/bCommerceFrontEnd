import React, {useEffect, useState, useCallback, useMemo} from "react";

// Importamos los hooks personalizados a través del archivo index
import {
	useProductFilters,
	useProductSearch,
	useProducts,
	useCategories,
	useCart,
	useFavorites,
} from "../hooks";

// ✅ Hook para actualizaciones optimistas
import {useInvalidateCounters} from "../hooks/useHeaderCounters";
import CacheService from "../../infrastructure/services/CacheService"; // ✅ AÑADIDO

// Componentes mejorados
import SearchBar from "../components/product/SearchBar";
import CategoriesCarousel from "../components/product/CategoriesCarousel";
import ProductFilters from "../components/product/ProductFilters";
import ProductGrid from "../components/product/ProductGrid";
import SortDropdown from "../components/product/SortDropdown";
import MobileFilterPanel from "../components/product/MobileFilterPanel";
import ActiveFilters from "../components/product/ActiveFilters";
import Pagination from "../components/product/Pagination";
import MobilePagination from "../components/product/MobilePagination";

// Utilidades y configuración
import {calculateProductCountByCategory} from "../../utils/categoryUtils";
import appConfig from "../../config/appConfig";

// IMPORTAR LA FUNCIÓN DE IMAGEN CORRECTA (la que funcionaba)
import { getImageUrl} from "../../utils/imageManager";

import type {Category} from "../../core/domain/entities/Category";

// Constantes para filtros
const priceRanges = [
	{id: "0-100", label: "Menos de $100"},
	{id: "100-300", label: "$100 - $300"},
	{id: "300-500", label: "$300 - $500"},
	{id: "500-1000", label: "$500 - $1000"},
	{id: "1000-2000", label: "$1000 - $2000"},
	{id: "2000-999999", label: "Más de $2000"},
];

const sortOptions = [
	{id: "featured", label: "Destacados"},
	{id: "price-asc", label: "Precio: Menor a Mayor"},
	{id: "price-desc", label: "Precio: Mayor a Menor"},
	{id: "name-asc", label: "Nombre: A-Z"},
	{id: "name-desc", label: "Nombre: Z-A"},
	{id: "newest", label: "Más recientes"},
	{id: "rating", label: "Mejor valorados"},
];

const ProductPage: React.FC = () => {
	// Estado para UI
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false); // ✅ AÑADIDO para prevenir dobles clicks

	// Hooks para datos y funcionalidad
	const {
		loading: categoriesLoading,
		error: categoriesError,
		categories: categoriesData,
		fetchCategories,
	} = useCategories();

	const {
		searchTerm,
		isSearching,
		handleSearchChange,
		handleSearchSubmit,
		clearSearch,
		setSearchTermExternal,
	} = useProductSearch();

	const {
		filters,
		buildFilterParams,
		setCategories,
		setPriceRange,
		setRating,
		setDiscount,
		setSortBy,
		setPage,
		setSearchTerm,
		clearFilters,
		toggleCategory,
	} = useProductFilters(categoriesData);

	const {
		loading: productsLoading,
		error: productsError,
		products: productsData,
		meta: productsMeta,
		fetchProducts,
	} = useProducts();

	const {addToCart} = useCart();
	const {toggleFavorite, checkIsFavorite} = useFavorites();
	
	// ✅ Hook para actualizaciones optimistas
	const {
		optimisticCartAdd,
		optimisticFavoriteAdd,
		optimisticFavoriteRemove
	} = useInvalidateCounters();

	// ✅ FUNCIÓN PARA INVALIDAR CACHE DE PÁGINAS ESPECÍFICAS
	const invalidateRelatedPages = useCallback(() => {
		// Invalidar cache de páginas de carrito y favoritos
		CacheService.removeItem("cart_user_data");
		CacheService.removeItem("cart_guest_data");
		CacheService.removeItem("header_counters");
		
		// Invalidar cache de favoritos (todas las páginas)
		for (let page = 1; page <= 10; page++) {
			CacheService.removeItem(`user_favorites_${page}_10`);
		}
		
		console.log("🔄 Cache de páginas relacionadas invalidado desde ProductPage");
	}, []);

	// Sincronizar término de búsqueda entre hooks
	useEffect(() => {
		setSearchTermExternal(filters.searchTerm);
	}, [filters.searchTerm, setSearchTermExternal]);

	// Calcular contador de productos por categoría
	const productCountByCategory = useMemo(() => {
		return calculateProductCountByCategory(categoriesData, productsData);
	}, [categoriesData, productsData]);

	// Detectar si es dispositivo móvil
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		handleResize(); // Check initially
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	// Cargar categorías al iniciar
	useEffect(() => {
		console.log("Cargando categorías...");
		fetchCategories(true, false); // withCounts = true, forceRefresh = false
	}, [fetchCategories]);

	// Cargar productos cuando cambian los filtros
	useEffect(() => {
		if (categoriesData.length > 0) {
			console.log("Categorías cargadas, construyendo parámetros de filtro...");
			const params = buildFilterParams();
			console.log("Cargando productos con parámetros:", params);
			fetchProducts(params);
		}
	}, [
		fetchProducts,
		buildFilterParams,
		categoriesData.length,
		filters, // Dependencia de todo el objeto filters
	]);

	// Manejadores para interacciones de usuario
	const handlePriceRangeChange = useCallback(
		(range: {min: number; max: number} | null) => {
			setPriceRange(range);
		},
		[setPriceRange]
	);

	const handleSearchSubmitInternal = useCallback(
		(searchTerm: string) => {
			console.log("Manejando búsqueda:", searchTerm);
			setSearchTerm(searchTerm);
		},
		[setSearchTerm]
	);

	const handleClearSearch = useCallback(() => {
		console.log("Limpiando búsqueda");
		setSearchTerm("");
	}, [setSearchTerm]);

	const handleCategoryClick = useCallback(
		(category: Category) => {
			console.log("Clic en categoría:", category.name);
			toggleCategory(category.name);
		},
		[toggleCategory]
	);

	const handleAddToCart = useCallback(
		async (productId: number) => {
			console.log("🏪 ProductPage.handleAddToCart INICIADO", {
				productId,
				isUpdating,
				component: "ProductPage"
			});
	
			// ✅ PREVENIR DOBLES CLICKS
			if (isUpdating) {
				console.log("❌ ProductPage: Click ignorado - ya se está procesando");
				return;
			}
	
			try {
				setIsUpdating(true);
				console.log("🔒 ProductPage: Estado isUpdating = true");
	
				// ✅ ACTUALIZACIÓN OPTIMISTA INMEDIATA
				console.log("📈 ProductPage: Aplicando optimisticCartAdd...");
				optimisticCartAdd();
	
				console.log("📞 ProductPage: Llamando addToCart API...");
				await addToCart({
					productId,
					quantity: 1,
				});
	
				// ✅ INVALIDAR CACHE DE PÁGINAS RELACIONADAS
				console.log("🔄 ProductPage: Invalidando cache...");
				invalidateRelatedPages();
	
				console.log(`✅ ProductPage: Producto ${productId} añadido al carrito correctamente`);
			} catch (error) {
				console.error("❌ ProductPage: Error al añadir al carrito:", error);
			} finally {
				// ✅ TIMEOUT PARA PREVENIR SPAM
				console.log("🔚 ProductPage: Limpiando estado isUpdating...");
				setTimeout(() => {
					setIsUpdating(false);
					console.log("✅ ProductPage: Estado limpio");
				}, 1000);
			}
		},
		[addToCart, optimisticCartAdd, invalidateRelatedPages, isUpdating]
	);

	const handleAddToWishlist = useCallback(
		async (productId: number) => {
			const isCurrentlyFavorite = checkIsFavorite(productId);
			
			console.log("💖 ProductPage.handleAddToWishlist INICIADO", {
				productId,
				isCurrentlyFavorite,
				isUpdating,
				component: "ProductPage"
			});
	
			// ✅ PREVENIR DOBLES CLICKS
			if (isUpdating) {
				console.log("❌ ProductPage: Click ignorado - ya se está procesando");
				return;
			}
	
			try {
				setIsUpdating(true);
				console.log("🔒 ProductPage: Estado isUpdating = true");
	
				// ✅ VERIFICAR ESTADO ACTUAL Y ACTUALIZACIÓN OPTIMISTA
				console.log(`📈 ProductPage: Aplicando optimistic${isCurrentlyFavorite ? 'Remove' : 'Add'}...`);
				
				if (isCurrentlyFavorite) {
					optimisticFavoriteRemove();
				} else {
					optimisticFavoriteAdd();
				}
	
				console.log("📞 ProductPage: Llamando toggleFavorite API...");
				await toggleFavorite(productId);
	
				// ✅ INVALIDAR CACHE DE PÁGINAS RELACIONADAS
				console.log("🔄 ProductPage: Invalidando cache...");
				invalidateRelatedPages();
	
				console.log(`✅ ProductPage: Favorito ${productId} gestionado correctamente`);
			} catch (error) {
				console.error("❌ ProductPage: Error al añadir a favoritos:", error);
			} finally {
				// ✅ TIMEOUT PARA PREVENIR SPAM
				console.log("🔚 ProductPage: Limpiando estado isUpdating...");
				setTimeout(() => {
					setIsUpdating(false);
					console.log("✅ ProductPage: Estado limpio");
				}, 1000);
			}
		},
		[toggleFavorite, checkIsFavorite, optimisticFavoriteAdd, optimisticFavoriteRemove, invalidateRelatedPages, isUpdating]
	);

	// FUNCIÓN HELPER PARA OBTENER IMAGEN DEL PRODUCTO
	// Esta función no causa recursión porque usa la importación directa
	const getProductImageUrl = useCallback((imagePath: string | undefined) => {
		return getImageUrl(imagePath);
	}, []);

	// Calcular el número total de páginas
	const totalPages = productsMeta
		? Math.ceil(
				productsMeta.total /
					(productsMeta.limit || appConfig.pagination.defaultPageSize)
			)
		: 0;

	// Determinar si hay filtros activos
	const hasActiveFilters =
		filters.categories.length > 0 ||
		filters.priceRange !== null ||
		filters.rating !== null ||
		filters.discount ||
		filters.sortBy !== "featured" ||
		filters.searchTerm !== "";

	// Determinar si está cargando
	const isLoading = productsLoading || categoriesLoading || isSearching;

	// Preparar categorías para el carrusel
	const categoriesForCarousel = useMemo(() => {
		return categoriesData.filter(cat => cat.is_active).slice(0, 24); // Máximo 24 categorías
	}, [categoriesData]);

	console.log("Estado actual:", {
		categoriesData: categoriesData.length,
		productsData: productsData.length,
		filters,
		isLoading,
		hasActiveFilters,
		isUpdating, // ✅ INCLUIR EN LOGS
	});

	return (
		<div className="container mx-auto px-9 py-8">
			<h1 className="text-3xl font-bold mb-6">Productos</h1>

			{/* Search Bar Component */}
			<SearchBar
				searchTerm={searchTerm}
				onSearchChange={handleSearchChange}
				onSearch={handleSearchSubmit(handleSearchSubmitInternal)}
				onClear={() => clearSearch(handleClearSearch)}
				isLoading={isSearching}
			/>

			{/* Categories Section */}
			<section className="mb-8">
				<h2 className="text-xl font-bold mb-4">Categorías</h2>
				{categoriesLoading ? (
					<div className="flex justify-center py-8">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				) : categoriesError ? (
					<div className="p-4 bg-red-50 text-red-700 rounded-lg">
						<p>Error al cargar categorías: {categoriesError}</p>
						<button
							onClick={() => fetchCategories(true, true)}
							className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
						>
							Reintentar
						</button>
					</div>
				) : categoriesForCarousel.length > 0 ? (
					<CategoriesCarousel 
						categories={categoriesForCarousel} 
						onCategoryClick={handleCategoryClick}
					/>
				) : (
					<div className="p-4 bg-gray-50 text-gray-500 rounded-lg text-center">
						No hay categorías disponibles
					</div>
				)}
			</section>

			{/* Filter and Sort Section */}
			<div className="flex md:justify-end justify-between mb-6 space-x-4">
				{/* Active Filters Component */}
				<ActiveFilters
					selectedCategories={filters.categories}
					selectedPriceRange={filters.priceRange}
					selectedRating={filters.rating}
					searchTerm={filters.searchTerm}
					showingDiscounted={filters.discount}
					onRemoveCategory={(category) => {
						setCategories(filters.categories.filter((c) => c !== category));
					}}
					onClearPriceRange={() => setPriceRange(null)}
					onClearRating={() => setRating(null)}
					onClearSearch={handleClearSearch}
					onToggleDiscount={() => setDiscount(!filters.discount)}
					onClearAllFilters={clearFilters}
					onToggleFilters={() => setShowMobileFilters(true)}
				/>

				{/* Sort Dropdown Component */}
				<div className="">
					<SortDropdown
						options={sortOptions}
						selectedOption={filters.sortBy}
						onSortChange={setSortBy}
					/>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex flex-col md:flex-row gap-6">
				{/* Filters Sidebar - Desktop */}
				<div className="hidden md:block md:w-72 flex-shrink-0">
					<ProductFilters
					categories={categoriesData.map((cat) => cat.name)}
					priceRange={{min: 0, max: 3000}}
					onCategoryChange={setCategories}
						onPriceRangeChange={handlePriceRangeChange}
						onRatingChange={setRating}
						onDiscountChange={(showDiscount) => setDiscount(showDiscount)}
						onClearFilters={clearFilters}
						selectedCategories={filters.categories}
						selectedPriceRange={filters.priceRange}
						selectedRating={filters.rating}
						selectedDiscount={filters.discount}
						productCountByCategory={productCountByCategory}
					/>
				</div>

				{/* Mobile Filters Panel */}
				<MobileFilterPanel
					isOpen={showMobileFilters}
					onClose={() => setShowMobileFilters(false)}
					categories={categoriesData}
					selectedCategories={filters.categories}
					priceRanges={priceRanges}
					selectedRangeId={
						filters.priceRange
							? `${filters.priceRange.min}-${filters.priceRange.max}`
							: null
					}
					selectedRating={filters.rating}
					showingDiscounted={filters.discount}
					onCategoryChange={(category, isSelected) => {
						if (isSelected) {
							setCategories([...filters.categories, category]);
						} else {
							setCategories(filters.categories.filter((c) => c !== category));
						}
					}}
					onPriceRangeChange={(min, max) => {
						handlePriceRangeChange({min, max});
					}}
					onRatingChange={setRating}
					onDiscountToggle={() => setDiscount(!filters.discount)}
					onClearFilters={clearFilters}
					productCountByCategory={productCountByCategory}
				/>

				{/* Products Grid */}
				<div className="flex-1">
					<ProductGrid
						products={productsData}
						categories={categoriesData}
						isLoading={isLoading}
						error={productsError || null}
						onRetry={() => {
							const params = buildFilterParams();
							fetchProducts(params);
						}}
						onAddToCart={handleAddToCart}
						onAddToWishlist={handleAddToWishlist}
						getImageUrl={getProductImageUrl}
						selectedCategories={filters.categories}
						totalItems={productsMeta?.total || 0}
						currentPage={filters.page}
						itemsPerPage={
							productsMeta?.limit || appConfig.pagination.defaultPageSize
						}
						onResetFilters={clearFilters}
					/>

					{/* Paginación */}
					{productsMeta && (
						<>
							{/* Paginación para móviles */}
							{isMobile && (
								<MobilePagination
									currentPage={filters.page}
									totalPages={totalPages || 1}
									onPageChange={setPage}
								/>
							)}

							{/* Paginación para desktop */}
							{!isMobile && (
								<Pagination
									currentPage={filters.page}
									totalPages={totalPages || 1}
									onPageChange={setPage}
								/>
							)}
						</>
					)}

					{/* Mensaje cuando no hay productos con los filtros actuales */}
					{!isLoading &&
						!productsError &&
						productsData.length === 0 &&
						hasActiveFilters && (
							<div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-center">
								<h3 className="text-lg font-medium mb-2">
									No se encontraron productos
								</h3>
								<p className="mb-4">
									No hay productos que coincidan con los filtros seleccionados.
								</p>
								<button
									onClick={clearFilters}
									className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
								>
									Limpiar todos los filtros
								</button>
							</div>
						)}

					{/* Mensaje cuando no hay productos sin filtros */}
					{!isLoading &&
						!productsError &&
						productsData.length === 0 &&
						!hasActiveFilters && (
							<div className="mt-8 p-6 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-center">
								<h3 className="text-lg font-medium mb-2">
									No hay productos disponibles
								</h3>
								<p>
									Actualmente no hay productos en el catálogo. Por favor, inténtalo más tarde.
								</p>
							</div>
						)}
				</div>
			</div>
		</div>
	);
};

export default ProductPage;