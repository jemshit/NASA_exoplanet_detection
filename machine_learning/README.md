# Machine Learning

## Setup
Check [Setup Documentation](SETUP.md)

---

## Results & Performance
* Trained on Kepler KOI dataset: 9564 valid samples
* 67 Features: 36 existing + 31 new features
* **Binary Model**: 
  * Default: 95.3% Accuracy , 92.1% Recall, 92.7% Precision
  * Planet Detection (CONFIRMED + CANDIDATE): 96.7% Recall, 96.4% Precision
* **Multistep Model (MLP + XGBoost)**: 
  * Default: 88% Accuracy, 88% Recall, 87.5% Precision
  * Without dropping `koi_fpflag_` columns: 91.2% Accuracy, 91.2% Recall, 91.1% Precision
* **Ensemble Model**:
  * XGBoost default: 78% Accuracy, 78% Recall, 78.2% Precision, 91.9% Train Accuracy
  * LightGBM default: 77.7% Accuracy, 77.7% Recall, 78% Precision, 92.9% Train Accuracy
  * CatBoost default: 73.6% Accuracy, 73.6% Recall, 77.6% Precision, 87.4% Train Accuracy
  * RandomForest default: 77.4% Accuracy, 77.4% Recall, 77% Precision, 92.7% Train Accuracy
* **Stacked Ensemble Model**:
  * Default: 78.6% Accuracy, 79% Recall, 77% Precision

---    

## ✨ Highlights

- **Full pipeline**: load → clean → engineer features → grouped CV → train ensembles → evaluate → threshold tuning → interpretability.
- **Group-aware validation** by `kepid` to prevent leakage across KOIs from the same star.
- **Astrophysical features**: ratios, geometry, SNR proxies, uncertainty-aware measures.
- **Strong tabular learners**: XGBoost, LightGBM, CatBoost, RandomForest.
- **Advanced training modes**: 
  - **Stacking Ensemble** — blend your base learners with a Logistic Regression meta-learner
  - **Multi-Step (Hierarchical) Pipeline** — high-recall planet filter (MLP) → high-precision planet type (XGBoost)
  - **Binary Planet Model** — simplified CONFIRMED vs FALSE POSITIVE experiment
- **Planet-centric metrics** and **per-class threshold optimization** to increase planet recall under constraints.
- **Reproducible**: saved feature list (`features.json`) and model artifacts; fixed random seeds.

---

## 🧪 Motivation, Challenges & Our Contributions

### Where existing approaches fall short

Prior work (e.g., *“Exoplanet Detection Using Machine Learning”* by Abhishek Malik; *“Assessment of Ensemble-Based Machine Learning Algorithms for Exoplanet Identification”* by Thiago Luz) demonstrates that classical ML can classify KOIs effectively. However, in practice we still see several recurring pitfalls:

* **Label leakage → inflated accuracies**
  Inclusion of post-hoc or human-informed fields (e.g., `kepler_name`, `koi_pdisposition`, `koi_score`, and KOI false-positive flags) leaks disposition information into training, producing unrealistically high metrics that won’t hold in deployment.

* **Split strategies that don’t respect astrophysical grouping**
  Random/stratified CV that ignores `kepid` allows KOIs from the same star to appear in both train and validation, letting models memorize star-specific quirks.

* **Single-stage argmax decisions**
  Using plain `argmax` on multiclass probabilities under-controls discovery/false-alarm trade-offs—especially harmful when **planet recall** is the scientific priority.

* **Limited feature engineering**
  Raw KOI columns miss physically motivated relationships (geometry, SNR normalization, uncertainty ratios) that help separate real transits from systematics.

* **Class imbalance not explicitly handled**
  Without class weighting, minority classes (planets) can be under-served by decision rules and selection metrics.

* **Reproducibility gaps**
  Absent or inconsistent feature lists, seed handling, and fold definitions make results hard to replicate or compare fairly.

---

### What this work offers

We address the above issues with a pipeline designed for **validity, control, and interpretability**:

* **Strict data hygiene (anti-leakage)**
  We **drop** `kepler_name`, `koi_pdisposition`, `koi_score` and—by default—false-positive flags (`koi_fpflag_nt`, `koi_fpflag_ss`, `koi_fpflag_co`, `koi_fpflag_ec`).
  *Why it matters:* prevents inflated metrics and forces the model to learn from signal, not labels.

* **Group-aware stratified K-Fold by `kepid`**
  We use **StratifiedGroupKFold** so all KOIs from a star stay in the same fold.
  *Why it matters:* avoids star-specific leakage; more realistic generalization to unseen systems.

* **N-fold CV with out-of-fold (OOF) predictions**
  Uniform evaluation across models; OOF predictions feed fair threshold tuning and calibration.
  *Why it matters:* robust selection and apples-to-apples comparisons.

* **Physically motivated feature engineering**
  Ratios, interactions, geometry, uncertainty-aware and SNR-normalized features (see “Feature Engineering” section).
  *Why it matters:* encodes transit physics and measurement quality beyond raw columns.

* **Class-weight penalizing**
  Optional class weights for learners that support it.
  *Why it matters:* counters imbalance so planets aren’t under-served.

* **Decision threshold optimization (class-specific)**
  We grid-search per-class thresholds to **maximize CANDIDATE recall** while **constraining CONFIRMED recall** (e.g., ≥ 0.8).
  *Why it matters:* explicit control of discovery vs. false-alarm trade-offs instead of fixed argmax.

* **New multi-step model (MLP → XGBoost)**
  Stage-1 MLP screens **PLANET vs FP** for **high recall**; Stage-2 XGBoost separates **CANDIDATE vs CONFIRMED** for **higher precision**.
  *Why it matters:* mirrors real search funnels: catch more planets first, then refine.

* **Alternative trainers for analysis**

  * **Stacking ensemble** over XGBoost/LightGBM/CatBoost/RF with a logistic meta-learner.
  * **Binary CONFIRMED vs FP** model to test upper-bound separability without the CANDIDATE class.
    *Why it matters:* stress-tests modeling assumptions and provides complementary operating points.

* **Planet-centric evaluation**
  In addition to accuracy, we report macro precision/recall/F1 and planet-vs-FP metrics.
  *Why it matters:* aligns metrics with the scientific objective (don’t miss real planets).

* **Reproducibility by design**
  Fixed seeds, persisted `features.json`, saved CV splits/labels, model artifacts, and clear configuration in `app.py`.
  *Why it matters:* transparent, repeatable results suitable for comparison and review.

---

### Problem → Our remedy → Why it matters

| Problem                                                                                          | Our Remedy                                                      | Why it Matters                                                       |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Inflated accuracy via leakage columns (`kepler_name`, `koi_pdisposition`, `koi_score`, FP flags) | Drop these columns by default; treat FP flags cautiously        | Prevents training on label hints; yields honest, deployable metrics  |
| Same star in train & val                                                                         | **StratifiedGroupKFold** by `kepid`                             | Eliminates star-specific memorization; realistic generalization      |
| One-shot argmax thresholds                                                                       | **Per-class threshold optimization** with recall constraints    | Tunes discovery vs. false-alarm balance for mission goals            |
| Raw-only features                                                                                | **Astrophysical features** (ratios, geometry, uncertainty, SNR) | Encodes domain knowledge; improves separability and interpretability |
| Class imbalance                                                                                  | **Class-weight penalizing**                                     | Reduces bias against minority (planet) classes                       |
| Single-stage modeling                                                                            | **Multi-step MLP→XGBoost**; **stacking** option                 | Captures different error modes; boosts recall first, then precision  |
| Opaque evaluation                                                                                | **OOF-based CV**, planet-centric metrics, saved artifacts       | Fair comparisons, threshold tuning, full reproducibility             |

---

### Evaluation protocol (at a glance)

* **N-fold CV** (default `n_splits=5`) with **StratifiedGroupKFold(kepid)**
* **Model zoo:** XGBoost / LightGBM / CatBoost / RandomForest (+ optional stacking, multi-step, binary)
* **Selection metric:** mean CV accuracy by default (recommend macro-F1 or planet recall if discovery is prioritized)
* **Reporting:** macro precision/recall/F1, ROC-AUC, log-loss, **planet-vs-FP** metrics
* **Thresholds:** per-class optimization subject to **CONFIRMED recall** constraint

---


Great call. Here’s a **drop-in replacement** for your README’s **Pipeline** section that includes all the new training options (stacking, multi-step, binary) and keeps everything GitHub-friendly.

---

## 🔄 Pipeline

```
CSV (kepler_koi.csv)
      │
      ▼
load_koi_dataset
      │
      ▼
clean_koi_dataset
  - drop leakage columns (kepler_name, koi_pdisposition, koi_score, fpflags*)
  - robust imputation for numeric, safe handling for categoricals
      │
      ▼
create_advanced_features
  - engineered columns (ratios, geometry, SNR, uncertainty, timescales)
      │
      ▼
prepare_data_for_training
  - LabelEncode y
  - StratifiedGroupKFold by kepid (prevents star-level leakage)
  - save features.json
      │
      ▼
┌───────────────────────────── Choose one training path ──────────────────────────────┐
│                                                                                     │
│  A) Default Ensemble                                                                │
│     train_ensemble_models (XGB / LGBM / CatBoost / RF, grouped CV)                  │
│                                                                                     │
│  B) Stacking Ensemble                                                               │
│     train_stacking_ensemble (base models → LogisticRegression meta-learner, CV)     │
│                                                                                     │
│  C) Multi-Step (Hierarchical)                                                       │
│     train_multistep_nn_xgb                                                          │
│       • Stage 1: PLANET vs FP  →  MLP (high recall gate; StandardScaler + MLP)      │
│       • Stage 2: CONFIRMED vs CANDIDATE  →  XGBoost (higher precision)              │
│                                                                                     │
│  D) Binary Planet Model                                                             │
│     train_binary_planet_model (XGBoost; CONFIRMED vs FALSE POSITIVE only)           │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
      │
      ▼
Evaluation & Reporting
  - evaluate_the_best_model (OOF metrics; macro Precision/Recall/F1; planet-vs-FP view)
  - analyze_feature_importance (tree models)
  - optimize_class_thresholds (optional)
        • Multi-class paths (A/B): per-class thresholds tuned for planet discovery
        • Binary path (D): optional decision-threshold sweep (recommended)
```

---

## 🧹 Preprocessing

**Why these steps?** Avoid leakage, standardize inputs, and ensure robust learning.

- Drop identifiers: `rowid`, `kepid`, `kepoi_name` (not predictive, risk of leakage in CV when used as features).
- Drop post-hoc / leaky fields: `kepler_name`, `koi_pdisposition`, `koi_score`.
- Handle false-positive flags:
  - Defaults to **drop** (`koi_fpflag_nt`, `koi_fpflag_ss`, `koi_fpflag_co`, `koi_fpflag_ec`) because they strongly leak the label.
- Missing values:
  - Numeric: **median imputation** (robust to outliers and skew).
  - Categorical: drop or safe fill as defined in code.
  
Function: `clean_koi_dataset(df, drop_fpflags=True)`

---

## 🧠 Feature Engineering (Astrophysical)

**Goal:** encode physically meaningful relationships and measurement quality so models can better separate real planetary transits from false positives.

### Notation & assumptions

* `P` = `koi_period` (days)
* `Rp` = `koi_prad` (planet radius, Earth radii)
* `Rstar` = `koi_srad` (stellar radius, Solar radii)
* `Depth` = `koi_depth` (fractional drop; if ppm in source, convert to fraction first)
* `Dur` = `koi_duration` (hours)
* `b` = `koi_impact` (impact parameter)
* `SNR` = `koi_model_snr` (model signal-to-noise)
* `N` = `koi_tce_plnt_num` (planet index in system)
* `Teff` = `koi_steff` (stellar effective temperature, K)
* `Teq` = `koi_teq` (equilibrium temperature, K; if available)
* `eps` = tiny constant (e.g., `1e-9`) to avoid divide-by-zero
* Features are created **only if the required source columns exist**.

### Features, formulas, and intuition

| Feature                     | Formula (pseudo-code)                                                                                                       | What it captures / Why it helps                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `period_radius_ratio`       | `log1p(P) / log1p(Rp)`                                                                                                      | Compares orbital timescale to planet size on a stable (log) scale; separates compact/fast from large/slow systems.                  |
| `period_prad_product`       | `P * Rp`                                                                                                                    | Simple interaction; different regimes (large–long vs small–short) behave differently with noise/systematics.                        |
| `depth_duration_ratio`      | `Depth / Dur`                                                                                                               | “Steepness” of the transit per hour; deeper, shorter events tend to be cleaner/planet-like.                                         |
| `prad_srad_ratio`           | `Rp / Rstar`                                                                                                                | Relative size of planet to host star; directly tied to geometric transit depth.                                                     |
| `prad_srad_ratio_squared`   | `(Rp / Rstar) ** 2`                                                                                                         | Approximate theoretical transit depth (no limb darkening); strong physical predictor.                                               |
| `detectability`             | `SNR * Depth`                                                                                                               | Composite prominence of the dip: bigger/cleaner transits (high SNR, deep) rank higher.                                              |
| `snr_per_depth`             | `SNR / (Depth + eps)`                                                                                                       | Noise-normalized clarity; penalizes shallow dips even if SNR is modest.                                                             |
| `log_period`                | `log1p(P)`                                                                                                                  | Stabilizes heavy-tailed periods for tree splits.                                                                                    |
| `sqrt_period`               | `sqrt(P)`                                                                                                                   | Alternative scaling; models can pick the useful view.                                                                               |
| `period_sq`                 | `P ** 2`                                                                                                                    | Expands long-period regimes; captures curvature.                                                                                    |
| `log_prad`                  | `log1p(Rp)`                                                                                                                 | Stabilizes planet radius scale.                                                                                                     |
| `sqrt_prad`                 | `sqrt(Rp)`                                                                                                                  | Alternative radius scaling.                                                                                                         |
| `prad_sq`                   | `Rp ** 2`                                                                                                                   | Emphasizes large planets.                                                                                                           |
| `log_depth`                 | `log1p(Depth)`                                                                                                              | Stabilizes tiny depths; preserves ordering.                                                                                         |
| `sqrt_depth`                | `sqrt(Depth)`                                                                                                               | Alternative depth scaling.                                                                                                          |
| `depth_sq`                  | `Depth ** 2`                                                                                                                | Emphasizes very deep events.                                                                                                        |
| `impact_centrality`         | `1 - abs(b)`                                                                                                                | Centrality of transit (1 = central); central transits are longer/deeper and more planet-like.                                       |
| `is_grazing_transit`        | `1 if b > 0.7 else 0`                                                                                                       | Flags grazing/near-limb events; more error-prone and FP-like.                                                                       |
| `stellar_class`             | `bucket(Teff)` (e.g., F/G/K/M bins)                                                                                         | Encodes host type; host properties modulate expected depth/duration and variability.                                                |
| `temp_ratio`                | `Teq / Teff` (if both exist)                                                                                                | How “hot” the planet is relative to star surface; sanity check for plausible insolation.                                            |
| `estimated_distance`        | heuristic from photometric/stellar params                                                                                   | Coarse distance proxy; distant targets can be noisier → helps identify borderline events.                                           |
| `insolation_distance_check` | `observed_insolation / (expected_insolation + eps)`; where `expected_insolation ∝ (Teff/5777)^4 * (Rstar/1)^2 / (a/1 AU)^2` | Consistency between observed insolation and what stellar size/temperature and separation imply; mismatches hint at systematics/FPs. |
| `is_multiplanet`            | `1 if N > 1 else 0`                                                                                                         | Multi-planet systems are statistically more likely to be real planets.                                                              |
| `planet_position_log`       | `log1p(N)`                                                                                                                  | Smoothed index of the planet within its system; weak regularizer for multiplicity effects.                                          |
| `period_relative_error`     | `(abs(period_err1) + abs(period_err2)) / (abs(P) + eps)`                                                                    | Relative precision of the measured period; large = less trustable signals.                                                          |
| `depth_relative_error`      | `(abs(depth_err1) + abs(depth_err2)) / (Depth + eps)`                                                                       | Relative precision of the transit depth; penalizes shaky/shallow dips.                                                              |
| `duration_fraction`         | `Dur / (P * 24)`                                                                                                            | Transit duration as a fraction of orbital period; central planet-like transits sit in a predictable range.                          |
| `is_long_transit`           | `1 if duration_fraction > 0.15 else 0`                                                                                      | Flags unusually long events for their `P`; often stellar/systematic in origin.                                                      |
| `transit_duration_ratio`    | `Dur / (P ** (1/3) + eps)`                                                                                                  | Roughly normalizes duration by the `P^(1/3)` scaling from Kepler’s law; highlights geometry-consistent vs anomalous durations.      |
| `log_snr`                   | `log1p(SNR)`                                                                                                                | Stabilized SNR; reduces dominance of extreme SNRs while keeping ordering.                                                           |


**Function:** `create_advanced_features(df)`

---


## 🔀 Data Splitting & Grouped CV

**Why grouped stratification?** Multiple KOIs share the same `kepid` (star). If the same star is in both train and validation, models can overfit star-specific quirks → **inflated metrics**.  
**Solution:** `StratifiedGroupKFold` with `groups=kepid`, preserving class balance **and** keeping each star entirely in one fold.

Function: `prepare_data_for_training(df_engineered, df_original, target_column, n_splits, save_columns_path)`

---

## 🤖 Ensemble Models & Rationale

Four complementary ensembles are trained and cross-validated with identical grouped folds:

- **XGBoost** (`XGBClassifier`) — state-of-the-art on tabular data; robust to non-linearities and interactions.  
  **Typical params:**  
  `n_estimators=500`, `learning_rate=0.03`, `max_depth=5`, `min_child_weight=3`, `gamma=0.1`,  
  `subsample=0.7`, `colsample_bytree=0.7`, `reg_alpha=0.3`, `reg_lambda=1.5`, `random_state=42`.

- **LightGBM** (`LGBMClassifier`) — fast, leaf-wise growth; good with larger feature sets.  
  **Typical params:**  
  `n_estimators=500`, `learning_rate=0.03`, `max_depth=5`, `subsample=0.7`, `colsample_bytree=0.7`,  
  `reg_alpha=1.0`, `reg_lambda=2.5`, `min_child_samples=20`, `random_state=42`.

- **CatBoost** (`CatBoostClassifier`) — strong regularization and categorical handling; different bias profile.  
  **Typical params:**  
  `iterations=700`, `depth=7`, `learning_rate=0.05`, `l2_leaf_reg=3`, `random_state=42`.

- **RandomForest** (`RandomForestClassifier`) — stable baseline and interpretability.  
  **Typical params:**  
  `n_estimators=700`, `max_depth=14`, `min_samples_split=7`, `min_samples_leaf=3`, `max_features="sqrt"`, `random_state=42`.

> **Why tree ensembles?** Minimal preprocessing, strong on mixed-scale tabular data, capture interactions among physical variables, and provide importances for domain insight.

Function: `train_ensemble_models(...)`  

---

## 🔧 Advanced Training Modes

This repo also includes three more training strategies you can run independently or alongside the default `train_ensemble_models` flow:

1. **Stacking Ensemble** — blend your base learners with a Logistic Regression meta-learner
2. **Multi-Step (Hierarchical) Pipeline** — high-recall planet filter (MLP) → high-precision planet type (XGBoost)
3. **Binary Planet Model** — simplified **CONFIRMED** vs **FALSE POSITIVE** experiment

These modes save artifacts in the same “package” style (trained models, OOF preds, label encoder, metrics).

---

### 1) Stacking Ensemble

**File:** `training_stacking_ensemble.py`
**Function:** `train_stacking_ensemble(X_scaled, y_encoded, groups, cv, le_target, cv_results, best_model_name, models, save_path)`

**What it does**
Builds a `StackingClassifier` with your four base models (**XGBoost, LightGBM, CatBoost, RandomForest**) as level-0 estimators and a **LogisticRegression** meta-learner on top. Performs **group-aware** CV (via your `StratifiedGroupKFold`) to compute OOF predictions and weighted-average metrics, compares against the best single model, then fits the final stack on **all data**.

**Why this choice**

* **Meta-learner**: `LogisticRegression(max_iter=1000, random_state=42)` — simple, well-calibrated linear combiner of base probabilities; reduces overfitting risk.
* **Internal stacking CV**: `cv=3`, `stack_method="predict_proba"`, `passthrough=False` — uses base probabilities as meta-features; keeps the meta-space low-dimensional and robust.

---

### 2) Multi-Step (Hierarchical) Pipeline: **MLP → XGBoost**

**File:** `training_multistep.py`
**Function:** `train_multistep_nn_xgb(X_data, y_encoded, groups, cv, le_target, save_prefix)`

**What it does**
Two stages:

1. **Stage 1 (High Recall)** — MLP predicts **PLANET vs FP** where PLANET = {CANDIDATE ∪ CONFIRMED}.

   * Pipeline: `StandardScaler()` → `MLPClassifier(hidden_layer_sizes=(128, 64, 32), activation="relu", alpha=0.001, lr=0.001, max_iter=500, early_stopping=True, validation_fraction=0.15, random_state=42)`
   * **Decision threshold:** `P(PLANET) > 0.25` to **maximize planet recall**.
2. **Stage 2 (High Precision)** — **XGBoost** separates **CANDIDATE vs CONFIRMED** only on Stage-1 planet-like samples.

   * `XGBClassifier(n_estimators=500, learning_rate=0.03, max_depth=5, subsample=0.7, colsample_bytree=0.7, min_child_weight=3, gamma=0.1, reg_alpha=0.3, reg_lambda=1.5, random_state=42, verbosity=0)`

Both stages use **StratifiedGroupKFold**. The function returns OOF predictions per stage, trained stage models, and a **combined** prediction/summary.

**Why this choice**

* Real search pipelines often gate by **“is this a planet?”** (favoring recall), then refine **planet type** (favoring precision).
* MLP + scaling works well as a flexible, smooth separator for the first gate; XGBoost reliably disambiguates CANDIDATE vs CONFIRMED with tabular features.

---

### 3) Binary Planet Model (CONFIRMED vs FALSE POSITIVE)

**File:** `training_binary.py`
**Function:** `train_binary_planet_model(df_engineered, groups, cv, target_column, save_path)`

**What it does**
Drops **CANDIDATE** rows and trains a **binary XGBoost** to test the upper bound of separating **CONFIRMED** vs **FALSE POSITIVE**. Uses group-aware CV and reports accuracy, precision, recall, F1 (+ train scores via `cross_validate`). Builds OOF preds with `cross_val_predict` and reuses `evaluate_the_best_model` for a consistent summary.

**Why this choice**

* Useful diagnostic: “If CANDIDATE didn’t exist, how cleanly can we separate true planets from false positives?”
* Helps benchmark the **intrinsic separability** of the labels and the usefulness of engineered features.

---


## 🧭 When to Use Which

**Default Ensemble (XGB / LGBM / CatBoost / RF)**
Use this as your **go-to baseline** when you need strong, reliable performance with good interpretability and fast iteration.

* **Best for:** Balanced accuracy/recall, quick iteration, explainability (feature importances).
* **Pros:** Strong tabular performance, minimal preprocessing, easy to tune; each model offers different bias/variance trade-offs.
* **Cons:** Picks a single winner; may leave small gains on the table vs blending.
* **Notes:** Consider selecting by **macro-F1** (or planet recall) instead of accuracy if discovery is the priority. Pair with **class_weight_penalizing** and **threshold optimization**.

**Stacking Ensemble**
Blend the base learners with a **LogisticRegression** meta-learner to exploit complementary error patterns.

* **Best for:** Squeezing out extra stability/points once base models are solid and diverse.
* **Pros:** Often improves robustness and small but meaningful gains; still interpretable at base-model level.
* **Cons:** Extra CV/compute; risk of overfitting if base models aren’t sufficiently diverse.
* **Notes:** Use OOF probabilities as meta-features (`stack_method="predict_proba"`), keep the meta-model simple, and validate with group-aware CV.

**Multi-Step (MLP → XGBoost)**
Two-stage pipeline: **high-recall PLANET vs FP gate (MLP)**, then **higher-precision CONFIRMED vs CANDIDATE (XGBoost)**.

* **Best for:** **Don’t-miss-planets** scenarios (maximize recall first, then refine).
* **Pros:** Mirrors real vetting workflows; yields controllable discovery/precision trade-off via Stage-1 threshold.
* **Cons:** More moving parts; need to track per-stage metrics/thresholds.
* **Notes:** Tune Stage-1 `P(PLANET)` cutoff (e.g., 0.20–0.40) and apply class weights. Keep **StratifiedGroupKFold** across both stages.

**Binary Planet Model (CONFIRMED vs FALSE POSITIVE)**
Drop CANDIDATE and train a binary XGBoost to probe the **upper bound** of separability.

* **Best for:** Diagnostics, triage tools, or ultra-simple screening endpoints.
* **Pros:** Clear operating curve; simpler deployment and thresholding.
* **Cons:** Ignores the CANDIDATE class; not a full replacement for 3-class use cases.
* **Notes:** Sweep the decision threshold (e.g., 0.3–0.8) on OOF probabilities to pick an operating point; consider calibration if used downstream.

### Quick chooser

* **Max planet recall first?** → **Multi-Step (MLP→XGB)**
* **Strong general baseline / explainability?** → **Default Ensemble**
* **Already good base models, want extra stability?** → **Stacking**
* **Diagnostic ceiling or simple triage app?** → **Binary**

**Cross-cutting recommendations:**

* Always use **StratifiedGroupKFold by `kepid`**.
* Enable **class_weight_penalizing** when class imbalance hurts recall.
* Prefer **macro-F1** or **planet recall** for model selection when discovery is key.
* Run **threshold optimization** (multi-class) or a **threshold sweep** (binary) before finalizing.


## 📊 Evaluation

Function: `evaluate_the_best_model(cv_results, best_model_name, y_encoded, le_target)`

Metrics:
- **Macro Precision/Recall/F1** (balanced across classes)
- **ROC-AUC** (OVR for multi-class)
- **Log loss** (probability calibration quality)
- **Planet-centric view:** treat `CONFIRMED` + `CANDIDATE` as *planet* vs `FALSE POSITIVE` — reveals discovery vs. false-alarm tradeoff.

> **Model selection:** default = highest **mean CV accuracy**. If the challenge prioritizes discovery, consider switching to **macro-F1** or **planet recall** as the selection criterion.

---

## 🎯 Threshold Optimization (Optional but Recommended)

Default classification uses `argmax` over class probabilities.  
To favor discovery while maintaining reliability for confirmed planets:

Function:  
`optimize_class_thresholds(y_true, y_proba, class_labels, conf_min_recall=0.8, cand_range=(0.30,0.40,0.02), conf_range=(0.45,0.60,0.05), fp_range=(0.65,0.75,0.05), save_path="threshold_configs.json")`

- Searches class-specific probability thresholds.
- **Objective:** maximize *CANDIDATE recall* subject to *CONFIRMED recall* ≥ 0.8.
- Saves both default and optimized thresholds to JSON.

**Why?** Lowering candidate cutoff can expose borderline planets while constraining confirmed recall keeps reliability high.

---

## 📈 Interpretability

Function: `analyze_feature_importance(model, X_scaled, top_n=25, model_label="XGBoost", plot=True)`  
- Ranks top features via `feature_importances_`.  
- Optionally shows a bar plot to inspect astrophysical relevance (e.g., period/size ratios, SNR, geometry).

---

## 🧪 Hyperparameter Tuning (Optional)

Function: `tune_xgboost_hyperparameters(X_data, y_encoded, groups, cv, save_path=None)`  
- **GridSearchCV** with grouped CV; search over depth, learning rate, estimators, subsample, colsample.  
- Returns: `(best_model, best_params, results_df)` and can pickle artifacts.
