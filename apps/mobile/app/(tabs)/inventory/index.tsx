import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  Searchbar,
  Surface,
  ActivityIndicator,
  Icon,
  Chip,
} from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AmountText } from '@/components/ui/AmountText';
import { useInventory } from '@/hooks/useInventory';
import type { Inventory } from '@/types/models';

export default function InventoryScreen() {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const {
    inventories,
    loading,
    total,
    page,
    pageSize,
    fetchInventories,
    loadMore,
    refresh,
  } = useInventory();

  useEffect(() => {
    fetchInventories({ lowStock: lowStockOnly || undefined });
  }, [lowStockOnly]);

  const handleItemPress = (item: Inventory) => {
    router.push(`/inventory/${item.productId}`);
  };

  const renderItem = useCallback(
    ({ item }: { item: Inventory }) => {
      const isLowStock = item.quantity <= (item.product?.minStock || 0);
      const isOutOfStock = item.quantity === 0;

      return (
        <Surface style={styles.itemCard} elevation={1}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text variant="titleSmall" style={styles.productName}>
                {item.product?.name || '未知商品'}
              </Text>
              <Text variant="bodySmall" style={styles.productCode}>
                {item.product?.code} | {item.product?.spec || ''}
              </Text>
            </View>
            <StatusBadge
              status={isOutOfStock ? 'out_of_stock' : isLowStock ? 'low_stock' : 'in_stock'}
            />
          </View>

          <View style={styles.itemBody}>
            <View style={styles.quantityInfo}>
              <Icon source="package-variant" size={18} color="#666" />
              <Text variant="bodyMedium" style={styles.quantity}>
                库存: {item.quantity} {item.product?.unit || '个'}
              </Text>
            </View>
            <View style={styles.warehouseInfo}>
              <Icon source="warehouse" size={18} color="#666" />
              <Text variant="bodySmall" style={styles.warehouse}>
                {item.warehouse?.name || '未知仓库'}
              </Text>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <View style={styles.priceInfo}>
              <Text variant="bodySmall" style={styles.priceLabel}>
                均价: ¥{item.avgCostPrice?.toFixed(2) || '0.00'}
              </Text>
            </View>
            {isLowStock && (
              <Chip compact mode="outlined" textStyle={styles.alertChipText}>
                低于最低库存 {item.product?.minStock}
              </Chip>
            )}
          </View>
        </Surface>
      );
    },
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
          暂无库存数据
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="搜索商品名称/编码"
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
      />

      <View style={styles.filterRow}>
        <Chip
          selected={lowStockOnly}
          onPress={() => setLowStockOnly(!lowStockOnly)}
          mode="outlined"
          icon={lowStockOnly ? 'checkbox-marked' : 'checkbox-blank-outline'}
        >
          仅显示低库存
        </Chip>
      </View>

      <Text variant="bodySmall" style={styles.totalText}>
        共 {total} 条记录
      </Text>

      <FlatList
        data={inventories}
        keyExtractor={(item) => `${item.productId}-${item.warehouseId}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        onEndReached={() => loadMore({ lowStock: lowStockOnly || undefined })}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  totalText: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#666',
  },
  list: {
    paddingBottom: 20,
  },
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: '600',
    color: '#333',
  },
  productCode: {
    color: '#999',
    marginTop: 2,
  },
  itemBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quantityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quantity: {
    color: '#333',
  },
  warehouseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warehouse: {
    color: '#666',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  priceInfo: {},
  priceLabel: {
    color: '#666',
  },
  alertChipText: {
    fontSize: 10,
    color: '#e53935',
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
});
