import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  ActivityIndicator,
  Surface,
  Icon,
  Chip,
} from 'react-native-paper';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AmountText } from '@/components/ui/AmountText';
import { formatDate } from '@/utils/format';
import { financeApi } from '@/api/finance';
import type { Voucher } from '@/types/models';

const STATUS_FILTERS = [
  { value: '', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'approved', label: '已审核' },
  { value: 'posted', label: '已过账' },
];

export default function VouchersScreen() {
  const [status, setStatus] = useState('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const pageSize = 20;

  const fetchVouchers = async (params?: { status?: string }) => {
    try {
      const response = await financeApi.getVouchers({
        status: params?.status || status || undefined,
        pageSize,
      });
      setVouchers(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [status]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVouchers();
  };

  const renderItem = useCallback(
    ({ item }: { item: Voucher }) => (
      <Surface style={styles.itemCard} elevation={1}>
        <View style={styles.itemHeader}>
          <View style={styles.headerLeft}>
            <Icon source="file-document" size={24} color="#2196f3" />
            <View style={styles.headerInfo}>
              <Text variant="titleSmall" style={styles.voucherNo}>
                {item.voucherNo}
              </Text>
              <Text variant="bodySmall" style={styles.date}>
                {formatDate(item.voucherDate)}
              </Text>
            </View>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.itemBody}>
          <View style={styles.amountRow}>
            <Text variant="bodySmall" style={styles.amountLabel}>
              借方:
            </Text>
            <AmountText amount={item.totalDebit} size="small" />
          </View>
          <View style={styles.amountRow}>
            <Text variant="bodySmall" style={styles.amountLabel}>
              贷方:
            </Text>
            <AmountText amount={item.totalCredit} size="small" />
          </View>
        </View>

        <View style={styles.itemFooter}>
          <Text variant="bodySmall" style={styles.typeLabel}>
            凭证类型: {item.voucherType}
          </Text>
          {item.attachmentCount > 0 && (
            <Chip compact mode="outlined" icon="paperclip" textStyle={styles.attachmentText}>
              {item.attachmentCount}个附件
            </Chip>
          )}
        </View>

        {item.remark && (
          <Text variant="bodySmall" style={styles.remark}>
            {item.remark}
          </Text>
        )}
      </Surface>
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
          暂无凭证
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((filter) => (
          <Chip
            key={filter.value}
            selected={status === filter.value}
            onPress={() => setStatus(filter.value)}
            mode="outlined"
            style={styles.filterChip}
          >
            {filter.label}
          </Chip>
        ))}
      </View>

      <Text variant="bodySmall" style={styles.totalText}>
        共 {total} 条记录
      </Text>

      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  filterRow: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 4,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerInfo: {},
  voucherNo: {
    fontWeight: '600',
    color: '#333',
  },
  date: {
    color: '#999',
    marginTop: 2,
  },
  itemBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountLabel: {
    color: '#666',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  typeLabel: {
    color: '#666',
  },
  attachmentText: {
    fontSize: 10,
  },
  remark: {
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
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
