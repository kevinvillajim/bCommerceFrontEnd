import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoriesProduct from '../components/product/CategoriesProduct';
import ProductFilters from '../components/product/ProductFilters';
import ProductCardCompact from '../components/product/ProductCardCompact';
import { Search, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { Smartphone, Tv, Laptop, Monitor, Headphones, Camera, Watch, Speaker } from 'lucide-react';

// Mock data for products (in a real app, this would come from an API)
const mockProducts = [
  {
    id: 1,
    name: "Auriculares inalámbricos",
    description: "Auriculares premium con cancelación de ruido y 30h de batería",
    price: 199.99,
    discount: 15, // 15% de descuento
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Auriculares"
  },
  {
    id: 2,
    name: "Smartwatch Pro",
    description: "Monitoriza tu estado físico, salud y mantente conectado con estilo",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Relojes"
  },
  {
    id: 3,
    name: "Cámara de acción 4K",
    description: "Captura tus aventuras en impresionante resolución 4K",
    price: 329.99,
    discount: 20, // 20% de descuento
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Cámaras"
  },
  {
    id: 4,
    name: "iWatch Ultra",
    description: "Alto rendimiento en un diseño elegante y ligero",
    price: 1099.99,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Relojes"
  },
  {
    id: 5,
    name: "Altavoz inteligente",
    description: "Altavoz con control por voz y calidad de audio premium",
    price: 129.99,
    discount: 10, // 10% de descuento
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Altavoces"
  },
  {
    id: 6,
    name: "Gafas inteligentes",
    description: "Gafas con bluetooth, musica in ear y sistema operativo android, manejable con los ojos",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Gadgets"
  },
  {
    id: 7,
    name: "Smartphone Galaxy S25",
    description: "El último smartphone con cámara de 108MP y pantalla AMOLED de 6.8 pulgadas",
    price: 1299.99,
    discount: 12,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Smartphones"
  },
  {
    id: 8,
    name: "Laptop Pro X",
    description: "Potente laptop con procesador de última generación y 32GB de RAM",
    price: 1899.99,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Laptops"
  },
  {
    id: 9,
    name: "Monitor UltraWide 34\"",
    description: "Monitor curvo ultrawide con resolución 4K y tecnología HDR",
    price: 599.99,
    discount: 8,
    image: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Monitores"
  },
  {
    id: 10,
    name: "TV OLED 65\"",
    description: "Televisor OLED de 65 pulgadas con tecnología de imagen avanzada",
    price: 2499.99,
    discount: 15,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "TVs"
  },
  {
    id: 11,
    name: "Auriculares Gaming",
    description: "Auriculares con micrófono de alta calidad y sonido envolvente 7.1",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Auriculares"
  },
  {
    id: 12,
    name: "Tablet Pro 12.9",
    description: "Tablet de 12.9 pulgadas con pantalla Retina y procesador potente",
    price: 1099.99,
    discount: 10,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    category: "Tablets"
  }
];

// Price ranges for filter
const priceRanges = [
  { id: '0-100', label: 'Menos de $100' },
  { id: '100-300', label: '$100 - $300' },
  { id: '300-500', label: '$300 - $500' },
  { id: '500-1000', label: '$500 - $1000' },
  { id: '1000+', label: 'Más de $1000' }
];

// Sort options
const sortOptions = [
  { id: 'featured', label: 'Destacados' },
  { id: 'price-asc', label: 'Precio: Menor a Mayor' },
  { id: 'price-desc', label: 'Precio: Mayor a Menor' },
  { id: 'name-asc', label: 'Nombre: A-Z' },
  { id: 'name-desc', label: 'Nombre: Z-A' },
  { id: 'discount', label: 'Mayores Descuentos' }
];

const ProductPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showingDiscounted, setShowingDiscounted] = useState(false);
  
  // Nuevo estado para controlar la apertura del dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Referencia para detectar clics fuera del dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Categories with icons
  const categories = [
    { id: 1, title: "Smartphones", icon: Smartphone, link: "/products?category=Smartphones" },
    { id: 2, title: "Laptops", icon: Laptop, link: "/products?category=Laptops" },
    { id: 3, title: "Monitores", icon: Monitor, link: "/products?category=Monitores" },
    { id: 4, title: "TVs", icon: Tv, link: "/products?category=TVs" },
    { id: 5, title: "Auriculares", icon: Headphones, link: "/products?category=Auriculares" },
    { id: 6, title: "Cámaras", icon: Camera, link: "/products?category=Cámaras" },
    { id: 7, title: "Relojes", icon: Watch, link: "/products?category=Relojes" },
    { id: 8, title: "Altavoces", icon: Speaker, link: "/products?category=Altavoces" }
  ];

  // Get initial category from URL if present
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories(categoryParam ? [categoryParam] : []);
    }
  }, [searchParams]);

  // Event listener para cerrar el dropdown al hacer click fuera
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    // Event listener para cerrar el dropdown al hacer scroll
    const handleScroll = () => {
      setDropdownOpen(false);
    };

    // Solo agregar los event listeners si el dropdown está abierto
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', handleScroll);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dropdownOpen]);

  // Apply filters
  useEffect(() => {
    let result = [...mockProducts];
    
    // Filter by category
    if (selectedCategories.length > 0) {
  result = result.filter(product => selectedCategories.includes(product.category));
}
    
    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (max === '+') {
        result = result.filter(product => product.price >= Number(min));
      } else {
        result = result.filter(
          product => product.price >= Number(min) && product.price <= Number(max)
        );
      }
    }
    
    // Filter by discounted products only
    if (showingDiscounted) {
      result = result.filter(product => product.discount);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(term) || 
          product.description.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'discount':
        result.sort((a, b) => {
          const discountA = a.discount || 0;
          const discountB = b.discount || 0;
          return discountB - discountA;
        });
        break;
      // featured is default, no sorting needed
    }
    
    setFilteredProducts(result);
  }, [selectedCategories, priceRange, sortBy, searchTerm, showingDiscounted]);

  // Handle filter changes
  const handleCategoryChange = (categories: string[]) => {
  setSelectedCategories(categories);
  
  // Actualizar URL si cambian las categorías
  if (categories.length === 1) {
    searchParams.set('category', categories[0]);
    setSearchParams(searchParams);
  } else if (categories.length === 0 && searchParams.has('category')) {
    searchParams.delete('category');
    setSearchParams(searchParams);
  }
};

  const handlePriceRangeChange = (range: string) => {
    setPriceRange(range === priceRange ? null : range);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setDropdownOpen(false); // Cerrar dropdown después de seleccionar
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality already triggered by useEffect
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleDiscountedProducts = () => {
    setShowingDiscounted(!showingDiscounted);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange(null);
    setSortBy('featured');
    setSearchTerm('');
    setShowingDiscounted(false);
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Toggle el dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const removeCategory = (categoryToRemove: string) => {
  const newCategories = selectedCategories.filter(cat => cat !== categoryToRemove);
  handleCategoryChange(newCategories);
};


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
        <CategoriesProduct categories={categories} />
      </section>
      
      {/* Filter and Sort Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-0">
          {/* Mobile Filter Toggle */}
          <button
            onClick={toggleFilters}
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
          >
            <SlidersHorizontal size={16} />
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
          
          {priceRange && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              {priceRanges.find(range => range.id === priceRange)?.label}
              <button onClick={() => setPriceRange(null)} className="ml-1">
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
          
          {(selectedCategories || priceRange || showingDiscounted) && (
            <button 
              onClick={resetFilters}
              className="text-gray-500 hover:text-primary-600 text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        
        {/* Sort Dropdown - Modificado para abrir con click en lugar de hover */}
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
    categories={["Smartphones", "Laptops", "Monitores", "TVs", "Auriculares", "Cámaras", "Relojes", "Altavoces"]}
    priceRange={{ min: 0, max: 2000 }}
    selectedCategories={selectedCategories} // Pasar las categorías seleccionadas al componente hijo
    onCategoryChange={(categories) => {
      // Modificación: Pasar todas las categorías seleccionadas, no solo la primera
      handleCategoryChange(categories);
    }}
    onPriceRangeChange={(range) => {
      // Handle price range change
      const priceRangeId = `${range.min}-${range.max === 2000 ? '+' : range.max}`;
      handlePriceRangeChange(priceRangeId);
    }}
    onRatingChange={(rating) => {
      // Handle rating change
      console.log(`Rating filter changed: ${rating}`);
    }}
    onDiscountChange={(discount) => {
      // Handle discount change
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
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Rango de Precio</h4>
                <div className="space-y-3">
                  {priceRanges.map((range) => (
                    <label key={range.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={priceRange === range.id}
                        onChange={() => handlePriceRangeChange(range.id)}
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
          {filteredProducts.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">
              {selectedCategories.length > 0 ? selectedCategories.join(', ') : "Todos los productos"}
                </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                      <ProductCardCompact 
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        discount={product.discount}
                        rating={4.5}
                        reviews={24}
                        image={product.image}
                        category={product.category}
                        isNew={product.id % 5 === 0} // Just for demo
                        onAddToCart={(id) => console.log(`Added product ${id} to cart`)}
                        onAddToWishlist={(id) => console.log(`Added product ${id} to wishlist`)}
                      />
                ))}
              </div>
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