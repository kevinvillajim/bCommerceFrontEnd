// src/utils/unifiedImageUtils.ts
import environment from "../config/environment";

/**
 * Configuración global para imágenes
 */
const IMAGE_CONFIG = {
  placeholder: "https://via.placeholder.com/300x300/e0e0e0/666666?text=Sin+imagen2",
  defaultProduct: "/images/default-product.jpg"
};

/**
 * Obtiene la URL base de la API dinámicamente
 * Evita dependencias de process.env para compatibilidad con navegadores
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
export function getImageUrl(imagePath?: string | null): string {
  // Caso 1: Sin imagen - retornar placeholder
  if (!imagePath || imagePath.trim() === '') {
    return IMAGE_CONFIG.placeholder;
  }

  const path = imagePath.trim();

  // Caso 2: URL completa (http/https) - retornar tal como está
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Caso 3: Usar configuración de environment si está disponible
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

  // Caso 4: Fallback usando detección automática de API base
  const apiBaseUrl = getApiBaseUrl();
  
  // Si comienza con 'products/', construir URL de storage
  if (path.startsWith('products/')) {
    return `${apiBaseUrl}/storage/${path}`;
  }

  // Si comienza con 'storage/', construir la URL
  if (path.startsWith('storage/')) {
    return `${apiBaseUrl}/${path}`;
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
export function getProductMainImage(product: any): string {
  if (!product) {
    return getImageUrl(null);
  }

  // Prioridad 1: main_image desde la API
  if (product.main_image) {
    return getImageUrl(product.main_image);
  }

  // Prioridad 2: image (singular) desde la API
  if (product.image) {
    return getImageUrl(product.image);
  }

  // Prioridad 3: primer elemento del array images
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    
    // Si es un string, usarlo directamente
    if (typeof firstImage === 'string') {
      return getImageUrl(firstImage);
    }
    
    // Si es un objeto, extraer la URL apropiada
    if (typeof firstImage === 'object' && firstImage !== null) {
      const imageUrl = firstImage.original || 
                     firstImage.large || 
                     firstImage.medium || 
                     firstImage.thumbnail || 
                     '';
      return getImageUrl(imageUrl);
    }
  }

  // Fallback: imagen por defecto
  return getImageUrl(null);
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
    const img = new Image();
    
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
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
 * Hook de React para manejar carga de imágenes con estado
 * Solo disponible en entornos React
 */
export function useImageLoader(initialSrc: string) {
  // Verificar si React está disponible
  if (typeof window === 'undefined' || !(window as any).React) {
    return {
      src: getImageUrl(initialSrc),
      isLoading: false,
      hasError: false,
      loadImage: () => {}
    };
  }

  const React = (window as any).React;
  const [src, setSrc] = React.useState(getImageUrl(initialSrc));
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const loadImage = React.useCallback((newSrc: string) => {
    setIsLoading(true);
    setHasError(false);
    
    validateImageUrl(getImageUrl(newSrc)).then(isValid => {
      if (isValid) {
        setSrc(getImageUrl(newSrc));
      } else {
        setSrc(getImageUrl(null));
        setHasError(true);
      }
      setIsLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (initialSrc) {
      loadImage(initialSrc);
    }
  }, [initialSrc, loadImage]);

  return { src, isLoading, hasError, loadImage };
}

// Exportar como objeto para facilitar imports
export const ImageUtils = {
  getImageUrl,
  getDefaultImageUrl,
  getProductMainImage,
  getProductImages,
  validateImageUrl,
  useImageLoader
};

// Export por defecto para compatibilidad
export default ImageUtils;