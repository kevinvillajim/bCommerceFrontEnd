// src/utils/unifiedImageUtils.ts - URLs de imagen corregidas
import environment from "../config/environment";

/**
 * ✅ CONFIGURACIÓN CORREGIDA - Sin dependencias externas
 */
const IMAGE_CONFIG = {
	// ✅ PLACEHOLDER SVG EMBEBIDO - No requiere conexión externa
	placeholder:
		"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTAwQzEyNSA5MS43MTU3IDEzMS43MTYgODUgMTQwIDg1SDE2MEMxNjguMjg0IDg1IDE3NSA5MS43MTU3IDE3NSAxMDBWMTIwQzE3NSAxMjguMjg0IDE2OC4yODQgMTM1IDE2MCAxMzVIMTQwQzEzMS43MTYgMTM1IDEyNSAxMjguMjg0IDEyNSAxMjBWMTAwWiIgZmlsbD0iIzllYTNhOCIvPgo8cGF0aCBkPSJNOTAgMTcwTDEzMCAxMzBMMTcwIDIwMEgyMTBMMjEwIDIzMEg5MFYxNzBaIiBmaWxsPSIjOWVhM2E4Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmI3MjgwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+UHJvZHVjdG88L3RleHQ+Cjwvc3ZnPgo=",
	defaultProduct: "/images/default-product.jpg",
	noImage:
		"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjlmYWZiIiBzdHJva2U9IiNlNWU3ZWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iNSA1Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIyMCIgZmlsbD0iI2Q5ZjNlYSIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTYwIDEzMEw4MCA5MEwxMjAgMTQwTDE0MCAyMEwxODAgMTQwVjE3MEg2MFYxMzBaIiBmaWxsPSIjMTBiOTgxIiBmaWxsLW9wYWNpdHk9IjAuMyIvPgo8dGV4dCB4PSIxMDAiIHk9IjE5MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiPk5vIGltYWdlbjwvdGV4dD4KPHN2Zz4K",
};

/**
 * ✅ Obtiene la URL base de la API dinámicamente
 */
function getApiBaseUrl(): string {
	if (typeof window === "undefined") {
		return "http://127.0.0.1:8000"; // Fallback para SSR
	}

	const {protocol, hostname} = window.location;

	// En desarrollo local, usar puerto 8000 para Laravel
	if (hostname === "localhost" || hostname === "127.0.0.1") {
		return `${protocol}//${hostname}:8000`;
	}

	// En producción, asumir mismo dominio
	return `${protocol}//${hostname}`;
}

/**
 * ✅ FUNCIÓN PRINCIPAL - Obtener URLs de imágenes sin dependencias externas
 */
export function getImageUrl(imagePath?: string | null): string {
	// Caso 1: Sin imagen - retornar placeholder embebido
	if (!imagePath || imagePath.trim() === "") {
		return IMAGE_CONFIG.placeholder;
	}

	const path = imagePath.trim();

	// Caso 2: URL completa (http/https) - retornar tal como está
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}

	// Caso 3: Data URL - retornar directamente
	if (path.startsWith("data:")) {
		return path;
	}

	// Caso 4: Usar configuración de environment si está disponible
	if (environment?.imageBaseUrl) {
		let normalizedPath = path;
		if (normalizedPath.startsWith("/storage/")) {
			normalizedPath = normalizedPath.substring(9);
		} else if (normalizedPath.startsWith("storage/")) {
			normalizedPath = normalizedPath.substring(8);
		}

		return `${environment.imageBaseUrl}${normalizedPath}`;
	}

	// Caso 5: Fallback usando detección automática de API base
	const apiBaseUrl = getApiBaseUrl();

	if (path.startsWith("products/")) {
		return `${apiBaseUrl}/storage/${path}`;
	}

	if (path.startsWith("storage/")) {
		return `${apiBaseUrl}/${path}`;
	}

	return `${apiBaseUrl}/storage/${path}`;
}

/**
 * ✅ Obtiene la URL de imagen por defecto (placeholder embebido)
 */
export function getDefaultImageUrl(): string {
	return IMAGE_CONFIG.placeholder;
}

/**
 * ✅ Obtiene URL de "no imagen disponible"
 */
export function getNoImageUrl(): string {
	return IMAGE_CONFIG.noImage;
}

/**
 * ✅ Extrae la imagen principal de un producto con validación robusta
 */
export function getProductMainImage(product: any): string {
	if (!product) {
		return getDefaultImageUrl();
	}

	// Prioridad 1: main_image desde la API
	if (product.main_image && typeof product.main_image === "string") {
		return getImageUrl(product.main_image);
	}

	// Prioridad 2: image (singular) desde la API
	if (product.image && typeof product.image === "string") {
		return getImageUrl(product.image);
	}

	// Prioridad 3: primer elemento del array images
	if (
		product.images &&
		Array.isArray(product.images) &&
		product.images.length > 0
	) {
		const firstImage = product.images[0];

		if (typeof firstImage === "string" && firstImage.trim() !== "") {
			return getImageUrl(firstImage);
		}

		if (typeof firstImage === "object" && firstImage !== null) {
			const imageUrl =
				firstImage.original ||
				firstImage.large ||
				firstImage.medium ||
				firstImage.thumbnail ||
				"";
			if (imageUrl && typeof imageUrl === "string") {
				return getImageUrl(imageUrl);
			}
		}
	}

	// Fallback: imagen placeholder embebida
	return getDefaultImageUrl();
}

/**
 * ✅ Obtiene todas las imágenes de un producto como array
 */
export function getProductImages(product: any): string[] {
	const images: string[] = [];

	if (product?.images && Array.isArray(product.images)) {
		for (const image of product.images) {
			if (typeof image === "string" && image.trim() !== "") {
				images.push(getImageUrl(image));
			} else if (typeof image === "object" && image !== null) {
				const imageUrl =
					image.original ||
					image.large ||
					image.medium ||
					image.thumbnail ||
					"";
				if (imageUrl && typeof imageUrl === "string") {
					images.push(getImageUrl(imageUrl));
				}
			}
		}
	}

	// Si no hay imágenes válidas, agregar la imagen principal o placeholder
	if (images.length === 0) {
		images.push(getProductMainImage(product));
	}

	return images;
}

/**
 * ✅ Valida si una URL de imagen es válida (puede cargarse)
 */
export function validateImageUrl(url: string): Promise<boolean> {
	return new Promise((resolve) => {
		// Si es data URL, asumir que es válida
		if (url.startsWith("data:")) {
			resolve(true);
			return;
		}

		const img = new Image();
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
 * ✅ Genera un placeholder SVG dinámico con texto personalizado
 */
export function generatePlaceholder(
	width: number = 300,
	height: number = 300,
	text: string = "Imagen"
): string {
	const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
      <circle cx="${width / 2}" cy="${height / 3}" r="${Math.min(width, height) / 12}" fill="#d1d5db"/>
      <path d="M${width * 0.2} ${height * 0.6}L${width * 0.35} ${height * 0.45}L${width * 0.5} ${height * 0.7}L${width * 0.65} ${height * 0.35}L${width * 0.8} ${height * 0.7}V${height * 0.85}H${width * 0.2}V${height * 0.6}Z" fill="#9ca3af"/>
      <text x="${width / 2}" y="${height * 0.95}" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="${Math.max(12, width / 20)}">${text}</text>
    </svg>
  `;

	return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * ✅ Hook de React para manejar carga de imágenes con estado
 */
export function useImageLoader(initialSrc: string) {
	if (typeof window === "undefined" || !(window as any).React) {
		return {
			src: getImageUrl(initialSrc),
			isLoading: false,
			hasError: false,
			loadImage: () => {},
		};
	}

	const React = (window as any).React;
	const [src, setSrc] = React.useState(getImageUrl(initialSrc));
	const [isLoading, setIsLoading] = React.useState(true);
	const [hasError, setHasError] = React.useState(false);

	const loadImage = React.useCallback((newSrc: string) => {
		setIsLoading(true);
		setHasError(false);

		const imageUrl = getImageUrl(newSrc);

		// Si es data URL, cargar inmediatamente
		if (imageUrl.startsWith("data:")) {
			setSrc(imageUrl);
			setIsLoading(false);
			return;
		}

		validateImageUrl(imageUrl).then((isValid) => {
			if (isValid) {
				setSrc(imageUrl);
			} else {
				setSrc(getDefaultImageUrl());
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

	return {src, isLoading, hasError, loadImage};
}

/**
 * ✅ Crear una imagen con fallback automático para React
 */
export function createImageWithFallback(
	src: string,
	alt: string = "Imagen",
	className: string = "",
	onLoad?: () => void,
	onError?: () => void
) {
	if (typeof window === "undefined" || !(window as any).React) {
		return null;
	}

	const React = (window as any).React;
	const [imageSrc, setImageSrc] = React.useState(getImageUrl(src));
	const [hasError, setHasError] = React.useState(false);

	const handleError = React.useCallback(() => {
		if (!hasError) {
			setHasError(true);
			setImageSrc(getDefaultImageUrl());
			onError?.();
		}
	}, [hasError, onError]);

	const handleLoad = React.useCallback(() => {
		setHasError(false);
		onLoad?.();
	}, [onLoad]);

	React.useEffect(() => {
		setImageSrc(getImageUrl(src));
		setHasError(false);
	}, [src]);

	return React.createElement("img", {
		src: imageSrc,
		alt,
		className,
		onError: handleError,
		onLoad: handleLoad,
		loading: "lazy",
	});
}

// ✅ Exportar como objeto para facilitar imports
export const ImageUtils = {
	getImageUrl,
	getDefaultImageUrl,
	getNoImageUrl,
	getProductMainImage,
	getProductImages,
	validateImageUrl,
	generatePlaceholder,
	useImageLoader,
	createImageWithFallback,
};

export default ImageUtils;
