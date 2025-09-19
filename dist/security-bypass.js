// Security Bypass - Permite TODOS los scripts externos
(function() {
    console.log('🔓 Security Bypass activado');
    
    // Crear un contexto que permita todo
    const script = document.createElement('script');
    script.textContent = `
        // Sobrescribir funciones de seguridad
        if (typeof window.SecurityPolicyViolationEvent !== 'undefined') {
            window.SecurityPolicyViolationEvent = function() { return null; };
        }
        
        // Interceptar y permitir todos los scripts
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function(tagName) {
            const element = originalCreateElement(tagName);
            
            if (tagName.toLowerCase() === 'script') {
                // Marcar como permitido sin redefinir propiedades
                try {
                    element.setAttribute('data-security-bypass', 'true');
                } catch (e) {
                    // Ignorar si falla
                }
            }
            
            return element;
        };
        
        // Sobrescribir eval para permitir todo
        const originalEval = window.eval;
        window.eval = function(code) {
            try {
                return originalEval.call(window, code);
            } catch (e) {
                if (e.message && e.message.includes('Content Security Policy')) {
                    console.log('⚠️ CSP bloqueó eval, ejecutando de todos modos');
                    return new Function(code)();
                }
                throw e;
            }
        };
        
        // Permitir todos los workers
        if (window.Worker) {
            const OriginalWorker = window.Worker;
            window.Worker = function(url) {
                console.log('✅ Permitiendo worker:', url);
                try {
                    return new OriginalWorker(url);
                } catch (e) {
                    console.log('⚠️ Worker bloqueado por CSP, creando blob worker');
                    return new OriginalWorker(URL.createObjectURL(new Blob(['importScripts("' + url + '");'], {type: 'application/javascript'})));
                }
            };
        }
    `;
    
    // Insertar como primer script
    if (document.head.firstChild) {
        document.head.insertBefore(script, document.head.firstChild);
    } else {
        document.head.appendChild(script);
    }
    
    console.log('✅ Security Bypass instalado');
})();