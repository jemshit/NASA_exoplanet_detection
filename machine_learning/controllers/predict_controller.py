import os
import sys
import pandas as pd
from flask import request, jsonify

# Import app module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))
import app as ml_app
from app import predict as predict_function


def predict():
    """
    Predict endpoint controller
    Uses saved CSV and trained model from user-specific folder
    """
    try:
        # Get user session ID from header
        user_session_id = request.headers.get('user-session-id')
        if not user_session_id:
            return jsonify({"status": "error", "message": "user-session-id header is required"}), 400
        
        # Get base output folder from app
        base_output_folder = ml_app.OUTPUT_FOLDER
        
        # Get user-specific output folder
        user_output_folder = os.path.join(base_output_folder, user_session_id)
        
        if not os.path.exists(user_output_folder):
            return jsonify({
                "status": "error",
                "message": "User session not found. Please train the model first with /train endpoint."
            }), 404
        
        # Temporarily set OUTPUT_FOLDER for this user
        original_output_folder = ml_app.OUTPUT_FOLDER
        ml_app.OUTPUT_FOLDER = user_output_folder + "/"
        
        # Get parameters from request
        model_type = request.form.get('model_type', 'ensemble')
        drop_fpflags = request.form.get('drop_fpflags', 'false').lower() == 'true'
        
        # Read CSV file from user-specific folder
        csv_path = os.path.join(user_output_folder, "uploaded_data.csv")
        
        if not os.path.exists(csv_path):
            ml_app.OUTPUT_FOLDER = original_output_folder
            return jsonify({
                "status": "error",
                "message": "No data file found. Please train the model first with /train endpoint."
            }), 404
        
        # Read the saved CSV file (saved with comma separator)
        df = pd.read_csv(csv_path, sep=',')
        print(f"Reading CSV from: {csv_path}")
        print(f"Loaded DataFrame shape: {df.shape}")
        print(f"Loaded DataFrame columns count: {len(df.columns)}")
        
        # Convert DataFrame to list of dictionaries
        input_rows = df.to_dict('records')
        
        # Determine model path based on model_type
        model_path_map = {
            'ensemble': os.path.join(user_output_folder, "stacking_model.pkl"),
            'binary_categories': os.path.join(user_output_folder, "binary_categories_model.pkl"),
            'multistep': os.path.join(user_output_folder, "multistep_nn_xgb_multistep.pkl")
        }
        
        if model_type not in model_path_map:
            ml_app.OUTPUT_FOLDER = original_output_folder
            return jsonify({
                "status": "error",
                "message": f"Invalid model_type: {model_type}. Must be 'ensemble', 'binary_categories', or 'multistep'"
            }), 400
        
        model_path = model_path_map[model_type]
        
        # Check if model exists
        if not os.path.exists(model_path):
            ml_app.OUTPUT_FOLDER = original_output_folder
            return jsonify({
                "status": "error",
                "message": f"Model not found at {model_path}. Please train the model first."
            }), 404
        
        # Call predict function with separator info
        # Pass None for dataset_path since we're using the preprocessed input_rows
        try:
            print(f"\n=== Starting prediction with {len(input_rows)} rows ===")
            print(f"First row keys: {list(input_rows[0].keys())[:10] if input_rows else 'None'}")
            print(f"Number of columns in input: {len(input_rows[0].keys()) if input_rows else 0}")
            
            results = predict_function(
                dataset_path=None,
                input_rows=input_rows,
                model_path=model_path,
                drop_fpflags=drop_fpflags
            )
            
            print(f"Prediction completed for {len(input_rows)} rows")
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"❌ Error in predict_function: {e}")
            print(f"Full traceback:\n{error_trace}")
            ml_app.OUTPUT_FOLDER = original_output_folder
            return jsonify({
                "status": "error",
                "message": str(e),
                "trace": error_trace
            }), 500
        
        return jsonify({
            "status": "success",
            "message": "Prediction completed",
            "model_type": model_type,
            "user_session_id": user_session_id,
            "csv_used": csv_path,
            "results": results
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        # Restore original output folder
        ml_app.OUTPUT_FOLDER = original_output_folder

