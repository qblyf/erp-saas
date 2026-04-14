import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import {
  Text,
  Surface,
  List,
  IconButton,
  Divider,
  Button,
  Dialog,
  Portal,
  RadioButton,
} from 'react-native-paper';
import { Icon } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/utils/format';
import type { Store, Warehouse } from '@/types/models';

export default function ProfileScreen() {
  const {
    user,
    tenant,
    currentStore,
    currentWarehouse,
    logout,
    setCurrentStore,
    setCurrentWarehouse,
  } = useAuth();

  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(currentStore);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(currentWarehouse);

  const handleLogout = () => {
    Alert.alert(
      '确认退出',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: logout },
      ]
    );
  };

  const handleStoreChange = () => {
    if (selectedStore && selectedStore.id !== currentStore?.id) {
      setCurrentStore(selectedStore);
      Alert.alert('成功', `已切换到门店: ${selectedStore.name}`);
    }
    setShowStoreDialog(false);
  };

  const handleWarehouseChange = () => {
    if (selectedWarehouse && selectedWarehouse.id !== currentWarehouse?.id) {
      setCurrentWarehouse(selectedWarehouse);
      Alert.alert('成功', `已切换到仓库: ${selectedWarehouse.name}`);
    }
    setShowWarehouseDialog(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <Surface style={styles.userCard} elevation={2}>
        <View style={styles.avatar}>
          <Icon source="account-circle" size={64} color="#2196f3" />
        </View>
        <View style={styles.userInfo}>
          <Text variant="titleLarge" style={styles.userName}>
            {user?.realName || user?.username}
          </Text>
          <Text variant="bodySmall" style={styles.userCode}>
            用户名: {user?.username}
          </Text>
          <Text variant="bodySmall" style={styles.tenantName}>
            租户: {tenant?.name || '未知'}
          </Text>
        </View>
      </Surface>

      {/* Current Context */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          当前上下文
        </Text>
        <List.Item
          title="当前门店"
          description={currentStore?.name || '未选择'}
          left={(props) => <List.Icon {...props} icon="store" color="#2196f3" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowStoreDialog(true)}
        />
        <Divider />
        <List.Item
          title="当前仓库"
          description={currentWarehouse?.name || '未选择'}
          left={(props) => <List.Icon {...props} icon="warehouse" color="#ff9800" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowWarehouseDialog(true)}
        />
      </Surface>

      {/* Quick Info */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          账号信息
        </Text>
        <List.Item
          title="手机号"
          description={user?.phone || '-'}
          left={(props) => <List.Icon {...props} icon="phone" />}
        />
        <Divider />
        <List.Item
          title="邮箱"
          description={user?.email || '-'}
          left={(props) => <List.Icon {...props} icon="email" />}
        />
        <Divider />
        <List.Item
          title="最后登录"
          description={user?.lastLoginAt ? formatDateTime(user.lastLoginAt) : '-'}
          left={(props) => <List.Icon {...props} icon="clock" />}
        />
      </Surface>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#e53935"
          icon="logout"
        >
          退出登录
        </Button>
      </View>

      {/* Store Dialog */}
      <Portal>
        <Dialog visible={showStoreDialog} onDismiss={() => setShowStoreDialog(false)}>
          <Dialog.Title>选择门店</Dialog.Title>
          <Dialog.ScrollArea>
            <RadioButton.Group
              value={selectedStore?.id || ''}
              onValueChange={(value) => {
                // Find the store with this id - in real app this would come from props or store
                setSelectedStore({ id: value, name: value, code: value } as any);
              }}
            >
              {[
                { id: 'store1', name: '门店一', code: 'S001' },
                { id: 'store2', name: '门店二', code: 'S002' },
              ].map((store) => (
                <RadioButton.Item
                  key={store.id}
                  label={store.name}
                  value={store.id}
                />
              ))}
            </RadioButton.Group>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowStoreDialog(false)}>取消</Button>
            <Button onPress={handleStoreChange}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Warehouse Dialog */}
      <Portal>
        <Dialog visible={showWarehouseDialog} onDismiss={() => setShowWarehouseDialog(false)}>
          <Dialog.Title>选择仓库</Dialog.Title>
          <Dialog.ScrollArea>
            <RadioButton.Group
              value={selectedWarehouse?.id || ''}
              onValueChange={(value) => {
                setSelectedWarehouse({ id: value, name: value, code: value } as any);
              }}
            >
              {[
                { id: 'wh1', name: '仓库一', code: 'W001' },
                { id: 'wh2', name: '仓库二', code: 'W002' },
              ].map((warehouse) => (
                <RadioButton.Item
                  key={warehouse.id}
                  label={warehouse.name}
                  value={warehouse.id}
                />
              ))}
            </RadioButton.Group>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowWarehouseDialog(false)}>取消</Button>
            <Button onPress={handleWarehouseChange}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  userInfo: {},
  userName: {
    fontWeight: '600',
    color: '#333',
  },
  userCode: {
    color: '#666',
    marginTop: 4,
  },
  tenantName: {
    color: '#999',
    marginTop: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  actions: {
    padding: 16,
  },
  logoutButton: {
    borderRadius: 8,
    borderColor: '#e53935',
  },
  bottomPadding: {
    height: 40,
  },
});
