import {useState, useEffect} from "react";
import useCategories from "./useCategories";

// Estructura para el menú desplegable de categorías
export interface CategoryOption {
	value: number;
	label: string;
	isSubcategory?: boolean;
	parentName?: string;
}

/**
 * Hook para obtener categorías formateadas para selectores
 */
export const useCategoriesSelect = () => {
	const {categories, mainCategories, fetchCategories, fetchMainCategories} =
		useCategories();
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

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

	// Preparar opciones para el select cuando se carguen las categorías
	useEffect(() => {
		if (mainCategories.length > 0 || categories.length > 0) {
			const options: CategoryOption[] = [];

			// Primero añadir categorías principales
			mainCategories.forEach((category) => {
				if (category.id) {
					options.push({
						value: category.id,
						label: category.name,
					});

					// Añadir subcategorías si existen
					if (category.subcategories && category.subcategories.length > 0) {
						category.subcategories.forEach((subcategory) => {
							if (subcategory.id) {
								options.push({
									value: subcategory.id,
									label: `${category.name} > ${subcategory.name}`,
									isSubcategory: true,
									parentName: category.name,
								});
							}
						});
					}
				}
			});

			// Si hay categorías que no están en las principales, añadirlas
			categories.forEach((category) => {
				if (
					category.id &&
					!options.some((option) => option.value === category.id)
				) {
					options.push({
						value: category.id,
						label: category.name,
					});
				}
			});

			setCategoryOptions(options);
		}
	}, [mainCategories, categories]);

	return {
		loading,
		error,
		categoryOptions,
	};
};

export default useCategoriesSelect;
