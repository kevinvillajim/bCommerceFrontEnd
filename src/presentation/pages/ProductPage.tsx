import React, { useState, useEffect, useCallback } from 'react';
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
import { Package } from 'lucide-react';

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
 * - Soporta filtros múltiples acumulativos
 */
const ProductPage: React.FC = () => {
  // Estado de la URL y navegación
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // Estados para filtros
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showingDiscounted, setShowingDiscounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdatingFromUrl, setIsUpdatingFromUrl] = useState<boolean>(false);
  
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

  // Función para actualizar los parámetros de la URL
  // Definida antes de cualquier useEffect que la utilice
  const updateSearchParams = (
    params: {
      selectedCategories: string[],
      searchTerm: string,
      selectedPriceRange: { min: number; max: number } | null,
      sortBy: string,
      showingDiscounted: boolean,
      currentPage: number
    }
  ) => {
    const newParams = new URLSearchParams();
    
    // Añadir categorías
    if (params.selectedCategories.length > 0) {
      newParams.set('category', params.selectedCategories.join(','));
    }
    
    // Añadir término de búsqueda
    if (params.searchTerm) {
      newParams.set('search', params.searchTerm);
    }
    
    // Añadir rango de precio
    if (params.selectedPriceRange) {
      newParams.set('minPrice', params.selectedPriceRange.min.toString());
      newParams.set('maxPrice', params.selectedPriceRange.max.toString());
    }
    
    // Añadir ordenamiento
    if (params.sortBy !== 'featured') {
      newParams.set('sort', params.sortBy);
    }
    
    // Añadir descuento
    if (params.showingDiscounted) {
      newParams.set('discount', 'true');
    }
    
    // Añadir página actual
    if (params.currentPage > 1) {
      newParams.set('page', params.currentPage.toString());
    }
    
    // Actualizar URL sin recargar la página
    setSearchParams(newParams, { replace: true });
  };
  
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
        // Usar categoryIds para múltiples categorías
        params.categoryIds = categoryIds;
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
      
      // Solo actualizar la URL si no estamos en proceso de actualización desde URL
      if (!isUpdatingFromUrl) {
        // Llamada a updateSearchParams con el estado actual
        updateSearchParams({
          selectedCategories,
          searchTerm,
          selectedPriceRange,
          sortBy, 
          showingDiscounted,
          currentPage
        });
      }
    }
  }, [
    fetchProducts, 
    buildFilterParams, 
    categoriesData.length, 
    selectedPriceRange, 
    showingDiscounted, 
    sortBy, 
    currentPage,
    searchTerm,
    selectedCategories,
    isUpdatingFromUrl
  ]);

  // Procesar cambios en la URL
  useEffect(() => {
    // Si ya estamos actualizando desde una interacción, no disparar este efecto
    if (isUpdatingFromUrl) return;
    
    const queryParams = new URLSearchParams(location.search);
    
    // Procesar categorías desde la URL
    const categoryParam = queryParams.get('category');
    if (categoryParam) {
      // Si hay un parámetro de categoría en la URL, actualizar el estado
      const categoryNames = categoryParam.split(',');
      
      // Añade esta comprobación para evitar actualizaciones innecesarias
      if (JSON.stringify(categoryNames.sort()) !== JSON.stringify([...selectedCategories].sort())) {
        setIsUpdatingFromUrl(true);
        setSelectedCategories(categoryNames);
        setTimeout(() => setIsUpdatingFromUrl(false), 100);
      }
    } else if (selectedCategories.length > 0) {
      // Si no hay categorías en la URL pero sí en el estado, limpiarlas
      setIsUpdatingFromUrl(true);
      setSelectedCategories([]);
      setTimeout(() => setIsUpdatingFromUrl(false), 100);
    }
    
    // Procesar término de búsqueda desde la URL
    const searchParam = queryParams.get('search');
    if (searchParam && searchParam !== searchTerm) {
      setIsUpdatingFromUrl(true);
      setSearchTerm(searchParam);
      setTimeout(() => setIsUpdatingFromUrl(false), 100);
    } else if (!searchParam && searchTerm) {
      setIsUpdatingFromUrl(true);
      setSearchTerm('');
      setTimeout(() => setIsUpdatingFromUrl(false), 100);
    }
    
    // Procesar rango de precio desde la URL
    const minPriceParam = queryParams.get('minPrice');
    const maxPriceParam = queryParams.get('maxPrice');
    if (minPriceParam && maxPriceParam) {
      const min = parseInt(minPriceParam);
      const max = parseInt(maxPriceParam);
      
      const currentMin = selectedPriceRange?.min;
      const currentMax = selectedPriceRange?.max;
      
      if (currentMin !== min || currentMax !== max) {
        setIsUpdatingFromUrl(true);
        setSelectedPriceRange({ min, max });
        setTimeout(() => setIsUpdatingFromUrl(false), 100);
      }
    } else if (selectedPriceRange) {
      // Si no hay rango en la URL pero sí en el estado, limpiarlo
      setIsUpdatingFromUrl(true);
      setSelectedPriceRange(null);
      setTimeout(() => setIsUpdatingFromUrl(false), 100);
    }
    
    // Procesar ordenamiento desde la URL
    const sortParam = queryParams.get('sort');
    if (sortParam && sortParam !== sortBy) {
      setIsUpdatingFromUrl(true);
      setSortBy(sortParam);
      setTimeout(() => setIsUpdatingFromUrl(false), 100);
    } else if (!sortParam && sortBy !== 'featured') {
      setIsUpdatingFromUrl(true);
      setSortBy('featured');
      setTimeout(() => setIsUpdatingFromUrl(false), 100);
    }
    
    // Procesar página actual desde la URL
    const pageParam = queryParams.get('page');
    if (pageParam) {
      const page = parseInt(pageParam);
      if (page !== currentPage) {
        setIsUpdatingFromUrl(true);
        setCurrentPage(page);
        setTimeout(() => setIsUpdatingFromUrl(false), 100);
      }
    } else if (currentPage > 1) {
      // Si no hay página en la URL pero estamos en una página diferente a la primera, resetear
      setIsUpdatingFromUrl(true);
      setCurrentPage(1);
      setTimeout(() => setIsUpdatingFromUrl(false), 100);
    }
    
    // Procesar filtro de descuento desde la URL
    const discountParam = queryParams.get('discount');
    const shouldShowDiscounted = discountParam === 'true';
    if (shouldShowDiscounted !== showingDiscounted) {
      setIsUpdatingFromUrl(true);
      setShowingDiscounted(shouldShowDiscounted);
      setTimeout(() => setIsUpdatingFromUrl(false), 100);
    }
    
  }, [location.search, selectedCategories, searchTerm, selectedPriceRange, sortBy, currentPage, showingDiscounted, isUpdatingFromUrl]);

  // Handlers para interacción del usuario
  
  // Manejar cambio de categorías
  const handleCategoryChange = useCallback((categories: string[]) => {
    setIsUpdatingFromUrl(true);
    setSelectedCategories(categories);
    setCurrentPage(1); // Resetear a la primera página
    
    // Pequeño retardo para asegurar que el estado se actualice correctamente
    setTimeout(() => setIsUpdatingFromUrl(false), 100);
  }, []);

  // Manejar cambio de rango de precio
  const handlePriceRangeChange = useCallback((range: { min: number; max: number }) => {
    setIsUpdatingFromUrl(true);
    
    // Si el mismo rango ya está seleccionado, deseleccionarlo
    if (selectedPriceRange && selectedPriceRange.min === range.min && selectedPriceRange.max === range.max) {
      setSelectedPriceRange(null);
    } else {
      setSelectedPriceRange(range);
    }
    
    setCurrentPage(1); // Resetear a la primera página
    
    // Pequeño retardo para asegurar que el estado se actualice correctamente
    setTimeout(() => setIsUpdatingFromUrl(false), 100);
  }, [selectedPriceRange]);

  // Eliminar una categoría seleccionada
  const handleRemoveCategory = useCallback((categoryToRemove: string) => {
    setIsUpdatingFromUrl(true);
    setSelectedCategories(prev => prev.filter(cat => cat !== categoryToRemove));
    setCurrentPage(1);
    setTimeout(() => setIsUpdatingFromUrl(false), 100);
  }, []);

  // Limpiar filtro de rango de precio
  const handleClearPriceRange = useCallback(() => {
    setIsUpdatingFromUrl(true);
    setSelectedPriceRange(null);
    setCurrentPage(1);
    setTimeout(() => setIsUpdatingFromUrl(false), 100);
  }, []);

  // Alternar filtro de descuentos
  const handleToggleDiscount = useCallback(() => {
    setIsUpdatingFromUrl(true);
    setShowingDiscounted(prev => !prev);
    setCurrentPage(1);
    setTimeout(() => setIsUpdatingFromUrl(false), 100);
  }, []);

  // Resetear todos los filtros
  const handleClearAllFilters = useCallback(() => {
    setIsUpdatingFromUrl(true);
    
    // Limpiar todos los estados
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSortBy('featured');
    setSearchTerm('');
    setShowingDiscounted(false);
    setCurrentPage(1);
    
    // Limpiar URL directamente con una nueva instancia de URLSearchParams
    setSearchParams(new URLSearchParams(), { replace: true });
    
    // Buscar productos con filtros limpios
    const cleanParams = {
      limit: appConfig.pagination.defaultPageSize,
      offset: 0,
      sortBy: 'featured',
      sortDir: 'desc' as 'desc' // Forzar el tipo correcto
    };
    
    fetchProducts(cleanParams)
      .catch(err => {
        console.error("Error al obtener productos después de limpiar filtros:", err);
      })
      .finally(() => {
        // Reestablecer la bandera
        setTimeout(() => setIsUpdatingFromUrl(false), 100);
      });
  }, [setSearchParams, fetchProducts]);

  // Manejar búsqueda
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingFromUrl(true);
    setCurrentPage(1); // Resetear a la primera página al buscar
    setTimeout(() => setIsUpdatingFromUrl(false), 100);
  }, []);

  // Manejar cambio en input de búsqueda
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Manejar cambio de ordenamiento
  const handleSortChange = useCallback((sortId: string) => {
    setIsUpdatingFromUrl(true);
    setSortBy(sortId);
    setCurrentPage(1);
    setTimeout(() => setIsUpdatingFromUrl(false), 100);
  }, []);

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage: number) => {
    setIsUpdatingFromUrl(true);
    setCurrentPage(newPage);
    // Hacer scroll al inicio de la lista de productos
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsUpdatingFromUrl(false), 100);
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
  const totalPages = productsMeta ? Math.ceil(productsMeta.total / (productsMeta.limit || appConfig.pagination.defaultPageSize)) : 0;

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