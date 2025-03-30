import { type RouteObject } from 'react-router';

// Importa tus componentes aquí
import MainLayout from '../presentation/layouts/MainLayout';
import HomePage from '../presentation/pages/HomePage';
import ProductItemPage from '../presentation/pages/ProductItemPage';
import ProductPage from '../presentation/pages/ProductPage';
import LoginPage from '../presentation/pages/LoginPage';
import RegisterPage from '../presentation/pages/RegisterPage';
import NotFoundPage from '../presentation/pages/NotFoundPage';
import CategoryPage from '../presentation/pages/CategoryPage';
import ContactPage from '../presentation/pages/ContactPage';
import FAQPage from '../presentation/pages/FAQPage';
import DashboardLayout from '../presentation/layouts/DashboardLayout';

// Protected Pages
import UserProfilePage from '../presentation/pages/UserProfilePage';
import CartPage from '../presentation/pages/CartPage';
import FavoritePage from '../presentation/pages/FavoritePage';

// Route wrappers
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import ForgotPasswordPage from '@/presentation/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/presentation/pages/ResetPasswordPage';


// Auth guard helper
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  return !!token;
};

// Define las rutas
const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "products/:id",
        element: <ProductItemPage />
      },
      {
        path: "products",
        element: <ProductPage />
      },
      {
        path: "categories",
        element: <CategoryPage />
      },
      {
        path: "contact",
        element: <ContactPage />
      },
      {
        path: "faq",
        element: <FAQPage />
      },
      {
        path: "favorites",
        element: <FavoritePage />
      },
      {
        path: "cart",
        element: <CartPage />
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />
      },
      {
        path: "login",
        loader: () => {
          if (isAuthenticated()) {
            return { redirect: '/' };
          }
          return null;
        },
        element: <LoginPage />
      },
      {
        path: "register",
        loader: () => {
          if (isAuthenticated()) {
            return { redirect: '/' };
          }
          return null;
        },
        element: <RegisterPage />
      }
    ]
  },
  {
    path: "/dashboard",
    loader: () => {
      if (!isAuthenticated()) {
        return { redirect: '/login' };
      }
      return null;
    },
    element: <DashboardLayout />,
    children: [
      // Dashboard routes will be added here
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
];

export default appRoutes;