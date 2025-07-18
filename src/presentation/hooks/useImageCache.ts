import {useCallback} from "react";
import {getImageUrl} from "../../utils/imageManager";

/**
 * Hook optimizado para gestión de imágenes con cache
 * Evita recálculos innecesarios de URLs de imagen
 */

interface ImageCacheEntry {
	url: string;
	timestamp: number;
}

// Cache simple en memoria para URLs de imagen
const imageUrlCache = new Map<string, ImageCacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Limpia entradas expiradas del cache
 */
const cleanExpiredCache = (): void => {
	const now = Date.now();
	const keysToDelete: string[] = [];

	imageUrlCache.forEach((entry, key) => {
		if (now - entry.timestamp > CACHE_DURATION) {
			keysToDelete.push(key);
		}
	});

	keysToDelete.forEach((key) => imageUrlCache.delete(key));
};

/**
 * Interfaz para producto con imágenes
 */
interface ProductWithImages {
	image?: string;
	main_image?: string;
	images?: Array<
		| string
		| {
				original?: string;
				medium?: string;
				thumbnail?: string;
				large?: string;
				url?: string;
				path?: string;
				src?: string;
		  }
	>;
	featured_image?: string;
	thumbnail?: string;
}

export const useImageCache = () => {
	/**
	 * Obtiene la URL optimizada de imagen con cache
	 */
	const getOptimizedImageUrl = useCallback(
		(
			product: ProductWithImages | null | undefined,
			priority: "thumbnail" | "medium" | "original" = "medium"
		): string => {
			if (!product) return getImageUrl("");

			// Crear clave de cache basada en el producto y prioridad
			const cacheKey = `${JSON.stringify(product)}_${priority}`;

			// Verificar cache
			const cached = imageUrlCache.get(cacheKey);
			if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
				return cached.url;
			}

			let imagePath = "";

			// Estrategia basada en prioridad
			if (priority === "thumbnail") {
				// Para thumbnails: priorizar imágenes pequeñas
				if (product.thumbnail) {
					imagePath = product.thumbnail;
				} else if (product.image) {
					imagePath = product.image;
				} else if (
					product.images &&
					Array.isArray(product.images) &&
					product.images.length > 0
				) {
					const firstImage = product.images[0];
					if (typeof firstImage === "string") {
						imagePath = firstImage;
					} else if (typeof firstImage === "object" && firstImage !== null) {
						imagePath =
							firstImage.thumbnail ||
							firstImage.medium ||
							firstImage.original ||
							"";
					}
				}
			} else if (priority === "original") {
				// Para imágenes originales: priorizar calidad
				if (
					product.images &&
					Array.isArray(product.images) &&
					product.images.length > 0
				) {
					const firstImage = product.images[0];
					if (typeof firstImage === "string") {
						imagePath = firstImage;
					} else if (typeof firstImage === "object" && firstImage !== null) {
						imagePath =
							firstImage.original ||
							firstImage.large ||
							firstImage.medium ||
							"";
					}
				} else if (product.image) {
					imagePath = product.image;
				} else if (product.main_image) {
					imagePath = product.main_image;
				}
			} else {
				// Para medium (default): balance entre calidad y tamaño
				if (product.image) {
					imagePath = product.image;
				} else if (product.main_image) {
					imagePath = product.main_image;
				} else if (
					product.images &&
					Array.isArray(product.images) &&
					product.images.length > 0
				) {
					const firstImage = product.images[0];
					if (typeof firstImage === "string") {
						imagePath = firstImage;
					} else if (typeof firstImage === "object" && firstImage !== null) {
						imagePath =
							firstImage.original ||
							firstImage.large ||
							firstImage.medium ||
							"";
					}
				} else if (product.featured_image) {
					imagePath = product.featured_image;
				} else if (product.thumbnail) {
					imagePath = product.thumbnail;
				}
			}

			const finalUrl = getImageUrl(imagePath);

			// Guardar en cache
			imageUrlCache.set(cacheKey, {
				url: finalUrl,
				timestamp: Date.now(),
			});

			// Limpiar cache expirado ocasionalmente
			if (imageUrlCache.size > 100) {
				cleanExpiredCache();
			}

			return finalUrl;
		},
		[]
	);

	/**
	 * Hook para obtener múltiples URLs de imagen optimizadas
	 */
	const getMultipleImageUrls = useCallback(
		(
			products: ProductWithImages[],
			priority: "thumbnail" | "medium" | "original" = "medium"
		): string[] => {
			return products.map((product) => getOptimizedImageUrl(product, priority));
		},
		[getOptimizedImageUrl]
	);

	/**
	 * Hook para precargar imágenes
	 */
	const preloadImages = useCallback((urls: string[]): Promise<void[]> => {
		const loadPromises = urls.map((url) => {
			return new Promise<void>((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve();
				img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
				img.src = url;
			});
		});

		return Promise.all(loadPromises);
	}, []);

	/**
	 * Estadísticas del cache
	 */
	const getCacheStats = useCallback(() => {
		const now = Date.now();
		let activeEntries = 0;
		let expiredEntries = 0;

		imageUrlCache.forEach((entry) => {
			if (now - entry.timestamp < CACHE_DURATION) {
				activeEntries++;
			} else {
				expiredEntries++;
			}
		});

		return {
			total: imageUrlCache.size,
			active: activeEntries,
			expired: expiredEntries,
			cacheDuration: CACHE_DURATION,
		};
	}, []);

	/**
	 * Limpiar todo el cache
	 */
	const clearImageCache = useCallback(() => {
		imageUrlCache.clear();
	}, []);

	return {
		getOptimizedImageUrl,
		getMultipleImageUrls,
		preloadImages,
		getCacheStats,
		clearImageCache,
	};
};
