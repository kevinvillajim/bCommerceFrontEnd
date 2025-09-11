import { useEffect } from 'react';

/**
 * Hook para manejar el CSP dinámicamente para Datafast
 * Remueve agresivamente cualquier CSP que bloquee los scripts necesarios
 */
export const useDatafastCSP = () => {
  useEffect(() => {
    console.log('🔓 Hook useDatafastCSP activado - Desactivando CSP para Datafast');
    
    // Función para remover todos los CSP
    const removeAllCSP = () => {
      // Remover meta tags de CSP
      const cspMetas = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
      if (cspMetas.length > 0) {
        cspMetas.forEach(meta => meta.remove());
        console.log(`🗑️ Removidos ${cspMetas.length} meta tags de CSP`);
      }
      
      // También buscar y remover headers de CSP en caso de que estén en otros formatos
      const allMetas = document.querySelectorAll('meta');
      allMetas.forEach(meta => {
        const httpEquiv = meta.getAttribute('http-equiv')?.toLowerCase();
        if (httpEquiv && httpEquiv.includes('content-security')) {
          meta.remove();
          console.log('🗑️ Removido meta tag con CSP alternativo');
        }
      });
    };
    
    // Remover CSP inicial
    removeAllCSP();
    
    // Observador de mutaciones para detectar cuando se añade un CSP
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const element = node as Element;
              if (element.tagName === 'META') {
                const httpEquiv = element.getAttribute('http-equiv')?.toLowerCase();
                if (httpEquiv && httpEquiv.includes('content-security')) {
                  console.log('🚨 CSP detectado por MutationObserver - removiendo inmediatamente');
                  element.remove();
                }
              }
            }
          });
        }
      });
    });
    
    // Observar cambios en el head
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });
    
    // Verificación agresiva cada 100ms
    const aggressiveCheck = setInterval(() => {
      removeAllCSP();
    }, 100);
    
    // Verificación menos frecuente cada segundo
    const regularCheck = setInterval(() => {
      const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (csp) {
        console.log('⚠️ CSP detectado en verificación regular - removiendo');
        removeAllCSP();
      }
    }, 1000);
    
    // Cleanup
    return () => {
      console.log('🔄 Limpiando hook useDatafastCSP');
      observer.disconnect();
      clearInterval(aggressiveCheck);
      clearInterval(regularCheck);
    };
  }, []);
};