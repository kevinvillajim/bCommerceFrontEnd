/**
 * API endpoints for BCommerce Backend
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
		ME: "/auth/me",
		UPDATE_PASSWORD: "/auth/password/update",
		VERIFY_EMAIL: (id: string | number, hash: string) =>
			`/email/verify/${id}/${hash}`,
		CHECK_ROLE: "/user/check-role",
	},

	PROFILE: {
		LIST: "/profile",
		UPDATE: "/profile",
	},

	USER: {
		ORDERS: "/user/orders", // Esta es la correcta para clientes
		ORDER_DETAILS: (id: number) => `/user/orders/${id}`,
		ORDER_STATS: "/user/orders/stats",
		REORDER: (id: number) => `/user/orders/${id}/reorder`,
		CONFIRM_RECEPTION: (id: number) => `/user/orders/${id}/confirm-reception`,
	},

	// Products
	PRODUCTS: {
		LIST: "/products",
		DETAILS: (id: string | number) => `/products/${id}`,
		DETAILS_BY_SLUG: (slug: string) => `/products/slug/${slug}`,
		FEATURED: "/products/featured",
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
	},

	// Checkout
	CHECKOUT: {
		PROCESS: "/checkout",
	},

	// Orders
	ORDERS: {
		LIST: "/orders",
		DETAILS: (id: number) => `/orders/${id}`,
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
	},

	// Shipping
	SHIPPING: {
		TRACK: (trackingNumber: string) => `/shipping/track/${trackingNumber}`,
		HISTORY: (trackingNumber: string) => `/shipping/${trackingNumber}/history`,
		ROUTE: (trackingNumber: string) => `/shipping/${trackingNumber}/route`,
		ESTIMATE: "/shipping/estimate",
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
		DASHBOARD: "/admin/dashboard",
		// Users management
		USERS: "/admin/users",
		BLOCK_USER: (id: string | number) => `/admin/users/${id}/block`,
		UNBLOCK_USER: (id: string | number) => `/admin/users/${id}/unblock`,
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
		// Shipping
		UPDATE_SHIPPING_STATUS: (trackingNumber: string) =>
			`/admin/shipping/${trackingNumber}/status`,
		SIMULATE_SHIPPING: (trackingNumber: string) =>
			`/admin/shipping/${trackingNumber}/simulate`,
		// Admin management (super admin only)
		ADMINS: "/admin/admins",
		MANAGE_ADMIN: "/admin/admins",
		REMOVE_ADMIN: (userId: string | number) => `/admin/admins/${userId}`,
		// Feedback
		PENDING_FEEDBACK: "/admin/feedback/pending",
		REVIEW_FEEDBACK: (id: string | number) => `/admin/feedback/${id}/review`,
		RATINGS: {
			STATS: "/admin/ratings/stats",
			PENDING: "/admin/ratings/pending",
			MODERATE: (id: string | number) => `/admin/ratings/${id}/moderate`,
			APPROVE_ALL: "/admin/ratings/approve-all",
			DELETE: (id: string | number) => `/admin/ratings/${id}`,
		},
		CONFIGURATIONS: {
			INDEX: "/admin/configurations",
			SHOW: (key: string) => `/admin/configurations/${key}`,
			UPDATE: "/admin/configurations/update",
			RATINGS: "/admin/configurations/ratings",
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
};

export default API_ENDPOINTS;
