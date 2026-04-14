import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  IconButton,
  List,
} from 'react-native-paper';
import { WarehouseSelect } from '@/components/business/WarehouseSelect';
import { ProductSelect } from '@/components/business/ProductSelect';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { inventoryApi } from '@/api/inventory';
import { useAuth } from '@/hooks/useAuth';
import type { Warehouse, Product } from '@/types/models';

const stockCheckSchema = z.object({
  warehouseId: z.string().min(1, '请选择仓库'),
  checkDate: z.string().min(1, '请选择盘点日期'),
  remark: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, '请选择商品'),
        productName: z.string().optional(),
        checkQuantity: z.number().min(0, '数量不能为负'),
        reason: z.string().optional(),
      })
    )
    .min(1, '请至少添加一个商品'),
});

type StockCheckFormData = z.infer<typeof stockCheckSchema>;

export default function StockCheckScreen() {
  const { currentWarehouse } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showWarehouseSelect, setShowWarehouseSelect] = useState(false);
  const [showProductSelect, setShowProductSelect] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StockCheckFormData>({
    resolver: zodResolver(stockCheckSchema),
    defaultValues: {
      checkDate: new Date().toISOString().split('T')[0],
      warehouseId: currentWarehouse?.id || '',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedWarehouse = watch('warehouseId');
  const items = watch('items');

  const handleSelectWarehouse = (warehouse: Warehouse) => {
    setValue('warehouseId', warehouse.id);
  };

  const handleSelectProduct = (product: Product) => {
    append({
      productId: product.id,
      productName: product.name,
      checkQuantity: 0,
      reason: '',
    });
  };

  const onSubmit = async (data: StockCheckFormData) => {
    setLoading(true);
    try {
      await inventoryApi.createStockCheck({
        warehouseId: data.warehouseId,
        checkDate: data.checkDate,
        remark: data.remark,
        items: data.items.map((item) => ({
          productId: item.productId,
          checkQuantity: item.checkQuantity,
          reason: item.reason,
        })),
      });
      Alert.alert('成功', '盘点单创建成功');
    } catch (error: any) {
      Alert.alert('错误', error?.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Warehouse Selection */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          盘点仓库
        </Text>
        <List.Item
          title={selectedWarehouse ? '已选择仓库' : '选择仓库'}
          description={selectedWarehouse ? '点击更改' : '必填'}
          left={(props) => <List.Icon {...props} icon="warehouse" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowWarehouseSelect(true)}
        />
      </Surface>

      {/* Check Info */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          盘点信息
        </Text>
        <Controller
          control={control}
          name="checkDate"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="盘点日期"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="remark"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="备注"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              multiline
              style={styles.input}
            />
          )}
        />
      </Surface>

      {/* Products */}
      <Surface style={styles.section} elevation={1}>
        <View style={styles.sectionHeader}>
          <Text variant="titleSmall">盘点明细</Text>
          <Button
            mode="text"
            onPress={() => setShowProductSelect(true)}
            icon="plus"
          >
            添加商品
          </Button>
        </View>

        {fields.map((field, index) => (
          <View key={field.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text variant="bodyMedium" style={styles.itemName}>
                {field.productName || '商品'}
              </Text>
              <IconButton
                icon="delete"
                size={20}
                onPress={() => remove(index)}
              />
            </View>
            <Controller
              control={control}
              name={`items.${index}.checkQuantity`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="盘点数量"
                  value={String(value || '')}
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
              )}
            />
            <Controller
              control={control}
              name={`items.${index}.reason`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="差异原因"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                />
              )}
            />
          </View>
        ))}

        {fields.length === 0 && (
          <Text style={styles.emptyText}>请添加商品进行盘点</Text>
        )}
      </Surface>

      {/* Submit */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          提交盘点单
        </Button>
      </View>

      {/* Modals */}
      <WarehouseSelect
        visible={showWarehouseSelect}
        onDismiss={() => setShowWarehouseSelect(false)}
        onSelect={handleSelectWarehouse}
      />
      <ProductSelect
        visible={showProductSelect}
        onDismiss={() => setShowProductSelect(false)}
        onSelect={handleSelectProduct}
      />

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
    fontWeight: '600',
  },
  input: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  smallInput: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  itemCard: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 24,
  },
  actions: {
    padding: 16,
  },
  submitButton: {
    borderRadius: 8,
    backgroundColor: '#2196f3',
  },
  bottomPadding: {
    height: 40,
  },
});
