import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoriesProduct from '../components/product/CategoriesProduct';
import ProductFilters from '../components/product/ProductFilters';
import ProductCardCompact from '../components/product/ProductCardCompact';
import { Search, ChevronDown, Check, X, Filter } from 'lucide-react';
import { Smartphone, Tv, Laptop, Monitor, Headphones, Camera, Watch, Speaker, Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import appConfig from '../../config/appConfig';
import type { ProductFilterParams } from '../../core/domain/entities/Product';
import environment from '../../config/environment';

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
  const [rangeString, setRangeString] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showingDiscounted, setShowingDiscounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
  
  // State para categorías con iconos
  const [categoryOptions, setCategoryOptions] = useState<Array<{
    id: number;
    title: string;
    icon: React.ElementType;
    link: string;
  }>>([]);

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
      // Ajustar según la especificación real de la API
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
      
      // Buscar el rango que coincida
      const rangeId = priceRanges.find(r => {
        const [rMin, rMax] = r.id.split('-').map(Number);
        return rMin === min && rMax === max;
      })?.id;
      
      if (rangeId) {
        setRangeString(rangeId);
      }
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

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    if (categoriesData.length > 0) {
      // No cargar hasta que tengamos las categorías
      fetchProducts(buildFilterParams());
      
      // Actualizar URL con filtros
      updateSearchParams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts, buildFilterParams, categoriesData.length]);

  // Cerrar dropdown al hacer clic fuera o al hacer scroll
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    const handleScroll = () => {
      setDropdownOpen(false);
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dropdownOpen]);

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

  // Manejar cambio de categoría
  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Manejar cambio de rango de precio
  const handlePriceRangeChange = (range: { min: number; max: number }) => {
    // Si el mismo rango ya está seleccionado, deseleccionarlo
    if (selectedPriceRange && selectedPriceRange.min === range.min && selectedPriceRange.max === range.max) {
      setSelectedPriceRange(null);
      setRangeString(null);
    } else {
      setSelectedPriceRange(range);
      
      // Convertir a la forma "min-max" para componentes de UI
      const rangeId = `${range.min}-${range.max}`;
      setRangeString(rangeId);
    }
    
    setCurrentPage(1); // Resetear a la primera página
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setDropdownOpen(false);
    setCurrentPage(1); // Resetear a la primera página
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

  // Alternar filtro de descuentos
  const toggleDiscountedProducts = () => {
    setShowingDiscounted(!showingDiscounted);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Resetear todos los filtros
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setRangeString(null);
    setSortBy('featured');
    setSearchTerm('');
    setShowingDiscounted(false);
    setCurrentPage(1);
  };

  // Alternar panel de filtros en móvil
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Alternar dropdown de ordenamiento
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Eliminar una categoría seleccionada
  const removeCategory = (categoryToRemove: string) => {
    const newCategories = selectedCategories.filter(cat => cat !== categoryToRemove);
    handleCategoryChange(newCategories);
  };
  
  // Cambiar página en la paginación
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Productos</h1>
      
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
          <button type="submit" className="absolute right-3 top-3 text-gray-400 hover:text-primary-600">
            <Search size={20} />
          </button>
        </form>
      </div>
      
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
          <CategoriesProduct categories={categoryOptions} />
        ) : (
          <div className="p-4 bg-gray-50 text-gray-500 rounded-lg text-center">
            No hay categorías disponibles
          </div>
        )}
      </section>
      
      {/* Filter and Sort Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-0">
          {/* Mobile Filter Toggle */}
          <button
            onClick={toggleFilters}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
          >
            <Filter size={16} />
            Filtros
          </button>
          
          {/* Selected Filters */}
          {selectedCategories.map(cat => (
            <div key={cat} className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              {cat}
              <button onClick={() => removeCategory(cat)} className="ml-1">
                <X size={14} />
              </button>
            </div>
          ))}
          
          {selectedPriceRange && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              {selectedPriceRange.max === 999999 
                ? `Más de $${selectedPriceRange.min}`
                : `$${selectedPriceRange.min} - $${selectedPriceRange.max}`}
              <button onClick={() => {
                setSelectedPriceRange(null);
                setRangeString(null);
              }} className="ml-1">
                <X size={14} />
              </button>
            </div>
          )}
          
          {showingDiscounted && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              Con descuento
              <button onClick={toggleDiscountedProducts} className="ml-1">
                <X size={14} />
              </button>
            </div>
          )}
          
          {(selectedCategories.length > 0 || selectedPriceRange || showingDiscounted) && (
            <button 
              onClick={resetFilters}
              className="text-gray-500 hover:text-primary-600 text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleDropdown}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer"
          >
            <span>Ordenar por: {sortOptions.find(option => option.id === sortBy)?.label}</span>
            <ChevronDown size={16} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSortChange(option.id)}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {sortBy === option.id && <Check size={16} className="text-primary-600" />}
                    <span className={sortBy === option.id ? "text-primary-600 font-medium" : ""}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden md:block w-72 flex-shrink-0">
          <ProductFilters 
            categories={categoriesData.map(cat => cat.name)}
            priceRange={{ min: 0, max: 2000 }}
            selectedCategories={selectedCategories}
            selectedPriceRange={selectedPriceRange}
            selectedDiscount={showingDiscounted}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onRatingChange={(rating) => {
              // Implementar cuando la API lo soporte
              console.log(`Rating filter changed: ${rating}`);
            }}
            onDiscountChange={(discount) => {
              setShowingDiscounted(discount > 0);
            }}
            onClearFilters={resetFilters}
          />
        </div>
        
        {/* Mobile Filters */}
        {showFilters && (
          <div className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40 flex items-end">
            <div className="bg-white w-full rounded-t-xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Filtros</h3>
                <button onClick={toggleFilters} className="text-gray-500">
                  <X size={24} />
                </button>
              </div>
              
              {/* Categorías en móvil */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Categorías</h4>
                <div className="space-y-3">
                  {categoriesData.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.name)}
                        onChange={() => {
                          if (selectedCategories.includes(category.name)) {
                            handleCategoryChange(selectedCategories.filter(c => c !== category.name));
                          } else {
                            handleCategoryChange([...selectedCategories, category.name]);
                          }
                        }}
                        className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Rango de Precio</h4>
                <div className="space-y-3">
                  {priceRanges.map((range) => (
                    <label key={range.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rangeString === range.id}
                        onChange={() => {
                          const [min, max] = range.id.split('-').map(Number);
                          handlePriceRangeChange({
                            min,
                            max
                          });
                        }}
                        className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                      />
                      <span className="text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Discounted Products Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showingDiscounted}
                    onChange={toggleDiscountedProducts}
                    className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5"
                  />
                  <span className="text-gray-700">Productos con descuento</span>
                </label>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={resetFilters}
                  className="flex-1 py-2 border border-gray-300 rounded-lg"
                >
                  Limpiar
                </button>
                <button 
                  onClick={toggleFilters}
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Products Grid */}
        <div className="flex-1">
          {productsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : productsError ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">Error al cargar productos: {productsError}</p>
              <button 
                onClick={() => fetchProducts({ limit: appConfig.pagination.defaultPageSize, offset: 0 })}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          ) : productsData.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {selectedCategories.length > 0 
                  ? selectedCategories.join(', ') 
                  : "Todos los productos"}
              </h2>
              
              {/* Productos encontrados y paginación info */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Mostrando {(currentPage - 1) * (productsMeta?.limit || 12) + 1}-
                  {Math.min(currentPage * (productsMeta?.limit || 12), productsMeta?.total || 0)} de {productsMeta?.total || 0} productos
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productsData.map(product => (
                  <ProductCardCompact 
                    key={product.id}
                    id={product.id || 0}
                    name={product.name}
                    price={product.price}
                    discount={product.discountPercentage}
                    rating={product.ratingAvg || 0}
                    reviews={0} // La API no proporciona este dato directamente
                    image={getImageUrl(product.images && product.images.length > 0 ? product.images[0] : undefined)}
                    category={categoriesData.find(cat => cat.id === product.categoryId)?.name}
                    isNew={new Date(product.createdAt || '').getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000)}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {productsMeta && productsMeta.total > productsMeta.limit && (
                <div className="flex justify-center mt-8">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Anterior
                    </button>
                    
                    {/* Botones de página */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Lógica para calcular qué páginas mostrar
                      let pageNum = i + 1;
                      
                      if (totalPages > 5) {
                        if (currentPage <= 3) {
                          // Al principio: mostrar páginas 1-5
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // Al final: mostrar las últimas 5 páginas
                          pageNum = totalPages - 4 + i;
                        } else {
                          // En medio: mostrar actual -2, -1, actual, +1, +2
                          pageNum = currentPage - 2 + i;
                        }
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                            currentPage === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No se encontraron productos</h3>
              <p className="text-gray-600 mb-4">
                No hay productos que coincidan con los filtros actuales.
              </p>
              <button 
                onClick={resetFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;