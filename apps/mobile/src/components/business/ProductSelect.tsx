import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Modal, Portal, Text, Searchbar, List, IconButton, ActivityIndicator, Badge } from 'react-native-paper';
import { productApi } from '@/api/product';
import { AmountText } from '../ui/AmountText';
import type { Product } from '@/types/models';

interface ProductSelectProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (product: Product) => void;
  onAddPress?: () => void;
  multiple?: boolean;
  selectedProducts?: Product[];
}

export const ProductSelect: React.FC<ProductSelectProps> = ({
  visible,
  onDismiss,
  onSelect,
  onAddPress,
  multiple = false,
  selectedProducts = [],
}) => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchProducts();
    }
  }, [visible]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search) {
        searchProducts(search);
      } else {
        fetchProducts();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getProducts({ pageSize: 50 });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (keyword: string) => {
    setLoading(true);
    try {
      const response = await productApi.getProducts({ keyword, pageSize: 50 });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (product: Product) => {
    return selectedProducts.some((p) => p.id === product.id);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleLarge">选择商品</Text>
          <View style={styles.headerActions}>
            {onAddPress && (
              <IconButton icon="plus" onPress={onAddPress} />
            )}
            <IconButton icon="close" onPress={onDismiss} />
          </View>
        </View>

        <Searchbar
          placeholder="搜索商品名称/编码"
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
        />

        {loading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={`${item.code} | ${item.spec || ''} | ${item.unit || '个'}`}
                onPress={() => {
                  onSelect(item);
                  if (!multiple) {
                    onDismiss();
                  }
                }}
                left={(props) => <List.Icon {...props} icon="package-variant" />}
                right={() =>
                  multiple && isSelected(item) ? (
                    <Badge size={20} style={styles.badge}>
                      已选
                    </Badge>
                  ) : multiple ? (
                    <List.Icon icon="plus" color="#2196f3" />
                  ) : null
                }
                style={[
                  styles.listItem,
                  isSelected(item) && styles.selectedItem,
                ]}
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
  headerActions: {
    flexDirection: 'row',
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
  listItem: {
    paddingVertical: 8,
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  badge: {
    backgroundColor: '#4caf50',
    alignSelf: 'center',
    marginRight: 8,
  },
});
