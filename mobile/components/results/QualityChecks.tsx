import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { AnalysisResult } from '@/types';

interface QualityChecksProps {
  metrics: AnalysisResult['metrics'];
  qc?: AnalysisResult['qc'];
}

export function QualityChecks({ metrics, qc }: QualityChecksProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const colors = {
    primaryText: isDark ? '#E6F1FF' : '#0B0C10',
    secondaryText: isDark ? '#A9B4C9' : '#3E4755',
    border: isDark ? '#363D50' : '#E2E8F0',
  };

  const checks = [
    {
      label: 'Transit Shape',
      passed: metrics.snr > 7.1,
      icon: metrics.snr > 7.1 ? CheckCircle : XCircle,
      color: metrics.snr > 7.1 ? '#10b981' : '#ef4444',
    },
    {
      label: 'Secondary Eclipse',
      passed: !metrics.secondaryDepthPpm || metrics.secondaryDepthPpm < 100,
      icon: !metrics.secondaryDepthPpm || metrics.secondaryDepthPpm < 100 ? CheckCircle : AlertCircle,
      color: !metrics.secondaryDepthPpm || metrics.secondaryDepthPpm < 100 ? '#10b981' : '#f59e0b',
    },
    {
      label: 'Odd-Even Consistency',
      passed: !metrics.oddEvenDelta || metrics.oddEvenDelta < 0.1,
      icon: !metrics.oddEvenDelta || metrics.oddEvenDelta < 0.1 ? CheckCircle : XCircle,
      color: !metrics.oddEvenDelta || metrics.oddEvenDelta < 0.1 ? '#10b981' : '#ef4444',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.primaryText }]}>
        Quality Checks
      </Text>

      {checks.map((check, index) => (
        <View
          key={index}
          style={[
            styles.checkRow,
            index < checks.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.checkLabel, { color: colors.primaryText }]}>
            {check.label}
          </Text>
          <check.icon size={20} color={check.color} />
        </View>
      ))}

      {/* Notes & Warnings */}
      {qc?.notes && qc.notes.length > 0 && (
        <View style={styles.notesContainer}>
          {qc.notes.map((note, index) => (
            <View key={index} style={styles.noteRow}>
              <Info size={14} color={colors.secondaryText} />
              <Text style={[styles.noteText, { color: colors.secondaryText }]}>
                {note}
              </Text>
            </View>
          ))}
        </View>
      )}

      {qc?.warnings && qc.warnings.length > 0 && (
        <View style={styles.warningsContainer}>
          {qc.warnings.map((warning, index) => (
            <View key={index} style={styles.warningRow}>
              <AlertCircle size={14} color="#f59e0b" />
              <Text style={[styles.warningText, { color: '#f59e0b' }]}>
                {warning}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  checkLabel: {
    fontSize: 14,
  },
  notesContainer: {
    gap: 8,
    marginTop: 8,
  },
  noteRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  noteText: {
    fontSize: 11,
    flex: 1,
  },
  warningsContainer: {
    gap: 8,
    marginTop: 8,
  },
  warningRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 11,
    flex: 1,
  },
});

