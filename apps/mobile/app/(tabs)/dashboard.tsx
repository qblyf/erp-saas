import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, ActivityIndicator, Icon } from 'react-native-paper';
import { Card } from '@/components/ui/Card';
import { AmountText } from '@/components/ui/AmountText';
import { reportApi } from '@/api/report';
import { useAuth } from '@/hooks/useAuth';
import type { DashboardStats } from '@/types/models';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onPress }) => (
  <Surface style={styles.statCard} elevation={1}>
    <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
      <Icon source={icon} size={24} color={color} />
    </View>
    <Text variant="bodySmall" style={styles.statTitle}>
      {title}
    </Text>
    <Text variant="titleLarge" style={[styles.statValue, { color }]}>
      {value}
    </Text>
  </Surface>
);

export default function DashboardScreen() {
  const { user, currentStore, currentWarehouse, tenant } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const data = await reportApi.getDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Info */}
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.greeting}>
          您好，{user?.realName || user?.username}
        </Text>
        <Text variant="bodySmall" style={styles.tenantInfo}>
          {tenant?.name || '未知租户'}
        </Text>
      </View>

      {/* Current Store/Warehouse */}
      {(currentStore || currentWarehouse) && (
        <Surface style={styles.locationCard} elevation={1}>
          {currentStore && (
            <View style={styles.locationRow}>
              <Icon source="store" size={18} color="#2196f3" />
              <Text variant="bodyMedium" style={styles.locationText}>
                {currentStore.name}
              </Text>
            </View>
          )}
          {currentWarehouse && (
            <View style={styles.locationRow}>
              <Icon source="warehouse" size={18} color="#ff9800" />
              <Text variant="bodyMedium" style={styles.locationText}>
                {currentWarehouse.name}
              </Text>
            </View>
          )}
        </Surface>
      )}

      {/* Today's Stats */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        今日概览
      </Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="今日销售"
          value={stats ? `¥${stats.todaySale.toLocaleString()}` : '-'}
          icon="currency-usd"
          color="#4caf50"
        />
        <StatCard
          title="今日采购"
          value={stats ? `¥${stats.todayPurchase.toLocaleString()}` : '-'}
          icon="truck"
          color="#ff9800"
        />
        <StatCard
          title="今日收款"
          value={stats ? `¥${stats.todayReceived.toLocaleString()}` : '-'}
          icon="cash-plus"
          color="#2196f3"
        />
        <StatCard
          title="今日付款"
          value={stats ? `¥${stats.todayPaid.toLocaleString()}` : '-'}
          icon="cash-minus"
          color="#e53935"
        />
      </View>

      {/* Pending Tasks */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        待办事项
      </Text>
      <View style={styles.pendingGrid}>
        <Surface style={styles.pendingCard} elevation={1}>
          <Text variant="displaySmall" style={styles.pendingNumber}>
            {stats?.pendingSaleOrders || 0}
          </Text>
          <Text variant="bodySmall" style={styles.pendingLabel}>
            待审核销售单
          </Text>
        </Surface>
        <Surface style={styles.pendingCard} elevation={1}>
          <Text variant="displaySmall" style={styles.pendingNumber}>
            {stats?.pendingPurchaseOrders || 0}
          </Text>
          <Text variant="bodySmall" style={styles.pendingLabel}>
            待审核采购单
          </Text>
        </Surface>
        <Surface style={styles.pendingCard} elevation={1}>
          <Text variant="displaySmall" style={styles.pendingNumber}>
            {stats?.pendingStockChecks || 0}
          </Text>
          <Text variant="bodySmall" style={styles.pendingLabel}>
            待盘点单
          </Text>
        </Surface>
        <Surface style={styles.pendingCard} elevation={1}>
          <Text variant="displaySmall" style={[styles.pendingNumber, { color: '#e53935' }]}>
            {stats?.lowStockProducts || 0}
          </Text>
          <Text variant="bodySmall" style={styles.pendingLabel}>
            低库存商品
          </Text>
        </Surface>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

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
    padding: 16,
    backgroundColor: '#2196f3',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  greeting: {
    color: '#fff',
    fontWeight: '600',
  },
  tenantInfo: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  locationCard: {
    margin: 16,
    marginTop: -20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  locationText: {
    color: '#333',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '600',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  statCard: {
    width: '46%',
    margin: '2%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    color: '#666',
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  pendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  pendingCard: {
    width: '46%',
    margin: '2%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  pendingNumber: {
    fontWeight: 'bold',
    color: '#2196f3',
  },
  pendingLabel: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
  },
  bottomPadding: {
    height: 20,
  },
});
