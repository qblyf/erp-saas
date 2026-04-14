import { useState, useCallback } from 'react';
import { saleApi, SaleOrderQuery } from '@/api/sale';
import type { SaleOrder } from '@/types/models';

export const useSaleOrders = () => {
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const fetchOrders = useCallback(async (params?: SaleOrderQuery) => {
    setLoading(true);
    setError(null);
    try {
      const response = await saleApi.getOrders({
        page: params?.page || 1,
        pageSize: params?.pageSize || pageSize,
        ...params,
      });
      setOrders(response.data);
      setTotal(response.total);
      setPage(response.page);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const loadMore = useCallback(async (params?: SaleOrderQuery) => {
    if ((page - 1) * pageSize >= total) return;

    setLoading(true);
    try {
      const response = await saleApi.getOrders({
        page: page + 1,
        pageSize,
        ...params,
      });
      setOrders((prev) => [...prev, ...response.data]);
      setPage(response.page);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to load more');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, total]);

  const getOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await saleApi.getOrder(id);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const auditOrder = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await saleApi.auditOrder(id);
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? response : order))
      );
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to audit order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async (id: string, reason?: string) => {
    setLoading(true);
    try {
      const response = await saleApi.cancelOrder(id, reason);
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? response : order))
      );
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    total,
    page,
    pageSize,
    fetchOrders,
    loadMore,
    getOrder,
    auditOrder,
    cancelOrder,
    refresh: () => fetchOrders(),
  };
};
