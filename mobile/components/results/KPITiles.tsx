import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { AnalysisResult } from '@/types';

interface KPITilesProps {
  metrics: AnalysisResult['metrics'];
}

export function KPITiles({ metrics }: KPITilesProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const colors = {
    background: isDark ? '#0B0C10' : '#F8FAFD',
    primaryText: isDark ? '#E6F1FF' : '#0B0C10',
    secondaryText: isDark ? '#A9B4C9' : '#3E4755',
    border: isDark ? '#363D50' : '#E2E8F0',
  };

  const kpis = [
    { label: 'Period', value: metrics.periodDays, unit: 'days', show: true },
    { label: 'Depth', value: metrics.depthPpm, unit: 'ppm', show: true },
    { label: 'Duration', value: metrics.durationHr, unit: 'hr', show: true },
    { label: 'SNR', value: metrics.snr, unit: '', show: true },
    { label: 'Radius', value: metrics.radiusRe, unit: 'R⊕', show: metrics.radiusRe !== undefined },
    { label: 'Odd/Even Δ', value: metrics.oddEvenDelta, unit: '', show: metrics.oddEvenDelta !== undefined },
  ].filter((kpi) => kpi.show);

  return (
    <View style={styles.grid}>
      {kpis.map((kpi, index) => (
        <View key={index} style={styles.tileWrapper}>
          <View
            style={[
              styles.tile,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.tileLabel, { color: colors.secondaryText }]}>
              {kpi.label}
            </Text>
            <Text style={[styles.tileValue, { color: colors.primaryText }]}>
              {typeof kpi.value === 'number'
                ? kpi.value.toFixed(kpi.unit === 'ppm' ? 0 : 2)
                : kpi.value}{' '}
              <Text style={[styles.tileUnit, { color: colors.secondaryText }]}>
                {kpi.unit}
              </Text>
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  tileWrapper: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  tile: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  tileLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  tileValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  tileUnit: {
    fontSize: 12,
    fontWeight: '400',
  },
});

