import type { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/books" replace />} />
                <Route
                  path="/books"
                  element={
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">Books Catalog</h1>
                    </div>
                  }
                />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </QueryClientProvider>
  );
};
