import React, { useEffect, useState } from 'react';

const AdminProductsMinimal: React.FC = () => {
  const [testData, setTestData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔥 AdminProductsMinimal: Component mounted');
    
    // Test basic API call
    const testApiCall = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('🔑 Token present:', !!token);
        
        if (!token) {
          setError('No auth token found');
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Success:', data);
          setTestData(data);
        } else {
          const errorText = await response.text();
          console.error('❌ API Error:', response.status, errorText);
          setError(`API Error: ${response.status} - ${errorText}`);
        }
      } catch (err) {
        console.error('❌ Network Error:', err);
        setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    testApiCall();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Products - Minimal Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 border rounded">
          <h2 className="font-semibold">Component Status</h2>
          <p className="text-green-600">✅ Component rendered successfully</p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h2 className="font-semibold text-red-800">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {testData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h2 className="font-semibold text-green-800">API Test Result</h2>
            <p className="text-green-700">✅ API call successful</p>
            <p className="text-sm text-gray-600">
              Found {testData.data?.length || 0} products
            </p>
            
            {testData.data?.slice(0, 3).map((product: any) => (
              <div key={product.id} className="mt-2 p-2 bg-white rounded">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500">
                  ID: {product.id} | Seller ID: {product.seller_id} | Price: ${product.price}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProductsMinimal;