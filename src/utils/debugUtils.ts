// src/utils/debugUtils.ts

import type { ExtendedProductFilterParams } from "../presentation/types/ProductFilterParams";
import type { Category } from "../core/domain/entities/Category";

/**
 * Utilidad para depurar parámetros de filtros
 */
export class DebugUtils {
    /**
     * Log detallado de los parámetros de filtro
     */
    static logFilterParams(params: ExtendedProductFilterParams, categories: Category[]): void {
        console.group("🔍 DEBUG: Parámetros de filtro");
        
        console.log("📋 Parámetros completos:", params);
        
        // Verificar categorías
        if (params.categoryIds && params.categoryIds.length > 0) {
            console.group("📂 Categorías seleccionadas:");
            console.log("IDs enviados:", params.categoryIds);
            
            params.categoryIds.forEach(id => {
                const category = categories.find(c => c.id === id);
                if (category) {
                    console.log(`✅ ID ${id}: ${category.name}`);
                } else {
                    console.warn(`❌ ID ${id}: Categoría no encontrada`);
                }
            });
            
            console.log("Operador:", params.categoryOperator || "or");
            console.groupEnd();
        }
        
        // Verificar precios
        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
            console.group("💰 Filtros de precio:");
            if (params.minPrice !== undefined) console.log("Precio mínimo:", params.minPrice);
            if (params.maxPrice !== undefined) console.log("Precio máximo:", params.maxPrice);
            console.groupEnd();
        }
        
        // Verificar rating
        if (params.rating !== undefined) {
            console.log("⭐ Rating mínimo:", params.rating);
        }
        
        // Verificar descuento
        if (params.minDiscount !== undefined) {
            console.log("🏷️ Descuento mínimo:", params.minDiscount + "%");
        }
        
        // Verificar ordenamiento
        if (params.sortBy) {
            console.log("🔄 Ordenamiento:", `${params.sortBy} ${params.sortDir || 'desc'}`);
        }
        
        // Verificar búsqueda
        if (params.term) {
            console.log("🔍 Término de búsqueda:", params.term);
        }
        
        console.groupEnd();
    }
    
    /**
     * Construye URL de depuración para probar manualmente
     */
    static buildDebugUrl(params: ExtendedProductFilterParams, baseUrl: string = "http://127.0.0.1:8000/api"): string {
        const queryParams = new URLSearchParams();
        
        // Añadir todos los parámetros
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    queryParams.set(key, value.join(","));
                } else {
                    queryParams.set(key, value.toString());
                }
            }
        });
        
        const url = `${baseUrl}/products?${queryParams.toString()}`;
        console.log("🔗 URL de prueba:", url);
        return url;
    }
    
    /**
     * Compara dos objetos de parámetros para ver diferencias
     */
    static compareParams(params1: ExtendedProductFilterParams, params2: ExtendedProductFilterParams): void {
        console.group("🔍 Comparación de parámetros");
        
        const allKeys = new Set([...Object.keys(params1), ...Object.keys(params2)]);
        
        allKeys.forEach(key => {
            const val1 = (params1 as any)[key];
            const val2 = (params2 as any)[key];
            
            if (JSON.stringify(val1) !== JSON.stringify(val2)) {
                console.log(`📝 ${key}:`, {
                    anterior: val1,
                    actual: val2
                });
            }
        });
        
        console.groupEnd();
    }
    
    /**
     * Valida que los parámetros estén correctamente formateados
     */
    static validateParams(params: ExtendedProductFilterParams): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        // Validar categoryIds
        if (params.categoryIds) {
            if (!Array.isArray(params.categoryIds)) {
                errors.push("categoryIds debe ser un array");
            } else if (params.categoryIds.some(id => typeof id !== 'number' || id <= 0)) {
                errors.push("categoryIds debe contener solo números positivos");
            }
        }
        
        // Validar precios
        if (params.minPrice !== undefined && (typeof params.minPrice !== 'number' || params.minPrice < 0)) {
            errors.push("minPrice debe ser un número no negativo");
        }
        
        if (params.maxPrice !== undefined && (typeof params.maxPrice !== 'number' || params.maxPrice < 0)) {
            errors.push("maxPrice debe ser un número no negativo");
        }
        
        if (params.minPrice !== undefined && params.maxPrice !== undefined && params.minPrice > params.maxPrice) {
            errors.push("minPrice no puede ser mayor que maxPrice");
        }
        
        // Validar rating
        if (params.rating !== undefined && (typeof params.rating !== 'number' || params.rating < 1 || params.rating > 5)) {
            errors.push("rating debe ser un número entre 1 y 5");
        }
        
        // Validar descuento
        if (params.minDiscount !== undefined && (typeof params.minDiscount !== 'number' || params.minDiscount < 0 || params.minDiscount > 100)) {
            errors.push("minDiscount debe ser un número entre 0 y 100");
        }
        
        // Validar ordenamiento
        if (params.sortDir && !['asc', 'desc'].includes(params.sortDir)) {
            errors.push("sortDir debe ser 'asc' o 'desc'");
        }
        
        if (errors.length > 0) {
            console.warn("❌ Errores de validación:", errors);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}