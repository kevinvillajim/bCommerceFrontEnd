import type {Category} from "./Category";
import type {Seller} from "./Seller";

/**
 * Product entity based on API documentation
 */
export interface Product {
	id?: number;
	user_id?: number;
	category_id?: number;
	name: string;
	slug: string;
	description: string;
	short_description?: string;
	rating?: number;
	rating_count?: number;
	price: number;
	stock: number;
	weight?: number | null;
	width?: number | null;
	height?: number | null;
	depth?: number | null;
	dimensions?: string | null;
	colors?: string[];
	sizes?: string[];
	tags?: string[];
	sku?: string;
	attributes?: Array<{key: string; value: string}>;
	images?: {
		original: string;
		thumbnail: string;
		medium: string;
		large: string;
	}[];
	featured: boolean;
	published: boolean;
	status: string;
	view_count?: number;
	sales_count?: number;
	discount_percentage?: number;
	created_at?: string;
	updated_at?: string;

	// Campos calculados (solo en respuestas)
	final_price?: number;
	main_image?: string;
	is_in_stock?: boolean;

	// Campo para relación con categoría, puede venir al obtener producto por ID/slug
	category?: Category;
}

/**
 * Product with related data
 */
export interface ProductDetail extends Product {
	seller?: Seller;
	related_products?: Product[];
}

/**
 * Product list response según la documentación
 */
export interface ProductListResponse {
	data: Product[];
	meta: {
		total: number;
		count: number;
		limit: number;
		offset: number;
		page?: number;
		pages?: number;
		term?: string;
		filters?: {
			category_id?: number;
			price_min?: number;
			published?: boolean;
			status?: string;
			min_discount?: number;
			seller_id?: number;
			featured?: boolean;
			sortBy?: string;
			sortDir?: string;
		};
		category?: Category;
		includeSubcategories?: boolean;
		categoryIds?: number[];
		tags?: string[];
		min_discount?: number;
	};
	related_products?: Product[]; // Para respuesta de producto por slug
}

/**
 * Product creation data
 */
export interface ProductCreationData {
	name: string;
	slug?: string;
	category_id: number;
	description: string;
	short_description?: string;
	price: number;
	stock: number;
	weight?: number;
	width?: number;
	height?: number;
	depth?: number;
	dimensions?: string;
	colors?: string[] | string;
	sizes?: string[] | string;
	tags?: string[] | string;
	sku?: string;
	attributes?: Array<{key: string; value: string}>;
	images?: File[];
	featured?: boolean;
	published?: boolean;
	status?: string;
	discount_percentage?: number;
}

/**
 * Product update data
 */
export interface ProductUpdateData extends Partial<ProductCreationData> {
	id: number;
	replace_images?: boolean;
	remove_images?: number[];
}

/**
 * Product filter params según la documentación
 */
export interface ProductFilterParams {
	limit?: number;
	offset?: number;
	page?: number;
	term?: string;
	categoryId?: number;
	categoryIds?: number[];
	minPrice?: number;
	maxPrice?: number;
	rating?: number;
	minDiscount?: number;
	colors?: string[] | string;
	sizes?: string[] | string;
	tags?: string[] | string;
	inStock?: boolean;
	isNew?: boolean;
	sortBy?: "price" | "created_at" | "rating" | "sales_count";
	sortDir?: "asc" | "desc";
	sellerId?: number;
	featured?: boolean;
	status?: "active" | "inactive" | "draft";
}
