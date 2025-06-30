// src/presentation/types/ProductFilterParams.ts

import type {ProductFilterParams} from "../../../core/domain/entities/Product";

/**
 * Parámetros extendidos de filtro para productos
 * Incluye campos adicionales para administración y funcionalidades avanzadas
 */
export interface ExtendedProductFilterParams extends ProductFilterParams {
	// Campos específicos para administración
	admin_view?: boolean; // Indica que es una vista de admin
	seller_id?: number; // Filtrar por vendedor específico
	user_id?: number; // Filtrar por usuario específico

	// Filtros de imágenes
	has_images?: boolean; // Solo productos con imágenes
	min_images?: number; // Mínimo número de imágenes

	// Filtros de fechas
	created_after?: string; // Fecha de creación después de
	created_before?: string; // Fecha de creación antes de
	updated_after?: string; // Fecha de actualización después de
	updated_before?: string; // Fecha de actualización antes de

	// Filtros de actividad
	min_views?: number; // Mínimo número de visualizaciones
	max_views?: number; // Máximo número de visualizaciones
	min_sales?: number; // Mínimo número de ventas
	max_sales?: number; // Máximo número de ventas

	// Filtros de stock avanzados
	low_stock_threshold?: number; // Umbral para considerar stock bajo
	critical_stock_threshold?: number; // Umbral para considerar stock crítico

	// Filtros de precio avanzados
	price_change_percentage?: number; // Productos con cambio de precio específico
	has_final_price?: boolean; // Productos con precio final diferente

	// Filtros de contenido
	has_description?: boolean; // Solo productos con descripción
	min_description_length?: number; // Longitud mínima de descripción
	has_short_description?: boolean; // Solo productos con descripción corta

	// Filtros de atributos
	has_colors?: boolean; // Solo productos con colores definidos
	has_sizes?: boolean; // Solo productos con tallas definidas
	has_tags?: boolean; // Solo productos con etiquetas
	has_attributes?: boolean; // Solo productos con atributos personalizados

	// Filtros de valoraciones
	min_rating_count?: number; // Mínimo número de valoraciones
	max_rating_count?: number; // Máximo número de valoraciones

	// Filtros de exclusión
	exclude_id?: number; // Excluir producto específico
	exclude_ids?: number[]; // Excluir múltiples productos
	exclude_seller_id?: number; // Excluir productos de vendedor específico
	exclude_category_id?: number; // Excluir productos de categoría específica

	// Campos de ordenamiento extendidos
	sort_by_relevance?: boolean; // Ordenar por relevancia (para búsquedas)
	sort_by_popularity?: boolean; // Ordenar por popularidad
	sort_by_recent_activity?: boolean; // Ordenar por actividad reciente

	// Campos de agrupación
	group_by_seller?: boolean; // Agrupar resultados por vendedor
	group_by_category?: boolean; // Agrupar resultados por categoría
	group_by_price_range?: boolean; // Agrupar resultados por rango de precio

	// Campos de inclusión de relaciones
	include_seller?: boolean; // Incluir información del vendedor
	include_category?: boolean; // Incluir información de la categoría
	include_user?: boolean; // Incluir información del usuario
	include_reviews?: boolean; // Incluir reseñas del producto
	include_related?: boolean; // Incluir productos relacionados
	include_images_metadata?: boolean; // Incluir metadatos de imágenes

	// Filtros de disponibilidad
	available_for_order?: boolean; // Solo productos disponibles para pedido
	backorder_allowed?: boolean; // Solo productos que permiten backorder
	preorder_available?: boolean; // Solo productos disponibles para pre-orden

	// Filtros de envío
	free_shipping?: boolean; // Solo productos con envío gratis
	express_shipping?: boolean; // Solo productos con envío express
	international_shipping?: boolean; // Solo productos con envío internacional

	// Filtros de promociones
	on_sale?: boolean; // Solo productos en oferta
	has_coupon?: boolean; // Solo productos con cupón aplicable
	seasonal_promotion?: boolean; // Solo productos en promoción estacional

	// Filtros de visibilidad
	visible_in_search?: boolean; // Solo productos visibles en búsqueda
	visible_in_recommendations?: boolean; // Solo productos visibles en recomendaciones
	visible_in_catalog?: boolean; // Solo productos visibles en catálogo

	// Campos para optimización de consultas
	lightweight?: boolean; // Retornar solo campos básicos
	with_counts?: boolean; // Incluir contadores adicionales
	with_aggregations?: boolean; // Incluir agregaciones de datos

	// Campos para debugging y desarrollo
	debug?: boolean; // Activar modo debug
	explain_query?: boolean; // Explicar la consulta ejecutada

	// Campos de paginación extendidos
	cursor?: string; // Para paginación basada en cursor
	before?: string; // Para paginación hacia atrás
	after?: string; // Para paginación hacia adelante

	// Filtros de formato de respuesta
	format?: "full" | "compact" | "minimal"; // Formato de respuesta
	fields?: string[]; // Campos específicos a retornar
	exclude_fields?: string[]; // Campos a excluir de la respuesta

	// Filtros temporales
	seasonal?: "spring" | "summer" | "autumn" | "winter"; // Productos estacionales
	holiday_special?: boolean; // Productos especiales para feriados
	weekend_special?: boolean; // Productos especiales para fin de semana

	// Filtros de calidad de datos
	complete_data?: boolean; // Solo productos con datos completos
	verified_data?: boolean; // Solo productos con datos verificados
	quality_score_min?: number; // Puntuación mínima de calidad

	// Filtros de ubicación (para productos físicos)
	near_location?: string; // Cerca de una ubicación específica
	country?: string; // País de origen del producto
	region?: string; // Región específica

	// Filtros de compatibilidad
	compatible_with?: string; // Compatible con producto/marca específica
	requires?: string[]; // Requiere productos específicos
	works_with?: string[]; // Funciona con productos específicos
}
