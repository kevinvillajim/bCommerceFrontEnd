import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import layouts
import MainLayout from './presentation/layouts/MainLayout';

// Contextos
import { AuthProvider } from './presentation/contexts/AuthContext';
import { CartProvider } from './presentation/contexts/CartContext';

// Lazy load components for better performance
const HomePage = lazy(() => import('./presentation/pages/HomePage'));
const ProductPage = lazy(() => import('./presentation/pages/ProductPage'));
const ProductItemPage = lazy(() => import('./presentation/pages/ProductItemPage'));
const LoginPage = lazy(() => import('./presentation/pages/LoginPage'));
const RegisterPage = lazy(() => import('./presentation/pages/RegisterPage'));
const NotFoundPage = lazy(() => import('./presentation/pages/NotFoundPage'));
const CategoryPage = lazy(() => import('./presentation/pages/CategoryPage'));
const AboutUsPage = lazy(() => import('./presentation/pages/AboutUsPage'));
const ContactPage = lazy(() => import('./presentation/pages/ContactPage'));
const FAQPage = lazy(() => import('./presentation/pages/FAQPage'));
const FavoritePage = lazy(() => import('./presentation/pages/FavoritePage'));
const CartPage = lazy(() => import('./presentation/pages/CartPage'));
const UserProfilePage = lazy(() => import('./presentation/pages/UserProfilePage'));
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
    <AuthProvider>
      <CartProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products/:id" element={<ProductItemPage />} />
              <Route path="products" element={<ProductPage />} />
              <Route path="categories" element={<CategoryPage />} />
              <Route path="about" element={<AboutUsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="favorites" element={<FavoritePage />} />
              <Route path="cart" element={<CartPage />} />
              
              {/* Ruta para el perfil de usuario que ahora está protegida correctamente */}
              <Route 
                path="account" 
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                } 
              />
              
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
      </CartProvider>
    </AuthProvider>
  );
};

export default App;