# Output Data Structure

This document explains the data structure used in the exoplanet analysis output.

## Data Format

The output follows the `AnalysisResult` interface with the following structure:

```typescript
interface AnalysisResult {
  prediction: {
    label: 'CONFIRMED' | 'CANDIDATE' | 'FALSE_POSITIVE';
    probs: {
      CONFIRMED: number;    // 0-1
      CANDIDATE: number;    // 0-1
      FALSE_POSITIVE: number; // 0-1
    };
  };
  metrics: {
    periodDays: number;        // Orbital period (days)
    depthPpm: number;          // Transit depth (ppm)
    durationHr: number;        // Transit duration (hours)
    snr: number;               // Signal-to-noise ratio
    radiusRe?: number;         // Planet radius (Earth radii)
    oddEvenDelta?: number;     // Odd-even mismatch metric
    secondaryDepthPpm?: number; // Secondary eclipse depth (ppm)
  };
  model: {
    name: string;              // Model identifier (e.g., 'lgbm-koi-v3')
    version: string;           // Model version (e.g., '3.2.1')
    calibration?: string;      // Calibration method (e.g., 'isotonic')
    threshold?: number;        // Decision threshold
  };
  plots?: {
    phaseFolded?: Array<{ x: number[]; y: number[] }>; // Phase-folded light curve
    residuals?: Array<{ x: number[]; y: number[] }>;   // Fit residuals
    timeseries?: Array<{ x: number[]; y: number[] }>;  // Raw time series
  };
  explain?: {
    top_features?: Array<{     // SHAP values (for tabular models)
      name: string;
      value: number;
      shap: number;
    }>;
    saliency?: number[];       // Saliency map (for CNN models)
  };
  qc?: {
    notes?: string[];          // Quality control notes
    warnings?: string[];       // Quality warnings
  };
}
```

## Field Usage in UI

### Summary Tab

**Verdict Card** (Top)
- `prediction.label` → Classification chip (CONFIRMED/CANDIDATE/FALSE_POSITIVE)
- `prediction.probs[label]` → Confidence bar (0-100%)
- `model.name` + `model.version` → Model info text

**KPI Tiles** (6 tiles)
- `metrics.periodDays` → Period (days)
- `metrics.depthPpm` → Depth (ppm)
- `metrics.durationHr` → Duration (hr)
- `metrics.snr` → SNR
- `metrics.radiusRe` → Radius (R⊕) *[if present]*
- `metrics.oddEvenDelta` → Odd/Even Δ *[if present]*

**Class Probabilities** (3 bars)
- `prediction.probs.CONFIRMED` → Green bar
- `prediction.probs.CANDIDATE` → Yellow bar
- `prediction.probs.FALSE_POSITIVE` → Red bar

**Quality Checks** (Badges + Notes)
- `metrics.oddEvenDelta` → ✅ Pass if < 0.05, else ⚠️
- `metrics.secondaryDepthPpm` → ✅ Pass if < 50 ppm, else ⚠️
- `qc.notes` → PDCSAP detrend badge if mentioned
- `qc.warnings` → Warning messages
- `qc.notes` → Informational notes

### Phase-Fold Tab

**Chart Display**
- `plots.phaseFolded` → Main phase-folded light curve (Plotly chart)
- `plots.residuals` → Residuals overlay (optional, toggle with switch)
- `plots.timeseries` → Fallback if no phase-fold data

### Explainability Tab

**For Tabular Models (SHAP)**
- `explain.top_features` → Top 5 features with SHAP values
  - Feature name, value, and SHAP contribution
  - Horizontal bars (green = positive, red = negative)

**For CNN Models (Saliency)**
- `explain.saliency` → Saliency map visualization
  - Area chart showing importance across normalized phase

### JSON Tab

**Raw Data**
- Full `AnalysisResult` object in formatted JSON

## Example Data

### LightGBM Model (Tabular)
Full-featured example with SHAP explainability:
- CONFIRMED planet (92% confidence)
- Complete metrics including radius and odd/even
- Phase-folded curve with residuals
- Top 4 SHAP features

### CNN Model (Phase Curve)
Minimal example with saliency:
- FALSE_POSITIVE (70% confidence)
- Basic metrics (no radius)
- Simple phase-folded curve
- 7-point saliency map

## Data Sources

Mock data is stored in:
```
src/data/mockData.ts
```

Production data should match the same interface structure.

## Quality Thresholds

- **Odd/Even Pass**: `oddEvenDelta < 0.05`
- **Secondary Pass**: `secondaryDepthPpm < 50 ppm`
- **Confidence Display**: Percentage = `probs[label] × 100`

## Optional Fields

Fields marked with `?` are optional:
- `metrics.radiusRe` - May not be available for all detections
- `metrics.oddEvenDelta` - Requires even/odd transit analysis
- `metrics.secondaryDepthPpm` - Requires secondary eclipse search
- `plots.*` - Charts may not always be available
- `explain.*` - Depends on model type (SHAP vs Saliency)
- `qc.*` - Quality control data may be absent

