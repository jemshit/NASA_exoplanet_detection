import pandas as pd
from flask import request, jsonify
from io import StringIO

# Required columns for Kepler KOI dataset
REQUIRED_COLUMNS = [
    'rowid', 'kepid', 'kepoi_name', 'kepler_name', 'koi_disposition', 
    'koi_pdisposition', 'koi_score', 'koi_fpflag_nt', 'koi_fpflag_ss', 
    'koi_fpflag_co', 'koi_fpflag_ec', 'koi_period', 'koi_period_err1', 
    'koi_period_err2', 'koi_time0bk', 'koi_time0bk_err1', 'koi_time0bk_err2', 
    'koi_impact', 'koi_impact_err1', 'koi_impact_err2', 'koi_duration', 
    'koi_duration_err1', 'koi_duration_err2', 'koi_depth', 'koi_depth_err1', 
    'koi_depth_err2', 'koi_prad', 'koi_prad_err1', 'koi_prad_err2', 
    'koi_teq', 'koi_teq_err1', 'koi_teq_err2', 'koi_insol', 'koi_insol_err1', 
    'koi_insol_err2', 'koi_model_snr', 'koi_tce_plnt_num', 'koi_tce_delivname', 
    'koi_steff', 'koi_steff_err1', 'koi_steff_err2', 'koi_slogg', 
    'koi_slogg_err1', 'koi_slogg_err2', 'koi_srad', 'koi_srad_err1', 
    'koi_srad_err2', 'ra', 'dec', 'koi_kepmag'
]


def validate_csv():
    """
    Validate CSV file endpoint
    Checks if the uploaded CSV has all required columns
    """
    try:
        # Get CSV file
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"status": "error", "message": "No file selected"}), 400
        
        # Read CSV file
        csv_content = file.read().decode('utf-8')
        
        # Detect separator (try semicolon first, then comma)
        first_line = csv_content.split('\n')[0] if csv_content else ''
        separator = ';' if ';' in first_line else ','
        
        print(f"Detected CSV separator: '{separator}'")
        
        # Try to parse CSV
        try:
            try:
                # For pandas >= 1.3.0
                df = pd.read_csv(StringIO(csv_content), sep=separator, on_bad_lines='skip')
            except TypeError:
                # For pandas < 1.3.0
                df = pd.read_csv(StringIO(csv_content), sep=separator, error_bad_lines=False)
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Could not parse CSV file: {str(e)}"
            }), 400
        
        if df.empty:
            return jsonify({
                "status": "error",
                "message": "CSV file is empty"
            }), 400
        
        # Check for required columns
        csv_columns = set(df.columns)
        print(f"CSV columns found: {sorted(list(csv_columns))}")
        print(f"Number of columns: {len(csv_columns)}")
        
        required_columns_set = set(REQUIRED_COLUMNS)
        missing_columns = required_columns_set - csv_columns
        
        if missing_columns:
            missing_list = sorted(list(missing_columns))
            return jsonify({
                "status": "error",
                "message": f"Missing required columns: {', '.join(missing_list)}",
                "missing_columns": missing_list,
                "found_columns": list(csv_columns),
                "required_columns": REQUIRED_COLUMNS
            }), 400
        
        # All validations passed
        return jsonify({
            "status": "success",
            "message": "CSV file is valid",
            "rows": len(df),
            "columns": len(df.columns)
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error validating CSV: {str(e)}"
        }), 500

