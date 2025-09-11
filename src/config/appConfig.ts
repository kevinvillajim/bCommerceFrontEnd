/**
 * Ajustes de configuración
 */
import {environment} from './environment';

// App configuration
const appConfig = {
  appName: 'Comersia',
  api: {
    baseUrl: environment.apiBaseUrl,
    timeout: 15000, // 15 segundos de espera maxima
    retryAttempts: 1,
  },
  imageBaseUrl: environment.imageBaseUrl,
  pagination: {
    defaultPageSize: 12,
    pageSizes: [12, 24, 48, 96]
  },
  cache: {
    productCacheTime: 1000 * 60 * 15, // 15 minutos
    categoryCacheTime: 1000 * 60 * 60, // 1 hora
  },
  storage: {
    authTokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    cartKey: 'shopping_cart',
    userKey: 'user_data',
    themeKey: 'user_theme',
    languageKey: 'app_language' //Futuro
  },
  routes: {
    home: '/',
    login: '/login',
    register: '/register',
    products: '/products',
    productDetails: (id: string | number) => `/products/${id}`,
    cart: '/cart',
    checkout: '/checkout',
    dashboard: '/dashboard',
    notFound: '/404',
    categories: '/categories',
    contact: '/contact',
    faq: '/faq',
    favorites: '/favorites',
  },
  // Límites de carga de archivos (en bytes)
  fileUpload: {
    maxImageSize: 2097152, // 2MB (debe coincidir con backend)
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxProductImages: 5
  },
  // Configuración de validación
  validation: {
    minPasswordLength: 8,
    maxProductNameLength: 100,
    maxDescriptionLength: 5000
  },
};

export default appConfig;