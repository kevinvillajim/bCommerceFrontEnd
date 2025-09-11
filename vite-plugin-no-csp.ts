import { Plugin } from 'vite';

/**
 * Plugin simple para desactivar CSP en desarrollo
 * Permite cargar scripts externos de terceros como Datafast
 */
export function noCSPPlugin(): Plugin {
  return {
    name: 'no-csp',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Simplemente no establecer ningún header CSP
        const originalSetHeader = res.setHeader;
        res.setHeader = function(name: string, value: any) {
          if (typeof name === 'string' && name.toLowerCase().includes('content-security-policy')) {
            return res; // No establecer CSP
          }
          return originalSetHeader.call(this, name, value);
        };
        next();
      });
    }
  };
}