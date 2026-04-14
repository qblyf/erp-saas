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
import type { Warehouse, Product } from '@/types/models';

const stockTransferSchema = z.object({
  fromWarehouseId: z.string().min(1, '请选择源仓库'),
  toWarehouseId: z.string().min(1, '请选择目标仓库'),
  transferDate: z.string().min(1, '请选择调拨日期'),
  remark: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, '请选择商品'),
        productName: z.string().optional(),
        quantity: z.number().min(1, '数量必须大于0'),
        costPrice: z.number().optional(),
      })
    )
    .min(1, '请至少添加一个商品'),
});

type StockTransferFormData = z.infer<typeof stockTransferSchema>;

export default function StockTransferScreen() {
  const [loading, setLoading] = useState(false);
  const [showFromWarehouseSelect, setShowFromWarehouseSelect] = useState(false);
  const [showToWarehouseSelect, setShowToWarehouseSelect] = useState(false);
  const [showProductSelect, setShowProductSelect] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StockTransferFormData>({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: {
      transferDate: new Date().toISOString().split('T')[0],
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const fromWarehouse = watch('fromWarehouseId');
  const toWarehouse = watch('toWarehouseId');
  const items = watch('items');

  const handleSelectFromWarehouse = (warehouse: Warehouse) => {
    setValue('fromWarehouseId', warehouse.id);
  };

  const handleSelectToWarehouse = (warehouse: Warehouse) => {
    setValue('toWarehouseId', warehouse.id);
  };

  const handleSelectProduct = (product: Product) => {
    append({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      costPrice: product.costPrice || 0,
    });
  };

  const onSubmit = async (data: StockTransferFormData) => {
    if (data.fromWarehouseId === data.toWarehouseId) {
      Alert.alert('错误', '源仓库和目标仓库不能相同');
      return;
    }

    setLoading(true);
    try {
      await inventoryApi.createStockTransfer({
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        transferDate: data.transferDate,
        remark: data.remark,
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice,
        })),
      });
      Alert.alert('成功', '调拨单创建成功');
    } catch (error: any) {
      Alert.alert('错误', error?.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* From Warehouse */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          源仓库
        </Text>
        <List.Item
          title={fromWarehouse ? '已选择仓库' : '选择源仓库'}
          description={fromWarehouse ? '点击更改' : '必填'}
          left={(props) => <List.Icon {...props} icon="warehouse" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowFromWarehouseSelect(true)}
        />
      </Surface>

      {/* To Warehouse */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          目标仓库
        </Text>
        <List.Item
          title={toWarehouse ? '已选择仓库' : '选择目标仓库'}
          description={toWarehouse ? '点击更改' : '必填'}
          left={(props) => <List.Icon {...props} icon="warehouse" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowToWarehouseSelect(true)}
        />
      </Surface>

      {/* Transfer Info */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          调拨信息
        </Text>
        <Controller
          control={control}
          name="transferDate"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="调拨日期"
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
          <Text variant="titleSmall">调拨明细</Text>
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
              name={`items.${index}.quantity`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="调拨数量"
                  value={String(value || '')}
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
              )}
            />
          </View>
        ))}

        {fields.length === 0 && (
          <Text style={styles.emptyText}>请添加调拨商品</Text>
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
          提交调拨单
        </Button>
      </View>

      {/* Modals */}
      <WarehouseSelect
        visible={showFromWarehouseSelect}
        onDismiss={() => setShowFromWarehouseSelect(false)}
        onSelect={handleSelectFromWarehouse}
      />
      <WarehouseSelect
        visible={showToWarehouseSelect}
        onDismiss={() => setShowToWarehouseSelect(false)}
        onSelect={handleSelectToWarehouse}
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
