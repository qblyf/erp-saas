import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Card as PaperCard, Text } from 'react-native-paper';
import { formatMoney } from '@/utils/format';

interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  style,
  onPress,
}) => {
  const content = (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodySmall" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );

  if (onPress) {
    return (
      <PaperCard style={[styles.card, style]} onPress={onPress}>
        {content}
      </PaperCard>
    );
  }

  return <PaperCard style={[styles.card, style]}>{content}</PaperCard>;
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  content: {},
});
