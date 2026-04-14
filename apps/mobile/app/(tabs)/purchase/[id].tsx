import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import {
  Text,
  Surface,
  Button,
  Divider,
  ActivityIndicator,
  Icon,
} from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AmountText } from '@/components/ui/AmountText';
import { ListItem } from '@/components/ui/ListItem';
import { formatDate, formatDateTime } from '@/utils/format';
import { purchaseApi } from '@/api/purchase';
import type { PurchaseOrder } from '@/types/models';

export default function PurchaseOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await purchaseApi.getOrder(id);
      setOrder(data);
    } catch (error) {
      Alert.alert('错误', '获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async () => {
    if (!order) return;
    Alert.alert('确认审核', `确认审核订单 ${order.orderNo}？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '确认',
        onPress: async () => {
          try {
            await purchaseApi.auditOrder(order.id);
            Alert.alert('成功', '审核成功');
            fetchOrder();
          } catch (error) {
            Alert.alert('错误', '审核失败');
          }
        },
      },
    ]);
  };

  const handleCancel = async () => {
    if (!order) return;
    Alert.alert('确认取消', `确认取消订单 ${order.orderNo}？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '确认',
        onPress: async () => {
          try {
            await purchaseApi.cancelOrder(order.id);
            Alert.alert('成功', '取消成功');
            fetchOrder();
          } catch (error) {
            Alert.alert('错误', '取消失败');
          }
        },
      },
    ]);
  };

  const handleStockIn = () => {
    if (!order) return;
    router.push(`/purchase/${order.id}/stock-in`);
  };

  const handleReturn = () => {
    if (!order) return;
    router.push(`/purchase/${order.id}/return`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <View style={styles.headerTop}>
          <Text variant="titleLarge" style={styles.orderNo}>
            {order.orderNo}
          </Text>
          <StatusBadge status={order.status} />
        </View>
        <Text variant="bodySmall" style={styles.date}>
          {formatDateTime(order.createdAt)}
        </Text>
      </Surface>

      {/* Supplier Info */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          供应商信息
        </Text>
        <ListItem
          title={order.supplier?.name || '未知供应商'}
          subtitle={order.supplier?.code}
          left={<Icon source="truck" size={24} color="#ff9800" />}
        />
        <Divider />
        <ListItem
          title="联系电话"
          subtitle={order.phone || order.supplier?.mobile || '-'}
          left={<Icon source="phone" size={24} color="#666" />}
        />
        <Divider />
        <ListItem
          title="供应商地址"
          subtitle={order.supplier?.address || '-'}
          left={<Icon source="map-marker" size={24} color="#666" />}
        />
      </Surface>

      {/* Warehouse Info */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          入库仓库
        </Text>
        <ListItem
          title={order.warehouse?.name || '未知仓库'}
          subtitle={order.warehouse?.code}
          left={<Icon source="warehouse" size={24} color="#2196f3" />}
        />
      </Surface>

      {/* Items */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          商品明细
        </Text>
        {order.items?.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text variant="bodyMedium">{item.product?.name}</Text>
              <Text variant="bodySmall" style={styles.itemSpec}>
                {item.product?.spec || ''} {item.product?.unit || ''}
              </Text>
            </View>
            <View style={styles.itemAmount}>
              <Text variant="bodyMedium">
                {item.quantity} × ¥{item.price}
              </Text>
              <AmountText amount={item.amount} size="small" />
            </View>
          </View>
        ))}
        <Divider style={styles.divider} />
        <View style={styles.totalRow}>
          <Text variant="titleMedium">合计</Text>
          <AmountText amount={order.totalAmount} size="large" color="#e53935" />
        </View>
      </Surface>

      {/* Remark */}
      {order.remark && (
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            备注
          </Text>
          <Text variant="bodyMedium" style={styles.remark}>
            {order.remark}
          </Text>
        </Surface>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {order.status === 'pending' && (
          <>
            <Button
              mode="contained"
              onPress={handleAudit}
              style={[styles.actionButton, styles.auditButton]}
            >
              审核订单
            </Button>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.actionButton}
              textColor="#e53935"
            >
              取消订单
            </Button>
          </>
        )}
        {order.status === 'approved' && (
          <>
            <Button
              mode="contained"
              onPress={handleStockIn}
              style={[styles.actionButton, styles.auditButton]}
            >
              入库
            </Button>
            <Button
              mode="outlined"
              onPress={handleReturn}
              style={styles.actionButton}
              textColor="#ff9800"
            >
              退货
            </Button>
          </>
        )}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNo: {
    fontWeight: '600',
    color: '#333',
  },
  date: {
    color: '#666',
    marginTop: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemSpec: {
    color: '#999',
    marginTop: 2,
  },
  itemAmount: {
    alignItems: 'flex-end',
  },
  divider: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  remark: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    color: '#666',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
  },
  auditButton: {
    backgroundColor: '#4caf50',
  },
  bottomPadding: {
    height: 20,
  },
});
