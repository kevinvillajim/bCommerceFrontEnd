/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				primary: {
					50: "var(--color-primary-50)",
					100: "var(--color-primary-100)",
					200: "var(--color-primary-200)",
					300: "var(--color-primary-300)",
					400: "var(--color-primary-400)",
					500: "var(--color-primary-500)",
					600: "var(--color-primary-600)",
					700: "var(--color-primary-700)",
					800: "var(--color-primary-800)",
					900: "var(--color-primary-900)",
				},
				// Colores para dark mode
				dark: {
					bg: "var(--bg-main)",
					card: "var(--bg-card)",
					input: "var(--bg-input)",
					text: "var(--text-main)",
					textSecondary: "var(--text-secondary)",
					muted: "var(--text-muted)",
					border: "var(--border-color)",
				},
			},
			backgroundColor: {
				dark: "#121212",
				"dark-card": "#1e1e1e",
				"dark-hover": "#2c2c2c",
			},
			textColor: {
				"dark-primary": "#ffffff",
				"dark-secondary": "#a0aec0",
				"dark-muted": "#718096",
			},
			borderColor: {
				"dark-border": "#2d3748",
			},
		},
	},
	plugins: [darkModePlugin],
};