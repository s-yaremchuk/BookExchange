import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { getMeApi } from '../api/auth.api';

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

  useEffect(() => {
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
      } catch {
        if (controller.signal.aborted || localStorage.getItem('token') !== storedToken) return;
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    initAuth();
    return () => controller.abort();
  }, []);

  const login = (newToken: string, newUser: User) => {
    queryClient.clear();
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    queryClient.clear();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser: setUser }}>
      {children}
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
