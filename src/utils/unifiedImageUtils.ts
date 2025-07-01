// src/utils/unifiedImageUtils.ts - VERSIÓN CORREGIDA
import environment from "../config/environment";

/**
 * Placeholder como Data URI (imagen SVG embebida) - No requiere conexión externa
 */
const PLACEHOLDER_DATA_URI = `data:image/svg+xml,${encodeURIComponent(`
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#e5e7eb"/>
  <text x="150" y="150" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy="0.3em">
    Sin imagen
  </text>
</svg>
`)}`;

/**
 * Placeholder pequeño para miniaturas
 */
const SMALL_PLACEHOLDER_DATA_URI = `data:image/svg+xml,${encodeURIComponent(`
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#f3f4f6"/>
  <text x="50" y="50" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle" dy="0.3em">
    Sin img
  </text>
</svg>
`)}`;

/**
 * Configuración global para imágenes
 */
const IMAGE_CONFIG = {
  placeholder: PLACEHOLDER_DATA_URI,
  smallPlaceholder: SMALL_PLACEHOLDER_DATA_URI,
  defaultProduct: "/images/default-product.jpg"
};

/**
 * Obtiene la URL base de la API dinámicamente
 */
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:8000'; // Fallback para SSR
  }

  const { protocol, hostname } = window.location;
  
  // En desarrollo local, usar puerto 8000 para Laravel
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:8000`;
  }
  
  // En producción, asumir mismo dominio
  return `${protocol}//${hostname}`;
}

/**
 * Función principal unificada para obtener URLs de imágenes
 * Esta es la ÚNICA función que debe usarse en toda la aplicación
 */
export function getImageUrl(imagePath?: string | null, useSmallPlaceholder: boolean = false): string {
  // Caso 1: Sin imagen - retornar placeholder
  if (!imagePath || imagePath.trim() === '') {
    return useSmallPlaceholder ? IMAGE_CONFIG.smallPlaceholder : IMAGE_CONFIG.placeholder;
  }

  const path = imagePath.trim();

  // Caso 2: URL completa (http/https) - retornar tal como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Caso 3: Data URI - retornar tal como está
  if (path.startsWith('data:')) {
    return path;
  }

  // Caso 4: Usar configuración de environment si está disponible
  if (environment?.imageBaseUrl) {
    // Eliminar /storage/ del inicio si ya está incluido para evitar duplicación
    let normalizedPath = path;
    if (normalizedPath.startsWith('/storage/')) {
      normalizedPath = normalizedPath.substring(9);
    } else if (normalizedPath.startsWith('storage/')) {
      normalizedPath = normalizedPath.substring(8);
    }
    
    return `${environment.imageBaseUrl}${normalizedPath}`;
  }

  // Caso 5: Fallback usando detección automática de API base
  const apiBaseUrl = getApiBaseUrl();
  
  // Si comienza con 'products/', construir URL de storage
  if (path.startsWith('products/')) {
    return `${apiBaseUrl}/storage/${path}`;
  }

  // Si comienza con 'storage/', construir la URL
  if (path.startsWith('storage/')) {
    return `${apiBaseUrl}/${path}`;
  }

  // Si comienza con '/', asumir que es una ruta absoluta
  if (path.startsWith('/')) {
    return `${apiBaseUrl}${path}`;
  }

  // Para cualquier otra ruta, asumir que es relativa al storage
  return `${apiBaseUrl}/storage/${path}`;
}

/**
 * Obtiene la URL de imagen por defecto del producto
 */
export function getDefaultImageUrl(): string {
  if (environment?.imageBaseUrl) {
    return `${environment.imageBaseUrl}${IMAGE_CONFIG.defaultProduct}`;
  }
  
  const apiBaseUrl = getApiBaseUrl();
  return `${apiBaseUrl}${IMAGE_CONFIG.defaultProduct}`;
}

/**
 * Extrae la imagen principal de un producto
 * Maneja diferentes estructuras de datos de imágenes
 */
export function getProductMainImage(product: any, useSmallPlaceholder: boolean = false): string {
  if (!product) {
    return getImageUrl(null, useSmallPlaceholder);
  }

  // Prioridad 1: main_image desde la API
  if (product.main_image) {
    return getImageUrl(product.main_image, useSmallPlaceholder);
  }

  // Prioridad 2: image (singular) desde la API
  if (product.image) {
    return getImageUrl(product.image, useSmallPlaceholder);
  }

  // Prioridad 3: primer elemento del array images
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    
    // Si es un string, usarlo directamente
    if (typeof firstImage === 'string') {
      return getImageUrl(firstImage, useSmallPlaceholder);
    }
    
    // Si es un objeto, extraer la URL apropiada
    if (typeof firstImage === 'object' && firstImage !== null) {
      const imageUrl = firstImage.original || 
                     firstImage.large || 
                     firstImage.medium || 
                     firstImage.thumbnail || 
                     '';
      return getImageUrl(imageUrl, useSmallPlaceholder);
    }
  }

  // Fallback: placeholder
  return getImageUrl(null, useSmallPlaceholder);
}

/**
 * Obtiene todas las imágenes de un producto como array
 */
export function getProductImages(product: any): string[] {
  const images: string[] = [];

  if (product?.images && Array.isArray(product.images)) {
    for (const image of product.images) {
      if (typeof image === 'string') {
        images.push(getImageUrl(image));
      } else if (typeof image === 'object' && image !== null) {
        const imageUrl = image.original || 
                        image.large || 
                        image.medium || 
                        image.thumbnail || 
                        '';
        if (imageUrl) {
          images.push(getImageUrl(imageUrl));
        }
      }
    }
  }

  // Si no hay imágenes, agregar la imagen principal o placeholder
  if (images.length === 0) {
    images.push(getProductMainImage(product));
  }

  return images;
}

/**
 * Valida si una URL de imagen es válida (puede cargarse)
 */
export function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Si es un data URI, considerarlo válido
    if (url.startsWith('data:')) {
      resolve(true);
      return;
    }

    const img = new Image();
    
    // Timeout después de 3 segundos
    const timeout = setTimeout(() => {
      resolve(false);
    }, 3000);
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * Componente de imagen con fallback mejorado
 */
export interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  useSmallPlaceholder?: boolean;
  onError?: (error: Event) => void;
  [key: string]: any;
}

export function createImageWithFallback(React: any) {
  return function ImageWithFallback({ 
    src, 
    alt, 
    className = '',
    fallbackSrc,
    useSmallPlaceholder = false,
    onError,
    ...props 
  }: ImageWithFallbackProps) {
    const [imageSrc, setImageSrc] = React.useState(getImageUrl(src, useSmallPlaceholder));
    const [hasError, setHasError] = React.useState(false);
    const [errorCount, setErrorCount] = React.useState(0);

    React.useEffect(() => {
      setImageSrc(getImageUrl(src, useSmallPlaceholder));
      setHasError(false);
      setErrorCount(0);
    }, [src, useSmallPlaceholder]);

    const handleError = React.useCallback((error: Event) => {
      console.warn('Error cargando imagen:', imageSrc);
      
      if (onError) {
        onError(error);
      }

      // Evitar loops infinitos de error
      if (errorCount >= 2) {
        console.warn('Demasiados errores de imagen, usando placeholder final');
        return;
      }

      setErrorCount((prev: number) => prev + 1);

      if (!hasError) {
        setHasError(true);
        
        // Intentar con fallback personalizado primero
        if (fallbackSrc && errorCount === 0) {
          setImageSrc(getImageUrl(fallbackSrc, useSmallPlaceholder));
        } else {
          // Usar placeholder como último recurso
          setImageSrc(getImageUrl(null, useSmallPlaceholder));
        }
      }
    }, [imageSrc, hasError, fallbackSrc, useSmallPlaceholder, errorCount, onError]);

    
  };
}

/**
 * Hook de React para manejar carga de imágenes con estado
 */
export function useImageLoader(initialSrc: string, useSmallPlaceholder: boolean = false) {
  // Verificar si React está disponible
  if (typeof window === 'undefined' || !(window as any).React) {
    return {
      src: getImageUrl(initialSrc, useSmallPlaceholder),
      isLoading: false,
      hasError: false,
      loadImage: () => {}
    };
  }

  const React = (window as any).React;
  const [src, setSrc] = React.useState(getImageUrl(initialSrc, useSmallPlaceholder));
  const [isLoading, setIsLoading] = React.useState(Boolean(initialSrc));
  const [hasError, setHasError] = React.useState(false);

  const loadImage = React.useCallback((newSrc: string) => {
    const imageUrl = getImageUrl(newSrc, useSmallPlaceholder);
    
    // Si es un data URI, no necesita validación
    if (imageUrl.startsWith('data:')) {
      setSrc(imageUrl);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    
    validateImageUrl(imageUrl).then(isValid => {
      if (isValid) {
        setSrc(imageUrl);
      } else {
        setSrc(getImageUrl(null, useSmallPlaceholder));
        setHasError(true);
      }
      setIsLoading(false);
    });
  }, [useSmallPlaceholder]);

  React.useEffect(() => {
    if (initialSrc) {
      loadImage(initialSrc);
    } else {
      setSrc(getImageUrl(null, useSmallPlaceholder));
      setIsLoading(false);
    }
  }, [initialSrc, loadImage, useSmallPlaceholder]);

  return { src, isLoading, hasError, loadImage };
}

// Exportar como objeto para facilitar imports
export const ImageUtils = {
  getImageUrl,
  getDefaultImageUrl,
  getProductMainImage,
  getProductImages,
  validateImageUrl,
  useImageLoader,
  createImageWithFallback
};

// Export por defecto para compatibilidad
export default ImageUtils;