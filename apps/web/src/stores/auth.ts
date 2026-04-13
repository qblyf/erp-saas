import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Tenant {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  username: string;
  realName: string;
  roles: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  tenant: Tenant | null;
  setAuth: (token: string, refreshToken: string, user: User, tenant: Tenant) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      tenant: null,

      setAuth: (token, refreshToken, user, tenant) =>
        set({ token, refreshToken, user, tenant }),

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          tenant: null,
        }),
    }),
    {
      name: 'erp-auth',
    }
  )
);
