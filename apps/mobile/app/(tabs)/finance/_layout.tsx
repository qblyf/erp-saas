import React from 'react';
import { Stack } from 'expo-router';

export default function FinanceLayout() {
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
      <Stack.Screen name="payments" options={{ headerTitle: '收付款记录' }} />
      <Stack.Screen name="vouchers" options={{ headerTitle: '凭证查询' }} />
    </Stack>
  );
}
