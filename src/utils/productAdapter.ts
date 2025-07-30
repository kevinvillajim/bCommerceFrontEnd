import type {Product} from "../core/domain/entities/Product";

/**
 * Adapta un producto de la API para su uso en la aplicación
 * Normaliza campos entre camelCase y snake_case, y maneja valores faltantes
 */
export const adaptProduct = (apiProduct: any): Product => {
	if (!apiProduct || typeof apiProduct !== "object") {
		console.error("Producto inválido para adaptar:", apiProduct);
		return {} as Product;
	}

	// Extraer las calificaciones correctamente
	// Usando todas las posibles propiedades donde podría estar el rating
	const rating =
		apiProduct.ratingAvg ||
		apiProduct.rating_avg ||
		apiProduct.rating ||
		apiProduct.rating_data?.average_rating ||
		0;

    const rating_count =
			apiProduct.ratingAvg_count ||
			apiProduct.rating_avg_count ||
			apiProduct.rating_count ||
			apiProduct.rating_data?.average_rating_count ||
			0;

    
	// Adaptar imágenes según el formato de la API
	let images: string[] = [];

	if (Array.isArray(apiProduct.images)) {
		// Si images es un array de objetos con URLs
		if (typeof apiProduct.images[0] === "object") {
			images = apiProduct.images
				.map((img: any) => {
					// Buscar la URL original o cualquier otra propiedad disponible
					return img.original || img.url || img.medium || img.thumbnail || "";
				})
				.filter(Boolean);
		}
		// Si images es un array de strings (URLs)
		else if (typeof apiProduct.images[0] === "string") {
			images = apiProduct.images;
		}
	}
	// Si solo hay una imagen como string
	else if (typeof apiProduct.image === "string") {
		images = [apiProduct.image];
	}
	// Si hay una propiedad imageUrl
	else if (
		typeof apiProduct.imageUrl === "string" ||
		typeof apiProduct.image_url === "string"
	) {
		images = [apiProduct.imageUrl || apiProduct.image_url];
	}

	// Calcular el descuento y precio final
	const discountPercentage =
		apiProduct.discountPercentage || apiProduct.discount_percentage || 0;
	const price = parseFloat(apiProduct.price) || 0;
	const finalPrice =
		apiProduct.finalPrice ||
		apiProduct.final_price ||
		(discountPercentage > 0 ? price * (1 - discountPercentage / 100) : price);

	return {
		id: apiProduct.id,
		userId: apiProduct.userId || apiProduct.user_id,
		categoryId: apiProduct.categoryId || apiProduct.category_id,
		name: apiProduct.name || "Producto sin nombre",
		slug: apiProduct.slug || "",
		description: apiProduct.description || "",
		price: price,
		stock: parseInt(apiProduct.stock) || 0,
		weight: apiProduct.weight,
		width: apiProduct.width,
		height: apiProduct.height,
		depth: apiProduct.depth,
		dimensions: apiProduct.dimensions,
		colors: apiProduct.colors,
		sizes: apiProduct.sizes,
		tags: apiProduct.tags,
		sku: apiProduct.sku,
		attributes: apiProduct.attributes,
		images: images,
		featured: Boolean(apiProduct.featured),
		published: Boolean(apiProduct.published),
		status: apiProduct.status || "active",
		viewCount: apiProduct.viewCount || apiProduct.view_count || 0,
		salesCount: apiProduct.salesCount || apiProduct.sales_count || 0,
		discountPercentage: discountPercentage,
		finalPrice: finalPrice,
		isInStock:
			apiProduct.isInStock || apiProduct.is_in_stock || apiProduct.stock > 0,
		rating: parseFloat(rating) || 0,
		ratingCount: parseFloat(rating_count) || 0, // CORREGIDO: usar ratingCount en lugar de rating_count
		createdAt: apiProduct.createdAt || apiProduct.created_at,
		updatedAt: apiProduct.updatedAt || apiProduct.updated_at,
		created_at: apiProduct.created_at || apiProduct.createdAt || new Date().toISOString(),
		category_name: apiProduct.category?.name || apiProduct.category_name || "Sin categoría",
	};
};

/**
 * Adapta una lista de productos de la API
 */
export const adaptProductList = (products: any[]): Product[] => {
	if (!Array.isArray(products)) {
		console.error("Lista de productos inválida:", products);
		return [];
	}

	return products.map((product) => adaptProduct(product));
};

export default {
	adaptProduct,
	adaptProductList,
};
