import {useState, useEffect, useMemo} from "react";
import useCategories from "./useCategories";

// Estructura para el menú desplegable de categorías
export interface CategoryOption {
	value: number;
	label: string;
	isSubcategory?: boolean;
	parentId?: number;
}

/**
 * Hook para obtener categorías formateadas para selectores
 * Con soporte para selección jerárquica de categorías y subcategorías
 */
export const useCategoriesSelect = () => {
	const {categories, mainCategories, fetchCategories, fetchMainCategories} =
		useCategories();
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

	// Cargar categorías al inicializar
	useEffect(() => {
		const loadCategories = async () => {
			setLoading(true);
			try {
				// Cargar categorías principales con subcategorías
				await fetchMainCategories(true);
				// También cargar todas las categorías para tener el listado completo
				await fetchCategories(true);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Error al cargar categorías"
				);
			} finally {
				setLoading(false);
			}
		};

		loadCategories();
	}, [fetchCategories, fetchMainCategories]);

	// Opciones de categorías principales
	const parentCategoryOptions = useMemo(() => {
		const options: CategoryOption[] = [];

		mainCategories.forEach((category) => {
			if (category.id) {
				options.push({
					value: category.id,
					label: category.name,
				});
			}
		});

		// Agregar categorías que no tienen parent_id
		categories.forEach((category) => {
			if (
				category.id &&
				!category.parent_id &&
				!options.some((option) => option.value === category.id)
			) {
				options.push({
					value: category.id,
					label: category.name,
				});
			}
		});

		return options;
	}, [mainCategories, categories]);

	// Opciones de subcategorías filtradas por la categoría principal seleccionada
	const subcategoryOptions = useMemo(() => {
		if (!selectedParentId) return [];

		const options: CategoryOption[] = [];

		// Buscar en categorías principales para encontrar subcategorías
		const parentCategory = mainCategories.find(
			(category) => category.id === selectedParentId
		);

		if (parentCategory && parentCategory.subcategories) {
			parentCategory.subcategories.forEach((subcategory) => {
				if (subcategory.id) {
					options.push({
						value: subcategory.id,
						label: subcategory.name,
						isSubcategory: true,
						parentId: selectedParentId,
					});
				}
			});
		}

		// También buscar en todas las categorías para asegurar
		categories.forEach((category) => {
			if (
				category.id &&
				category.parent_id === selectedParentId &&
				!options.some((option) => option.value === category.id)
			) {
				options.push({
					value: category.id,
					label: category.name,
					isSubcategory: true,
					parentId: selectedParentId,
				});
			}
		});

		return options;
	}, [selectedParentId, mainCategories, categories]);

	// Todas las opciones disponibles (para compatibilidad hacia atrás)
	const allCategoryOptions = useMemo(() => {
		return [...parentCategoryOptions, ...subcategoryOptions];
	}, [parentCategoryOptions, subcategoryOptions]);

	return {
		loading,
		error,
		categoryOptions: allCategoryOptions, // Para compatibilidad
		parentCategoryOptions,
		subcategoryOptions,
		selectedParentId,
		setSelectedParentId,
	};
};

export default useCategoriesSelect;
