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
}

export const useProductFilters = (
	allCategories: Category[],
	defaultPageSize: number = appConfig.pagination.defaultPageSize
) => {
	const [searchParams, setSearchParams] = useSearchParams();

	// Inicializar estado desde URL al momento de crear el estado
	const [filtersState, setFiltersState] = useState<ProductFiltersState>(() => {
		const categoryParam = searchParams.get("category");
		const minPriceParam = searchParams.get("minPrice");
		const maxPriceParam = searchParams.get("maxPrice");
		const ratingParam = searchParams.get("rating");
		const discountParam = searchParams.get("discount");
		const sortParam = searchParams.get("sort");
		const pageParam = searchParams.get("page");

		return {
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
	});

	// Referencia para rastrear la última actualización de URL y prevenir bucles
	const lastUrlUpdate = useRef<string>("");
	// Referencia para rastrear si una actualización viene desde el estado
	const isUpdatingFromState = useRef<boolean>(false);

	// Este useEffect actualiza la URL cuando cambia el estado
	useEffect(() => {
		// Si estamos actualizando desde la URL, no volver a actualizar la URL
		if (!isUpdatingFromState.current) return;

		const newParams = new URLSearchParams(searchParams);

		// Gestionar categorías
		if (filtersState.categories.length > 0) {
			newParams.set("category", filtersState.categories.join(","));
		} else {
			newParams.delete("category");
		}

		// Gestionar rango de precio
		if (filtersState.priceRange) {
			newParams.set("minPrice", filtersState.priceRange.min.toString());
			newParams.set("maxPrice", filtersState.priceRange.max.toString());
		} else {
			newParams.delete("minPrice");
			newParams.delete("maxPrice");
		}

		// Gestionar rating
		if (filtersState.rating) {
			newParams.set("rating", filtersState.rating.toString());
		} else {
			newParams.delete("rating");
		}

		// Gestionar descuento
		if (filtersState.discount) {
			newParams.set("discount", "true");
		} else {
			newParams.delete("discount");
		}

		// Gestionar ordenamiento
		if (filtersState.sortBy !== "featured") {
			newParams.set("sort", filtersState.sortBy);
		} else {
			newParams.delete("sort");
		}

		// Gestionar página
		if (filtersState.page > 1) {
			newParams.set("page", filtersState.page.toString());
		} else {
			newParams.delete("page");
		}

		// Convertir a string para comparación
		const newParamsString = newParams.toString();

		// Solo actualizar si los parámetros han cambiado realmente
		if (newParamsString !== lastUrlUpdate.current) {
			lastUrlUpdate.current = newParamsString;
			setSearchParams(newParams, {replace: true});
		}

		// Resetear el flag
		isUpdatingFromState.current = false;
	}, [filtersState, searchParams, setSearchParams]);

	// Este useEffect actualiza el estado cuando cambia la URL
	useEffect(() => {
		// Si estamos actualizando desde el estado, no procesar cambios de URL
		if (isUpdatingFromState.current) return;

		const searchParamsString = searchParams.toString();

		// Si ya procesamos esta URL exacta, no hacer nada
		if (searchParamsString === lastUrlUpdate.current) return;

		// Actualizar la referencia de última URL
		lastUrlUpdate.current = searchParamsString;

		const categoryParam = searchParams.get("category");
		const minPriceParam = searchParams.get("minPrice");
		const maxPriceParam = searchParams.get("maxPrice");
		const ratingParam = searchParams.get("rating");
		const discountParam = searchParams.get("discount");
		const sortParam = searchParams.get("sort");
		const pageParam = searchParams.get("page");

		setFiltersState({
			categories: categoryParam ? categoryParam.split(",") : [],
			priceRange:
				minPriceParam && maxPriceParam
					? {min: parseInt(minPriceParam), max: parseInt(maxPriceParam)}
					: null,
			rating: ratingParam ? parseInt(ratingParam) : null,
			discount: discountParam === "true",
			sortBy: sortParam || "featured",
			page: pageParam ? parseInt(pageParam) : 1,
		});
	}, [searchParams]);

	// Funciones para actualizar filtros
	const setCategories = useCallback((categories: string[]) => {
		isUpdatingFromState.current = true;
		setFiltersState((prev) => ({
			...prev,
			categories,
			page: 1, // Resetear página al cambiar filtros
		}));
	}, []);

	const setPriceRange = useCallback(
		(priceRange: {min: number; max: number} | null) => {
			isUpdatingFromState.current = true;
			setFiltersState((prev) => ({
				...prev,
				priceRange,
				page: 1,
			}));
		},
		[]
	);

	const setRating = useCallback((rating: number | null) => {
		isUpdatingFromState.current = true;
		setFiltersState((prev) => ({
			...prev,
			rating,
			page: 1,
		}));
	}, []);

	const setDiscount = useCallback((discount: boolean) => {
		isUpdatingFromState.current = true;
		setFiltersState((prev) => ({
			...prev,
			discount,
			page: 1,
		}));
	}, []);

	const setSortBy = useCallback((sortBy: string) => {
		isUpdatingFromState.current = true;
		setFiltersState((prev) => ({
			...prev,
			sortBy,
			page: 1,
		}));
	}, []);

	const setPage = useCallback((page: number) => {
		isUpdatingFromState.current = true;
		setFiltersState((prev) => ({
			...prev,
			page,
		}));
	}, []);

	const clearFilters = useCallback(() => {
		isUpdatingFromState.current = true;
		setFiltersState({
			categories: [],
			priceRange: null,
			rating: null,
			discount: false,
			sortBy: "featured",
			page: 1,
		});
	}, []);

	// Función para alternar una categoría
	const toggleCategory = useCallback((category: string) => {
		isUpdatingFromState.current = true;
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

	// Construir los parámetros para la API
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
				params.categoryOperator = "or";
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
		clearFilters,
		toggleCategory,
	};
};

export default useProductFilters;
