import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi, LoginRequest } from '@/api/auth';
import { router } from 'expo-router';

export const useAuth = () => {
  const {
    token,
    refreshToken,
    user,
    tenant,
    currentStore,
    currentWarehouse,
    isAuthenticated,
    setAuth,
    setCurrentStore,
    setCurrentWarehouse,
    logout,
  } = useAuthStore();

  const login = useCallback(async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      setAuth(
        response.token,
        response.refreshToken,
        response.user,
        response.tenant,
        response.stores,
        response.warehouses
      );
      return response;
    } catch (error) {
      throw error;
    }
  }, [setAuth]);

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/(auth)/login');
  }, [logout]);

  return {
    token,
    refreshToken,
    user,
    tenant,
    currentStore,
    currentWarehouse,
    isAuthenticated: isAuthenticated(),
    login,
    logout: handleLogout,
    setCurrentStore,
    setCurrentWarehouse,
  };
};
