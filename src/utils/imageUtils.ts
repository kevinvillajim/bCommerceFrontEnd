import environment from "../config/environment";

/**
 * Convierte una ruta relativa de imagen a URL completa usando la configuración de entorno
 * @param imagePath Ruta relativa de la imagen o URL completa
 * @returns URL completa de la imagen
 */
export const getImageUrl = (imagePath?: string): string => {
	if (!imagePath) return "";

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
