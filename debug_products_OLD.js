// Script de diagnóstico para probar la API de productos
const testProductsAPI = async () => {
    const baseURL = 'http://localhost:3001/api'; // Ajusta según tu configuración
    
    console.log('🔍 Probando endpoints de productos...');
    
    // Test 1: Productos sin filtros
    try {
        const response1 = await fetch(`${baseURL}/products`);
        const data1 = await response1.json();
        console.log('✅ Productos sin filtros:', {
            status: response1.status,
            count: data1?.data?.length || 0,
            data: data1
        });
    } catch (error) {
        console.error('❌ Error productos sin filtros:', error);
    }
    
    // Test 2: Productos con parámetros básicos
    try {
        const params = new URLSearchParams({
            limit: '12',
            offset: '0',
            published: 'true',
            status: 'active'
        });
        
        const response2 = await fetch(`${baseURL}/products?${params}`);
        const data2 = await response2.json();
        console.log('✅ Productos con parámetros básicos:', {
            status: response2.status,
            count: data2?.data?.length || 0,
            data: data2
        });
    } catch (error) {
        console.error('❌ Error productos con parámetros:', error);
    }
    
    // Test 3: Productos destacados
    try {
        const response3 = await fetch(`${baseURL}/products/featured`);
        const data3 = await response3.json();
        console.log('✅ Productos destacados:', {
            status: response3.status,
            count: data3?.data?.length || 0,
            data: data3
        });
    } catch (error) {
        console.error('❌ Error productos destacados:', error);
    }
};

// Ejecutar en consola del navegador
testProductsAPI();
