// src/presentation/types/ProductFilterParams.ts

export interface ExtendedProductFilterParams {
	// Paginación
	limit?: number;
	offset?: number;
	page?: number;

	// Búsqueda
	term?: string;

	// Filtros de categoría
	categoryIds?: number[]; // Array de IDs de categorías
	categoryOperator?: "and" | "or"; // Operador para múltiples categorías
	categoryId?: number; // ID de categoría única (para compatibilidad)

	// Filtros de precio
	minPrice?: number;
	maxPrice?: number;
	price_min?: number; // Para compatibilidad con backend
	price_max?: number; // Para compatibilidad con backend

	// Filtro de valoración
	rating?: number;

	// Filtro de descuento
	minDiscount?: number;
	min_discount?: number; // Para compatibilidad con backend

	// Ordenamiento
	sortBy?: string;
	sortDir?: "asc" | "desc";
	sort_by?: string; // Para compatibilidad con backend
	sort_dir?: "asc" | "desc"; // Para compatibilidad con backend

	// Atributos del producto
	colors?: string[];
	sizes?: string[];
	tags?: string[];

	// Estados del producto
	inStock?: boolean;
	stock_min?: number;
	published?: boolean;
	status?: string;
	featured?: boolean;
	isNew?: boolean;
	is_new?: boolean;

	// Vendedor
	sellerId?: number;
	seller_id?: number;

	// Para conteos y estadísticas
	with_counts?: boolean;
	admin_view?: boolean;
}