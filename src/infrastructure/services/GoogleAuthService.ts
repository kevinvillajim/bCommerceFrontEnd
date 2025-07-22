// src/infrastructure/services/GoogleAuthService.ts - CORREGIDO PARA PRODUCCIÓN

interface GoogleAuthResponse {
  success: boolean;
  user?: any;
  error?: string;
}

export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private isInitialized = false;
  private clientId = '581090375629-kds9jjgs2pk60iqe05fmjhpf6pps2nsv.apps.googleusercontent.com';
  private baseApiUrl = import.meta.env.VITE_API_URL || 'https://api.comersia.app/api';

  private constructor() {}

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Método principal - Siempre usa redirect en producción
   */
  async authenticateWithGoogle(action: 'login' | 'register'): Promise<GoogleAuthResponse> {
    try {
      console.log(`🔐 Iniciando ${action} con Google...`);
      
      // Debug info para producción
      console.log('🔍 Debug OAuth:', {
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        isProduction: this.isProduction(),
        baseApiUrl: this.baseApiUrl,
        clientId: this.clientId.substring(0, 20) + '...'
      });
      
      // En producción, siempre usar redirect (más confiable)
      if (this.shouldUseRedirect()) {
        console.log('🔄 Usando método redirect (recomendado para producción)');
        return this.authenticateWithRedirect(action);
      }

      // Solo intentar FedCM en localhost si está disponible
      console.log('🆕 Intentando método FedCM...');
      await this.initialize();
      return this.authenticateWithFedCM(action);
      
    } catch (error) {
      console.error('❌ Error en authenticateWithGoogle:', error);
      
      // Fallback a redirect siempre
      console.log('🔄 Fallback a método redirect...');
      return this.authenticateWithRedirect(action);
    }
  }

  /**
   * Método de redirect (más confiable para producción)
   */
  private async authenticateWithRedirect(action: 'login' | 'register'): Promise<GoogleAuthResponse> {
    try {
      console.log(`🔄 Usando método de redirect para ${action}...`);
      
      // Guardar estado en localStorage
      localStorage.setItem('google_oauth_action', action);
      localStorage.setItem('google_oauth_return_url', window.location.pathname);
      
      // Verificar configuración antes de redirigir
      if (!this.clientId || !this.baseApiUrl) {
        throw new Error('Configuración de Google OAuth incompleta');
      }
      
      // Redirigir al backend
      const redirectUrl = `${this.baseApiUrl}/auth/google/redirect?action=${action}`;
      console.log('🌐 Redirigiendo a:', redirectUrl);
      
      window.location.href = redirectUrl;
      
      // Esta promesa nunca se resuelve porque redirigimos
      return new Promise(() => {});
      
    } catch (error) {
      console.error('❌ Error en método de redirect:', error);
      return {
        success: false,
        error: 'Error al iniciar autenticación con Google'
      };
    }
  }

  /**
   * Método FedCM (solo para localhost/desarrollo)
   */
  private async authenticateWithFedCM(action: 'login' | 'register'): Promise<GoogleAuthResponse> {
    try {
      console.log(`🆕 Usando método FedCM para ${action}...`);

      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services no está disponible');
      }

      return new Promise((resolve) => {
        // Verificar que window.google existe antes de usar
        if (!window.google?.accounts?.id) {
          resolve({
            success: false,
            error: 'Google Identity Services no disponible'
          });
          return;
        }

        // Configuración simplificada sin métodos deprecados
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: async (response: any) => {
            try {
              const result = await this.sendCredentialToBackend(response.credential, action);
              resolve(result);
            } catch (error) {
              console.error('❌ Error procesando credential:', error);
              resolve({
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
              });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          // Configuración básica sin opciones experimentales
          itp_support: true,
        });

        // Timeout para evitar que se quede colgado
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            error: 'Timeout en la autenticación con Google'
          });
        }, 30000); // 30 segundos

        // Mostrar prompt con manejo simplificado
        if (window.google?.accounts?.id) {
          window.google.accounts.id.prompt((notification: any) => {
            console.log('📊 Notification:', notification);
            clearTimeout(timeout);
            
            // Usar getMomentType() si está disponible, sino usar los métodos legacy
            const momentType = notification.getMomentType?.();
            
            if (momentType) {
              // Nuevo API
              if (momentType === 'dismissed' || momentType === 'skipped') {
                console.log('❌ Prompt fue cerrado o saltado (nuevo API)');
                resolve({
                  success: false,
                  error: 'Autenticación cancelada por el usuario'
                });
              }
            } else {
              // API legacy como fallback
              if (notification.isNotDisplayed?.()) {
                console.log('❌ Prompt no se mostró');
                resolve({
                  success: false,
                  error: 'No se pudo mostrar el prompt de Google'
                });
              } else if (notification.isSkippedMoment?.()) {
                console.log('⏭️ Prompt fue omitido');
                resolve({
                  success: false,
                  error: 'Autenticación omitida por el usuario'
                });
              } else if (notification.isDismissedMoment?.()) {
                console.log('❌ Prompt fue cerrado');
                resolve({
                  success: false,
                  error: 'Autenticación cancelada por el usuario'
                });
              }
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Error en método FedCM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en FedCM'
      };
    }
  }

  /**
   * Inicializar Google Identity Services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadGoogleScript();
      this.isInitialized = true;
      console.log('✅ Google Identity Services inicializado');
    } catch (error) {
      console.error('❌ Error inicializando Google Identity Services:', error);
      throw error;
    }
  }

  /**
   * Cargar script de Google
   */
  private async loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="accounts.google.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Error cargando script')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setTimeout(() => resolve(), 200);
      };
      
      script.onerror = () => {
        reject(new Error('Error cargando script de Google'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Determinar si debe usar redirect - SIEMPRE true en producción
   */
  private shouldUseRedirect(): boolean {
    // En producción (comersia.app), SIEMPRE usar redirect
    const isProduction = this.isProduction();
    const forceRedirect = localStorage.getItem('google_auth_force_redirect') === 'true';
    const isLocalhost = window.location.hostname === 'localhost';
    
    // Usar redirect en producción, cuando está forzado, o en localhost por defecto
    return isProduction || forceRedirect || isLocalhost;
  }

  /**
   * Verificar si estamos en producción
   */
  private isProduction(): boolean {
    return window.location.hostname === 'comersia.app';
  }

  /**
   * Enviar credential al backend
   */
  private async sendCredentialToBackend(credential: string, action: 'login' | 'register'): Promise<GoogleAuthResponse> {
    try {
      console.log('📤 Enviando credential al backend...', {
        action,
        apiUrl: this.baseApiUrl,
        credentialLength: credential.length
      });

      const response = await fetch(`${this.baseApiUrl}/auth/google/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          token: credential,
          action: action
        })
      });

      console.log('📥 Respuesta del backend:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la autenticación');
      }

      console.log('✅ Backend response exitosa');
      return {
        success: true,
        user: data
      };
    } catch (error) {
      console.error('❌ Error enviando credential al backend:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de comunicación'
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut(): Promise<void> {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      localStorage.removeItem('google_oauth_action');
      localStorage.removeItem('google_oauth_return_url');
      localStorage.removeItem('google_auth_force_redirect');
      
      console.log('✅ Sesión de Google cerrada');
    } catch (error) {
      console.warn('Error al cerrar sesión de Google:', error);
    }
  }

  /**
   * Configurar para usar método específico
   */
  setAuthMethod(method: 'redirect' | 'fedcm'): void {
    console.log('🔧 Configurando método de auth:', method);
    localStorage.setItem('google_auth_force_redirect', method === 'redirect' ? 'true' : 'false');
  }

  /**
   * Verificar configuración
   */
  async checkConfiguration(): Promise<{ isConfigured: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    console.log('🔍 Verificando configuración de Google OAuth...');
    
    // Verificar Client ID
    if (!this.clientId || this.clientId.includes('your-google-client-id')) {
      errors.push('Client ID de Google no configurado correctamente');
    }
    
    // Verificar API URL
    if (!this.baseApiUrl) {
      errors.push('URL del API no configurada');
    }
    
    // Verificar si estamos en origen seguro
    const isSecureOrigin = location.protocol === 'https:' || location.hostname === 'localhost';
    if (!isSecureOrigin) {
      errors.push('Google OAuth requiere origen seguro (HTTPS o localhost)');
    }
    
    // Verificar FedCM support (solo warning)
    if (!window.CredentialsContainer && !this.isProduction()) {
      warnings.push('FedCM no está disponible en este navegador');
    }
    
    // En producción, recomendar redirect
    if (this.isProduction()) {
      console.log('🏭 Producción detectada - usando método redirect');
    }
    
    // Test básico de conectividad (no bloquear si falla)
    try {
      const testImg = new Image();
      testImg.src = 'https://accounts.google.com/favicon.ico';
    } catch (error) {
      warnings.push('Posible problema con Content Security Policy');
    }
    
    const result = {
      isConfigured: errors.length === 0,
      errors,
      warnings
    };

    console.log('📊 Resultado de configuración:', result);
    
    return result;
  }

  /**
   * Diagnóstico completo para debugging
   */
  async diagnose(): Promise<void> {
    console.log('🔬 === DIAGNÓSTICO GOOGLE OAUTH ===');
    
    const config = await this.checkConfiguration();
    
    console.log('🌍 Entorno:', {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
      isProduction: this.isProduction(),
      shouldUseRedirect: this.shouldUseRedirect()
    });
    
    console.log('⚙️ Configuración:', {
      clientId: this.clientId.substring(0, 20) + '...',
      baseApiUrl: this.baseApiUrl,
      hasGoogleScript: !!window.google,
      isConfigured: config.isConfigured
    });
    
    if (config.errors.length > 0) {
      console.log('❌ Errores:', config.errors);
    }
    
    if (config.warnings.length > 0) {
      console.log('⚠️ Advertencias:', config.warnings);
    }
    
    console.log('💾 LocalStorage:', {
      oauth_action: localStorage.getItem('google_oauth_action'),
      return_url: localStorage.getItem('google_oauth_return_url'),
      force_redirect: localStorage.getItem('google_auth_force_redirect')
    });
    
    console.log('🔬 === FIN DIAGNÓSTICO ===');
  }
}

// Declaraciones globales para TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement | null, config: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
    CredentialsContainer?: any;
  }
}

export default GoogleAuthService;