import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { AnalysisResult } from '@/types';
import { VerdictCard } from './VerdictCard';
import { KPITiles } from './KPITiles';
import { ClassProbabilityBars } from './ClassProbabilityBars';
import { QualityChecks } from './QualityChecks';

interface SummaryTabProps {
  result: AnalysisResult;
}

export function SummaryTab({ result }: SummaryTabProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const { prediction, metrics, model, qc } = result;

  const colors = {
    background: isDark ? '#242936' : '#FFFFFF',
    border: isDark ? '#363D50' : '#E2E8F0',
  };

  return (
    <ScrollView 
      style={[styles.scrollView, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Verdict and Metrics */}
      <VerdictCard prediction={prediction} model={model} />
      <KPITiles metrics={metrics} />

      {/* Divider */}
      <View style={[styles.divider, { borderBottomColor: colors.border }]} />

      {/* Probabilities and Quality Checks */}
      <ClassProbabilityBars probs={prediction.probs} />
      <QualityChecks metrics={metrics} qc={qc} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 32,
    gap: 24,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
});

