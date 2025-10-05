import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ title, children, style }: CardProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#242936' : '#FFFFFF',
          borderColor: isDark ? '#363D50' : '#E2E8F0',
        },
        style,
      ]}
    >
      {title && (
        <Text style={[
          styles.title,
          { color: isDark ? '#E6F1FF' : '#0B0C10' }
        ]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});

