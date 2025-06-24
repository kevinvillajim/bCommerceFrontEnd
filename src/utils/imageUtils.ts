// src/utils/imageUtils.ts
import environment from "../config/environment";

/**
 * Convierte una ruta relativa de imagen a URL completa usando la configuración de entorno
 * @param imagePath Ruta relativa de la imagen o URL completa
 * @returns URL completa de la imagen
 */
export const getImageUrl = (imagePath?: string): string => {
	if (!imagePath) return "https://via.placeholder.com/300x300/e0e0e0/666666?text=Sin+imagen";

	// Si ya es una URL completa (comienza con http o https)
	if (imagePath.startsWith("http")) return imagePath;

	// Normalizar la ruta
	let normalizedPath = imagePath;

	// Eliminar /storage/ si ya está incluido en el path para evitar duplicación
	if (normalizedPath.startsWith("/storage/")) {
		normalizedPath = normalizedPath.substring(9);
	} else if (normalizedPath.startsWith("storage/")) {
		normalizedPath = normalizedPath.substring(8);
	}

	// Combinar la URL base de imágenes desde la configuración con la ruta normalizada
	return `${environment.imageBaseUrl}${normalizedPath}`;
};

/**
 * Función auxiliar para obtener imagen de producto
 * Maneja diferentes estructuras de datos de imagen
 */
export const getProductImage = (product: any): string => {
	// Prioridad 1: main_image
	if (product?.main_image) {
		return getImageUrl(product.main_image);
	}

	// Prioridad 2: image (singular)
	if (product?.image) {
		return getImageUrl(product.image);
	}

	// Prioridad 3: primer elemento de images array
	if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
		const firstImage = product.images[0];
		
		if (typeof firstImage === 'string') {
			return getImageUrl(firstImage);
		}
		
		if (typeof firstImage === 'object' && firstImage !== null) {
			const imageUrl = firstImage.original || 
						   firstImage.large || 
						   firstImage.medium || 
						   firstImage.thumbnail || 
						   '';
			return getImageUrl(imageUrl);
		}
	}

	// Fallback: placeholder
	return getImageUrl(undefined);
};