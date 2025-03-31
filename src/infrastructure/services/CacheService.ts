/**
 * Servicio para gestionar caché en localStorage con expiración
 */
export class CacheService {
  /**
   * Guarda un valor en cache con tiempo de expiración
   * @param key Clave para almacenar el valor
   * @param value Valor a almacenar
   * @param expirationMs Tiempo de expiración en milisegundos
   */
  static setItem(key: string, value: any, expirationMs: number): void {
    try {
      const item = {
        value,
        expiry: Date.now() + expirationMs
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error al guardar en caché:', error);
    }
  }

  /**
   * Recupera un valor de cache que no haya expirado
   * @param key Clave del valor a recuperar
   * @returns El valor almacenado o null si no existe o ha expirado
   */
  static getItem(key: string): any {
    try {
      const itemStr = localStorage.getItem(key);
      
      if (!itemStr) {
        return null;
      }
      
      const item = JSON.parse(itemStr);
      
      // Verificar si el ítem ha expirado
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error al recuperar de caché:', error);
      return null;
    }
  }

  /**
   * Elimina un valor de caché
   * @param key Clave del valor a eliminar
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error al eliminar de caché:', error);
    }
  }

  /**
   * Verifica si una clave existe y no ha expirado
   * @param key Clave a verificar
   * @returns true si existe y no ha expirado, false en caso contrario
   */
  static hasValidItem(key: string): boolean {
    return this.getItem(key) !== null;
  }
}

export default CacheService;