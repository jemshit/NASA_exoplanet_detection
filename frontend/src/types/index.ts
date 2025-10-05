export interface UploadedFile {
  name: string;
  size: number;
  hash: string;
  validation: {
    time: boolean;
    flux: boolean;
    flux_err: boolean;
  };
}

export interface Parameters {
  detrend: 'none' | 'loess' | 'sg';
  window: number;
  pMin: number;
  pMax: number;
  oversample: number;
  maxDurationHr: number;
  nPhaseBins: number;
  model: 'lgbm' | 'cnn';
}

export interface AnalysisResult {
  prediction: {
    label: 'CONFIRMED' | 'CANDIDATE' | 'FALSE_POSITIVE';
    probs: {
      CONFIRMED: number;
      CANDIDATE: number;
      FALSE_POSITIVE: number;
    };
  };
  metrics: {
    periodDays: number;
    depthPpm: number;
    durationHr: number;
    snr: number;
    radiusRe?: number;
    oddEvenDelta?: number;
    secondaryDepthPpm?: number;
  };
  model: {
    name: string;
    version: string;
    calibration?: string;
    threshold?: number;
  };
  plots?: {
    phaseFolded?: Array<{ x: number[]; y: number[] }>;
    residuals?: Array<{ x: number[]; y: number[] }>;
    timeseries?: Array<{ x: number[]; y: number[] }>;
  };
  explain?: {
    top_features?: Array<{ name: string; value: number; shap: number }>;
    saliency?: number[];
  };
  qc?: {
    notes?: string[];
    warnings?: string[];
  };
  rawJson?: any;
}

export const defaultParameters: Parameters = {
  detrend: 'loess',
  window: 0.5,
  pMin: 0.2,
  pMax: 30,
  oversample: 5,
  maxDurationHr: 10,
  nPhaseBins: 200,
  model: 'lgbm',
};

