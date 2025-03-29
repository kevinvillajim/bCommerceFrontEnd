
/**
 * Category entity
 */
export interface Category {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  icon?: string;
  image?: string;
  order?: number;
  isActive: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Relaciones opcionales
  parent?: Category;
  children?: Category[];
  productCount?: number;
}

/**
 * Category list response
 */
export interface CategoryListResponse {
  data: Category[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Category creation data
 */
export interface CategoryCreationData {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  icon?: string;
  image?: File;
  order?: number;
  isActive?: boolean;
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
  parentId?: number;
  featured?: boolean;
  isActive?: boolean;
  term?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
