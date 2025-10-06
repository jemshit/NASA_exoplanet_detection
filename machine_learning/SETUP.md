# SETUP

## Repository Structure

```
app.py                     # Demo entry point: orchestrates various end-to-end pipelines
data_loading.py            # Load KOI CSV, append optional rows
preprocessing.py           # Clean data, drop leakage/ID cols, impute
feature_extraction.py      # Engineer astrophysically meaningful features
data_splitting.py          # Label encode y, StratifiedGroupKFold by kepid, save features.json
training_ensemble.py       # Train XGB/LGBM/Cat/RF with grouped CV, select best
training_binary.py         # Train a binary CONFIRMED vs FALSE POSITIVE classifier
training_multistep.py      # Two-stage: Stage1 MLP (PLANET vs FP) → Stage2 XGB (CONFIRMED vs CANDIDATE)
training_stacking_ensemble.py  # Train a stacking ensemble using base model
summarizing.py             # Compute macro metrics + planet-centric metrics
threshold_optimization.py  # Search per-class probability thresholds
xgboost_tuning.py          # Optional: GridSearchCV for XGBoost with grouped CV
plotting.py                # Feature importance extraction/plotting
prediction.py              # Inference/prediction using trained models
```

#### Artifacts: `outputs/`  
- Trained models: `trained_xgboost.pkl`, `trained_lightgbm.pkl`, `trained_catboost.pkl`, `trained_randomforest.pkl`, `stacking_model.pkl`, `binary_categories_model.pkl`, `multistep_nn_xgb.pkl`
- All existing and new engineered features: `features.json`
- Threshold optimization result: `threshold_configs.json`

---

## Setup

Install dependencies:
```bash
pip install -r requirements.txt
```

On macOS, if you encounter issues with `lightgbm`, install libomp:
```bash
brew install libomp
```

## Run Server

### Development (Flask)

```bash
python server.py
```

### Production (Gunicorn)

```bash
gunicorn server:app -c gunicorn.conf.py
```

Or with custom settings:
```bash
gunicorn server:app --bind 0.0.0.0:5005 --workers 4 --timeout 300
```

Server runs on `http://localhost:5005`

## Endpoints

- `GET /` - Server status and available endpoints
- `GET /ensemble` - Run ensemble pipeline
- `GET /binary` - Run binary categories pipeline
- `GET /multistep` - Run multistep pipeline

## Example Usage

```bash
# Check server status
curl http://localhost:5005/

# Run ensemble pipeline
curl http://localhost:5005/ensemble

# Run binary pipeline
curl http://localhost:5005/binary

# Run multistep pipeline
curl http://localhost:5005/multistep
```

