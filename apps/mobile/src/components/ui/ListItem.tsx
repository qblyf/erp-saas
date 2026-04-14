import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';

interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  left,
  right,
  onPress,
  showArrow = false,
}) => {
  const content = (
    <View style={styles.container}>
      {left && <View style={styles.left}>{left}</View>}
      <View style={styles.content}>
        <Text variant="bodyLarge" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {right && <View style={styles.right}>{right}</View>}
      {showArrow && (
        <View style={styles.arrow}>
          <Icon source="chevron-right" size={20} color="#999" />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  left: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '500',
  },
  subtitle: {
    color: '#666',
    marginTop: 2,
  },
  right: {
    marginLeft: 8,
  },
  arrow: {
    marginLeft: 4,
  },
});
