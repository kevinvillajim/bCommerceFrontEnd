// CSP Killer - Solución agresiva para eliminar CSP
(function() {
    console.log('🔥 CSP Killer activado');
    
    // 1. Interceptar TODAS las propiedades del documento (solo si no ha sido interceptado)
    if (!Object.defineProperty.__csp_killer_patched) {
        const originalDefineProperty = Object.defineProperty;
        Object.defineProperty = new Proxy(originalDefineProperty, {
            apply: function(target, thisArg, args) {
                const [obj, prop, descriptor] = args;
                
                // Prevenir redefinición de propiedades ya definidas
                if (obj && prop === 'src' && obj.tagName === 'SCRIPT') {
                    try {
                        const existing = Object.getOwnPropertyDescriptor(obj, prop);
                        if (existing && !existing.configurable) {
                            console.log('⚠️ CSP Killer: Evitando redefinición de src');
                            return obj;
                        }
                    } catch (e) {
                        // Continuar si no se puede leer
                    }
                }
                
                // Bloquear cualquier intento de definir CSP
                if (typeof prop === 'string' && prop.toLowerCase().includes('security')) {
                    console.log('🚫 Bloqueado defineProperty CSP:', prop);
                    return obj;
                }
                
                try {
                    return originalDefineProperty.apply(thisArg, args);
                } catch (e) {
                    if (e.message && e.message.includes('Cannot redefine')) {
                        console.log('⚠️ CSP Killer: Propiedad ya definida:', prop);
                        return obj;
                    }
                    throw e;
                }
            }
        });
        Object.defineProperty.__csp_killer_patched = true;
    }
    
    // 2. Interceptar document.write y document.writeln
    const originalWrite = document.write;
    const originalWriteln = document.writeln;
    
    document.write = function(html) {
        if (html && html.includes('Content-Security-Policy')) {
            console.log('🚫 Bloqueado document.write con CSP');
            return;
        }
        return originalWrite.call(document, html);
    };
    
    document.writeln = function(html) {
        if (html && html.includes('Content-Security-Policy')) {
            console.log('🚫 Bloqueado document.writeln con CSP');
            return;
        }
        return originalWriteln.call(document, html);
    };
    
    // 3. Interceptar innerHTML y outerHTML
    const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
    const originalOuterHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML');
    
    Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(html) {
            if (html && typeof html === 'string' && html.includes('Content-Security-Policy')) {
                console.log('🚫 Bloqueado innerHTML con CSP');
                html = html.replace(/<meta[^>]*Content-Security-Policy[^>]*>/gi, '');
            }
            return originalInnerHTML.set.call(this, html);
        },
        get: originalInnerHTML.get
    });
    
    Object.defineProperty(Element.prototype, 'outerHTML', {
        set: function(html) {
            if (html && typeof html === 'string' && html.includes('Content-Security-Policy')) {
                console.log('🚫 Bloqueado outerHTML con CSP');
                html = html.replace(/<meta[^>]*Content-Security-Policy[^>]*>/gi, '');
            }
            return originalOuterHTML.set.call(this, html);
        },
        get: originalOuterHTML.get
    });
    
    // 4. Interceptar setAttribute en todos los elementos
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
        if (name === 'http-equiv' && value && value.toLowerCase().includes('content-security')) {
            console.log('🚫 Bloqueado setAttribute CSP');
            return;
        }
        if (name === 'content' && value && value.includes('script-src')) {
            console.log('🚫 Bloqueado setAttribute content con script-src');
            return;
        }
        return originalSetAttribute.call(this, name, value);
    };
    
    // 5. Interceptar Response para modificar headers
    if (window.Response) {
        const originalResponse = window.Response;
        window.Response = new Proxy(originalResponse, {
            construct(target, args) {
                const response = new target(...args);
                
                // Sobrescribir headers para eliminar CSP
                const originalHeaders = response.headers;
                if (originalHeaders) {
                    originalHeaders.delete('content-security-policy');
                    originalHeaders.delete('x-content-security-policy');
                    originalHeaders.delete('x-webkit-csp');
                }
                
                return response;
            }
        });
    }
    
    // 6. Limpiar CSP inmediatamente y luego cada 50ms
    const cleanCSP = () => {
        // Eliminar todos los meta tags de CSP
        document.querySelectorAll('meta[http-equiv*="Content-Security"], meta[http-equiv*="content-security"], meta[content*="script-src"]').forEach(meta => {
            meta.remove();
        });
        
        // Limpiar atributos CSP
        document.querySelectorAll('[http-equiv*="Content-Security"], [http-equiv*="content-security"]').forEach(elem => {
            elem.removeAttribute('http-equiv');
            elem.removeAttribute('content');
        });
    };
    
    // Limpiar inmediatamente
    cleanCSP();
    
    // Limpiar cada 50ms por los primeros 5 segundos
    const interval = setInterval(cleanCSP, 50);
    setTimeout(() => {
        clearInterval(interval);
        // Después seguir limpiando cada 200ms
        setInterval(cleanCSP, 200);
    }, 5000);
    
    console.log('✅ CSP Killer completamente activo');
})();