/**
 * Helper simplificado para manejar URLs de imágenes de productos
 * Compatible con navegadores sin dependencias de process.env
 */

/**
 * Obtiene la URL base de la API de forma dinámica
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
   * Construye la URL completa de una imagen
   */
  export function getImageUrl(imagePath: string | undefined | null): string {
    // Si no hay ruta de imagen, retornar imagen por defecto
    if (!imagePath || imagePath.trim() === '') {
      return getDefaultImageUrl();
    }
  
    const path = imagePath.trim();
  
    // Si ya es una URL completa (http/https), devolverla tal como está
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
  
    const apiBaseUrl = getApiBaseUrl();
  
    // Si comienza con 'products/', es una imagen almacenada en storage
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
   * Obtiene la URL de la imagen por defecto
   */
  export function getDefaultImageUrl(): string {
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}/images/default-product.jpg`;
  }
  
  /**
   * Extrae la URL de imagen principal de un producto
   */
  export function getProductMainImage(product: any): string {
    // Prioridad 1: main_image desde la API
    if (product?.main_image) {
      return getImageUrl(product.main_image);
    }
  
    // Prioridad 2: primer elemento del array images
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      
      // Si es un string, usarlo directamente
      if (typeof firstImage === 'string') {
        return getImageUrl(firstImage);
      }
      
      // Si es un objeto, extraer la URL apropiada
      if (typeof firstImage === 'object' && firstImage !== null) {
        const imageUrl = firstImage.medium || 
                       firstImage.original || 
                       firstImage.large || 
                       firstImage.thumbnail || 
                       '';
        return getImageUrl(imageUrl);
      }
    }
  
    // Fallback: imagen por defecto
    return getDefaultImageUrl();
  }
  
  /**
   * Obtiene todas las imágenes de un producto
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
  
    // Si no hay imágenes, agregar la imagen por defecto
    if (images.length === 0) {
      images.push(getDefaultImageUrl());
    }
  
    return images;
  }
  
  /**
   * Valida si una URL de imagen es válida
   */
  export function validateImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Timeout después de 3 segundos
      setTimeout(() => resolve(false), 3000);
      
      img.src = url;
    });
  }
  
  /**
   * Componente de imagen con fallback automático
   */
  export function ImageWithFallback({ 
    src, 
    alt, 
    className = '',
    fallbackSrc,
    ...props 
  }: {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
    [key: string]: any;
  }) {
    const [imageSrc, setImageSrc] = React.useState(src);
    const [hasError, setHasError] = React.useState(false);
  
    React.useEffect(() => {
      setImageSrc(src);
      setHasError(false);
    }, [src]);
  
    const handleError = () => {
      if (!hasError) {
        setHasError(true);
        setImageSrc(fallbackSrc || getDefaultImageUrl());
      }
    };
  
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={handleError}
        {...props}
      />
    );
  }
  
  // Hook de React para el componente de imagen
  const React = typeof window !== 'undefined' ? (window as any).React : null;
  
  /**
   * Hook para manejar carga de imágenes con estado
   */
  export function useImageLoader(initialSrc: string) {
    const [src, setSrc] = React?.useState?.(initialSrc) || [initialSrc, () => {}];
    const [isLoading, setIsLoading] = React?.useState?.(true) || [true, () => {}];
    const [hasError, setHasError] = React?.useState?.(false) || [false, () => {}];
  
    const loadImage = React?.useCallback?.((newSrc: string) => {
      setIsLoading(true);
      setHasError(false);
      
      const img = new Image();
      img.onload = () => {
        setSrc(newSrc);
        setIsLoading(false);
      };
      img.onerror = () => {
        setSrc(getDefaultImageUrl());
        setIsLoading(false);
        setHasError(true);
      };
      img.src = newSrc;
    }, []) || (() => {});
  
    React?.useEffect?.(() => {
      if (initialSrc) {
        loadImage(initialSrc);
      }
    }, [initialSrc, loadImage]);
  
    return { src, isLoading, hasError, loadImage };
  }
  
  // Exportar funciones principales
  export const ImageHelper = {
    getImageUrl,
    getDefaultImageUrl,
    getProductMainImage,
    getProductImages,
    validateImageUrl
  };