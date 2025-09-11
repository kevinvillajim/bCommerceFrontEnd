/**
 * Utilidades para sanitizar y validar IDs
 */

/**
 * Sanitiza un ID eliminando puntos decimales y convirtiendo a entero
 * @param id - ID que puede ser string o number
 * @returns ID sanitizado como number
 */
export function sanitizeId(id: string | number | undefined): number {
  if (!id) return 0;
  
  // Convertir a string para manipular
  const idStr = String(id);
  
  // Log del ID original para debug
  if (idStr.includes('.')) {
    console.log(`🔧 Sanitizando ID malformado: "${idStr}"`);
  }
  
  // Si contiene punto decimal, tomar solo la parte entera
  const sanitized = idStr.split('.')[0];
  
  // Convertir a número entero
  const parsed = parseInt(sanitized, 10);
  
  // Verificar que sea un número válido
  if (isNaN(parsed) || parsed <= 0) {
    console.warn(`⚠️ ID inválido detectado: ${id}, usando 0 como fallback`);
    return 0;
  }
  
  // Log del resultado para debug
  if (idStr.includes('.')) {
    console.log(`✅ ID sanitizado: "${idStr}" → ${parsed}`);
  }
  
  return parsed;
}

/**
 * Valida que un ID sea válido
 * @param id - ID a validar
 * @returns true si el ID es válido
 */
export function isValidId(id: string | number | undefined): boolean {
  if (!id) return false;
  
  const sanitized = sanitizeId(id);
  return sanitized > 0;
}

/**
 * Sanitiza un array de objetos con IDs
 * @param items - Array de objetos que contienen IDs
 * @returns Array con IDs sanitizados
 */
export function sanitizeItemIds<T extends { id?: string | number }>(items: T[]): T[] {
  return items.map(item => ({
    ...item,
    id: item.id ? sanitizeId(item.id) : undefined
  }));
}