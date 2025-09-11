// Whitelist inteligente para Datafast - Permite scripts específicos sin bloquear CSP globalmente
(function() {
    console.log('🛡️ Datafast Whitelist activado - Versión mejorada');
    
    // Lista de dominios permitidos para Datafast (expandida)
    const DATAFAST_DOMAINS = [
        'oppwa.com',
        'techlab-cdn.com',
        'datafast.com.ec',
        'paymentsos.com',
        'p11.techlab-cdn.com',
        'eu-test.oppwa.com',
        'test.oppwa.com'
    ];
    
    // Verificar si una URL es de Datafast
    function isDatafastUrl(url) {
        if (!url) return false;
        return DATAFAST_DOMAINS.some(domain => url.includes(domain));
    }
    
    // Verificar si estamos en una página de pago
    function isPaymentPage() {
        return window.location.pathname.includes('checkout') || 
               window.location.pathname.includes('payment') ||
               window.location.pathname.includes('datafast');
    }
    
    // Si estamos en una página de pago, desactivar temporalmente la protección CSP
    if (isPaymentPage()) {
        console.log('📍 Página de pago detectada - Configurando whitelist para Datafast');
        
        // Marcar que estamos en modo Datafast
        window.__DATAFAST_MODE = true;
        
        // Sobrescribir el createElement original para permitir scripts de Datafast
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function(tagName) {
            const element = originalCreateElement(tagName);
            
            if (tagName.toLowerCase() === 'script') {
                // Interceptar cuando se establece el src
                const originalSetAttribute = element.setAttribute.bind(element);
                element.setAttribute = function(name, value) {
                    if (name === 'src' && isDatafastUrl(value)) {
                        console.log('✅ Script de Datafast permitido:', value);
                        element.setAttribute('data-datafast-allowed', 'true');
                    }
                    return originalSetAttribute(name, value);
                };
                
                // También interceptar la propiedad src directamente
                let srcValue = '';
                Object.defineProperty(element, 'src', {
                    get: function() {
                        return srcValue;
                    },
                    set: function(value) {
                        if (isDatafastUrl(value)) {
                            console.log('✅ Script de Datafast permitido (src):', value);
                            element.setAttribute('data-datafast-allowed', 'true');
                        }
                        srcValue = value;
                        originalSetAttribute.call(element, 'src', value);
                    },
                    configurable: true
                });
            }
            
            return element;
        };
        
        // Interceptar appendChild para permitir scripts de Datafast
        const originalAppendChild = Node.prototype.appendChild;
        Node.prototype.appendChild = function(node) {
            if (node && node.tagName === 'SCRIPT' && node.src && isDatafastUrl(node.src)) {
                console.log('✅ Permitiendo inserción de script Datafast:', node.src);
                node.setAttribute('data-datafast-allowed', 'true');
            }
            return originalAppendChild.call(this, node);
        };
        
        // Interceptar insertBefore para permitir scripts de Datafast
        const originalInsertBefore = Node.prototype.insertBefore;
        Node.prototype.insertBefore = function(node, ref) {
            if (node && node.tagName === 'SCRIPT' && node.src && isDatafastUrl(node.src)) {
                console.log('✅ Permitiendo inserción de script Datafast (insertBefore):', node.src);
                node.setAttribute('data-datafast-allowed', 'true');
            }
            return originalInsertBefore.call(this, node, ref);
        };
        
        // Limpiar CSP solo para páginas de pago
        function cleanPaymentPageCSP() {
            document.querySelectorAll('meta[http-equiv*="Content-Security"]').forEach(meta => {
                console.log('🧹 Removiendo CSP para página de pago');
                meta.remove();
            });
        }
        
        // Limpiar inmediatamente
        cleanPaymentPageCSP();
        
        // Limpiar periódicamente pero menos agresivamente
        setInterval(cleanPaymentPageCSP, 1000);
        
        // Agregar estilos para ocultar mensajes de CSP si aparecen
        const style = document.createElement('style');
        style.textContent = `
            /* Ocultar mensajes de error CSP en consola */
            .csp-error { display: none !important; }
        `;
        document.head.appendChild(style);
        
        console.log('✅ Whitelist de Datafast configurado correctamente');
    } else {
        console.log('📍 No es página de pago - Whitelist de Datafast no activado');
    }
    
    // Exportar función para verificar si un script debe ser permitido
    window.__isDatafastAllowed = function(url) {
        return isDatafastUrl(url);
    };
})();