// Test de conectividad API - ProductPage
// Ejecutar en consola del navegador

const testAPIConnection = async () => {
    console.log('🔍 Probando conectividad de API...');
    
    // URLs a probar
    const urlsToTest = [
        'http://127.0.0.1:8000/api/products',
        'http://localhost:8000/api/products', 
        'http://127.0.0.1:3001/api/products',
        'http://localhost:3001/api/products'
    ];
    
    for (const url of urlsToTest) {
        try {
            console.log(`🚀 Probando: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ SUCCESS ${url}:`, {
                    status: response.status,
                    count: data?.data?.length || 0,
                    meta: data?.meta,
                    sampleProduct: data?.data?.[0]?.name
                });
                
                return { success: true, url, data };
            } else {
                console.log(`❌ FAILED ${url}: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log(`💥 ERROR ${url}:`, error.message);
        }
    }
    
    console.log('🔍 Probando endpoints especiales...');
    
    // Probar endpoints específicos
    const specialEndpoints = [
        'http://127.0.0.1:8000/api/products/featured',
        'http://localhost:8000/api/products/featured'
    ];
    
    for (const url of specialEndpoints) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ FEATURED SUCCESS ${url}:`, data);
                return { success: true, url, data };
            }
        } catch (error) {
            console.log(`💥 FEATURED ERROR ${url}:`, error.message);
        }
    }
    
    return { success: false };
};

// Auto ejecutar
testAPIConnection().then(result => {
    console.log('🎯 RESULTADO FINAL:', result);
});
