/**
 * Servicio para manejar el almacenamiento local (localStorage)
 * Proporciona métodos para almacenar, recuperar y eliminar datos
 */
export class LocalStorageService {
  /**
   * Guarda un valor en localStorage
   * @param key Clave para almacenar el valor
   * @param value Valor a almacenar (se convertirá a JSON si es un objeto)
   */
  setItem(key: string, value: any): void {
    try {
      // Si el valor es un objeto, lo convertimos a JSON
      const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }

  /**
   * Recupera un valor de localStorage
   * @param key Clave del valor a recuperar
   * @returns El valor almacenado o null si no existe
   */
  getItem(key: string): any {
    try {
      const item = localStorage.getItem(key);
      
      // Si el ítem no existe, devolvemos null
      if (item === null) {
        return null;
      }
      
      // Intentamos parsear como JSON, si falla devolvemos el valor original
      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }
    } catch (error) {
      console.error('Error al recuperar de localStorage:', error);
      return null;
    }
  }

  /**
   * Elimina un valor de localStorage
   * @param key Clave del valor a eliminar
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error al eliminar de localStorage:', error);
    }
  }

  /**
   * Limpia todo el localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
  }

  /**
   * Verifica si una clave existe en localStorage
   * @param key Clave a verificar
   * @returns true si existe, false si no
   */
  hasKey(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('Error al verificar clave en localStorage:', error);
      return false;
    }
  }
}