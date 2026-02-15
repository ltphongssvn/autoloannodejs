// frontend/src/services/auth.ts
import { apiFetch, setAuthToken } from './api';
import type { User, ApiResponse, AuthCredentials, SignupData } from '@/types';

export const login = async (credentials: AuthCredentials): Promise<User> => {
  const { data } = await apiFetch<ApiResponse<User>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ user: credentials }),
  });
  return data.data;
};

export const signup = async (userData: SignupData): Promise<User> => {
  const { data } = await apiFetch<ApiResponse<User>>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ user: userData }),
  });
  return data.data;
};

export const logout = async (): Promise<void> => {
  try {
    await apiFetch('/auth/logout', { method: 'DELETE' });
  } finally {
    setAuthToken(null);
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await apiFetch<ApiResponse<User>>('/auth/me');
  return data.data;
};
