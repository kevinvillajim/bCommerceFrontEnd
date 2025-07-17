// src/infrastructure/services/SecureRoleCache.ts

import CryptoJS from "crypto-js";

// Función para obtener la clave de cifrado según el bundler
const getEncryptionKey = (): string => {
	// Para Vite
	if (typeof import.meta !== "undefined" && import.meta.env) {
		return import.meta.env.VITE_CACHE_KEY || "nTIonshRityLkSomPLIgMayOUsEmPLeW";
	}

	// Para Create React App y otros bundlers que exponen process.env
	if (typeof process !== "undefined" && process.env) {
		return (
			process.env.REACT_APP_CACHE_KEY || "nTIonshRityLkSomPLIgMayOUsEmPLeW"
		);
	}

	// Fallback seguro usando la clave que ya configuraste
	return "nTIonshRityLkSomPLIgMayOUsEmPLeW";
};

const ENCRYPTION_KEY = getEncryptionKey();
const INTEGRITY_SALT = "role-integrity-2024";

interface SecureRoleData {
	role: string;
	isAdmin: boolean;
	isSeller: boolean;
	sellerInfo?: any;
	adminInfo?: any;
	timestamp: number;
	sessionId: string;
}

interface CachedSecureData {
	encrypted: string;
	hash: string;
	timestamp: number;
}

/**
 * Servicio de cache seguro para roles de usuario
 * Combina cifrado + validación de integridad
 */
export class SecureRoleCache {
	private static sessionId = this.generateSessionId();
	private static readonly STORAGE_CACHE_TIME = 5 * 60 * 1000; // 5 minutos en storage
	private static readonly CRITICAL_REVALIDATION_TIME = 2 * 60 * 1000; // 2 minutos para operaciones críticas

	private static generateSessionId(): string {
		return CryptoJS.lib.WordArray.random(16).toString();
	}

	/**
	 * Cifra datos sensibles
	 */
	private static encrypt(data: SecureRoleData): string {
		const jsonString = JSON.stringify(data);
		return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
	}

	/**
	 * Descifra datos
	 */
	private static decrypt(encryptedData: string): SecureRoleData | null {
		try {
			const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
			const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
			return JSON.parse(jsonString);
		} catch {
			return null;
		}
	}

	/**
	 * Genera hash de integridad
	 */
	private static generateIntegrityHash(data: SecureRoleData): string {
		const content = `${data.role}-${data.isAdmin}-${data.isSeller}-${data.timestamp}-${data.sessionId}`;
		return CryptoJS.HmacSHA256(content, INTEGRITY_SALT).toString();
	}

	/**
	 * Valida integridad de los datos
	 */
	private static validateIntegrity(
		data: SecureRoleData,
		expectedHash: string
	): boolean {
		const calculatedHash = this.generateIntegrityHash(data);
		return calculatedHash === expectedHash;
	}

	/**
	 * Guarda datos de rol de forma segura
	 */
	static setSecureRoleData(
		roleData: Omit<SecureRoleData, "timestamp" | "sessionId">
	): void {
		const secureData: SecureRoleData = {
			...roleData,
			timestamp: Date.now(),
			sessionId: this.sessionId,
		};

		const encrypted = this.encrypt(secureData);
		const hash = this.generateIntegrityHash(secureData);

		const cachedData: CachedSecureData = {
			encrypted,
			hash,
			timestamp: secureData.timestamp,
		};

		// Solo guardar en localStorage datos no críticos cifrados
		try {
			localStorage.setItem("secure_role_cache", JSON.stringify(cachedData));
		} catch (error) {
			console.warn("No se pudo guardar cache de roles:", error);
		}
	}

	/**
	 * Obtiene datos de rol validando integridad
	 */
	static getSecureRoleData(): SecureRoleData | null {
		try {
			const cachedDataStr = localStorage.getItem("secure_role_cache");
			if (!cachedDataStr) return null;

			const cachedData: CachedSecureData = JSON.parse(cachedDataStr);

			// Verificar expiración
			const now = Date.now();
			if (now - cachedData.timestamp > this.STORAGE_CACHE_TIME) {
				this.clearSecureCache();
				return null;
			}

			// Descifrar datos
			const decryptedData = this.decrypt(cachedData.encrypted);
			if (!decryptedData) {
				this.clearSecureCache();
				return null;
			}

			// Validar integridad
			if (!this.validateIntegrity(decryptedData, cachedData.hash)) {
				console.warn("Integridad de cache de roles comprometida");
				this.clearSecureCache();
				return null;
			}

			// Validar sesión
			if (decryptedData.sessionId !== this.sessionId) {
				console.log("Cache de sesión anterior, invalidando");
				this.clearSecureCache();
				return null;
			}

			return decryptedData;
		} catch (error) {
			console.warn("Error al leer cache seguro:", error);
			this.clearSecureCache();
			return null;
		}
	}

	/**
	 * Limpia cache seguro
	 */
	static clearSecureCache(): void {
		localStorage.removeItem("secure_role_cache");
	}

	/**
	 * Verifica si necesita revalidación para operaciones críticas
	 */
	static needsCriticalRevalidation(): boolean {
		const data = this.getSecureRoleData();
		if (!data) return true;

		const now = Date.now();
		return now - data.timestamp > this.CRITICAL_REVALIDATION_TIME;
	}
}
