import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Share as RNShare } from 'react-native';
import { Share } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { AnalysisResult } from '@/types';

interface JSONTabProps {
  result: AnalysisResult;
}

export function JSONTab({ result }: JSONTabProps) {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const colors = {
    background: isDark ? '#242936' : '#FFFFFF',
    codeBackground: isDark ? '#1a1f2e' : '#f5f7fa',
    primaryText: isDark ? '#E6F1FF' : '#0B0C10',
    accent: '#00BFFF',
    border: isDark ? '#363D50' : '#E2E8F0',
  };

  const jsonString = JSON.stringify(result, null, 2);

  const handleShare = async () => {
    try {
      await RNShare.share({
        message: jsonString,
        title: `Exoplanet Analysis - ${Date.now()}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share JSON');
      console.error(error);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={handleShare}
        style={[
          styles.shareButton,
          { 
            borderColor: colors.accent,
            backgroundColor: isDark ? colors.accent + '15' : colors.accent + '10',
          }
        ]}
      >
        <Share size={18} color={colors.accent} />
        <Text style={[styles.shareText, { color: colors.accent }]}>
          Share JSON
        </Text>
      </TouchableOpacity>
      <View style={[styles.codeContainer, { backgroundColor: colors.codeBackground, borderColor: colors.border }]}>
        <Text style={[styles.jsonText, { color: colors.primaryText }]}>
          {jsonString}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 14,
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 16,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '600',
  },
  codeContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 18,
  },
});

