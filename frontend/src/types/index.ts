export interface UploadedFile {
  name: string;
  size: number;
  hash: string;
  file: File;
  validation: {
    time: boolean;
    flux: boolean;
    flux_err: boolean;
  };
}

export interface Parameters {
  model_type: 'multistep'| 'binary_categories' | 'ensemble' ;
  class_weight_penalizing: boolean;
  drop_fpflags: boolean;
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

// Batch prediction result from backend
export interface BatchAnalysisResult {
  decoded_predictions: string[];
  metrics: {
    accuracy: number;
    confusion_matrix: number[][];
    f1: number;
    precision: number;
    recall: number;
  };
  model_info: {
    elapsed_s: number;
    model_path: string;
    model_type: string;
  };
  row_results: RowResult[];
}

export interface RowResult {
  predicted_label: string;
  true_label: string;
  koi_period: number;
  koi_depth: number;
  koi_duration: number;
  koi_prad: number;
  koi_steff: number;
  koi_model_snr: number;
  koi_insol: number;
  koi_teq: number;
  koi_srad: number;
  koi_impact: number;
  ra: number;
  dec: number;
  detectability: number;
  depth_relative_error: number;
  period_relative_error: number;
  [key: string]: any;
}

export const defaultParameters: Parameters = {
  model_type: 'multistep',
  class_weight_penalizing: false,
  drop_fpflags: false,
};

