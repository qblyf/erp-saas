import { useState, useCallback } from 'react';
import { inventoryApi, InventoryQuery } from '@/api/inventory';
import type { Inventory } from '@/types/models';

export const useInventory = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const fetchInventories = useCallback(async (params?: InventoryQuery) => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getInventories({
        page: params?.page || 1,
        pageSize: params?.pageSize || pageSize,
        ...params,
      });
      setInventories(response.data);
      setTotal(response.total);
      setPage(response.page);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const loadMore = useCallback(async (params?: InventoryQuery) => {
    if ((page - 1) * pageSize >= total) return;

    setLoading(true);
    try {
      const response = await inventoryApi.getInventories({
        page: page + 1,
        pageSize,
        ...params,
      });
      setInventories((prev) => [...prev, ...response.data]);
      setPage(response.page);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to load more');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, total]);

  return {
    inventories,
    loading,
    error,
    total,
    page,
    pageSize,
    fetchInventories,
    loadMore,
    refresh: () => fetchInventories(),
  };
};
