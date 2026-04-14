import React from 'react';
import { Stack } from 'expo-router';

export default function MyLayout() {
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
      <Stack.Screen name="profile" options={{ headerTitle: '我的' }} />
    </Stack>
  );
}
