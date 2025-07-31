import React, { useState, useEffect, useRef } from 'react';
import { Star, User, AlertCircle } from 'lucide-react';
import { useRatings } from '../../hooks/useRatings';

// Usamos la interfaz Rating del servicio real
interface Rating {
  id?: number;
  rating: number;
  title?: string;
  comment?: string;
  user_id: number;
  product_id?: number;
  seller_id?: number;
  order_id: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  seller_response?: {
    id: number;
    text: string;
    created_at: string;
  };
  is_verified_purchase: boolean;
}

interface ProductReviewsProps {
  productId: number;
  rating: number;
  ratingCount: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  rating,
  ratingCount,
}) => {
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNoReviews, setHasNoReviews] = useState(false);
  
  // Ref para evitar llamadas múltiples
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { getProductRatings } = useRatings();

  // Función para cargar reseñas sin useCallback para evitar dependencias problemáticas
  const loadReviews = async (page: number = currentPage) => {
    // Evitar llamadas múltiples
    if (isLoadingRef.current || !productId) {
      console.log('🚫 Evitando llamada múltiple o productId inválido');
      return;
    }

    // Cancelar llamada anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    
    console.log(`🔄 Cargando reseñas del producto ${productId}, página ${page}`);
    
    try {
      setIsLoading(true);
      setError(null);
      isLoadingRef.current = true;
      
      const response = await getProductRatings(productId, page, 5);
      console.log(`📊 Respuesta completa de la API:`, response);
      
      if (response && response.data) {
        console.log(`📄 Contenido de response.data:`, response.data);
        console.log(`🧩 Tipo de response.data:`, typeof response.data, Array.isArray(response.data));
        
        // Verificar si response.data es un array directamente
        if (Array.isArray(response.data)) {
          console.log(`✅ response.data es un array con ${response.data.length} elementos`);
          if (response.data.length === 0) {
            setHasNoReviews(true);
            setReviews([]);
          } else {
            setReviews(response.data);
            setHasNoReviews(false);
          }
        } 
        // Verificar si response.data es un objeto con propiedades
        else if (typeof response.data === 'object' && response.data !== null) {
          console.log(`📝 response.data es un objeto, propiedades:`, Object.keys(response.data));
          
          // Verificar si tiene un array de ratings dentro
          if ((response.data as any).ratings && Array.isArray((response.data as any).ratings)) {
            console.log(`✅ Encontrado response.data.ratings con ${(response.data as any).ratings.length} elementos`);
            if ((response.data as any).ratings.length === 0) {
              setHasNoReviews(true);
              setReviews([]);
            } else {
              setReviews((response.data as any).ratings);
              setHasNoReviews(false);
            }
          }
          // Verificar si el objeto mismo es el array de datos
          else if ((response.data as any).data && Array.isArray((response.data as any).data)) {
            console.log(`✅ Encontrado response.data.data con ${(response.data as any).data.length} elementos`);
            if ((response.data as any).data.length === 0) {
              setHasNoReviews(true);
              setReviews([]);
            } else {
              setReviews((response.data as any).data);
              setHasNoReviews(false);
            }
          }
          else {
            console.warn(`⚠️ Estructura de objeto no reconocida en response.data`);
            setReviews([]);
            setHasNoReviews(true);
          }
        }
        else {
          console.warn(`⚠️ response.data no es ni array ni objeto:`, response.data);
          setReviews([]);
          setHasNoReviews(true);
        }
        
        // Manejar meta información para paginación
        const totalItems = response.meta?.total || (response.data as any)?.total || 0;
        setTotalPages(Math.ceil(totalItems / 5));
        console.log(`📈 Total items: ${totalItems}, Total pages: ${Math.ceil(totalItems / 5)}`);
      } else {
        console.log(`❌ No hay response o response.data`);
        setReviews([]);
        setHasNoReviews(true);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('❌ Error cargando reseñas:', error);
      
      // Manejo específico de errores
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        setError('La carga de reseñas está tardando más de lo esperado. Inténtalo más tarde.');
      } else if (error?.response?.status === 404) {
        setHasNoReviews(true);
        setReviews([]);
        setError(null); // No mostrar error para 404, solo no hay reseñas
      } else if (error?.response?.status >= 500) {
        setError('Error del servidor. Inténtalo más tarde.');
      } else {
        setError('No se pudieron cargar las reseñas.');
      }
      
      setReviews([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
      abortControllerRef.current = null;
    }
  };

  // Effect para cargar reseñas iniciales
  useEffect(() => {
    if (productId) {
      console.log(`🎆 Producto cambiado a ${productId}, reseteando página a 1`);
      setCurrentPage(1); // Resetear página al cambiar producto
      setError(null);
      setHasNoReviews(false);
      loadReviews(1);
    }
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isLoadingRef.current = false;
    };
  }, [productId]); // Solo productId como dependencia

  // Effect separado para cambios de página (solo si no es página 1)
  useEffect(() => {
    if (currentPage > 1 && productId) {
      console.log(`📎 Cambiando a página ${currentPage}`);
      loadReviews(currentPage);
    }
  }, [currentPage]);

  // Función para renderizar estrellas
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-gray-300 border-t-primary-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Cargando reseñas...</p>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="max-w-3xl">
        {/* Resumen de valoraciones */}
        {rating > 0 && (
          <div className="flex items-center mb-6 p-6 bg-gray-50 rounded-lg">
            <div className="mr-6">
              <div className="text-4xl font-bold text-gray-900">
                {rating.toFixed(1)}
              </div>
              <div className="flex mt-2">
                {renderStars(rating)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {ratingCount > 0 ? `${ratingCount} valoración${ratingCount > 1 ? 'es' : ''}` : 'Sin valoraciones'}
              </div>
            </div>
            
            <div className="flex-grow text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Valoración promedio
              </h3>
              <p className="text-gray-600">
                Basado en {ratingCount} valoración{ratingCount !== 1 ? 'es' : ''} de clientes
              </p>
            </div>
          </div>
        )}

        {/* Error estado */}
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar reseñas
          </h3>
          <p className="text-gray-500 mb-4">
            {error}
          </p>
          <button
            onClick={() => loadReviews(currentPage)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Resumen de valoraciones */}
      {rating > 0 && (
        <div className="flex items-center mb-6 p-6 bg-gray-50 rounded-lg">
          <div className="mr-6">
            <div className="text-4xl font-bold text-gray-900">
              {rating.toFixed(1)}
            </div>
            <div className="flex mt-2">
              {renderStars(rating)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {ratingCount > 0 ? `${ratingCount} valoración${ratingCount > 1 ? 'es' : ''}` : 'Sin valoraciones'}
            </div>
          </div>
          
          <div className="flex-grow text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Valoración promedio
            </h3>
            <p className="text-gray-600">
              Basado en {ratingCount} valoración{ratingCount !== 1 ? 'es' : ''} de clientes
            </p>
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={review.id || index} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                {/* Avatar del usuario */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary-600" />
                  </div>
                </div>

                {/* Contenido de la reseña */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                      {review.user?.name || 'Usuario anónimo'}
                      </p>
                      <div className="flex items-center mt-1">
                      {renderStars(review.rating)}
                       <span className="ml-2 text-sm text-gray-500">
												{formatDate(review.created_at)}
											</span>
										</div>
                    </div>
                  </div>

                  {/* Título de la reseña */}
                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-2">
                      {review.title}
                    </h4>
                  )}

                  {/* Comentario */}
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {/* Respuesta del vendedor */}
                  {review.seller_response && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Respuesta del vendedor
                        </span>
                        <span className="ml-2 text-xs text-blue-600">
                          {formatDate(review.seller_response.created_at)}
                        </span>
                      </div>
                      <p className="text-blue-800 text-sm">
                        {review.seller_response.text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Estado vacío - Sin reseñas disponibles */
        <div className="text-center py-12">
          <div className="text-yellow-400 mb-4">
            <Star size={48} className="mx-auto fill-current" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {hasNoReviews ? 'No hay reseñas disponibles' : 'Sin reseñas aún'}
          </h3>
          <p className="text-gray-500">
            {hasNoReviews 
              ? 'Este producto aún no tiene reseñas de clientes' 
              : 'Sé el primero en valorar este producto'
            }
          </p>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(prev => prev - 1);
              }
            }}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          <span className="px-4 py-2 text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
              }
            }}
            disabled={currentPage === totalPages || isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;