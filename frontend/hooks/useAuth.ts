import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('voyage_token', data.token);
    set({ user: data.user, loading: false });
  },

  register: async (name, email, password) => {
    set({ loading: true });
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('voyage_token', data.token);
    set({ user: data.user, loading: false });
  },

  logout: () => {
    localStorage.removeItem('voyage_token');
    set({ user: null });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user });
    } catch {
      set({ user: null });
    }
  },
}));