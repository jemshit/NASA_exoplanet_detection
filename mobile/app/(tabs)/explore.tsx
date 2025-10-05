import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { BarChart3, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { SummaryTab, JSONTab } from '@/components/results';
import { mockLightGBM, mockCNN } from '@/data/mockData';
import type { AnalysisResult } from '@/types';

const Tab = createMaterialTopTabNavigator();

export default function ResultsScreen() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  
  // Demo mode similar to frontend
  const [demoMode, setDemoMode] = useState(true);
  const [currentExample, setCurrentExample] = useState<'lgbm' | 'cnn'>('lgbm');
  const [result, setResult] = useState<AnalysisResult | null>(mockLightGBM);

  const colors = {
    background: isDark ? '#0B0C10' : '#F8FAFD',
    surface: isDark ? '#242936' : '#FFFFFF',
    primaryText: isDark ? '#E6F1FF' : '#0B0C10',
    secondaryText: isDark ? '#A9B4C9' : '#3E4755',
    border: isDark ? '#363D50' : '#E2E8F0',
    accent: '#00BFFF',
    disabled: isDark ? '#5B6475' : '#AAB4C4',
  };

  const handleToggleDemo = () => {
    const newDemoMode = !demoMode;
    setDemoMode(newDemoMode);
    if (newDemoMode) {
      setResult(currentExample === 'lgbm' ? mockLightGBM : mockCNN);
    } else {
      setResult(null);
    }
  };

  const handleExampleChange = () => {
    const newExample = currentExample === 'lgbm' ? 'cnn' : 'lgbm';
    setCurrentExample(newExample);
    setResult(newExample === 'lgbm' ? mockLightGBM : mockCNN);
  };

  const handleReset = () => {
    setDemoMode(false);
    setResult(null);
  };

  if (!result) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader />
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Card>
            <View style={styles.headerRow}>
              <Text style={[styles.headerTitle, { color: colors.primaryText }]}>
                Output
              </Text>
              <TouchableOpacity
                onPress={handleToggleDemo}
                style={[
                  styles.demoButton,
                  { 
                    backgroundColor: demoMode ? colors.accent : colors.surface,
                    borderColor: colors.border,
                  }
                ]}
              >
                <Text style={[
                  styles.demoButtonText,
                  { color: demoMode ? '#FFFFFF' : colors.primaryText }
                ]}>
                  {demoMode ? 'Hide' : 'Show'} Demo
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.emptyState}>
              <BarChart3 size={64} color={colors.disabled} />
              <Text style={[styles.emptyTitle, { color: colors.secondaryText }]}>
                No Analysis Results Yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
                Upload a file and run analysis to see results here
              </Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />
      
      <View style={styles.contentContainer}>
        {/* Header Card */}
        <View style={[
          styles.headerCard,
          { 
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }
        ]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={[styles.headerTitle, { color: colors.primaryText }]}>
                Output
              </Text>
              {demoMode && (
                <View style={[styles.demoBadge, { backgroundColor: '#10b981' + '20' }]}>
                  <Text style={[styles.demoBadgeText, { color: '#10b981' }]}>
                    Demo
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.headerActions}>
              {demoMode && (
                <TouchableOpacity
                  onPress={handleExampleChange}
                  style={[
                    styles.exampleButton,
                    { 
                      backgroundColor: isDark ? colors.accent + '30' : colors.accent + '20',
                      borderColor: colors.accent + '40',
                      borderWidth: 1,
                    }
                  ]}
                >
                  <Text style={[styles.exampleButtonText, { color: colors.accent }]}>
                    {currentExample.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleReset}
                style={[
                  styles.actionButton,
                  { 
                    borderColor: colors.accent,
                    backgroundColor: isDark ? colors.accent + '15' : 'transparent',
                  }
                ]}
              >
                <RefreshCw size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tabs Container */}
        <View style={[styles.tabsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: colors.accent,
              tabBarInactiveTintColor: colors.secondaryText,
              tabBarStyle: {
                backgroundColor: colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                elevation: 0,
                shadowOpacity: 0,
              },
              tabBarIndicatorStyle: {
                backgroundColor: colors.accent,
                height: 3,
              },
              tabBarLabelStyle: {
                fontSize: 13,
                fontWeight: '600',
                textTransform: 'none',
              },
              lazy: true,
            }}
          >
            <Tab.Screen name="Summary">
              {() => <SummaryTab result={result} />}
            </Tab.Screen>
            <Tab.Screen name="JSON">
              {() => <JSONTab result={result} />}
            </Tab.Screen>
          </Tab.Navigator>
        </View>

        {/* Demo Toggle Footer */}
        <TouchableOpacity
          onPress={handleToggleDemo}
          style={[
            styles.demoToggle,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: isDark ? '#000' : '#000',
            }
          ]}
        >
          <Text style={[styles.demoToggleText, { color: colors.primaryText }]}>
            {demoMode ? '🚫 Disable Demo Mode' : '✨ Enable Demo Mode'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  demoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  demoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  demoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  demoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  exampleButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exampleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
    fontSize: 14,
    lineHeight: 20,
  },
  tabsCard: {
    flex: 1,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  demoToggle: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoToggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
