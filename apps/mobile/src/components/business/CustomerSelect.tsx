import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text, Searchbar, List, IconButton, ActivityIndicator } from 'react-native-paper';
import { customerApi } from '@/api/customer';
import type { Customer } from '@/types/models';

interface CustomerSelectProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (customer: Customer) => void;
  value?: Customer | null;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
  visible,
  onDismiss,
  onSelect,
  value,
}) => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCustomers();
    }
  }, [visible]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search) {
        searchCustomers(search);
      } else {
        fetchCustomers();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerApi.getCustomers({ pageSize: 50 });
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (keyword: string) => {
    setLoading(true);
    try {
      const response = await customerApi.getCustomers({ keyword, pageSize: 50 });
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to search customers:', error);
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
          <Text variant="titleLarge">选择客户</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>

        <Searchbar
          placeholder="搜索客户名称/编码"
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
        />

        {loading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <ScrollView style={styles.list}>
            {customers.map((customer) => (
              <List.Item
                key={customer.id}
                title={customer.name}
                description={`${customer.code} ${customer.phone || ''}`}
                onPress={() => {
                  onSelect(customer);
                  onDismiss();
                }}
                left={(props) => <List.Icon {...props} icon="account" />}
                right={() =>
                  value?.id === customer.id ? (
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
