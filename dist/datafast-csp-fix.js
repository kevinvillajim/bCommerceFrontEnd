// Fix crítico para CSP de Datafast - Versión simplificada y segura
(function() {
    console.log('🛡️ Datafast CSP Fix v2 activado');
    
    // 1. Interceptar creación de elementos META
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function(tagName) {
        const element = originalCreateElement(tagName);
        
        if (tagName.toLowerCase() === 'meta') {
            const originalSetAttribute = element.setAttribute.bind(element);
            element.setAttribute = function(name, value) {
                if (name.toLowerCase() === 'http-equiv' && 
                    value && value.toLowerCase().includes('content-security')) {
                    console.log('🚫 Bloqueado intento de crear meta CSP');
                    return;
                }
                return originalSetAttribute(name, value);
            };
        }
        
        return element;
    };
    
    // 2. Interceptar appendChild y insertBefore
    const originalAppendChild = Node.prototype.appendChild;
    const originalInsertBefore = Node.prototype.insertBefore;
    
    Node.prototype.appendChild = function(node) {
        if (node && node.tagName === 'META') {
            const httpEquiv = node.getAttribute && node.getAttribute('http-equiv');
            if (httpEquiv && httpEquiv.toLowerCase().includes('content-security')) {
                console.log('🚫 Bloqueado appendChild de meta CSP');
                return node;
            }
        }
        return originalAppendChild.call(this, node);
    };
    
    Node.prototype.insertBefore = function(node, ref) {
        if (node && node.tagName === 'META') {
            const httpEquiv = node.getAttribute && node.getAttribute('http-equiv');
            if (httpEquiv && httpEquiv.toLowerCase().includes('content-security')) {
                console.log('🚫 Bloqueado insertBefore de meta CSP');
                return node;
            }
        }
        return originalInsertBefore.call(this, node, ref);
    };
    
    // 3. MutationObserver para limpiar CSP dinámicamente
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.tagName === 'META') {
                        const httpEquiv = node.getAttribute('http-equiv');
                        const content = node.getAttribute('content');
                        
                        if ((httpEquiv && httpEquiv.toLowerCase().includes('content-security')) ||
                            (content && content.toLowerCase().includes('script-src'))) {
                            console.log('🚫 Removiendo meta CSP dinámico');
                            node.remove();
                        }
                    }
                });
            }
        });
    });
    
    // Observar el documento completo
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    // 4. Limpiar cualquier CSP existente al cargar
    function cleanExistingCSP() {
        document.querySelectorAll('meta').forEach(meta => {
            const httpEquiv = meta.getAttribute('http-equiv');
            const content = meta.getAttribute('content');
            
            if ((httpEquiv && httpEquiv.toLowerCase().includes('content-security')) ||
                (content && content.toLowerCase().includes('script-src'))) {
                console.log('🧹 Removiendo CSP existente:', meta);
                meta.remove();
            }
        });
    }
    
    // Limpiar inmediatamente
    cleanExistingCSP();
    
    // Limpiar también después de que se cargue el DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanExistingCSP);
    } else {
        setTimeout(cleanExistingCSP, 0);
    }
    
    // 5. Interceptar Object.defineProperty solo si no ha sido interceptado ya
    if (!Object.defineProperty.__datafast_patched) {
        const originalDefineProperty = Object.defineProperty;
        Object.defineProperty = function(obj, prop, descriptor) {
            // Prevenir redefinición de 'src' en elementos script
            if (obj && obj.tagName === 'SCRIPT' && prop === 'src' && descriptor) {
                // Si ya tiene un descriptor, no redefinir
                const currentDescriptor = Object.getOwnPropertyDescriptor(obj, prop);
                if (currentDescriptor && currentDescriptor.configurable === false) {
                    console.log('⚠️ Evitando redefinición de src en script');
                    return obj;
                }
            }
            
            // Bloquear CSP
            if (obj === document && typeof prop === 'string' && 
                prop.toLowerCase().includes('contentsecurity')) {
                console.log('🚫 Bloqueado defineProperty de CSP');
                return obj;
            }
            
            try {
                return originalDefineProperty.call(this, obj, prop, descriptor);
            } catch (e) {
                if (e.message && e.message.includes('Cannot redefine')) {
                    console.log('⚠️ Propiedad ya definida, ignorando:', prop);
                    return obj;
                }
                throw e;
            }
        };
        Object.defineProperty.__datafast_patched = true;
    }
    
    console.log('✅ Datafast CSP Fix v2 completamente activo');
})();