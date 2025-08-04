import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {ApiResponse} from "../../presentation/types/admin/ratingConfigTypes";
import type {
	RatingConfigs,
	RatingStats,
} from "../../presentation/types/admin/ratingConfigTypes";

// Tipos para todas las configuraciones
export interface GeneralConfig {
	siteName: string;
	siteDescription: string;
	contactEmail: string;
	adminEmail: string;
	itemsPerPage: number;
	maintenanceMode: boolean;
	enableRegistration: boolean;
	defaultLanguage: string;
	defaultCurrency: string;
	timeZone: string;
}

export interface SecurityConfig {
	passwordMinLength: number | string;
	passwordRequireSpecial: boolean;
	passwordRequireUppercase: boolean;
	passwordRequireNumbers: boolean;
	accountLockAttempts: number | string;
	sessionTimeout: number | string;
	enableTwoFactor: boolean;
	requireEmailVerification: boolean;
	adminIpRestriction: string;
	enableCaptcha: boolean;
}

export interface PaymentConfig {
	currencySymbol: string;
	currencyCode: string;
	enablePayPal: boolean;
	payPalClientId: string;
	payPalClientSecret: string;
	payPalSandboxMode: boolean;
	enableCreditCard: boolean;
	stripePublicKey: string;
	stripeSecretKey: string;
	stripeSandboxMode: boolean;
	enableLocalPayments: boolean;
	taxRate: number;
}

export interface EmailConfig {
	smtpHost: string;
	smtpPort: number;
	smtpUsername: string;
	smtpPassword: string;
	smtpEncryption: string;
	senderName: string;
	senderEmail: string;
	notificationEmails: boolean;
	welcomeEmail: boolean;
	orderConfirmationEmail: boolean;
	passwordResetEmail: boolean;
}

export interface ModerationConfig {
	userStrikesThreshold: number;
	contactScorePenalty: number;
	businessScoreBonus: number;
	contactPenaltyHeavy: number;
	minimumContactScore: number;
	scoreDifferenceThreshold: number;
	consecutiveNumbersLimit: number;
	numbersWithContextLimit: number;
	lowStockThreshold: number;
}

export interface NotificationConfig {
	adminNewOrder: boolean;
	adminNewUser: boolean;
	adminLowStock: boolean;
	adminNewReview: boolean;
	adminFailedPayment: boolean;
	sellerNewOrder: boolean;
	sellerLowStock: boolean;
	sellerProductReview: boolean;
	sellerMessageReceived: boolean;
	sellerReturnRequest: boolean;
	userOrderStatus: boolean;
	userDeliveryUpdates: boolean;
	userPromotions: boolean;
	userAccountChanges: boolean;
	userPasswordChanges: boolean;
}

export interface SystemLimitsConfig {
	cartMaxItems: number;
	cartMaxQuantityPerItem: number;
	orderTimeout: number;
	recommendationLimit: number;
	maxRecommendationResults: number;
	tokenRefreshThreshold: number;
}

export interface IntegrationConfig {
	googleAnalyticsId: string;
	enableGoogleAnalytics: boolean;
	facebookPixelId: string;
	enableFacebookPixel: boolean;
	recaptchaSiteKey: string;
	recaptchaSecretKey: string;
	enableHotjar: boolean;
	hotjarId: string;
	enableChatbot: boolean;
	chatbotScript: string;
}

export interface BackupConfig {
	automaticBackups: boolean;
	backupFrequency: string;
	backupTime: string;
	backupRetention: number;
	includeMedia: boolean;
	backupToCloud: boolean;
	cloudProvider: string;
	cloudApiKey: string;
	cloudSecret: string;
	cloudBucket: string;
	lastBackupDate: string;
}


/**
 * Servicio para gestionar configuraciones del sistema
 */
class ConfigurationService {
	/**
	 * Obtiene configuraciones de valoraciones
	 */
	async getRatingConfigs(): Promise<ApiResponse<RatingConfigs>> {
		try {
			const response = await ApiClient.get<ApiResponse<RatingConfigs>>(
				API_ENDPOINTS.ADMIN.CONFIGURATIONS.RATINGS
			);
			return response;
		} catch (error) {
			console.error("Error al obtener configuraciones de valoraciones:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
				data: {},
			};
		}
	}

	/**
	 * Actualiza configuraciones de valoraciones
	 */
	async updateRatingConfigs(configs: {
		auto_approve_all: boolean;
		auto_approve_threshold: number;
	}): Promise<ApiResponse> {
		try {
			const response = await ApiClient.post<ApiResponse>(
				API_ENDPOINTS.ADMIN.CONFIGURATIONS.RATINGS,
				configs
			);
			return response;
		} catch (error) {
			console.error(
				"Error al actualizar configuraciones de valoraciones:",
				error
			);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
			};
		}
	}

	/**
	 * Obtiene estadísticas de valoraciones
	 */
	async getRatingStats(): Promise<ApiResponse<RatingStats>> {
		try {
			const response = await ApiClient.get<ApiResponse<RatingStats>>(
				API_ENDPOINTS.ADMIN.RATINGS.STATS
			);
			return response;
		} catch (error) {
			console.error("Error al obtener estadísticas de valoraciones:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
				data: {
					totalCount: 0,
					approvedCount: 0,
					pendingCount: 0,
					rejectedCount: 0,
				},
			};
		}
	}

	/**
	 * Aprueba todas las valoraciones pendientes
	 */
	async approveAllPendingRatings(): Promise<ApiResponse> {
		try {
			const response = await ApiClient.post<ApiResponse>(
				API_ENDPOINTS.ADMIN.RATINGS.APPROVE_ALL
			);
			return response;
		} catch (error) {
			console.error("Error al aprobar valoraciones pendientes:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
			};
		}
	}

	/**
	 * Obtiene todas las configuraciones del sistema
	 */
	async getAllConfigurations(): Promise<ApiResponse<Record<string, any>>> {
		try {
			const response = await ApiClient.get<ApiResponse<Record<string, any>>>(
				`${API_ENDPOINTS.ADMIN.CONFIGURATIONS.BASE}`
			);
			return response;
		} catch (error) {
			console.error("Error al obtener configuraciones:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
				data: {},
			};
		}
	}

	/**
	 * Obtiene configuraciones por categoría
	 */
	async getConfigurationsByCategory(category: string): Promise<ApiResponse<Record<string, any>>> {
		try {
			const response = await ApiClient.get<ApiResponse<Record<string, any>>>(
				`${API_ENDPOINTS.ADMIN.CONFIGURATIONS.BASE}/category?category=${category}`
			);
			return response;
		} catch (error) {
			console.error(`Error al obtener configuraciones de ${category}:`, error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
				data: {},
			};
		}
	}

	/**
	 * Actualiza configuraciones por categoría
	 */
	async updateConfigurationsByCategory(category: string, configs: Record<string, any>): Promise<ApiResponse> {
		try {
			const response = await ApiClient.post<ApiResponse>(
				`${API_ENDPOINTS.ADMIN.CONFIGURATIONS.BASE}/category`,
				{ category, configurations: configs }
			);
			return response;
		} catch (error) {
			console.error(`Error al actualizar configuraciones de ${category}:`, error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
			};
		}
	}

	/**
	 * Obtiene configuraciones generales
	 */
	async getGeneralConfigs(): Promise<ApiResponse<GeneralConfig>> {
		return this.getConfigurationsByCategory('general') as Promise<ApiResponse<GeneralConfig>>;
	}

	/**
	 * Actualiza configuraciones generales
	 */
	async updateGeneralConfigs(configs: Partial<GeneralConfig>): Promise<ApiResponse> {
		return this.updateConfigurationsByCategory('general', configs);
	}

	/**
	 * Obtiene configuraciones de seguridad
	 */
	async getSecurityConfigs(): Promise<ApiResponse<SecurityConfig>> {
		return this.getConfigurationsByCategory('security') as Promise<ApiResponse<SecurityConfig>>;
	}

	/**
	 * Actualiza configuraciones de seguridad
	 */
	async updateSecurityConfigs(configs: Partial<SecurityConfig>): Promise<ApiResponse> {
		return this.updateConfigurationsByCategory('security', configs);
	}

	/**
	 * Obtiene configuraciones de pagos
	 */
	async getPaymentConfigs(): Promise<ApiResponse<PaymentConfig>> {
		return this.getConfigurationsByCategory('payment') as Promise<ApiResponse<PaymentConfig>>;
	}

	/**
	 * Actualiza configuraciones de pagos
	 */
	async updatePaymentConfigs(configs: Partial<PaymentConfig>): Promise<ApiResponse> {
		return this.updateConfigurationsByCategory('payment', configs);
	}

	/**
	 * Obtiene configuraciones de email
	 */
	async getEmailConfigs(): Promise<ApiResponse<EmailConfig>> {
		return this.getConfigurationsByCategory('email') as Promise<ApiResponse<EmailConfig>>;
	}

	/**
	 * Actualiza configuraciones de email
	 */
	async updateEmailConfigs(configs: Partial<EmailConfig>): Promise<ApiResponse> {
		return this.updateConfigurationsByCategory('email', configs);
	}

	/**
	 * Obtiene configuraciones de moderación
	 */
	async getModerationConfigs(): Promise<ApiResponse<ModerationConfig>> {
		return this.getConfigurationsByCategory('moderation') as Promise<ApiResponse<ModerationConfig>>;
	}

	/**
	 * Actualiza configuraciones de moderación
	 */
	async updateModerationConfigs(configs: Partial<ModerationConfig>): Promise<ApiResponse> {
		return this.updateConfigurationsByCategory('moderation', configs);
	}

	/**
	 * Obtiene configuraciones de notificaciones
	 */
	async getNotificationConfigs(): Promise<ApiResponse<NotificationConfig>> {
		return this.getConfigurationsByCategory('notifications') as Promise<ApiResponse<NotificationConfig>>;
	}

	/**
	 * Actualiza configuraciones de notificaciones
	 */
	async updateNotificationConfigs(configs: Partial<NotificationConfig>): Promise<ApiResponse> {
		return this.updateConfigurationsByCategory('notifications', configs);
	}

	/**
	 * Obtiene configuraciones de límites del sistema
	 */
	async getSystemLimitsConfigs(): Promise<ApiResponse<SystemLimitsConfig>> {
		return this.getConfigurationsByCategory('limits') as Promise<ApiResponse<SystemLimitsConfig>>;
	}

	/**
	 * Actualiza configuraciones de límites del sistema
	 */
	async updateSystemLimitsConfigs(configs: Partial<SystemLimitsConfig>): Promise<ApiResponse> {
		return this.updateConfigurationsByCategory('limits', configs);
	}

	/**
	 * Obtiene configuraciones de integraciones
	 */
	async getIntegrationConfigs(): Promise<ApiResponse<IntegrationConfig>> {
		return this.getConfigurationsByCategory('integrations') as Promise<ApiResponse<IntegrationConfig>>;
	}

	/**
	 * Actualiza configuraciones de integraciones
	 */
	async updateIntegrationConfigs(configs: Partial<IntegrationConfig>): Promise<ApiResponse> {
		return this.updateConfigurationsByCategory('integrations', configs);
	}

	/**
	 * Obtiene configuraciones de backup
	 */
	async getBackupConfigs(): Promise<ApiResponse<BackupConfig>> {
		return this.getConfigurationsByCategory('backup') as Promise<ApiResponse<BackupConfig>>;
	}

	/**
	 * Actualiza configuraciones de backup
	 */
	async updateBackupConfigs(configs: Partial<BackupConfig>): Promise<ApiResponse> {
		return this.updateConfigurationsByCategory('backup', configs);
	}

	/**
	 * Obtiene configuraciones de descuentos por volumen
	 */
	async getVolumeDiscountConfigs(): Promise<ApiResponse<Record<string, any>>> {
		try {
			const response = await ApiClient.get<ApiResponse<Record<string, any>>>(
				API_ENDPOINTS.ADMIN.VOLUME_DISCOUNTS.CONFIGURATION
			);
			return response;
		} catch (error) {
			console.error("Error al obtener configuraciones de descuentos por volumen:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
				data: {},
			};
		}
	}

	/**
	 * Actualiza configuraciones de descuentos por volumen
	 */
	async updateVolumeDiscountConfigs(configs: {
		enabled: boolean;
		stackable: boolean;
		show_savings_message: boolean;
		default_tiers: Array<{
			quantity: number;
			discount: number;
			label: string;
		}>;
	}): Promise<ApiResponse> {
		try {
			const response = await ApiClient.post<ApiResponse>(
				API_ENDPOINTS.ADMIN.VOLUME_DISCOUNTS.CONFIGURATION,
				configs
			);
			return response;
		} catch (error) {
			console.error("Error al actualizar configuraciones de descuentos por volumen:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
			};
		}
	}
}

export default ConfigurationService;
