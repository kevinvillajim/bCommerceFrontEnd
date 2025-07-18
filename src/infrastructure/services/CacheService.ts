// src/infrastructure/services/CacheService.ts (MEJORADO)

/**
 * Servicio mejorado para gestionar caché en localStorage con expiración
 * y funcionalidades adicionales para evitar consultas repetitivas
 */
export class CacheService {
	private static readonly PREFIX = "cache_";
	private static readonly MAX_CACHE_SIZE = 50; // Máximo número de elementos en cache

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
				expiry: Date.now() + expirationMs,
				created: Date.now(),
			};

			const fullKey = this.PREFIX + key;
			localStorage.setItem(fullKey, JSON.stringify(item));

			// Limpiar cache si está muy lleno
			this.cleanupIfNeeded();

			console.log(
				`💾 Cache guardado: ${key} (expira en ${Math.round(expirationMs / 1000)}s)`
			);
		} catch (error) {
			console.error("Error al guardar en caché:", error);
			// Si hay error de espacio, limpiar cache antiguo e intentar de nuevo
			this.clearExpired();
			try {
				const fullKey = this.PREFIX + key;
				localStorage.setItem(
					fullKey,
					JSON.stringify({
						value,
						expiry: Date.now() + expirationMs,
						created: Date.now(),
					})
				);
			} catch (retryError) {
				console.error(
					"Error al guardar en caché después de limpiar:",
					retryError
				);
			}
		}
	}

	/**
	 * Recupera un valor de cache que no haya expirado
	 * @param key Clave del valor a recuperar
	 * @returns El valor almacenado o null si no existe o ha expirado
	 */
	static getItem(key: string): any {
		try {
			const fullKey = this.PREFIX + key;
			const itemStr = localStorage.getItem(fullKey);

			if (!itemStr) {
				return null;
			}

			const item = JSON.parse(itemStr);

			// Verificar si el ítem ha expirado
			if (Date.now() > item.expiry) {
				console.log(`🗑️ Cache expirado removido: ${key}`);
				localStorage.removeItem(fullKey);
				return null;
			}

			console.log(`✅ Cache hit: ${key}`);
			return item.value;
		} catch (error) {
			console.error("Error al recuperar de caché:", error);
			// Si hay error, remover el item corrupto
			try {
				const fullKey = this.PREFIX + key;
				localStorage.removeItem(fullKey);
			} catch (removeError) {
				console.error("Error al remover item corrupto:", removeError);
			}
			return null;
		}
	}

	/**
	 * Elimina un valor de caché
	 * @param key Clave del valor a eliminar
	 */
	static removeItem(key: string): void {
		try {
			const fullKey = this.PREFIX + key;
			localStorage.removeItem(fullKey);
			console.log(`🗑️ Cache removido: ${key}`);
		} catch (error) {
			console.error("Error al eliminar de caché:", error);
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

	/**
	 * Obtiene múltiples elementos del cache de una vez
	 * @param keys Array de claves a recuperar
	 * @returns Objeto con las claves como propiedades y los valores como valores
	 */
	static getMultiple(keys: string[]): Record<string, any> {
		const result: Record<string, any> = {};

		keys.forEach((key) => {
			const value = this.getItem(key);
			if (value !== null) {
				result[key] = value;
			}
		});

		return result;
	}

	/**
	 * Establece múltiples elementos en el cache de una vez
	 * @param items Objeto con claves y valores a establecer
	 * @param expirationMs Tiempo de expiración en milisegundos
	 */
	static setMultiple(items: Record<string, any>, expirationMs: number): void {
		Object.entries(items).forEach(([key, value]) => {
			this.setItem(key, value, expirationMs);
		});
	}

	/**
	 * Limpia todos los elementos expirados del cache
	 */
	static clearExpired(): void {
		try {
			const now = Date.now();
			const keysToRemove: string[] = [];

			// Buscar todas las claves de cache
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(this.PREFIX)) {
					try {
						const itemStr = localStorage.getItem(key);
						if (itemStr) {
							const item = JSON.parse(itemStr);
							if (now > item.expiry) {
								keysToRemove.push(key);
							}
						}
					} catch (error) {
						// Si hay error al parsear, marcar para eliminar
						keysToRemove.push(key);
					}
				}
			}

			// Remover elementos expirados
			keysToRemove.forEach((key) => {
				localStorage.removeItem(key);
			});

			if (keysToRemove.length > 0) {
				console.log(
					`🗑️ Cache: ${keysToRemove.length} elementos expirados eliminados`
				);
			}
		} catch (error) {
			console.error("Error al limpiar cache expirado:", error);
		}
	}

	/**
	 * Limpia todo el cache (solo elementos de este servicio)
	 */
	static clearAll(): void {
		try {
			const keysToRemove: string[] = [];

			// Buscar todas las claves de cache
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(this.PREFIX)) {
					keysToRemove.push(key);
				}
			}

			// Remover todos los elementos de cache
			keysToRemove.forEach((key) => {
				localStorage.removeItem(key);
			});

			console.log(
				`🗑️ Cache: ${keysToRemove.length} elementos eliminados completamente`
			);
		} catch (error) {
			console.error("Error al limpiar todo el cache:", error);
		}
	}

	/**
	 * Obtiene estadísticas del cache
	 */
	static getStats(): {
		total: number;
		expired: number;
		active: number;
		totalSize: number; // en caracteres aproximados
	} {
		try {
			const now = Date.now();
			let total = 0;
			let expired = 0;
			let active = 0;
			let totalSize = 0;

			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(this.PREFIX)) {
					total++;
					const itemStr = localStorage.getItem(key);
					if (itemStr) {
						totalSize += itemStr.length;
						try {
							const item = JSON.parse(itemStr);
							if (now > item.expiry) {
								expired++;
							} else {
								active++;
							}
						} catch (error) {
							expired++; // Considerar items corruptos como expirados
						}
					}
				}
			}

			return {total, expired, active, totalSize};
		} catch (error) {
			console.error("Error al obtener estadísticas del cache:", error);
			return {total: 0, expired: 0, active: 0, totalSize: 0};
		}
	}

	/**
	 * Limpia el cache si está muy lleno (uso interno)
	 */
	private static cleanupIfNeeded(): void {
		try {
			const stats = this.getStats();

			// Si hay demasiados elementos, limpiar expirados
			if (stats.total > this.MAX_CACHE_SIZE) {
				this.clearExpired();

				// Si aún hay demasiados, eliminar los más antiguos
				const newStats = this.getStats();
				if (newStats.active > this.MAX_CACHE_SIZE * 0.8) {
					this.clearOldest(Math.floor(this.MAX_CACHE_SIZE * 0.2));
				}
			}
		} catch (error) {
			console.error("Error en limpieza automática del cache:", error);
		}
	}

	/**
	 * Elimina los elementos más antiguos del cache
	 * @param count Número de elementos a eliminar
	 */
	private static clearOldest(count: number): void {
		try {
			const items: Array<{key: string; created: number}> = [];

			// Recopilar todos los elementos con sus fechas de creación
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith(this.PREFIX)) {
					try {
						const itemStr = localStorage.getItem(key);
						if (itemStr) {
							const item = JSON.parse(itemStr);
							items.push({key, created: item.created || 0});
						}
					} catch (error) {
						// Items corruptos también se pueden eliminar
						items.push({key, created: 0});
					}
				}
			}

			// Ordenar por fecha de creación (más antiguos primero)
			items.sort((a, b) => a.created - b.created);

			// Eliminar los más antiguos
			const toRemove = items.slice(0, count);
			toRemove.forEach((item) => {
				localStorage.removeItem(item.key);
			});

			if (toRemove.length > 0) {
				console.log(
					`🗑️ Cache: ${toRemove.length} elementos antiguos eliminados`
				);
			}
		} catch (error) {
			console.error("Error al eliminar elementos antiguos del cache:", error);
		}
	}

	/**
	 * Función de utilidad para debug - muestra el contenido del cache
	 */
	static debug(): void {
		const stats = this.getStats();
		console.group("📊 Cache Debug Info");
		console.log("Estadísticas:", stats);

		const items: Array<{key: string; expiry: number; size: number}> = [];

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(this.PREFIX)) {
				try {
					const itemStr = localStorage.getItem(key);
					if (itemStr) {
						const item = JSON.parse(itemStr);
						items.push({
							key: key.replace(this.PREFIX, ""),
							expiry: item.expiry,
							size: itemStr.length,
						});
					}
				} catch (error) {
					items.push({
						key: key.replace(this.PREFIX, ""),
						expiry: 0,
						size: 0,
					});
				}
			}
		}

		console.table(items);
		console.groupEnd();
	}
}

export default CacheService;
