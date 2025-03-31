import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

// Componentes optimizados
import SearchBar from '../components/product/SearchBar';
import CategoriesCarousel from '../components/product/CategoriesCarousel';
import ProductFilters from '../components/product/ProductFilters';
import ProductGrid from '../components/product/ProductGrid';
import SortDropdown from '../components/product/SortDropdown';
import MobileFilterPanel from '../components/product/MobileFilterPanel';
import ActiveFilters from '../components/product/ActiveFilters';
import Pagination from '../components/product/Pagination';
import MobilePagination from '../components/product/MobilePagination';

// Hooks optimizados con caché
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';

// Servicios y configuración
import CacheService from '../../infrastructure/services/CacheService';
import appConfig from '../../config/appConfig';
import environment from '../../config/environment';
import type { ExtendedProductFilterParams } from '../types/ProductFilterParams';

// Íconos
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

// Clave de caché para categorías transformadas
const CATEGORY_OPTIONS_CACHE_KEY = 'category_options_transformed';

/**
 * Página de productos optimizada 
 * - Usa componentes modularizados
 * - Implementa sistema de caché
 * - Incluye paginación mejorada para móviles
 * - Pestaña de precio abierta por defecto
 */
const ProductPage: React.FC = () => {
  // Estado de la URL y navegación
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados para filtros
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showingDiscounted, setShowingDiscounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  
  const [categoryOptions, setCategoryOptions] = useState<Array<{
    id: number;
    title: string;
    iconName: string;
    link: string;
  }>>([]);

  // Hooks optimizados
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

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Check initially
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const location = useLocation();
  
  // Función para construir parámetros de filtro
const buildFilterParams = useCallback((): ExtendedProductFilterParams => {
  const params: ExtendedProductFilterParams = {
    limit: appConfig.pagination.defaultPageSize,
    offset: (currentPage - 1) * appConfig.pagination.defaultPageSize
  };
  
  // Manejar selección múltiple de categorías
  if (selectedCategories.length > 0) {
    // Obtener IDs de las categorías seleccionadas
    const categoryIds = selectedCategories
      .map(catName => {
        const category = categoriesData.find(c => 
          c.name.toLowerCase() === catName.toLowerCase()
        );
        return category?.id;
      })
      .filter(id => id !== undefined) as number[];
    
    if (categoryIds.length > 0) {
      if (categoryIds.length === 1) {
        // Si solo hay una categoría, usamos el parámetro categoryId
        params.categoryId = categoryIds[0];
      } else {
        // Si hay múltiples categorías, las guardamos en nuestro parámetro extendido
        params.categoryIds = categoryIds;
      }
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
    params.minDiscount = 5; // Productos con al menos 5% de descuento
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
    const loadCategories = async () => {
      await fetchCategories();
    };
    
    loadCategories();
    
    // Obtener parámetros de la URL
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const priceMinParam = searchParams.get('minPrice');
    const priceMaxParam = searchParams.get('maxPrice');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');
    const discountParam = searchParams.get('discount');
    
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
    
    if (discountParam === 'true') {
      setShowingDiscounted(true);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar opciones de categoría cuando se carguen los datos
  // Y actualiza la transformación de categorías:
useEffect(() => {
  if (categoriesData && categoriesData.length > 0) {
    // Intentar obtener categorías transformadas de caché
    const cachedOptions = CacheService.getItem(CATEGORY_OPTIONS_CACHE_KEY);
    
    if (cachedOptions) {
      setCategoryOptions(cachedOptions);
      return;
    }
    
    // Si no hay caché, transformar las categorías
    const options = categoriesData.map(category => {
      // Determinar ícono basado en el nombre de categoría
      const categoryNameLower = category.name.toLowerCase();
      let iconName = "📦"; // Emoji por defecto
      
      // Asignar emojis según el nombre de la categoría
      if (categoryNameLower.includes("smartphone")) iconName = "📱";
      else if (categoryNameLower.includes("laptop")) iconName = "💻";
      else if (categoryNameLower.includes("monitor")) iconName = "🖥️";
      else if (categoryNameLower.includes("tv")) iconName = "📺";
      else if (categoryNameLower.includes("auricular") || categoryNameLower.includes("headphone")) iconName = "🎧";
      else if (categoryNameLower.includes("camara") || categoryNameLower.includes("camera")) iconName = "📷";
      else if (categoryNameLower.includes("reloj") || categoryNameLower.includes("watch")) iconName = "⌚";
      else if (categoryNameLower.includes("altavoz") || categoryNameLower.includes("speaker")) iconName = "🔊";
      
      return {
        id: category.id || 0,
        title: category.name,
        iconName: iconName,
        link: `/products?category=${encodeURIComponent(category.name)}`
      };
    });
    
    // Guardar en caché
    CacheService.setItem(
      CATEGORY_OPTIONS_CACHE_KEY,
      options,
      appConfig.cache.categoryCacheTime
    );
    
    setCategoryOptions(options);
  }
}, [categoriesData]);

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    if (categoriesData.length > 0) {
      const params = buildFilterParams();
      console.log("Parámetros de filtrado:", params);
      
      fetchProducts(params)
        .then(response => {
          console.log("Respuesta de productos:", response);
        })
        .catch(err => {
          console.error("Error al obtener productos:", err);
        });
      
      updateSearchParams();
    }
  }, [
    fetchProducts, 
    buildFilterParams, 
    categoriesData.length, 
    selectedPriceRange, 
    showingDiscounted, 
    sortBy, 
    currentPage,
    searchTerm
  ]);

  useEffect(() => {
  // Este efecto se ejecuta cuando cambia la URL
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  
  if (categoryParam) {
    // Si hay un parámetro de categoría en la URL, actualizar el estado
    const categoryNames = categoryParam.split(',');
    
    // Añade esta comprobación para evitar actualizaciones innecesarias que causan bucles
    if (JSON.stringify(categoryNames) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(categoryNames);
      // No necesitas llamar a fetchProducts aquí, el otro useEffect se encargará
    }
  }
  // Solo incluir location.search como dependencia
}, [location.search, selectedCategories]);

  // Actualizar parámetros de búsqueda en la URL
  const updateSearchParams = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    
    // Limpiar parámetros existentes
    ['category', 'search', 'minPrice', 'maxPrice', 'sort', 'page', 'discount'].forEach(param => {
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
    
    // Añadir descuento
    if (showingDiscounted) {
      newParams.set('discount', 'true');
    }
    
    // Añadir página actual
    if (currentPage > 1) {
      newParams.set('page', currentPage.toString());
    }
    
    // Actualizar URL sin recargar la página
    setSearchParams(newParams, { replace: true });
  }, [searchParams, selectedCategories, searchTerm, selectedPriceRange, sortBy, showingDiscounted, currentPage, setSearchParams]);

  // Handlers para interacción del usuario
  
  // Manejar cambio de categorías
  const handleCategoryChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
    setCurrentPage(1); // Resetear a la primera página
  }, []);

  // Manejar cambio de rango de precio
  const handlePriceRangeChange = useCallback((range: { min: number; max: number }) => {
    // Si el mismo rango ya está seleccionado, deseleccionarlo
    if (selectedPriceRange && selectedPriceRange.min === range.min && selectedPriceRange.max === range.max) {
      setSelectedPriceRange(null);
    } else {
      setSelectedPriceRange(range);
    }
    
    setCurrentPage(1); // Resetear a la primera página
  }, [selectedPriceRange]);

  // Eliminar una categoría seleccionada
  const handleRemoveCategory = useCallback((categoryToRemove: string) => {
    setSelectedCategories(prev => prev.filter(cat => cat !== categoryToRemove));
    setCurrentPage(1);
  }, []);

  // Limpiar filtro de rango de precio
  const handleClearPriceRange = useCallback(() => {
    setSelectedPriceRange(null);
    setCurrentPage(1);
  }, []);

  // Alternar filtro de descuentos
  const handleToggleDiscount = useCallback(() => {
    setShowingDiscounted(prev => !prev);
    setCurrentPage(1);
  }, []);

  // Resetear todos los filtros
  const handleClearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSortBy('featured');
    setSearchTerm('');
    setShowingDiscounted(false);
    setCurrentPage(1);
  }, []);

  // Manejar búsqueda
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Resetear a la primera página al buscar
  }, []);

  // Manejar cambio en input de búsqueda
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Manejar cambio de ordenamiento
  const handleSortChange = useCallback((sortId: string) => {
    setSortBy(sortId);
    setCurrentPage(1);
  }, []);

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    // Hacer scroll al inicio de la lista de productos
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Manejar acción de añadir al carrito
  const handleAddToCart = useCallback(async (productId: number) => {
    try {
      await addToCart({
        productId,
        quantity: 1
      });
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
      // Aquí se podría mostrar una notificación de error
    }
  }, [addToCart]);
  
  // Manejar acción de añadir a favoritos
  const handleAddToWishlist = useCallback(async (productId: number) => {
    try {
      await toggleFavorite(productId);
    } catch (error) {
      console.error('Error al añadir a favoritos:', error);
      // Aquí se podría mostrar una notificación de error
    }
  }, [toggleFavorite]);

  // Obtener la URL completa de la imagen
  const getImageUrl = useCallback((imagePath: string | undefined) => {
    if (!imagePath) return 'https://via.placeholder.com/300';
    
    // Si la imagen ya es una URL completa, devolverla tal cual
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Sino, construirla con la base URL
    return `${environment.imageBaseUrl}${imagePath}`;
  }, []);

  // Calcular el número total de páginas
  const totalPages = useMemo(() => {
    return productsMeta ? Math.ceil(productsMeta.total / (productsMeta.limit || appConfig.pagination.defaultPageSize)) : 0;
  }, [productsMeta]);

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
            onPriceRangeChange={handlePriceRangeChange}
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
          
          {/* Paginación - Mostrar SimplePagination en móvil y Pagination en desktop */}
          {productsMeta && productsMeta.total > productsMeta.limit && (
            <>
              {/* Paginación para móviles */}
              {isMobile && (
                <MobilePagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}

              {/* Paginación para desktop */}
              {!isMobile && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;