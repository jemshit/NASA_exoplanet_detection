import os
import sys
import pandas as pd
from flask import request, jsonify
from io import StringIO

# Import app module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))
import app as ml_app
from app import ensemble_pipeline, binary_categories_pipeline, multistep_pipeline


def train():
    """
    Train endpoint controller
    Accepts CSV file and parameters, trains model, and saves to user-specific folder
    """
    try:
        # Get user session ID from header
        user_session_id = request.headers.get('user-session-id')
        if not user_session_id:
            return jsonify({"status": "error", "message": "user-session-id header is required"}), 400
        
        # Get base output folder from app
        base_output_folder = ml_app.OUTPUT_FOLDER
        
        # Create user-specific output folder
        user_output_folder = os.path.join(base_output_folder, user_session_id)
        os.makedirs(user_output_folder, exist_ok=True)
        print(f"User output folder: {user_output_folder}")
        
        # Temporarily set OUTPUT_FOLDER for this user
        original_output_folder = ml_app.OUTPUT_FOLDER
        ml_app.OUTPUT_FOLDER = user_output_folder + "/"
        
        # Get parameters from request
        model_type = request.form.get('model_type', 'ensemble')
        class_weight_penalizing = request.form.get('class_weight_penalizing', 'false').lower() == 'true'
        drop_fpflags = request.form.get('drop_fpflags', 'false').lower() == 'true'
        
        # Get CSV file
        if 'file' not in request.files:
            ml_app.OUTPUT_FOLDER = original_output_folder
            return jsonify({"status": "error", "message": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            ml_app.OUTPUT_FOLDER = original_output_folder
            return jsonify({"status": "error", "message": "No file selected"}), 400
        
        # Read and validate CSV file
        try:
            csv_content = file.read().decode('utf-8')
            
            # Detect separator (try semicolon first, then comma)
            first_line = csv_content.split('\n')[0] if csv_content else ''
            separator = ';' if ';' in first_line else ','
            
            print(f"Detected CSV separator: '{separator}'")
            
            # Try to read CSV with multiple parsing strategies
            parsing_error = None
            df = None
            
            # Strategy 1: Standard parsing with detected separator
            try:
                try:
                    # For pandas >= 1.3.0
                    df = pd.read_csv(StringIO(csv_content), sep=separator, on_bad_lines='skip')
                except TypeError:
                    # For pandas < 1.3.0
                    df = pd.read_csv(StringIO(csv_content), sep=separator, error_bad_lines=False, warn_bad_lines=True)
                print(f"CSV parsed successfully with separator '{separator}'")
            except Exception as e:
                parsing_error = str(e)
                print(f"Strategy 1 failed: {e}")
                
                # Strategy 2: Try with engine='python' for more flexible parsing
                try:
                    df = pd.read_csv(StringIO(csv_content), sep=separator, engine='python')
                    print(f"CSV parsed successfully with strategy 2 (python engine)")
                except Exception as e2:
                    print(f"Strategy 2 failed: {e2}")
                    parsing_error = str(e2)
            
            if df is None or df.empty:
                ml_app.OUTPUT_FOLDER = original_output_folder
                error_msg = f"Could not parse CSV file. Error: {parsing_error}" if parsing_error else "CSV file is empty"
                return jsonify({"status": "error", "message": error_msg}), 400
            
            print(f"CSV loaded successfully: {df.shape[0]} rows, {df.shape[1]} columns")
            print(f"Columns: {list(df.columns)[:10]}")  # Print first 10 columns
            
        except Exception as e:
            ml_app.OUTPUT_FOLDER = original_output_folder
            return jsonify({
                "status": "error", 
                "message": f"Error reading CSV file: {str(e)}. Please ensure your CSV is properly formatted."
            }), 400
        
        # Save CSV file to user-specific folder with comma separator (standardize)
        csv_path = os.path.join(user_output_folder, "uploaded_data.csv")
        df.to_csv(csv_path, index=False, sep=',')
        print(f"Saved uploaded CSV to: {csv_path} with comma separator")
        print(f"Saved DataFrame shape: {df.shape}")
        
        # Convert DataFrame to list of dictionaries
        input_rows = df.to_dict('records')
        
        print(f"********* Model Type: {model_type}")

        # Call appropriate pipeline based on model_type
        if model_type == 'ensemble':
            ensemble_pipeline(
                input_rows=input_rows,
                class_weight_penalizing=class_weight_penalizing,
                drop_fpflags=drop_fpflags
            )
            message = "Ensemble pipeline training completed"
        elif model_type == 'binary_categories':
            binary_categories_pipeline(
                input_rows=input_rows,
                drop_fpflags=drop_fpflags
            )
            message = "Binary categories pipeline training completed"
        elif model_type == 'multistep':
            multistep_pipeline(
                input_rows=input_rows,
                drop_fpflags=drop_fpflags
            )
            message = "Multistep pipeline training completed"
        else:
            return jsonify({
                "status": "error",
                "message": f"Invalid model_type: {model_type}. Must be 'ensemble', 'binary_categories', or 'multistep'"
            }), 400
        
        return jsonify({
            "status": "success",
            "message": message,
            "model_type": model_type,
            "user_session_id": user_session_id,
            "csv_saved": csv_path,
            "parameters": {
                "class_weight_penalizing": class_weight_penalizing,
                "drop_fpflags": drop_fpflags
            }
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        # Restore original output folder
        ml_app.OUTPUT_FOLDER = original_output_folder

