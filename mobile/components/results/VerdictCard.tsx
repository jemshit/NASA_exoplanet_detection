import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { AnalysisResult } from '@/types';

interface VerdictCardProps {
  prediction: AnalysisResult['prediction'];
  model: AnalysisResult['model'];
}

export function VerdictCard({ prediction, model }: VerdictCardProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const maxProb = prediction.probs[prediction.label];

  const colors = {
    background: isDark ? '#0B0C10' : '#F8FAFD',
    primaryText: isDark ? '#E6F1FF' : '#0B0C10',
    secondaryText: isDark ? '#A9B4C9' : '#3E4755',
    border: isDark ? '#363D50' : '#E2E8F0',
    accent: '#00BFFF',
  };

  const getVerdictColor = () => {
    if (prediction.label === 'CONFIRMED') return '#10b981';
    if (prediction.label === 'CANDIDATE') return '#f59e0b';
    return '#ef4444';
  };

  const getVerdictIcon = () => {
    if (prediction.label === 'CONFIRMED') return CheckCircle;
    if (prediction.label === 'CANDIDATE') return AlertTriangle;
    return XCircle;
  };

  const VerdictIcon = getVerdictIcon();
  const verdictColor = getVerdictColor();

  return (
    <View style={styles.container}>
      {/* Verdict Badge */}
      <View style={styles.verdictRow}>
        <Text style={[styles.label, { color: colors.secondaryText }]}>Prediction:</Text>
        <View style={[styles.badge, { backgroundColor: verdictColor + '20' }]}>
          <VerdictIcon size={16} color={verdictColor} />
          <Text style={[styles.badgeText, { color: verdictColor }]}>
            {prediction.label}
          </Text>
        </View>
      </View>

      {/* Confidence Bar */}
      <View style={styles.confidenceContainer}>
        <View style={styles.confidenceHeader}>
          <Text style={[styles.confidenceLabel, { color: colors.secondaryText }]}>
            Confidence
          </Text>
          <Text style={[styles.confidenceValue, { color: colors.secondaryText }]}>
            {(maxProb * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${maxProb * 100}%`,
                backgroundColor: colors.accent,
              },
            ]}
          />
        </View>
      </View>

      {/* Model Info */}
      <Text style={[styles.modelInfo, { color: colors.secondaryText }]}>
        Model: {model.name} v{model.version}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confidenceContainer: {
    gap: 4,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confidenceLabel: {
    fontSize: 12,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  modelInfo: {
    fontSize: 11,
  },
});

