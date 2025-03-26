import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import layouts
import MainLayout from './presentation/layouts/MainLayout';

// Lazy load components for better performance
const HomePage = lazy(() => import('./presentation/pages/HomePage'));
const ProductPage = lazy(() => import('./presentation/pages/ProductPage'));
const LoginPage = lazy(() => import('./presentation/pages/LoginPage'));
const RegisterPage = lazy(() => import('./presentation/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('./presentation/pages/NotFoundPage'));
const DashboardLayout = lazy(() => import('./presentation/layouts/DashboardLayout'));

// Loading fallback for lazy-loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Auth guard helper
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products/:id" element={<ProductPage />} />
          <Route 
            path="login" 
            element={
              isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="register" 
            element={
              isAuthenticated() ? <Navigate to="/" replace /> : <RegisterPage />
            } 
          />
        </Route>
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard routes will be added here */}
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;