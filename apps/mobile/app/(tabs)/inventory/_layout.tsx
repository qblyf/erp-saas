import React from 'react';
import { Stack } from 'expo-router';

export default function InventoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196f3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: '库存查询' }} />
      <Stack.Screen name="check" options={{ headerTitle: '库存盘点' }} />
      <Stack.Screen name="transfer" options={{ headerTitle: '库存调拨' }} />
      <Stack.Screen name="[id]" options={{ headerTitle: '商品库存' }} />
    </Stack>
  );
}
