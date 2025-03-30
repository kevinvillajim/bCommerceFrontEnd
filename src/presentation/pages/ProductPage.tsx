import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
// No necesitamos importar Filter ya que usamos el componente ActiveFilters

// Importaciones de componentes
import SearchBar from '../components/product/SearchBar';
import CategoriesCarousel from '../components/product/CategoriesCarousel';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import SortDropdown from '../components/product/SortDropdown';
import MobileFilterPanel from '../components/product/MobileFilterPanel';
import ActiveFilters from '../components/product/ActiveFilters';
import Pagination from '../components/product/Pagination';

// Importaciones de hooks y utilidades
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import appConfig from '../../config/appConfig';
import environment from '../../config/environment';
import type { ProductFilterParams } from '../../core/domain/entities/Product';
// Usamos el tipo Category importado en los componentes hijos
import { Smartphone, Tv, Laptop, Monitor, Headphones, Camera, Watch, Speaker, Package } from 'lucide-react';

// Mapeo de iconos por categoría (nombre en minúsculas como clave)
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'smartphones': Smartphone,
  'laptops': Laptop,
  'monitores': Monitor,
  'tvs': Tv,
  'auriculares': Headphones,
  'cámaras': Camera,
  'camaras': Camera,
  'relojes': Watch,
  'altavoces': Speaker,
  'default': Package
};

// Price ranges for filter
const priceRanges = [
  { id: '0-100', label: 'Menos de $100' },
  { id: '100-300', label: '$100 - $300' },
  { id: '300-500', label: '$300 - $500' },
  { id: '500-1000', label: '$500 - $1000' },
  { id: '1000-2000', label: '$1000 - $2000' },
  { id: '2000-999999', label: 'Más de $2000' }
];

// Sort options
const sortOptions = [
  { id: 'featured', label: 'Destacados' },
  { id: 'price-asc', label: 'Precio: Menor a Mayor' },
  { id: 'price-desc', label: 'Precio: Mayor a Menor' },
  { id: 'name-asc', label: 'Nombre: A-Z' },
  { id: 'name-desc', label: 'Nombre: Z-A' },
  { id: 'newest', label: 'Más recientes' }
];

/**
 * Página de productos que muestra la lista de productos disponibles
 * con opciones de filtrado y ordenamiento
 */
const ProductPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showingDiscounted, setShowingDiscounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryOptions, setCategoryOptions] = useState<Array<{
    id: number;
    title: string;
    icon: React.ElementType;
    link: string;
  }>>([]);
  
  // Hooks
  const { 
    loading: productsLoading, 
    error: productsError, 
    products: productsData, 
    meta: productsMeta, 
    fetchProducts 
  } = useProducts();
  
  const { 
    loading: categoriesLoading, 
    error: categoriesError,
    categories: categoriesData, 
    fetchCategories 
  } = useCategories();
  
  const { addToCart } = useCart();
  const { toggleFavorite } = useFavorites();

  // Función para construir parámetros de filtro
  const buildFilterParams = useCallback((): ProductFilterParams => {
    const params: ProductFilterParams = {
      limit: appConfig.pagination.defaultPageSize,
      offset: (currentPage - 1) * appConfig.pagination.defaultPageSize
    };
    
    // Añadir categoría si está seleccionada
    if (selectedCategories.length > 0) {
      const categoryIds = selectedCategories
        .map(catName => categoriesData.find(c => c.name.toLowerCase() === catName.toLowerCase())?.id)
        .filter(id => id !== undefined) as number[];
      
      if (categoryIds.length > 0) {
        params.categoryId = categoryIds[0];
      }
    }
    
    // Añadir rango de precio si está seleccionado
    if (selectedPriceRange) {
      params.minPrice = selectedPriceRange.min;
      
      // Solo añadir maxPrice si no es el valor máximo (para filtros como "Más de $X")
      if (selectedPriceRange.max < 999999) {
        params.maxPrice = selectedPriceRange.max;
      }
    }
    
    // Añadir término de búsqueda
    if (searchTerm) {
      params.term = searchTerm;
    }
    
    // Añadir filtro de descuento
    if (showingDiscounted) {
      // La API debería tener un parámetro para filtrar productos con descuento
      // Por ejemplo: params.hasDiscount = true;
    }
    
    // Añadir ordenamiento
    switch (sortBy) {
      case 'price-asc':
        params.sortBy = 'price';
        params.sortDir = 'asc';
        break;
      case 'price-desc':
        params.sortBy = 'price';
        params.sortDir = 'desc';
        break;
      case 'name-asc':
        params.sortBy = 'name';
        params.sortDir = 'asc';
        break;
      case 'name-desc':
        params.sortBy = 'name';
        params.sortDir = 'desc';
        break;
      case 'newest':
        params.sortBy = 'created_at';
        params.sortDir = 'desc';
        break;
      case 'featured':
      default:
        params.sortBy = 'featured';
        params.sortDir = 'desc';
        break;
    }
    
    return params;
  }, [selectedCategories, selectedPriceRange, searchTerm, showingDiscounted, sortBy, currentPage, categoriesData]);

  // Cargar datos al iniciar
  useEffect(() => {
    // Cargar categorías
    fetchCategories();
    
    // Obtener parámetros de la URL
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const priceMinParam = searchParams.get('minPrice');
    const priceMaxParam = searchParams.get('maxPrice');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');
    
    // Aplicar filtros de la URL
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','));
    }
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    
    if (priceMinParam && priceMaxParam) {
      const min = parseInt(priceMinParam);
      const max = parseInt(priceMaxParam);
      setSelectedPriceRange({ min, max });
    }
    
    if (sortParam) {
      setSortBy(sortParam);
    }
    
    if (pageParam) {
      setCurrentPage(parseInt(pageParam));
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCategories]);

  // Actualizar opciones de categoría cuando se carguen los datos
  useEffect(() => {
    if (categoriesData && categoriesData.length > 0) {
      const options = categoriesData.map(category => {
        // Determinar icono basado en el nombre de categoría (o usar Default)
        const categoryNameLower = category.name.toLowerCase();
        const icon = CATEGORY_ICONS[categoryNameLower] || CATEGORY_ICONS.default;
        
        return {
          id: category.id || 0,
          title: category.name,
          icon: icon,
          link: `/products?category=${encodeURIComponent(category.name)}`
        };
      });
      setCategoryOptions(options);
    }
  }, [categoriesData]);

// En ProductPage.tsx, después de llamar a fetchProducts
useEffect(() => {
  if (categoriesData.length > 0) {
    const params = buildFilterParams();
    console.log("Parámetros de filtrado:", params);
    
    fetchProducts(params)
      .then(response => {
        console.log("Respuesta de la API:", response);
      })
      .catch(err => {
        console.error("Error al obtener productos:", err);
      });
    
    updateSearchParams();
  }
}, [fetchProducts, buildFilterParams, categoriesData.length]);

  // Actualizar parámetros de búsqueda en la URL
  const updateSearchParams = () => {
    const newParams = new URLSearchParams(searchParams);
    
    // Limpiar parámetros existentes
    ['category', 'search', 'minPrice', 'maxPrice', 'sort', 'page'].forEach(param => {
      newParams.delete(param);
    });
    
    // Añadir categorías
    if (selectedCategories.length > 0) {
      newParams.set('category', selectedCategories.join(','));
    }
    
    // Añadir término de búsqueda
    if (searchTerm) {
      newParams.set('search', searchTerm);
    }
    
    // Añadir rango de precio
    if (selectedPriceRange) {
      newParams.set('minPrice', selectedPriceRange.min.toString());
      newParams.set('maxPrice', selectedPriceRange.max.toString());
    }
    
    // Añadir ordenamiento
    if (sortBy !== 'featured') {
      newParams.set('sort', sortBy);
    }
    
    // Añadir página actual
    if (currentPage > 1) {
      newParams.set('page', currentPage.toString());
    }
    
    // Actualizar URL sin recargar la página
    setSearchParams(newParams, { replace: true });
  };

  // Handlers para interacción del usuario
  
  // Manejar cambio de categorías
  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Manejar cambio de rango de precio
  const handlePriceRangeChange = (range: { min: number; max: number }) => {
    // Si el mismo rango ya está seleccionado, deseleccionarlo
    if (selectedPriceRange && selectedPriceRange.min === range.min && selectedPriceRange.max === range.max) {
      setSelectedPriceRange(null);
    } else {
      setSelectedPriceRange(range);
    }
    
    setCurrentPage(1); // Resetear a la primera página
  };

  // Eliminar una categoría seleccionada
  const handleRemoveCategory = (categoryToRemove: string) => {
    setSelectedCategories(prev => prev.filter(cat => cat !== categoryToRemove));
    setCurrentPage(1);
  };

  // Limpiar filtro de rango de precio
  const handleClearPriceRange = () => {
    setSelectedPriceRange(null);
    setCurrentPage(1);
  };

  // Alternar filtro de descuentos
  const handleToggleDiscount = () => {
    setShowingDiscounted(!showingDiscounted);
    setCurrentPage(1);
  };

  // Resetear todos los filtros
  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSortBy('featured');
    setSearchTerm('');
    setShowingDiscounted(false);
    setCurrentPage(1);
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Manejar cambio en input de búsqueda
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (sortId: string) => {
    setSortBy(sortId);
    setCurrentPage(1);
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Hacer scroll al inicio de la lista de productos
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejar acción de añadir al carrito
  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart({
        productId,
        quantity: 1
      });
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      // Aquí se podría mostrar una notificación de error
    }
  };
  
  // Manejar acción de añadir a favoritos
  const handleAddToWishlist = async (productId: number) => {
    try {
      await toggleFavorite(productId);
    } catch (error) {
      console.error('Error al añadir a favoritos:', error);
      // Aquí se podría mostrar una notificación de error
    }
  };

  // Obtener la URL completa de la imagen
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return 'https://via.placeholder.com/300';
    
    // Si la imagen ya es una URL completa, devolverla tal cual
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Sino, construirla con la base URL
    return `${environment.imageBaseUrl}${imagePath}`;
  };

  // Calcular el número total de páginas
  const totalPages = productsMeta ? Math.ceil(productsMeta.total / productsMeta.limit) : 0;
  
  // Esta constante se usa en el componente ActiveFilters
  const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRange !== null || showingDiscounted;



  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Productos</h1>
      
      {/* Search Bar Component */}
      <SearchBar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchInputChange}
        onSearch={handleSearch}
      />
      
      {/* Categories Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Categorías</h2>
        {categoriesLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : categoriesError ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            Error al cargar categorías. Por favor, intenta nuevamente.
          </div>
        ) : categoryOptions.length > 0 ? (
          <CategoriesCarousel categories={categoryOptions} />
        ) : (
          <div className="p-4 bg-gray-50 text-gray-500 rounded-lg text-center">
            No hay categorías disponibles
          </div>
        )}
      </section>
      
      {/* Filter and Sort Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        {/* Active Filters Component */}
        <ActiveFilters 
          selectedCategories={selectedCategories}
          selectedPriceRange={selectedPriceRange}
          showingDiscounted={showingDiscounted}
          onRemoveCategory={handleRemoveCategory}
          onClearPriceRange={handleClearPriceRange}
          onToggleDiscount={handleToggleDiscount}
          onClearAllFilters={handleClearAllFilters}
          onToggleFilters={() => setShowMobileFilters(true)}
        />
        
        {/* Sort Dropdown Component */}
        <SortDropdown 
          options={sortOptions}
          selectedOption={sortBy}
          onSortChange={handleSortChange}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden md:block md:w-72 flex-shrink-0">
          <ProductFilters 
            categories={categoriesData.map(cat => cat.name)}
            priceRange={{ min: 0, max: 2000 }}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={(range) => handlePriceRangeChange(range)}
            onRatingChange={(rating) => console.log(`Rating filter: ${rating}`)}
            onDiscountChange={(discount) => setShowingDiscounted(discount > 0)}
            onClearFilters={handleClearAllFilters}
            selectedCategories={selectedCategories}
            selectedPriceRange={selectedPriceRange}
            selectedDiscount={showingDiscounted}
          />
        </div>
        
        {/* Mobile Filters Panel */}
        <MobileFilterPanel 
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          categories={categoriesData}
          selectedCategories={selectedCategories}
          priceRanges={priceRanges}
          selectedRangeId={selectedPriceRange ? `${selectedPriceRange.min}-${selectedPriceRange.max}` : null}
          showingDiscounted={showingDiscounted}
          onCategoryChange={(category, isSelected) => {
            if (isSelected) {
              handleCategoryChange([...selectedCategories, category]);
            } else {
              handleRemoveCategory(category);
            }
          }}
          onPriceRangeChange={(min: number, max: number) => {
            handlePriceRangeChange({ min, max });
          }}
          onDiscountToggle={handleToggleDiscount}
          onClearFilters={handleClearAllFilters}
        />
        
        {/* Products Grid */}
        <div className="flex-1">
          <ProductGrid 
            products={productsData}
            categories={categoriesData}
            isLoading={productsLoading}
            error={productsError || null}
            onRetry={() => fetchProducts({ limit: appConfig.pagination.defaultPageSize, offset: 0 })}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            getImageUrl={getImageUrl}
            selectedCategories={selectedCategories}
            totalItems={productsMeta?.total || 0}
            currentPage={currentPage}
            itemsPerPage={productsMeta?.limit || appConfig.pagination.defaultPageSize}
            onResetFilters={handleClearAllFilters}
          />
          
          {/* Pagination */}
          {productsMeta && productsMeta.total > productsMeta.limit && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;