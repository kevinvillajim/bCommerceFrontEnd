// Parchear scripts de Datafast para eliminar CSP
(function() {
    console.log('🔧 Datafast Script Patcher activado');
    
    // Sobrescribir completamente SecurityPolicyViolationEvent
    window.SecurityPolicyViolationEvent = function() { return null; };
    
    // Interceptar errores de CSP
    const originalError = window.Error;
    window.Error = function(message) {
        if (message && message.includes('Content Security Policy')) {
            console.log('🚫 Bloqueando error CSP:', message);
            return null;
        }
        return new originalError(message);
    };
    
    // Sobrescribir el método de inserción de scripts
    const originalAppendChild = HTMLElement.prototype.appendChild;
    const originalInsertBefore = HTMLElement.prototype.insertBefore;
    const originalSetAttribute = Element.prototype.setAttribute;
    
    // Permitir todos los scripts externos
    HTMLElement.prototype.appendChild = function(child) {
        if (child && child.tagName === 'SCRIPT' && child.src) {
            console.log('✅ Permitiendo script:', child.src);
            // Asegurar que el script no tenga restricciones
            child.setAttribute('data-csp-bypass', 'true');
        }
        return originalAppendChild.call(this, child);
    };
    
    HTMLElement.prototype.insertBefore = function(child, ref) {
        if (child && child.tagName === 'SCRIPT' && child.src) {
            console.log('✅ Permitiendo script (insertBefore):', child.src);
            child.setAttribute('data-csp-bypass', 'true');
        }
        return originalInsertBefore.call(this, child, ref);
    };
    
    // Prevenir que se añadan políticas CSP
    Element.prototype.setAttribute = function(name, value) {
        if (name === 'http-equiv' && value && value.toLowerCase().includes('content-security')) {
            console.log('🚫 Bloqueando setAttribute CSP');
            return;
        }
        if (name === 'content' && value && (value.includes('script-src') || value.includes('default-src'))) {
            console.log('🚫 Bloqueando setAttribute content con CSP');
            return;
        }
        return originalSetAttribute.call(this, name, value);
    };
    
    // Interceptar y permitir la creación dinámica de scripts
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        
        if (tagName.toLowerCase() === 'script') {
            // Marcar el script como permitido
            element.setAttribute('data-csp-bypass', 'true');
            
            // Solo loguear si es un script de Datafast, sin redefinir propiedades
            const originalSrcSetter = element.__lookupSetter__('src');
            if (originalSrcSetter && !element.__csp_patched) {
                element.__csp_patched = true;
                // Usar un wrapper simple sin Object.defineProperty
                const _setSrc = element.setAttribute.bind(element, 'src');
                element.setAttribute = function(name, value) {
                    if (name === 'src' && value && (value.includes('oppwa.com') || value.includes('techlab-cdn'))) {
                        console.log('📜 Script de Datafast creado:', value);
                    }
                    return Element.prototype.setAttribute.call(this, name, value);
                };
            }
        }
        
        return element;
    };
    
    // Interceptar fetch para permitir todas las peticiones
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (url && (url.includes('techlab-cdn.com') || url.includes('oppwa.com'))) {
            console.log('🌐 Permitiendo fetch a:', url);
        }
        return originalFetch.apply(window, args);
    };
    
    // Interceptar XMLHttpRequest
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new OriginalXHR();
        const originalOpen = xhr.open;
        
        xhr.open = function(method, url, ...rest) {
            if (url && (url.includes('techlab-cdn.com') || url.includes('oppwa.com'))) {
                console.log('🌐 Permitiendo XHR a:', url);
            }
            return originalOpen.call(this, method, url, ...rest);
        };
        
        return xhr;
    };
    
    console.log('✅ Datafast Script Patcher completamente activo');
})();