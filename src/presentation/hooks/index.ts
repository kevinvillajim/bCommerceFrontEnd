// Export all hooks from a central location for easier imports

// Product related hooks
export { useProducts } from './useProducts';
export { useProductFilters } from './useProductFilters';
export { useProductSearch } from './useProductSearch';

// Category related hooks  
export { useCategories } from './useCategories';
export { useCategoriesSelect } from './useCategoriesSelect';

// Cart and favorites
export { useCart } from './useCart';
export { useFavorites } from './useFavorites';

// Filter state management
export { useFilterState } from './useFilterState';

// Auth and user related hooks
export { useAuth } from './useAuth';

// Chat functionality
export { useChat } from './useChat';

// Re-export default exports as named exports for consistency
import useCategories from './useCategories';
import useProductFilters from './useProductFilters';
import useProductSearch from './useProductSearch';
import useProducts from './useProducts';
import useCategoriesSelect from './useCategoriesSelect';
import useFilterState from './useFilterState';

export {
	useCategories as default_useCategories,
	useProductFilters as default_useProductFilters,
	useProductSearch as default_useProductSearch,
	useProducts as default_useProducts,
	useCategoriesSelect as default_useCategoriesSelect,
	useFilterState as default_useFilterState,
};

// Type exports
export type { ExtendedProductFilterParams } from '../types/ProductFilterParams';
export type { FilterState, UseFilterStateProps } from './useFilterState';
export type { CategoryOption } from './useCategoriesSelect';
