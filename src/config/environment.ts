const environments = {
	development: {
		apiBaseUrl: "http://127.0.0.1:8000/api",
		imageBaseUrl: "http://127.0.0.1:8000/storage/",
		debug: true,
	},
	staging: {
		apiBaseUrl: "https://api.comersia.app/api",
		imageBaseUrl: "https://api.comersia.app/storage/",
		debug: true,
	},
	production: {
		apiBaseUrl: "https://api.comersia.app/api",
		imageBaseUrl: "https://api.comersia.app/storage/",
		debug: false,
	},
};

// Get current environment from build process or default to development
const currentEnv = import.meta.env.VITE_APP_ENV || 'development';

// Export the environment configuration
export const environment = environments[currentEnv as keyof typeof environments];

export default environment;