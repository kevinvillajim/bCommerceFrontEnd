// app/routes/AppRoutes.tsx
import React from 'react';
import { type RouteObject } from 'react-router';

// Importa tus componentes aquí
import MainLayout from '../presentation/layouts/MainLayout';
import HomePage from '../presentation/pages/HomePage';
import ProductPage from '../presentation/pages/ProductPage';
import LoginPage from '../presentation/pages/LoginPage';
import RegisterPage from '../presentation/pages/RegisterPage';
import NotFoundPage from '../presentation/pages/NotFoundPage';
import Test from '../presentation/pages/Test';
import DashboardLayout from '../presentation/layouts/DashboardLayout';


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
        element: <ProductPage />
      },
      {
        path: "test",
        element: <Test />
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