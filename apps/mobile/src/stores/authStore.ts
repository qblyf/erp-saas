import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Tenant, Store, Warehouse } from '@/types/models';

interface TenantInfo {
  id: string;
  name: string;
  code: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  tenant: TenantInfo | null;
  currentStore: Store | null;
  currentWarehouse: Warehouse | null;
  isAuthenticated: () => boolean;
  setAuth: (token: string, refreshToken: string, user: User, tenant: Tenant, stores?: Store[], warehouses?: Warehouse[]) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setCurrentStore: (store: Store | null) => void;
  setCurrentWarehouse: (warehouse: Warehouse | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      tenant: null,
      currentStore: null,
      currentWarehouse: null,

      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      },

      setAuth: (token, refreshToken, user, tenant, stores = [], warehouses = []) => {
        // Set default store and warehouse if available
        const defaultStore = stores.length > 0 ? stores[0] : null;
        const defaultWarehouse = warehouses.length > 0 ? warehouses[0] : null;

        set({
          token,
          refreshToken,
          user,
          tenant: {
            id: tenant.id || (tenant as any).tenantId,
            name: tenant.name || user.username,
            code: tenant.code || 'DEFAULT',
          },
          currentStore: defaultStore,
          currentWarehouse: defaultWarehouse,
        });
      },

      setTokens: (token, refreshToken) => {
        set({ token, refreshToken });
      },

      setCurrentStore: (store) => {
        set({ currentStore: store });
      },

      setCurrentWarehouse: (warehouse) => {
        set({ currentWarehouse: warehouse });
      },

      logout: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          tenant: null,
          currentStore: null,
          currentWarehouse: null,
        });
      },
    }),
    {
      name: 'erp-auth',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
