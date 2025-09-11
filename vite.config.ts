import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { noCSPPlugin } from "./vite-plugin-no-csp";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
	plugins: [
		noCSPPlugin(), // Plugin para eliminar CSP y permitir Datafast
		tailwindcss(), 
		react(), 
		tsconfigPaths()
	],
	test: {
		environment: 'happy-dom',
		globals: true,
		setupFiles: ['./src/test/setup.ts'],
	},
	css: {
		devSourcemap: true,
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
	build: {
		sourcemap: true,
		minify: "esbuild",
		target: "esnext",
		rollupOptions: {
			output: {
				// 🚀 CRITICAL PERFORMANCE FIX: Manual chunks para optimizar bundle splitting
				manualChunks: {
					// Vendor chunks - Librerías que cambian poco
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					'ui-vendor': ['lucide-react', '@tanstack/react-query'],
					'utils-vendor': ['lodash', 'date-fns', 'crypto-js'],
					
					// Feature chunks - Código por funcionalidad
					'admin-chunk': [
						'./src/presentation/pages/admin/AdminDashboard.tsx',
						'./src/presentation/pages/admin/AdminProductsPage.tsx',
						'./src/presentation/pages/admin/AdminUsersPage.tsx',
						'./src/presentation/pages/admin/AdminOrdersPage.tsx',
						'./src/presentation/pages/admin/AdminSettingsPage.tsx',
						'./src/presentation/pages/admin/AdminCategoriesPage.tsx'
					],
					'seller-chunk': [
						'./src/presentation/pages/seller/SellerDashboard.tsx',
						'./src/presentation/pages/seller/SellerProductsPage.tsx',
						'./src/presentation/pages/seller/SellerOrdersPage.tsx',
						'./src/presentation/pages/seller/SellerEarningsPage.tsx',
						'./src/presentation/pages/seller/SellerOrderDetailPage.tsx'
					],
					'chat-chunk': [
						'./src/presentation/components/chat/ChatInterface.tsx',
						'./src/presentation/components/chat/ChatList.tsx',
						'./src/presentation/components/chat/ChatMessages.tsx',
						'./src/presentation/components/chat/ChatHeader.tsx'
					],
					'checkout-chunk': [
						'./src/presentation/pages/CheckoutPage.tsx',
						'./src/presentation/components/checkout/DatafastPaymentButtonProps.tsx',
						'./src/presentation/components/checkout/QRPaymentForm.tsx',
						'./src/presentation/components/checkout/CreditCardForm.tsx'
					]
				},
				// 🚀 PERFORMANCE: Configurar nombres de archivos para cache óptimo
				entryFileNames: 'assets/[name]-[hash].js',
				chunkFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]'
			}
		},
		// 🚀 PERFORMANCE: Optimizaciones de build
		chunkSizeWarningLimit: 1000,
		assetsInlineLimit: 4096,
	},
	server: {
		port: parseInt(env.VITE_PORT || '3000'), // Puerto desde .env
		host: '0.0.0.0',
		open: true,
		// NO establecer ningún header CSP - el plugin noCSPPlugin los elimina todos
		hmr: {
			overlay: true,
		},
		cors: true
	},
	preview: {
		port: 4173,
	},
	};
});
