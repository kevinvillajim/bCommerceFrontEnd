import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), react(), tsconfigPaths()],
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
				manualChunks: undefined,
			},
		},
	},
	server: {
		port: 3000,
		host: '0.0.0.0',
		open: true,
	},
	preview: {
		port: 4173,
	},
});
