import {useState, useEffect, useCallback, useRef} from "react";
import {useSearchParams, useLocation} from "react-router-dom";
import type {ExtendedProductFilterParams} from "../types/ProductFilterParams";
import type {Category} from "../../core/domain/entities/Category";
import appConfig from "../../config/appConfig";

interface ProductFiltersState {
	categories: string[];
	priceRange: {min: number; max: number} | null;
	rating: number | null;
	discount: boolean;
	sortBy: string;
	page: number;
}

/**
 * Hook para manejar filtros de productos y sincronizarlos con la URL
 * Versión corregida para evitar bucles infinitos
 */
export const useProductFilters = (
	allCategories: Category[],
	defaultPageSize: number = appConfig.pagination.defaultPageSize
) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();

	// Estado para filtros
	const [filtersState, setFiltersState] = useState<ProductFiltersState>({
		categories: [],
		priceRange: null,
		rating: null,
		discount: false,
		sortBy: "featured",
		page: 1,
	});

	// Referencias para control de flujo y prevención de bucles
	const isInitialized = useRef(false);
	const isUpdatingFromState = useRef(false);
	const lastLocationKey = useRef(location.key);
	const currentLocationKey = location.key;

	// Inicializar filtros desde URL solo cuando la URL cambia externamente
	useEffect(() => {
		// Si estamos actualizando la URL desde el estado, ignorar este efecto
		if (isUpdatingFromState.current) {
			isUpdatingFromState.current = false;
			return;
		}

		// Detectar si es un cambio externo de URL (navegación del usuario)
		const isExternalNavigation = lastLocationKey.current !== currentLocationKey;

		// Sólo procesar si es navegación externa o primera carga
		if (isExternalNavigation || !isInitialized.current) {
			const categoryParam = searchParams.get("category");
			const minPriceParam = searchParams.get("minPrice");
			const maxPriceParam = searchParams.get("maxPrice");
			const ratingParam = searchParams.get("rating");
			const discountParam = searchParams.get("discount");
			const sortParam = searchParams.get("sort");
			const pageParam = searchParams.get("page");

			const newFilters: ProductFiltersState = {
				categories: categoryParam ? categoryParam.split(",") : [],
				priceRange:
					minPriceParam && maxPriceParam
						? {min: parseInt(minPriceParam), max: parseInt(maxPriceParam)}
						: null,
				rating: ratingParam ? parseInt(ratingParam) : null,
				discount: discountParam === "true",
				sortBy: sortParam || "featured",
				page: pageParam ? parseInt(pageParam) : 1,
			};

			setFiltersState(newFilters);
			lastLocationKey.current = currentLocationKey;
			isInitialized.current = true;
		}
	}, [searchParams, location.key, currentLocationKey]);

	// Actualizar URL cuando cambian los filtros (estado -> URL)
	const syncFiltersToURL = useCallback(
		(filters: ProductFiltersState) => {
			// Marcar que vamos a actualizar la URL desde el estado para evitar bucles
			isUpdatingFromState.current = true;

			const newParams = new URLSearchParams();

			// Añadir parámetros solo si tienen valores no predeterminados
			if (filters.categories.length > 0) {
				newParams.set("category", filters.categories.join(","));
			}

			if (filters.priceRange) {
				newParams.set("minPrice", filters.priceRange.min.toString());
				newParams.set("maxPrice", filters.priceRange.max.toString());
			}

			if (filters.rating) {
				newParams.set("rating", filters.rating.toString());
			}

			if (filters.discount) {
				newParams.set("discount", "true");
			}

			if (filters.sortBy !== "featured") {
				newParams.set("sort", filters.sortBy);
			}

			if (filters.page > 1) {
				newParams.set("page", filters.page.toString());
			}

			// Mantener parámetros de búsqueda si existen
			const searchTerm = searchParams.get("search");
			if (searchTerm) {
				newParams.set("search", searchTerm);
			}

			// Evitar actualizaciones redundantes comparando strings
			const newParamsString = newParams.toString();
			const currentParamsString = searchParams.toString();

			if (newParamsString !== currentParamsString) {
				setSearchParams(newParams, {replace: true});
			} else {
				// Si son iguales, resetear el flag ya que no hubo actualización real
				isUpdatingFromState.current = false;
			}
		},
		[searchParams, setSearchParams]
	);

	// Efecto para sincronizar cambios de estado a URL
	useEffect(() => {
		// Evitar sincronización durante la inicialización
		if (!isInitialized.current) return;

		// Sincronizar estado -> URL
		syncFiltersToURL(filtersState);
	}, [filtersState, syncFiltersToURL]);

	// Construir parámetros para la API de productos
	const buildFilterParams = useCallback((): ExtendedProductFilterParams => {
		const params: ExtendedProductFilterParams = {
			limit: defaultPageSize,
			offset: (filtersState.page - 1) * defaultPageSize,
		};

		// Manejar selección múltiple de categorías
		if (filtersState.categories.length > 0) {
			const categoryIds = filtersState.categories
				.map((catName) => {
					const category = allCategories.find(
						(c) => c.name.toLowerCase() === catName.toLowerCase()
					);
					return category?.id;
				})
				.filter((id) => id !== undefined) as number[];

			if (categoryIds.length > 0) {
				params.categoryIds = categoryIds;
				params.categoryOperator = "or"; // Para unión de categorías
			}
		}

		// Añadir rango de precio si está seleccionado
		if (filtersState.priceRange) {
			params.minPrice = filtersState.priceRange.min;

			// Solo añadir maxPrice si no es el valor máximo
			if (filtersState.priceRange.max < 999999) {
				params.maxPrice = filtersState.priceRange.max;
			}
		}

		// Añadir filtro de rating
		if (filtersState.rating) {
			params.rating = filtersState.rating;
		}

		// Añadir filtro de descuento
		if (filtersState.discount) {
			params.minDiscount = 5; // Productos con al menos 5% de descuento
		}

		// Añadir ordenamiento
		switch (filtersState.sortBy) {
			case "price-asc":
				params.sortBy = "price";
				params.sortDir = "asc";
				break;
			case "price-desc":
				params.sortBy = "price";
				params.sortDir = "desc";
				break;
			case "name-asc":
				params.sortBy = "name";
				params.sortDir = "asc";
				break;
			case "name-desc":
				params.sortBy = "name";
				params.sortDir = "desc";
				break;
			case "newest":
				params.sortBy = "created_at";
				params.sortDir = "desc";
				break;
			case "featured":
			default:
				params.sortBy = "featured";
				params.sortDir = "desc";
				break;
		}

		// Añadir término de búsqueda si existe en la URL
		const searchTerm = searchParams.get("search");
		if (searchTerm) {
			params.term = searchTerm;
		}

		return params;
	}, [filtersState, allCategories, defaultPageSize, searchParams]);

	// Manejadores para actualizar filtros
	const setCategories = useCallback((categories: string[]) => {
		setFiltersState((prev) => ({
			...prev,
			categories,
			page: 1, // Resetear página al cambiar filtros
		}));
	}, []);

	const setPriceRange = useCallback(
		(priceRange: {min: number; max: number} | null) => {
			setFiltersState((prev) => ({
				...prev,
				priceRange,
				page: 1,
			}));
		},
		[]
	);

	const setRating = useCallback((rating: number | null) => {
		setFiltersState((prev) => ({
			...prev,
			rating,
			page: 1,
		}));
	}, []);

	const setDiscount = useCallback((discount: boolean) => {
		setFiltersState((prev) => ({
			...prev,
			discount,
			page: 1,
		}));
	}, []);

	const setSortBy = useCallback((sortBy: string) => {
		setFiltersState((prev) => ({
			...prev,
			sortBy,
			page: 1,
		}));
	}, []);

	const setPage = useCallback((page: number) => {
		setFiltersState((prev) => ({
			...prev,
			page,
		}));
	}, []);

	const clearFilters = useCallback(() => {
		// Crear objeto de filtros limpio
		const emptyFilters = {
			categories: [],
			priceRange: null,
			rating: null,
			discount: false,
			sortBy: "featured",
			page: 1,
		};

		// Actualizar estado
		setFiltersState(emptyFilters);

		// Marcar que estamos actualizando desde el estado
		isUpdatingFromState.current = true;

		// Conservar solo el parámetro de búsqueda si existe
		const newParams = new URLSearchParams();
		const searchTerm = searchParams.get("search");
		if (searchTerm) {
			newParams.set("search", searchTerm);
		}

		// Actualizar URL
		setSearchParams(newParams, {replace: true});
	}, [searchParams, setSearchParams]);

	// Utilidad para alternar una categoría (añadir/quitar)
	const toggleCategory = useCallback((category: string) => {
		setFiltersState((prev) => {
			const isSelected = prev.categories.includes(category);
			const newCategories = isSelected
				? prev.categories.filter((c) => c !== category)
				: [...prev.categories, category];

			return {
				...prev,
				categories: newCategories,
				page: 1,
			};
		});
	}, []);

	// Función para manejar cambios de categoría directamente (compatible con el componente CategoryFilterSection)
	const handleCategoryChange = useCallback(
		(category: string, isSelected: boolean) => {
			setFiltersState((prev) => {
				let newCategories;

				if (isSelected) {
					// Añadir categoría si no existe ya
					newCategories = prev.categories.includes(category)
						? prev.categories
						: [...prev.categories, category];
				} else {
					// Quitar categoría
					newCategories = prev.categories.filter((c) => c !== category);
				}

				return {
					...prev,
					categories: newCategories,
					page: 1,
				};
			});
		},
		[]
	);

	return {
		filters: filtersState,
		buildFilterParams,
		setCategories,
		setPriceRange,
		setRating,
		setDiscount,
		setSortBy,
		setPage,
		clearFilters,
		toggleCategory,
		handleCategoryChange, // Nueva función para compatibilidad con CategoryFilterSection
	};
};

export default useProductFilters;
