import { useState, useEffect } from 'react';
import { ProductService } from '../../core/services/ProductService';
import { transformProductsForCarousel, type ProductCarouselType } from '../../utils/productTransformer';
import type { Product } from '../../core/domain/entities/Product';

interface UseHomeProductsReturn {
  personalizedProducts: ProductCarouselType[];
  trendingProducts: ProductCarouselType[];
  featuredProducts: Product[]; // 🔧 Cambio: Usar Product[] para compatibilidad con ProductCards
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isAuthenticated: boolean;
}

/**
 * Hook para obtener productos del HomePage - OPTIMIZADO CON NUEVOS ENDPOINTS
 * Cada recarga = productos diferentes para featured/trending, consistentes para personalizados
 */
export const useHomeProducts = (limit = 12): UseHomeProductsReturn => {
  const [personalizedProducts, setPersonalizedProducts] = useState<ProductCarouselType[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProductCarouselType[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación
  const checkAuthentication = (): boolean => {
    const token = localStorage.getItem('auth_token');
    const isAuth = !!token && token.trim() !== '';
    setIsAuthenticated(isAuth);
    return isAuth;
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const userIsAuthenticated = checkAuthentication();
      console.log('🏠 useHomeProducts: Cargando productos optimizados...', {
        isAuthenticated: userIsAuthenticated,
        limit
      });

      // SIEMPRE obtener productos featured aleatorios (ProductCards) - usando ProductService directo
      const featuredPromise = ProductService.getFeaturedRandom(6);

      if (userIsAuthenticated) {
        // 🔐 USUARIO AUTENTICADO
        console.log('🔐 Usuario autenticado - personalizados + trending');
        
        const [personalizedResult, trendingResult, featuredResult] = await Promise.allSettled([
          ProductService.getPersonalizedProducts(limit), // 🆕 Recomendaciones personalizadas
          ProductService.getTrendingAndOffers(limit),     // 🆕 Trending and offers
          featuredPromise                                 // Featured products
        ]);

        // Procesar recomendaciones personalizadas
        if (personalizedResult.status === 'fulfilled' && personalizedResult.value.data) {
          const transformedPersonalized = transformProductsForCarousel(personalizedResult.value.data);
          setPersonalizedProducts(transformedPersonalized);
          console.log('✅ Recomendaciones personalizadas:', transformedPersonalized.length);
        } else {
          // Fallback: usar trending-offers
          console.log('⚠️ Fallback a trending para personalizadas');
          const fallback = await ProductService.getTrendingAndOffers(limit);
          const transformedFallback = transformProductsForCarousel(fallback.data || []);
          setPersonalizedProducts(transformedFallback);
        }

        // Procesar trending and offers
        if (trendingResult.status === 'fulfilled' && trendingResult.value.data) {
          const transformedTrending = transformProductsForCarousel(trendingResult.value.data);
          setTrendingProducts(transformedTrending);
          console.log('✅ Trending and offers:', transformedTrending.length);
        } else {
          console.log('⚠️ Fallback a discounted para trending');
          const fallback = await ProductService.getDiscountedProducts(limit);
          const transformedFallback = transformProductsForCarousel(fallback.data || []);
          setTrendingProducts(transformedFallback);
        }

        // Procesar featured
        if (featuredResult.status === 'fulfilled' && featuredResult.value.data) {
          setFeaturedProducts(featuredResult.value.data); // 🔧 Usar Product[] directamente
          console.log('✅ Featured products:', featuredResult.value.data.length);
        } else {
          setFeaturedProducts([]);
          console.log('⚠️ No featured products available');
        }

      } else {
        // 🌍 USUARIO NO AUTENTICADO
        console.log('🌍 Usuario no autenticado - 2 consultas trending + featured');
        
        const [firstTrendingResult, secondTrendingResult, featuredResult] = await Promise.allSettled([
          ProductService.getTrendingAndOffers(limit), // Para primer carrusel
          ProductService.getTrendingAndOffers(limit), // Para segundo carrusel (diferente consulta = diferentes productos)
          featuredPromise                             // Featured products
        ]);

        // Primer carrusel
        if (firstTrendingResult.status === 'fulfilled' && firstTrendingResult.value.data) {
          const transformedFirst = transformProductsForCarousel(firstTrendingResult.value.data);
          setPersonalizedProducts(transformedFirst);
          console.log('✅ Primer trending:', transformedFirst.length);
        } else {
          const fallback = await ProductService.getPopularProducts(limit);
          const transformedFallback = transformProductsForCarousel(fallback.data || []);
          setPersonalizedProducts(transformedFallback);
        }

        // Segundo carrusel
        if (secondTrendingResult.status === 'fulfilled' && secondTrendingResult.value.data) {
          const transformedSecond = transformProductsForCarousel(secondTrendingResult.value.data);
          setTrendingProducts(transformedSecond);
          console.log('✅ Segundo trending:', transformedSecond.length);
        } else {
          const fallback = await ProductService.getDiscountedProducts(limit);
          const transformedFallback = transformProductsForCarousel(fallback.data || []);
          setTrendingProducts(transformedFallback);
        }

        // Featured (igual para todos)
        if (featuredResult.status === 'fulfilled' && featuredResult.value.data) {
          setFeaturedProducts(featuredResult.value.data); // 🔧 Usar Product[] directamente
          console.log('✅ Featured products (no auth):', featuredResult.value.data.length);
        } else {
          setFeaturedProducts([]);
        }
      }

      console.log('🏠 useHomeProducts: Carga completada');
    } catch (err) {
      console.error('❌ useHomeProducts: Error general:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Fallback completo
      setPersonalizedProducts([]);
      setTrendingProducts([]);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [limit]);

  return {
    personalizedProducts,
    trendingProducts,
    featuredProducts,
    loading,
    error,
    refetch: fetchProducts,
    isAuthenticated
  };
};

export default useHomeProducts;
