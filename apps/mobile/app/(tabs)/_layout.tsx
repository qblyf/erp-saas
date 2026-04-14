import React from 'react';
import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function TabsLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2196f3',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: '#2196f3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '首页',
          headerTitle: '工作台',
          tabBarIcon: ({ color, size }) => (
            <Icon source="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sale"
        options={{
          title: '销售',
          headerTitle: '销售管理',
          tabBarIcon: ({ color, size }) => (
            <Icon source="currency-usd" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="purchase"
        options={{
          title: '采购',
          headerTitle: '采购管理',
          tabBarIcon: ({ color, size }) => (
            <Icon source="truck" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: '库存',
          headerTitle: '库存管理',
          tabBarIcon: ({ color, size }) => (
            <Icon source="package-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: '财务',
          headerTitle: '财务管理',
          tabBarIcon: ({ color, size }) => (
            <Icon source="bank" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '我的',
          headerTitle: '我的',
          tabBarIcon: ({ color, size }) => (
            <Icon source="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
