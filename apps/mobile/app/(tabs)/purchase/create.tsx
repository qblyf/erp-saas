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
import { router } from 'expo-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SupplierSelect } from '@/components/business/SupplierSelect';
import { ProductSelect } from '@/components/business/ProductSelect';
import { WarehouseSelect } from '@/components/business/WarehouseSelect';
import { AmountText } from '@/components/ui/AmountText';
import { purchaseApi } from '@/api/purchase';
import { useAuth } from '@/hooks/useAuth';
import type { Supplier, Product, Warehouse } from '@/types/models';

const orderSchema = z.object({
  supplierId: z.string().min(1, '请选择供应商'),
  warehouseId: z.string().min(1, '请选择仓库'),
  orderDate: z.string().min(1, '请选择订单日期'),
  contact: z.string().optional(),
  phone: z.string().optional(),
  remark: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, '请选择商品'),
        productName: z.string().optional(),
        quantity: z.number().min(1, '数量必须大于0'),
        price: z.number().min(0, '价格不能为负'),
      })
    )
    .min(1, '请至少添加一个商品'),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function CreatePurchaseOrderScreen() {
  const { currentWarehouse } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSupplierSelect, setShowSupplierSelect] = useState(false);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [showWarehouseSelect, setShowWarehouseSelect] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderDate: new Date().toISOString().split('T')[0],
      warehouseId: currentWarehouse?.id || '',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const selectedSupplier = watch('supplierId');
  const selectedWarehouse = watch('warehouseId');
  const items = watch('items');

  const handleSelectSupplier = (supplier: Supplier) => {
    setValue('supplierId', supplier.id);
    setValue('contact', supplier.contact || '');
    setValue('phone', supplier.mobile || supplier.phone || '');
  };

  const handleSelectProduct = (product: Product) => {
    append({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.purchasePrice || 0,
    });
  };

  const handleSelectWarehouse = (warehouse: Warehouse) => {
    setValue('warehouseId', warehouse.id);
  };

  const calculateTotal = () => {
    return items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    );
  };

  const onSubmit = async (data: OrderFormData) => {
    setLoading(true);
    try {
      await purchaseApi.createOrder({
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        orderDate: data.orderDate,
        contact: data.contact,
        phone: data.phone,
        remark: data.remark,
        items: data.items.map((item) => ({
          productId: item.productId,
          warehouseId: data.warehouseId,
          quantity: item.quantity,
          price: item.price,
        })),
      });
      Alert.alert('成功', '采购订单创建成功', [
        { text: '确定', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('错误', error?.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Supplier Selection */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          供应商信息
        </Text>
        <List.Item
          title={selectedSupplier ? '已选择供应商' : '选择供应商'}
          description={selectedSupplier ? '点击更改' : '必填'}
          left={(props) => <List.Icon {...props} icon="truck" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowSupplierSelect(true)}
        />
      </Surface>

      {/* Warehouse Selection */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          入库仓库
        </Text>
        <List.Item
          title={selectedWarehouse ? '已选择仓库' : '选择仓库'}
          description={selectedWarehouse ? '点击更改' : '必填'}
          left={(props) => <List.Icon {...props} icon="warehouse" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setShowWarehouseSelect(true)}
        />
      </Surface>

      {/* Order Info */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          订单信息
        </Text>
        <Controller
          control={control}
          name="orderDate"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="订单日期"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="contact"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="联系人"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              style={styles.input}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, value } }) => (
            <TextInput
              label="联系电话"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />
          )}
        />
      </Surface>

      {/* Products */}
      <Surface style={styles.section} elevation={1}>
        <View style={styles.sectionHeader}>
          <Text variant="titleSmall">商品明细</Text>
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
            <View style={styles.itemRow}>
              <Controller
                control={control}
                name={`items.${index}.quantity`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="数量"
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
                name={`items.${index}.price`}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="单价"
                    value={String(value || '')}
                    onChangeText={(text) => onChange(Number(text) || 0)}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.smallInput}
                  />
                )}
              />
            </View>
          </View>
        ))}

        {fields.length === 0 && (
          <Text style={styles.emptyText}>请添加商品</Text>
        )}
      </Surface>

      {/* Remark */}
      <Surface style={styles.section} elevation={1}>
        <Text variant="titleSmall" style={styles.sectionTitle}>
          备注
        </Text>
        <Controller
          control={control}
          name="remark"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          )}
        />
      </Surface>

      {/* Total */}
      <Surface style={styles.totalSection} elevation={2}>
        <Text variant="titleMedium">合计金额</Text>
        <AmountText amount={calculateTotal()} size="large" color="#e53935" />
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
          提交订单
        </Button>
      </View>

      {/* Modals */}
      <SupplierSelect
        visible={showSupplierSelect}
        onDismiss={() => setShowSupplierSelect(false)}
        onSelect={handleSelectSupplier}
      />
      <ProductSelect
        visible={showProductSelect}
        onDismiss={() => setShowProductSelect(false)}
        onSelect={handleSelectProduct}
      />
      <WarehouseSelect
        visible={showWarehouseSelect}
        onDismiss={() => setShowWarehouseSelect(false)}
        onSelect={handleSelectWarehouse}
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
  itemCard: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  smallInput: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 24,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
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
