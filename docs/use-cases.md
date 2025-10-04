# Application Use Cases Overview

## Actors

### 1. Regular User

- Researcher: Professional or academic user interested in analyzing exoplanet data, training models, and interpreting results for scientific purposes.
- Enthusiast: Casual user or student interested in exploring exoplanet data, running predictions, and learning about AI/ML in astronomy.

### 2. System Administrator / Developer

- Admin or devloper: Maintains the application, manages deployments, and ensures data security and system reliability.


## Use Cases

### 1. Upload Exoplanet Data

- Actors:
	- Researcher, Enthusiast
- Actions:
	- Upload new exoplanet datasets (CSV, XLSX, etc.) via the web interface.
	- Validate and preprocess uploaded data.
	- Store data for further analysis and model training.

### 2. Manual Data Entry

- Actors:
	- Researcher, Enthusiast
- Actions:
	- Enter exoplanet parameters manually through a form.
	- Validate input and add to the dataset for analysis or prediction.

### 3. Train Machine Learning Model

- Actors:
	- Researcher
- Actions:
	- Select dataset and features for training.
	- Choose and configure ML algorithms (e.g., Random Forest, XGBoost, Neural Network).
	- Tune hyperparameters via the interface.
	- Start training and monitor progress.
	- View training metrics (accuracy, confusion matrix, etc.).

### 4. Predict Exoplanet Classification

- Actors:
	- Researcher, Enthusiast
- Actions:
	- Submit new data (uploaded or manually entered) for prediction.
	- Receive classification (confirmed exoplanet, candidate, false positive) and confidence score.
	- View prediction results in tabular and graphical formats.

### 5. Visualize Data and Model Performance

- Actors:
	- Researcher, Enthusiast
- Actions:
	- Explore dataset statistics (distribution, correlations, etc.).
	- Visualize model performance metrics (accuracy, ROC curve, confusion matrix).
	- Export visualizations and results for reporting.

### 6. Hyperparameter Tuning

- Actors:
	- Researcher
- Actions:
	- Adjust model hyperparameters via the UI.
	- Retrain model and compare results.

### 7. API Access

- Actors:
	- Developer
- Actions:
	- Access RESTful API endpoints for data upload, prediction, and model management.
	- Integrate with external tools or scripts.

### 8. System Administration

- Actors:
	- System Administrator
- Actions:
	- Deploy and manage the application using Docker.
	- Monitor system health and logs.
	- Manage user access and data security.

### 9. Documentation and Help

- Actors:
	- All
- Actions:
	- Access user guides, API documentation, and troubleshooting resources.
	- View example workflows and use cases.

## Summary Table

| Use Case                             | Actors                 | Description                                                      |
|--------------------------------------|------------------------|------------------------------------------------------------------|
| Upload Exoplanet Data                | Researcher, Enthusiast | Upload and preprocess new datasets                               |
| Manual Data Entry                    | Researcher, Enthusiast | Enter exoplanet parameters manually                              |
| Train Machine Learning Model         | Researcher             | Configure, train, and evaluate ML models                         |
| Predict Exoplanet Classification     | Researcher, Enthusiast | Classify new data and view results                               |
| Visualize Data and Model Performance | Researcher, Enthusiast | Explore data and model metrics visually                          |
| Hyperparameter Tuning                | Researcher             | Adjust and optimize model parameters                             |
| API Access                           | Developer              | Use REST API for integration                                     |
| System Administration                | SysAdmin               | Deploy, monitor, and secure the application                      |
| Documentation and Help               | All                    | Access guides and troubleshooting                                |
