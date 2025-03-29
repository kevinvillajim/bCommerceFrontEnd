/**
 * Constantes de rutas de la aplicación
 * Define todas las rutas disponibles en la aplicación
 */
export const routes = {
  // Rutas públicas
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: '/products/:slug',
  CATEGORIES: '/categories',
  CATEGORY_DETAILS: '/categories/:slug',
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  LOGIN: '/login',
  REGISTER: '/register',
  NOT_FOUND: '/404',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email/:id/:hash',

  // Rutas protegidas - Usuario
  PROFILE: '/profile',
  CART: '/cart',
  CHECKOUT: '/checkout',
  FAVORITES: '/favorites',
  ORDERS: '/orders',
  ORDER_DETAILS: '/orders/:id',
  INVOICES: '/invoices',
  INVOICE_DETAILS: '/invoices/:id',
  NOTIFICATIONS: '/notifications',
  FEEDBACK: '/feedback',
  MESSAGES: '/messages',
  CHAT: '/chat/:id',
  
  // Rutas protegidas - Vendedor
  SELLER_DASHBOARD: '/seller/dashboard',
  SELLER_PRODUCTS: '/seller/products',
  SELLER_PRODUCT_CREATE: '/seller/products/create',
  SELLER_PRODUCT_EDIT: '/seller/products/edit/:id',
  SELLER_ORDERS: '/seller/orders',
  SELLER_RATINGS: '/seller/ratings',
  SELLER_PROFILE: '/seller/profile',
  SELLER_INVOICES: '/seller/invoices',
  SELLER_ACCOUNTING: '/seller/accounting',
  
  // Rutas protegidas - Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_USERS: '/admin/users',
  ADMIN_SELLERS: '/admin/sellers',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_FEEDBACK: '/admin/feedback',
  ADMIN_RATINGS: '/admin/ratings',
  ADMIN_INVOICES: '/admin/invoices',
  ADMIN_ACCOUNTING: '/admin/accounting',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_DISCOUNTS: '/admin/discounts'
};

/**
 * Función para generar rutas dinámicas
 * @param route Plantilla de ruta con marcadores de posición
 * @param params Objeto con pares clave-valor para reemplazar en la plantilla
 * @returns Ruta procesada con marcadores reemplazados
 */
export const generateRoute = (route: string, params: Record<string, string | number>): string => {
  let processedRoute = route;
  
  // Reemplaza todos los marcadores :param con los valores proporcionados
  Object.keys(params).forEach(key => {
    processedRoute = processedRoute.replace(`:${key}`, String(params[key]));
  });
  
  return processedRoute;
};

/**
 * Función para obtener rutas de detalles para varios tipos de entidades
 */
export const getDetailsRoute = {
  product: (slug: string) => generateRoute(routes.PRODUCT_DETAILS, { slug }),
  category: (slug: string) => generateRoute(routes.CATEGORY_DETAILS, { slug }),
  order: (id: string | number) => generateRoute(routes.ORDER_DETAILS, { id }),
  invoice: (id: string | number) => generateRoute(routes.INVOICE_DETAILS, { id }),
  sellerProduct: (id: string | number) => generateRoute(routes.SELLER_PRODUCT_EDIT, { id }),
  chat: (id: string | number) => generateRoute(routes.CHAT, { id })
};