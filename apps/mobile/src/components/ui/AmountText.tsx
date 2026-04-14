import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatMoney } from '@/utils/format';

interface AmountTextProps {
  amount: any;
  prefix?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export const AmountText: React.FC<AmountTextProps> = ({
  amount,
  prefix = '¥',
  color = '#333',
  size = 'medium',
}) => {
  const fontSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

  return (
    <Text style={[styles.amount, { color, fontSize }]}>
      {prefix}
      {formatMoney(amount)}
    </Text>
  );
};

const styles = StyleSheet.create({
  amount: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
