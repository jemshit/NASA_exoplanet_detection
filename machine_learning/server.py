import sys
import os
from flask import Flask, jsonify
from flask_cors import CORS

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'controllers'))

import app as ml_app
from app import ensemble_pipeline, binary_categories_pipeline, multistep_pipeline
from controllers import train, predict_controller, validate_csv

# Paths to work from machine_learning directory
base_dir = os.path.dirname(__file__)
ml_app.DATASET_PATH = os.path.join(base_dir, "dataset", "kepler_koi.csv")
ml_app.OUTPUT_FOLDER = os.path.join(base_dir, "outputs") + "/"

# Create outputs folder if it doesn't exist
os.makedirs(ml_app.OUTPUT_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

@app.route('/')
def home():
    return jsonify({
        "status": "running",
        "endpoints": [
            "/ensemble",
            "/binary",
            "/multistep",
            "POST /train",
            "POST /predict",
            "POST /validate-csv"
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


@app.route('/train', methods=['POST'])
def train_route():
    return train()


@app.route('/predict', methods=['POST'])
def predict_route():
    return predict_controller()


@app.route('/validate-csv', methods=['POST'])
def validate_csv_route():
    return validate_csv()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5005)

