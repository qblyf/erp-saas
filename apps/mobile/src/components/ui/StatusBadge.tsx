import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Sale order status
  pending: { bg: '#fff3e0', text: '#e65100' },
  approved: { bg: '#e3f2fd', text: '#1565c0' },
  completed: { bg: '#e8f5e9', text: '#2e7d32' },
  cancelled: { bg: '#ffebee', text: '#c62828' },
  // Stock status
  in_stock: { bg: '#e8f5e9', text: '#2e7d32' },
  low_stock: { bg: '#fff3e0', text: '#e65100' },
  out_of_stock: { bg: '#ffebee', text: '#c62828' },
  // Payment status
  paid: { bg: '#e8f5e9', text: '#2e7d32' },
  unpaid: { bg: '#fff3e0', text: '#e65100' },
  // Active/Inactive
  active: { bg: '#e8f5e9', text: '#2e7d32' },
  inactive: { bg: '#ffebee', text: '#c62828' },
  // Generic
  draft: { bg: '#f5f5f5', text: '#666' },
  processing: { bg: '#e3f2fd', text: '#1565c0' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: '待审核',
  approved: '已审核',
  completed: '已完成',
  cancelled: '已取消',
  in_stock: '有库存',
  low_stock: '低库存',
  out_of_stock: '缺货',
  paid: '已付款',
  unpaid: '未付款',
  active: '启用',
  inactive: '停用',
  draft: '草稿',
  processing: '处理中',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const colors = STATUS_COLORS[status] || { bg: '#f5f5f5', text: '#666' };
  const displayLabel = label || STATUS_LABELS[status] || status;

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{displayLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
