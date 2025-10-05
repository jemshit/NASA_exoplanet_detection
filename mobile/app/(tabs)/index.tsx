import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { Upload, Play, X, FileText, Settings } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';

export default function AnalysisScreen() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'lgbm' | 'cnn'>('lgbm');

  const handleUpload = () => {
    setUploadedFile('kepler_lightcurve_001.csv');
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 3000);
  };

  const colors = {
    background: isDark ? '#0B0C10' : '#F8FAFD',
    surface: isDark ? '#242936' : '#FFFFFF',
    primaryText: isDark ? '#E6F1FF' : '#0B0C10',
    secondaryText: isDark ? '#A9B4C9' : '#3E4755',
    border: isDark ? '#363D50' : '#E2E8F0',
    accent: '#00BFFF',
    disabled: isDark ? '#5B6475' : '#AAB4C4',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Card */}
        <Card title="Upload Lightcurve Data" style={styles.card}>
          {!uploadedFile ? (
            <TouchableOpacity
              onPress={handleUpload}
              style={[
                styles.uploadButton,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }
              ]}
            >
              <Upload size={40} color={colors.accent} />
              <Text style={[styles.uploadTitle, { color: colors.primaryText }]}>
                Tap to upload CSV file
              </Text>
              <Text style={[styles.uploadSubtitle, { color: colors.secondaryText }]}>
                Kepler/TESS lightcurve format
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[
              styles.fileCard,
              { 
                backgroundColor: colors.background,
                borderColor: colors.border,
              }
            ]}>
              <View style={styles.fileContent}>
                <FileText size={24} color={colors.accent} />
                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: colors.primaryText }]}>
                    {uploadedFile}
                  </Text>
                  <Text style={[styles.fileStatus, { color: colors.secondaryText }]}>
                    Ready for analysis
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setUploadedFile(null)}
                style={styles.removeButton}
              >
                <X size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Parameters Card */}
        <Card title="Analysis Parameters" style={styles.card}>
          {/* Model Selection */}
          <Text style={[styles.label, { color: colors.secondaryText }]}>
            Model
          </Text>
          <View style={styles.modelButtons}>
            <TouchableOpacity
              onPress={() => setSelectedModel('lgbm')}
              style={[
                styles.modelButton,
                { 
                  backgroundColor: selectedModel === 'lgbm' ? colors.accent : colors.surface,
                  borderColor: colors.border,
                }
              ]}
            >
              <Text style={[
                styles.modelButtonText,
                { color: selectedModel === 'lgbm' ? '#FFFFFF' : colors.primaryText }
              ]}>
                LightGBM
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedModel('cnn')}
              style={[
                styles.modelButton,
                { 
                  backgroundColor: selectedModel === 'cnn' ? colors.accent : colors.surface,
                  borderColor: colors.border,
                }
              ]}
            >
              <Text style={[
                styles.modelButtonText,
                { color: selectedModel === 'cnn' ? '#FFFFFF' : colors.primaryText }
              ]}>
                CNN
              </Text>
            </TouchableOpacity>
          </View>

          {/* Detrend Method */}
          <Text style={[styles.label, { color: colors.secondaryText, marginTop: 16 }]}>
            Detrend Method
          </Text>
          <View style={[
            styles.input,
            { 
              backgroundColor: colors.background,
              borderColor: colors.border,
            }
          ]}>
            <TextInput
              value="biweight"
              style={[styles.inputText, { color: colors.primaryText }]}
              placeholderTextColor={colors.secondaryText}
            />
          </View>

          {/* TLS Options */}
          <Text style={[styles.label, { color: colors.secondaryText, marginTop: 16 }]}>
            TLS Options
          </Text>
          <View style={[
            styles.tlsOptions,
            { 
              backgroundColor: colors.background,
              borderColor: colors.border,
            }
          ]}>
            <View style={styles.tlsRow}>
              <Text style={[styles.tlsLabel, { color: colors.primaryText }]}>
                Period Min (days)
              </Text>
              <Text style={[styles.tlsValue, { color: colors.primaryText }]}>
                0.5
              </Text>
            </View>
            <View style={[styles.tlsRow, { marginTop: 8 }]}>
              <Text style={[styles.tlsLabel, { color: colors.primaryText }]}>
                Period Max (days)
              </Text>
              <Text style={[styles.tlsValue, { color: colors.primaryText }]}>
                15.0
              </Text>
            </View>
          </View>
        </Card>

        {/* Analysis Button */}
        <Card style={styles.card}>
          <TouchableOpacity
            onPress={handleAnalyze}
            disabled={!uploadedFile || analyzing}
            style={[
              styles.analyzeButton,
              { 
                backgroundColor: !uploadedFile || analyzing ? colors.disabled : colors.accent
              }
            ]}
          >
            {analyzing ? (
              <>
                <Settings size={20} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Play size={20} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>Run Analysis</Text>
              </>
            )}
          </TouchableOpacity>

          {analyzing && (
            <TouchableOpacity
              onPress={() => setAnalyzing(false)}
              style={[
                styles.cancelButton,
                { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }
              ]}
            >
              <Text style={[styles.cancelButtonText, { color: colors.primaryText }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      </ScrollView>
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
  card: {
    marginBottom: 16,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  uploadSubtitle: {
    marginTop: 4,
    fontSize: 14,
  },
  fileCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontWeight: '500',
  },
  fileStatus: {
    fontSize: 14,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  modelButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  modelButtonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
  },
  inputText: {
    padding: 12,
  },
  tlsOptions: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  tlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tlsLabel: {
    fontSize: 14,
  },
  tlsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeButton: {
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontWeight: '500',
  },
});
