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
import CacheService from "../../infrastructure/services/CacheService";
import appConfig from "../../config/appConfig";
import environment from "../../config/environment";

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
];

const CATEGORY_OPTIONS_CACHE_KEY = "category_options_transformed";

const ProductPage: React.FC = () => {
	// Estado para UI
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [categoryOptions, setCategoryOptions] = useState<
		Array<{
			id: number;
			title: string;
			iconName: string;
			link: string;
		}>
	>([]);

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
		clearFilters,
	} = useProductFilters(categoriesData);

	const {
		loading: productsLoading,
		error: productsError,
		products: productsData,
		meta: productsMeta,
		fetchProducts,
	} = useProducts();

	const {addToCart} = useCart();
	const {toggleFavorite} = useFavorites();

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
		fetchCategories();
	}, [fetchCategories]);

	// Transformar categorías para el componente CategoriesCarousel
	useEffect(() => {
		if (categoriesData && categoriesData.length > 0) {
			// Intentar obtener categorías transformadas de caché
			const cachedOptions = CacheService.getItem(CATEGORY_OPTIONS_CACHE_KEY);

			if (cachedOptions) {
				setCategoryOptions(cachedOptions);
				return;
			}

			// Si no hay caché, transformar las categorías
			const options = categoriesData.map((category) => {
				// Determinar ícono basado en el nombre de categoría
				const categoryNameLower = category.name.toLowerCase();
				let iconName = "📦"; // Emoji por defecto

				// Asignar emojis según el nombre de la categoría
				if (categoryNameLower.includes("smartphone")) iconName = "📱";
				else if (categoryNameLower.includes("laptop")) iconName = "💻";
				else if (categoryNameLower.includes("monitor")) iconName = "🖥️";
				else if (categoryNameLower.includes("tv")) iconName = "📺";
				else if (
					categoryNameLower.includes("auricular") ||
					categoryNameLower.includes("headphone")
				)
					iconName = "🎧";
				else if (
					categoryNameLower.includes("camara") ||
					categoryNameLower.includes("camera")
				)
					iconName = "📷";
				else if (
					categoryNameLower.includes("reloj") ||
					categoryNameLower.includes("watch")
				)
					iconName = "⌚";
				else if (
					categoryNameLower.includes("altavoz") ||
					categoryNameLower.includes("speaker")
				)
					iconName = "🔊";

				return {
					id: category.id || 0,
					title: category.name,
					iconName: iconName,
					link: `/products?category=${encodeURIComponent(category.name)}`,
				};
			});

			// Ordenar por cantidad de productos (mayor a menor)
			options.sort((a, b) => {
				const categoryA = categoriesData.find((c) => c.id === a.id);
				const categoryB = categoriesData.find((c) => c.id === b.id);

				const countA = categoryA?.product_count || 0;
				const countB = categoryB?.product_count || 0;

				return countB - countA;
			});

			// Guardar en caché
			CacheService.setItem(
				CATEGORY_OPTIONS_CACHE_KEY,
				options,
				appConfig.cache.categoryCacheTime
			);

			setCategoryOptions(options);
		}
	}, [categoriesData]);

	// Cargar productos cuando cambian los filtros o la búsqueda
	useEffect(() => {
		if (categoriesData.length > 0) {
			const params = buildFilterParams();

			if (searchTerm) {
				params.term = searchTerm;
			}

			fetchProducts(params);
		}
	}, [
		fetchProducts,
		buildFilterParams,
		categoriesData.length,
		searchTerm,
		filters,
	]);

	// Manejadores para interacciones de usuario
	const handlePriceRangeChange = useCallback(
		(range: {min: number; max: number} | null) => {
			setPriceRange(range);
		},
		[setPriceRange]
	);

	const handleAddToCart = useCallback(
		async (productId: number) => {
			try {
				await addToCart({
					productId,
					quantity: 1,
				});
			} catch (error) {
				console.error("Error al añadir al carrito:", error);
			}
		},
		[addToCart]
	);

	const handleAddToWishlist = useCallback(
		async (productId: number) => {
			try {
				await toggleFavorite(productId);
			} catch (error) {
				console.error("Error al añadir a favoritos:", error);
			}
		},
		[toggleFavorite]
	);

	const getImageUrl = useCallback((imagePath: string | undefined) => {
		if (!imagePath) return "https://via.placeholder.com/300";

		if (imagePath.startsWith("http")) {
			return imagePath;
		}

		return `${environment.imageBaseUrl}${imagePath}`;
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
		searchTerm !== "";

	// Determinar si está cargando
	const isLoading = productsLoading || categoriesLoading || isSearching;


	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Productos</h1>

			{/* Search Bar Component */}
			<SearchBar
				searchTerm={searchTerm}
				onSearchChange={handleSearchChange}
				onSearch={handleSearchSubmit}
				onClear={clearSearch}
				isLoading={isSearching}
			/>

			{/* Categories Section */}
			<section className="mb-8">
				<h2 className="text-xl font-bold mb-4">Categorías</h2>
				{categoriesLoading ? (
					<div className="flex justify-center py-4">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				) : categoriesError ? (
					<div className="p-4 bg-red-50 text-red-700 rounded-lg">
						Error al cargar categorías. Por favor, intenta nuevamente.
					</div>
				) : categoryOptions.length > 0 ? (
					<CategoriesCarousel categories={categoryOptions} />
				) : (
					<div className="p-4 bg-gray-50 text-gray-500 rounded-lg text-center">
						No hay categorías disponibles
					</div>
				)}
			</section>

			{/* Filter and Sort Section */}
			<div className="flex md:justify-end justify-between mb-6">
				{/* Active Filters Component */}
				<ActiveFilters
					selectedCategories={filters.categories}
					selectedPriceRange={filters.priceRange}
					selectedRating={filters.rating}
					searchTerm={searchTerm}
					showingDiscounted={filters.discount}
					onRemoveCategory={(category) => {
						setCategories(filters.categories.filter((c) => c !== category));
					}}
					onClearPriceRange={() => setPriceRange(null)}
					onClearRating={() => setRating(null)}
					onClearSearch={clearSearch}
					onToggleDiscount={() => setDiscount(!filters.discount)}
					onClearAllFilters={clearFilters}
					onToggleFilters={() => setShowMobileFilters(true)}
				/>

				{/* Sort Dropdown Component */}
				
				<SortDropdown
					options={sortOptions}
					selectedOption={filters.sortBy}
					onSortChange={setSortBy}
				/>
			</div>

			{/* Main Content */}
			<div className="flex flex-col md:flex-row gap-6">
				{/* Filters Sidebar - Desktop */}
				<div className="hidden md:block md:w-72 flex-shrink-0">
					<ProductFilters
						categories={categoriesData.map((cat) => cat.name)}
						priceRange={{min: 0, max: 100}}
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
						onRetry={() =>
							fetchProducts({
								limit: appConfig.pagination.defaultPageSize,
								offset: 0,
							})
						}
						onAddToCart={handleAddToCart}
						onAddToWishlist={handleAddToWishlist}
						getImageUrl={getImageUrl}
						selectedCategories={filters.categories}
						totalItems={productsMeta?.total || 0}
						currentPage={filters.page}
						itemsPerPage={
							productsMeta?.limit || appConfig.pagination.defaultPageSize
						}
						onResetFilters={clearFilters}
					/>

					{/* Paginación */}
					{productsMeta && productsMeta.total > productsMeta.limit && (
						<>
							{/* Paginación para móviles */}
							{isMobile && (
								<MobilePagination
									currentPage={filters.page}
									totalPages={totalPages}
									onPageChange={setPage}
								/>
							)}

							{/* Paginación para desktop */}
							{!isMobile && (
								<Pagination
									currentPage={filters.page}
									totalPages={totalPages}
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
							<div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
								No se encontraron productos con los filtros seleccionados.
								<button
									onClick={clearFilters}
									className="ml-2 underline font-medium hover:text-yellow-900"
								>
									Limpiar filtros
								</button>
							</div>
						)}
				</div>
			</div>
		</div>
	);
};

export default ProductPage;
