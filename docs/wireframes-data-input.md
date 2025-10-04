# Data Input Wireframes

This document presents wireframes for the data input workflow in the NASA Exoplanet Detection application. It covers interfaces for uploading datasets, previewing and validating data, manual entry forms, confirmation screens, and mobile-responsive layouts. The designs focus on usability, data integrity, and seamless integration with downstream analysis and prediction features.

## 1. CSV Upload Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NASA Exoplanet Detection                           │
│ ┌─────┐ ┌─────────-┐  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │Home │ │Data Input│  │ Training │ │ Predict │ │Visualize│ │  Help   │      │
│ └─────┘ └────────-─┘  └──────────┘ └─────────┘ └─────────┘ └─────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                           Data Input Options                            │ │
│ │ ┌─────────────────────┐       ┌─────────────────────┐                   │ │
│ │ │    Upload Dataset   │       │   Manual Entry      │                   │ │
│ │ │      [ACTIVE]       │       │                     │                   │ │
│ │ └─────────────────────┘       └─────────────────────┘                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                           Upload Exoplanet Dataset                      │ │
│ │                                                                         │ │
│ │  📄 Drag and drop your file here or click to browse                     │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │                                                                     │ │ │
│ │ │            ┌───────┐                                                │ │ │
│ │ │            │ 📁    │  Drop CSV, XLSX files here                     │ │ │
│ │ │            │       │  Max size: 100MB                               │ │ │
│ │ │            └───────┘                                                │ │ │
│ │ │                                                                     │ │ │
│ │ │                    [Browse Files]                                   │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │  Supported formats: CSV, XLSX, TSV                                      │ │
│ │  Expected columns: koi_period, koi_duration, koi_depth, koi_prad, ...   │ │
│ │                                                                         │ │
│ │  ┌─────────────────────────────────────────────────────────────────┐    │ │
│ │  │ ✓ Include header row                                            │    │ │
│ │  │ ✓ Auto-detect data types                                        │    │ │
│ │  │ ✓ Validate against NASA KOI schema                              │    │ │
│ │  └─────────────────────────────────────────────────────────────────┘    │ │
│ │                                                                         │ │
│ │                    [Upload & Validate]  [Cancel]                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                           Upload Progress                               │ │
│ │                                                                         │ │
│ │  📄 kepler_data.csv (2.5 MB)                                            │ │
│ │  ████████████████████████████████████████████████ 100%                  │ │
│ │                                                                         │ │
│ │  ✅ File uploaded successfully                                          │ │
│ │  ✅ 5,432 rows detected                                                 │ │
│ │  ✅ Schema validation passed                                            │ │
│ │  ⚠️  Warning: 12 rows contain missing values                            │ │
│ │                                                                         │ │
│ │                    [View Data Preview]  [Continue]                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Data Preview After Upload

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NASA Exoplanet Detection                           │
│ ┌─────┐ ┌─────────-┐  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │Home │ │Data Input│  │ Training │ │ Predict │ │Visualize│ │  Help   │      │
│ └─────┘ └─────────-┘  └──────────┘ └─────────┘ └─────────┘ └─────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                           Data Preview                                  │ │
│ │                                                                         │ │
│ │  📊 Dataset: kepler_data.csv | Rows: 5,432 | Columns: 41                │ │
│ │                                                                         │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │Column Mapping & Validation                                          │ │ │
│ │ │                                                                     │ │ │
│ │ │ koi_period     → Orbital Period      ✅ Valid (1,234 rows)          │ │ │
│ │ │ koi_duration   → Transit Duration    ✅ Valid (1,201 rows)          │ │ │
│ │ │ koi_depth      → Transit Depth       ✅ Valid (1,189 rows)          │ │ │
│ │ │ koi_prad       → Planet Radius       ⚠️  Missing (43 rows)          │ │ │
│ │ │ koi_disposition → Disposition        ✅ Valid (1,234 rows)          │ │ │
│ │ │                                                                     │ │ │
│ │ │ [Show All Columns] [Edit Mapping]                                   │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │Sample Data (First 5 rows)                                           │ │ │
│ │ │                                                                     │ │ │
│ │ │ KOI ID    │ Period  │ Duration │ Depth    │ Radius │ Disposition    │ │ │
│ │ │─────────────────────────────────────────────────────────────────────│ │ │
│ │ │ K00001.01 │ 2.47061 │ 1.3554   │ 615.8    │ 2.247  │ CONFIRMED      │ │ │
│ │ │ K00002.01 │ 2.20473 │ 1.5263   │ 572.1    │ 1.929  │ FALSE POSITIVE │ │ │
│ │ │ K00003.01 │ 1.76358 │ 2.1429   │ 868.8    │ 2.386  │ CANDIDATE      │ │ │
│ │ │ K00004.01 │ 3.95247 │ 0.9821   │ 377.2    │ 1.046  │ CONFIRMED      │ │ │
│ │ │ K00005.01 │ 4.15394 │ 1.8576   │ 732.4    │ -      │ CANDIDATE      │ │ │
│ │ │                                                                     │ │ │
│ │ │ [View Full Dataset] [Download Sample]                               │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │ Data Processing Options:                                                │ │
│ │ ┌─┐ Handle missing values (interpolation/removal)                       │ │
│ │ │✓│ Normalize numerical features                                        │ │
│ │ └─┘ Remove outliers (>3 standard deviations)                            │ │
│ │                                                                         │ │
│ │                [Process & Store]  [Back]  [Use Raw Data]                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Manual Data Entry Form

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NASA Exoplanet Detection                           │
│ ┌─────┐ ┌────────-─┐  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │Home │ │Data Input│  │ Training │ │ Predict │ │Visualize│ │  Help   │      │
│ └─────┘ └──────-───┘  └──────────┘ └─────────┘ └─────────┘ └─────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                           Data Input Options                            │ │
│ │ ┌─────────────────────┐       ┌─────────────────────┐                   │ │
│ │ │    Upload Dataset   │       │   Manual Entry      │                   │ │
│ │ │                     │       │      [ACTIVE]       │                   │ │
│ │ └─────────────────────┘       └─────────────────────┘                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                        Manual Exoplanet Data Entry                      │ │
│ │                                                                         │ │
│ │  Enter the parameters for a single exoplanet observation:               │ │
│ │                                                                         │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │                      Basic Parameters                               │ │ │
│ │ │                                                                     │ │ │
│ │ │  KOI ID (Optional): [K00000.01____________] (e.g., K00123.01)       │ │ │
│ │ │                                                                     │ │ │
│ │ │  ⭐ Stellar Parameters                                              │ │ │
│ │ │  Star Temperature (K): [5778_____] ± [50___] (4000-8000)            │ │ │
│ │ │  Star Radius (R☉):     [1.00_____] ± [0.05_] (0.1-10.0)             │ │ │
│ │ │  Star Mass (M☉):       [1.00_____] ± [0.05_] (0.1-5.0)              │ │ │
│ │ │                                                                     │ │ │
│ │ │  🪐 Planetary Parameters                                            │ │ │
│ │ │  Orbital Period (days):    [365.25__] ± [1.0___] (0.1-1000)         │ │ │
│ │ │  Transit Duration (hours): [6.5_____] ± [0.2___] (0.1-24)           │ │ │
│ │ │  Transit Depth (ppm):      [800_____] ± [50____] (1-50000)          │ │ │
│ │ │  Planet Radius (R⊕):       [1.0_____] ± [0.1___] (0.1-20)           │ │ │
│ │ │                                                                     │ │ │
│ │ │  📊 Additional Metrics                                              │ │ │
│ │ │  Impact Parameter:    [0.5_____] (0.0-1.0)                          │ │ │
│ │ │  Inclination (deg):   [89.5____] (70-90)                            │ │ │
│ │ │  Epoch (BJD):         [2454000_] (Julian Date)                      │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │                      Data Quality Flags                             │ │ │
│ │ │                                                                     │ │ │
│ │ │  Signal-to-Noise Ratio:  [▓▓▓▓▓▓▓▓░░] 8.2                           │ │ │
│ │ │  Data Quality:           ○ Good  ○ Fair  ●● Poor                    │ │ │
│ │ │  Centroid Offset:        [0.1_____] arcsec                          │ │ │
│ │ │                                                                     │ │ │
│ │ │  ☑️ Multiple Event Statistical Test passed                          │ │ │
│ │ │  ☐ Secondary eclipse detected                                       │ │ │
│ │ │  ☐ Transit timing variations observed                               │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │ Purpose: ● Training Data  ○ Prediction Only                             │ │
│ │                                                                         │ │
│ │ If Training Data, Classification:                                       │ │
│ │ ○ Confirmed Planet  ○ Planet Candidate  ○ False Positive                │ │
│ │                                                                         │ │
│ │              [Validate Data]  [Save Entry]  [Clear Form]                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Form Validation & Confirmation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NASA Exoplanet Detection                           │
│ ┌─────┐ ┌───────-──┐  ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│ │Home │ │Data Input│  │ Training │ │ Predict │ │Visualize│ │  Help   │      │
│ └─────┘ └─────-────┘  └──────────┘ └─────────┘ └─────────┘ └─────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                        Data Validation Results                          │ │
│ │                                                                         │ │
│ │  📊 Entry Summary                                                       │ │
│ │                                                                         │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │✅ Validation Status: PASSED                                         │ │ │
│ │ │                                                                     │ │ │
│ │ │ Stellar Parameters:                                                 │ │ │
│ │ │ • Temperature: 5778 ± 50 K        ✅ Within expected range          │ │ │
│ │ │ • Radius: 1.00 ± 0.05 R☉          ✅ Valid                          │ │ │
│ │ │ • Mass: 1.00 ± 0.05 M☉            ✅ Valid                          │ │ │
│ │ │                                                                     │ │ │
│ │ │ Planetary Parameters:                                               │ │ │
│ │ │ • Period: 365.25 ± 1.0 days       ✅ Valid                          │ │ │
│ │ │ • Duration: 6.5 ± 0.2 hours       ✅ Consistent with period         │ │ │
│ │ │ • Depth: 800 ± 50 ppm             ✅ Reasonable                     │ │ │
│ │ │ • Radius: 1.0 ± 0.1 R⊕            ✅ Consistent with depth          │ │ │
│ │ │                                                                     │ │ │
│ │ │ ⚠️  Warnings:                                                       │ │ │
│ │ │ • Low SNR (8.2) - Consider marking data quality as "Fair"           │ │ │
│ │ │                                                                     │ │ │
│ │ │ 🤖 AI Prediction Preview:                                           │ │ │
│ │ │ Based on entered parameters:                                        │ │ │
│ │ │ • Likely Classification: Planet Candidate (73% confidence)          │ │ │
│ │ │ • Similar to known Earth-sized planets in habitable zone            │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │ Next Steps:                                                             │ │
│ │ ┌─┐ Add to training dataset                                             │ │
│ │ │✓│ Run prediction on this entry                                        │ │
│ │ └─┘ Save for future analysis                                            │ │
│ │                                                                         │ │
│ │           [Confirm & Save]  [Edit Entry]  [Add Another]  [Cancel]       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                           Quick Entry Panel                             │ │
│ │                                                                         │ │
│ │  For rapid entry of multiple observations:                              │ │
│ │  [Load Template] [Import from Clipboard] [Bulk Entry Mode]              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5. Mobile-Responsive Version (CSV Upload)

```
┌─────────────────────────────┐
│    NASA Exoplanet AI        │
│ ☰ Menu              🔍 Help │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │      Data Input         │ │
│ │ ┌─────────┐ ┌─────────┐ │ │
│ │ │ Upload  │ │ Manual  │ │ │
│ │ │ [ACTIVE]│ │ Entry   │ │ │
│ │ └─────────┘ └─────────┘ │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │   📄 Upload Dataset     │ │
│ │                         │ │
│ │    ┌───────────────┐    │ │
│ │    │      📁       │    │ │
│ │    │  Tap to       │    │ │
│ │    │  browse       │    │ │
│ │    └───────────────┘    │ │
│ │                         │ │
│ │ Formats: CSV, XLSX      │ │
│ │ Max: 100MB              │ │
│ │                         │ │
│ │ ☑️ Include headers      │ │
│ │ ☑️ Auto-validate        │ │
│ │                         │ │
│ │    [Upload File]        │ │
│ └─────────────────────────┘ │
│                             │
│ Recent Uploads:             │
│ • kepler_data.csv ✅        │
│ • tess_sample.xlsx ✅       │
│                             │
└─────────────────────────────┘
```

## Design Notes

### Key Features Implemented:

1. **CSV Upload Interface:**
   - Drag & drop functionality
   - File format validation
   - Progress indicators
   - Data preview with validation
   - Column mapping assistance
   - Error handling and warnings

2. **Manual Entry Form:**
   - Comprehensive parameter fields
   - Real-time validation
   - Uncertainty/error inputs
   - Data quality indicators
   - AI-powered prediction preview
   - Classification options

3. **User Experience:**
   - Tab-based navigation between input methods
   - Clear visual hierarchy
   - Helpful tooltips and ranges
   - Immediate feedback
   - Mobile-responsive design

4. **Data Validation:**
   - Range checking
   - Consistency validation
   - Physical plausibility checks
   - Warning system for edge cases

5. **Integration Points:**
   - Seamless flow to training/prediction
   - Data quality assessment
   - Export capabilities
   - Batch processing options

