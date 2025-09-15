/**
 * 🚨 RESCUE ADAPTER - ConfigurationService
 * Adaptador inteligente que rescata los componentes admin existentes
 * Usa ConfigurationManager internamente + endpoints directos para datos específicos
 */

import ConfigurationManager from './ConfigurationManager';
import ApiClient from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

// ===============================================
// 🎯 INTERFACES DE CONFIGURACIÓN ESPECÍFICAS
// ===============================================

export interface DevelopmentConfig {
  mode: boolean;
  allowAdminOnlyAccess: boolean;
  bypassEmailVerification: boolean;
  requireEmailVerification: boolean;
  emailVerificationTimeout: number;
}

export interface ModerationConfig {
  auto_approval: boolean;
  review_threshold: number;
  enable_user_reports: boolean;
  auto_suspend_threshold: number;
  manual_review_required: boolean;
  userStrikesThreshold: number;
  lowStockThreshold: number;
  contactScorePenalty: number;
  businessScoreBonus: number;
  contactPenaltyHeavy: number;
  minimumContactScore: number;
  scoreDifferenceThreshold: number;
  consecutiveNumbersLimit: number;
  numbersWithContextLimit: number;
}

export interface SecurityConfig {
  password_rules: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special_chars: boolean;
  };
  max_login_attempts: number;
  lockout_duration: number;
  passwordMinLength: number;
  passwordRequireSpecial: boolean;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  accountLockAttempts: number;
  sessionTimeout: number; // minutos - unified field from backend
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
  adminIpRestriction: boolean;
}

export interface RatingConfig {
  min_rating: number;
  max_rating: number;
  allow_anonymous: boolean;
  require_purchase: boolean;
  enable_reviews: boolean;
  auto_publish_reviews: boolean;
  auto_approve_all: boolean;
  auto_approve_threshold: number;
  'ratings.auto_approve_all': boolean;
  'ratings.auto_approve_threshold': number;
}

// ===============================================
// 🎯 RESPONSE INTERFACES (API Compatible)
// ===============================================

interface ConfigurationResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// ===============================================
// 🚨 CONFIGURATION SERVICE ADAPTER
// ===============================================

// Interface para Volume Discount (requerido por VolumeDiscountManager)
export interface VolumeDiscountConfig {
  enabled: boolean;
  stackable: boolean;
  default_tiers: Array<{
    quantity: number;
    discount: number;
    label: string;
  }>;
}

class ConfigurationService {
  constructor() {
    // ConfigurationManager se usa a través del singleton cuando es necesario
  }

  // 🔧 DEVELOPMENT CONFIGURATIONS
  async getDevelopmentConfigs(): Promise<ConfigurationResponse<DevelopmentConfig>> {
    try {
      const response: any = await ApiClient.get(API_ENDPOINTS.ADMIN.CONFIGURATIONS.DEVELOPMENT);
      
      if (response?.data) {
        const config: DevelopmentConfig = {
          mode: response.data.mode || false,
          allowAdminOnlyAccess: response.data.allowAdminOnlyAccess || false,
          bypassEmailVerification: response.data.bypassEmailVerification || true,
          requireEmailVerification: response.data.requireEmailVerification || false,
          emailVerificationTimeout: response.data.emailVerificationTimeout || 24,
        };

        return {
          status: 'success',
          data: config
        };
      }

      // Fallback con valores por defecto
      return {
        status: 'success',
        data: {
          mode: false,
          allowAdminOnlyAccess: false,
          bypassEmailVerification: true,
          requireEmailVerification: false,
          emailVerificationTimeout: 24,
        }
      };
    } catch (error) {
      console.error('Error getting development configs:', error);
      return {
        status: 'error',
        message: 'Error al obtener configuraciones de desarrollo'
      };
    }
  }

  async updateDevelopmentConfigs(config: DevelopmentConfig): Promise<ConfigurationResponse<DevelopmentConfig>> {
    try {
      await ApiClient.post(API_ENDPOINTS.ADMIN.CONFIGURATIONS.UPDATE, {
        type: 'development',
        config
      });

      // ✅ INVALIDAR CACHE para propagar cambios inmediatamente
      ConfigurationManager.getInstance().invalidateCache();

      return {
        status: 'success',
        data: config,
        message: 'Configuración actualizada correctamente'
      };
    } catch (error) {
      console.error('Error updating development configs:', error);
      return {
        status: 'error',
        message: 'Error al actualizar configuraciones'
      };
    }
  }

  // 🔧 MODERATION CONFIGURATIONS  
  async getModerationConfigs(): Promise<ConfigurationResponse<ModerationConfig>> {
    try {
      const response: any = await ApiClient.get(API_ENDPOINTS.ADMIN.CONFIGURATIONS.INDEX);
      
      // Extraer configuraciones de moderación desde la respuesta general
      const moderationData = response?.data?.moderation;

      const config: ModerationConfig = {
        auto_approval: moderationData?.auto_approval || true,
        review_threshold: moderationData?.review_threshold || 3,
        enable_user_reports: moderationData?.enable_user_reports || true,
        auto_suspend_threshold: moderationData?.auto_suspend_threshold || 5,
        manual_review_required: moderationData?.manual_review_required || false,
        userStrikesThreshold: moderationData?.userStrikesThreshold || 3,
        lowStockThreshold: moderationData?.lowStockThreshold || 5,
        contactScorePenalty: moderationData?.contactScorePenalty || 10,
        businessScoreBonus: moderationData?.businessScoreBonus || 5,
        contactPenaltyHeavy: moderationData?.contactPenaltyHeavy || 20,
        minimumContactScore: moderationData?.minimumContactScore || 50,
        scoreDifferenceThreshold: moderationData?.scoreDifferenceThreshold || 30,
        consecutiveNumbersLimit: moderationData?.consecutiveNumbersLimit || 3,
        numbersWithContextLimit: moderationData?.numbersWithContextLimit || 5,
      };

      return {
        status: 'success',
        data: config
      };
    } catch (error) {
      console.error('Error getting moderation configs:', error);
      return {
        status: 'error',
        message: 'Error al obtener configuraciones de moderación'
      };
    }
  }

  async updateModerationConfigs(config: ModerationConfig): Promise<ConfigurationResponse<ModerationConfig>> {
    try {
      await ApiClient.post(API_ENDPOINTS.ADMIN.CONFIGURATIONS.UPDATE, {
        type: 'moderation',
        config
      });

      // ✅ INVALIDAR CACHE para propagar cambios inmediatamente
      ConfigurationManager.getInstance().invalidateCache();

      return {
        status: 'success',
        data: config,
        message: 'Configuración de moderación actualizada'
      };
    } catch (error) {
      console.error('Error updating moderation configs:', error);
      return {
        status: 'error',
        message: 'Error al actualizar configuraciones de moderación'
      };
    }
  }

  // 🔧 SECURITY CONFIGURATIONS
  async getSecurityConfigs(): Promise<ConfigurationResponse<SecurityConfig>> {
    try {
      const response: any = await ApiClient.get(API_ENDPOINTS.ADMIN.CONFIGURATIONS.PASSWORD_VALIDATION_RULES);
      
      const config: SecurityConfig = {
        password_rules: {
          min_length: response?.data?.min_length || 8,
          require_uppercase: response?.data?.require_uppercase || true,
          require_lowercase: response?.data?.require_lowercase || true,
          require_numbers: response?.data?.require_numbers || true,
          require_special_chars: response?.data?.require_special_chars || false,
        },
        session_timeout: response?.data?.session_timeout || 3600, // 1 hora
        max_login_attempts: response?.data?.max_login_attempts || 5,
        lockout_duration: response?.data?.lockout_duration || 900, // 15 minutos
        passwordMinLength: response?.data?.min_length || 8,
        passwordRequireSpecial: response?.data?.require_special_chars || false,
        passwordRequireUppercase: response?.data?.require_uppercase || true,
        passwordRequireNumbers: response?.data?.require_numbers || true,
        accountLockAttempts: response?.data?.max_login_attempts || 5,
        sessionTimeout: response?.data?.session_timeout || parseInt(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES || '120'),
        requireEmailVerification: response?.data?.require_email_verification || true,
        enableTwoFactor: response?.data?.enable_two_factor || false,
        adminIpRestriction: response?.data?.admin_ip_restriction || false,
      };

      return {
        status: 'success',
        data: config
      };
    } catch (error) {
      console.error('Error getting security configs:', error);
      return {
        status: 'error',
        message: 'Error al obtener configuraciones de seguridad'
      };
    }
  }

  async updateSecurityConfigs(config: SecurityConfig): Promise<ConfigurationResponse<SecurityConfig>> {
    try {
      await ApiClient.post(API_ENDPOINTS.ADMIN.CONFIGURATIONS.PASSWORD_VALIDATION_RULES, config.password_rules);

      // ✅ INVALIDAR CACHE para propagar cambios inmediatamente
      ConfigurationManager.getInstance().invalidateCache();

      return {
        status: 'success',
        data: config,
        message: 'Configuración de seguridad actualizada'
      };
    } catch (error) {
      console.error('Error updating security configs:', error);
      return {
        status: 'error',
        message: 'Error al actualizar configuraciones de seguridad'
      };
    }
  }

  // 🔧 RATING CONFIGURATIONS
  async getRatingConfigs(): Promise<ConfigurationResponse<RatingConfig>> {
    try {
      const response: any = await ApiClient.get(API_ENDPOINTS.ADMIN.CONFIGURATIONS.RATINGS);
      
      const config: RatingConfig = {
        min_rating: response?.data?.min_rating || 1,
        max_rating: response?.data?.max_rating || 5,
        allow_anonymous: response?.data?.allow_anonymous || false,
        require_purchase: response?.data?.require_purchase || true,
        enable_reviews: response?.data?.enable_reviews || true,
        auto_publish_reviews: response?.data?.auto_publish_reviews || false,
        auto_approve_all: response?.data?.auto_approve_all || false,
        auto_approve_threshold: response?.data?.auto_approve_threshold || 4,
        'ratings.auto_approve_all': response?.data?.auto_approve_all || false,
        'ratings.auto_approve_threshold': response?.data?.auto_approve_threshold || 4,
      };

      return {
        status: 'success',
        data: config
      };
    } catch (error) {
      console.error('Error getting rating configs:', error);
      return {
        status: 'error',
        message: 'Error al obtener configuraciones de calificaciones'
      };
    }
  }

  async updateRatingConfigs(config: RatingConfig): Promise<ConfigurationResponse<RatingConfig>> {
    try {
      await ApiClient.post(API_ENDPOINTS.ADMIN.CONFIGURATIONS.RATINGS, config);

      // ✅ INVALIDAR CACHE para propagar cambios inmediatamente
      ConfigurationManager.getInstance().invalidateCache();

      return {
        status: 'success',
        data: config,
        message: 'Configuración de calificaciones actualizada'
      };
    } catch (error) {
      console.error('Error updating rating configs:', error);
      return {
        status: 'error',
        message: 'Error al actualizar configuraciones de calificaciones'
      };
    }
  }

  // 🔧 VOLUME DISCOUNT CONFIGURATIONS (requerido por VolumeDiscountManager)
  async getVolumeDiscountConfigs(): Promise<ConfigurationResponse<VolumeDiscountConfig>> {
    try {
      const response: any = await ApiClient.get(API_ENDPOINTS.ADMIN.VOLUME_DISCOUNTS.CONFIGURATION);
      
      const config: VolumeDiscountConfig = {
        enabled: response?.data?.enabled || true,
        stackable: response?.data?.stackable || false,
        default_tiers: response?.data?.default_tiers || [
          { quantity: 3, discount: 5, label: "3+" },
          { quantity: 5, discount: 8, label: "5+" },
          { quantity: 10, discount: 15, label: "10+" }
        ],
      };

      return {
        status: 'success',
        data: config
      };
    } catch (error) {
      console.error('Error getting volume discount configs:', error);
      return {
        status: 'error',
        message: 'Error al obtener configuraciones de descuentos por volumen'
      };
    }
  }

  async updateVolumeDiscountConfigs(config: VolumeDiscountConfig): Promise<ConfigurationResponse<VolumeDiscountConfig>> {
    try {
      await ApiClient.post(API_ENDPOINTS.ADMIN.VOLUME_DISCOUNTS.CONFIGURATION, config);

      // ✅ INVALIDAR CACHE para propagar cambios inmediatamente
      ConfigurationManager.getInstance().invalidateCache();

      return {
        status: 'success',
        data: config,
        message: 'Configuración de descuentos por volumen actualizada'
      };
    } catch (error) {
      console.error('Error updating volume discount configs:', error);
      return {
        status: 'error',
        message: 'Error al actualizar configuraciones de descuentos por volumen'
      };
    }
  }

  // 🔧 RATING STATS AND ADDITIONAL METHODS (requerido por RatingConfiguration)
  async getRatingStats(): Promise<ConfigurationResponse<any>> {
    try {
      const response: any = await ApiClient.get(`${API_ENDPOINTS.ADMIN.CONFIGURATIONS.RATINGS}/stats`);
      
      return {
        status: 'success',
        data: response?.data || {}
      };
    } catch (error) {
      console.error('Error getting rating stats:', error);
      return {
        status: 'error',
        message: 'Error al obtener estadísticas de calificaciones'
      };
    }
  }

  async approveAllPendingRatings(): Promise<ConfigurationResponse<any>> {
    try {
      const response: any = await ApiClient.post(`${API_ENDPOINTS.ADMIN.CONFIGURATIONS.RATINGS}/approve-all`);
      
      return {
        status: 'success',
        data: response?.data || {},
        message: 'Todas las calificaciones pendientes han sido aprobadas'
      };
    } catch (error) {
      console.error('Error approving pending ratings:', error);
      return {
        status: 'error',
        message: 'Error al aprobar calificaciones pendientes'
      };
    }
  }
}

export default ConfigurationService;