import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  FAB,
  ActivityIndicator,
  Searchbar,
  Chip,
} from 'react-native-paper';
import { router } from 'expo-router';
import { OrderCard } from '@/components/business/OrderCard';
import { purchaseApi } from '@/api/purchase';
import type { PurchaseOrder } from '@/types/models';

const STATUS_FILTERS = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已审核' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

export default function PurchaseOrdersScreen() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const pageSize = 20;

  const fetchOrders = async (params?: { status?: string; page?: number }) => {
    try {
      const response = await purchaseApi.getOrders({
        status: params?.status || status || undefined,
        page: params?.page || 1,
        pageSize,
      });
      if (params?.page && params.page > 1) {
        setOrders((prev) => [...prev, ...response.data]);
      } else {
        setOrders(response.data);
      }
      setTotal(response.total);
      setPage(response.page);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleOrderPress = (order: PurchaseOrder) => {
    router.push(`/purchase/${order.id}`);
  };

  const handleCreatePress = () => {
    router.push('/purchase/create');
  };

  const handleLoadMore = () => {
    if (!loading && (page - 1) * pageSize < total) {
      fetchOrders({ status: status || undefined, page: page + 1 });
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: PurchaseOrder }) => (
      <OrderCard
        order={item}
        type="purchase"
        onPress={() => handleOrderPress(item)}
      />
    ),
    []
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          暂无订单
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="搜索订单号/供应商"
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
      />

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Chip
              selected={status === item.value}
              onPress={() => setStatus(item.value)}
              style={styles.filterChip}
              mode="outlined"
            >
              {item.label}
            </Chip>
          )}
        />
      </View>

      <Text variant="bodySmall" style={styles.totalText}>
        共 {total} 条订单
      </Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreatePress}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  totalText: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#666',
  },
  list: {
    paddingBottom: 80,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2196f3',
  },
});
