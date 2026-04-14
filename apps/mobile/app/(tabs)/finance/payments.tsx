import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import {
  Text,
  SegmentedButtons,
  ActivityIndicator,
  Surface,
  Icon,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AmountText } from '@/components/ui/AmountText';
import { formatDate } from '@/utils/format';
import { financeApi } from '@/api/finance';
import type { Payment } from '@/types/models';

type PaymentType = 'all' | 'receive' | 'pay';

export default function PaymentsScreen() {
  const router = useRouter();
  const [paymentType, setPaymentType] = useState<PaymentType>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const pageSize = 20;

  const fetchPayments = async (params?: { paymentType?: string }) => {
    try {
      const typeMap = { receive: 'receive', pay: 'pay', all: undefined };
      const response = await financeApi.getPayments({
        paymentType: params?.paymentType || typeMap[paymentType],
        pageSize,
      });
      setPayments(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [paymentType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handlePaymentPress = (payment: Payment) => {
    // Navigate to payment detail if needed
  };

  const renderItem = useCallback(
    ({ item }: { item: Payment }) => {
      const isReceive = item.paymentType === 'receive';
      return (
        <Surface style={styles.itemCard} elevation={1}>
          <View style={styles.itemHeader}>
            <View style={styles.headerLeft}>
              <Icon
                source={isReceive ? 'cash-plus' : 'cash-minus'}
                size={24}
                color={isReceive ? '#4caf50' : '#e53935'}
              />
              <View style={styles.headerInfo}>
                <Text variant="titleSmall" style={styles.paymentNo}>
                  {item.paymentNo}
                </Text>
                <Text variant="bodySmall" style={styles.date}>
                  {formatDate(item.paymentDate)}
                </Text>
              </View>
            </View>
            <AmountText
              amount={item.amount}
              color={isReceive ? '#4caf50' : '#e53935'}
            />
          </View>

          <View style={styles.itemBody}>
            <View style={styles.partnerInfo}>
              <Text variant="bodySmall" style={styles.partnerLabel}>
                {isReceive ? '客户' : '供应商'}:
              </Text>
              <Text variant="bodyMedium" style={styles.partnerName}>
                {isReceive ? item.customer?.name || '-' : item.supplier?.name || '-'}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              <Icon source="bank" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.accountName}>
                {item.account?.name || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.itemFooter}>
            <StatusBadge status={item.status} />
            {item.relateBusinessNo && (
              <Text variant="bodySmall" style={styles.businessNo}>
                关联: {item.relateBusinessNo}
              </Text>
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
          暂无收付款记录
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={paymentType}
        onValueChange={(value) => setPaymentType(value as PaymentType)}
        buttons={[
          { value: 'all', label: '全部' },
          { value: 'receive', label: '收款' },
          { value: 'pay', label: '付款' },
        ]}
        style={styles.segmented}
      />

      <Text variant="bodySmall" style={styles.totalText}>
        共 {total} 条记录
      </Text>

      <FlatList
        data={payments}
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
  segmented: {
    margin: 16,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerInfo: {},
  paymentNo: {
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
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  partnerLabel: {
    color: '#666',
  },
  partnerName: {
    color: '#333',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accountName: {
    color: '#666',
    marginLeft: 2,
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
  businessNo: {
    color: '#666',
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
