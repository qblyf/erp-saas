import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { StatusBadge } from '../ui/StatusBadge';
import { AmountText } from '../ui/AmountText';
import { formatDate } from '@/utils/format';
import type { SaleOrder, PurchaseOrder } from '@/types/models';

interface OrderCardProps {
  order: SaleOrder | PurchaseOrder;
  type: 'sale' | 'purchase';
  onPress?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, type, onPress }) => {
  const isSale = type === 'sale';
  const orderNo = order.orderNo;
  const date = formatDate(order.orderDate);
  const status = order.status;
  const totalAmount = order.totalAmount;

  const partnerName = isSale
    ? (order as SaleOrder).customer?.name
    : (order as PurchaseOrder).supplier?.name;
  const partnerCode = isSale
    ? (order as SaleOrder).customer?.code
    : (order as PurchaseOrder).supplier?.code;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleSmall" style={styles.orderNo}>
              {orderNo}
            </Text>
            <StatusBadge status={status} />
          </View>
          <AmountText amount={totalAmount} color="#e53935" />
        </View>

        <View style={styles.body}>
          <View style={styles.row}>
            <Icon source={isSale ? 'account' : 'truck'} size={16} color="#666" />
            <Text variant="bodyMedium" style={styles.partnerText}>
              {partnerName || '未知'}
            </Text>
            {partnerCode && (
              <Text variant="bodySmall" style={styles.codeText}>
                ({partnerCode})
              </Text>
            )}
          </View>
          <View style={styles.row}>
            <Icon source="warehouse" size={16} color="#666" />
            <Text variant="bodySmall" style={styles.warehouseText}>
              {isSale
                ? (order as SaleOrder).warehouse?.name
                : (order as PurchaseOrder).warehouse?.name || '未知'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.dateText}>
            {date}
          </Text>
          <Icon source="chevron-right" size={18} color="#ccc" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNo: {
    fontWeight: '600',
    color: '#333',
  },
  body: {
    gap: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partnerText: {
    color: '#333',
  },
  codeText: {
    color: '#999',
  },
  warehouseText: {
    color: '#666',
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  dateText: {
    color: '#999',
  },
});
