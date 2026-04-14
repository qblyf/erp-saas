import React from 'react';
import { Stack } from 'expo-router';

export default function SaleLayout() {
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
      <Stack.Screen name="orders" options={{ headerTitle: '销售订单' }} />
      <Stack.Screen name="[id]" options={{ headerTitle: '订单详情' }} />
      <Stack.Screen name="create" options={{ headerTitle: '新建销售单' }} />
    </Stack>
  );
}
