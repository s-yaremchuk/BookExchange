import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { getMeApi } from '../api/auth.api';
import { isAxiosError } from 'axios';
import { Button } from '../components/ui/Button';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();
  const [sessionError, setSessionError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setSessionError(false);
    setIsLoading(true);
    const controller = new AbortController();
    async function initAuth() {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getMeApi(controller.signal);
        if (controller.signal.aborted || localStorage.getItem('token') !== storedToken) return;
        setUser(currentUser);
        setToken(storedToken);
      } catch (error) {
        if (controller.signal.aborted || localStorage.getItem('token') !== storedToken) return;
        if (isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        } else {
          setSessionError(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    initAuth();
    return () => controller.abort();
  }, [attempt]);

  const login = (newToken: string, newUser: User) => {
    queryClient.clear();
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    setSessionError(false);
    queryClient.clear();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser: setUser }}>
      {sessionError ? (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div role="alert" className="space-y-4 rounded-xl bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold">Unable to restore your session</h1>
            <p className="text-sm text-slate-600">Check your connection and try again.</p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setAttempt((value) => value + 1)}>Retry</Button>
              <Button variant="secondary" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </main>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
