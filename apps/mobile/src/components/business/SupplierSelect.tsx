import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Modal, Portal, Text, Searchbar, List, IconButton, ActivityIndicator } from 'react-native-paper';
import { supplierApi } from '@/api/supplier';
import type { Supplier } from '@/types/models';

interface SupplierSelectProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (supplier: Supplier) => void;
  value?: Supplier | null;
}

export const SupplierSelect: React.FC<SupplierSelectProps> = ({
  visible,
  onDismiss,
  onSelect,
  value,
}) => {
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchSuppliers();
    }
  }, [visible]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search) {
        searchSuppliers(search);
      } else {
        fetchSuppliers();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await supplierApi.getSuppliers({ pageSize: 50 });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchSuppliers = async (keyword: string) => {
    setLoading(true);
    try {
      const response = await supplierApi.getSuppliers({ keyword, pageSize: 50 });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to search suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">选择供应商</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <Searchbar
          placeholder="搜索供应商名称/编码"
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
        />

        {loading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={suppliers}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`${item.code} ${item.phone || ''}`}
                onPress={() => {
                  onSelect(item);
                  onDismiss();
                }}
                left={(props) => <List.Icon {...props} icon="truck" />}
                right={() =>
                  value?.id === item.id ? (
                    <List.Icon icon="check" color="#4caf50" />
                  ) : null
                }
              />
            )}
          />
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
