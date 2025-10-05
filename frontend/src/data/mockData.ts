import type { AnalysisResult } from '../types';

// Tabular model (LightGBM) — full example
export const mockLightGBM: AnalysisResult = {
  prediction: {
    label: 'CONFIRMED',
    probs: { CONFIRMED: 0.92, CANDIDATE: 0.04, FALSE_POSITIVE: 0.04 },
  },
  metrics: {
    periodDays: 3.141,
    depthPpm: 820,
    durationHr: 2.4,
    snr: 12.7,
    radiusRe: 2.1,
    oddEvenDelta: 0.03,
    secondaryDepthPpm: 25,
  },
  model: {
    name: 'lgbm-koi-v3',
    version: '3.2.1',
    calibration: 'isotonic',
    threshold: 0.65,
  },
  plots: {
    phaseFolded: [
      {
        x: [-0.05, -0.04, -0.03, -0.02, -0.01, 0.0, 0.01, 0.02, 0.03],
        y: [1.001, 1.0, 0.998, 0.995, 0.992, 0.99, 0.992, 0.995, 0.998],
      },
    ],
    residuals: [
      {
        x: [-0.05, -0.04, -0.03, -0.02, -0.01, 0.0, 0.01, 0.02, 0.03],
        y: [0.001, 0.0, -0.002, -0.004, -0.006, -0.007, -0.006, -0.004, -0.001],
      },
    ],
  },
  explain: {
    top_features: [
      { name: 'depth_ppm', value: 820, shap: 0.41 },
      { name: 'duration_hr', value: 2.4, shap: 0.27 },
      { name: 'snr', value: 12.7, shap: 0.19 },
      { name: 'odd_even_delta', value: 0.03, shap: -0.06 },
    ],
  },
  qc: {
    notes: ['PDCSAP detrend used; TLS peak @ 3.141 d (SDE 11.4)'],
    warnings: [],
  },
  rawJson: { source: 'mock' },
};

// CNN model (phased curve) — minimal example
export const mockCNN: AnalysisResult = {
  prediction: {
    label: 'FALSE_POSITIVE',
    probs: { CONFIRMED: 0.12, CANDIDATE: 0.18, FALSE_POSITIVE: 0.7 },
  },
  metrics: {
    periodDays: 1.0023,
    depthPpm: 410,
    durationHr: 5.1,
    snr: 8.4,
    oddEvenDelta: 0.12,
    secondaryDepthPpm: 140,
  },
  model: {
    name: 'cnn-phase-small',
    version: '1.0.0',
  },
  plots: {
    phaseFolded: [
      {
        x: [-0.05, -0.025, 0, 0.025, 0.05],
        y: [1.002, 0.999, 0.994, 0.998, 1.001],
      },
    ],
  },
  explain: {
    saliency: [0.02, 0.05, 0.4, 0.3, 0.1, 0.08, 0.05],
  },
  qc: {
    notes: ['Possible secondary at phase ~0.5'],
    warnings: ['High odd-even mismatch'],
  },
  rawJson: { source: 'mock' },
};

// Batch summary (optional)
export const mockBatchSummary = {
  count: 18,
  class_counts: { CONFIRMED: 11, CANDIDATE: 1, FALSE_POSITIVE: 6 },
  avg_confidence: 0.78,
};

