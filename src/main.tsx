import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './presentation/contexts/AuthContext';
import { CartProvider } from './presentation/contexts/CartContext';
import { FavoriteProvider } from './presentation/contexts/FavoriteContext';
import { NotificationProvider } from './presentation/contexts/NotificationContext';

// Import main styles
import './styles/main.css';

// Render the application
const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <FavoriteProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </FavoriteProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}