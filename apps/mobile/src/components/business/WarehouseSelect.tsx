import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text, Searchbar, List, IconButton, RadioButton, ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import type { Warehouse } from '@/types/models';

interface WarehouseSelectProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (warehouse: Warehouse) => void;
  value?: Warehouse | null;
  warehouses?: Warehouse[];
}

export const WarehouseSelect: React.FC<WarehouseSelectProps> = ({
  visible,
  onDismiss,
  onSelect,
  value,
  warehouses: propWarehouses,
}) => {
  const [search, setSearch] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);

  const { currentWarehouse } = useAuthStore();
  const allWarehouses = propWarehouses || warehouses;

  useEffect(() => {
    if (visible && propWarehouses) {
      setWarehouses(propWarehouses);
    }
  }, [visible, propWarehouses]);

  const filteredWarehouses = search
    ? allWarehouses.filter(
        (w) =>
          w.name.includes(search) ||
          w.code.includes(search)
      )
    : allWarehouses;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">选择仓库</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <Searchbar
          placeholder="搜索仓库名称/编码"
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
        />

        {loading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <ScrollView style={styles.list}>
            {filteredWarehouses.map((warehouse) => (
              <List.Item
                key={warehouse.id}
                title={warehouse.name}
                description={`${warehouse.code} ${warehouse.address || ''}`}
                onPress={() => {
                  onSelect(warehouse);
                  onDismiss();
                }}
                left={(props) => <List.Icon {...props} icon="warehouse" />}
                right={() =>
                  value?.id === warehouse.id || currentWarehouse?.id === warehouse.id ? (
                    <List.Icon icon="check" color="#4caf50" />
                  ) : null
                }
              />
            ))}
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  searchbar: {
    margin: 16,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    marginVertical: 20,
  },
  list: {
    maxHeight: 400,
  },
});
