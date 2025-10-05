import sys
import os
from flask import Flask, jsonify

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

import app as ml_app
from app import ensemble_pipeline, binary_categories_pipeline, multistep_pipeline

# Paths to work from machine_learning directory
base_dir = os.path.dirname(__file__)
ml_app.DATASET_PATH = os.path.join(base_dir, "dataset", "kepler_koi.csv")
ml_app.OUTPUT_FOLDER = os.path.join(base_dir, "outputs") + "/"

# Create outputs folder if it doesn't exist
os.makedirs(ml_app.OUTPUT_FOLDER, exist_ok=True)

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "status": "running",
        "endpoints": [
            "/ensemble",
            "/binary",
            "/multistep"
        ]
    })


@app.route('/ensemble')
def run_ensemble():
    try:
        ensemble_pipeline(class_weight_penalizing=True, drop_fpflags=True)
        return jsonify({"status": "success", "message": "Ensemble pipeline completed"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/binary')
def run_binary():
    try:
        binary_categories_pipeline(drop_fpflags=True)
        return jsonify({"status": "success", "message": "Binary pipeline completed"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/multistep')
def run_multistep():
    try:
        multistep_pipeline(drop_fpflags=True)
        return jsonify({"status": "success", "message": "Multistep pipeline completed"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5005)

