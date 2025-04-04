import type {Category} from "./Category";
import type {Seller} from "./Seller";

/**
 * Product entity
 */
export interface Product {
	id?: number;
	userId?: number;
	user_id?: number; // Compatibilidad con snake_case
	categoryId?: number;
	category_id?: number; // Compatibilidad con snake_case
	name: string;
	slug: string;
	description: string;
	price: number;
	stock: number;
	weight?: number;
	width?: number;
	height?: number;
	depth?: number;
	dimensions?: string;
	colors?: string[];
	sizes?: string[];
	tags?: string[];
	sku?: string;
	attributes?: Record<string, any>;
	images?: string[];
	featured: boolean;
	published: boolean;
	status: string;
	viewCount?: number;
	view_count?: number; // Compatibilidad con snake_case
	salesCount?: number;
	sales_count?: number; // Compatibilidad con snake_case
	discountPercentage?: number;
	discount_percentage?: number; // Compatibilidad con snake_case
	finalPrice?: number;
	final_price?: number; // Compatibilidad con snake_case
	isInStock?: boolean;
	is_in_stock?: boolean; // Compatibilidad con snake_case
	ratingAvg?: number;
	rating_avg?: number; // Compatibilidad con snake_case
	createdAt?: string;
	created_at?: string; // Compatibilidad con snake_case
	updatedAt?: string;
	updated_at?: string; // Compatibilidad con snake_case
}

/**
 * Product with related data
 */
export interface ProductDetail
	extends Omit<Product, "categoryId" | "category_id"> {
	category: Category;
	seller: Seller;
	reviewCount?: number;
	review_count?: number; // Compatibilidad con snake_case
}

/**
 * Product list response
 */
export interface ProductListResponse {
	data: Product[];
	meta: {
		total: number;
		limit: number;
		offset: number;
	};
}

/**
 * Product creation data
 */
export interface ProductCreationData {
	name: string;
	categoryId: number;
	description: string;
	price: number;
	stock: number;
	weight?: number;
	dimensions?: string;
	colors?: string[];
	sizes?: string[];
	tags?: string[];
	sku?: string;
	attributes?: Record<string, any>;
	images?: File[];
	featured?: boolean;
	published?: boolean;
	status?: string;
	discountPercentage?: number;
}

/**
 * Product update data
 */
export interface ProductUpdateData extends Partial<ProductCreationData> {
	id: number;
}

/**
 * Product filter params
 */
export interface ProductFilterParams {
	term?: string;
	categoryId?: number;
	categoryIds?: number[];
	minPrice?: number;
	maxPrice?: number;
	rating?: number;
	featured?: boolean;
	sellerId?: number;
	status?: string;
	tags?: string[];
	colors?: string[];
	sizes?: string[];
	inStock?: boolean;
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDir?: "asc" | "desc";
}
