// src/utils/imageManager.ts - GESTOR ÚNICO DE IMÁGENES
import environment from "../config/environment";

/**
 * Placeholder SVG embebido - No requiere conexión externa
 */
const PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="#e5e7eb"/>
  <circle cx="150" cy="120" r="30" fill="#9ca3af"/>
  <path d="M90 180L120 150L150 200L180 130L210 200V230H90V180Z" fill="#9ca3af"/>
  <text x="150" y="260" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle">
    Sin imagen
  </text>
</svg>
`)}`;

/**
 * Obtiene la URL base de la API dinámicamente
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
 * FUNCIÓN PRINCIPAL - Procesar URL de imagen
 */
export function getImageUrl(imagePath?: string | null): string {
	// Caso 1: Sin imagen - retornar placeholder
	if (!imagePath || imagePath.trim() === "") {
		return PLACEHOLDER_SVG;
	}

	const path = imagePath.trim();

	// Caso 2: URL completa (http/https) - retornar tal como está
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}

	// Caso 3: Data URI - retornar tal como está
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

	if (path.startsWith("/")) {
		return `${apiBaseUrl}${path}`;
	}

	// Para cualquier otra ruta, asumir que es relativa al storage
	return `${apiBaseUrl}/storage/${path}`;
}

/**
 * Obtiene la imagen principal de un producto
 */
export function getProductMainImage(product: any): string {
	if (!product) {
		return PLACEHOLDER_SVG;
	}

	console.log("🔍 Analizando producto para imagen principal:", {
		id: product.id,
		main_image: product.main_image,
		image: product.image,
		images: product.images,
	});

	// Prioridad 1: main_image desde la API
	if (product.main_image && typeof product.main_image === "string") {
		console.log("✅ Usando main_image:", product.main_image);
		return getImageUrl(product.main_image);
	}

	// Prioridad 2: image (singular) desde la API
	if (product.image && typeof product.image === "string") {
		console.log("✅ Usando image:", product.image);
		return getImageUrl(product.image);
	}

	// Prioridad 3: primer elemento del array images
	if (
		product.images &&
		Array.isArray(product.images) &&
		product.images.length > 0
	) {
		const firstImage = product.images[0];
		console.log("📋 Primer imagen del array:", firstImage);

		if (typeof firstImage === "string" && firstImage.trim() !== "") {
			console.log("✅ Usando primera imagen string:", firstImage);
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
				console.log("✅ Usando imagen del objeto:", imageUrl);
				return getImageUrl(imageUrl);
			}
		}
	}

	console.log("⚠️ No se encontró imagen, usando placeholder");
	return PLACEHOLDER_SVG;
}

/**
 * Obtiene todas las imágenes de un producto como array
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

	// Si no hay imágenes, agregar la imagen principal o placeholder
	if (images.length === 0) {
		images.push(getProductMainImage(product));
	}

	return images;
}

/**
 * Valida si una URL de imagen es válida
 */
export function validateImageUrl(url: string): Promise<boolean> {
	return new Promise((resolve) => {
		if (url.startsWith("data:")) {
			resolve(true);
			return;
		}

		const img = new Image();
		const timeout = setTimeout(() => resolve(false), 3000);

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
