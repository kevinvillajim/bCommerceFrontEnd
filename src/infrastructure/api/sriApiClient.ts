import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";

interface SriAuthResponse {
  token: string;
  user?: any;
}

interface SriProfileResponse {
  success: boolean;
  data: {
    company: {
      ruc: string;
      razon_social: string;
      nombre_comercial: string;
      direccion_matriz: string;
      telefono: string;
      email_facturacion: string;
      establecimiento: string;
      punto_emision: string;
      obligado_contabilidad: string;
    };
  };
  message?: string;
}

interface SriUpdateProfileRequest {
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  direccion_matriz: string;
  telefono: string;
  email_facturacion: string;
  establecimiento: string;
  punto_emision: string;
  obligado_contabilidad: string;
}

interface SriCertificateUploadResponse {
  success: boolean;
  data?: {
    id: number;
    alias: string;
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    isActive: boolean;
  };
  message?: string;
}

interface SriActiveCertificateResponse {
  success: boolean;
  data?: {
    certificate: {
      id: number;
      alias?: string;
      subject: string;
      issuer: string;
      valid_from: string;
      valid_to: string;
      is_active: boolean;
      status: string;
    };
  };
  message?: string;
}

interface Certificate {
  id: number;
  alias: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  daysUntilExpiry: number;
  status: 'vigente' | 'vencido' | 'proximo_vencer';
  algorithm?: string;
  keySize?: number;
  fingerprint?: string;
  fechaSubida?: string;
  ultimoUso?: string;
}

interface CertificateListResponse {
  success: boolean;
  data: {
    certificates: any[]; // Usando any[] porque la estructura del backend es diferente
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

interface ActivateCertificateResponse {
  success: boolean;
  data?: {
    certificateId: number;
    alias: string;
    isActive: boolean;
    previousActiveId?: number;
  };
  message?: string;
}

interface CertificateLimitsResponse {
  success: boolean;
  data: {
    limits: {
      maxAllowed: number;
      currentCount: number;
      remainingSlots: number;
      limitReached: boolean;
    };
    breakdown: {
      total: number;
      active: number;
      expired: number;
      inactive: number;
    };
    suggestion: string;
  };
  message?: string;
}

export class SriApiClient {
  private static instance: SriApiClient;
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private readonly apiUrl: string;
  private readonly email: string;
  private readonly password: string;

  private constructor() {
    // Usar variables de entorno para configuración
    this.apiUrl = import.meta.env.VITE_SRI_API_URL || 'http://localhost:3100';
    this.email = import.meta.env.VITE_SRI_EMAIL || 'businessconnect@businessconnect.com.ec';
    this.password = import.meta.env.VITE_SRI_PASSWORD || 'dalcroze77aA@';

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
      withCredentials: false, // Explícitamente no usar credentials
    });

    // Response interceptor para manejo de errores
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        console.error('SriApiClient Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): SriApiClient {
    if (!SriApiClient.instance) {
      SriApiClient.instance = new SriApiClient();
    }
    return SriApiClient.instance;
  }

  /**
   * Ejecuta una operación con retry automático para errores de conexión y autenticación
   */
  private async executeWithRetry<T>(operation: (token: string) => Promise<T>, maxRetries: number = 2): Promise<T> {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Intentar autenticarse
        let token = await this.authenticate();

        try {
          // Ejecutar la operación
          return await operation(token);
        } catch (error: any) {
          lastError = error;

          // Si es error 401, limpiar token y reintentar
          if (error.response?.status === 401) {
            console.log(`🔄 Token expirado (intento ${attempt}/${maxRetries}), reautenticando...`);
            this.authToken = null;
            continue; // Reintentar
          }

          // Si es error de conexión, reintentar
          if (this.isConnectionError(error)) {
            console.log(`🔄 Error de conexión (intento ${attempt}/${maxRetries}), reintentando...`);
            this.authToken = null; // Limpiar token para reautenticar
            await this.delay(1000 * attempt); // Esperar antes de reintentar
            continue; // Reintentar
          }

          // Para otros errores, no reintentar
          throw error;
        }
      } catch (authError: any) {
        lastError = authError;

        // Si es error de conexión en autenticación, reintentar
        if (this.isConnectionError(authError)) {
          console.log(`🔄 Error de conexión en autenticación (intento ${attempt}/${maxRetries}), reintentando...`);
          this.authToken = null;
          await this.delay(1000 * attempt); // Esperar antes de reintentar
          continue;
        }

        // Para otros errores de autenticación, no reintentar
        throw authError;
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    throw lastError;
  }

  /**
   * Verifica si un error es de conexión
   */
  private isConnectionError(error: any): boolean {
    return error.code === 'ERR_NETWORK' ||
           error.code === 'ERR_CONNECTION_REFUSED' ||
           error.code === 'ECONNREFUSED' ||
           error.message?.includes('Network Error') ||
           error.message?.includes('connect ECONNREFUSED');
  }

  /**
   * Espera un tiempo determinado
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Autentica con la API SRI y obtiene JWT token
   */
  private async authenticate(): Promise<string> {
    try {
      console.log('🔐 Autenticando con API SRI...', {
        email: this.email,
        apiUrl: this.apiUrl
      });

      const response = await this.axiosInstance.post<SriAuthResponse>('/api/auth/login', {
        email: this.email,
        password: this.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.token) {
        throw new Error('No se recibió token de autenticación');
      }

      this.authToken = response.data.token;
      console.log('✅ Autenticación exitosa con API SRI');

      return this.authToken;
    } catch (error) {
      console.error('❌ Error en autenticación SRI:', error);
      this.authToken = null; // Limpiar token si falla
      throw new Error('Error de autenticación con API SRI: ' + (error as Error).message);
    }
  }

  /**
   * Realiza petición GET autenticada con retry en caso de 401 o errores de conexión
   */
  private async authenticatedGet<T>(url: string): Promise<T> {
    return this.executeWithRetry(async (token: string) => {
      const response = await this.axiosInstance.get<T>(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    });
  }

  /**
   * Realiza petición PUT autenticada con retry
   */
  private async authenticatedPut<T>(url: string, data: any): Promise<T> {
    return this.executeWithRetry(async (token: string) => {
      const response = await this.axiosInstance.put<T>(url, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    });
  }

  /**
   * Realiza petición POST autenticada con retry
   */
  private async authenticatedPost<T>(url: string, data: any, config?: any): Promise<T> {
    return this.executeWithRetry(async (token: string) => {
      const headers = {
        'Authorization': `Bearer ${token}`,
        ...config?.headers
      };

      console.log('🔗 Realizando POST a:', url);
      console.log('🎫 Token:', token.substring(0, 20) + '...');

      const requestConfig = {
        headers,
        ...config
      };

      // Para FormData, asegurar que los headers no se pierdan en CORS
      if (data instanceof FormData) {
        console.log('🔧 Configurando petición FormData con headers CORS seguros');
        requestConfig.withCredentials = false;
        requestConfig.headers = {
          ...requestConfig.headers,
          'Authorization': headers['Authorization']
        };
      }

      const response = await this.axiosInstance.post<T>(url, data, requestConfig);

      console.log('✅ POST exitoso:', response.status);
      return response.data;
    });
  }

  /**
   * Realiza petición DELETE autenticada con retry
   */
  private async authenticatedDelete<T>(url: string): Promise<T> {
    return this.executeWithRetry(async (token: string) => {
      const response = await this.axiosInstance.delete<T>(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    });
  }

  /**
   * Obtiene el perfil de la empresa desde la API SRI
   */
  public async getProfile(): Promise<SriProfileResponse> {
    try {
      console.log('📋 Obteniendo perfil de empresa desde API SRI...');
      const response = await this.authenticatedGet<SriProfileResponse>('/api/auth/profile');
      console.log('✅ Perfil obtenido exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      throw error;
    }
  }

  /**
   * Actualiza el perfil de la empresa en la API SRI
   */
  public async updateProfile(profileData: SriUpdateProfileRequest): Promise<SriProfileResponse> {
    try {
      console.log('💾 Actualizando perfil de empresa en API SRI...', profileData);
      const response = await this.authenticatedPut<SriProfileResponse>('/api/users/profile', profileData);
      console.log('✅ Perfil actualizado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Sube un certificado digital a la API SRI
   */
  public async uploadCertificate(certificateFile: File, password: string, alias?: string): Promise<SriCertificateUploadResponse> {
    try {
      console.log('📤 INICIANDO UPLOAD DE CERTIFICADO:', {
        fileName: certificateFile.name,
        fileSize: certificateFile.size,
        alias,
        authToken: this.authToken ? 'PRESENTE' : 'AUSENTE',
        apiUrl: this.apiUrl
      });

      const formData = new FormData();
      formData.append('certificate', certificateFile);
      formData.append('password', password);
      
      if (alias) {
        formData.append('alias', alias);
      }

      const response = await this.authenticatedPost<SriCertificateUploadResponse>(
        '/api/certificates/upload', 
        formData,
        {
          headers: {
            // No establecer Content-Type para FormData - axios lo maneja automáticamente
          }
        }
      );

      console.log('✅ Certificado subido exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error subiendo certificado:', error);
      throw error;
    }
  }

  /**
   * Elimina un certificado digital de la API SRI
   */
  public async deleteCertificate(certificateId: number): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🗑️ Eliminando certificado de API SRI...', { certificateId });
      
      const response = await this.authenticatedDelete<{ success: boolean; message?: string }>(
        `/api/certificates/${certificateId}`
      );

      console.log('✅ Certificado eliminado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error eliminando certificado:', error);
      throw error;
    }
  }

  /**
   * Obtiene el certificado activo de la API SRI
   */
  public async getActiveCertificate(): Promise<SriActiveCertificateResponse> {
    try {
      console.log('📋 Obteniendo certificado activo desde API SRI...');
      const response = await this.authenticatedGet<SriActiveCertificateResponse>('/api/certificates/active');
      console.log('✅ Certificado activo obtenido:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo certificado activo:', error);
      throw error;
    }
  }

  /**
   * Prueba la conectividad con la API SRI
   */
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔗 Probando conexión con API SRI...');
      
      const token = await this.authenticate();
      
      const response = await this.axiosInstance.get('/health', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });

      const result = {
        success: response.status >= 200 && response.status < 300,
        message: response.status >= 200 && response.status < 300 
          ? 'Conexión exitosa con API SRI' 
          : `Error de conexión: HTTP ${response.status}`
      };

      console.log('📊 Resultado de prueba de conexión:', result);
      return result;
    } catch (error) {
      const result = {
        success: false,
        message: 'Error de conexión con API SRI: ' + (error as Error).message
      };
      console.log('❌ Error en prueba de conexión:', result);
      return result;
    }
  }

  /**
   * Lista todos los certificados del usuario
   */
  public async listCertificates(page = 1, limit = 50): Promise<CertificateListResponse> {
    try {
      console.log('📋 Obteniendo lista de certificados desde API SRI...', { page, limit });

      const response = await this.authenticatedGet<CertificateListResponse>(
        `/api/certificates?page=${page}&limit=${limit}`
      );

      console.log('✅ Lista de certificados obtenida:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo lista de certificados:', error);
      throw error;
    }
  }

  /**
   * Activa un certificado específico
   */
  public async activateCertificate(certificateId: number): Promise<ActivateCertificateResponse> {
    try {
      console.log('⚡ Activando certificado...', { certificateId });

      const response = await this.authenticatedPut<ActivateCertificateResponse>(
        `/api/certificates/${certificateId}/activate`,
        {} // Body vacío para PUT
      );

      console.log('✅ Certificado activado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error activando certificado:', error);
      throw error;
    }
  }

  /**
   * Obtiene los límites de certificados del usuario
   */
  public async getCertificateLimits(): Promise<CertificateLimitsResponse> {
    try {
      console.log('📊 Obteniendo límites de certificados desde API SRI...');

      const response = await this.authenticatedGet<CertificateLimitsResponse>('/api/certificates/limits');

      console.log('✅ Límites de certificados obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo límites de certificados:', error);
      throw error;
    }
  }

  /**
   * Limpia el token de autenticación (para logout)
   */
  public clearAuth(): void {
    this.authToken = null;
    console.log('Token de autenticación SRI limpiado');
  }
}

// Exportar instancia singleton
export default SriApiClient.getInstance();