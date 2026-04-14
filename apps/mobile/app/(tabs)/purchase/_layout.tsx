import React from 'react';
import { Stack } from 'expo-router';

export default function PurchaseLayout() {
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
      <Stack.Screen name="orders" options={{ headerTitle: '采购订单' }} />
      <Stack.Screen name="[id]" options={{ headerTitle: '订单详情' }} />
      <Stack.Screen name="create" options={{ headerTitle: '新建采购单' }} />
    </Stack>
  );
}
