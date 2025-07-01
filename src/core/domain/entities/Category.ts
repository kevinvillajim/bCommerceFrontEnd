// Update your src/core/domain/entities/Category.ts file

/**
 * Category entity
 */
export interface Category {
	id?: number;
	name: string;
	slug: string;
	description?: string;
	parent_id?: number;
	parentId?: number; // AGREGADO para compatibilidad
	icon?: string;
	image?: string;
	order?: number;
	is_active: boolean;
	featured: boolean;
	created_at?: string;
	updated_at?: string;

	// API response specific fields
	subcategories?: Category[];
	product_count?: number;
	full_path?: string;
	has_children?: boolean;
	url?: string;
	parent?: Category;
	image_url?: string;
	icon_url?: string;
}

/**
 * Category list response
 */
export interface CategoryListResponse {
	data: Category[];
	meta: {
		total: number;
		limit?: number;
		offset?: number;
		active_only?: boolean;
		featured_only?: boolean;
	};
}

/**
 * Category creation data
 */
export interface CategoryCreationData {
	name: string;
	slug: string;
	description?: string;
	parent_id?: number;
	icon?: string;
	image?: File;
	order?: number;
	is_active?: boolean;
	featured?: boolean;
}

/**
 * Category update data
 */
export interface CategoryUpdateData extends Partial<CategoryCreationData> {
	id: number;
}

/**
 * Category filter params
 */
export interface CategoryFilterParams {
	parent_id?: number;
	featured?: boolean;
	is_active?: boolean;
	term?: string;
	limit?: number;
	offset?: number;
	sort_by?: string;
	sort_dir?: "asc" | "desc";
	with_counts?: boolean;
	with_children?: boolean;
}
