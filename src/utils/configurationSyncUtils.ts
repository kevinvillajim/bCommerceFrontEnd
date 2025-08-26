/**
 * ✅ UTILIDADES DE SINCRONIZACIÓN DE CONFIGURACIÓN
 * Herramientas para mantener el frontend sincronizado con el backend
 */

import ConfigurationManager from '../core/services/ConfigurationManager';

/**
 * Invalidar cache de configuraciones
 * Útil cuando se detecta que las configuraciones han cambiado
 */
export function invalidateConfigurationCache(): void {
  console.log('🔄 Invalidando cache de configuración del frontend');
  const configManager = ConfigurationManager.getInstance();
  configManager.invalidateCache();
}

/**
 * Forzar sincronización completa con el backend
 * Incluye reintentos automáticos
 */
export async function forceSynchronizeConfiguration(): Promise<{
  success: boolean;
  source: string;
  errors: string[];
  warnings: string[];
}> {
  console.log('🔄 Forzando sincronización completa de configuración');
  
  try {
    const configManager = ConfigurationManager.getInstance();
    
    // Invalidar cache primero
    configManager.invalidateCache();
    
    // Obtener nueva configuración con reintentos
    const result = await configManager.getSynchronizedConfig();
    
    return {
      success: result.source !== 'fallback' || result.errors.length === 0,
      source: result.source,
      errors: result.errors,
      warnings: result.warnings
    };
    
  } catch (error) {
    console.error('❌ Error durante sincronización forzada:', error);
    return {
      success: false,
      source: 'error',
      errors: [`Synchronization failed: ${(error as Error).message}`],
      warnings: []
    };
  }
}

/**
 * Detectar si las configuraciones están desincronizadas
 * Compara timestamps con el backend
 */
export async function detectConfigurationDesync(): Promise<{
  isDesynchronized: boolean;
  backendVersion?: string;
  frontendVersion?: string;
  recommendation: string;
}> {
  try {
    const configManager = ConfigurationManager.getInstance();
    const currentConfig = await configManager.getSynchronizedConfig();
    
    // Si estamos usando fallback, probablemente hay desync
    if (currentConfig.source === 'fallback' && currentConfig.errors.length > 0) {
      return {
        isDesynchronized: true,
        recommendation: 'Force synchronization - backend may be unreachable'
      };
    }
    
    // Si hay warnings sobre endpoints fallidos, hay desync parcial
    if (currentConfig.warnings.length > 0) {
      return {
        isDesynchronized: true,
        frontendVersion: currentConfig.config.version,
        recommendation: 'Partial synchronization issue - some configurations may be stale'
      };
    }
    
    return {
      isDesynchronized: false,
      frontendVersion: currentConfig.config.version,
      recommendation: 'Configuration is synchronized'
    };
    
  } catch (error) {
    return {
      isDesynchronized: true,
      recommendation: `Error detecting sync status: ${(error as Error).message}`
    };
  }
}

/**
 * Monitorear y reportar el estado de la cache de configuraciones
 */
export function getConfigurationCacheStatus(): {
  hasCache: boolean;
  cacheAge?: number;
  source: string;
  recommendation: string;
} {
  const configManager = ConfigurationManager.getInstance();
  
  // Acceder a propiedades privadas usando reflection (solo para debugging)
  const instance = configManager as any;
  const hasCache = instance.unifiedConfig !== null;
  const cacheExpiry = instance.cacheExpiry;
  
  if (!hasCache) {
    return {
      hasCache: false,
      source: 'none',
      recommendation: 'No cache available - configuration will be fetched from API'
    };
  }
  
  const now = Date.now();
  const cacheAge = cacheExpiry ? now - (cacheExpiry - (5 * 60 * 1000)) : 0; // 5min cache duration
  const isStale = cacheExpiry ? now > cacheExpiry : true;
  
  return {
    hasCache: true,
    cacheAge,
    source: isStale ? 'stale' : 'fresh',
    recommendation: isStale 
      ? 'Cache is stale - next request will fetch from API'
      : 'Cache is fresh - using cached configuration'
  };
}

/**
 * Utilidad para uso en desarrollo/debugging
 */
export const ConfigurationSyncDebug = {
  invalidateCache: invalidateConfigurationCache,
  forceSynchronize: forceSynchronizeConfiguration,
  detectDesync: detectConfigurationDesync,
  getCacheStatus: getConfigurationCacheStatus,
  
  // Monitoreo avanzado
  async fullDiagnostic() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DE SINCRONIZACIÓN DE CONFIGURACIÓN');
    
    const cacheStatus = getConfigurationCacheStatus();
    const desyncStatus = await detectConfigurationDesync();
    
    console.log('📊 Estado de Cache:', cacheStatus);
    console.log('🔄 Estado de Sincronización:', desyncStatus);
    
    if (desyncStatus.isDesynchronized) {
      console.log('⚠️ RECOMENDACIÓN: Ejecutar forceSynchronizeConfiguration()');
    } else {
      console.log('✅ Configuración sincronizada correctamente');
    }
    
    return {
      cache: cacheStatus,
      sync: desyncStatus,
      overallStatus: desyncStatus.isDesynchronized ? 'needs_sync' : 'healthy'
    };
  }
};