/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	darkMode: "class", // Activar el modo oscuro basado en clases
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#f0f9ff",
					100: "#e0f2fe",
					200: "#bae6fd",
					300: "#7dd3fc",
					400: "#38bdf8",
					500: "#0ea5e9",
					600: "#0284c7",
					700: "#0369a1",
					800: "#075985",
					900: "#0c4a6e",
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
	plugins: [],
};
