// frontend/src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import { getAuthToken, setAuthToken } from '@/services/api';
import { getCurrentUser } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAuthenticated: !!user, isLoading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
