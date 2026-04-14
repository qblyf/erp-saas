import { create } from 'zustand';
import type { Store, Warehouse } from '@/types/models';

interface AppState {
  // UI State
  isLoading: boolean;
  error: string | null;

  // Store/Warehouse lists
  stores: Store[];
  warehouses: Warehouse[];

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setStores: (stores: Store[]) => void;
  setWarehouses: (warehouses: Warehouse[]) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  stores: [],
  warehouses: [],

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setStores: (stores) => set({ stores }),
  setWarehouses: (warehouses) => set({ warehouses }),
  clearError: () => set({ error: null }),
}));
