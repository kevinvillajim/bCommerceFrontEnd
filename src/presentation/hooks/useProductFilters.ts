import {useState, useEffect, useCallback, useRef} from "react";
import {useSearchParams} from "react-router-dom";
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
	searchTerm: string;
}

export const useProductFilters = (
	allCategories: Category[],
	defaultPageSize: number = appConfig.pagination.defaultPageSize
) => {
	const [searchParams, setSearchParams] = useSearchParams();

	// Estado para evitar bucles infinitos
	const isUpdatingUrl = useRef(false);
	const lastProcessedParams = useRef<string>("");

	// Inicializar estado desde URL al momento de crear el estado
	const [filtersState, setFiltersState] = useState<ProductFiltersState>(() => {
		const categoryParam = searchParams.get("category");
		const minPriceParam = searchParams.get("minPrice");
		const maxPriceParam = searchParams.get("maxPrice");
		const ratingParam = searchParams.get("rating");
		const discountParam = searchParams.get("discount");
		const sortParam = searchParams.get("sort");
		const pageParam = searchParams.get("page");
		const searchParam = searchParams.get("search");

		console.log("useProductFilters: Inicializando desde URL:", {
			categoryParam,
			minPriceParam,
			maxPriceParam,
			ratingParam,
			discountParam,
			sortParam,
			pageParam,
			searchParam
		});

		return {
			categories: categoryParam ? categoryParam.split(",").map(c => decodeURIComponent(c)) : [],
			priceRange:
				minPriceParam && maxPriceParam
					? {min: parseInt(minPriceParam), max: parseInt(maxPriceParam)}
					: null,
			rating: ratingParam ? parseInt(ratingParam) : null,
			discount: discountParam === "true",
			sortBy: sortParam || "featured",
			page: pageParam ? parseInt(pageParam) : 1,
			searchTerm: searchParam || "",
		};
	});

	// Este useEffect actualiza la URL cuando cambia el estado
	useEffect(() => {
		// Solo actualizar URL si estamos actualizando desde el estado
		if (!isUpdatingUrl.current) {
			return;
		}

		const newParams = new URLSearchParams();

		// Gestionar categorías
		if (filtersState.categories.length > 0) {
			newParams.set("category", filtersState.categories.map(c => encodeURIComponent(c)).join(","));
		}

		// Gestionar rango de precio
		if (filtersState.priceRange) {
			newParams.set("minPrice", filtersState.priceRange.min.toString());
			newParams.set("maxPrice", filtersState.priceRange.max.toString());
		}

		// Gestionar rating
		if (filtersState.rating) {
			newParams.set("rating", filtersState.rating.toString());
		}

		// Gestionar descuento
		if (filtersState.discount) {
			newParams.set("discount", "true");
		}

		// Gestionar ordenamiento
		if (filtersState.sortBy !== "featured") {
			newParams.set("sort", filtersState.sortBy);
		}

		// Gestionar página
		if (filtersState.page > 1) {
			newParams.set("page", filtersState.page.toString());
		}

		// Gestionar término de búsqueda
		if (filtersState.searchTerm) {
			newParams.set("search", filtersState.searchTerm);
		}

		const newParamsString = newParams.toString();
		console.log("useProductFilters: Actualizando URL:", newParamsString);

		setSearchParams(newParams, {replace: true});
		
		// Resetear el flag después de un pequeño delay
		setTimeout(() => {
			isUpdatingUrl.current = false;
		}, 100);
	}, [filtersState, setSearchParams]);

	// Este useEffect actualiza el estado cuando cambia la URL
	useEffect(() => {
		const currentParams = searchParams.toString();
		
		// Si ya procesamos estos parámetros, no hacer nada
		if (currentParams === lastProcessedParams.current) {
			return;
		}

		lastProcessedParams.current = currentParams;

		console.log("useProductFilters: URL cambió, actualizando estado:", currentParams);

		const categoryParam = searchParams.get("category");
		const minPriceParam = searchParams.get("minPrice");
		const maxPriceParam = searchParams.get("maxPrice");
		const ratingParam = searchParams.get("rating");
		const discountParam = searchParams.get("discount");
		const sortParam = searchParams.get("sort");
		const pageParam = searchParams.get("page");
		const searchParam = searchParams.get("search");

		setFiltersState({
			categories: categoryParam ? categoryParam.split(",").map(c => decodeURIComponent(c)) : [],
			priceRange:
				minPriceParam && maxPriceParam
					? {min: parseInt(minPriceParam), max: parseInt(maxPriceParam)}
					: null,
			rating: ratingParam ? parseInt(ratingParam) : null,
			discount: discountParam === "true",
			sortBy: sortParam || "featured",
			page: pageParam ? parseInt(pageParam) : 1,
			searchTerm: searchParam || "",
		});
	}, [searchParams]);

	// Función helper para actualizar estado y URL
	const updateFiltersAndUrl = useCallback((updates: Partial<ProductFiltersState>) => {
		isUpdatingUrl.current = true;
		setFiltersState((prev) => ({
			...prev,
			...updates,
			page: updates.page !== undefined ? updates.page : 1, // Resetear página excepto si se especifica
		}));
	}, []);

	// Funciones para actualizar filtros
	const setCategories = useCallback((categories: string[]) => {
		console.log("useProductFilters: Actualizando categorías:", categories);
		updateFiltersAndUrl({ categories });
	}, [updateFiltersAndUrl]);

	const setPriceRange = useCallback(
		(priceRange: {min: number; max: number} | null) => {
			console.log("useProductFilters: Actualizando rango de precio:", priceRange);
			updateFiltersAndUrl({ priceRange });
		},
		[updateFiltersAndUrl]
	);

	const setRating = useCallback((rating: number | null) => {
		console.log("useProductFilters: Actualizando rating:", rating);
		updateFiltersAndUrl({ rating });
	}, [updateFiltersAndUrl]);

	const setDiscount = useCallback((discount: boolean) => {
		console.log("useProductFilters: Actualizando descuento:", discount);
		updateFiltersAndUrl({ discount });
	}, [updateFiltersAndUrl]);

	const setSortBy = useCallback((sortBy: string) => {
		console.log("useProductFilters: Actualizando ordenamiento:", sortBy);
		updateFiltersAndUrl({ sortBy });
	}, [updateFiltersAndUrl]);

	const setPage = useCallback((page: number) => {
		console.log("useProductFilters: Actualizando página:", page);
		updateFiltersAndUrl({ page });
	}, [updateFiltersAndUrl]);

	const setSearchTerm = useCallback((searchTerm: string) => {
		console.log("useProductFilters: Actualizando término de búsqueda:", searchTerm);
		updateFiltersAndUrl({ searchTerm });
	}, [updateFiltersAndUrl]);

	const clearFilters = useCallback(() => {
		console.log("useProductFilters: Limpiando todos los filtros");
		updateFiltersAndUrl({
			categories: [],
			priceRange: null,
			rating: null,
			discount: false,
			sortBy: "featured",
			page: 1,
			searchTerm: "",
		});
	}, [updateFiltersAndUrl]);

	// Función para alternar una categoría
	const toggleCategory = useCallback((category: string) => {
		console.log("useProductFilters: Alternando categoría:", category);
		setFiltersState((prev) => {
			const isSelected = prev.categories.includes(category);
			const newCategories = isSelected
				? prev.categories.filter((c) => c !== category)
				: [...prev.categories, category];

			// Actualizar estado y URL
			isUpdatingUrl.current = true;
			return {
				...prev,
				categories: newCategories,
				page: 1,
			};
		});
	}, []);

	// Construir los parámetros para la API - FUNCIÓN CORREGIDA
	const buildFilterParams = useCallback((): ExtendedProductFilterParams => {
		console.log("useProductFilters: Construyendo parámetros desde estado:", filtersState);

		const params: ExtendedProductFilterParams = {
			limit: defaultPageSize,
			offset: (filtersState.page - 1) * defaultPageSize,
			published: true,
			status: 'active',
		};

		// Manejar término de búsqueda
		if (filtersState.searchTerm) {
			params.term = filtersState.searchTerm;
		}

		// Manejar selección múltiple de categorías - CORREGIDO
		if (filtersState.categories.length > 0) {
			// Encontrar IDs de categorías por nombre
			const categoryIds: number[] = [];
			
			filtersState.categories.forEach((catName) => {
				const category = allCategories.find(
					(c) => c.name.toLowerCase().trim() === catName.toLowerCase().trim()
				);
				if (category?.id) {
					categoryIds.push(category.id);
				} else {
					console.warn(`useProductFilters: No se encontró categoría: "${catName}"`);
					console.log("useProductFilters: Categorías disponibles:", allCategories.map(c => c.name));
				}
			});

			console.log("useProductFilters: IDs de categorías encontrados:", categoryIds, "para nombres:", filtersState.categories);

			if (categoryIds.length > 0) {
				params.categoryIds = categoryIds;
				params.categoryOperator = "or"; // OR para mostrar productos de cualquiera de las categorías
			}
		}

		// Añadir rango de precio si está seleccionado
		if (filtersState.priceRange) {
			params.minPrice = filtersState.priceRange.min;
			params.maxPrice = filtersState.priceRange.max;
		}

		// Añadir filtro de rating
		if (filtersState.rating) {
			params.rating = filtersState.rating;
		}

		// Añadir filtro de descuento
		if (filtersState.discount) {
			params.minDiscount = 5; // Productos con al menos 5% de descuento
		}

		// Añadir ordenamiento - CORREGIDO
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
			case "rating":
				params.sortBy = "rating";
				params.sortDir = "desc";
				break;
			case "featured":
			default:
				params.sortBy = "featured";
				params.sortDir = "desc";
				break;
		}
		
		// ✅ NUEVA FUNCIONALIDAD: Habilitar cálculo de ratings desde tabla ratings
		// Esto es opcional y solo se activa para mejorar la experiencia de productos sin rating calculado
		params.calculateRatingsFromTable = true;

		console.log("useProductFilters: Parámetros finales para API:", params);
		return params;
	}, [filtersState, allCategories, defaultPageSize]);

	return {
		filters: filtersState,
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
	};
};

export default useProductFilters;