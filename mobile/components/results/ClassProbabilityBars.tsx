import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { AnalysisResult } from '@/types';

interface ClassProbabilityBarsProps {
  probs: AnalysisResult['prediction']['probs'];
}

export function ClassProbabilityBars({ probs }: ClassProbabilityBarsProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const colors = {
    background: isDark ? '#0B0C10' : '#F8FAFD',
    primaryText: isDark ? '#E6F1FF' : '#0B0C10',
    secondaryText: isDark ? '#A9B4C9' : '#3E4755',
  };

  const getColor = (label: string) => {
    if (label === 'CONFIRMED') return '#10b981';
    if (label === 'CANDIDATE') return '#f59e0b';
    return '#ef4444';
  };

  const probabilities = [
    { label: 'CONFIRMED', value: probs.CONFIRMED },
    { label: 'CANDIDATE', value: probs.CANDIDATE },
    { label: 'FALSE_POSITIVE', value: probs.FALSE_POSITIVE },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.primaryText }]}>
        Classification Probabilities
      </Text>
      {probabilities.map((prob, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.primaryText }]}>
              {prob.label.replace('_', ' ')}
            </Text>
            <Text style={[styles.value, { color: colors.primaryText }]}>
              {(prob.value * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={[styles.barContainer, { backgroundColor: colors.background }]}>
            <View
              style={[
                styles.bar,
                {
                  width: `${prob.value * 100}%`,
                  backgroundColor: getColor(prob.label),
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  item: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});

