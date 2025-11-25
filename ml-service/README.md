
# ML Service (placeholder)

This folder is for a Python FastAPI microservice that will serve ML models.

Typical steps:
1. Prepare training data (historical prices, volatility, returns).
2. Train a scikit-learn or lightgbm model to classify risk or predict categories.
3. Save model (joblib/pickle).
4. Create FastAPI endpoints to load model and respond to /predict.
