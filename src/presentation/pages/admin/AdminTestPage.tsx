import React, { useEffect } from 'react';

const AdminTestPage: React.FC = () => {
  useEffect(() => {
    console.log('🧪 AdminTestPage: Component mounted successfully');
    console.log('🧪 AdminTestPage: Current URL:', window.location.href);
    console.log('🧪 AdminTestPage: Local storage auth token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');
  }, []);

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        ✅ Admin Test Page Loaded Successfully!
      </h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h2 className="font-semibold text-green-800">Component Status</h2>
          <p className="text-green-700">This page loaded correctly, indicating React routing is working.</p>
        </div>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-semibold text-blue-800">Debug Information</h2>
          <ul className="text-blue-700 space-y-1">
            <li>• Current URL: {window.location.href}</li>
            <li>• Auth Token: {localStorage.getItem('auth_token') ? '✅ Present' : '❌ Missing'}</li>
            <li>• User Data: {localStorage.getItem('user_data') ? '✅ Present' : '❌ Missing'}</li>
            <li>• Environment: {process.env.NODE_ENV}</li>
          </ul>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-semibold text-yellow-800">Next Steps</h2>
          <p className="text-yellow-700">
            If this page loads but AdminProducts doesn't, the issue is specific to the AdminProducts component or its dependencies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTestPage;