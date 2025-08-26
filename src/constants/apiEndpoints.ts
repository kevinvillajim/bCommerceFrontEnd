/**
 * API endpoints for Comersia Backend
 * Base URL configured in environment.ts
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD_EMAIL: "/auth/forgot-password-email",
    FORGOT_PASSWORD_TOKEN: "/auth/forgot-password-token",
    RESET_PASSWORD: "/auth/reset-password",
    VALIDATE_RESET_TOKEN: "/auth/reset-password/validate",
    ME: "/auth/me",
    UPDATE_PASSWORD: "/auth/password/update",
    VERIFY_EMAIL: (id: string | number, hash: string) =>
      `/email/verify/${id}/${hash}`,
    // New email verification system
    VERIFY_EMAIL_TOKEN: "/email-verification/verify",
    RESEND_VERIFICATION: "/email-verification/resend",
    VERIFICATION_STATUS: "/email-verification/status",
    CHECK_ROLE: "/user/check-role",
    PASSWORD_VALIDATION_RULES: "/auth/password-validation-rules",
  },

  PROFILE: {
    LIST: "/profile",
    UPDATE: "/profile",
    GET: '/profile',
    CHANGE_PASSWORD: '/profile/change-password',
    UPLOAD_AVATAR: '/profile/upload-avatar',
  },

  USER: {
    ORDERS: "/user/orders",
    ORDER_DETAILS: (id: number) => `/user/orders/${id}`,
    ORDER_STATS: "/user/orders/stats",
    REORDER: (id: number) => `/user/orders/${id}/reorder`,
    CONFIRM_RECEPTION: (id: number) => `/user/orders/${id}/confirm-reception`,
  },

  HEADER_COUNTERS: "/user/header-counters",

  // Products
  PRODUCTS: {
    LIST: "/products",
    DETAILS: (id: string | number) => `/products/${id}`,
    DETAILS_BY_SLUG: (slug: string) => `/products/slug/${slug}`,
    FEATURED: "/products/featured",
    FEATURED_RANDOM: "/products/featured-random",
    TRENDING_OFFERS: "/products/trending-offers",
    PERSONALIZED: "/products/personalized",
    DISCOUNTED: "/products/discounted",
    NEWEST: "/products/newest",
    POPULAR: "/products/popular",
    BY_CATEGORY: (categoryId: string | number) =>
      `/products/category/${categoryId}`,
    BY_TAGS: "/products/tags",
    BY_SELLER: (sellerId: string | number) => `/products/seller/${sellerId}`,
    SEARCH: (term?: string) => `/products/search/${term || ""}`,
    CREATE: "/products",
    UPDATE: (id: string | number) => `/products/${id}`,
    DELETE: (id: string | number) => `/products/${id}`,
    INCREMENT_VIEW: (id: string | number) => `/products/${id}/view`,
  },

  // Categories
  CATEGORIES: {
    LIST: "/categories",
    MAIN: "/categories/main",
    FEATURED: "/categories/featured",
    SUBCATEGORIES: (id: string | number) => `/categories/${id}/subcategories`,
    PRODUCTS: (id: string | number) => `/categories/${id}/products`,
    SLUG: (slug: string) => `/categories/slug/${slug}`,
    DETAILS: (id: string | number) => `/categories/${id}`,
    CREATE: "/admin/categories",
    UPDATE: (id: string | number) => `/admin/categories/${id}`,
    DELETE: (id: string | number) => `/admin/categories/${id}`,
  },

  // Cart
  CART: {
    GET: "/cart",
    ADD_ITEM: "/cart/items",
    UPDATE_ITEM: (itemId: string | number) => `/cart/items/${itemId}`,
    REMOVE_ITEM: (itemId: string | number) => `/cart/items/${itemId}`,
    EMPTY: "/cart/empty",
    VOLUME_DISCOUNT_INFO: (productId: string | number) =>
      `/cart/volume-discount-info/${productId}`,
    // ✅ NUEVO: Endpoints para códigos de descuento del carrito
    DISCOUNT: {
      VALIDATE: "/cart/discount/validate",
      APPLY: "/cart/discount/apply", 
      REMOVE: "/cart/discount/remove",
    },
  },

  // ✅ NUEVO: Volume Discounts
  VOLUME_DISCOUNTS: {
    PRODUCT_INFO: (productId: string | number) =>
      `/volume-discounts/product/${productId}`,
    ADMIN: {
      CONFIGURATION: "/admin/volume-discounts/configuration",
      STATS: "/admin/volume-discounts/stats",
      PRODUCT_DISCOUNTS: (productId: string | number) =>
        `/admin/volume-discounts/product/${productId}`,
      APPLY_DEFAULTS: (productId: string | number) =>
        `/admin/volume-discounts/product/${productId}/apply-defaults`,
      REMOVE_PRODUCT: (productId: string | number) =>
        `/admin/volume-discounts/product/${productId}`,
      BULK_APPLY: "/admin/volume-discounts/bulk/apply-defaults",
    },
  },

  // Checkout
  CHECKOUT: {
    PROCESS: "/checkout",
  },

  // Orders
  ORDERS: {
    LIST: "/orders",
    DETAILS: (id: number) => `/orders/${id}`,
    CREATE: `/orders`,
    UPDATE: (id: number) => `/orders/${id}`,
    SELLER_ORDERS: "/seller/orders",
    SELLER_ORDER_DETAILS: (id: number) => `/seller/orders/${id}`,
    SELLER_ORDER_ITEMS: (id: number) => `/seller/orders/${id}/items`,
    STATS: "/seller/orders/stats",
    UPDATE_STATUS: (id: number) => `/seller/orders/${id}/status`,
    UPDATE_SHIPPING: (id: number) => `/seller/orders/${id}/shipping`,
    CANCEL: (id: number) => `/seller/orders/${id}/cancel`,
    COMPLETE: (id: number) => `/seller/orders/${id}/complete`,
    AWAITING_SHIPMENT: "/seller/orders/awaiting-shipment",
    CUSTOMERS: "/seller/orders/customers",
    WITH_PRODUCT: (productId: number) => `/seller/orders/product/${productId}`,
  },

  // Payments
  PAYMENTS: {
    CREDIT_CARD: "/payments/credit-card",
    PAYPAL: "/payments/paypal",
    QR: "/payments/qr",
  },

  // Invoices
  INVOICES: {
    LIST: "/invoices",
    DETAILS: (id: string | number) => `/invoices/${id}`,
    GENERATE: "/invoices/generate",
    CANCEL: (id: string | number) => `/invoices/${id}/cancel`,
    DOWNLOAD: (id: string | number) => `/invoices/${id}/download`,
  },

  SELLER: {
    REGISTER: "/seller/register",
    INFO: "/seller/info",
    UPDATE_STORE_INFO: "/seller/store-info",
    DASHBOARD: "/seller/dashboard",
    TOP_RATING: "/sellers/top/rating",
    TOP_SALES: "/sellers/top/sales",
    FEATURED: "/sellers/featured",
  },

  // Ratings
  RATINGS: {
    PRODUCT: (productId: string | number) => `/ratings/product/${productId}`,
    SELLER: (sellerId: string | number) => `/ratings/seller/${sellerId}`,
    RATE_PRODUCT: "/ratings/product",
    RATE_SELLER: "/ratings/seller",
    RATE_USER: "/ratings/user",
    MY_GIVEN: "/ratings/my/given",
    MY_RECEIVED: "/ratings/my/received",
    PENDING: "/ratings/pending",
    REPLY: "/ratings/reply",
    REPORT: "/ratings/report",
    REPORT_PROBLEM: "/ratings/report-problem",
    DETAILS: (id: string | number) => `/ratings/${id}`,
    ORDER_RATINGS: (orderId: string | number) => `/ratings/order/${orderId}`,
  },

  // Shipping
  SHIPPING: {
    TRACK: (trackingNumber: string) => `/shipping/track/${trackingNumber}`,
    HISTORY: (trackingNumber: string) => `/shipping/${trackingNumber}/history`,
    ROUTE: (trackingNumber: string) => `/shipping/${trackingNumber}/route`,
    ESTIMATE: "/shipping/estimate",
    UPDATE_STATUS: `/shipping/update-status`,
    EXTERNAL_UPDATE: `/shipping/external-status-update`,

    SELLER: {
      LIST: "/seller/shipping",
      DETAIL: (id: string | number) => `/seller/shipping/${id}`,
      UPDATE_STATUS: (id: string | number) => `/seller/shipping/${id}/status`,
	  HISTORY: (trackingNumber: string) => `/api/shipping/track/${trackingNumber}/history`,
    ROUTE: (trackingNumber: string) => `/api/shipping/track/${trackingNumber}/route`,
    },

    // Simulación (solo desarrollo)
    SIMULATE_EVENTS: (trackingNumber: string) =>
      `/shipping/${trackingNumber}/simulate`,
    SIMULATE_API: `/shipping-api/status-update`,
    SIMULATE_CYCLE: (trackingNumber: string) =>
      `/shipping-api/${trackingNumber}/simulate-cycle`,
  },

  // Chat
  CHAT: {
    LIST: "/chats",
    DETAILS: (id: number) => `/chats/${id}`,
    CREATE: "/chats",
    SEND_MESSAGE: (id: number) => `/chats/${id}/messages`,
    UPDATE_STATUS: (id: number) => `/chats/${id}`,
    DELETE: (id: number) => `/chats/${id}`,
    GET_MESSAGES: (id: number) => `/chats/${id}/messages`,
    MARK_ALL_READ: (id: number) => `/chats/${id}/mark-read`,
    MARK_MESSAGE_READ: (id: number, messageId: number) =>
      `/chats/${id}/messages/${messageId}/read`,
    SELLER: {
      LIST: "/seller/chats",
      DETAILS: (id: number) => `/seller/chats/${id}`,
      LIST_BY_SELLER: (id: number) => `/seller/chats/by-seller/${id}`,
      SEND_MESSAGE: (id: number) => `/seller/chats/${id}/messages`,
      UPDATE_STATUS: (id: number) => `/seller/chats/${id}`,
      GET_MESSAGES: (id: number) => `/seller/chats/${id}/messages`,
      MARK_ALL_READ: (id: number) => `/seller/chats/${id}/mark-read`,
    },
  },

  // Recommendations
  RECOMMENDATIONS: {
    GET: "/recommendations",
    TRACK_INTERACTION: "/recommendations/track-interaction",
    USER_PROFILE: "/recommendations/user-profile",
  },

  // Favorites
  FAVORITES: {
    LIST: "/favorites",
    TOGGLE: "/favorites/toggle",
    CHECK: (productId: string | number) => `/favorites/product/${productId}`,
    UPDATE_NOTIFICATIONS: (id: string | number) =>
      `/favorites/${id}/notifications`,
  },

  // Feedback
  FEEDBACK: {
    LIST: "/feedback",
    DETAILS: (id: string | number) => `/feedback/${id}`,
    CREATE: "/feedback",
  },

  // Discounts
  DISCOUNTS: {
    VALIDATE: "/discounts/validate",
    APPLY: "/discounts/apply",
    MY_CODES: "/discounts/my-codes",
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/notifications",
    UNREAD: "/notifications/unread",
    COUNT: "/notifications/count",
    MARK_AS_READ: (id: string | number) => `/notifications/${id}/read`,
    MARK_ALL_AS_READ: "/notifications/read-all",
    DELETE: (id: string | number) => `/notifications/${id}`,
  },

  // Accounting (Admin only)
  ACCOUNTING: {
    BALANCE_SHEET: "/accounting/balance-sheet",
    INCOME_STATEMENT: "/accounting/income-statement",
    ACCOUNTS: "/accounting/accounts",
    ACCOUNT_LEDGER: (id: string | number) =>
      `/accounting/accounts/${id}/ledger`,
  },

  // Admin
  ADMIN: {
    // Users management
    USERS: "/admin/users",
    USER_DETAIL: (id: number) => `/admin/users/${id}`,
    BLOCK_USER: (id: number) => `/admin/users/${id}/block`,
    UNBLOCK_USER: (id: number) => `/admin/users/${id}/unblock`,
    RESET_PASSWORD: (id: number) => `/admin/users/${id}/reset-password`,
    MAKE_ADMIN: (id: number) => `/admin/users/${id}/make-admin`,
    MAKE_SELLER: (id: number) => `/admin/users/${id}/make-seller`,
    DELETE_USER: (id: number) => `/admin/users/${id}`,

    DASHBOARD: "/admin/dashboard",
    // Sellers management
    SELLERS: "/admin/sellers",
    SELLER_STATUS: (id: string | number) => `/admin/sellers/${id}/status`,
    CREATE_SELLER: "/admin/sellers",
    UPDATE_SELLER: (id: string | number) => `/admin/sellers/${id}`,
    // Ratings moderation
    PENDING_RATINGS: "/admin/ratings/pending",
    MODERATE_RATING: (id: string | number) => `/admin/ratings/${id}/moderate`,
    DELETE_RATING: (id: string | number) => `/admin/ratings/${id}`,
    // Orders
    ORDERS: "/admin/orders",
    ORDER_DETAIL: (id: number) => `/admin/orders/${id}`,
    ORDER_STATS: "/admin/orders/stats",
    UPDATE_ORDER_STATUS: (id: number) => `/admin/orders/${id}/status`,
    CANCEL_ORDER: (id: number) => `/admin/orders/${id}/cancel`,

    // Shipping
    SHIPPING_LIST: "/admin/shippings",
    SHIPPING_DETAIL: (id: number) => `/admin/shippings/${id}`,
    SHIPPING_HISTORY: (trackingNumber: string) =>
      `/admin/shipping/${trackingNumber}/history`,
    UPDATE_SHIPPING: (id: number) => `/admin/orders/${id}/shipping`,
    UPDATE_SHIPPING_STATUS: (trackingNumber: string) =>
      `/admin/shipping/${trackingNumber}/status`,
    SIMULATE_SHIPPING: (trackingNumber: string) =>
      `/admin/shipping/${trackingNumber}/simulate`,
    SHIPPING_SEND_NOTIFICATION: (trackingNumber: string) =>
      `/admin/shipping/${trackingNumber}/notify`,
    // Admin management (super admin only)
    ADMINS: "/admin/admins",
    MANAGE_ADMIN: "/admin/admins",
    REMOVE_ADMIN: (userId: string | number) => `/admin/admins/${userId}`,
    // Feedback
    PENDING_FEEDBACK: "/admin/feedback/pending",
    REVIEW_FEEDBACK: (id: string | number) => `/admin/feedback/${id}/review`,
    RATINGS: {
      LIST: "/admin/ratings",
      STATS: "/admin/ratings/stats",
      PENDING: "/admin/ratings/pending",
      MODERATE: (id: string | number) => `/admin/ratings/${id}/moderate`,
      APPROVE: (id: number) => `/admin/ratings/${id}/approve`,
      REJECT: (id: number) => `/admin/ratings/${id}/reject`,
      FLAG: (id: number) => `/admin/ratings/${id}/flag`,
      APPROVE_ALL: "/admin/ratings/approve-all",
      DELETE: (id: string | number) => `/admin/ratings/${id}`,
    },
    CONFIGURATIONS: {
      BASE: "/admin/configurations",
      INDEX: "/admin/configurations",
      SHOW: (key: string) => `/admin/configurations/${key}`,
      UPDATE: "/admin/configurations/update",
      RATINGS: "/admin/configurations/ratings",
      SHIPPING: "/admin/configurations/shipping",
      DEVELOPMENT: "/admin/configurations/development",
      MAIL: "/admin/configurations/mail",
      MAIL_TEST: "/admin/configurations/mail/test",
      MAIL_SEND_CUSTOM: "/admin/configurations/mail/send-custom",
      PASSWORD_VALIDATION_RULES: "/admin/configurations/password-validation-rules",
      FINANCIAL: "/admin/configurations/financial", // ⚠️ Configuraciones financieras críticas
    },
    // 🔧 JORDAN FASE 1: Endpoints públicos de configuración (CORREGIDOS + TAX AGREGADO)
    PUBLIC_CONFIGURATIONS: {
      PLATFORM_COMMISSION: "/configurations/platform-commission-public", // ✅ Existe en backend
      SHIPPING: "/configurations/shipping-public",          // ✅ Existe en backend (corregido)
      VOLUME_DISCOUNTS: "/configurations/volume-discounts-public", // ✅ Existe en backend
      SHIPPING_DISTRIBUTION: "/configurations/shipping-distribution-public", // ✅ Existe en backend
      TAX: "/configurations/tax-public", // ✅ JORDAN: Tax rate dinámico agregado
      
      // 🎯 ENDPOINT UNIFICADO: Todas las configuraciones en una sola llamada (Optimización)
      UNIFIED: "/configurations/unified", // ✅ NUEVO: Reemplaza 5 endpoints por 1
    },
    CATEGORIES: {
      LIST: "/categories", // Admin usa la misma lista pública
      DETAILS: (id: string | number) => `/categories/${id}`,
      CREATE: "/admin/categories", // RUTA ADMIN ESPECÍFICA
      UPDATE: (id: string | number) => `/admin/categories/${id}`, // RUTA ADMIN ESPECÍFICA
      PARTIAL_UPDATE: (id: string | number) => `/admin/categories/${id}`, // PATCH
      DELETE: (id: string | number) => `/admin/categories/${id}`, // RUTA ADMIN ESPECÍFICA
    },
    PRODUCTS: {
      LIST: "/admin/products", // NUEVA RUTA: Admin con datos completos
      DETAILS: (id: string | number) => `/products/${id}`,
      CREATE: "/admin/products", // RUTA ADMIN ESPECÍFICA
      UPDATE: (id: string | number) => `/admin/products/${id}`, // RUTA ADMIN ESPECÍFICA
      PARTIAL_UPDATE: (id: string | number) => `/admin/products/${id}`, // PATCH
      DELETE: (id: string | number) => `/admin/products/${id}`, // RUTA ADMIN ESPECÍFICA
      STATS: "/admin/products/stats",
    },
    // ✅ NUEVO: Volume Discounts Administration
    VOLUME_DISCOUNTS: {
      CONFIGURATION: "/admin/volume-discounts/configuration",
      STATS: "/admin/volume-discounts/stats",
      PRODUCT_DISCOUNTS: (productId: string | number) =>
        `/admin/volume-discounts/product/${productId}`,
      UPDATE_PRODUCT: (productId: string | number) =>
        `/admin/volume-discounts/product/${productId}`,
      APPLY_DEFAULTS: (productId: string | number) =>
        `/admin/volume-discounts/product/${productId}/apply-defaults`,
      REMOVE_PRODUCT: (productId: string | number) =>
        `/admin/volume-discounts/product/${productId}`,
      BULK_APPLY: "/admin/volume-discounts/bulk/apply-defaults",
    },
    
    // ✅ NUEVO: Admin Discount Codes Management
    DISCOUNT_CODES: {
      LIST: "/admin/discount-codes",
      STATS: "/admin/discount-codes/stats",
      GENERATE_CODE: "/admin/discount-codes/generate-code",
      CREATE: "/admin/discount-codes",
      DETAILS: (id: string | number) => `/admin/discount-codes/${id}`,
      UPDATE: (id: string | number) => `/admin/discount-codes/${id}`,
      DELETE: (id: string | number) => `/admin/discount-codes/${id}`,
      VALIDATE: "/admin/discount-codes/validate",
      APPLY: "/admin/discount-codes/apply",
    },
  },

  // Development & Testing
  DEV: {
    SHIPPING_TRACK: (trackingNumber: string) =>
      `/simulator/shipping/track/${trackingNumber}`,
    SHIPPING_UPDATE: "/simulator/shipping/simulate-update",
    SHIPPING_CYCLE: (trackingNumber: string) =>
      `/simulator/shipping/simulate-cycle/${trackingNumber}`,
  },

  SELLERS: {
    BY_USER_ID: (userId: number) => `/sellers/by-user/${userId}`,
    ACTIVE: "/sellers/active",
  },

  DATAFAST: {
    CREATE_CHECKOUT: "/datafast/create-checkout",
    VERIFY_PAYMENT: "/datafast/verify-payment",
    WEBHOOK: "/datafast/webhook",
  },
};

export default API_ENDPOINTS;