// src/App.tsx
import React, { Suspense } from 'react';
import {useRoutes } from 'react-router-dom';
import appRoutes from './routes/AppRoute';

// Loading fallback para componentes lazy-loaded
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// Componente que renderiza las rutas definidas en appRoutes
const AppRoutes: React.FC = () => {
  const routes = useRoutes(appRoutes);
  return routes;
};

const App: React.FC = () => {
  return (
      <Suspense fallback={<LoadingFallback />}>
        <AppRoutes />
      </Suspense>
  );
};

export default App;